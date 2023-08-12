import { Component, OnInit } from '@angular/core';
import { AuthService } from "../../services/auth.service";
import { FirestoreService } from "../../services/firestore.service";
import { Usuario } from "../../models/models";
import { Categoria, Producto } from '../../models/models';
import { FormBuilder, Validators } from '@angular/forms';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';

import { FirestorageService } from 'src/app/services/firestorage.service';
import { AngularFireStorage } from '@angular/fire/compat/storage';


@Component({
  selector: 'app-my-products',
  templateUrl: './my-products.component.html',
  styleUrls: ['./my-products.component.scss']
})
export class MyProductsComponent implements OnInit { 

  public uid: string = '';
  private path = 'Productos/';
  
  public formSubmitted = false;  
  public charging: boolean = true;
  public charging2: boolean = true;
  public limit: number = 8;
  cpageSize = 8;

  public reiniciarLimit: boolean = false;
  public tableSizes = [8, 16, 50, 100];

  public pageActual: number = 1;
  public pageActualTemp: number = 1;
  public pageActualTemp2: number = 1;

  private nextPage: boolean = true;
  private endBefore: any = null;

  public thereIsNoNextPage: boolean = false;
  public noPreviousPage: boolean = true;
  public noPreviousPage2: boolean = true;

  newFile: any;
  public tempImg: any = null;

  closeResult = '';

  public totalProductos: number = 0;

  public productos: Producto[] = [];
  public allCategories: any[] = [];

  public thereArePublications: boolean = true;

  public validImageExtension: boolean = true;
  public allowedFileSize: boolean = true;

  clienteVista: Usuario = {
    uid: '',
    img: '',
    correo: '',
    nombre: '',
    contrasena: '',
    ciudad: '',
    direccion: '',
    cedula: '',
    telefono: '',
    terminos: false,
    fecha: new Date,
  };

