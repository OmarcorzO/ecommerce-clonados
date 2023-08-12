import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateChild, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class LogueadoGuard implements CanActivateChild {

  /**
   * Constructor del LogueadoGuard
   * 
   * @param routes Servicio de rutas para el direccionamiento de páginas
   * @param auts Servicio que utiliza métodos de autenticación
   */
  constructor(private routes: Router, private auts: AuthService) { }

  /**
   * Verificación del usuario no logeado
   * 
   * @returns Verifica que el usuario esté logueado para poder acceder al dashboard,
   * en caso contrario muestra el respectivo mensaje
   */
  canActivateChild(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      return this.auts.userData.pipe(
        map(user => {
          if(!user){
            this.routes.navigate(['/ver-productos']);
            localStorage.setItem('hide-side-menu', 'true');
            return false;
          }else{
            localStorage.setItem('hide-side-menu', 'false');                  
            return true;
          }
        }));
  }
  
}
