import { RouteInfo } from "./vertical-sidebar.metadata";

export const RoutesAdmin: RouteInfo[] = [
  {
    path: '',
    title: 'Menu',
    icon: 'mdi mdi-dots-horizontal',
    class: 'nav-small-cap',
    extralink: true,
    submenu: []
  },
  {
    path: '/dashboard/informacion-de-contacto',
    title: 'Mi información de contacto',
    icon: ' fas fa-info-circle',
    class: '',
    extralink: false,
    submenu: []
  },
  {
    path: '/dashboard/politica-de-devoluciones',
    title: 'Mi política de devoluciones',
    icon: 'fas fa-hand-holding',
    class: '',
    extralink: false,
    submenu: []
  },
  {
    path: '/dashboard/crear-categoria',
    title: 'Crear Categoría',
    icon: 'fas fa-save',
    class: '',
    extralink: false,
    submenu: []
  },
  {
    path: '/dashboard/agregar-producto',
    title: 'Agregar Producto',
    icon: 'fas fa-plus',
    class: '',
    extralink: false,
    submenu: []
  },
  {
    path: '/dashboard/ver-productos',
    title: 'Ver Productos',
    icon: 'fas fa-eye',
    class: '',
    extralink: false,
    submenu: []
  },
  {
    path: '/dashboard/ver-productos-populares',
    title: 'Más buscados',
    icon: 'fas fa-eye',
    class: '',
    extralink: false,
    submenu: []
  },
  {
    path: '/dashboard/ver-categorias',
    title: 'Ver Categorías',
    icon: 'fas fa-eye',
    class: '',
    extralink: false,
    submenu: []
  },
  {
    path: '/dashboard/ver-ofertas',
    title: 'Ver Ofertas',
    icon: 'fas fa-eye',
    class: '',
    extralink: false,
    submenu: []
  },
  {
    path: '/dashboard/mi-carrito',
    title: 'Mi carrito',
    icon: 'fas fa-shopping-cart',
    class: '',
    extralink: false,
    submenu: []
  },
  {
    path: '/dashboard/mis-productos',
    title: 'Mis productos',
    icon: 'far fa-edit',
    class: '',
    extralink: false,
    submenu: []
  },
  {
    path: '/dashboard/editar-categorias',
    title: 'Editar categorías',
    icon: 'fas fa-edit',
    class: '',
    extralink: false,
    submenu: []
  },
  {
    path: '/dashboard/mis-pedidos',
    title: 'Mis pedidos',
    icon: 'fas fa-shopping-bag',
    class: '',
    extralink: false,
    submenu: []
  },
  {
    path: '/dashboard/mis-ventas',
    title: 'Mis ventas',
    icon: 'far fa-money-bill-alt',
    class: '',
    extralink: false,
    submenu: []
  },
  {
    path: '/dashboard/administrar-denuncias',
    title: 'Administrar denuncias',
    icon: ' far fa-comment',
    class: '',
    extralink: false,
    submenu: []
  }
];


export const RouteCliente: RouteInfo[] = [
  {
    path: '',
    title: 'Productos',
    icon: 'mdi mdi-dots-horizontal',
    class: 'nav-small-cap',
    extralink: true,
    submenu: []
  },
  {
    path: '/dashboard/ver-productos',
    title: 'Ver Productos',
    icon: 'fas fa-eye',
    class: '',
    extralink: false,
    submenu: []
  },
  {
    path: '/dashboard/ver-productos-populares',
    title: 'Más buscados',
    icon: 'fas fa-eye',
    class: '',
    extralink: false,
    submenu: []
  },
  {
    path: '/dashboard/ver-categorias',
    title: 'Ver Categorías',
    icon: 'fas fa-eye',
    class: '',
    extralink: false,
    submenu: []
  },
  {
    path: '/dashboard/ver-ofertas',
    title: 'Ver Ofertas',
    icon: 'fas fa-eye',
    class: '',
    extralink: false,
    submenu: []
  },
  {
    path: '/dashboard/mi-carrito',
    title: 'Mi carrito',
    icon: 'fas fa-shopping-cart',
    class: '',
    extralink: false,
    submenu: []
  },
  {
    path: '/dashboard/mis-pedidos',
    title: 'Mis pedidos',
    icon: 'fas fa-shopping-bag',
    class: '',
    extralink: false,
    submenu: []
  },
];


export const RoutesSuperAdmin: RouteInfo[] = [
  {
    path: '',
    title: 'Menu',
    icon: 'mdi mdi-dots-horizontal',
    class: 'nav-small-cap',
    extralink: true,
    submenu: []
  },
  {
    path: '/dashboard/informacion-de-contacto',
    title: 'Mi información de contacto',
    icon: ' fas fa-info-circle',
    class: '',
    extralink: false,
    submenu: []
  },
  {
    path: '/dashboard/politica-de-devoluciones',
    title: 'Mi política de devoluciones',
    icon: 'fas fa-hand-holding',
    class: '',
    extralink: false,
    submenu: []
  },
  {
    path: '',
    title: 'Productos',
    icon: 'cpu',
    class: 'has-arrow',
    extralink: false,
    submenu: [
      {
        path: '/dashboard/crear-categoria',
        title: 'Crear Categoría',
        icon: 'fas fa-save',
        class: '',
        extralink: false,
        submenu: []
      },
      {
        path: '/dashboard/agregar-producto',
        title: 'Agregar Producto',
        icon: 'fas fa-plus',
        class: '',
        extralink: false,
        submenu: []
      },
      {
        path: '/dashboard/ver-productos',
        title: 'Ver Productos',
        icon: 'fas fa-eye',
        class: '',
        extralink: false,
        submenu: []
      },
      {
        path: '/dashboard/ver-categorias',
        title: 'Ver Categorías',
        icon: 'fas fa-eye',
        class: '',
        extralink: false,
        submenu: []
      },
      {
        path: '/dashboard/ver-ofertas',
        title: 'Ver Ofertas',
        icon: 'fas fa-eye',
        class: '',
        extralink: false,
        submenu: []
      },
      {
        path: '/dashboard/mi-carrito',
        title: 'Mi carrito',
        icon: 'fas fa-shopping-cart',
        class: '',
        extralink: false,
        submenu: []
      },
      {
        path: '/dashboard/mis-pedidos',
        title: 'Mis pedidos',
        icon: 'fas fa-shopping-bag',
        class: '',
        extralink: false,
        submenu: []
      },
      {
        path: '/dashboard/mis-ventas',
        title: 'Mis ventas',
        icon: 'far fa-money-bill-alt',
        class: '',
        extralink: false,
        submenu: []
      },
      {
        path: '/dashboard/mis-productos',
        title: 'Mis productos',
        icon: 'far fa-edit',
        class: '',
        extralink: false,
        submenu: []
      },
      {
        path: '/dashboard/editar-categorias',
        title: 'Editar categorías',
        icon: 'fas fa-edit',
        class: '',
        extralink: false,
        submenu: []
      },
    ]
  },

  {
    path: '',
    title: 'ADMINISTRADORES',
    icon: 'mdi mdi-dots-horizontal',
    class: 'nav-small-cap',
    extralink: true,
    submenu: []
  },

  {
    path: '/dashboard/lista-administradores',
    title: 'Administradores',
    icon: 'fas fa-users',
    class: '',
    extralink: false,
    submenu: []
  },
  {
    path: '/dashboard/administrar-denuncias',
    title: 'Administrar denuncias',
    icon: ' far fa-comment',
    class: '',
    extralink: false,
    submenu: []
  }
];