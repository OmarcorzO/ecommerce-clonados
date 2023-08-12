import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { WebSocketService } from './web-socket.service';

@Injectable({
  providedIn: 'root'
})
export class SalesService {

  constructor(
    public database: AngularFirestore
  ) { }


  getAllSales<tipo>(path: string) {
    const collection = this.database.collection<tipo>(path,  ref => ref.orderBy('fecha','desc'));
    return collection.valueChanges();
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
  updateStatus<Pedido>( data: Pedido, path: string, id: string ){
      const collection = this.database.collection<Pedido>(path);
      return collection.doc(id).update(data);
  }

  getMyOrders<tipo>(path: string, id: string) {
    const collection = this.database.collection<tipo>(path,  ref => ref.where( 'cliente.uid', '==', id)
                                                                       .orderBy('fecha','desc'));
    return collection.valueChanges();
  }

  getLastReservation<tipo>(path: string, uid: string) {
    const collection = this.database.collection<tipo>(path,  ref => ref.where( 'cliente.uid', '==', uid)
                                                                      .orderBy('fecha','desc')
                                                                      .limit(3));
    return collection.valueChanges();
  }
}
