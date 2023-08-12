import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ListAdministratorService } from './list-administrator.service'
import { AdministratorService } from 'src/app/services/administrator.service';
import { userAdministrador } from 'src/app/models/models';
import { AuthService } from 'src/app/services/auth.service';
import Swal from 'sweetalert2';
import {Md5} from 'ts-md5/dist/md5';
import { SwalService } from 'src/app/services/swalNotification/swal.service';
import domainsEmailJson from '../../../auth/login/email_domains.json';

@Component({
  selector: 'app-list-administrator',
  templateUrl: './list-administrator.component.html',
  styleUrls: ['./list-administrator.component.scss']
})
export class ListAdministratorComponent implements OnInit, OnDestroy {

  private unsubscribe: any[]=[];

  private domainsEmails:any[] = domainsEmailJson.domains;

  /**
   * Foto de perfil por defecto
   */
  public fotoPerfilDefault ='https://firebasestorage.googleapis.com/v0/b/ecommerce-guajira.appspot.com/o/foto-perfil%2Fblank-profile-picture-973460.png?alt=media&token=b6b6dd76-21bc-487e-8112-3fbedb415892';

  userList: userAdministrador[] = [];
  filterArray: userAdministrador[] = [];
  userDetail: userAdministrador | null = null;

  config: any;

  createAdminForm: FormGroup | null = null;
  editAdminForm: FormGroup | null = null;

  joiningDate: string | null = null;

  page = 1;
  pageSize = 7;

  _searchTerm = '';

  public formSubmittedCreate = false;
  public formSubmittedEdit = false;

  /**
   * Constructor del ListAdministratorComponent
   * 
   * @param fb Constructor de formularios
   * @param modalService Componente de modal para las pantallas desplegables
   * @param adminService Servicio de CRUD y funcionalidades de administrador
   * @param firebaseauthService Servicio que utiliza métodos de autenticación
   * @param adminService Servicio de CRUD y funcionalidades de administrador
   */
  constructor(private fb: FormBuilder, 
    private modalService: NgbModal, 
    private httpService:ListAdministratorService,
    public firebaseauthService: AuthService,
    private adminService:AdministratorService,
    private swalService: SwalService,
    ) {    
      const subscribe= this.adminService.getAdministrators()
      .valueChanges()
      .subscribe({
        next: admins => {
          this.userList=[];
          admins.forEach((admin:userAdministrador) => {
            const adminFormat: userAdministrador=admin;
            this.userList.push(adminFormat);
          });
          this.filterArray = this.userList;
        },
        error: (e) => {
          return Swal.fire('Error', 'Administradores cargando', 'error' );
        },
        complete: () => console.log()
      });
      this.unsubscribe.push(subscribe);
  }

  /**
   * Desuscribe distintos métodos al salir del componente
   * 
   * @returns Componente limpio sin observables o suscripciones constanstes
   */
  ngOnDestroy()
  {
    this.unsubscribe.forEach(unsubscribe=> unsubscribe.unsubscribe());
  }

  /**
   * Inicializa los distintos métodos al iniciar el componente
   * 
   * @returns Inicia los distintos métodos especificados
   */
  ngOnInit() {
      this.editAdminForm = this.fb.group({
        uid: ['', [ Validators.minLength(5), Validators.maxLength(32) ] ],
        nombre: ['', [ Validators.required, Validators.minLength(4), Validators.maxLength(64) ] ],
        ciudad: ['', [ Validators.required, Validators.minLength(4), Validators.maxLength(64) ] ],
        direccion: ['', [ Validators.required, Validators.minLength(7), Validators.maxLength(100) ] ],
        cedula: ['', [ Validators.required, Validators.minLength(8), Validators.maxLength(10) ] ],
        telefono: ['', [ Validators.required, Validators.minLength(10), Validators.maxLength(10) ] ],
    });
      this.inicializarFormularioCrearAdmin();
  }

