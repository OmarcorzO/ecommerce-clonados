import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { FirestoreService } from '../../services/firestore.service';
import { Producto } from '../../models/models';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-see-products-by-category',
  templateUrl: './see-products-by-category.component.html',
  styleUrls: ['./see-products-by-category.component.scss']
})
export class SeeProductsByCategoryComponent implements OnInit {

  public charging: boolean = true;
  public charging2: boolean = true;

  private path = 'Productos/';
  public productos: Producto[] = [];
  private categoryToShow: string = '';

  public limit: number = 8;
  public reiniciarLimit: boolean = false;
  cpageSize = 8;

  public pageActual: number = 1;

  private nextPage: boolean = true;
  private endBefore: any = null;

  public thereIsNoNextPage: boolean = false;
  public noPreviousPage: boolean = true;
  public noPreviousPage2: boolean = true;

  public firstDocument: any = null;
  public lastDocument: any = null;

  public thereArePublications: boolean = true;
  public directToHomePage: boolean = true;

  constructor(
    private firestoreService: FirestoreService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    localStorage.getItem('hide-side-menu') === 'true' ? this.directToHomePage = true : this.directToHomePage = false;
    this.activatedRoute.params
    .subscribe({
      next: ({ categoria }) => {
        this.uploadProducts( categoria );
      },
      error: (e) => {
        return Swal.fire('Error', 'Error al cargar datos, por favor intente nuevamente.', 'error' );
      },
      complete: () => console.log()
    });
  }

  uploadProducts( category: string = '' ){
    if(this.categoryToShow.length === 0){
      this.categoryToShow = category;
    }
    this.charging = true;
    this.charging2 = true;
    this.thereArePublications = true;
    let startAt = null;
    if (this.productos.length && !this.reiniciarLimit) {
        startAt = this.productos[this.productos.length - 1].fecha || null;
        this.endBefore = this.productos[0].fecha;
    }else if(this.reiniciarLimit){
      //Esto es para cuando se seleccione un limite diferente de datos se comienze desde el cero
      startAt = null;
    }

    if(this.nextPage){
      const desuscribir = this.firestoreService.getProductsByCategory<Producto>(this.path, this.limit, startAt, this.categoryToShow).subscribe( resp => {
          this.charging = false;
          this.productos = resp;
          if(!this.reiniciarLimit){
            this.noPreviousPage = false;
          }
          if(resp.length == 0){
            this.thereArePublications = false;
          }else{
            startAt = this.productos[this.productos.length - 1].fecha || null;
          }
          const desuscribir2 = this.firestoreService.getProductsByCategory<Producto>(this.path, 1, startAt, this.categoryToShow).subscribe( res => {
            this.charging2 = false;
            if(res.length == 0){
              this.thereIsNoNextPage = true;
            }
            desuscribir2.unsubscribe();
          }, () => {
            Swal.fire('Error', 'Error al cargar datos, por favor intente nuevamente.', 'error' );
          });
          desuscribir.unsubscribe();
          //Ponemos nuevamente el reiniciarLimit en false para poder paginar correctamente los resultados
          this.reiniciarLimit = false; 
      }, () => {
        Swal.fire('Error', 'Error al cargar datos, por favor intente nuevamente.', 'error' );
      });
    
    }else{
      const desuscripcion = this.firestoreService.getProductsByCategoryBackwards<Producto>(this.path, this.limit, this.endBefore, this.categoryToShow).subscribe( resp => {
        this.charging = false;
        this.productos = resp;
        this.endBefore = this.productos[0].fecha;
        this.thereIsNoNextPage = false;
        desuscripcion.unsubscribe();
        const desuscripcion2 = this.firestoreService.getProductsByCategoryBackwards<Producto>(this.path, 1, this.endBefore, this.categoryToShow).subscribe( res => {
          this.charging2 = false;
          if(res.length == 0){
            this.noPreviousPage = true;
          }
          desuscripcion2.unsubscribe();
        }, () => {
          Swal.fire('Error', 'Error al cargar datos, por favor intente nuevamente.', 'error' );
        });
      }, () => {
        Swal.fire('Error', 'Error al cargar datos, por favor intente nuevamente.', 'error' );
      });
      //Ponemos nuevamente el reiniciarLimit en false para poder paginar correctamente los resultados
      this.reiniciarLimit = false; 
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

  /**
   *  Navega hacia la página siguiente de productos.
   *
   * @returns void.
   */
  nextPageP(){
    this.nextPage = true;
    this.noPreviousPage2 = false;
    this.uploadProducts();
  }

  /**
   *  Navega hacia la página anterior de productos.
   *
   * @returns void.
   */
  previousPage(){
    this.nextPage = false;
    this.uploadProducts();
  }

  /**
 *  Cambia el límite de productos a mostrar.
 *
 * @param event el evento con las acciones para cambiar el limite.
 * @returns void.
 */
onTableSizeChange(): void {
  this.limit = this.cpageSize;
  this.pageActual = 1;
  this.noPreviousPage = true;
  this.thereIsNoNextPage = false;
  this.nextPage = true;
  this.reiniciarLimit = true;
  this.uploadProducts();
}

}
