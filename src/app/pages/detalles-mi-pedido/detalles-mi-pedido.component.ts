import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FirestoreService } from '../../services/firestore.service';
import { AuthService } from '../../services/auth.service';
import { PoliticaDeDevoluciones, Usuario, Producto, Pedido, ProductoPedido } from '../../models/models';

import { FormBuilder, Validators } from '@angular/forms';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';

import Swal from 'sweetalert2';

@Component({
  selector: 'app-detalles-mi-pedido',
  templateUrl: './detalles-mi-pedido.component.html',
  styleUrls: ['./detalles-mi-pedido.component.scss']
})
export class DetallesMiPedidoComponent implements OnInit {

  public charging: boolean = true;
  public loadingPolicies: boolean = true;
  public uploadedUserData: boolean = false;
  
  public uid: string = '';
  public pedido: Pedido;
  public product: ProductoPedido;
  public shippingAndReturnPolicies: PoliticaDeDevoluciones;
  public total: number = 0;
  public formSubmitted = false;
  public theProductExists: boolean = false;
  verifyingProduct: boolean = false;
  closeResult = '';

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

  //VARIABLES PARA CALIFICAR CON ESTRELLAS
  currentRate = 1;
  selected = 0;
  hovered = 0;
  readonly = false;

  public saveCommentForm = this.fb.group({ 
    id: ['', [ Validators.required, Validators.minLength(5), Validators.maxLength(32) ] ],
    productId: ['', [ Validators.required, Validators.minLength(5), Validators.maxLength(32) ] ],
    texto: ['', [ Validators.required, Validators.minLength(5), Validators.maxLength(2000) ] ],
    fecha: ['', [ Validators.required,  Validators.maxLength(64) ] ],
    usuario: [ this.loggedUserData, [ Validators.required ] ]
  });

  /**
   * Constructor del componente add-product
   * 
   * @param firestoreService Servicio para realizar consultas de CRUD a las colecciones de BD 
   * @param activatedRoute Constructor para recoger parametros de la url
   * @param firebaseauthService Servicio que utiliza métodos de autenticación
  */
  constructor(
    private firestoreService: FirestoreService,
    private activatedRoute: ActivatedRoute,
    private firebaseauthService: AuthService, 
    private modalService: NgbModal,
    private fb: FormBuilder
  ) { }

   /**
   * Realiza las primeras acciones al cargar el componente
   * 
   * @returns {Promise<void>} Obtiene el uid del usuario y el
   * id del pedido
   */
  async ngOnInit() {
    this.uid = await this.firebaseauthService.getUid();

    this.activatedRoute.params
    .subscribe({
      next: ({ id }) => {
        this.loadPolicies();
        this.cargarPedido(id);
        this.loadUserData();
      },
      error: (e) => {
        return Swal.fire('Error', 'Error al procesar los datos, por favor intente nuevamente.', 'error' );
      },
      complete: () => console.log()
    });
  }

  loadPolicies(): void {
    const unsubscribe = this.firestoreService.getCollectionAll<PoliticaDeDevoluciones>('PoliticaDeDevoluciones/').subscribe({
      next: (res) => {
        if(res.length > 0){
          this.shippingAndReturnPolicies = res[0];
        }
        this.loadingPolicies = false;
        unsubscribe.unsubscribe();
      },
      error: (e) => {
        console.log(e);
        return Swal.fire('Error', 'Error al cargar datos, por favor intente nuevamente.', 'error' );
      },
      complete: () => console.log()
    });
  }

  loadUserData() {
    if(this.uid !== null){
      const unsubscribe = this.firestoreService.getDoc<Usuario>('Usuarios', this.uid).subscribe({
        next: (res) => {
          this.loggedUserData = res;
          this.saveCommentForm.patchValue({ usuario: res });
          this.uploadedUserData = true;
          unsubscribe.unsubscribe();
        },
        error: (e) => {
          return Swal.fire('Error', 'Error al cargar datos, por favor intente nuevamente.', 'error' );
        },
        complete: () => console.log()
      });
    }
  }

   /**
   *  Carga los detalles del pedido seleccionado
   *
   * @param id el identificador del pedido a mostrar
   * @returns void.
   */
  cargarPedido(id: string) {
    const path = `Ventas/`;
    const desuscribir = this.firestoreService.getDoc<any>(path, id).subscribe({
      next: (res) => {
        this.pedido = res;
        this.getTotal();
        this.charging = false;
        desuscribir.unsubscribe();
      },
      error: (e) => {
        return Swal.fire('Error', 'Error al cargar los datos, por favor intente nuevamente.', 'error' );
      },
      complete: () => console.log()
    });
  }

  
  /**
   *  Obtiene el costo total de todos los productos
   * comprados
   * 
   * @returns void.
   */
  getTotal() {
    this.total = 0;
    this.pedido.productos.forEach(producto => {
      this.total = (producto.producto.precioNormal - (producto.producto.precioNormal*(producto.producto.precioReducido/100))) * producto.cantidad + this.total;
    });   
  }

