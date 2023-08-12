import { Component, OnInit, HostListener, Inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';

import { AuthService } from "../../services/auth.service";
import { FirestoreService } from '../../services/firestore.service';
import { Producto, Usuario, Comentarios } from '../../models/models';
import { CartService } from '../../services/cart.service';

import Swal from 'sweetalert2';
import { DOCUMENT } from '@angular/common';
import moment from 'moment';
moment.locale("es");

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.scss']
})
export class ProductDetailsComponent implements OnInit {

  private path: string = 'Productos/';
  private productId: string = '';
  private uid: string = '';
  private hasCart: boolean = false;
  public formSubmitted = false;
  public loggedUserData: Usuario = {
    uid: '',
    correo: '',
    img: '',
    nombre: '',
    contrasena: '',
    ciudad: '',
    direccion: '',
    cedula: '',
    telefono: '',
    terminos: true,
    fecha: new Date,
  };

  public producto: Producto;

  public charging: boolean = true;
  public loadingUserData: boolean = true;
  public isAvailable: boolean = true;

  public stockTemp: number = 0;
  average: string = '';
  public cartInProgress: boolean = false;

  public directToHomePage: boolean = true;
  public theProductExists: boolean = false;

  showButton = false;
  private scrollHeight: number = 500;
  public commentsToShow: Comentarios[] = [];
  public loadingComments: boolean = false;
  private uploadComments: boolean = true;
  public areThereComments: boolean = true;


  /**
   * Constructor del componente product-details
   * 
   * @param firestoreService Servicio para realizar consultas de CRUD a las colecciones de BD 
   * @param carritoService Servicio para utilizar todas las funciones del carrito
   * @param activatedRoute Constructor para recoger parametros de la url
  */
  constructor(
    public authService: AuthService,
    public firestoreService: FirestoreService,
    public carritoService: CartService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    @Inject(DOCUMENT) private document: Document
  ) { }
  
    /**
   * Realiza las primeras acciones al cargar
   * el componente
   * 
   * @returns void Obtiene el id del producto
   */
  async ngOnInit() {

    localStorage.getItem('hide-side-menu') === 'true' ? this.directToHomePage = true : this.directToHomePage = false;

    this.uid = await this.authService.getUid();
    this.checkCart();
    
    this.activatedRoute.params
    .subscribe({
      next: ({ id }) => {
        this.cargarDetalles( id );
      },
      error: (e) => {
        return Swal.fire('Error', 'Error al cargar datos, por favor intente nuevamente.', 'error' );
      },
      complete: () => console.log()
    });
  }


