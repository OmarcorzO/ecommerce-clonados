import { Component, OnInit } from '@angular/core';

import { FormBuilder, Validators } from '@angular/forms';
import { FirestoreService } from '../../services/firestore.service';
import { InfoDeContacto } from '../../models/models';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-contact-information',
  templateUrl: './contact-information.component.html',
  styleUrls: ['./contact-information.component.scss']
})
export class ContactInformationComponent implements OnInit {

  public formSubmitted = false;
  public contactInformation: InfoDeContacto;
  private arethereDocuments: boolean = false;


  public contactInfoForm = this.fb.group({ 
    id: ['', [ Validators.required, Validators.minLength(5), Validators.maxLength(32) ] ],
    direccion: ['', [ Validators.required, Validators.minLength(7), Validators.maxLength(30) ] ],
    telefono: ['', [ Validators.required, Validators.minLength(7), Validators.maxLength(10) ] ],
    correo: ['', [ Validators.required, Validators.email, Validators.pattern(/^[a-zA-Z0-9\.\_\-]+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/) ] ],
    instagram: ['', [ Validators.minLength(10), Validators.maxLength(400) ] ],
    facebook: ['', [ Validators.minLength(10), Validators.maxLength(400) ] ],
    whatsapp: ['', [ Validators.minLength(10), Validators.maxLength(400) ] ],
    twitter: ['', [ Validators.minLength(10), Validators.maxLength(400) ] ],
    youtube: ['', [ Validators.minLength(10), Validators.maxLength(400) ] ],
    fecha: ['', [ Validators.required ] ],
  });

  constructor(
    private fb: FormBuilder,
    public firestoreService: FirestoreService
  ) { }

  ngOnInit(): void {
    this.uploadContactInformation();
  }


  uploadContactInformation(): void {
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
    const unsubscribe = this.firestoreService.getCollectionAll<InfoDeContacto>('InfoDeContacto/').subscribe({
      next: (res) => {
        if(res.length > 0){
          this.contactInformation = res[0];
          this.arethereDocuments = true;
          this.contactInfoForm.setValue(this.contactInformation);
        }
        Swal.close();
        unsubscribe.unsubscribe();
      },
      error: (e) => {
        console.log(e);
        return Swal.fire('Error', 'Error al cargar datos, por favor intente nuevamente.', 'error' );
      },
      complete: () => console.log()
    });
  }


  saveContactInformation(): void {
    const currentDate = new Date();
    const dataId = this.firestoreService.getId();

    this.formSubmitted = true;
    if(!this.arethereDocuments){
      this.contactInfoForm.patchValue({ id: dataId });
    }
    this.contactInfoForm.patchValue({ fecha: currentDate });

    if(this.contactInfoForm.invalid){
      return;
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

    if(!this.arethereDocuments){
      this.firestoreService.createDoc<InfoDeContacto>(this.contactInfoForm.value, 'InfoDeContacto/', dataId).then( res => { 
        this.formSubmitted = false;
        this.arethereDocuments = true;
        this.contactInformation = this.contactInfoForm.value;
        Swal.fire({
          icon: 'success',
          title: 'Información de contacto guardada con éxito'
        }); 
      }).catch( error => { 
        console.log(error);
      });
    }else{
      this.firestoreService.updateDoc<InfoDeContacto>(this.contactInfoForm.value, 'InfoDeContacto/', this.contactInformation.id).then( res => {
        this.formSubmitted = false;
        Swal.fire({
          icon: 'success',
          title: 'Actualización exitosa!!'
        });
      }).catch( error => {
        console.log(error);
      });
    }
  }

  invalidField( field: string ): boolean {
  
    if ( this.contactInfoForm.get(field)!.invalid && this.formSubmitted ) {
      return true;
    } else {
      return false;
    }

  }
  
  getErrorMessage(field: string): string{
    let message = '';
    if(this.contactInfoForm.get(field)!.hasError('required')){
      message = 'Este campo es requerido';
    }else if(this.contactInfoForm.get(field)!.hasError('minlength')){
      const minLength = this.contactInfoForm.get(field)!.errors?.minlength.requiredLength;
      message = `Este campo debe tener un minimo de ${minLength} caracteres`;
    }else if(this.contactInfoForm.get(field)!.hasError('maxlength') ){
      const maxLength = this.contactInfoForm.get(field)!.errors?.maxlength.requiredLength;
      message = `Este campo debe tener un máximo de ${maxLength} caracteres`;
    }else if(this.contactInfoForm.get(field)!.hasError('pattern')){
      message = 'Debes introducir un correo electrónico válido';
    }

    return message;
  }

}
