import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { FormBuilder, Validators, FormGroup } from "@angular/forms";
import { AuthService } from "../../services/auth.service";
import { FirestoreService } from "../../services/firestore.service";
import { Usuario } from "../../models/models";
import sha256 from "crypto-js/sha256";
import Base64 from "crypto-js/enc-base64";

import { NgbModal, ModalDismissReasons } from "@ng-bootstrap/ng-bootstrap";
import Swal from "sweetalert2";
import { Md5 } from "ts-md5/dist/md5";
import { SwalService } from "src/app/services/swalNotification/swal.service";
import domainsEmailJson from '../login/email_domains.json';

@Component({
  selector: "app-register",
  templateUrl: "./register.component.html",
  styleUrls: ["./register.component.scss"],
})
export class RegisterComponent {
  uid = "";

  ingresarEnable = false;

  private domainsEmails:any[] = domainsEmailJson.domains;

  public formSubmitted = false;

  closeResult = "";

  private privateKey = "CUA777$";

  //El required true del terms es obligatorio ya que fernando lo hizo mal
  public registerForm = this.fb.group(
    {
      uid: ["", [Validators.minLength(5), Validators.maxLength(32)]],
      nombre: [
        "",
        [
          Validators.required,
          Validators.minLength(4),
          Validators.maxLength(128),
          Validators.pattern(/^[A-Za-z-ZÀ-ÿ\u00f1\u00d1 ]*$/),
        ],
      ],
      correo: [
        "",
        [
          Validators.required,
          Validators.email,
          Validators.pattern(
            /^[a-zA-Z0-9\.\_\-]+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/
          ),
        ],
      ],
      contrasena: [
        "",
        [
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(64),
        ],
      ],
      contrasena2: [
        "",
        [
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(64),
        ],
      ],
      fecha: ["", [Validators.required, Validators.maxLength(64)]],
      img: "",
      direccion: "",
      cedula: "",
      telefono: "",
      ciudad: "",
      registro_completado: false,
      terminos: [false, Validators.requiredTrue],
      rol: ["cliente"],
    },
    {
      validators: this.samePasswords("contrasena", "contrasena2"),
    }
  );

  /**
   * Constructor del RegisterComponent
   *
   * @param fb Constructor de formularios
   * @param router Servicio de rutas para el direccionamiento de páginas
   * @param firebaseauthService Servicio que utiliza métodos de autenticación
   * @param firestoreService Servicio para realizar consultas de CRUD a las colecciones de BD
   */
  constructor(
    private fb: FormBuilder,
    private router: Router,
    public firebaseauthService: AuthService,
    public firestoreService: FirestoreService,
    private modalService: NgbModal,
    private swalService: SwalService
  ) {}

  /**
   * Validación de lo resgitrado antes de guardarlo
   *
   * @returns Validación del usuario existente en la base de authentication
   */
  async registrarse() {
    const fechaActual = new Date();

    this.formSubmitted = true;
    
    this.formatFormRegister();

    this.registerForm.patchValue({ fecha: fechaActual });

    if (this.registerForm.invalid) {
      return;
    }

    let credenciales = {
      correo: this.registerForm.value.correo,
      contrasena: this.registerForm.value.contrasena,
    };

    this.loadingRegister();

    const res = await this.firebaseauthService
      .registrar(credenciales.correo, credenciales.contrasena)
      .catch((err) => {
        console.log("error -> ", err);
        Swal.fire({
          icon: "error",
          title: "Correo ya existente, por favor digite otro!!",
        });
      });

    const uid = await this.firebaseauthService.getUid();
    this.uid = uid;
    credenciales.contrasena = Md5.hashStr(this.registerForm.value.contrasena);
    this.guardarUser(credenciales);
  }

  formatFormRegister() {
    this.registerForm.patchValue({
      nombre: this.registerForm.value.nombre.trim(),
    });
  }

  /**
   * Guarda el usuario cliente registrado en la base de datos
   *
   * @param credenciales Campos correo y contraseña verificados con anterioridad
   * @returns Guardado de documento usuario en las colecciones
   */
  async guardarUser(credenciales) {
    this.registerForm.patchValue({ uid: this.uid });
    const path = "Usuarios";

    //Extraemos el campo contrasena2 para que no se guarde en la base de datos, solo era para validación
    const { contrasena2, ...data } = this.registerForm.value;
    data.contrasena = credenciales.contrasena;

    this.firestoreService
      .createDoc<Usuario>(data, path, this.uid)
      .then(() => {
        // Navegar al Dashboard
        localStorage.setItem('nombreUser', data.nombre);
        localStorage.setItem('correoUser', data.correo);
        localStorage.setItem('imgUser', data.img);
        const valorRolUsuario = Base64.stringify(
          sha256(data.rol),
          this.privateKey
        );
        const rol = Base64.stringify(sha256("rol"), this.privateKey);
        sessionStorage.setItem(rol, valorRolUsuario);
        this.router.navigate(["/dashboard/"]);

        Swal.fire({
          icon: "success",
          title: "Registrado con exito!!",
        });
      })
      .catch((error) => {});
  }