  /**
 *  Muestra el modal
 *
 * @param content1 el identificador para abril un modal.
 * @returns void.
 */
  openModal(content1: string, product: ProductoPedido) {
    if(product !== null && product !== undefined) {
      this.product = product;
      this.currentRate = 1;
      this.verifyProduct(product.producto.id);
    }
    this.modalService.open(content1, { ariaLabelledBy: 'modal-basic-title', size: 'xl' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }
    
    /**
   *  Cierra el modal
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


  verifyProduct(id: string){
    this.verifyingProduct = true;
    const unsubscribe = this.firestoreService.getDoc<Producto>('Productos/', id).subscribe({
      next: (resp) => {
        if( resp === undefined ){
          this.theProductExists = false;
        }else{
          this.theProductExists = true;
        }
        this.verifyingProduct = false;
        unsubscribe.unsubscribe();
      },
      error: (e) => {
        return Swal.fire('Error', 'Error al cargar datos, por favor intente nuevamente.', 'error' );
      },
      complete: () => console.log()
    });
  }

  saveRating(){
    const productId = this.product.producto.id;
    const unsubscribe = this.firestoreService.getDoc<Producto>('Productos/', productId).subscribe({
      next: (resp) => {
        if(resp !== undefined){
          const sample_size = resp.tamanoDeLaMuestra + 1;
          const total_sign_of_the_sample = resp.totalDeLaMuestra + this.currentRate;
          const resultAverage = total_sign_of_the_sample / sample_size;
          const data = {
            tamanoDeLaMuestra: sample_size,
            totalDeLaMuestra: total_sign_of_the_sample,
            promedio: resultAverage
          };
          const item = this.pedido.productos.find( productoPedido => {
            return (productoPedido.producto.id === productId)
          });
          if (item !== undefined) {
            item.calificado = true;
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
          this.firestoreService.updateDoc<Producto>(data, 'Productos/', productId).then( () => {
            this.firestoreService.createDoc(this.pedido, 'Ventas/', this.pedido.id).then( () => {
              Swal.fire({
                icon: 'success',
                title: 'Calificación guardada con éxito'
              });
            });
          }).catch( error => {
            console.log(error);
          });
        }
        unsubscribe.unsubscribe();
      },
      error: (e) => {
        return Swal.fire('Error', 'Error al cargar datos, por favor intente nuevamente.', 'error' );
      },
      complete: () => console.log()
    });
  }

  saveComment(){

    const currentDate = new Date();
    const commentId = this.firestoreService.getId();

    this.formSubmitted = true;
    this.saveCommentForm.patchValue({ id: commentId });
    this.saveCommentForm.patchValue({ productId: this.product.producto.id });
    this.saveCommentForm.patchValue({ fecha: currentDate });

    if(this.saveCommentForm.invalid || !this.uploadedUserData){
      return;
    }

    Swal.fire({
      title: 'Guardando Comentario',
      html: 'Por favor espera un momento...',
      showCancelButton: false,
      showConfirmButton: false,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading()
      }
    });

    const item = this.pedido.productos.find( productoPedido => {
      return (productoPedido.producto.id === this.product.producto.id)
    });
    if (item !== undefined) {
      item.comentado = true;
    }

    const res = this.firestoreService.createDoc<Producto>(this.saveCommentForm.value, 'Comentarios', commentId).then( () => { 
      this.saveCommentForm.patchValue({ texto: '' });
      this.formSubmitted = false;
      this.firestoreService.createDoc(this.pedido, 'Ventas/', this.pedido.id).then( () => {
        Swal.fire({
          icon: 'success',
          title: 'Comentario guardado con exito!!'
        }); 
      });
    }).catch( error => { 
      return Swal.fire('Error', 'Error al cargar datos, por favor intente nuevamente.', 'error' );
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
    
    if ( this.saveCommentForm.get(field)!.invalid && this.formSubmitted ) {
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
  getErrorMessage(field: string): string {
    let message = '';
    if(this.saveCommentForm.get(field)!.hasError('required')){
      message = 'Este campo es requerido';
    }else if(this.saveCommentForm.get(field)!.hasError('minlength')){
      const minLength = this.saveCommentForm.get(field)!.errors?.minlength.requiredLength;
      message = `Este campo debe tener un minimo de ${minLength} caracteres`;
    }else if(this.saveCommentForm.get(field)!.hasError('maxlength')){
      const maxLength = this.saveCommentForm.get(field)!.errors?.maxlength.requiredLength;
      message = `Este campo debe tener un máximo de ${maxLength} caracteres`;
    }
    return message;
  }

}
