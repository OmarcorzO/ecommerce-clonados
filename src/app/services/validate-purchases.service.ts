import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../environments/environment';

const base_url = environment.backendUrl;

@Injectable({
  providedIn: 'root'
})
export class ValidatePurchasesService {

  constructor(
    private http: HttpClient
  ) { }

  generateAnIntegritySignature( amount: string ){
    const url = `${ base_url }/api/wompi/wompiHash?amount=${amount}`;
    return this.http.get( url );
  }
}