  /**
   * Valida que los campos sean correctos
   *
   * @param field Campo a validar.
   * @returns Si no hay problemas con los campos retorna false,
   * en caso contrario retorna true.
   */
  invalidField(field: string): boolean {
    if (this.registerForm.get(field)!.invalid && this.formSubmitted) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Validación de los términos y condiciones del usuario
   *
   * @returns Terminos y condiciones aceptados
   */
  acceptTerms() {
    return !this.registerForm.get("terminos")!.value && this.formSubmitted;
  }

  /**
   * Valida que ambas contraseñas sean iguales
   *
   * @returns Si ambas contraseñas del form respectivo son correctas
   * retorna false, en caso contrario retorna true como alerta.
   */
  invalidPasswords() {
    const pass1 = this.registerForm.get("contrasena")!.value;
    const pass2 = this.registerForm.get("contrasena2")!.value;

    if (pass1 !== pass2 && this.formSubmitted) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Validación de campo contraseña
   *
   * @param pass1Name Contraseña original
   * @param pass2Name Contraseña para verificar
   * @returns Si ambas campos son iguales no presenta problemas,
   * en caso contrario, asigna el respectivo mensaje de error.
   */
  samePasswords(pass1Name: string, pass2Name: string) {
    return (formGroup: FormGroup) => {
      const pass1Control = formGroup.get(pass1Name)!;
      const pass2Control = formGroup.get(pass2Name)!;

      if (pass1Control.value === pass2Control.value) {
        pass2Control.setErrors(null);
      } else {
        pass2Control.setErrors({ noEsIgual: true });
      }
    };
  }

  /**
   * Administra los mensajes de error para los datos del formulario
   *
   * @param field Campo a validar
   * @returns De acuerdo al error que tenga el campo asigna el mensaje respectivo,
   * si no hubo ningún error no se asigna el mensaje al campo.
   */
  getErrorMessage(field: string): string {
    let message = "";
    //.errors?.required
    if (this.registerForm.get(field)!.hasError("required")) {
      message = "Este campo es requerido";
    } else if (this.registerForm.get(field)!.hasError("minlength")) {
      const minLength =
        this.registerForm.get(field)!.errors?.minlength.requiredLength;
      message = `Este campo debe tener un mínimo de ${minLength} caracteres`;
    } else if (this.registerForm.get(field)!.hasError("maxlength")) {
      const maxLength =
        this.registerForm.get(field)!.errors?.maxlength.requiredLength;
      message = `Este campo debe tener un máximo de ${maxLength} caracteres`;
    } else if (this.registerForm.get(field)!.hasError("pattern")) {
      message = "El campo es invalido";
    }

    return message;
  }

  /**
   * Administra los mensajes de error para los campos de contraseña
   *
   * @param field Campo a validar
   * @returns De acuerdo al error que tenga el campo asigna el mensaje respectivo,
   * si no hubo ningún error no se asigna el mensaje al campo.
   */
  getErrorMessagePassword(field: string): string {
    let message = "";
    //.errors?.required
    if (this.registerForm.get(field)!.hasError("required")) {
      message = "Este campo es requerido";
    } else if (this.registerForm.get(field)!.hasError("minlength")) {
      const minLength =
        this.registerForm.get(field)!.errors?.minlength.requiredLength;
      message = `Este campo debe tener un mínimo de ${minLength} caracteres`;
    } else if (this.registerForm.get(field)!.hasError("maxlength")) {
      const maxLength =
        this.registerForm.get(field)!.errors?.maxlength.requiredLength;
      message = `Este campo debe tener un máximo de ${maxLength} caracteres`;
    } else if (this.registerForm.get(field)!.hasError("pattern")) {
      message =
        "Este campo debe tener un mínimo de 8 caracteres y debe tener al menos un número y una letra";
    }

    return message;
  }

  /**
   *  Muestra el modal para ver los términos y condiciones.
   *
   * @param content1 el identificador para abril un modal.
   * @returns void.
   */
  openModal(content1: string) {
    this.modalService
      .open(content1, { ariaLabelledBy: "modal-basic-title", size: "lg" })
      .result.then(
        (result) => {
          this.closeResult = `Closed with: ${result}`;
        },
        (reason) => {
          this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
        }
      );
  }

  /**
   *  Cierra el modal de los términos y condiciones.
   *
   * @returns un string con un mensaje informativo.
   */
  private getDismissReason(reason: ModalDismissReasons): string {
    this.formSubmitted = false;
    if (reason === ModalDismissReasons.ESC) {
      return "by pressing ESC";
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return "by clicking on a backdrop";
    } else {
      return `with: ${reason}`;
    }
  }

    /**
   * Loading de información
   * 
   * @returns Alerta de cargando
   */
  loadingRegister(){
    Swal.fire({
      title: 'Registrando!',
      html: 'Por favor espera un momento...',
      showCancelButton: false,
      showConfirmButton: true, 
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading()
      }
    }); 
  }

  /**
   * Valida el correo electronico ingresado
   * @returns boolean
   */
  //  validateEmail() {
  //   let email:string = this.registerForm.value.correo;
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

  closeSwalLoading()
  {
    Swal.close();
  }
}
