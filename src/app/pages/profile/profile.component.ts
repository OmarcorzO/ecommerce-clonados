import { Component, OnInit } from '@angular/core';
import { AuthService } from "../../services/auth.service";
import { FirestoreService } from "../../services/firestore.service";
import { Usuario } from "../../models/models";
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import {Md5} from 'ts-md5/dist/md5';
import { FirestorageService } from 'src/app/services/firestorage.service';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import domainsEmailJson from '../../auth/login/email_domains.json';
import { SwalService } from 'src/app/services/swalNotification/swal.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  private domainsEmails:any[] = domainsEmailJson.domains;
  public uid;
  public tempImg: any = null;
  newImage = '';
  newFile: any;
  alerta_roja = false;
  public fotoCargada: boolean = true;

  active = 1;
  public formSubmitted = false;
  public formSubmittedC = false;
  public cargando: boolean = true;

  private validImageExtension: boolean = true;
  private allowedFileSize: boolean = true;

  /**
   * Imagen por defecto
   */
  public fotoPerfilDefault ='https://firebasestorage.googleapis.com/v0/b/ecommerce-guajira.appspot.com/o/foto-perfil%2Fblank-profile-picture-973460.png?alt=media&token=b6b6dd76-21bc-487e-8112-3fbedb415892';

  clienteVista: Usuario = {
    uid: '',
    correo: '',
    img: '',
    nombre: '',
    contrasena: '',
    ciudad: '',
    direccion: '',
    cedula: '',
    telefono: '',
    terminos: false,
    fecha: new Date,
  };

  clienteEdit: Usuario = {
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


  /**
   * Constructos del componente Profile
   *
   * @param authService Servicio que utiliza métodos de autenticación
   * @param firestoreService Servicio para realizar consultas de CRUD a las colecciones de BD
   * @param fb Constructor de formularios
   * @param firestorageService Servicio para montar imagenes de firebase
   * @param angularStorageService Servicio de angular que integra el funcionamiento de subir imagenes
   */
  constructor(public authService: AuthService,
    public firestoreService: FirestoreService,
    private fb: FormBuilder,
    public firestorageService: FirestorageService,
    public angularStorageService: AngularFireStorage,
    private swalService: SwalService
    ) { }

  /**
   * Inicializa los distintos métodos al iniciar el componente
   *
   * @returns Inicia los distintos métodos especificados
   */
  async ngOnInit(){
    this.uid = await this.authService.getUid();
    this.firestoreService.getDoc<Usuario>('Usuarios', this.uid).subscribe({
      next: (res) => {
        this.clienteEdit = res;
        this.tempImg = res.img;
      },
      error: (e) => {
      },
      complete: () => console.log()
    });
  }

  public profileForm = this.fb.group({
    uid: [this.clienteEdit.uid, [ Validators.minLength(5), Validators.maxLength(32) ] ],
    nombre: [this.clienteEdit.nombre, [ Validators.required, Validators.minLength(4), Validators.maxLength(64) ] ],
    ciudad: [this.clienteEdit.ciudad, [ Validators.required, Validators.minLength(4), Validators.maxLength(64) ] ],
    direccion: [this.clienteEdit.direccion, [ Validators.required, Validators.minLength(7), Validators.maxLength(100) ] ],
    cedula: [this.clienteEdit.cedula, [ Validators.required, Validators.minLength(8), Validators.maxLength(10) ] ],
    telefono: [this.clienteEdit.telefono, [ Validators.required, Validators.minLength(10), Validators.maxLength(10) ] ],
    correo: [this.clienteEdit.correo, [ Validators.required, Validators.email, Validators.pattern(/^[a-zA-Z0-9\.\_\-]+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/) ] ],
    fecha: [this.clienteEdit.fecha, [ Validators.required ] ],
    registro_completado: false,
    img: ['', [Validators.minLength(3)] ],
  });

  public contrasenaForm = this.fb.group({
    contrasena: ['', [ Validators.required, Validators.minLength(8), Validators.maxLength(64) ] ],
    contrasena2: ['', [ Validators.required, Validators.minLength(8), Validators.maxLength(64) ] ],
    fecha: ['', [ Validators.required ] ],
  }, {
    validators: this.samePasswords('contrasena', 'contrasena2')
  });


  /**
  * Registro de nuevos campos al usuario
  *
  * @returns Realiza la validación del perfil y del usuario
  * que actualizará datos.
  */
  async registrarse() {
    const fechaActual = new Date();
    this.formSubmitted = true;
    this.profileForm.patchValue({ fecha: fechaActual });
    this.profileForm.patchValue({ cedula: this.profileForm.get('cedula')?.value.toString() });

    if(this.profileForm.invalid){
      return;
    }

    this.profileForm.patchValue({ registro_completado: true });
    const uid = await this.authService.getUid();
    this.uid = uid;
    this.actualizarUser();
 }

  /**
  * Actualización de usuario según sus campos básicos
  *
  * @return Actualiza los datos básicos del usuario incluyendo la
  * imagen si la selecciona.
  */
  async actualizarUser() {
    
    // Apartado de actualizar perfil de usuario, son los campos iniciales
    this.profileForm.patchValue({ uid: this.uid });
    const path = 'Usuarios';

    let name = this.profileForm.get('uid').value;
    const filePath = 'foto-perfil/' + name;

    if (this.newFile !== undefined && this.validImageExtension && this.allowedFileSize ) {
      
      this.authService.loadingData();

      this.firestorageService.uploadImage(this.newFile, filePath).then(()=> {
        const ref = this.angularStorageService.ref(filePath);
        ref.getDownloadURL()
        .subscribe({
          next: url => {
          this.profileForm.patchValue({img:url});
          const res = this.firestoreService.updateDoc<Usuario>(this.profileForm.value, path, this.uid).then( res => {
            const unsubscribe = this.authService.stateAuth()
            .subscribe({
              next: (user) => {
                user.updateEmail(this.profileForm.get('correo').value);
                this.newFile = undefined;
                Swal.fire({
                  icon: 'success',
                  title: 'Actualización exitosa!!'
                });
                unsubscribe.unsubscribe();
              },
              error: (e) => {
                return Swal.fire('Error', 'Error al realizar la actualización', 'error' );
              },
              complete: () => console.log()
            });
            this.contrasenaForm.reset();
            }).catch( error => {
            });
          },
          error: (e) => {
            return Swal.fire('Error', 'Error al subir imagen', 'error' );
          },
          complete: () => console.log()
        })
      });
    } else if (this.newFile === undefined && this.validImageExtension && this.allowedFileSize  ){
      this.authService.loadingData();
      const { img, ...data } = this.profileForm.value;

      const res = this.firestoreService.updateDoc<Usuario>(data, path, this.uid).then( res => {
        const unsubscribe = this.authService.stateAuth().subscribe({
          next: (user) =>{
            user.updateEmail(this.profileForm.get('correo').value);
            Swal.fire({
              icon: 'success',
              title: 'Actualización exitosa!!'
            });
            this.contrasenaForm.reset();
            unsubscribe.unsubscribe();
          },
          error: (e) => {
            return Swal.fire('Error', 'Error al realizar la actualización', 'error' );
          },
          complete: () => console.log()
        });
      }).catch( error => {
      });
    }else{
      if( !this.validImageExtension ){
        Swal.fire('Error', "Formato de imagen no válido", 'error');
      }else{
        Swal.fire('Error', "Tamaño de imagen no válido. La imagen no puede pesar mas de 5mb", 'error');
      }
    }
  }

  /**
   * Cambia la contraseña del usuario logeado
   *
   * @returns Si cumple los parametros actualiza la contraseña
   * del usuario.
   */
  async cambiarContra(){

    const fechaActual = new Date();
    this.formSubmittedC = true;
    this.contrasenaForm.patchValue({ fecha: fechaActual });

    if(this.contrasenaForm.invalid){
      return;
    }

    this.authService.loadingData();

    const path = 'Usuarios';

    let hash = Md5.hashStr(this.contrasenaForm.get('contrasena').value);
    const passwordUpdate = this.contrasenaForm.get('contrasena').value;
    this.contrasenaForm.patchValue({contrasena: hash});
    this.contrasenaForm.patchValue({contrasena2: hash});

    const { contrasena2, ...data } = this.contrasenaForm.value;
    this.contrasenaForm.reset();
    this.formSubmittedC = false;

    this.firestoreService.updateDoc<Usuario>(data, path, this.uid).then( res => {
      const unsubscribe = this.authService.stateAuth()
      .subscribe({
        next: (user) =>{
          user.updatePassword(passwordUpdate)
          Swal.fire({
            icon: 'success',
            title: 'Actualización exitosa!!'
          });
          unsubscribe.unsubscribe();
        },
        error(e) {
          return Swal.fire('Error', 'Error al cambiar la contraseña', 'error' );
        },
        complete: () => console.log()
      });
    }).catch( error => {
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
   * Valida que los campos de contraseña sean correctos
   *
   * @param field Campo a validar.
   * @returns Si no hay problemas con los campos de contraseña retorna true,
   * en caso contrario retorna false.
   */
  invalidFieldC( field: string ): boolean {

    if ( this.contrasenaForm.get(field)!.invalid && this.formSubmittedC ) {
      return true;
    } else {
      return false;
    }

  }

  /**
   * Valida que los campos de perfil sean correctos
   *
   * @param field Campo contraseña a validar.
   * @returns Si rellenó correctamente los campos de perfil retorna true,
   * en caso contrario retorna false.
   */
  invalidFieldP( field: string ): boolean {

    if ( this.profileForm.get(field)!.invalid && this.formSubmitted ) {
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
    const pass1 = this.contrasenaForm.get('contrasena')!.value;
    const pass2 = this.contrasenaForm.get('contrasena2')!.value;

    if ( (pass1 !== pass2) && this.formSubmittedC ) {
      return true;
    } else {
      return false;
    }

  }

  /**
   * Administra los mensajes de error para datos del perfil
   *
   * @param field Campo a validar
   * @returns De acuerdo al error que tenga el campo asigna el mensaje respectivo,
   * si no hubo ningún error no se asigna el mensaje al campo.
   */
  getErrorMessage(field: string): string{
    let message = '';
      //.errors?.required
    if(this.profileForm.get(field)!.hasError('required')){
      message = 'Este campo es requerido';
    }else if(this.profileForm.get(field)!.hasError('minlength')){
      const minLength = this.profileForm.get(field)!.errors?.minlength.requiredLength;
      message = `Este campo debe tener un mínimo de ${minLength} caracteres`;
    }else if(this.profileForm.get(field)!.hasError('maxlength')){
      const maxLength = this.profileForm.get(field)!.errors?.maxlength.requiredLength;
      message = `Este campo debe tener un máximo de ${maxLength} caracteres`;
    }else if(this.profileForm.get(field)!.hasError('pattern')){
       message = 'Este campo debe tener un minimo de 7 caracteres y debe tener al menos un número';
    }

    return message;
  }

  getErrorMessageFromMail(field: string): string{
    let message = '';
    if(this.profileForm.get(field)!.hasError('pattern')){
       message = 'Correo invalido';
    }
    return message;
  }

  /**
   * Administra los mensajes de error para la contraseña
   *
   * @param field Campo contraseña a validar.
   * @returns De acuerdo al error que tenga el campo asigna el mensaje respectivo,
   * si no hubo ningún error no se asigna el mensaje al campo.
   */
  getErrorMessageC(field: string): string{
    let message = '';
      //.errors?.required
    if(this.contrasenaForm.get(field)!.hasError('required')){
      message = 'Este campo es requerido';
    }else if(this.contrasenaForm.get(field)!.hasError('minlength')){
      const minLength = this.contrasenaForm.get(field)!.errors?.minlength.requiredLength;
      message = `Este campo debe tener un minimo de ${minLength} caracteres`;
    }else if(this.contrasenaForm.get(field)!.hasError('maxlength')){
      const maxLength = this.contrasenaForm.get(field)!.errors?.maxlength.requiredLength;
      message = `Este campo debe tener un maximo de ${maxLength} caracteres`;
    }else if(this.contrasenaForm.get(field)!.hasError('pattern')){
       message = 'Este campo debe tener un minimo de 7 caracteres y debe tener al menos un número';
    }

    return message;
  }

  checkImageExtension( file: File ){

    const cutName = file.name.split('.');
    const fileExtension = cutName[cutName.length - 1];

    // Validar extension
    const validExtensions = ['png', 'jpg', 'jpeg', 'PNG', 'JPG', 'JPEG'];
    if (!validExtensions.includes(fileExtension)) {
        this.validImageExtension = false;
    } else {
        this.validImageExtension = true;
    }

  }

  checkFileSize( file: File ){

    if ( file.size > 5242880 ) {
        this.allowedFileSize = false;
    } else {
        this.allowedFileSize = true;
    }

  }

  /**
   * Captura la imagen que se subirá
   *
   * @param event Evento que escucha los cambios de imagen
   * @returns Si hay una imagen seleccionada la mostrará en la parte
   * seleccionada, en caso contrario mostrará una por defecto.
   */
  async newImageUpload(event: any) {

    this.checkImageExtension(event.target.files[0]);
    this.checkFileSize(event.target.files[0]);

    if (event.target.files && event.target.files[0] && this.validImageExtension && this.allowedFileSize) {
        this.newFile = event.target.files[0];
        const reader = new FileReader();
        reader.onload = ((image) => {
          const result = image.target.result as string;
        });
        reader.readAsDataURL(event.target.files[0]);
        reader.onloadend = () => {
          this.tempImg = reader.result;
        }
        this.fotoCargada = true;
    } else {
      this.newFile = undefined;
      this.alerta_roja = true;
      this.tempImg = this.fotoPerfilDefault;
    }
  }

  /**
   * Controla la navegación de las opciones del perfil
   *
   * @param event Objeto que contiene los campos del navigate
   */
  detectChanges(event) {
    
    if (event.nextId == 1 || event.nextId == 2) {
      this.contrasenaForm.reset();
      this.formSubmittedC = false;
    }
  }

  /**
   * valida los campos de un formulario
   * @returns boolean
   */
  // validateFields() {
  //   return (this.validateEmail());
  // }

  /**
   * Valida el correo electronico ingresado
   * @returns boolean
   */
  // validateEmail() {
  //   let email:string = this.profileForm.value.correo;
  //   email = email.replace(/ /g,'');
  //   const validateEmail = email.search(/^[a-zA-Z0-9]+@[a-zA-Z]+(?:\.[a-zA-Z]+)*$/g) !== -1;
  //   if(!validateEmail)
  //   {
  //     this.swalService.genericWarning('Correo electronico invalido');
  //     return false;
  //   }
  //   const startEmailDomain = email.search(/@[a-zA-Z]*/g)+1;
  //   const emailDomain = email.substring(startEmailDomain, email.length);
  //   const validateDomain = this.domainsEmails.findIndex((domain) => domain === emailDomain) !== -1;
  //   if (!validateDomain) {
  //     this.swalService.genericWarning('Correo electronico invalido');
  //     return false;
  //   }
  //   return true
  // }
}
