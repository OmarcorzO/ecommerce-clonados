import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subject, Subscription } from 'rxjs';
import { Producto, Pedido, Usuario, ProductoPedido } from '../models/models';
import { AuthService } from './auth.service';
import { FirestoreService } from './firestore.service';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  private pedido: Pedido;
  //Esto es para observar todos los cambios que pasen en pedido, por eso se coloca el $, es decir, esto es un observable de ese
  //sujeto pedido, recuerda el ejemplo de instagram donde nos suscribimos a un sujeto y somos notificados de cualquier cosa que haga ese
  //sujeto al que seguimos, por lo tanto al ser notificados reaccionamos o hacemos cualquier cosa a ese sujeto
  //NOTA: Este es un sujeto de tipo pedido
  pedido$ = new Subject<Pedido>();
  path = 'carrito/';
  uid = '';
  cliente: Usuario;

  carritoSuscriber: Subscription;
  clienteSuscriber: Subscription;

     /**
   * Constructor del servicio de cart
   * 
   * @param firebaseauthService Servicio que utiliza métodos de autenticación
   * @param firestoreService Servicio para realizar consultas de CRUD a las colecciones de BD 
   * @param router Constructor para redirigir a otras paginas de la aplicación
   */
  constructor(public firebaseauthService: AuthService,
              public firestoreService: FirestoreService,
              public router: Router) {

        //Esto es para verificar si el usuario esta autenticado o no
        this.initCarrito();
        this.firebaseauthService.stateAuth().subscribe( res => {
            //Si la respuesta es diferente de null es porque esta autenticado
            if (res !== null) {
                this.uid = res.uid;
                this.loadCLiente();
            }
        });
   }

   /**
   * Carga todos los datos del carrito del usuario
   * logueado
   * 
   * @returns void
   */
  loadCarrito() {
    //Esta ruta es donde se va guardar el pedido agregado al carrito
    const path = 'Usuarios/' + this.uid + '/' + 'carrito';
    if (this.carritoSuscriber) {
        this.carritoSuscriber.unsubscribe();
    }
    this.firestoreService.getDoc<Pedido>(path, this.uid).subscribe( res => {
        //Si existe una respuesta es porque ya hay productos agregados al carrito
        if (res) {
            this.pedido = res;
            //Aqui si se detecta algun cambio, es decir, como en instagram por ejemplo si un famoso hizo algo como publicar algo
            //eso es un cambio y emitimos algo con el next
            //Aqui siempre hay que emitir algo, en este caso este sujeto emiti siempre cosas que son de tipo pedido
            this.pedido$.next(this.pedido);
        } else {
            //Si no hay una respuesta inicializamos en carrito(this.pedido) en vacio para no tener errores
            this.initCarrito();
        }
    });
  }

   /**
   * Inicializa el objeto de pedido con todos los
   * datos del carrito
   * 
   * @returns void
   */
  initCarrito() {
    //Inicializamos el pedido
    this.pedido = {
        id: this.uid,
        cliente: this.cliente,
        productos: [],
        precioTotal: null,
        fecha: new Date(),
        cantidadProductos: null,
        estado: null,
        referencia: null,
        estadoTransaccion: null
    };
    //Aqui ponemos de nuevo el next porque aqui se genero un cambio en el this.pedido
    this.pedido$.next(this.pedido);
  }

     /**
   * Inicializa el objeto de cliente con todos los
   * datos del usuario logueado
   * 
   * @returns void
   */
  loadCLiente() {
    const path = 'Usuarios';
    const desuscribir = this.firestoreService.getDoc<Usuario>(path, this.uid).subscribe( res => {
        //LLenamos la variable cliente con la info del usuario logueado para utilizarla y agregarla en el this.pedido del initCarrito
        this.cliente = res;
        this.loadCarrito();
        desuscribir.unsubscribe();
    });
  }

     /**
   * Realiza un observable de todo los cambios
   * que suceden en el carrito para estar atentos
   * a esos cambios en tiempo real
   * 
   * @returns void
   */
  getCarrito(): Observable<Pedido> {
    setTimeout(() => {
        //El this.pedido entre parentesis es para pasarle la variable que estamos observando
        this.pedido$.next(this.pedido);
    }, 100);
    return this.pedido$.asObservable();
  }
 
     /**
   * Agrega un nuevo producto al carrito
   * de compras, es decir, agrega y le suma 
   * 1 a la cantidad de ese producto en el carrito
   * 
   * @param producto Objeto de tipo producto, que contiene el
   * producto que se va agregar al carrito
   * @returns void
   */
  addProducto(producto: Producto ) {
    if (this.uid.length) {
        //Aqui buscamos con el fin si existe un id igual al producto.id que se esta pasando por parametro
        //Lo buscamos en el array de productos que esta en this.pedido, el find devuelve el primer valor del arreglo que coincida con la busqueda
        const item = this.pedido.productos.find( productoPedido => {
            return (productoPedido.producto.id === producto.id)
        });
        //Si el find de arriba no encuentra nada devuelve un undefined, por lo tanto hacemos la condición de que si es diferente de
        //undefined es porque si encontro algo, por lo tanto como ya existe ese producto en el arreglo no lo agregamos de nuevo como tal
        //sino que a la cantidad le sumamos para indicar que quieres un producto mas de ese mismo producto 
        if (item !== undefined) {
            if(item.cantidad < producto.stock){
                item.cantidad ++; 
                item.total = (producto.precioNormal - (producto.precioNormal*(producto.precioReducido/100))) * item.cantidad;
            }
        } else {
            //Sino es porque no encontro nada en el arreglo y alli si puedes hacer un push a ese array
            if(producto.precioReducido == 0){
                const add: ProductoPedido = {
                    cantidad: 1,
                    producto,
                    total: producto.precioNormal,
                    calificado: false,
                    comentado: false
                };
                this.pedido.productos.push(add);
            }else{
                const add: ProductoPedido = {
                    cantidad: 1,
                    producto,
                    total: (producto.precioNormal - (producto.precioNormal*(producto.precioReducido/100))),
                    calificado: false,
                    comentado: false
                };
                this.pedido.productos.push(add);
            } 
        }
    } else {
        //Aqui entra si no estamos logueados, nos lleva al perfil 
        this.router.navigate(['/dashboard/ver-productos']);
        return;
    }
    this.pedido$.next(this.pedido);
    const path = 'Usuarios/' + this.uid + '/' + this.path;
    //El this.uid es el mismo id del usuario
    return this.firestoreService.createDoc(this.pedido, path, this.uid).then( () => {
    });
  }


     /**
   * Elimina un producto del carrito, es decir,
   * elimina y resta un solo producto del carrito
   * 
   * @param producto Objeto de tipo producto, que contiene el
   * producto que se va a eliminar del carrito
   * @returns void
   */
  removeProducto(producto: Producto) {
    if (this.uid.length) {
        let position = 0;
        const item = this.pedido.productos.find( (productoPedido, index) => {
            position = index;
            return (productoPedido.producto.id === producto.id)
        });
        if (item !== undefined) {
            item.cantidad --;
            item.total = item.total - (producto.precioNormal - (producto.precioNormal*(producto.precioReducido/100)));
            if (item.cantidad === 0) {
                this.pedido.productos.splice(position, 1);
            }
            const path = 'Usuarios/' + this.uid + '/' + this.path;
            return this.firestoreService.createDoc(this.pedido, path, this.uid).then( () => {
            });
        }
    }
  }

  
     /**
   * Elimina una fila de producto del carrito,
   * es decir, elimina el producto completo sea
   * cual sea la cantidad agregadas que tenga
   * 
   * @param producto Objeto de tipo producto, que contiene el
   * producto que se va a eliminar completamente del carrito
   * @returns void
   */
  deleteProductRow(producto: Producto){
    if (this.uid.length) {
        let position = 0;
        //El index es para saber la posición de un producto
        const item = this.pedido.productos.find( (productoPedido, index) => {
            position = index;
            return (productoPedido.producto.id === producto.id)
        });
        if (item !== undefined) {
            this.pedido.productos.splice(position, 1);
            const path = 'Usuarios/' + this.uid + '/' + this.path;
            return this.firestoreService.createDoc(this.pedido, path, this.uid).then( () => {
            }).catch( err => {
                alert(err);
            });
        }
    }
  }

     /**
   * Elimina todos los productos del carrito
   * 
   * @returns void
   */
  clearCarrito() {
      const path = 'Usuarios/' + this.uid + '/' + 'carrito';
      return this.firestoreService.deleteDoc(path, this.uid).then( () => {
          this.initCarrito();
      });
  }

    /**
   * Loading de información
   * 
   * @returns Alerta de cargando
   */
    loadingData(){
        Swal.fire({
            title: 'Guardando cambios',
            html: 'Por favor espera un momento...',
            showCancelButton: false,
            showConfirmButton: true, 
            allowOutsideClick: false,
            didOpen: () => {
            Swal.showLoading()
            }
        }); 
    }

}