  checkCart(){
    if(this.uid !== null){
      const unsubscribe = this.firestoreService.getDoc<Usuario>('Usuarios', this.uid).subscribe({
        next: (res) => {
          this.loggedUserData = res;
          const cartRoute = 'Usuarios/' + this.uid + '/carrito';
          const unsubscribeTwo = this.firestoreService.getDoc<Usuario>(cartRoute, this.uid).subscribe({
            next: (res) => {
              if( res !== undefined ){
                this.hasCart = true;
                this.firestoreService.updateDoc<Producto>({ cliente: this.loggedUserData }, cartRoute, this.uid).then( res => {
                  this.loadingUserData = false;
                }).catch( error => {
                  console.log(error);
                });
              }else{
                this.hasCart = false;
                this.loadingUserData = false;
              }
              unsubscribeTwo.unsubscribe();
            },
            error: (e) => {
              return Swal.fire('Error', 'Error al cargar datos, por favor intente nuevamente.', 'error' );
            },
            complete: () => console.log()
          });
          unsubscribe.unsubscribe();
        },
        error: (e) => {
          return Swal.fire('Error', 'Error al cargar datos, por favor intente nuevamente.', 'error' );
        },
        complete: () => console.log()
      });
    }else{
      this.loadingUserData = false;
    }
  }
   

  
    /**
   *  Carga los detalles del producto seleccionado
   *
   * @param id el identificador del producto a mostrar
   * @returns void.
   */
  cargarDetalles(id: string) {
    const desuscribir = this.firestoreService.getDoc<Producto>(this.path, id).subscribe({
      next: (res) => {
        this.productId = id;
        if( res === undefined ){
          this.theProductExists = false;
        }else{
          const visits = res.visitas + 1;
          this.firestoreService.updateDoc<Producto>({ visitas: visits }, this.path, id).then( () => {
          }).catch( error => {
            console.log(error);
          });
          this.getComments();
          this.producto = res;
          this.average = res.promedio?.toFixed(1);
          this.stockTemp = res.stock;
          this.theProductExists = true;
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

  getPrice(price: number) {
    const response = new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
    }).format(price);
    const oldPrice = response.split(',');
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
   *  Agrega un producto al carrito de compras del usuario
   *
   * @returns void.
   */
  addCarrito() {
    if(this.directToHomePage || this.uid === null){
      Swal.fire({
        title: 'Inicia sesión',
        text: 'No puedes agregar este producto al carrito porque no has iniciado sesión.',
        icon: 'warning',
        showCancelButton: true,
        cancelButtonText: 'Cancelar',
        confirmButtonText: 'Ir a la página de iniciar sesión'
      }).then((result) => {
        if (result.value) {
          this.router.navigateByUrl("/login");
        }
      })
    }else{
      if(this.loggedUserData.cedula.length === 0 || this.loggedUserData.ciudad.length === 0 
        || this.loggedUserData.direccion.length === 0 || this.loggedUserData.telefono.length === 0){
        return Swal.fire({
          title: 'Completa tus datos personales en tu perfil',
          text: 'No puedes seguir con la compra porque no has completado tu información personal.',
          icon: 'warning',
          showCancelButton: false,
          allowOutsideClick: false,
          confirmButtonText: 'Ir a mi perfil'
        }).then((result) => {
          if (result.value) {
            this.router.navigateByUrl("/dashboard/perfil");
          }
        });
      }
      Swal.fire({
        title: 'Guardando',
        html: 'Por favor espera un momento...',
        showCancelButton: false,
        showConfirmButton: false,
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading()
        }
      });
      if(this.hasCart){
        this.hasCart = true;
        this.carritoService.addProducto(this.producto).then( res => {
          Swal.fire({
            icon: 'success',
            title: 'Producto agregado con éxito a tu carrito!!'
          });
        }).catch( err => {
          Swal.fire({
            icon: 'error',
            title: 'Error al agregar el producto a su carrito, por favor intenta nuevamente'
          });
        });
      }else{
        this.hasCart = true;
        this.carritoService.addProducto(this.producto).then( res => {
          const cartRoute = 'Usuarios/' + this.uid + '/carrito';
          this.firestoreService.updateDoc<Producto>({ cliente: this.loggedUserData }, cartRoute, this.uid).then( res => {
            Swal.fire({
              icon: 'success',
              title: 'Producto agregado con éxito a tu carrito!!'
            });
          }).catch( error => {
            Swal.fire({
              icon: 'error',
              title: 'Error al agregar el producto a su carrito, por favor intenta nuevamente'
            });
          });
        }).catch( err => {
          Swal.fire({
            icon: 'error',
            title: 'Error al agregar el producto a su carrito, por favor intenta nuevamente'
          });
        });
      }
    } 
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    const yOffset = window.pageYOffset;
    const scrollTop = this.document.documentElement.scrollTop;
    this.showButton = (yOffset || scrollTop) > this.scrollHeight;
  }

  onScrollTop(): void {
    this.document.documentElement.scrollTop = 0;
  }

  onScrollDown(): void {
    this.getComments();
  }

  getComments(){
    let startAt = null;
    if (this.commentsToShow.length) {
      startAt = this.commentsToShow[this.commentsToShow.length - 1].fecha || null;
    }

    if(!this.loadingComments && this.uploadComments){
      this.loadingComments = true;
      const unsubscribe = this.firestoreService.getComments<Comentarios>('/Comentarios', startAt, this.productId).subscribe({
        next: (resp) => {
          this.loadingComments = false;
          if(resp.length > 0){
            resp.forEach(element => {
              this.commentsToShow.push(element);
            });
            this.areThereComments = true;
          }else{
            this.uploadComments = false;
            if(this.commentsToShow.length == 0){
              this.areThereComments = false;
            }
          }
          unsubscribe.unsubscribe();
        },
        error: (e) => {
          console.log(e);
          return Swal.fire('Error', 'Error al cargar los datos, por favor intente nuevamente.', 'error' );
        },
        complete: () => console.log()
        });
    }
  }

  formatDate(date: Date): string{
    const convertedDate = moment(date).startOf('minutes').fromNow(); 
    return convertedDate[0].toUpperCase() + convertedDate.substring(1);
  }

  verifyLogin(id: string){
    if(this.directToHomePage || this.uid === null){
      Swal.fire({
        title: 'Inicia sesión',
        text: 'No puedes denunciar este comentario porque no has iniciado sesión.',
        icon: 'warning',
        showCancelButton: true,
        cancelButtonText: 'Cancelar',
        confirmButtonText: 'Ir a la página de iniciar sesión'
      }).then((result) => {
        if (result.value) {
          this.router.navigateByUrl("/login");
        }
      })
    }else{
      this.router.navigateByUrl(`/dashboard/denunciar/${id}`);
    }
  }
  
}