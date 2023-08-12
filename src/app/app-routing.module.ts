import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Modulos
import { AuthRoutingModule } from './auth/auth.routing';

//Componentes
import { FullComponent } from './layouts/full/full.component';
import { NopagefoundComponent } from './nopagefound/nopagefound.component';
import { SeeProductsComponent } from './pages/see-products/see-products.component';
import { ProductDetailsComponent } from './pages/product-details/product-details.component';
import { SeeCategoriesComponent } from './pages/see-categories/see-categories.component';
import { SeeOffersComponent } from './pages/see-offers/see-offers.component';
import { SeeProductsByCategoryComponent } from './pages/see-products-by-category/see-products-by-category.component';
import { MostWantedProductsComponent } from './pages/most-wanted-products/most-wanted-products.component';

//Guards
import { LogueadoGuard } from './guards/logueado.guard';
import { AuthGuard } from './guards/auth.guard';
import { CookiesComponent } from './pages/cookies/cookies.component';

const routes: Routes = [
  {
    path: '',
    component: FullComponent,
    canActivate:[AuthGuard],
    children: [
      { path: '', redirectTo: '/ver-productos', pathMatch: 'full' },
      {
        path: 'ver-productos',    
        data: {
          title: 'Productos',
          urls: [
            { title: 'Inicio', url: '/ver-productos' },
            { title: 'Productos' }
          ]
        },
        component: SeeProductsComponent
      },
      {
        path: 'ver-categorias',    
        data: {
          title: 'Ver Categorías',
          urls: [
            { title: 'Inicio', url: '/ver-productos' },
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
            { title: 'Inicio', url: '/ver-productos' },
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
            { title: 'Inicio', url: '/ver-productos' },
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
            { title: 'Inicio', url: '/ver-productos' },
            { title: 'Detalles del producto' }
          ]
        },
        component: ProductDetailsComponent
      },
      {
        path: 'ver-productos-populares',    
        data: {
          title: 'Ver Productos Populares',
          urls: [
            { title: 'Inicio', url: '/ver-productos' },
            { title: 'Ver Productos Populares' }
          ]
        },
        component: MostWantedProductsComponent
      },
      { 
        path: 'aviso-cookies',
        data: {
          title: 'Aviso de Privacidad',
        },
        component: CookiesComponent
      },
    ]
  },
  {
    path: 'dashboard',
    component: FullComponent,
    canActivateChild:[LogueadoGuard],
    children: [
      {
        path: '',
        loadChildren: () => import('./pages/pages.module').then(m => m.PagesModule)
      }
    ]
  },
  { path: '**', component: NopagefoundComponent },
];


@NgModule({
  imports: [
    RouterModule.forRoot( routes ),
    AuthRoutingModule
  ],
  exports: [ RouterModule ]
})
export class AppRoutingModule { }