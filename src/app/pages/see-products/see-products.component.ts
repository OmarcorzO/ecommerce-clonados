import { Component, OnInit, ElementRef, ViewEncapsulation, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { FirestoreService } from '../../services/firestore.service';
import { Producto, Categoria } from '../../models/models';

// import swiper from 'swiper';
// import { SwiperComponent } from "swiper/angular";

// import Swiper core and required modules
import SwiperCore, { Autoplay, Navigation } from "swiper";

// install Swiper modules
SwiperCore.use([Autoplay, Navigation]);
import Swal from 'sweetalert2';

@Component({
  selector: 'app-see-products',
  templateUrl: './see-products.component.html',
  styleUrls: ['./see-products.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class SeeProductsComponent implements OnInit {

  @ViewChild('txtTerm') searchInput: ElementRef;

  public charging: boolean = true;
  public charging2: boolean = true;
  public charging3: boolean = true;
  loadingSearch: boolean = false;
  public lookingForProducts: boolean = false;
  public searchByCategory: boolean = false;
  public result: boolean = true;

  public productos: Producto[] = [];
  public mostWantedProducts: Producto[] = [];
  public productSearchResults: Producto[] = [];
  public productsByCategory: Producto[] = [];
  public latestProductsWithDiscounts: Producto[] = [];
  public lastCategoriesToShow: Categoria[] = [];
  public dropdownCategories: Categoria[] = [];

  public totalProducts: number = 0;
  public totalResults: number = 0;

  public categoryToSearch: string = 'Últimas categorías';
  public categoryToSearchFromCards: string = '';

  public thereArePublications: boolean = true;
  public directToHomePage: boolean = true;

  //Variables de la paginación
  cpage = 1;
  cpageSize = 8;
  
   /**
   * Constructor del componente see-products
   * 
   * @param firestoreService Servicio para realizar consultas de CRUD a las colecciones de BD 
   */
  constructor(
    public firestoreService: FirestoreService,
    private router: Router
  ) {
  }

  ngOnInit(): void {
    localStorage.getItem('hide-side-menu') === 'true' ? this.directToHomePage = true : this.directToHomePage = false;
    this.getCategoriesAndProducts();
  }

  getCategoriesAndProducts(){
    const unsubscribe = this.firestoreService.getCollectionAll<Categoria>('Categorias/').subscribe({
      next: (resp) => {
        for(let i=0; i<resp.length; i++){
          if(i <= 9){
            this.lastCategoriesToShow.push(resp[i]);
          }else{
            break;
          }
        }
        this.charging = false;
        unsubscribe.unsubscribe();
      },
      error: (e) => {
        return Swal.fire('Error', 'Error al cargar datos, por favor intente nuevamente.', 'error' );
      },
      complete: () => console.log()
    });
    const unsubscribeTwo = this.firestoreService.getDiscountedProducts<Producto>('Productos/').subscribe({
      next: (result) => {
        this.latestProductsWithDiscounts = result;
        this.charging2 = false;
        unsubscribeTwo.unsubscribe();
      },
      error: (e) => {
        return Swal.fire('Error', 'Error al cargar datos, por favor intente nuevamente.', 'error' );
      },
      complete: () => console.log()
    });
    const unsubscribeThree = this.firestoreService.getCollectionAll<Producto>('Productos/').subscribe({
      next: (res) => {
        this.productos = JSON.parse(JSON.stringify(res));
        this.totalProducts = res.length;
        const top10 = res.sort(function (a, b) { return b.visitas - a.visitas; }).slice(0, 10);
        this.mostWantedProducts = top10;
        this.charging3 = false;
        unsubscribeThree.unsubscribe();
      },
      error: (e) => {
        return Swal.fire('Error', 'Error al cargar datos, por favor intente nuevamente.', 'error' );
      },
      complete: () => console.log()
    });
  }

  selectedCategory(event: any){
    if( this.directToHomePage ){
      this.router.navigateByUrl(`/ver-productos-por-categoria/${event.target.innerText}`);
    }else{
      this.router.navigateByUrl(`/dashboard/ver-productos-por-categoria/${event.target.innerText}`);
    }
  }

  searchProducts(term: string){
    this.productSearchResults = [];
    if ( term.length === 0 ) {
      this.lookingForProducts = false;
    }else{
      this.loadingSearch = true;
      this.lookingForProducts = true;
      const searchResults = this.productos.filter( element => {
        const regex = new RegExp(term, 'i');
        return element.nombre.match(regex);
      });
      searchResults.length === 0 ? this.result = false : this.result = true;
      this.totalResults = searchResults.length;
      this.loadingSearch = false;
      return this.productSearchResults = searchResults;
    }
  }

  getPrice(ammount: any) {
    const result = (parseFloat(ammount) * 100).toString();
    const response = {
      originalValue: ammount,
      ammountWithDecimals: parseFloat(ammount).toFixed(2),
      ammounCrurrency: new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
      }).format(ammount),
      ammountIncents: result,
    };
    const oldPrice = response.ammounCrurrency.split(',');
    const newPrice = oldPrice[0];
    return newPrice;
  }

  getDiscountedPrice(normalPrice: number, discount: number){
    const priceWithDiscount = (normalPrice - (normalPrice*(discount/100)));
    const response = new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
    }).format(priceWithDiscount);
    const oldPrice = response.split(',');
    const newPrice = oldPrice[0];
    return newPrice;
  }

  clearSearch(){
    this.searchInput.nativeElement.value = '';
    this.productSearchResults = [];
    this.lookingForProducts = false;
  }
    
}