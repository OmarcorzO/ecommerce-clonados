import { Component, OnInit } from '@angular/core';

import { FirestoreService } from '../../services/firestore.service';
import { Producto, Categoria } from '../../models/models';

import Swal from 'sweetalert2';

@Component({
  selector: 'app-most-wanted-products',
  templateUrl: './most-wanted-products.component.html',
  styleUrls: ['./most-wanted-products.component.scss']
})
export class MostWantedProductsComponent implements OnInit {

  public charging: boolean = true;
  public products: Producto[] = [];
  public totalProducts: number = 0;
  public directToHomePage: boolean = true;

  //Variables de la paginación
  cpage = 1;
  cpageSize = 8;

  constructor(public firestoreService: FirestoreService) { }

  ngOnInit(): void {
    this.getMostPopularProducts();
  }

  getMostPopularProducts(){
    localStorage.getItem('hide-side-menu') === 'true' ? this.directToHomePage = true : this.directToHomePage = false;
    const unsubscribe = this.firestoreService.getCollectionAll<Producto>('Productos/').subscribe({
      next: (res) => {
        this.totalProducts = res.length;
        const top10 = res.sort(function (a, b) { return b.visitas - a.visitas; }).slice(0, 30);
        this.products = top10;
        this.charging = false;
        unsubscribe.unsubscribe();
      },
      error: (e) => {
        return Swal.fire('Error', 'Error al cargar datos, por favor intente nuevamente.', 'error' );
      },
      complete: () => console.log()
    });
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

}
