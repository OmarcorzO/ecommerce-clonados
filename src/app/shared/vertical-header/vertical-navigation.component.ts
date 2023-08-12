import { Component, AfterViewInit, EventEmitter, Output } from '@angular/core';
import {
  NgbModal,
  ModalDismissReasons,
  NgbPanelChangeEvent,
  NgbCarouselConfig
} from '@ng-bootstrap/ng-bootstrap';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { TranslateService } from '@ngx-translate/core';
import Base64 from 'crypto-js/enc-base64';
import sha256 from 'crypto-js/sha256';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { Usuario } from 'src/app/models/models';
import { FirestoreService } from 'src/app/services/firestore.service';
import Swal from 'sweetalert2';
declare var $: any;

@Component({
  selector: 'app-vertical-navigation',
  templateUrl: './vertical-navigation.component.html'
})
export class VerticalNavigationComponent implements AfterViewInit {
  private privateKey = "CUA777$";
  tipoUsuario = '';
  @Output() toggleSidebar = new EventEmitter<void>();

  public config: PerfectScrollbarConfigInterface = {};

  public cargando: boolean = false;
  public fotoPerfilDefault ='https://firebasestorage.googleapis.com/v0/b/ecommerce-guajira.appspot.com/o/foto-perfil%2Fblank-profile-picture-973460.png?alt=media&token=b6b6dd76-21bc-487e-8112-3fbedb415892';

  cliente: Usuario = {
    uid: '',
    img: '',
    correo: '',
    nombre: '',
    contrasena: '',
    ciudad: '',
    direccion: '',
    cedula: '',
    telefono: '',
    terminos: false,
    fecha: new Date,
  };
  
  val = 1;

  public showSearch = false;

  public selectedLanguage: any = {
    language: 'Español',
    code: 'es',
    icon: 'es'
  }

  constructor(private modalService: NgbModal, private translate: TranslateService, private router: Router, private firebaseAuth: AuthService, public storage: FirestoreService) {
    this.dataUser();
    translate.setDefaultLang('en');
    this.tipoUsuarioMenu();
  }

  changeLanguage(lang: any) {
    this.translate.use(lang.code)
    this.selectedLanguage = lang;
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
      if (localStorage.length === 0) {
        localStorage.setItem('nombreUser', res.nombre);
        localStorage.setItem('correoUser', res.correo);
        localStorage.setItem('imgUser', res.img);
      }
    })
  }

  ngAfterViewInit() { }

  getDataLocal(campo) {
    return localStorage.getItem(campo);
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
      this.tipoUsuario='cliente';
    }
    else if(rolSession === rolAdmin)
    {
      this.tipoUsuario='admin';
    }
    else if(rolSession === rolSAdmin)
    {
      this.tipoUsuario='super-admin';
    }else
    {
      if( this.firebaseAuth.userLog ){
        this.firebaseAuth.logout()
        .then(()=> {
          Swal.fire({
            icon:'info',
            title:'Sesión interrumpida, por favor inicia sesión'
          }).then(()=>{
            this.router.navigateByUrl('/login');
          })
        })
      }
    }
  }
}
