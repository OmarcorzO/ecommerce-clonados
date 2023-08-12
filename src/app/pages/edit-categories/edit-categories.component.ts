import { Component, OnInit } from '@angular/core';
import { FirestoreService } from "../../services/firestore.service";
import { Categoria } from '../../models/models';
import { FormBuilder, Validators } from '@angular/forms';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';

import { FirestorageService } from 'src/app/services/firestorage.service';
import { AngularFireStorage } from '@angular/fire/compat/storage';

@Component({
  selector: 'app-edit-categories',
  templateUrl: './edit-categories.component.html',
  styleUrls: ['./edit-categories.component.scss']
})
export class EditCategoriesComponent implements OnInit {

  public charging: boolean = true;
  public charging2: boolean = true;
  public uploadedImage: boolean = false;

  private path = 'Categorias/';
  public formSubmitted = false; 
  public categories: Categoria[] = [];

  public limit: number = 8;
  public reiniciarLimit: boolean = false;
  cpageSize = 8;

  public actualPage: number = 1;

  private nextPage: boolean = true;
  private endBefore: any = null;

  public thereIsNoNextPage: boolean = false;
  public noPreviousPage: boolean = true;
  public noPreviousPage2: boolean = true;

  public firstDocument: any = null;
  public lastDocument: any = null;

  public thereArePublications: boolean = true;

  public totalProductos: number = 0;

  public validImageExtension: boolean = true;
  public allowedFileSize: boolean = true;

  newFile: any;
  public tempImg: any = null;

  closeResult = '';

  public editCategoryForm = this.fb.group({ 
    id: ['', [ Validators.required, Validators.minLength(5), Validators.maxLength(32) ] ],
    nombre: ['', [ Validators.required, Validators.minLength(4), Validators.maxLength(40) ] ],
    fecha: ['', [ Validators.required ] ],
    foto: ['', [ Validators.minLength(3)] ],
  });

