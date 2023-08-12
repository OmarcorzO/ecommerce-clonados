import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DatePipe, DecimalPipe } from '@angular/common';

import { HomeComponent } from './home/home.component';
import { ProfileComponent } from './profile/profile.component';
import { CreateCategoriesComponent } from './create-categories/create-categories.component';
import { AddProductComponent } from './add-product/add-product.component';
import { SeeProductsComponent } from './see-products/see-products.component';
import { SeeCategoriesComponent } from './see-categories/see-categories.component';
import { SeeOffersComponent } from './see-offers/see-offers.component';
import { SeeProductsByCategoryComponent } from './see-products-by-category/see-products-by-category.component';
import { ProductDetailsComponent } from './product-details/product-details.component';
import { CartComponent } from './cart/cart.component';
import { MyProductsComponent } from './my-products/my-products.component';
import { EditCategoriesComponent } from './edit-categories/edit-categories.component';
import { CheckoutComponent } from './checkout/checkout.component';
import { MyOrdersComponent } from './my-orders/my-orders.component';
import { DetallesMiPedidoComponent } from './detalles-mi-pedido/detalles-mi-pedido.component';
import { MostWantedProductsComponent } from './most-wanted-products/most-wanted-products.component';
import { ReportComponent } from './report/report.component';
import { ListAdministratorComponent } from './administrators/list-administrator/list-administrator.component';
import { MySalesComponent } from './my-sales/my-sales.component';
import { ManageComplaintsComponent } from './manage-complaints/manage-complaints.component';
import { ContactInformationComponent } from './contact-information/contact-information.component';
import { ReturnPolicyComponent } from './return-policy/return-policy.component';

