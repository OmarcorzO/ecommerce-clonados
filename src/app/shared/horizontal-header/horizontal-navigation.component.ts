import { Component, AfterViewInit, EventEmitter, Output } from '@angular/core';
import { NgbModal, ModalDismissReasons, NgbPanelChangeEvent, NgbCarouselConfig } from '@ng-bootstrap/ng-bootstrap';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { Usuario } from 'src/app/models/models';
import { FirestoreService } from 'src/app/services/firestore.service';

import Swal from 'sweetalert2';

declare var $: any;

@Component({
  selector: 'app-horizontal-navigation',
  templateUrl: './horizontal-navigation.component.html',
  styleUrls: ['./horizontal-navigation.component.scss']
})
export class HorizontalNavigationComponent implements AfterViewInit {
  @Output() toggleSidebar = new EventEmitter<void>();

  public config: PerfectScrollbarConfigInterface = {};

  public cargando: boolean = false;

  cliente: Usuario = {
    uid: '',
    correo: '',
    nombre: '',
    img: '',
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

  public isCollapsed = false;
  public showMobileMenu = false;

  public selectedLanguage: any = {
    language: 'English',
    code: 'en',
    type: 'US',
    icon: 'us'
  }

  constructor(private modalService: NgbModal, private translate: TranslateService, private router: Router, private firebaseAuth: AuthService, public storage: FirestoreService) {
    this.dataUser();
    translate.setDefaultLang('en');
  }

  ngAfterViewInit() { }

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
      this.cliente = res;
      if (localStorage.length === 0) {
        localStorage.setItem('nombreUser', res.nombre);
        localStorage.setItem('correoUser', res.correo);
        localStorage.setItem('imgUser', res.img);
      } else {
      }
    })
  }

  sessionWarning(){
    Swal.fire({
      title: '¡Hola!',
      text: 'Para agregar al carrito, ingresa a tu cuenta',
      icon: 'warning',
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Ingresar',
    }).then((result) => {
      if (result.value) {
        this.router.navigateByUrl("/login");
      }
    })
  }
}