  /**
   * Inicialización del formulario de creación
   * 
   * @returns Formulario de creación de administradores
   */
  inicializarFormularioCrearAdmin() {
      this.createAdminForm = this.fb.group({
        uid: ['', [ Validators.minLength(5), Validators.maxLength(32) ] ],
        nombre: ['', [ Validators.required, Validators.minLength(4), Validators.maxLength(64) ] ],
        ciudad: ['', [ Validators.required, Validators.minLength(4), Validators.maxLength(64) ] ],
        direccion: ['', [ Validators.required, Validators.minLength(7), Validators.maxLength(100) ] ],
        cedula: ['', [ Validators.required, Validators.minLength(8), Validators.maxLength(10) ] ],
        telefono: ['', [ Validators.required, Validators.minLength(10), Validators.maxLength(10) ] ],
        correo: ['', [ Validators.required, Validators.email, Validators.pattern(/^[a-zA-Z0-9\.\_\-]+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/) ] ],
        fecha: ['', [ Validators.required ] ],
        rol: ['admin', [ Validators.required ] ],
        registro_completado: [true ,[Validators.required]],
        img: [''],
        contrasena: ['', [ Validators.required, Validators.minLength(8), Validators.maxLength(64)] ],
        contrasena2: ['', [ Validators.required, Validators.minLength(8), Validators.maxLength(64) ] ],
    }, {
        validators: this.samePasswords('contrasena', 'contrasena2')
      });
  }

  /**
   * Validación de campo contraseña
   * 
   * @param pass1Name Contraseña original
   * @param pass2Name Contraseña para verificar
   * @returns Si ambas campos son iguales no presenta problemas,
   * en caso contrario, asigna el respectivo mensaje de error.
   */
  samePasswords(pass1Name: string, pass2Name: string ) {
    return ( formGroup: FormGroup ) => {

      const pass1Control = formGroup.get(pass1Name)!;
      const pass2Control = formGroup.get(pass2Name)!;

      if ( pass1Control.value === pass2Control.value ) {
        pass2Control.setErrors(null)
      } else {
        pass2Control.setErrors({ noEsIgual: true })
      }
    } 
  }

  /**
   * Administra los mensajes de error para datos de edición
   * 
   * @param field Campo a validar
   * @returns De acuerdo al error que tenga el campo asigna el mensaje respectivo,
   * si no hubo ningún error no se asigna el mensaje al campo.
   */
  getErrorMessageEdit(field: string): string{
    let message = '';
      //.errors?.required
    if(this.editAdminForm.get(field)!.hasError('required')){
      message = 'Este campo es requerido';
    }else if(this.editAdminForm.get(field)!.hasError('minlength')){
      const minLength = this.editAdminForm.get(field)!.errors?.minlength.requiredLength;
      message = `Este campo debe tener un minimo de ${minLength} caracteres`;
    }else if(this.editAdminForm.get(field)!.hasError('maxlength')){
      const maxLength = this.editAdminForm.get(field)!.errors?.maxlength.requiredLength;
      message = `Este campo debe tener un maximo de ${maxLength} caracteres`;
    }else if(this.editAdminForm.get(field)!.hasError('pattern')){
       message = 'Este campo es invalido';
    }

    return message;
  }

  /**
   * Administra los mensajes de error para datos
   * 
   * @param field Campo a validar
   * @returns De acuerdo al error que tenga el campo asigna el mensaje respectivo,
   * si no hubo ningún error no se asigna el mensaje al campo.
   */
  getErrorMessage(field: string): string{
    let message = '';
      //.errors?.required
    if(this.createAdminForm.get(field)!.hasError('required')){
      message = 'Este campo es requerido';
    }else if(this.createAdminForm.get(field)!.hasError('minlength')){
      const minLength = this.createAdminForm.get(field)!.errors?.minlength.requiredLength;
      message = `Este campo debe tener un minimo de ${minLength} caracteres`;
    }else if(this.createAdminForm.get(field)!.hasError('maxlength')){
      const maxLength = this.createAdminForm.get(field)!.errors?.maxlength.requiredLength;
      message = `Este campo debe tener un maximo de ${maxLength} caracteres`;
    }else if(this.createAdminForm.get(field)!.hasError('pattern')){
       message = 'Este campo es invalido';
    }

    return message;
  }

