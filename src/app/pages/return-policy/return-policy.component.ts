import { Component, OnInit } from '@angular/core';

import { FormBuilder, Validators } from '@angular/forms';
import { FirestoreService } from '../../services/firestore.service';
import { PoliticaDeDevoluciones } from "../../models/models";
import Swal from 'sweetalert2';

@Component({
  selector: 'app-return-policy',
  templateUrl: './return-policy.component.html',
  styleUrls: ['./return-policy.component.scss']
})
export class ReturnPolicyComponent implements OnInit {

  public formSubmitted = false;
  public shippingAndReturnPolicies: PoliticaDeDevoluciones;
  private arethereDocuments: boolean = false;

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

  public returnPolicyForm = this.fb.group({ 
    id: ['', [ Validators.required, Validators.minLength(5), Validators.maxLength(32) ] ],
    descripcion: ['', [ Validators.required, Validators.maxLength(20000) ] ],
    fecha: ['', [ Validators.required ] ]
  });

  constructor(
    private fb: FormBuilder,
    public firestoreService: FirestoreService
  ) { }

  ngOnInit(): void {
    this.uploadReturnPolicy();
  }

  uploadReturnPolicy(): void {
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
    const unsubscribe = this.firestoreService.getCollectionAll<PoliticaDeDevoluciones>('PoliticaDeDevoluciones/').subscribe({
      next: (res) => {
        if(res.length > 0){
          this.shippingAndReturnPolicies = res[0];
          this.arethereDocuments = true;
          this.returnPolicyForm.setValue(this.shippingAndReturnPolicies);
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


  saveReturnPolicy(): void {
    const currentDate = new Date();
    const documentId = this.firestoreService.getId();

    this.formSubmitted = true;
    if(!this.arethereDocuments){
      this.returnPolicyForm.patchValue({ id: documentId });
    }
    this.returnPolicyForm.patchValue({ fecha: currentDate });

    if(this.returnPolicyForm.invalid){
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
      this.firestoreService.createDoc<PoliticaDeDevoluciones>(this.returnPolicyForm.value, 'PoliticaDeDevoluciones/', documentId).then( res => { 
        this.formSubmitted = false;
        this.arethereDocuments = true;
        this.shippingAndReturnPolicies = this.returnPolicyForm.value;
        Swal.fire({
          icon: 'success',
          title: 'Política de devoluciones guardada con éxito'
        }); 
      }).catch( error => { 
        console.log(error);
      });
    }else{
      this.firestoreService.updateDoc<PoliticaDeDevoluciones>(this.returnPolicyForm.value, 'PoliticaDeDevoluciones/', this.shippingAndReturnPolicies.id).then( res => {
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
  
    if ( this.returnPolicyForm.get(field)!.invalid && this.formSubmitted ) {
      return true;
    } else {
      return false;
    }

  }
  

  getErrorMessage(field: string): string{

    let message = '';
    if(this.returnPolicyForm.get(field)!.hasError('required')){
      message = 'Este campo es requerido';
    }else if(this.returnPolicyForm.get(field)!.hasError('maxlength')){
      const maxLength = this.returnPolicyForm.get(field)!.errors?.maxlength.requiredLength;
      message = `Este campo debe tener un máximo de ${maxLength} caracteres`;
    }else if(this.returnPolicyForm.get(field)!.hasError('maxlength')){
      message = `Alcanzaste el máximo de caracteres permitidos`;
    }

    return message;
  }

}
