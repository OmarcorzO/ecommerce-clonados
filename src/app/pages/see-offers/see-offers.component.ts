import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { FirestoreService } from '../../services/firestore.service';
import { Producto } from '../../models/models';

import Swal from 'sweetalert2';

@Component({
  selector: 'app-see-offers',
  templateUrl: './see-offers.component.html',
  styleUrls: ['./see-offers.component.scss']
})
export class SeeOffersComponent implements OnInit {

  public charging: boolean = true;
  private path = 'Productos/';
  public productos: Producto[] = [];
  public pageActual: number = 1;

  public thereArePublications: boolean = true;
  public directToHomePage: boolean = true;
  public totalResults: number = 0;
  //Estas dos variables es para la tabla paginada de los pedidos
  cpage = 1;
  cpageSize = 8;

  constructor(
    public firestoreService: FirestoreService,
    private router: Router
  ) { }

  ngOnInit(): void {
    localStorage.getItem('hide-side-menu') === 'true' ? this.directToHomePage = true : this.directToHomePage = false;
    this.uploadProducts();
  }

   /**
   *  Permite ver de forma paginada todos los productos con ofertas
   *
   * @returns void.
   */
  uploadProducts() {
    this.charging = true;
    const unsubscribe = this.firestoreService.getCollectionAll<Producto>(this.path).subscribe({
      next: (res) => {
        res.length === 0 ? this.thereArePublications = false : this.thereArePublications = true;
        res.forEach(element => {
          if(element.precioReducido > 0){
            this.productos.push(element);
          }
        });
        this.totalResults = this.productos.length;
        this.charging = false;
        unsubscribe.unsubscribe();
      },
      error: (e) => {
        return Swal.fire('Error', 'Error al cargar datos, por favor intente nuevamente.', 'error' );
      },
      complete: () => console.log()
    });
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
