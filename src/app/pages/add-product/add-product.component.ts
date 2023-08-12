import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';
import { FirestoreService } from '../../services/firestore.service';
import { AuthService } from "../../services/auth.service";
import { Categoria, Producto } from '../../models/models';
import { Usuario } from "../../models/models";

import { FirestorageService } from 'src/app/services/firestorage.service';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add-product',
  templateUrl: './add-product.component.html',
  styleUrls: ['./add-product.component.scss']
})
export class AddProductComponent implements OnInit {

  public formSubmitted = false;
  public charging: boolean = false;
  
  public uid: string = '';
  public imageUpload!: File;

  public tempImg: any = null;

  private path = 'Productos/';
  newProducto: Producto;

  public allCategories: any[] = [];

  public validImageExtension: boolean = true;
  public allowedFileSize: boolean = true;

  newImage = ''; 
  newFile: any;
  public fotoCargada: boolean = true;

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

  clienteVista: Usuario = {
    uid: '',
    correo: '',
    nombre: '',
    contrasena: '',
    img: '',
    ciudad: '',
    direccion: '',
    cedula: '',
    telefono: '',
    terminos: false,
    fecha: new Date,
  };

  public saveProductForm = this.fb.group({ 
    id: ['', [ Validators.required, Validators.minLength(5), Validators.maxLength(32) ] ],
    nombre: ['', [ Validators.required, Validators.minLength(5), Validators.maxLength(100) ] ],
    descripcion: ['', [ Validators.required, Validators.maxLength(20000) ] ],
    categoria: ['', [ Validators.required, Validators.minLength(4), Validators.maxLength(32) ] ],
    precioNormal: ['', [ Validators.required, Validators.minLength(3), Validators.maxLength(11) ] ],
    stock: ['', [ Validators.min(1), Validators.required ] ],
    precioReducido: ['', [ Validators.minLength(1), Validators.maxLength(11) ] ],
    fecha: ['', [ Validators.required ] ],
    foto: ['', [ Validators.minLength(3)] ],
    visitas: [0, [] ],
    totalDeLaMuestra: [0, [] ],
    tamanoDeLaMuestra: [0, [] ],
    promedio: [0, [] ],
    usuario: [ this.clienteVista, [ Validators.required ] ]
  });

     /**
   * Constructor del componente add-product
   * 
   * @param fb Constructor de formularios
   * @param auth_service Servicio que utiliza métodos de autenticación
   * @param firestoreService Servicio para realizar consultas de CRUD a las colecciones de BD 
   * @param firestorageService Servicio para montar imagenes de firebase
   * @param storage Servicio de angular que integra el funcionamiento de subir imagenes
   * @param router Constructor para el funcionamiento de las rutas
   */
  constructor(
    private fb: FormBuilder,
    public auth_service: AuthService, 
    public firestoreService: FirestoreService,
    public firestorageService: FirestorageService,
    public storage: AngularFireStorage,
    private router: Router
  ) { }


