import { Component, OnInit } from '@angular/core';

import { FirestoreService } from '../../services/firestore.service';
import { Comentarios, Denuncia } from '../../models/models';

import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';

import moment from 'moment';
import Swal from 'sweetalert2';
moment.locale("es");

@Component({
  selector: 'app-manage-complaints',
  templateUrl: './manage-complaints.component.html',
  styleUrls: ['./manage-complaints.component.scss']
})
export class ManageComplaintsComponent implements OnInit {

  public charging: boolean = true;
  public complaints: Denuncia[] = [];
  public complaintDetails: Denuncia;
  public totalComplaints: number = 0;
  textOne: string = '¿Estás seguro de querer eliminar esta denuncia?';
  textTwo: string = '¿Estás seguro de querer eliminar el comentario de esta denuncia?';


  //Variables de la paginación
  cpage = 1;
  cpageSize = 8;

  closeResult = '';

  constructor(
    public firestoreService: FirestoreService,
    private modalService: NgbModal
  ) { }

  ngOnInit(): void {
    this.getComplaints();
    console.log(this.complaintDetails.commentDeleted);
  }

  getComplaints(){
    this.charging = true; 
    const unsubscribe = this.firestoreService.getCollectionAll<Denuncia>('Denuncias/').subscribe({
      next: (res) => {
        this.totalComplaints = res.length;
        this.complaints = res;
        this.charging = false;
        unsubscribe.unsubscribe();
      },
      error: (e) => {
        return Swal.fire('Error', 'Error al cargar datos, por favor intente nuevamente.', 'error' );
      },
      complete: () => console.log()
    });
  }

  formatDate(date: Date): string{
    const convertedDate = moment(date).format('MMMM Do YYYY, h:mm a'); 
    return convertedDate[0].toUpperCase() + convertedDate.substring(1);
  }

  /**
  *  Muestra el modal
  *
  * @param content1 el identificador para abril un modal.
  * @returns void.
  */
  openModal(content1: string, complaint: Denuncia) {
    this.complaintDetails = complaint;
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

  /**
 *  Elimina el comentario de la denuncia seleccionada
 *
 * @param id el identificador del comentario de la denuncia a eliminar
 * @returns void.
 */
  deleteComment( id: string, path: string, type: string, deleteText: string, option: number): void {
    let titleText = '';
    option === 1 ? titleText = this.textOne : titleText = this.textTwo;
    Swal.fire({
      title: titleText,
      icon: 'question',
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Si, estoy seguro'
    }).then((result) => {
      if (result.value) {

        if( this.complaintDetails?.commentDeleted && type === 'comentario') {
          return Swal.fire('Error', "Ya habías eliminado este comentario anteriormente.", 'error');
        }

        Swal.fire({
          title: 'Eliminando',
          html: 'Por favor espera un momento...',
          showCancelButton: false,
          showConfirmButton: false, 
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading()
          }
        });
        
        this.firestoreService.deleteDoc<any>(path, id).then( res => {

          if(type === 'comentario'){
            this.firestoreService.updateDoc<Denuncia>({ commentDeleted: true }, 'Denuncias/', this.complaintDetails.id).then( res => {
              this.complaintDetails.commentDeleted = true;
              this.getComplaints();
              Swal.fire({ 
                icon: 'success',
                title: `${deleteText} correctamente`
              });
            }).catch( error => {
              Swal.fire('Error', "Error, por favor intenta nuevamente", 'error');
            });
          }else{
            this.getComplaints();
            Swal.fire({
              icon: 'success',
              title: `${deleteText} correctamente`
            });
          }

        }).catch( () => {
          Swal.fire('Error', "Error, por favor intenta nuevamente", 'error');
        });

      }
    })
  }

}
