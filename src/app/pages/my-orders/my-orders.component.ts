import { Component, OnInit } from '@angular/core';
import { SalesService } from '../../services/sales.service';
import { AuthService } from '../../services/auth.service';
import { Pedido } from '../../models/models';

import { NgbDateStruct, NgbDate } from '@ng-bootstrap/ng-bootstrap';

import moment from 'moment';
import Swal from 'sweetalert2';
const my = new Date();
moment.locale("es");
@Component({
  selector: 'app-my-orders',
  templateUrl: './my-orders.component.html',
  styleUrls: ['./my-orders.component.scss']
})
export class MyOrdersComponent implements OnInit {

  public uid: string = '';
  public pedidos: Pedido[] = [];
  public temporaryOrders: Pedido[] = [];
  public charging: boolean = true;
  public totalOrders: number = 0;
  public totalTemporaryOrders: number = 0;
  public totalSearchResults: number = 0;
  public result: boolean = true;
  public searchResultsExist: boolean = true;

  public lookingForSomething: boolean = false;
  currentDate: NgbDateStruct = { year: my.getFullYear(), month: my.getMonth() + 1, day: my.getDate() };
  fromDate: NgbDateStruct = Object.create(null);
  toDate: NgbDateStruct = Object.create(null);
  date: { year: number; month: number } = { year: -1, month: -1 };

  //Estas dos variables es para la tabla paginada de los pedidos
  cpage = 1;
  cpageSize = 5;

   /**
   * Constructor del componente my-orders
   * 
   * @param salesService Servicio para realizar consultas de CRUD a las colecciones de BD 
   * @param firebaseauthService Servicio que utiliza métodos de autenticación
   */
  constructor(
    public salesService: SalesService,
    public firebaseauthService: AuthService
  ) { }

   /**
   * Realiza las primeras acciones al cargar
   * el componente
   * 
   * @returns {Promise<void>} Obtiene el uid del usuario y ejecuta
   * el metodon de getMyOrders
   */
  async ngOnInit() {
    this.uid = await this.firebaseauthService.getUid();
    this.getMyOrders();
  }


     /**
   * Obtiene solamente de la base de datos los
   * pedidos del usuario logueado y de nadie más
   * 
   * @returns void
   */
  getMyOrders() {
    const path = `Ventas/`;
    const desuscribir = this.salesService.getMyOrders<Pedido>(path, this.uid).subscribe({
      next: (res) => {
        if (res.length > 0) {
          let allOrders = res.filter(element => element.estadoTransaccion !== 'IN-PROCESS' );
          this.pedidos = allOrders;
          this.temporaryOrders = allOrders;
          this.totalOrders = allOrders.length;
          this.totalTemporaryOrders = allOrders.length;
          this.result = true;
        }else{
          this.result = false;
        }

        this.charging = false;
        desuscribir.unsubscribe();
      },
      error: (e) => {
        return Swal.fire('Error', 'Error al cargar datos, por favor intente nuevamente.', 'error' );
      },
      complete: () => console.log()
    });
  }

  getTotal(ammount: any) {
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
    return response.ammounCrurrency;
  }

  isDisabled = (date: NgbDate, current: { month: number }) => date.month > this.currentDate.month && date.year >= this.currentDate.year
  || date.day > this.currentDate.day && date.month == this.currentDate.month || date.year > this.currentDate.year;

  disableToDate = (date: NgbDate, current: { month: number }) => date.month > this.currentDate.month && date.year >= this.currentDate.year
  || date.day > this.currentDate.day && date.month == this.currentDate.month || date.year > this.currentDate.year 
  || date.day <= this.fromDate.day && date.month <= this.fromDate.month && date.year <= this.fromDate.year 
  || date.month < this.fromDate.month && date.year <= this.fromDate.year || date.year < this.fromDate.year;

  onDateChange() {
    this.toDate = Object.create(null);
  }

  uploadFilteredSales(){

    if(this.fromDate.day === undefined && this.toDate.day === undefined 
      || this.fromDate.day === undefined || this.toDate.day === undefined){
      return Swal.fire({
        icon: 'warning',
        title: 'No puedes buscar sin antes tener un rango de fecha especificado'
      });
    }

    this.lookingForSomething = true;
    this.charging = true;
    const res = this.temporaryOrders;
    const searchResults = res.filter( element => {
      const itemDate = new Date(element.fecha.toMillis());
      const day = itemDate.getDate();
      const month = itemDate.getMonth();
      const year = itemDate.getFullYear();
      const date = moment({ day, month, year }).format("YYYY-MM-DD hh:mm A");
      const fromDate = moment({ day: this.fromDate.day, month: this.fromDate.month - 1, year: this.fromDate.year }).format("YYYY-MM-DD hh:mm A");
      const toDate = moment({ day: this.toDate.day, month: this.toDate.month - 1, year: this.toDate.year }).format("YYYY-MM-DD hh:mm A");
      return moment(date).isBetween( fromDate, toDate) || moment(date).isSame(fromDate) || moment(date).isSame(toDate);
    });
    searchResults.length === 0 ? this.searchResultsExist = false : this.searchResultsExist = true;
    this.totalSearchResults = searchResults.length;
    this.totalOrders = searchResults.length;
    this.charging = false;
    return this.pedidos = searchResults;

  }

  cleanDates(){
    this.fromDate = Object.create(null);
    this.toDate = Object.create(null);
  }

  showAllSales(){
    this.pedidos = this.temporaryOrders;
    this.totalOrders = this.totalTemporaryOrders;
    this.lookingForSomething = false;
    this.result = true;
    this.searchResultsExist = true;
  }

  formatDate(date: Date): string{
    const convertedDate = moment(date).format('MMMM Do YYYY, h:mm a'); 
    return convertedDate[0].toUpperCase() + convertedDate.substring(1);
  }

}
