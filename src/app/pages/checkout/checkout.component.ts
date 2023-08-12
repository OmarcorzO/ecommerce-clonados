import { Component, OnInit, OnDestroy, Renderer2, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { FirestoreService } from '../../services/firestore.service';
import { Pedido, Producto, ProductoPedido } from '../../models/models';
import { CartService } from '../../services/cart.service';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { SalesService } from '../../services/sales.service';
import { ValidatePurchasesService } from '../../services/validate-purchases.service';

import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';

import Swal from 'sweetalert2';

import { environment } from '../../../environments/environment';

const publicKeyWompi = environment.publicKeyWompi;
const redirectUrlEcommerce = environment.redirectUrlEcommerce;

declare global {
  interface Window {
    WidgetCheckout?: any;
  }
}

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit, OnDestroy {

  pedido: Pedido;
  private readonly WOMPI!: any; //TODO: window.WidgetCheckout
  closeResult = '';

  @ViewChild('modalPurchaseErrorDetails') purchaseErrorDetails;  
  @ViewChild('modalProductNotExistingError') productNotExistingError;  
  
  carritoSuscriber: Subscription;
  public formSubmitted = false;
  total: number;
  totalToPaintInTheHtml: string;
  total_pay: string;
  public cantidad: number = 0;
  public charging: boolean = true;

  public productStockError: boolean = false;
  public stockErrorCounter: number = 0;
  public showPaymentButton: boolean = false;
  public showContinueButton: boolean = false;
  

  public letBuy: boolean = false;
  public letContinueShopping: boolean = true;
  emptyProducts: any[] = [];

  active = 1;

  public deliveryForm = this.fb.group({ 
    direccion: ['', [ Validators.required, Validators.minLength(10), Validators.maxLength(64) ] ]
  });

  /**
   * Constructor del CheckoutComponent
   * 
   * @param firestoreService Servicio para realizar consultas de CRUD a las colecciones de BD 
   * @param router Servicio de rutas para el direccionamiento de páginas
   * @param modalService Componente de modal para las pantallas desplegables
   * @param carritoService Servicio de carrito para realizar compras
   * @param firebaseauthService Servicio que utiliza métodos de autenticación
   */
  constructor(
    private fb: FormBuilder,
    public firestoreService: FirestoreService,
    private modalService: NgbModal,
    public carritoService: CartService,
    public firebaseauthService: AuthService,
    public salesService: SalesService,
    public validatePurchasesService: ValidatePurchasesService
  ) {
    this.WOMPI = window.WidgetCheckout;
  }

  /**
   * Inicializa los distintos métodos al iniciar el componente
   * 
   * @returns Inicia los distintos métodos especificados
   */
   ngOnInit(): void {
    Swal.fire({
      title: 'Cargando',
      html: 'Por favor espera un momento...',
      showCancelButton: false,
      showConfirmButton: false,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading()
      }
    });
    this.initCarrito();
    this.loadPedido();
  }

  /**
   * Desuscribe distintos métodos al salir del componente
   * 
   * @returns Componente limpio sin observables o suscripciones constanstes
   */
  ngOnDestroy() {
    if (this.carritoSuscriber) {
      this.carritoSuscriber.unsubscribe();
    }
  }

  /**
   * Carga los diferentes pedidos al carrito
   * 
   * @returns El producto/pedido cargado en el carrito
   */
  loadPedido() {
    this.carritoSuscriber = this.carritoService.getCarrito()
    .subscribe({
      next: (res) => {
        this.charging = false;
        this.pedido = res;
        res.productos.length === 0 ? this.showContinueButton = false : this.showContinueButton = true;
        this.deliveryForm.patchValue({ direccion: res.cliente?.direccion });
        this.getTotal();
        this.getCantidad();
        Swal.close();
      },
      error: (e) => {
        return Swal.fire('Error', 'Error al cargar datos, por favor intente nuevamente.', 'error' );
      },
      complete: () => console.log()
    });
  }

  /**
   * Inicializa el carrito que tendrá los productos a comprar
   * 
   * @returns Carrito de compras funcional
   */
  initCarrito() {
    //Este this.pedido es para tener el carrito vacio apenas se cargue la vista para no tener problemas
    //con el tiempo que demora la app en comunicarse con la BD para traer una respuesta de nuestro carrito
    this.pedido = {
      id: '',
      cliente: null,
      productos: [],
      precioTotal: null,
      fecha: new Date(),
      cantidadProductos: null,
      estado: null,
      referencia: null,
      estadoTransaccion: null
    };
  }

  normalizeAmmount(ammount: any) {
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
    return response;
  }
  
  /**
   * Obtiene el total de los productos del carrito
   * 
   * @returns Total de los productos almacenados en el carrito
   */
  getTotal() {
    this.total = 0;
    this.pedido.productos.forEach(producto => {
      this.total = (producto.producto.precioNormal - (producto.producto.precioNormal*(producto.producto.precioReducido/100))) * producto.cantidad + this.total; 
    });
    let totalToPaint = this.normalizeAmmount(this.total.toString());
    this.totalToPaintInTheHtml = totalToPaint.ammounCrurrency;
  }

  async makePayment(){
    Swal.fire({
      title: 'Cargando',
      html: 'Por favor espera un momento...',
      showCancelButton: false,
      showConfirmButton: false,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading()
      }
    });

    const totalToConvert = this.normalizeAmmount(this.total);

    //Realizar el envio del formulario
    const unsubscribeOne = this.validatePurchasesService.generateAnIntegritySignature( totalToConvert.ammountIncents )
    .subscribe({
      next: (resp: any) => {
        const wompiReference = resp.success.hashAndRef.ref;
        const signatureIntegrity = resp.success.hashAndRef.hash;
        const unsubscribeTwo = this.salesService.getLastReservation<Pedido>('Ventas/', this.pedido.cliente.uid).subscribe({
          next: (res) => {
            if( res[0].estadoTransaccion !== 'PENDING' ){
              const data = {
                referencia: resp.success.hashAndRef.ref,
                estadoTransaccion: 'PENDING'
              }
              this.firestoreService.updateDoc<Producto>(data, 'Ventas/', res[0].id).then( res => {
                window.location.href = `https://checkout.wompi.co/p/?public-key=${publicKeyWompi}&currency=COP&amount-in-cents=${totalToConvert.ammountIncents}&reference=${wompiReference}&signature:integrity=${signatureIntegrity}&redirect-url=${redirectUrlEcommerce}`;
              }).catch( error => {
                console.log(error);
              });
            }else{
              Swal.fire({
                icon: 'error',
                title: 'No puedes comprar porque ya tienes una transacción en proceso, por favor espera a que se termine y vuelve a intentar'
              });
            }
            unsubscribeTwo.unsubscribe();
          },
          error: (e) => {
            return Swal.fire('Error', 'Error al procesar los datos, por favor intente nuevamente.', 'error' );
          },
            complete: () => console.log()
        });
        unsubscribeOne.unsubscribe();
      },
      error: (err) => {
        return Swal.fire('Error', err.error.message, 'error' );
      },
      complete: () => console.log()
    });
  }

  updateMyAddress(){
    this.formSubmitted = true;
    const { direccion } = this.deliveryForm.value;
    if(this.deliveryForm.invalid){
      return;
    }
    this.pedido.cliente.direccion = direccion;
    Swal.fire('Actualización exitosa', 'Tu dirección de entrega fue cambiada con éxito.', 'success');
  }
  
  /**
   * Captura la cantidad que tendrá el producto
   * 
   * @returns Va desplegando la cantidad por producto en el carrito
   */
  getCantidad() {
    this.cantidad = 0
    this.pedido.productos.forEach(producto => {
      this.cantidad = producto.cantidad + this.cantidad;
    });
  }

  /**
   * Obtiene los items que serán parte de la API PayPal
   * 
   * @returns Lista de items que conforman el carrito
   */
  getItemList(): any[] {
    const items: any[] = [];
    let item = {};
    this.pedido.productos.forEach((it: ProductoPedido) => {   
      items.push(item);
    });
    return items;
  }

  /**
 * Controlador del modal
 * 
 * @param items Campos de información para el modal
 * @param monto Monto total para el modal
 * @returns Modal del resumen de compra
 */
  openModalPurchaseErrorDetails() {
    this.modalService.open(this.purchaseErrorDetails, { ariaLabelledBy: 'modal-basic-title', size: 'lg' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;   
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });      
  }

  openModalOfProductRemoved() {
    this.modalService.open(this.productNotExistingError, { ariaLabelledBy: 'modal-basic-title', size: 'lg' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;   
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });      
  }

  /**
   * Controlador de las opciones del cierre del modal
   * 
   * @param reason Campo que captura la razón del cierre del modal
   * @returns Clasificación del tipo de cierre del modal
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

  checkStock(){
    
    Swal.fire({
      title: 'Cargando',
      html: 'Por favor espera un momento...',
      showCancelButton: false,
      showConfirmButton: false,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading()
      }
    });

    this.emptyProducts = [];
    let thereIsNoProduct = false;
    let iterationCounter = 0;
    let arrayOfResponseProducts = [];

    const unsubscribe = this.salesService.getLastReservation<Pedido>('Ventas/', this.pedido.cliente.uid).subscribe({
      next: (res) => {
        res.length === 0 || res[0]?.estadoTransaccion !== 'PENDING'  ? this.letContinueShopping = true : this.letContinueShopping = false;
        if(this.letContinueShopping){
          const unsubscribeTwo = this.firestoreService.getCollectionAll<Producto>('Productos/').subscribe({
            next: (allProducts) => {
              
              //Verificamos si alguno de los productos del carrito del usuario no existe, es decir, fue eliminado
              this.pedido.productos.forEach(element => {
                const unsubscribeProductRequest = this.firestoreService.getDoc<Producto>('Productos/', element.producto.id).subscribe({
                  next: (response) => {
                    response ? iterationCounter = iterationCounter + 1 : iterationCounter = iterationCounter + 1;
                    arrayOfResponseProducts.push(response);
      
                    if(response === undefined){
                      thereIsNoProduct = true;
                    }
      
                    if(iterationCounter === this.pedido.productos.length && thereIsNoProduct){
                      this.pedido.productos.forEach(elementOne => {
                        let sw = false;
                        arrayOfResponseProducts.forEach(elementTwo => {
                          if(elementOne.producto.id === elementTwo?.id){
                            sw = true;
                          }
                        });
                        if(!sw){
                          this.emptyProducts.push(elementOne.producto);
                        }
                      });
                    }
      
                    if(thereIsNoProduct && iterationCounter === this.pedido.productos.length){
                      Swal.close();
                      return this.openModalOfProductRemoved();
                    }else if(!thereIsNoProduct && iterationCounter === this.pedido.productos.length){
                      if(res.length > 0 && res[0]?.estadoTransaccion === 'IN-PROCESS'){
                        this.pedido.productos.forEach(order => {
                          res[0].productos.forEach(product => {
                            if( order.producto.id == product.producto.id ){
                              if(order.cantidad > product.cantidad){
                                let totalAmount = order.cantidad - product.cantidad;
                                allProducts.forEach(element => {
                                  if( order.producto.id == element.id ){
                                    if(totalAmount > element.stock){
                                      this.stockErrorCounter++;
                                      if( this.emptyProducts.length == 0 ){
                                        this.emptyProducts.push(element);
                                      }else{
                                        let result = this.emptyProducts.filter(element => element.id == product.producto.id );
                                        if( result.length === 0 ){
                                          this.emptyProducts.push(element);
                                        }
                                      }
                                    }
                                  }
                                });
                              }
                            }
                          });
                        });
              
                        if(this.stockErrorCounter > 0){
                          this.stockErrorCounter = 0;
                          this.openModalPurchaseErrorDetails();
                          Swal.close();
                        }else{
                          //Validamos que todos los productos del carrito sean los mismos al de la reserva y no haya uno nuevo o uno menos
                          let countProducts = 0;
                          this.pedido.productos.forEach((order, position) => {
                            let falsePosition = position + 1;
                            res[0].productos.forEach(product => {
                              if( order.producto.id === product.producto.id ){
                                countProducts = countProducts + 1;
                              }
                            });
                            if(falsePosition === this.pedido.productos.length){
                              if( countProducts < res[0].productos.length ){
                                countProducts = 0;
                              }
                            }
                          });
              
                          if( this.pedido.productos.length === countProducts ){
                            //Mismos productos
                            const result = res[0];
                            const idProduct = res[0].id;
                            const path = 'Productos/';
              
                            //Validamos que las cantidades de los productos sean exactamente iguales a los de el ultimo pedido
                            this.pedido.productos.forEach(order => {
                              result.productos.forEach(product => {
                                if( order.producto.id === product.producto.id ){
                                  if(order.cantidad !== product.cantidad){
                                    this.letBuy = true;
                                  }
                                }
                              });
                            });
                            
                            //Aqui evaluamos los productos ya existentes en el carrito
                            result.productos.forEach((producto, index) => {
                              let toUpdate = false;
                              let timeIndex = index + 1;
                              const desuscribir = this.firestoreService.getDoc<Producto>(path, producto.producto.id).subscribe({
                                next: (res) => {
                                  //aqui comienza el nuevo codigo
                                  let total = 0;
                                  this.pedido.productos.forEach( (order, i) => {
                                    if( producto.producto.id === order.producto.id ){
                                      if( order.cantidad < producto.cantidad ){
                                        let totalAmount = producto.cantidad - order.cantidad;
                                        total = totalAmount + res.stock;
                                        toUpdate = true;
                                      }else if( order.cantidad > producto.cantidad ){
                                        let totalAmount = order.cantidad - producto.cantidad;
                                        total = res.stock - totalAmount;
                                        toUpdate = true;
                                      }else{
                                        toUpdate = false;
                                      }
                                    }
                                  });
                                  if( toUpdate === true ){
                                    this.firestoreService.updateDoc<Producto>({ stock: total }, path, producto.producto.id).then( res => {
                                      if( timeIndex === this.pedido.productos.length ){
                                        this.pedir();
                                        this.firestoreService.deleteDoc<Producto>('Ventas/', idProduct).then( res => {
                                        }).catch( error => {
                                        });
                                      }
                                    }).catch( error => {
                                      console.log(error);
                                    });
                                  }else{
                                    if( timeIndex === this.pedido.productos.length ){
                                      this.pedir();
                                      this.firestoreService.deleteDoc<Producto>('Ventas/', idProduct).then( res => {
                                      }).catch( error => {
                                      });
                                    }
                                  }
                                  desuscribir.unsubscribe();
                                },
                                error: (e) => {
                                  return Swal.fire('Error', 'Error al procesar los datos, por favor intente nuevamente.', 'error' );
                                },
                                complete: () => console.log()
                              });
                            });
                          }else{
                            this.letBuy = true;
                            //Diferentes productos
                            const result = res[0];
                            const idProduct = res[0].id;
                            const path = 'Productos/';
                            
                            result.productos.forEach((producto, index) => {
                              let timeIndex = index + 1;
                              const unsubscribePetition = this.firestoreService.getDoc<Producto>(path, producto.producto.id).subscribe({
                                next: (res) => {
                                  if(res !== undefined){
                                    let total = producto.cantidad + res.stock;
                                    this.firestoreService.updateDoc<Producto>({ stock: total }, path, producto.producto.id).then( res => {
                                      if( timeIndex === result.productos.length ){
                                        this.updateStock();
                                        this.firestoreService.deleteDoc<Pedido>('Ventas/', idProduct).then( res => {
                                        }).catch( error => {
                                        });
                                      }
                                    }).catch( error => {
                                      console.log(error);
                                    });
                                  }else{
                                    if( timeIndex === result.productos.length ){
                                      this.updateStock();
                                      this.firestoreService.deleteDoc<Pedido>('Ventas/', idProduct).then( res => {
                                      }).catch( error => {
                                      });
                                    }
                                  }
                                  unsubscribePetition.unsubscribe();
                                },
                                error: (e) => {
                                  return Swal.fire('Error', 'Error al procesar los datos, por favor intente nuevamente.', 'error' );
                                },
                                complete: () => console.log()
                              });
                            });
                          }
                        }
                      }else{
                        this.pedido.productos.forEach(order => {
                          allProducts.forEach(product => {
                            if( order.producto.id == product.id ){
                              if(order.cantidad > product.stock){
                                this.stockErrorCounter++;
                                if( this.emptyProducts.length == 0 ){
                                  this.emptyProducts.push(product);
                                }else{
                                  let result = this.emptyProducts.filter(element => element.id == product.id );
                                  if( result.length === 0 ){
                                    this.emptyProducts.push(product);
                                  }
                                }
                              }
                            }
                          });
                        });
                        if(this.stockErrorCounter > 0){
                          this.stockErrorCounter = 0;
                          this.openModalPurchaseErrorDetails();
                          Swal.close();
                        }else{
                          this.letBuy = true;
                          this.updateStock();
                        }
                      }
                    }
                    unsubscribeProductRequest.unsubscribe();
                  },
                  error: (e) => {
                    return Swal.fire('Error', 'Error al procesar los datos, por favor intente nuevamente.', 'error' );
                  },
                  complete: () => console.log()
                });
              });
              unsubscribeTwo.unsubscribe();
            },
            error: (e) => {
              return Swal.fire('Error', 'Error al procesar los datos, por favor intente nuevamente.', 'error' );
            },
            complete: () => console.log()
          });
        }else{
          Swal.fire({
            icon: 'error',
            title: 'No puedes comprar porque ya tienes una transacción en proceso, por favor espera a que se termine y vuelve a intentar'
          });
        }
      
        unsubscribe.unsubscribe();
      },
      error: (e) => {
        return Swal.fire('Error', 'Error al procesar los datos, por favor intente nuevamente.', 'error' );
      },
      complete: () => console.log()
    });
  }

      /**
   * Elimina una fila de producto del carrito,
   * es decir, elimina el producto completo sea
   * cual sea la cantidad agregadas que tenga
   * 
   * @param producto Objeto de tipo producto, que contiene el
   * producto que se va a eliminar completamente del carrito
   * @returns void
   */
  deleteProductRowCarrito(producto: Producto) {
    let position = 0;
    const item = this.emptyProducts.find( (productoPedido, index) => {
        position = index;
        return (productoPedido.id === producto.id)
    });
    if (item !== undefined) {
        this.emptyProducts.splice(position, 1);
        this.carritoService.deleteProductRow(producto);
    }
  }

  /**
   * Creación del pedido en la base de datos
   * 
   * @returns Pedido almacenado en las colecciones de la base de datos
   */
  pedir() {
    if(!this.charging){

      if (!this.pedido.productos.length) {
        return;
      }

      if(this.letContinueShopping){
        this.pedido.fecha = new Date();
        this.pedido.precioTotal = this.total;
        this.pedido.cantidadProductos = this.cantidad;
        this.pedido.estado = 'no entregado';
        this.pedido.referencia = '';
        this.pedido.estadoTransaccion = 'IN-PROCESS';
        this.pedido.id = this.firestoreService.getId(); 
    
        this.firestoreService.createDoc(this.pedido, 'Ventas/', this.pedido.id).then( res => {
          Swal.close();
          this.showPaymentButton = true;
        }).catch( error => {
          Swal.fire({
            icon: 'error',
            title: 'Intenta nuevamente'
          });
        });
      }else{
        Swal.fire({
          icon: 'error',
          title: 'No puedes comprar porque ya tienes una transacción en proceso, por favor espera a que se termine y vuelve a intentar'
        });
      }
    }
  }

  /**
   * Actualiza el stock de los productos comprados
   * 
   * @returns Producto actualizado con el nuevo stock
   */
  updateStock(){
    const path = 'Productos/';
    this.pedido.productos.forEach((producto, index) => {
      let timeIndex = index + 1;
      const desuscribir = this.firestoreService.getDoc<Producto>(path, producto.producto.id).subscribe({
        next: (res) => {
          if(res !== undefined){
            let total = res.stock - producto.cantidad;
            this.firestoreService.updateDoc<Producto>({ stock: total }, path, producto.producto.id).then( res => {
              if( timeIndex === this.pedido.productos.length ){
                this.pedir();
              }
            }).catch( error => {
              console.log(error);
            });
          }else{
            if( timeIndex === this.pedido.productos.length ){
              this.pedir();
            }
          }
          desuscribir.unsubscribe();
        },
        error: (e) => {
          return Swal.fire('Error', 'Error al procesar los datos, por favor intente nuevamente.', 'error' );
        },
          complete: () => console.log()
      });
    });
  }

  /**
   * Valida si algún campo del formulario esta incorrecto.
   *
   * @param field el nombre del campo del formulario.
   * @returns un true si existe algún campo incorrecto en el formulario
   * o false si todo el formulario se encuentra correctamente diligenciado.
   */
  invalidField( field: string ): boolean {
  
    if ( this.deliveryForm.get(field)!.invalid && this.formSubmitted ) {
      return true;
    } else {
      return false;
    }

  }

  
   /**
   * Muestra un mensaje de error al usuario para
   * indicarle el tipo de error que existe en el 
   * formulario.
   * 
   * @param field el nombre del campo del formulario.
   * @returns un string como un mensaje para describirle 
   * al usuario que tipo de error existe en cada campo
   * del formulario.
   */
  getErrorMessage(field: string): string{
    let message = '';
    if(this.deliveryForm.get(field)!.hasError('required')){
      message = 'Este campo es requerido';
    }else if(this.deliveryForm.get(field)!.hasError('minlength')){
      const minLength = this.deliveryForm.get(field)!.errors?.minlength.requiredLength;
      message = `Este campo debe tener un minimo de ${minLength} caracteres`;
    }else if(this.deliveryForm.get(field)!.hasError('maxlength')){
      const maxLength = this.deliveryForm.get(field)!.errors?.maxlength.requiredLength;
      message = `Este campo debe tener un maximo de ${maxLength} caracteres`;
    }
    return message;
  }

}
