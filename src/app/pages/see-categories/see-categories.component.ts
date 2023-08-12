import { Component, OnInit } from '@angular/core';
import { FirestoreService } from '../../services/firestore.service';
import { Categoria } from '../../models/models';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-see-categories',
  templateUrl: './see-categories.component.html',
  styleUrls: ['./see-categories.component.scss']
})
export class SeeCategoriesComponent implements OnInit {

  public charging: boolean = true;
  public charging2: boolean = true;
  public uploadedImage: boolean = false;

  private path = 'Categorias/';

  public categories: Categoria[] = [];

  public limit: number = 8;
  public reiniciarLimit: boolean = false;
  public tableSizes = [8, 16, 50, 100];

  public actualPage: number = 1;

  private nextPage: boolean = true;
  private endBefore: any = null;

  public thereIsNoNextPage: boolean = false;
  public noPreviousPage: boolean = true;
  public noPreviousPage2: boolean = true;

  public firstDocument: any = null;
  public lastDocument: any = null;

  public thereArePublications: boolean = true;

  public totalProductos: number = 0;
  public directToHomePage: boolean = true;
  cpageSize = 8;

     /**
   * Constructor del componente see-products
   * 
   * @param firestoreService Servicio para realizar consultas de CRUD a las colecciones de BD 
   */
  constructor(
    public firestoreService: FirestoreService,
  ) { }

  ngOnInit(): void {
    if(localStorage.getItem('hide-side-menu') === 'true'){
      this.directToHomePage = true;
    }else{
      this.directToHomePage = false;
    }

    this.loadCategories();
  }

  loadCategories() {
    this.charging = true;
    this.charging2 = true;
    this.thereArePublications = true;
    let startAt = null;
    if (this.categories.length && !this.reiniciarLimit) {
        startAt = this.categories[this.categories.length - 1].fecha || null;
        this.endBefore = this.categories[0].fecha;
    }else if(this.reiniciarLimit){
      //Esto es para cuando se seleccione un limite diferente de datos se comienze desde el cero
      startAt = null;
    }

    if(this.nextPage){
      const desuscribir = this.firestoreService.getCollection<Categoria>(this.path, this.limit, startAt).subscribe({
        next: (resp) => {
          this.charging = false;
          this.categories = resp;
          if(!this.reiniciarLimit){
            this.noPreviousPage = false;
          }
          if(resp.length == 0){
            this.thereArePublications = false;
          }else{
            startAt = this.categories[this.categories.length - 1].fecha || null;
          }
          const desuscribir2 = this.firestoreService.getCollection<Categoria>(this.path, 1, startAt).subscribe({
            next: (res) => {
              this.charging2 = false;
              if(res.length == 0){
                this.thereIsNoNextPage = true;
              }
              desuscribir2.unsubscribe();
            },
            error: (e) => {
              return Swal.fire('Error', 'Error al cargar datos, por favor intente nuevamente.', 'error' );
            },
            complete: () => console.log()
          });
          //Ponemos nuevamente el reiniciarLimit en false para poder paginar correctamente los resultados
          this.reiniciarLimit = false; 
          desuscribir.unsubscribe();
        },
        error: (e) => {
          return Swal.fire('Error', 'Error al cargar datos, por favor intente nuevamente.', 'error' );
        },
        complete: () => console.log()
        });
    }else{
      const desuscripcion = this.firestoreService.getCollectionPreviousPage<Categoria>(this.path, this.limit, this.endBefore).subscribe({
        next: (resp) => {
          this.charging = false;
          this.categories = resp;
          this.endBefore = this.categories[0].fecha;
          this.thereIsNoNextPage = false;
          desuscripcion.unsubscribe();
          const desuscripcion2 = this.firestoreService.getCollectionPreviousPage<Categoria>(this.path, 1, this.endBefore).subscribe({
            next: (res) => {
              this.charging2 = false;
              if(res.length == 0){
                this.noPreviousPage = true;
              }
              desuscripcion2.unsubscribe();
            },
            error: (e) => {
              return Swal.fire('Error', 'Error al cargar datos, por favor intente nuevamente.', 'error' );
            },
              complete: () => console.log()
          }); 
        },
        error: (e) => {
          return Swal.fire('Error', 'Error al cargar datos, por favor intente nuevamente.', 'error' );
        },
        complete: () => console.log()
      });
      //Ponemos nuevamente el reiniciarLimit en false para poder paginar correctamente los resultados
      this.reiniciarLimit = false; 
    }
  }

    /**
   *  Navega hacia la página siguiente de productos.
   *
   * @returns void.
   */
  nextPageP(){
    this.nextPage = true;
    this.noPreviousPage2 = false;
    this.loadCategories();
  }

    /**
   *  Navega hacia la página anterior de productos.
   *
   * @returns void.
   */
  previousPage(){
    this.nextPage = false;
    this.loadCategories();
  }

    /**
   *  Cambia el límite de productos a mostrar.
   *
   * @param event el evento con las acciones para cambiar el limite.
   * @returns void.
   */
  onTableSizeChange(): void {
    this.limit = this.cpageSize;
    this.actualPage = 1;
    this.noPreviousPage = true;
    this.thereIsNoNextPage = false;
    this.nextPage = true;
    this.reiniciarLimit = true;
    this.loadCategories();
  }

}