  getErrorMessageFromMail(field: string): string{
    let message = '';
    if(this.createAdminForm.get(field)!.hasError('pattern')){
       message = 'Correo invalido';
    }
    return message;
  }

  /**
   * Valida que los campos sean correctos
   * 
   * @param field Campo a validar.
   * @returns Si no hay problemas con los campos retorna true,
   * en caso contrario retorna false.
   */
  invalidField( field: string ): boolean {
    
    if ( this.createAdminForm.get(field)!.invalid && this.formSubmittedCreate ) {
      return true;
    } else {
      return false;
    }

  }

  /**
   * Valida que ambas contraseñas sean iguales
   * 
   * @returns Si ambas contraseñas del form respectivo son correctas 
   * retorna false, en caso contrario retorna true como alerta.
   */
  invalidPasswords() {
    const pass1 = this.createAdminForm.get('contrasena')!.value;
    const pass2 = this.createAdminForm.get('contrasena2')!.value;

    if ( (pass1 !== pass2) && this.formSubmittedCreate ) {
      return true;
    } else {
      return false;
    }

  }

  /**
  * Guarda el usuario cliente registrado en la base de datos
  * 
  * @returns Guardado de documento usuario en las colecciones
  */
  registrarAdministrador() {

    const fechaActual = new Date();

    this.formSubmittedCreate = true;

    this.createAdminForm.patchValue({ fecha: fechaActual });

    if(this.createAdminForm.invalid){
      return;
    }
    else
    {
      this.formSubmittedCreate=false;
    }

    const credenciales = {
        correo: this.createAdminForm.value.correo,
        contrasena: Md5.hashStr(this.createAdminForm.value.contrasena)
    };

    this.saveDbAdministrador(fechaActual);
  }

  /**
   * 
   * @param uid ID del usuario administrador
   * @param fecha 
   */
  saveDbAdministrador(fecha:Date)
  {
    const path = 'Usuarios';

    Swal.fire({
      title: 'Creando usuario',
      html: 'Por favor espera un momento...',
      showCancelButton: false,
      showConfirmButton: false, 
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading()
      }
    });

