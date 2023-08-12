import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFireStorage } from "@angular/fire/compat/storage";
import Swal from 'sweetalert2';
import { Usuario } from '../models/models';
import { getAuth, sendPasswordResetEmail } from "firebase/auth";



@Injectable({
  providedIn: 'root'
})
export class AuthService {

  datosCliente: Usuario;
  public userData;
  public userLog;

  /**
   * Constructor del AuthService
   * 
   * @param auth Servicio de AngularFire para el sistema de Authentication
   * @param storage Servicio de AngularFire para el storage de la información
   */
  constructor( public auth: AngularFireAuth, private storage: AngularFireStorage ) { 
    this.userData = this.stateAuth();
    const authe = getAuth();
    this.userLog = authe.currentUser;
  }

  /**
   * Iniciar sesión del usuario en el aplicativo
   * 
   * @param email Campo de correo
   * @param password Campo de contraseña
   * @returns Logeo del usuario
   */
  login(email: string, password: string) {
    return this.auth.signInWithEmailAndPassword(email, password);
  }

  /**
   * Cerrar sesión activa del usuario en el aplicativo
   * 
   * @returns Deslogeo del usuario
   */
  logout() {
    return this.auth.signOut();
  }

  /**
   * Registro de un usuario en el autentication de firebase
   * 
   * @param email Campo de correo
   * @param password Campo de contraseña
   * @returns Registro del usuario en autentication
   */
  registrar(email: string, password: string) {
     return this.auth.createUserWithEmailAndPassword(email, password);
  }

  /**
   * Retorna las credenciales del usuario
   * 
   * @returns Credenciales del usuario
   */
  async getUid() {
    const user = await this.auth.currentUser;
    if (user === null) {
      return null;
    } else {
       return user.uid;
    }
  }

  /**
   * Estado de autenticación del usuario
   * 
   * @returns Estado del usuario
   */
  stateAuth() {
    return this.auth.authState;
  }

  /**
   * Loading de información
   * 
   * @returns Alerta de cargando
   */
  loadingData(){
    Swal.fire({
      title: 'Cargando cambios',
      html: 'Por favor espera un momento...',
      showCancelButton: false,
      showConfirmButton: true, 
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading()
      }
    }); 
  }

  recoverPassword(email: string){
    return this.auth.sendPasswordResetEmail(email)
  }
}
