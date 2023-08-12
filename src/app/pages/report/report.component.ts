import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';

import { AuthService } from "../../services/auth.service";
import { FirestoreService } from '../../services/firestore.service';
import { Usuario, Producto, Comentarios, Denuncia } from '../../models/models';

import Swal from 'sweetalert2';

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss']
})
export class ReportComponent implements OnInit {

  public loadingProduct: boolean = true;
  public loadingComment: boolean = true;
  public loadingUserData: boolean = true;
  private productId: string = '';
  private uid: string = '';
  public userInfo: Usuario;
  formSubmitted = false;

  selectedComplaint: string = '';
  complaintOne: string = 'Tiene contenido ofensivo, obsceno o discriminatorio.';
  complaintTwo: string = 'Información falsa.';
  complaintThree: string = 'Lenguaje o símbolos que incitan al odio.';

  comment: Comentarios;
  product: Producto;

  reasonOne: boolean = false;
  reasonTwo: boolean = false;
  reasonThree: boolean = false;

  public complaintForm = this.fb.group({ 
    id: ['', [ Validators.required, Validators.minLength(5), Validators.maxLength(32) ] ],
    productId: ['', [ Validators.required, Validators.minLength(5), Validators.maxLength(32) ] ],
    commentId: ['', [ Validators.required, Validators.minLength(5), Validators.maxLength(32) ] ],
    commentText: ['', [ Validators.required, Validators.minLength(5), Validators.maxLength(2000) ] ],
    descripcion: ['', [ Validators.minLength(20), Validators.maxLength(500) ] ],
    denuncia: ['', [ Validators.required, Validators.minLength(10), Validators.maxLength(150) ] ],
    fecha: ['', [ Validators.required ] ],
    usuario: [ '', [ Validators.required ] ],
    commentDeleted: [ false, [] ],
  });
 
  constructor(
    public authService: AuthService,
    public firestoreService: FirestoreService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.activatedRoute.params
    .subscribe({
      next: ({ commentId }) => {
        this.getComment( commentId );
        this.getUser();
      },
      error: (e) => {
        return Swal.fire('Error', 'Error al cargar datos, por favor intente nuevamente.', 'error' );
      },
      complete: () => console.log()
    });
  }

  async getUser(): Promise<void> {
    this.uid = await this.authService.getUid();
    if(this.uid !== null){
      const unsubscribe = this.firestoreService.getDoc<Usuario>('Usuarios', this.uid).subscribe({
        next: (res) => {
          this.userInfo = res;
          this.complaintForm.patchValue({ usuario: this.userInfo });
          this.loadingUserData = false;
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

  getComment(id: string): void {
    const unsubscribe = this.firestoreService.getDoc<Comentarios>('Comentarios/', id).subscribe({
      next: (res) => {
        this.comment = res;
        this.complaintForm.patchValue({ commentId: res.id });
        this.complaintForm.patchValue({ commentText: res.texto });
        this.getProduct(res.productId);
        this.loadingComment = false;
        unsubscribe.unsubscribe();
      },
      error: (e) => {
        return Swal.fire('Error', 'Error al cargar datos, por favor intente nuevamente.', 'error' );
      },
      complete: () => console.log()
    });
  }

  getProduct(id: string): void {
    const unsubscribe = this.firestoreService.getDoc<Producto>('Productos/', id).subscribe({
      next: (res) => {
        this.product = res;
        this.productId = res.id;
        this.complaintForm.patchValue({ productId: res.id });
        this.loadingProduct = false;
        unsubscribe.unsubscribe();
      },
      error: (e) => {
        return Swal.fire('Error', 'Error al cargar datos, por favor intente nuevamente.', 'error' );
      },
      complete: () => console.log()
    });
  }

  selectedMotif(number: number): void {
    if(number === 1) {
      this.reasonOne = !this.reasonOne;
      this.reasonTwo = false;
      this.reasonThree = false;
      this.selectedComplaint = this.complaintOne;
    }else if(number === 2){
      this.reasonTwo = !this.reasonTwo;
      this.reasonOne = false;
      this.reasonThree = false;
      this.selectedComplaint = this.complaintTwo;
    }else{
      this.reasonThree = !this.reasonThree;
      this.reasonOne = false;
      this.reasonTwo = false;
      this.selectedComplaint = this.complaintThree;
    }

    if(!this.reasonOne && !this.reasonTwo && !this.reasonThree) {
      this.selectedComplaint = '';
    }
  }

  saveComplaint(): void{

    const currentDate = new Date();
    const complaintId = this.firestoreService.getId();

    this.formSubmitted = true;
    this.complaintForm.patchValue({ id: complaintId });
    this.complaintForm.patchValue({ fecha: currentDate });
    this.complaintForm.patchValue({ denuncia: this.selectedComplaint });

    if(this.selectedComplaint === '' || this.complaintForm.invalid || this.userInfo === undefined){
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

    this.firestoreService.createDoc<Denuncia>(this.complaintForm.value, 'Denuncias/', complaintId).then( res => { 
      Swal.fire({
        title: 'Denuncia guardada con exito',
        text: 'Revisaremos el comentario que denunciaste y tomaremos medidas si son necesarias en las próximas 72 horas.',
        icon: 'success',
        confirmButtonText: 'Volver a la publicación',
        allowOutsideClick: false
      }).then((result) => {
        if (result.value) {
          this.router.navigateByUrl(`/dashboard/detalle-producto/${this.productId}`);
        }
      })
    }).catch( error => { 
      console.log(error);
    });

  }

  invalidField( field: string ): boolean {
    if ( this.complaintForm.get(field)!.invalid && this.formSubmitted ) {
      return true;
    } else {
      return false;
    }
  }

  getErrorMessage(field: string): string{
    let message = '';
    if(this.complaintForm.get(field)!.hasError('required')){
      message = 'Este campo es requerido';
    }else if(this.complaintForm.get(field)!.hasError('minlength')){
      const minLength = this.complaintForm.get(field)!.errors?.minlength.requiredLength;
      message = `Este campo debe tener un minimo de ${minLength} caracteres`;
    }else if(this.complaintForm.get(field)!.hasError('maxlength')){
      const maxLength = this.complaintForm.get(field)!.errors?.maxlength.requiredLength;
      message = `Este campo debe tener un maximo de ${maxLength} caracteres`;
    }
    return message;
  }

}