    this.firebaseauthService.getUid().then(
      (res) => {
        const data = {
          uid: res,
          email: this.createAdminForm.value.correo,
          password: this.createAdminForm.value.contrasena,
        };
        this.httpService.addUser(data)
        .subscribe({
          next: (res: any)=> {
            const admin = this.inicializarUserAdministrador(fecha, res.resultCreate.uid);
            this.adminService.createDoc(admin, path, res.resultCreate.uid)
            .then(()=>{
              this.closeBtnClick();
                Swal.fire({
                    icon: 'success',
                    title: 'Registrado con exito!!'
                  });
            }, () => {
              Swal.fire({
                icon:'error',
                title:'Se presentó un error al crear el administrador, por favor intentelo nuevamente'
              });
            });
          },
          error: () => {
            console.log('Error!!');
            Swal.fire({
              icon:'error',
              title:'Se presentó un error al crear el administrador, por favor intentelo nuevamente'
            });
          },
          complete: () => console.log()
        })
      },
    ).catch( err => {
      Swal.fire({
        icon:'error',
        title:'Se presentó un error al crear el administrador, por favor intentelo nuevamente'
      });
    });
    
    
  }


  /**
   * Inicializa un usuario con rol administrador
   * 
   * @param fecha Campo de fecha actual
   * @param uid ID del usuario administrador
   * @returns Usuario inicializado
   */
  inicializarUserAdministrador(fecha:Date, uid:string):userAdministrador {
    return {
        contrasena: Md5.hashStr(this.createAdminForm.value.contrasena),
        correo: this.createAdminForm.value.correo,
        fecha,
        nombre:this.createAdminForm.value.nombre,
        ciudad: this.createAdminForm.value.ciudad,
        direccion: this.createAdminForm.value.direccion,
        cedula: this.createAdminForm.value.cedula,
        telefono: this.createAdminForm.value.telefono,
        registro_completado: this.createAdminForm.value.registro_completado,
        uid,
        img:'',
        rol:'admin',
        estado: true
    }
  }

  get searchTerm(): string {
      return this._searchTerm;
  }
  set searchTerm(val: string) {
      this._searchTerm = val;
      this.filterArray = this.filter(val);
  }

  /**
   * Filtro para los campos dados
   * 
   * @param v Campo para la filtración
   * @returns Campo filtrado
   */
  filter(v: string) {
    return this.userList.filter(x => x.nombre.toLowerCase().
        indexOf(v.toLowerCase()) !== -1 || x.correo.toLowerCase().indexOf(v.toLowerCase()) !== -1);
  }

  /**
   * Acción para eliminar un usuario de la base de datos
   * 
   * @returns Número de contacto con el encargado
   */
  deleteUser(user:any, opc: boolean): void {
    this.firebaseauthService.getUid().then(
      (res) => {
        // console.log();
        const data = {
          uid: res,
          uidChangeState: user.uid,
          state: opc,
        }
        Swal.fire({
          title: 'Procesando petición',
          html: 'Por favor espere un momento...',
          showCancelButton: false,
          showConfirmButton: false, 
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading()
          }
        });
        this.httpService.deleteUser(data)
        .subscribe({
          next: () => {
            if (opc) {
              Swal.fire({
                icon:'success',
                title:'Deshabilitación exitosa!!',
                confirmButtonText:'Aceptar',
              }).then(value => {     
              });
  
              this.adminService.deleteAdministrator(user.uid, !opc).then()
              .catch(error => {
                console.log(error);
              });
            } else {
              Swal.fire({
                icon:'success',
                title:'Activación exitosa!!',
                confirmButtonText:'Aceptar',
              }).then(value => {     
              })
              this.adminService.deleteAdministrator(user.uid, !opc).then()
              .catch(error => {
                console.log(error);
              });
            }
          },
          error: (error)=>{
            Swal.fire({
              icon:'error',
              title:'Error al eliminar, intente más tarde!!',
              confirmButtonText:'Aceptar',
            }).then(value => {     
            })
          },
          complete: () => console.log()
        })
      }
    )
    .catch(
      ()=> {
        console.log('Error de eliminación');
      }
    );
  }

  /**
   * Controlador del modal específico
   * 
   * @param targetModal Servicio del NgbModal a utilizar
   * @param user Usuario administrador que se pasa
   * @returns Modal con datos del usuario administrador
   */
  openModal(targetModal: NgbModal, user: userAdministrador | null) {
    this.modalService.open(targetModal, {
        centered: true,
        backdrop: 'static'
    });

    if (user != null) {
      this.editAdminForm?.patchValue({
        uid: user.uid,
        nombre: user.nombre,
        ciudad: user.ciudad,
        direccion: user.direccion,
        cedula: user.cedula,
        telefono: user.telefono,
      });
      this.formSubmittedEdit = false;    
    } else {
      this.formSubmittedCreate = false;
    }
  }

  /**
   * Edita un usuario administrador
   * 
   * @returns Usuario editado
   */
  editarAdministrador() {
    this.formSubmittedEdit = true;    

    if(this.editAdminForm.invalid){
      return;
    }

    Swal.fire({
      title: 'Actualizando usuario',
      html: 'Por favor espera un momento...',
      showCancelButton: false,
      showConfirmButton: false, 
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading()
      }
    });

    this.adminService.editAdministrador(this.editAdminForm.value.uid, this.editAdminForm.value)
    .then(()=> {
      this.closeBtnClick();
      Swal.fire({
        icon:'success',
        title:'Editado exitosamente!!'
      });
    },()=> {
      Swal.fire({
        icon:'error',
        title:'Se presentó un error al editar, por favor intentelo nuevamente'
      });
    });
  }

  /**
   * Validación de los campos a editar
   * 
   * @param field Campo a validar
   * @returns Verifica que el campo sea correcto al formato, en
   * caso contrario retorna false
   */
  invalidFieldEdit( field: string ): boolean {    
    if ( this.editAdminForm.get(field)!.invalid && this.formSubmittedEdit ) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Controlador del cierre del modal
   */
  closeBtnClick() {
    this.modalService.dismissAll();
    this.ngOnInit();
  }

}
