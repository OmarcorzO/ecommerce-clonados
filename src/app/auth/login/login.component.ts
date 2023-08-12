import { Component } from "@angular/core";
import { RouterModule, Router } from "@angular/router";
import { FormBuilder, Validators } from "@angular/forms";
import { AuthService } from "../../services/auth.service";
import { FirestoreService } from "../../services/firestore.service";
import domainsEmailJson from './email_domains.json';
import { Md5 } from "ts-md5/dist/md5";
import Swal from "sweetalert2";
import sha256 from "crypto-js/sha256";
import Base64 from "crypto-js/enc-base64";
import { SwalService } from "src/app/services/swalNotification/swal.service";


@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  providers: [],
})
export class LoginComponent {
  // uid = '';

  ingresarEnable = false;

  private domainsEmails:any[] = domainsEmailJson.domains;

  /**
   * @ignore
   */
  private privateKey = "CUA777$";

  msg = "";
  public formSubmitted = false;
  hide = true;

  public loginForm = this.fb.group({
    correo: [
      '',
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
      [Validators.required, Validators.minLength(8), Validators.maxLength(64)],
    ],
    recordarme: [true],
  });

  /**
   * Constructor del LoginComponent
   *
   * @param router Servicio de rutas para el direccionamiento de páginas
   * @param fb Constructor de formularios
   * @param firebaseauthService Servicio que utiliza métodos de autenticación
   * @param firestoreService Servicio para realizar consultas de CRUD a las colecciones de BD
   */
  constructor(
    private router: Router,
    private fb: FormBuilder,
    public firebaseauthService: AuthService,
    public firestoreService: FirestoreService,
    private swalService: SwalService
  ) {}

  loginform = true;
  recoverform = false;

  /**
   * Inicio de sesión del usuario en el aplicativo
   *
   * @returns Logeo del usuario
   */
  login() {
    this.formSubmitted = true;
    if (this.loginForm.invalid) {
      return;
    }
    this.swalService.notificationLoading('Iniciando sesión...');

    const credenciales = {
      correo: this.loginForm.value.correo,
      // contrasena: Md5.hashStr(this.loginForm.value.contrasena),
      contrasena: this.loginForm.value.contrasena,
    };

    this.firebaseauthService
      .login(credenciales.correo, credenciales.contrasena)
      .then((res) => {
        const unsubscribe = this.firestoreService
          .getDoc("Usuarios", res.user.uid)
          .subscribe({
            next: (user: any) => {
              Swal.fire({
                title: "Cargando!!",
                html: "Por favor espera un momento...",
                showCancelButton: false,
                showConfirmButton: false,
                allowOutsideClick: false,
                didOpen: () => {
                  Swal.showLoading();
                },
              });
              const valorRolUsuario = Base64.stringify(
                sha256(user.rol),
                this.privateKey
              );
              const rol = Base64.stringify(sha256("rol"), this.privateKey);
              sessionStorage.setItem(rol, valorRolUsuario);
              // Navegar al Dashboard
              localStorage.setItem('nombreUser', user.nombre);
              localStorage.setItem('correoUser', user.correo);
              localStorage.setItem('imgUser', user.img);
              this.router.navigate(["/dashboard/"]);
              unsubscribe.unsubscribe();
            },
            error: (e) => {
              return Swal.fire('Error', 'Ingreso fallido', 'error' );
            },
            complete: () => console.log()
          });
      })
      .catch((err) => {
        console.log(err);
        Swal.fire("Error", "Email o contraseña incorrectos", "error");
      });
  }

  /**
   * valida los campos de un formulario
   * @returns boolean
   */
  validateFields() {
    return (this.validateEmail());
  }

  /**
   * Valida el correo electronico ingresado
   * @returns boolean
   */
  validateEmail() {
    let email:string = this.loginForm.value.correo;
    email = email.replace(/ /g,'');
    const validateEmail = email.search(/^[a-zA-Z0-9]+@[a-zA-Z]+(?:\.[a-zA-Z]+)*$/g) !== -1;
    if(!validateEmail)
    {
      this.swalService.genericWarning('Correo electronico invalido');
      return false;
    }
    const startEmailDomain = email.search(/@[a-zA-Z]*/g)+1;
    const emailDomain = email.substring(startEmailDomain, email.length);
    const validateDomain = this.domainsEmails.findIndex((domain) => domain === emailDomain) !== -1;
    if (!validateDomain) {
      this.swalService.genericWarning('Correo electronico invalido');
      return false;
    }
    return true
  }

  /**
   * Valida que los campos sean correctos
   *
   * @param field Campo a validar.
   * @returns Si no hay problemas con los campos retorna false,
   * en caso contrario retorna true.
   */
  invalidField(field: string): boolean {
    if (this.loginForm.get(field)!.invalid && this.formSubmitted) {
      return true;
    } else {
      return false;
    }
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
    if (this.loginForm.get(field)!.hasError("required")) {
      message = "Este campo es requerido";
    } else if (this.loginForm.get(field)!.hasError("minlength")) {
      const minLength =
        this.loginForm.get(field)!.errors?.minlength.requiredLength;
      message = `Este campo debe tener un minimo de ${minLength} caracteres`;
    } else if (this.loginForm.get(field)!.hasError("maxlength")) {
      const maxLength =
        this.loginForm.get(field)!.errors?.maxlength.requiredLength;
      message = `Este campo debe tener un maximo de ${maxLength} caracteres`;
    } else if (this.loginForm.get(field)!.hasError("pattern")) {
      message = "Ingrese un email valido";
    }

    return message;
  }
}
