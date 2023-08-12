/* eslint-disable no-unused-vars */
/* eslint-disable no-empty-function */
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root',
})
export class SwalService {
  constructor(
    public routes: Router,
  ) { }

  status401() {
    Swal.fire({
      title: 'Error!!',
      icon: 'error',
      html: 'Tiempo de sesión expirado, inicie sesión nuevamente',
      showConfirmButton: true,
      confirmButtonText: 'Aceptar',
      allowOutsideClick: false,
    }).then(() => {
      this.routes.navigate(['/login']);
    });
  }

  genericError(message:string) {
    Swal.fire({
      title: 'Error!!',
      icon: 'error',
      html: message,
      showCancelButton: false,
      showConfirmButton: true,
      confirmButtonText: 'Aceptar',
      allowOutsideClick: false,
    });
  }

  genericWarning(message:string) {
    Swal.fire({
      title: 'Advertencia!!',
      icon: 'warning',
      html: message,
      showCancelButton: false,
      showConfirmButton: true,
      confirmButtonText: 'Aceptar',
      allowOutsideClick: false,
    });
  }

  generirSuccess(message:string, title:string, callback?:any) {
    Swal.fire({
      title,
      icon: 'success',
      html: message,
      showCancelButton: false,
      showConfirmButton: true,
      confirmButtonText: 'Aceptar',
      allowOutsideClick: false,
    }).then(callback);
  }

  notificationLoading(title:string) {
    Swal.fire({
      title,
      showCancelButton: false,
      showConfirmButton: false,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });
  }

  closeNotificationLoading() {
    Swal.close();
  }
}
