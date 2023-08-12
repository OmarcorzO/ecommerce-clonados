import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { userAdministrador } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class AdministratorService {

  /**
   * Constructor del AdministratorService
   * 
   * @param angularFirestore Servicio de AngularFirestore
   */
  constructor(private angularFirestore:AngularFirestore) { }

  /**
   * Obtiene los administradores de la colección
   * 
   * @returns Colección de usuarios administradores registrados
   */
  getAdministrators(): AngularFirestoreCollection<unknown>
  {
    return this.angularFirestore.collection<userAdministrador>('Usuarios',ref => ref.where('rol','==','admin').orderBy('fecha', 'desc'));
  }

  /**
   * Creación de documentos administradores
   * 
   * @param data Data del usuario administrador
   * @param path Ruta donde se encuentran los administradores a registrar
   * @param id ID que tendrá el documento administrador
   * @template userAdministrador Tipo de la colección para usuarios administradores
   * @returns Documento creado con la información del administrador
   */
  createDoc<userAdministrador>( data: userAdministrador, path: string, id: string ){
    const collection = this.angularFirestore.collection<userAdministrador>(path);
    //Crear un nuevo documento dentro de esta coleccion
    return collection.doc(id).set(data);
  }

  /**
   * Eliminar el documento administrador especificado
   * 
   * @param uid ID del usuario administrador
   * @returns Documento eliminado de la colección de administradores
   */
  deleteAdministrator(uid:string, opc:boolean):Promise<void>
  {
    return this.angularFirestore.doc(`Usuarios/${uid}`).update({
      estado:opc
    });
  }

  /**
   * Edita la información básica del administrador
   * 
   * @param uid ID del usuario administrador
   * @param data Información nueva del administrador
   * @returns Documento actualizado de la colección de administradores
   */
  editAdministrador(uid:string, data:any)
  {
    return this.angularFirestore.doc(`Usuarios/${uid}`).update({
      nombre: data.nombre,
      ciudad: data.ciudad,
      direccion: data.direccion,
      cedula: data.cedula,
      telefono: data.telefono,
    });
  }
}
