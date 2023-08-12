import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

import { SalesService } from "../../services/sales.service";
import { AuthService } from "../../services/auth.service";
import { Pedido, Usuario } from '../../models/models';

import { NgbModal, ModalDismissReasons, NgbDateStruct, NgbDate } from '@ng-bootstrap/ng-bootstrap';
import moment from 'moment';
import Swal from 'sweetalert2';
const my = new Date();
moment.locale("es");

@Component({
  selector: 'app-my-sales',
  templateUrl: './my-sales.component.html',
  styleUrls: ['./my-sales.component.scss']
})
export class MySalesComponent implements OnInit {

  public charging: boolean = true;
  private path = 'Ventas/';
  public sales: Pedido[] = [];
  public deliveredSalesResults: Pedido[] = [];
  public undeliveredSalesResults: Pedido[] = [];
  public temporarySales: Pedido[] = [];
  public saleCustomer: Usuario;

  public myTotalSales: number = 0;
  public totalUndeliveredSales: number = 0;
  public totalSalesDelivered: number = 0;
  public totalResults: number = 0;

  @ViewChild('txtTerm') searchInput: ElementRef;

  currentDate: NgbDateStruct = { year: my.getFullYear(), month: my.getMonth() + 1, day: my.getDate() };
  fromDate: NgbDateStruct = Object.create(null);
  toDate: NgbDateStruct = Object.create(null);
  date: { year: number; month: number } = { year: -1, month: -1 };

  public result: boolean = true;
  public lookingForSomething: boolean = false;
  public updateStatusOrder: boolean = false;
  public toLookFor: string = 'todos';
  closeResult = '';

  public conditionCounterStatus: boolean = true;
  
  //Estas dos variables es para la tabla paginada de los pedidos
  cpage = 1;
  cpageSize = 10;

  constructor(
    public salesService: SalesService,
    public authService: AuthService,
    private modalService: NgbModal
  ) { }

  ngOnInit(): void {
    this.uploadAllMySales();
  }

  uploadAllMySales(){
    this.charging = true;
    const unsubscribe = this.salesService.getAllSales<Pedido>(this.path).subscribe(
      {
        next: (res) => {
            res.length === 0 ? this.result = false : this.result = true;
            this.sales = res;
            this.temporarySales = res;
            this.myTotalSales = res.length;
            this.totalResults = res.length;
            this.loadSalesByState();
            if( this.updateStatusOrder ){
              Swal.fire({
                icon: 'success',
                title: 'Actualización exitosa!!'
              });
              this.updateStatusOrder = false;
            }
            unsubscribe.unsubscribe();
        },
        error: (e) => {
          return Swal.fire('Error', 'Error al cargar datos, por favor intente nuevamente.', 'error' );
        },
        complete: () => console.log()
      }
    );
  } 

