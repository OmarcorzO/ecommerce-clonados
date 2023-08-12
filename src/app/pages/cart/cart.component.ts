import { Component, OnDestroy, OnInit } from '@angular/core';
import { FirestoreService } from '../../services/firestore.service';
import { Pedido, Producto } from '../../models/models';
import { CartService } from '../../services/cart.service';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit, OnDestroy {

  pedido: Pedido;
  carritoSuscriber: Subscription;
  totalToPaintInTheHtml: string;
  public total: number = 0;
  public cantidad: number = 0;
  public charging: boolean = true;

   /**
   * Constructor del componente cart
   * 
   * @param firestoreService Servicio para realizar consultas de CRUD a las colecciones de BD 
   * @param carritoService Servicio para utilizar todas las funciones de carrito
   * @param firebaseauthService Servicio que utiliza métodos de autenticación
   */
  constructor(
    public firestoreService: FirestoreService,
    public carritoService: CartService,
    public firebaseauthService: AuthService) {
  }

  ngOnInit() {
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
    this.loadCart();
  }

   /**
   * Realiza una desuscripción del loadCart()
   * al destruirse el componente
   * 
   * @returns void
   */
  ngOnDestroy() {
    if (this.carritoSuscriber) {
      this.carritoSuscriber.unsubscribe();
    }
  }

   /**
   * Carga todos los productos del usuario logueado
   * que se han agregago a su carrito
   * 
   * @returns void
   */
  loadCart() {
    this.carritoSuscriber = this.carritoService.getCarrito().subscribe({
      next: (res) => {
        this.charging = false;
        this.pedido = res;
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
   * Inicializa el objeto de pedido con los
   * valores correspondientes
   * 
   * @returns void
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
      estado: 'no entregado',
      referencia: null,
      estadoTransaccion: null
    };
  }

  
   /**
   * Agrega un nuevo producto al carrito
   * de compras, es decir, agrega y le suma 
   * 1 a la cantidad de ese producto en el carrito
   * 
   * @param producto Objeto de tipo producto, que contiene el
   * producto que se va agregar al carrito
   * @returns void
   */
  addCarrito(producto: Producto) {
    this.carritoService.loadingData();
    this.carritoService.addProducto(producto).then( () => {
      Swal.close();
    }).catch( err => {
      Swal.fire({
        icon: 'error',
        title: 'Error al agregar este producto a su carrito, por favor intente nuevamente'
      });
    });
  }

  
   /**
   * Elimina un producto del carrito, es decir,
   * elimina y resta un solo producto del carrito
   * 
   * @param producto Objeto de tipo producto, que contiene el
   * producto que se va a eliminar del carrito
   * @returns void
   */
  removeCarrito(producto: Producto) {
    this.carritoService.loadingData();
    this.carritoService.removeProducto(producto).then( () => {
      Swal.close();
    }).catch( err => {
      Swal.fire({
        icon: 'error',
        title: 'Error al disminuir la cantidad del producto de su carrito, por favor intente nuevamente'
      });
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
    this.carritoService.loadingData();
    this.carritoService.deleteProductRow(producto).then( () => {
      Swal.close();
    }).catch( err => {
      Swal.fire({
        icon: 'error',
        title: 'Error al eliminar el producto de su carrito, por favor intente nuevamente'
      });
    });
  }

   /**
   * Elimina todos los productos del carrito
   * 
   * @returns void
   */
  clearCarrito(){
    this.carritoService.loadingData();
    this.carritoService.clearCarrito().then( () => {
      Swal.close();
    }).catch( err => {
      Swal.fire({
        icon: 'error',
        title: 'Error al limpiar su carrito, por favor intente nuevamente'
      });
    });
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
   * Obtiene el costo total de todos los 
   * productos agregados al carrito
   * 
   * @returns void
   */
  getTotal() {
    this.total = 0;
    this.pedido.productos.forEach(producto => {
      this.total = (producto.producto.precioNormal - (producto.producto.precioNormal*(producto.producto.precioReducido/100))) * producto.cantidad + this.total;
    });   
    let totalToPaint = this.normalizeAmmount(this.total.toString());
    this.totalToPaintInTheHtml = totalToPaint.ammounCrurrency;
  }

     /**
   * Obtiene la cantidad de todos los 
   * productos agregados al carrito
   * 
   * @returns void
   */
  getCantidad() {
    this.cantidad = 0
    this.pedido.productos.forEach(producto => {
      this.cantidad = producto.cantidad + this.cantidad;
    });
  }

}