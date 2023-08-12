export interface InfoDeContacto {
   id: string;
   telefono: string;
   correo: string;
   direccion: string;
   instagram: string;
   facebook: string;
   whatsapp: string;
   twitter: string;
   youtube: string;
   fecha: Date;
}

export interface PoliticaDeDevoluciones {
   id: string;
   descripcion: string;
   fecha: Date;
 }

/**
 * Clase de Usuario
 */
export interface Usuario {
   uid: string;
   correo: string;
   nombre: string;
   contrasena: string;
   ciudad: string;
   direccion: string;
   cedula: string;
   telefono: string;
   terminos: boolean;
   img:string;
   fecha: Date;
}

/**
 * Clase de categorías
 */
 export interface Categoria {
   id: string;
   nombre: string;
   fecha: Date;
   foto: string;
 }

 /**
 * Clase de Producto
 */
 export interface Producto{
    nombre: string;
    cliente: Usuario;
    precioNormal: number;
    precioReducido: number;
    descripcion: string;
    categoria: string;
    visitas: number;
    foto: string;
    id: string;
    stock: number;
    totalDeLaMuestra: number;
    tamanoDeLaMuestra: number;
    promedio: number;
    fecha: Date;
}

export interface Comentarios {
   id: string;
   productId: string;
   texto: string;
   fecha: Date;
   usuario: Usuario;
}

/**
 * Clase de Pedido
 */
export interface Pedido {
    id: string;
    cliente: Usuario;
    productos: ProductoPedido[];
    precioTotal: number;
    fecha: any;
    cantidadProductos: number;
    estado: string;
    referencia: string;
    estadoTransaccion: 'IN-PROCESS' | 'PENDING' | 'APPROVED' | 'DECLINED' | 'VOIDED' | 'ERROR';
 }
 
 /**
 * Clase de ProductoPedido
 */
 export interface ProductoPedido {
    producto: Producto;
    cantidad: number;
    total: number;
    calificado: boolean;
    comentado: boolean;
 }

 /**
 * Clase de Usuario administrador
 */
 export interface userAdministrador {
    uid: string;
    correo: string;
    nombre: string;
    contrasena: string;
    ciudad: string;
    direccion: string;
    cedula: string;
    telefono: string;
    registro_completado: boolean;
    fecha: Date;
    img:string;
    rol:string;
    estado:boolean;
 }

 export interface Denuncia {
   id: string;
   descripcion: string;
   denuncia: string;
   fecha: number;
   usuario: Usuario;
   productId: string;
   commentId: string;
   commentText: string;
   commentDeleted: boolean;
   // tipoDeDenuncia: boolean;
}

export interface Cookie {
   browser: string;
   dateCreated: Date;
   ip: string;
   id: string;
}
