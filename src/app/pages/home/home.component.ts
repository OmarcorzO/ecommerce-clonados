import { Component, OnInit } from "@angular/core";
import { PerfectScrollbarConfigInterface } from "ngx-perfect-scrollbar";
import { FirestoreService } from "../../services/firestore.service";
import { AuthService } from "../../services/auth.service";
import { SalesService } from '../../services/sales.service';

import { Subscription } from 'rxjs';

import Swal from "sweetalert2";

import { Producto } from "../../models/models";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"],
})
export class HomeComponent implements OnInit {

  public config: PerfectScrollbarConfigInterface = {};

  public loadingProducts: boolean = true;

  private path = "Productos/";

  public products: Producto[] = [];

  public uid: string = "";

  /**
   * Constructor del componente home
   *
   * @param firestoreService Servicio para realizar consultas de CRUD a las colecciones de BD
   * @param auth_service Servicio que utiliza métodos de autenticación
   */
  constructor(
    public firestoreService: FirestoreService,
    public auth_service: AuthService,
    public salesService: SalesService
  ) {}

  /**
   * Realiza las primeras acciones al cargar
   * el componente
   *
   * @returns {Promise<void>} Obtiene el uid del usuario y
   * realiza el metodo de loadLatestProducts al cargar el
   * componente
   */
  async ngOnInit() {
    Swal.close();
    this.uid = await this.auth_service.getUid();
    this.loadLatestProducts();
  }


  /**
   * Muestra los ultimos productos publicados por todos los
   * usuarios y también las ultimas publicaciones de productos
   * del usuario logueado.
   *
   * @returns void
   */
  loadLatestProducts() {
    this.loadingProducts = true;
    let startAt = null;

    const desuscribir = this.firestoreService
      .getCollection<Producto>(this.path, 20, startAt)
      .subscribe({
        next: (resp) => {
          this.loadingProducts = false;
          this.products = resp;
          desuscribir.unsubscribe();
        },
        error: (e) => {
          return Swal.fire('Error', 'Error al cargar datos, por favor intente nuevamente.', 'error' );
        },
        complete: () => console.log()
      });
  }
}
