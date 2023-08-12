import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { FirestoreService } from 'src/app/services/firestore.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-recover',
  templateUrl: './recover.component.html',
  styleUrls: ['./recover.component.scss']
})
export class RecoverComponent implements OnInit {
  /**
   * Constructor del LoginComponent
   *
   * @param router Servicio de rutas para el direccionamiento de páginas
   * @param fb Constructor de formularios
   * @param firebaseauthService Servicio que utiliza métodos de autenticación
   * @param firestoreService Servicio para realizar consultas de CRUD a las colecciones de BD
   */
   constructor(
    private router: Router,
    public firebaseauthService: AuthService,
    public firestoreService: FirestoreService,
  ) {}

  ngOnInit(): void {
      
  }

  recover() {
    let email = document.getElementById("email") as any;

    if (email.value === '' || email.value === undefined) {
      Swal.fire("Error", "Email proporcionado incorrecto", "error");
    } else {
      this.firebaseauthService.recoverPassword(email.value).then(() => {
        Swal.fire("Confirmación", "Correo de recuperación enviado satisfactoriamente", "success");
        this.router.navigateByUrl("login");
      })
      .catch((error) => {
        console.log(error);
      });;
    }
    
  }
}
