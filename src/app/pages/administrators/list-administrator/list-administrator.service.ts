import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { administratorData } from './administrator-data';
import { administrator } from './administratorInterface';
import { HttpClient } from '@angular/common/http';
;


@Injectable({
  providedIn: 'root'
})
export class ListAdministratorService {

  private users: administrator[] = administratorData;

  private url = "https://api.origenecommerce.com.co:5401";
  // private url = "https://api.origenecommerce.com.co:5401";

  /**
   * 
   * @param http Servicio
   */
  constructor(private http: HttpClient) {

  }

  /**
   * Obtiene el usuario administrador
   * 
   * @returns Usuario observable del administrador
   */
  getUsers(): Observable<administrator> {
    return from(this.users);
  }

  /**
   * Elimina el usuario especificado del array administrador
   * 
   * @param id Campo del id del usuario
   * @returns Usuario eliminado del array
   */
  deleteUser(data: Object) {
    return this.http.put(`${this.url}/api/sdkfirebase/auth/changeStateUser`, data);
    // this.users = this.users.filter(user => user.id !== id);
  }

  /**
   * Agrega un usuario al array de administrador
   * 
   * @param user Campo administrador del usuario
   * @returns Usuario agregado al array
   */
  addUser(user: Object) {
    return this.http.post(`${this.url}/api/sdkfirebase/auth/createUser`, user);
    // this.users?.push(user);
  }

  /**
   * Actualización del usuario especificado del array administrador
   * 
   * @param index Campo de ubicación del usuario
   * @param user Campos de información del usuario
   * @returns Usuario actualizado del array
   */
  updateUser(index: number, user: administrator): void {
    this.users[index] = user;
  }
}