const routes: Routes = [  
  {
    path: '',    
    data: {
    title: 'Página de inicio',
    urls: [
       { title: 'Dashboard', url: '/dashboard' },
       { title: 'Página de inicio' }
     ]
    },
    component: HomeComponent
  },
  {
    path: 'perfil',    
    data: {
      title: 'Mi Perfil',
      urls: [
        { title: 'Dashboard', url: '/dashboard' },
        { title: 'Mi Perfil' }
      ]
    },
    component: ProfileComponent
  },
  {
    path: 'informacion-de-contacto',
    data: {
      title: 'Mi información de contacto',
      urls: [
        { title: 'Dashboard', url: '/dashboard' },
        { title: 'Mi información de contacto' }
      ]
    },
    component: ContactInformationComponent
  },
  {
    path: 'politica-de-devoluciones',
    data: {
      title: 'Mi política de devoluciones',
      urls: [
        { title: 'Dashboard', url: '/dashboard' },
        { title: 'Mi política de devoluciones' }
      ]
    },
    component: ReturnPolicyComponent
  },
  {
    path: 'crear-categoria',    
    data: {
      title: 'Crear Categoría',
      urls: [
        { title: 'Dashboard', url: '/dashboard' },
        { title: 'Crear Categoría' }
      ]
    },
    component: CreateCategoriesComponent
  },
  {
    path: 'agregar-producto',    
    data: {
      title: 'Agregar Producto',
      urls: [
        { title: 'Dashboard', url: '/dashboard' },
        { title: 'Agregar Producto' }
      ]
    },
    component: AddProductComponent
  },
  {
    path: 'ver-productos',    
    data: {
      title: 'Ver Productos',
      urls: [
        { title: 'Dashboard', url: '/dashboard' },
        { title: 'Ver Productos' }
      ]
    },
    component: SeeProductsComponent
  },
  {
    path: 'ver-productos-populares',    
    data: {
      title: 'Ver Productos Populares',
      urls: [
        { title: 'Dashboard', url: '/dashboard' },
        { title: 'Ver Productos Populares' }
      ]
    },
    component: MostWantedProductsComponent
  },
  {
    path: 'ver-categorias',    
    data: {
      title: 'Ver Categorías',
      urls: [
        { title: 'Dashboard', url: '/dashboard' },
        { title: 'Ver Categorías' }
      ]
    },
    component: SeeCategoriesComponent
  },
  {
    path: 'ver-ofertas',    
    data: {
      title: 'Ver Ofertas',
      urls: [
        { title: 'Dashboard', url: '/dashboard' },
        { title: 'Ver Ofertas' }
      ]
    },
    component: SeeOffersComponent
  },
  {
    path: 'ver-productos-por-categoria/:categoria',    
    data: {
      title: 'Ver Productos por categoría',
      urls: [
        { title: 'Dashboard', url: '/dashboard' },
        { title: 'Ver Productos por categoría' }
      ]
    },
    component: SeeProductsByCategoryComponent
  },
  {
    path: 'detalle-producto/:id',    
    data: {
      title: 'Detalles del producto',
      urls: [
        { title: 'Dashboard', url: '/dashboard' },
        { title: 'Detalles del producto' }
      ]
    },
    component: ProductDetailsComponent
  },
  {
    path: 'denunciar/:commentId',    
    data: {
      title: 'Denunciar',
      urls: [
        { title: 'Dashboard', url: '/dashboard' },
        { title: 'Denunciar' }
      ]
    },
    component: ReportComponent
  },
  {
    path: 'mi-carrito',
    data: {
      title: 'Mi carrito',
      urls: [
        { title: 'Dashboard', url: '/dashboard' },
        { title: 'Mi carrito' }
      ]
    },
    component: CartComponent
  },
  {
    path: 'mis-productos',
    data: {
      title: 'Mis productos',
      urls: [
        { title: 'Dashboard', url: '/dashboard' },
        { title: 'Mis productos' }
      ]
    },
    component: MyProductsComponent
  },
  {
    path: 'editar-categorias',
    data: {
      title: 'Editar categorías',
      urls: [
        { title: 'Dashboard', url: '/dashboard' },
        { title: 'Editar categorías' }
      ]
    },
    component: EditCategoriesComponent
  },
  {
    path: 'checkout',
    data: {
      title: 'Lista del Pedido',
      urls: [
        { title: 'Mi carrito', url: '/dashboard/mi-carrito' },
        { title: 'Lista del Pedido' }
      ]
    },
    component: CheckoutComponent
  },
  {
    path: 'lista-administradores',
    data: {
      title: 'Lista de administradores',
      urls: [
        { title: 'Dashboard', url: '/dashboard' },
        { title: 'Lista administradores' }
      ]
    },
    component: ListAdministratorComponent
  },
  {
    path: 'mis-pedidos',
    data: {
      title: 'Mis pedidos',
      urls: [
        { title: 'Dashboard', url: '/dashboard' },
        { title: 'Mis pedidos' }
      ]
    },
    component: MyOrdersComponent
  },
  {
    path: 'detalles-mi-pedido/:id',
    data: {
      title: 'Detalles de mi pedido',
      urls: [
        { title: 'Dashboard', url: '/dashboard' },
        { title: 'Detalles de mi pedido' }
      ]
    },
    component: DetallesMiPedidoComponent
  },
  {
    path: 'detalles-del-pedido/:id',
    data: {
      title: 'Detalles del pedido',
      urls: [
        { title: 'Dashboard', url: '/dashboard' },
        { title: 'Detalles del pedido' }
      ]
    },
    component: DetallesMiPedidoComponent
  },
  {
    path: 'mis-ventas',
    data: {
      title: 'Mis ventas',
      urls: [
        { title: 'Dashboard', url: '/dashboard' },
        { title: 'Mis ventas' }
      ]
    },
    component: MySalesComponent
  },
  {
    path: 'administrar-denuncias',
    data: {
      title: 'Administrar denuncias',
      urls: [
        { title: 'Dashboard', url: '/dashboard' },
        { title: 'Denuncias' }
      ]
    },
    component: ManageComplaintsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers:[        
    DatePipe,
    DecimalPipe,
  ]
})
export class PagesRoutingModule {}