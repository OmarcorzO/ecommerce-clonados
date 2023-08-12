import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouteInfo } from './vertical-sidebar.metadata';
import { VerticalSidebarService } from './vertical-sidebar.service';
import { Router } from '@angular/router';
import { AuthService } from "../../services/auth.service";
import { getAuth } from "firebase/auth";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import sha256 from 'crypto-js/sha256';
import Base64 from 'crypto-js/enc-base64';
import { FirestoreService } from "../../services/firestore.service";
import { Usuario } from "../../models/models";
import Swal from 'sweetalert2';
declare var $: any;

@Component({
  selector: 'app-vertical-sidebar',
  templateUrl: './vertical-sidebar.component.html'
})
export class VerticalSidebarComponent {
  private privateKey = "CUA777$"
  showMenu = '';
  showSubMenu = '';
  public sidebarnavItems: RouteInfo[] = [];
  path = '';
  public fotoPerfilDefault ='https://firebasestorage.googleapis.com/v0/b/ecommerce-guajira.appspot.com/o/foto-perfil%2Fblank-profile-picture-973460.png?alt=media&token=b6b6dd76-21bc-487e-8112-3fbedb415892';

  public cargando: boolean = false;

  cliente: Usuario = {
    uid: '',
    correo: '',
    nombre: '',
    contrasena: '',
    ciudad: '',
    direccion: '',
    cedula: '',
    telefono: '',
    img: '',
    terminos: false,
    fecha: new Date,
  };

  @Input() showClass: boolean = false;
  @Output() notify: EventEmitter<boolean> = new EventEmitter<boolean>();


  handleNotify() {
    this.notify.emit(!this.showClass);
  }

  constructor(private menuServise: VerticalSidebarService, private router: Router, private firebaseAuth: AuthService, public storage: FirestoreService) {
    this.dataUser();
    this.tipoUsuarioMenu();
  }

  tipoUsuarioMenu()
  {
    const rolCliente =Base64.stringify(sha256('cliente'), this.privateKey)
    const rolAdmin =Base64.stringify(sha256('admin'), this.privateKey)
    const rolSAdmin =Base64.stringify(sha256('super-admin'), this.privateKey)
    const rolKey= Base64.stringify(sha256('rol'), this.privateKey)
    const rolSession = sessionStorage.getItem(rolKey);
    
    if(rolCliente === rolSession)
    {
      this.menuServise.tipoUsuario='cliente';
    }
    else if(rolSession ===rolAdmin)
    {
      this.menuServise.tipoUsuario='admin';
    }
    else if(rolSession ===rolSAdmin)
    {
      this.menuServise.tipoUsuario='super-admin';
    }else
    {
      this.firebaseAuth.logout()
      .then(()=> {
        Swal.fire({
          icon:'info',
          title:'Sesión interrumpida'
        }).then(()=>{
          this.router.navigateByUrl('/login');
        })
      })
    }
    this.menuServise.elegirMenuPerzonalisado();
    this.obtenerMenuPersonalizado();
  }

  obtenerMenuPersonalizado()
  {
    this.menuServise.items.subscribe(menuItems => {
      this.sidebarnavItems = menuItems;

      // Active menu 
      this.sidebarnavItems.filter(m => m.submenu.filter(
        (s) => {
          if (s.path === this.router.url) {
            this.path = m.title;
          }
        }
      ));
      this.addExpandClass(this.path);
    });
  }

  addExpandClass(element: any) {
    if (element === this.showMenu) {
      this.showMenu = '0';
    } else {
      this.showMenu = element;
    }
  }

  addActiveClass(element: any) {
    if (element === this.showSubMenu) {
      this.showSubMenu = '0';
    } else {
      this.showSubMenu = element;
    }
    window.scroll({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }

  logout(){
    this.firebaseAuth.logout().then(()=> this.router.navigateByUrl(''));
  }

  async dataUser(){
    this.cargando = true;
    const uid = await this.firebaseAuth.getUid();
    this.storage.getDoc<Usuario>('Usuarios', uid).subscribe( res => {
      this.cargando = false;
      this.cliente = res
    })
  }
  
}
