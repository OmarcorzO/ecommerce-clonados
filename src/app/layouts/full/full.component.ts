import { Component, OnInit, HostListener } from '@angular/core';
import { FirestoreService } from '../../services/firestore.service';
import { Router } from '@angular/router';
import { InfoDeContacto } from '../../models/models';
declare var $: any;

import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import Swal from 'sweetalert2';
import { Cookie } from 'src/app/models/models';

@Component({
  selector: 'app-full-layout',
  templateUrl: './full.component.html',
  styleUrls: ['./full.component.scss']
})
export class FullComponent implements OnInit {
  public config: PerfectScrollbarConfigInterface = {};
  active=1;
  checkActive=1;
  public dataSession: {id: string, ip: string, browser: string, fecha: Date} = {ip: '', browser: '', fecha: new Date(), id: ''};

  constructor(public router: Router, public firestoreService: FirestoreService) { 
  }

  tabStatus = 'justified';
  public contactInformation: InfoDeContacto;
  public isCollapsed = false;

  public innerWidth: any;
  public defaultSidebar: any;
  public showSettings: boolean = false;
  public loadingContactInformation = true;
  public showMobileMenu: boolean = false;
  public expandLogo: boolean = false;
  public areThereSocialNetworks: boolean = false;

  public hideSideMenu: boolean = false;
  public showMenu: boolean = false;
  public showLogo: boolean = false;

  options = {
    theme: 'light', // two possible values: light, dark
    dir: 'ltr', // two possible values: ltr, rtl
    layout: 'horizontal', // two possible values: vertical, horizontal
    sidebartype: 'full', // four possible values: full, iconbar, overlay, mini-sidebar
    sidebarpos: 'fixed', // two possible values: fixed, absolute
    headerpos: 'fixed', // two possible values: fixed, absolute
    boxed: 'boxed', // two possible values: full, boxed
    navbarbg: 'skin6', // six possible values: skin(1/2/3/4/5/6)
    sidebarbg: 'skin5', // six possible values: skin(1/2/3/4/5/6)
    logobg: 'skin6' // six possible values: skin(1/2/3/4/5/6)
  };

  Logo() {
    this.expandLogo = !this.expandLogo;
  }

  ngOnInit() {
    this.getIpClient();
    this.getBrowserData();
    const btnAceptarCookies = document.getElementById('btn-aceptar-cookies');
    const avisoCookies = document.getElementById('aviso-cookies');
    const fondoAvisoCookies = document.getElementById('fondo-aviso-cookies');

    if(this.router.url.includes('/dashboard')){
      localStorage.setItem('hide-side-menu', 'false');
      this.options.layout = 'vertical';
      this.options.boxed = 'full';
    }else{
      localStorage.setItem('hide-side-menu', 'true');
      this.options.layout = 'horizontal';
      this.options.boxed = 'boxed';
    }

    if(localStorage.getItem('hide-side-menu') === 'true'){
      this.hideSideMenu = true;
    }else{
      this.hideSideMenu = false;
    }

    if (this.router.url === '/') {
      this.router.navigate(['/dashboard/classic']);
    }
    this.defaultSidebar = this.options.sidebartype;
    this.handleSidebar();
    const suscribe = this.firestoreService.getCollectionAll<Cookie>('Cookies')
    .subscribe({
      next: (cookie: any) => {
        if (cookie.length === 0) {
          avisoCookies.classList.add('activo');
          fondoAvisoCookies.classList.add('activo');
        } else{
          cookie.forEach(
            opc => {
              if (opc.browser === this.dataSession.browser && opc.ip === this.dataSession.ip) {
                avisoCookies.classList.remove('activo');
                fondoAvisoCookies.classList.remove('activo');
                this.checkActive = 0;
              }
            }
          )
        }

        if (localStorage.getItem('cookies-accepted') === null ) {
          avisoCookies.classList.add('activo');
          fondoAvisoCookies.classList.add('activo');
        } else if (this.checkActive === 1 ) {
          avisoCookies.classList.add('activo');
          fondoAvisoCookies.classList.add('activo');
        }

        suscribe.unsubscribe();
      },
      error: (e) => {
        console.log(e);
      },
      complete: () => console.log()
    });

    btnAceptarCookies.addEventListener('click', () => {
      avisoCookies.classList.remove('activo');
      fondoAvisoCookies.classList.remove('activo');
    })
    this.uploadContactInformation();
  }