  public modulesQuill = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      [{ font: [] }],
      [{ color: [] }, { background: [] }],
      [{ size: ['small', false, 'large'] }],
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      [{ align: [] }],
      ['blockquote', 'code-block'],
      [{ list: 'ordered'}, { list: 'bullet' }],
      ['clean'],
    ]
  };

  public editProductForm = this.fb.group({ 
    id: ['', [ Validators.required, Validators.minLength(5), Validators.maxLength(32) ] ],
    nombre: ['', [ Validators.required, Validators.minLength(5), Validators.maxLength(100) ] ],
    descripcion: ['', [ Validators.required, Validators.maxLength(20000) ] ],
    categoria: ['', [ Validators.required, Validators.minLength(4), Validators.maxLength(32) ] ],
    precioNormal: ['', [ Validators.required, Validators.minLength(3), Validators.maxLength(11)  ] ],
    precioReducido: ['', [  Validators.minLength(1), Validators.maxLength(11) ] ],
    stock: ['', [ Validators.required, Validators.min(0)] ],
    fecha: ['', [ Validators.required ] ],
    foto: ['', [Validators.minLength(3)] ], 
    usuario: [ this.clienteVista, [ Validators.required ] ]
  });

   /**
   * Constructor del componente my-products
   * 
   * @param authService Servicio que utiliza métodos de autenticación
   * @param firestoreService Servicio para realizar consultas de CRUD a las colecciones de BD 
   * @param fb Constructor de formularios
   * @param firestorageService Servicio para montar imagenes de firebase
   * @param storage Servicio de angular que integra el funcionamiento de subir imagenes
   * @param modalService Constructor para el funcionamiento de los modales
   */
  constructor(
    public auth_service: AuthService, 
    public firestoreService: FirestoreService, 
    private fb: FormBuilder,
    public firestorageService: FirestorageService,
    public storage: AngularFireStorage,
    private modalService: NgbModal
  ) { }

    /**
   * Realiza las primeras acciones al cargar
   * el componente
   * 
   * @returns {Promise<void>} Obtiene el uid del usuario y 
   * llena el objeto clienteVista con los datos del usuario
   * logueado
   */
  async ngOnInit() {
    this.uid = await this.auth_service.getUid();
    const unsubscribe = this.firestoreService.getDoc<Usuario>('Usuarios', this.uid).subscribe({    
      next: (res) => {
        this.clienteVista = res;
        const unsubscribeTwo = this.firestoreService.getCollectionAll<Categoria>('Categorias').subscribe({
          next: (resp) => {
            const result = resp.map( (category: Categoria) => ({ category: category.nombre }));
            this.allCategories = result;
            this.cargarMisProductos();
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
  }

  /**
   *  Permite ver solamente los productos publicados
   *  del usuario que publico esos productos.
   *
   * @returns void.
   */
  cargarMisProductos(){
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
          const desuscribir = this.firestoreService.getMyProductsNextPage<Producto>(this.path, this.limit, startAt, this.uid).subscribe({
            next: (resp) => {
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
              const desuscribir2 = this.firestoreService.getMyProductsNextPage<Producto>(this.path, 1, startAt, this.uid).subscribe({
                next: (res) => {
                  this.charging2 = false;
                  if(res.length == 0){
                    this.thereIsNoNextPage = true;
                  }
                  desuscribir2.unsubscribe();
                },
                error: (e) => {
                  return Swal.fire('Error', 'Error al cargar datos, por favor intente nuevamente.', 'error' );
                },
                  complete: () => console.log()
              });
              desuscribir.unsubscribe();
              //Ponemos nuevamente el reiniciarLimit en false para poder paginar correctamente los resultados
              this.reiniciarLimit = false; 
            },
            error: (e) => {
              return Swal.fire('Error', 'Error al cargar datos, por favor intente nuevamente.', 'error' );
            },
            complete: () => console.log()
          });

    }else{
      const desuscripcion = this.firestoreService.getMyProductsPreviousPage<Producto>(this.path, this.limit, this.endBefore, this.uid).subscribe({
        next: (resp) => {
          this.charging = false;
          this.productos = resp;
          this.endBefore = this.productos[0].fecha;
          this.thereIsNoNextPage = false;
          desuscripcion.unsubscribe();
          const desuscripcion2 = this.firestoreService.getMyProductsPreviousPage<Producto>(this.path, 1, this.endBefore, this.uid).subscribe({
            next: (res) => {
              this.charging2 = false;
              if(res.length == 0){
                this.noPreviousPage = true;
              }
              desuscripcion2.unsubscribe();
            },
            error: (e) => {
              return Swal.fire('Error', 'Error al cargar datos, por favor intente nuevamente.', 'error' );
            },
            complete: () => console.log()
          });
        },
        error: (e) => {
          return Swal.fire('Error', 'Error al cargar datos, por favor intente nuevamente.', 'error' );
        },
        complete: () => console.log() 
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
   *  Actualiza los datos del producto seleccionado
   *
   * @returns void.
   */
  updateProduct(): void{

    this.formSubmitted = true;

    if(this.editProductForm.invalid){
      return;
    }

    this.nextPage = true;
    this.thereIsNoNextPage = false;
    this.noPreviousPage2 = true;
    const path = 'Productos';
    let name = this.editProductForm.get('id').value;
    const filePath = path + '/' + name;

    if(this.editProductForm.value.precioReducido == ''){
      this.editProductForm.patchValue({ precioReducido: 0 });
    }

    const idProduct = this.editProductForm.value.id;

    if (this.newFile !== undefined && this.validImageExtension && this.allowedFileSize) {

      Swal.fire({
        title: 'Estamos actualizando tu producto!',
        html: 'Por favor espera un momento...',
        showCancelButton: false,
        showConfirmButton: false, 
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading()
        }
      });

      const precioOriginal = parseInt(this.editProductForm.value.precioNormal);
      this.editProductForm.patchValue({ precioNormal: precioOriginal });
      const descuento = parseInt(this.editProductForm.value.precioReducido);
      this.editProductForm.patchValue({ precioReducido: descuento });
      const stock = parseInt(this.editProductForm.value.stock);
      this.editProductForm.patchValue({ stock: stock });
      

      this.firestorageService.uploadImage(this.newFile, filePath)
      .then(()=>
      {
        const ref = this.storage.ref(filePath);
        const desuscribir = ref.getDownloadURL()
        .subscribe({
          next: (url) => {
            this.editProductForm.patchValue({foto:url});
            this.firestoreService.updateDoc<Producto>(this.editProductForm.value, this.path, idProduct).then( res => {
        
              this.productos = [];
              this.cargarMisProductos();
              this.formSubmitted = false;
              this.newFile = undefined;
        
              Swal.fire({
                icon: 'success',
                title: 'Actualización exitosa!!'
              });
        
            }).catch( error => {
            });
            desuscribir.unsubscribe();
          },
          error: (e) => {
            return Swal.fire('Error', 'Error al cargar datos, por favor intente nuevamente.', 'error' );
          },
          complete: () => console.log()
        })
      });
    }else if( this.newFile === undefined && this.validImageExtension && this.allowedFileSize ){
      Swal.fire({
        title: 'Estamos actualizando tu producto!',
        html: 'Por favor espera un momento...',
        showCancelButton: false,
        showConfirmButton: false, 
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading()
        }
      });

      const precioOriginal = parseInt(this.editProductForm.value.precioNormal);
      this.editProductForm.patchValue({ precioNormal: precioOriginal });
      const descuento = parseInt(this.editProductForm.value.precioReducido);
      this.editProductForm.patchValue({ precioReducido: descuento });
      const stock = parseInt(this.editProductForm.value.stock);
      this.editProductForm.patchValue({ stock: stock });

      this.firestoreService.updateDoc<Producto>(this.editProductForm.value, this.path, idProduct).then( res => {
      
        this.productos = [];
        this.cargarMisProductos();
        this.formSubmitted = false;
  
        Swal.fire({
          icon: 'success',
          title: 'Actualización exitosa!!'
        });
  
      }).catch( error => {
      });
    }else{
      if( !this.validImageExtension ){
        Swal.fire('Error', "Formato de imagen no válido", 'error');
      }else{
        Swal.fire('Error', "Tamaño de imagen no válido. La imagen no puede pesar mas de 5mb", 'error');
      }
    }

  }

  /**
   *  Elimina el producto seleccionado
   *
   * @param id el identificador del producto a eliminar
   * @param name el nombre del producto a eliminar.
   * @returns void.
   */
  deleteProduct( id: string, name: string ): void {
    Swal.fire({
      title: '¿Estás seguro de querer eliminar este producto?',
      text: `El producto llamado ${ name } será eliminado`,
      icon: 'question',
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Si, estoy seguro'
    }).then((result) => {
      if (result.value) {

        Swal.fire({
          title: 'Estamos eliminando este producto!',
          html: 'Por favor espera un momento...',
          showCancelButton: false,
          showConfirmButton: false, 
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading()
          }
        });

        this.nextPage = true;
        this.thereIsNoNextPage = false;
        this.noPreviousPage2 = true;
        const path = 'Productos';
        const filePath = path + '/' + id;
        const ref = this.storage.ref(filePath);
        const unsubscribe = ref.delete().subscribe({
          next: () => {
            unsubscribe.unsubscribe();
          },
          error: (e) => {
            return Swal.fire('Error', 'Error al cargar datos, por favor intente nuevamente.', 'error' );
          },
          complete: () => console.log()
        });
        
        this.firestoreService.deleteDoc<Producto>(this.path, id).then( res => {
          
          Swal.fire({
            icon: 'success',
            title: 'Producto eliminado correctamente!!'
          });

          this.productos = [];
          this.cargarMisProductos();

        }).catch( error => {
            
        });

      }
    })
  }

  
  /**
   *  Navega hacia la página siguiente de productos.
   *
   * @returns void.
   */
  nextPageP(){
     this.nextPage = true;
     this.noPreviousPage2 = false;
     this.cargarMisProductos();
  }

  /**
   *  Navega hacia la página anterior de productos.
   *
   * @returns void.
   */
  previousPage(){
     this.nextPage = false;
     this.cargarMisProductos();
  }

  /**
   *  Cambia el límite de productos a mostrar.
   *
   * @param event el evento con los datos para cambiar el limite.
   * @returns void.
   */
  onTableSizeChange(): void {
    this.limit = this.cpageSize;
    this.pageActual = 1;
    this.noPreviousPage = true;
    this.thereIsNoNextPage = false;
    this.nextPage = true;
    this.reiniciarLimit = true;
    this.cargarMisProductos();
  }

  /**
   *  Muestra el modal para actualizar un producto.
   *
   * @param content1 el identificador para abril un modal.
   * @param producto el objeto con todos los datos de un producto.
   * @returns void.
   */
  openModal(content1: string, producto: any) {
    const { id, nombre, descripcion, categoria, precioNormal, precioReducido, stock, fecha, foto, usuario } = producto;
    this.editProductForm.setValue({ id, nombre, descripcion, categoria, precioNormal, precioReducido, stock, fecha, foto, usuario });
    this.tempImg = foto;

		this.modalService.open(content1, { ariaLabelledBy: 'modal-basic-title', size: 'lg' }).result.then((result) => {
			this.closeResult = `Closed with: ${result}`;
		}, (reason) => {
			this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
		});
	}

    /**
   *  Cierra el modal de editar los productos.
   *
   * @returns un string con un mensaje informativo.
   */
  private getDismissReason(reason: ModalDismissReasons): string {
    this.formSubmitted = false;
		if (reason === ModalDismissReasons.ESC) {
			return 'by pressing ESC';
		} else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
			return 'by clicking on a backdrop';
		} else {
			return `with: ${reason}`;
		}
	}

  /**
   * Valida si algún campo del formulario esta incorrecto.
   *
   * @param field el nombre del campo del formulario.
   * @returns un true si existe algún campo incorrecto en el formulario
   * o false si todo el formulario se encuentra correctamente diligenciado.
   */
  invalidField( field: string ): boolean {
    
    if ( this.editProductForm.get(field)!.invalid && this.formSubmitted ) {
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
      //.errors?.required
    if(this.editProductForm.get(field)!.hasError('required')){
      message = 'Este campo es requerido';
    }else if(this.editProductForm.get(field)!.hasError('minlength')){
      const minLength = this.editProductForm.get(field)!.errors?.minlength.requiredLength;
      message = `Este campo debe tener un minimo de ${minLength} caracteres`;
    }else if(this.editProductForm.get(field)!.hasError('maxlength') && field !== 'descripcion'){
      const maxLength = this.editProductForm.get(field)!.errors?.maxlength.requiredLength;
      message = `Este campo debe tener un maximo de ${maxLength} caracteres`;
    }else if(this.editProductForm.get(field)!.hasError('maxlength') && field === 'descripcion'){
      message = `Alcanzaste el máximo de caracteres permitidos`;
    }else if(this.editProductForm.get(field)!.hasError('pattern')){
      message = 'Este campo solo acepta números';
    }

    return message;
  }

  checkImageExtension( file: File ){

    const cutName = file.name.split('.');
    const fileExtension = cutName[cutName.length - 1];

    // Validar extension
    const validExtensions = ['png', 'jpg', 'jpeg', 'PNG', 'JPG', 'JPEG'];
    if (!validExtensions.includes(fileExtension)) {
        this.validImageExtension = false;
    } else {
        this.validImageExtension = true;
    }

  }

  checkFileSize( file: File ){

    if ( file.size > 5242880 ) {
        this.allowedFileSize = false;
    } else {
        this.allowedFileSize = true;
    }

  }

  /**
   * Captura la imagen elegida por el usuario
   * 
   * @param event el evento con los datos para poder
   * tener la imagen seleccionada.
   * @returns {Promise<void>} Captura la imagen seleccionada
   * por el usuario.
   */
  async newImageUpload(event: any) {

    this.checkImageExtension(event.target.files[0]);
    this.checkFileSize(event.target.files[0]);

    if (event.target.files && event.target.files[0] && this.validImageExtension && this.allowedFileSize) {
        this.newFile = event.target.files[0];
        const reader = new FileReader();
        reader.onload = ((image) => {
          const result = image.target.result as string;
        });
        reader.readAsDataURL(event.target.files[0]); 
        reader.onloadend = () => {
          this.tempImg = reader.result;
        }
    }

  }

}