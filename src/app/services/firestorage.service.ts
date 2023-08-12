import { Injectable } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { finalize } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FirestorageService {

  /**
   * Constructor del FirestorageService
   * 
   * @param storage Servicio de AngularFire para el storage de la información
   */
  constructor(public storage: AngularFireStorage) { }

  /**
   * Sube una imagen específica
   * 
   * @param file Archivo seleccionado
   * @param filePath Ruta donde se guardará el archivo
   * @returns Archivo montado en la base de datos
   */
  uploadImage(file: any, filePath: string)
  {
    return this.storage.upload(filePath, file);
  }

}