      /**
   * Realiza las primeras acciones al cargar
   * el componente
   * 
   * @returns {Promise<void>} Obtiene el uid del usuario y llena
   * el objeto clienteVista con los datos del usuario logueado
   */
  async ngOnInit() {
    Swal.fire({
      title: 'Cargando',
      html: 'Por favor espera un momento...',
      showCancelButton: false,
      showConfirmButton: true, 
      allowOutsideClick: false,
      didOpen: () => {
      Swal.showLoading()
      }
    }); 

    this.uid = await this.auth_service.getUid();
    const desuscribir = this.firestoreService.getDoc<Usuario>('Usuarios', this.uid).subscribe({
      next: (res) => {
        this.clienteVista = res;
        const unsubscribe = this.firestoreService.getCollectionAll<Categoria>('Categorias').subscribe({
          next: (resp) => {
            const result = resp.map( (category: Categoria) => ({ category: category.nombre }));
            this.allCategories = result;
            Swal.close();
            unsubscribe.unsubscribe();
          },
          error: (e) => {
            return Swal.fire('Error', 'Error al cargar datos, por favor intente nuevamente.', 'error' );
          },
          complete: () => console.log()
        });
        desuscribir.unsubscribe();
      },
      error: (e) => {
        return Swal.fire('Error', 'Error al cargar datos, por favor intente nuevamente.', 'error' );
      },
      complete: () => console.log()
    });  
  }

  
   /**
   * Guarda un producto nuevo en la
   * base de datos de la aplicación
   * 
   * @returns {Promise<void>}
   */
  async guardarProducto(){
    if ( this.validImageExtension && this.allowedFileSize ) {
      this.saveProductForm.patchValue({ usuario: this.clienteVista });

      const fechaActual = new Date();
      
      this.charging = true;
      const idProduct = this.firestoreService.getId();
  
      this.formSubmitted = true;
      this.saveProductForm.patchValue({ id: idProduct });
      this.saveProductForm.patchValue({ fecha: fechaActual });
  
      if(this.saveProductForm.invalid){
        console.log(this.saveProductForm);
        return;
      }
  
      const path = 'Productos';
      const filePath = path + '/' + idProduct;
      if (this.newFile !== undefined) {
  
        Swal.fire({
          title: 'Estamos guardando tu nuevo producto!',
          html: 'Por favor espera un momento...',
          showCancelButton: false,
          showConfirmButton: false, 
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading()
          }
        });
  
        if(this.saveProductForm.value.precioReducido == ''){
          this.saveProductForm.patchValue({ precioReducido: 0 });
        }
        const precioOriginal = parseInt(this.saveProductForm.value.precioNormal);
        this.saveProductForm.patchValue({ precioNormal: precioOriginal });
        const descuento = parseInt(this.saveProductForm.value.precioReducido);
        this.saveProductForm.patchValue({ precioReducido: descuento });
        const stock = parseInt(this.saveProductForm.value.stock);
        this.saveProductForm.patchValue({ stock: stock });
  
        this.firestorageService.uploadImage(this.newFile, filePath)
        .then(()=>
        {
          const ref = this.storage.ref(filePath);
          const desuscribir = ref.getDownloadURL()
          .subscribe({
            next: (url) => {
              this.saveProductForm.patchValue({foto:url});
              const res = this.firestoreService.createDoc<Producto>(this.saveProductForm.value, this.path, idProduct).then( res => { 
                this.charging = false;
                this.router.navigate(['/dashboard/ver-productos']);
                Swal.fire({
                  icon: 'success',
                  title: 'Producto guardado con exito!!'
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
      }else{
        Swal.fire('Error', "Debes seleccionar una foto para el producto", 'error');
      }
    } else {
      if( !this.validImageExtension ){
        Swal.fire('Error', "Formato de imagen no válido", 'error');
      }else{
        Swal.fire('Error', "Tamaño de imagen no válido. La imagen no puede pesar mas de 5mb", 'error');
      }
    }
  }

  checkImageExtension( file: File ){

    const cutName = file.name.split('.'); // wolverine.1.3.jpg
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
      this.fotoCargada = true;
    } else {
      this.newFile = undefined;
      this.tempImg = null;
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
    
    if ( this.saveProductForm.get(field)!.invalid && this.formSubmitted ) {
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
    if(this.saveProductForm.get(field)!.hasError('required')){
      message = 'Este campo es requerido';
    }else if(this.saveProductForm.get(field)!.hasError('minlength')){
      const minLength = this.saveProductForm.get(field)!.errors?.minlength.requiredLength;
      message = `Este campo debe tener un minimo de ${minLength} caracteres`;
    }else if(this.saveProductForm.get(field)!.hasError('maxlength') && field !== 'descripcion' ){
      const maxLength = this.saveProductForm.get(field)!.errors?.maxlength.requiredLength;
      message = `Este campo debe tener un máximo de ${maxLength} caracteres`;
    }else if(this.saveProductForm.get(field)!.hasError('maxlength') && field === 'descripcion'){
      message = `Alcanzaste el máximo de caracteres permitidos`;
    }else if(this.saveProductForm.get(field)!.hasError('pattern')){
      message = 'Este campo solo acepta números';
    }

    return message;
  }

}