  loadSalesByState(){
    const res = this.sales;

    if( this.toLookFor === 'todos' ){
      let allSales = res.filter(element => element.estadoTransaccion !== 'IN-PROCESS' );
      this.myTotalSales = allSales.length;
      this.totalResults = allSales.length;
      this.sales = allSales;
      this.temporarySales = allSales;
    }

    let salesDelivered = res.filter(element => element.estado == 'entregado' && element.estadoTransaccion !== 'IN-PROCESS' );
    this.deliveredSalesResults = salesDelivered;
    this.totalSalesDelivered = salesDelivered.length;
    if(this.toLookFor === 'entregado'){
      if( this.deliveredSalesResults.length === 0 ){
        this.result = false;
      }
      this.sales = this.deliveredSalesResults;
    }

    let undeliveredSales = res.filter(element => element.estado == 'no entregado' && element.estadoTransaccion !== 'IN-PROCESS' );
    this.undeliveredSalesResults = undeliveredSales;
    this.totalUndeliveredSales = undeliveredSales.length;
    if(this.toLookFor === 'no entregado'){
      if( this.undeliveredSalesResults.length === 0 ){
        this.result = false;
      }
      this.sales = this.undeliveredSalesResults;
    }
    this.charging = false;
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

  showAllSales(){
    this.lookingForSomething = false;
    this.result = true;
    if( this.toLookFor === 'todos' ){
      this.totalResults = this.myTotalSales;
      return this.sales = this.temporarySales;
    }else if( this.toLookFor === 'entregado' ){
      this.totalResults = this.totalSalesDelivered;
      return this.sales = this.deliveredSalesResults;
    }else{
      this.totalResults = this.totalUndeliveredSales;
      return this.sales = this.undeliveredSalesResults;
    }
  }

  uploadFilteredSales( search: string ){
    this.charging = true;
    this.sales = [];
    if(search.length === 0 && this.fromDate.day === undefined && this.toDate.day === undefined ){
      this.lookingForSomething = false;
      this.result = true;
      this.charging = false;
      if( this.toLookFor === 'todos' ){
        return this.sales = this.temporarySales;
      }else if( this.toLookFor === 'entregado' ){
        return this.sales = this.deliveredSalesResults;
      }else{
        return this.sales = this.undeliveredSalesResults;
      }
    }else if(search.length === 0 && this.fromDate.day !== undefined && this.toDate.day !== undefined){
      this.lookingForSomething = true;
      return this.searchWithoutSearchTerm();
    }else{
      if( this.fromDate.day === undefined && this.toDate.day !== undefined || 
        this.fromDate.day !== undefined && this.toDate.day === undefined ){
          this.charging = false;
          this.lookingForSomething = false;
          return Swal.fire(
          'No puedes buscar por fecha ya que no tienes un rango de fecha completamente especificado.', 
          `Si quieres buscar por fecha debes tener un rango de fecha completo, por lo tanto si no quieres
          buscar por fecha elimina las fechas que ya tienes especificadas.`, 
          'warning');
      }
      this.lookingForSomething = true;
    }
    const res = this.temporarySales;
    if( this.toLookFor === 'todos' && this.fromDate.day === undefined ){
      const searchResults = res.filter(element => {
        const regex = new RegExp(search, 'i');
        return element.cliente.nombre.match(regex) || 
        element.cliente.telefono.match(regex) || element.cliente.cedula.match(regex) || 
        element.cliente.correo.match(regex);
      });
      searchResults.length === 0 ? this.result = false : this.result = true;
      this.totalResults = searchResults.length;
      this.charging = false;
      return this.sales = searchResults;
    }else if( this.toLookFor !== 'todos' && this.fromDate.day === undefined ){
      const searchResults = res.filter( element => element.estado === this.toLookFor ).filter(element => {
        const regex = new RegExp(search, 'i');
        return element.cliente.nombre.match(regex) || element.cliente.telefono.match(regex) 
        || element.cliente.cedula.match(regex) || element.cliente.correo.match(regex);
      });
      searchResults.length === 0 ? this.result = false : this.result = true;
      this.totalResults = searchResults.length;
      this.charging = false;
      return this.sales = searchResults;
    }else if( this.toLookFor === 'todos' && this.fromDate.day !== undefined ){
      const searchResults = res.filter(element => {
        const regex = new RegExp(search, 'i');
        return element.cliente.nombre.match(regex) || 
        element.cliente.telefono.match(regex) || element.cliente.cedula.match(regex) || 
        element.cliente.correo.match(regex);
      }).filter( element => {
        const itemDate = new Date(element.fecha.toMillis());
        const day = itemDate.getDate();
        const month = itemDate.getMonth();
        const year = itemDate.getFullYear();
        const date = moment({ day, month, year }).format("YYYY-MM-DD hh:mm A");
        const fromDate = moment({ day: this.fromDate.day, month: this.fromDate.month - 1, year: this.fromDate.year }).format("YYYY-MM-DD hh:mm A");
        const toDate = moment({ day: this.toDate.day, month: this.toDate.month - 1, year: this.toDate.year }).format("YYYY-MM-DD hh:mm A");
        return moment(date).isBetween( fromDate, toDate) || moment(date).isSame(fromDate) || moment(date).isSame(toDate);
      });
      searchResults.length === 0 ? this.result = false : this.result = true;
      this.totalResults = searchResults.length;
      this.charging = false;
      return this.sales = searchResults;
    }else{
      const searchResults = res.filter( element => element.estado === this.toLookFor ).filter(element => {
        const regex = new RegExp(search, 'i');
        return element.cliente.nombre.match(regex) || element.cliente.telefono.match(regex) 
        || element.cliente.cedula.match(regex) || element.cliente.correo.match(regex);
      }).filter( element => {
        const itemDate = new Date(element.fecha.toMillis());
        const day = itemDate.getDate();
        const month = itemDate.getMonth();
        const year = itemDate.getFullYear();
        const date = moment({ day, month, year }).format("YYYY-MM-DD hh:mm A");
        const fromDate = moment({ day: this.fromDate.day, month: this.fromDate.month - 1, year: this.fromDate.year }).format("YYYY-MM-DD hh:mm A");
        const toDate = moment({ day: this.toDate.day, month: this.toDate.month - 1, year: this.toDate.year }).format("YYYY-MM-DD hh:mm A");
        return moment(date).isBetween( fromDate, toDate) || moment(date).isSame(fromDate) || moment(date).isSame(toDate);
      });
      searchResults.length === 0 ? this.result = false : this.result = true;
      this.totalResults = searchResults.length;
      this.charging = false;
      return this.sales = searchResults;
    }
  }

  searchWithoutSearchTerm(){
    const res = this.temporarySales;
    if( this.toLookFor === 'todos' && this.fromDate.day !== undefined && 
     this.toDate.day !== undefined ){
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
      searchResults.length === 0 ? this.result = false : this.result = true;
      this.totalResults = searchResults.length;
      this.charging = false;
      return this.sales = searchResults;
    }else if( this.toLookFor !== 'todos' && this.fromDate.day !== undefined && 
      this.toDate.day !== undefined ){
      const searchResults = res.filter( element => element.estado === this.toLookFor ).filter( element => {
        const itemDate = new Date(element.fecha.toMillis());
        const day = itemDate.getDate();
        const month = itemDate.getMonth();
        const year = itemDate.getFullYear();
        const date = moment({ day, month, year }).format("YYYY-MM-DD hh:mm A");
        const fromDate = moment({ day: this.fromDate.day, month: this.fromDate.month - 1, year: this.fromDate.year }).format("YYYY-MM-DD hh:mm A");
        const toDate = moment({ day: this.toDate.day, month: this.toDate.month - 1, year: this.toDate.year }).format("YYYY-MM-DD hh:mm A");
        return moment(date).isBetween( fromDate, toDate) || moment(date).isSame(fromDate) || moment(date).isSame(toDate);
      });
      searchResults.length === 0 ? this.result = false : this.result = true;
      this.totalResults = searchResults.length;
      this.charging = false;
      return this.sales = searchResults;
    }
  }

  clearSearch(){
    this.searchInput.nativeElement.value = '';
    this.lookingForSomething = false;
    this.result = true;
    if( this.toLookFor === 'todos' ){
      this.totalResults = this.myTotalSales;
      return this.sales = this.temporarySales;
    }else if( this.toLookFor === 'entregado' ){
      this.totalResults = this.totalSalesDelivered;
      return this.sales = this.deliveredSalesResults;
    }else{
      this.totalResults = this.totalUndeliveredSales;
      return this.sales = this.undeliveredSalesResults;
    }
  }

  cleanDates(){
    this.fromDate = Object.create(null);
    this.toDate = Object.create(null);
  }

  search( status: string ){
    this.toLookFor = status;
    this.charging = true;
      
    if(status === 'todos'){
      this.temporarySales.length === 0 ? this.result = false : this.result = true;
      this.totalResults = this.myTotalSales;
      this.charging = false;
      return this.sales = this.temporarySales;
    }else if(status === 'entregado'){
      this.deliveredSalesResults.length === 0 ? this.result = false : this.result = true;
      this.totalResults = this.totalSalesDelivered;
      this.charging = false;
      return this.sales = this.deliveredSalesResults;
    }else{
      this.undeliveredSalesResults.length === 0 ? this.result = false : this.result = true;
      this.totalResults = this.totalUndeliveredSales;
      this.charging = false;
      return this.sales = this.undeliveredSalesResults;
    }
  }

  updateStatus( sale: Pedido ) {
    this.updateStatusOrder = true;
    this.authService.loadingData();
    this.salesService.updateStatus<Pedido>(sale, this.path, sale.id).then( res => {
      Swal.close();
      this.uploadAllMySales();
    }).catch( error => {
      Swal.fire('Error', 'Error al actualizar, intente nuevamente.', 'error' );
    });
  }


  formatDate(date: Date): string{
    const convertedDate = moment(date).format('MMMM Do YYYY, h:mm a'); 
    return convertedDate[0].toUpperCase() + convertedDate.substring(1);
  }


    /**
   *  Muestra el modal para ver la información del cliente.
   *
   * @param content1 el identificador para abril un modal.
   * @param sale el objeto con todos los datos del cliente.
   * @returns void.
   */
    openModal(content1: string, user: Usuario) {
      this.saleCustomer = user;
      this.modalService.open(content1, { ariaLabelledBy: 'modal-basic-title', size: 'lg' }).result.then((result) => {
        this.closeResult = `Closed with: ${result}`;
      }, (reason) => {
        this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      });
    }
  
      /**
     *  Cierra el modal de ver la información del cliente.
     *
     * @returns un string con un mensaje informativo.
     */
    private getDismissReason(reason: ModalDismissReasons): string {
      if (reason === ModalDismissReasons.ESC) {
        return 'by pressing ESC';
      } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
        return 'by clicking on a backdrop';
      } else {
        return `with: ${reason}`;
      }
    }
}
