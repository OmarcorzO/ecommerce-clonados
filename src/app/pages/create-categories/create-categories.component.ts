import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';

import { FirestoreService } from '../../services/firestore.service';
import { FirestorageService } from 'src/app/services/firestorage.service';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { Categoria } from '../../models/models';

import Swal from 'sweetalert2';

@Component({
  selector: 'app-create-categories',
  templateUrl: './create-categories.component.html',
  styleUrls: ['./create-categories.component.scss']
})
export class CreateCategoriesComponent implements OnInit {

  public formSubmitted = false;
  public imageUpload!: File;

  public tempImg: any = null;

  private path = 'Categorias/';

  alerta_roja = false;

  public validImageExtension: boolean = true;
  public allowedFileSize: boolean = true;

  newImage = ''; 
  newFile: any;
  public photoUploaded: boolean = true;

  public saveCategoryForm = this.fb.group({ 
    id: ['', [ Validators.required, Validators.minLength(5), Validators.maxLength(32) ] ],
    nombre: ['', [ Validators.required, Validators.minLength(4), Validators.maxLength(40) ] ],
    fecha: ['', [ Validators.required ] ],
    foto: ['', [ Validators.minLength(3)] ],
  });

  constructor(
    private fb: FormBuilder,
    private firestoreService: FirestoreService,
    private firestorageService: FirestorageService,
    private storage: AngularFireStorage,
    private router: Router
  ) { }

  ngOnInit(): void {
  }

  saveCategory(){

    if ( this.validImageExtension && this.allowedFileSize ) {

      const currentDate = new Date();
      const categoryId = this.firestoreService.getId();
  
      this.formSubmitted = true;
      this.saveCategoryForm.patchValue({ id: categoryId });
      this.saveCategoryForm.patchValue({ fecha: currentDate });
  
      if(this.saveCategoryForm.invalid){
        return;
      }
  
      const path = 'Categorias';
      const filePath = path + '/' + categoryId;
      if (this.newFile !== undefined) {
  
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
  
        this.firestorageService.uploadImage(this.newFile, filePath)
        .then(()=>
        {
          const ref = this.storage.ref(filePath);
          const desuscribir = ref.getDownloadURL()
          .subscribe({
            next: (url) => {
              this.saveCategoryForm.patchValue({foto:url});
              const res = this.firestoreService.createDoc<Categoria>(this.saveCategoryForm.value, this.path, categoryId).then( res => { 
                this.router.navigate(['/dashboard/ver-categorias']);
                Swal.fire({
                  icon: 'success',
                  title: 'Categoría guardada con exito!!'
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
        Swal.fire('Error', "Debes seleccionar una foto para la categoría", 'error');
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
      this.photoUploaded = true;
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
    
      if ( this.saveCategoryForm.get(field)!.invalid && this.formSubmitted ) {
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
      if(this.saveCategoryForm.get(field)!.hasError('required')){
        message = 'Este campo es requerido';
      }else if(this.saveCategoryForm.get(field)!.hasError('minlength')){
        const minLength = this.saveCategoryForm.get(field)!.errors?.minlength.requiredLength;
        message = `Este campo debe tener un minimo de ${minLength} caracteres`;
      }else if(this.saveCategoryForm.get(field)!.hasError('maxlength')){
        const maxLength = this.saveCategoryForm.get(field)!.errors?.maxlength.requiredLength;
        message = `Este campo debe tener un maximo de ${maxLength} caracteres`;
      }else if(this.saveCategoryForm.get(field)!.hasError('pattern')){
        message = 'Este campo solo acepta números';
      }
  
      return message;
    }

}