  uploadContactInformation(): void {
    const unsubscribe = this.firestoreService.getCollectionAll<InfoDeContacto>('InfoDeContacto/').subscribe({
      next: (res) => {
        if(res.length > 0){
          this.contactInformation = res[0];
          if(this.contactInformation.instagram.length > 0 || this.contactInformation.twitter.length > 0 
            || this.contactInformation.facebook.length > 0 || this.contactInformation.whatsapp.length > 0 
            || this.contactInformation.youtube.length > 0){
            this.areThereSocialNetworks = true;
          }
        }
        this.loadingContactInformation = false;
        unsubscribe.unsubscribe();
      },
      error: (e) => {
        console.log(e);
        return Swal.fire('Error', 'Error al cargar datos, por favor intente nuevamente.', 'error' );
      },
      complete: () => console.log()
    });
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: string) {
    this.handleSidebar();
  }

  handleSidebar() {
    this.innerWidth = window.innerWidth;
    switch (this.defaultSidebar) {
      case 'full':
      case 'iconbar':
        if (this.innerWidth < 1170) {
          this.options.sidebartype = 'mini-sidebar';
        } else {
          this.options.sidebartype = this.defaultSidebar;
        }
        break;

      case 'overlay':
        if (this.innerWidth < 767) {
          this.options.sidebartype = 'mini-sidebar';
        } else {
          this.options.sidebartype = this.defaultSidebar;
        }
        break;

      default:
    }
  }

  toggleSidebarType() {
    switch (this.options.sidebartype) {
      case 'full':
      case 'iconbar':
        this.options.sidebartype = 'mini-sidebar';
        this.showLogo = true;
        break;

      case 'overlay':
        this.showMobileMenu = !this.showMobileMenu;
        break;

      case 'mini-sidebar':
        if (this.defaultSidebar === 'mini-sidebar') {
          this.options.sidebartype = 'full';
        } else {
          this.options.sidebartype = this.defaultSidebar;
        }
        this.showLogo = false;
        break;

      default:
    }
  }

  handleClick(event: boolean) {
    this.showMobileMenu = event;
  }

  acceptCookie() {
    const idCookie = this.firestoreService.getId();
    this.sendData(idCookie)
    localStorage.setItem('cookies-accepted', 'true')
  }

  getIpClient() {
    fetch('https://jsonip.com/')
    .then(res => { return res.json();})
    .then(
      data => {
        this.dataSession.ip = data.ip;
      }
    )
  }

  getBrowserData() {
    var getBrowserInfo = function() {
      var ua= navigator.userAgent, tem, 
      M= ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
      if(/trident/i.test(M[1])){
          tem=  /\brv[ :]+(\d+)/g.exec(ua) || [];
          return 'IE '+(tem[1] || '');
      }
      if(M[1]=== 'Chrome'){
          tem= ua.match(/\b(OPR|Edg)\/(\d+)/);
          if(tem!= null) return tem.slice(1).join(' ').replace('OPR', 'Opera').replace('Edg', 'Internet Explorer');
      }
      M= M[2]? [M[1], M[2]]: [navigator.appName, navigator.appVersion, '-?'];
      if((tem= ua.match(/version\/(\d+)/i))!= null) M.splice(1, 1, tem[1]);
      return M.join(' ');
    };
    this.dataSession.browser = getBrowserInfo();
  }

  sendData(idCookie) {
    this.dataSession.id = idCookie;
    if (this.dataSession.ip !== '') {
      this.firestoreService.createDoc(this.dataSession, 'Cookies/', idCookie).then( res => {
      }).catch( error => {
        console.log(error);
      });
    }
  }
}