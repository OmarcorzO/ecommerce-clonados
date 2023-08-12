import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
  UrlTree
} from '@angular/router';
import { AuthService } from "../services/auth.service";
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})

export class AuthGuard implements CanActivate {

  /**
   * Constructor del AuthGuard
   * 
   * @param routes Servicio de rutas para el direccionamiento de páginas
   * @param auts Servicio que utiliza métodos de autenticación
   */
  constructor(private routes: Router, private auts: AuthService) { }

  /**
   * Verificación del usuario logeado
   * 
   * @returns Verifica que el usuario no esté logueado para poder acceder al login,
   * en caso contrario muestra el respectivo mensaje
   */
  canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.auts.userData.pipe(
      map(user => {
        if(user){
          this.routes.navigate(['/dashboard']);
          localStorage.setItem('hide-side-menu', 'false');
          return false;
        }else{     
          localStorage.setItem('hide-side-menu', 'true');
          return true;
        }
      })

    );
  }
}
