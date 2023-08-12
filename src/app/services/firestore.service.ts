import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {

  /**
   * Constructor del componente FirestoreService
   * 
   * @param database Servicio de acceso a la base de datos
   */
  constructor( public database: AngularFirestore ) { }

  /**
   * Creación de documentos en las colecciones
   * 
   * @param data Campo que trae la información del documento
   * @param path Ruta de la base de datos donde se guardará
   * @param id Id único que tendrá el documento
   * @template tipo Tipo de la colección
   * @returns Genera un documento en la ruta especificada en
   * la base de datos
   */
  createDoc<tipo>( data: any, path: string, id: string ){
      const collection = this.database.collection<tipo>(path);
      //Crear un nuevo documento dentro de esta coleccion
      return collection.doc(id).set(data);
  }

  /**
   * Obtener el documento de la colección
   * 
   * @param path Ruta de la base de datos donde se almacena
   * @param id Id único que tiene el documento
   * @template tipo Tipo de la colección
   * @returns Trae el documento especificado de la base de datos
   */
  getDoc<tipo>( path: string, id: string ){
    const collection = this.database.collection<tipo>(path);
    return collection.doc(id).valueChanges();
  }

  getDocumentToCheckProductsRemovedFromTheBd<tipo>( path: string, id: string ){
    const collection = this.database.collection<tipo>(path);
    return [collection.doc(id).valueChanges(), id];
  }

  /**
   * Eliminación del documento de la colección
   * 
   * @param path Ruta de la base de datos donde está el documento
   * @param id Id único que tiene el documento
   * @template tipo Tipo de la colección
   * @returns Elimina el documento especificado de la base de datos
   */
  deleteDoc<tipo>( path: string, id: string ){
    const collection = this.database.collection<tipo>(path);
    return collection.doc(id).delete();
  }

  /**
   * Actualización de los documentos de la colección
   * 
   * @param data Información nueva que tendrá el documento
   * @param path Ruta de la base de datos donde está el documento
   * @template tipo Tipo de la colección
   * @param id Id único que tiene el documento
   * @returns Actualiza el documento especificado de la base de datos
   */
  updateDoc<tipo>( data: any, path: string, id: string ){
    const collection = this.database.collection<tipo>(path);
    return collection.doc(id).update(data);
  }

  /**
   * Genera un ID único en la base de datos
   * 
   * @returns Trae un ID único de la base de datos para utilizar
   */
  getId(){
    return this.database.createId();
  }

  /**
   * Trae la colección específica de la base de datos
   * 
   * @template tipo Tipo de la colección
   * @param path Ruta de la base de datos donde están los documentos   
   * @returns Trae la colección completa especificada por la ruta
   */
  getCollectionAll<tipo>(path: string) {
    const collection = this.database.collection<tipo>(path, ref => ref.orderBy('fecha','desc'));
    return collection.valueChanges();
  }

  /**
   * Obtiene una colección completa de la base de datos
   * 
   * @param path Ruta de la base de datos donde está la colección   
   * @param limit Limite de documentos que traerá la consulta
   * @template tipo Tipo de la colección
   * @param lastDocument Posición final del último documento
   * @returns Retorna la colección específicada de la base de datos
   */
  getCollection<tipo>(path: string, limit: number, lastDocument: any) {
    if (lastDocument == null) {
      lastDocument = new Date();
    }
    const collection = this.database.collection<tipo>(path,  ref => ref.orderBy('fecha','desc')
                                                                       .limit(limit)
                                                                       .startAfter(lastDocument));
    return collection.valueChanges();
  }

  getProductsByCategory<tipo>(path: string, limit: number, lastDocument: any, category: string){
    if (lastDocument == null) {
      lastDocument = new Date();
    }
    const collection = this.database.collection<tipo>(path,  ref => ref.where( 'categoria', '==', category)
                                                                       .orderBy('fecha','desc')
                                                                       .limit(limit)
                                                                       .startAfter(lastDocument));
    return collection.valueChanges();
  }

  getProductsByCategoryBackwards<tipo>(path: string, limit: number, firstDocument: any, category: string) {
    const collection = this.database.collection<tipo>(path,  ref => ref.where( 'categoria', '==', category)
                                                                       .orderBy('fecha','desc')
                                                                       .limitToLast(limit)
                                                                       .endBefore(firstDocument));
    return collection.valueChanges();
  }

  getDiscountedProducts<tipo>(path: string){
    const collection = this.database.collection<tipo>(path,  ref => ref.where( 'precioReducido', '>', 0)
                                                                       .orderBy('precioReducido')
                                                                       .limit(20));
    return collection.valueChanges();
  }

  /**
   * Obtiene una colección completa para la paginación anterior
   * 
   * @param path Ruta de la base de datos donde está la colección   
   * @param limit Limite de documentos que traerá la consulta
   * @template tipo Tipo de la colección
   * @param firstDocument Posición Inicial del documento
   * @returns Collección perteneciente a la página anterior
   */
  getCollectionPreviousPage<tipo>(path: string, limit: number, firstDocument: any) {
    const collection = this.database.collection<tipo>(path,  ref => ref.orderBy('fecha','desc')
                                                                       .limitToLast(limit)
                                                                       .endBefore(firstDocument));
    return collection.valueChanges();
  }

  /**
   * Obtiene una colección completa del usuario para su paginación siguiente
   * 
   * @param path Ruta de la base de datos donde está la colección   
   * @param limit Limite de documentos que traerá la consulta
   * @template tipo Tipo de la colección
   * @param lastDocument Posición final del último documento
   * @param id Id del usuario para sus productos
   * @returns Collección perteneciente del usuario a la página siguiente
   */
  getMyProductsNextPage<tipo>(path: string, limit: number, lastDocument: any, id: string) {
    if (lastDocument == null) {
      lastDocument = new Date();
    }
    const collection = this.database.collection<tipo>(path,  ref => ref.where( 'usuario.uid', '==', id)
                                                                      .orderBy('fecha','desc')
                                                                      .limit(limit)
                                                                      .startAfter(lastDocument));
    return collection.valueChanges(); 
  }

  /**
   * Obtiene una colección completa del usuario para su paginación anterior
   * 
   * @param path Ruta de la base de datos donde está la colección   
   * @param limit Limite de documentos que traerá la consulta
   * @template tipo Tipo de la colección
   * @param lastDocument Posición final del último documento
   * @param id Id del usuario para sus productos
   * @returns Collección perteneciente del usuario a la página anterior
   */
  getMyProductsPreviousPage<tipo>(path: string, limit: number, firstDocument: any, id: string) {
    const collection = this.database.collection<tipo>(path,  ref => ref.where( 'usuario.uid', '==', id)
                                                                      .orderBy('fecha','desc')
                                                                      .limitToLast(limit)
                                                                      .endBefore(firstDocument));
    return collection.valueChanges(); 
  }

  getComments<tipo>(path: string, lastDocument: any, id: string) {
    if (lastDocument == null) {
      lastDocument = new Date();
    }
    const collection = this.database.collection<tipo>(path,  ref => ref.where( 'productId', '==', id)
                                                                       .orderBy('fecha','desc')
                                                                       .limit(3)
                                                                       .startAfter(lastDocument));
    return collection.valueChanges();
  }

}