  constructor(
    public firestoreService: FirestoreService, 
    private fb: FormBuilder,
    public firestorageService: FirestorageService,
    public storage: AngularFireStorage,
    private modalService: NgbModal
  ) { }

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories() {
    this.charging = true;
    this.charging2 = true;
    this.thereArePublications = true;
    let startAt = null;
    if (this.categories.length && !this.reiniciarLimit) {
        startAt = this.categories[this.categories.length - 1].fecha || null;
        this.endBefore = this.categories[0].fecha;
    }else if(this.reiniciarLimit){
      //Esto es para cuando se seleccione un limite diferente de datos se comienze desde el cero
      startAt = null;
    }

    if(this.nextPage){
      const desuscribir = this.firestoreService.getCollection<Categoria>(this.path, this.limit, startAt).subscribe({
        next: (resp) => {
          this.charging = false;
          this.categories = resp;
          if(!this.reiniciarLimit){
            this.noPreviousPage = false;
          }
          if(resp.length == 0){
            this.thereArePublications = false;
          }else{
            startAt = this.categories[this.categories.length - 1].fecha || null;
          }
          const desuscribir2 = this.firestoreService.getCollection<Categoria>(this.path, 1, startAt).subscribe({
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
      const desuscripcion = this.firestoreService.getCollectionPreviousPage<Categoria>(this.path, this.limit, this.endBefore).subscribe({
        next: (resp) => {
          this.charging = false;
          this.categories = resp;
          this.endBefore = this.categories[0].fecha;
          this.thereIsNoNextPage = false;
          desuscripcion.unsubscribe();
          const desuscripcion2 = this.firestoreService.getCollectionPreviousPage<Categoria>(this.path, 1, this.endBefore).subscribe({
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

    /**
   *  Navega hacia la página siguiente de productos.
   *
   * @returns void.
   */
  nextPageP(){
    this.nextPage = true;
    this.noPreviousPage2 = false;
    this.loadCategories();
  }

    /**
   *  Navega hacia la página anterior de productos.
   *
   * @returns void.
   */
  previousPage(){
    this.nextPage = false;
    this.loadCategories();
  }

    /**
   *  Cambia el límite de productos a mostrar.
   *
   * @param event el evento con las acciones para cambiar el limite.
   * @returns void.
   */
  onTableSizeChange(): void {
    this.limit = this.cpageSize;
    this.actualPage = 1;
    this.noPreviousPage = true;
    this.thereIsNoNextPage = false;
    this.nextPage = true;
    this.reiniciarLimit = true;
    this.loadCategories();
  }

    /**
   *  Actualiza los datos del producto seleccionado
   *
   * @returns void.
   */
  editCategory(): void{

    this.formSubmitted = true;

    if(this.editCategoryForm.invalid){
      return;
    }

    this.nextPage = true;
    this.thereIsNoNextPage = false;
    this.noPreviousPage2 = true;
    const path = 'Categorias';
    let name = this.editCategoryForm.get('id').value;
    const filePath = path + '/' + name;

    const categoryId = this.editCategoryForm.value.id;

    if (this.newFile !== undefined && this.validImageExtension && this.allowedFileSize) {

      Swal.fire({
        title: 'Estamos actualizando la categoría',
        html: 'Por favor espera un momento...',
        showCancelButton: false,
        showConfirmButton: false, 
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading()
        }
      });

      this.firestorageService.uploadImage(this.newFile, filePath)
      .then(()=>
      {
        const ref = this.storage.ref(filePath);
        const desuscribir = ref.getDownloadURL()
        .subscribe({
          next: (url) => {
            this.editCategoryForm.patchValue({foto:url});
            this.firestoreService.updateDoc<Categoria>(this.editCategoryForm.value, this.path, categoryId).then( res => {
        
              this.categories = [];
              this.loadCategories();
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
        title: 'Estamos actualizando la categoría',
        html: 'Por favor espera un momento...',
        showCancelButton: false,
        showConfirmButton: false, 
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading()
        }
      });

      this.firestoreService.updateDoc<Categoria>(this.editCategoryForm.value, this.path, categoryId).then( res => {
      
        this.categories = [];
        this.loadCategories();
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
   *  Elimina la categorìa seleccionada
   *
   * @param id el identificador de la categoría a eliminar
   * @param name el nombre de la categoría a eliminar.
   * @returns void.
   */
   deleteCategory( id: string, name: string ): void {
    Swal.fire({
      title: '¿Estás seguro de querer eliminar esta categoría?',
      text: `La categoría llamada ${ name } será eliminada`,
      icon: 'question',
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Si, estoy seguro'
    }).then((result) => {
      if (result.value) {

        Swal.fire({
          title: 'Estamos eliminando esta categoría!',
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
        const path = 'Categorias';
        const filePath = path + '/' + id;
        const ref = this.storage.ref(filePath);
        const unsubscribe = ref.delete().subscribe({
          next: () => {
            unsubscribe.unsubscribe();
          },
          error: (e) => {
            console.log(e);
            return Swal.fire('Error', 'Error al cargar datos, por favor intente nuevamente.', 'error' );
          },
          complete: () => console.log()
        });
        
        this.firestoreService.deleteDoc<Categoria>(this.path, id).then( res => {
          
          Swal.fire({
            icon: 'success',
            title: 'Categoría eliminada correctamente'
          });

          this.categories = [];
          this.loadCategories();

        }).catch( error => {
          Swal.fire('Error', "Error, por favor intenta nuevamente", 'error');
        });

      }
    })
  }

    /**
   *  Muestra el modal para actualizar un producto.
   *
   * @param content1 el identificador para abril un modal.
   * @param producto el objeto con todos los datos de un producto.
   * @returns void.
   */
     openModal(content1: string, category: Categoria) {
      const { id, nombre, fecha, foto } = category;
      this.editCategoryForm.setValue({ id, nombre, fecha, foto });
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
      
      if ( this.editCategoryForm.get(field)!.invalid && this.formSubmitted ) {
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

      if(this.editCategoryForm.get(field)!.hasError('required')){
        message = 'Este campo es requerido';
      }else if(this.editCategoryForm.get(field)!.hasError('minlength')){
        const minLength = this.editCategoryForm.get(field)!.errors?.minlength.requiredLength;
        message = `Este campo debe tener un minimo de ${minLength} caracteres`;
      }else if(this.editCategoryForm.get(field)!.hasError('maxlength')){
        const maxLength = this.editCategoryForm.get(field)!.errors?.maxlength.requiredLength;
        message = `Este campo debe tener un maximo de ${maxLength} caracteres`;
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
