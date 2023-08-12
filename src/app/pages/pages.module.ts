import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PagesRoutingModule } from './pages-routing.module';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NgxPaginationModule } from 'ngx-pagination';

import { NgxMaskModule } from 'ngx-mask'
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerModule } from 'ngx-spinner';
import { SwiperModule } from 'swiper/angular';
import { QuillModule } from 'ngx-quill';
import { InfiniteScrollModule } from "ngx-infinite-scroll";

import { HomeComponent } from './home/home.component';
import { ProfileComponent } from './profile/profile.component';
import { StarterComponent } from './starter/starter.component';
import { AddProductComponent } from './add-product/add-product.component';
import { SeeProductsComponent } from './see-products/see-products.component';
import { ProductDetailsComponent } from './product-details/product-details.component';
import { CargandoComponent } from './cargando.component';
import { CartComponent } from './cart/cart.component';

import { MyProductsComponent } from './my-products/my-products.component';
import { CheckoutComponent } from './checkout/checkout.component';
import { ListAdministratorComponent } from './administrators/list-administrator/list-administrator.component';
import { MyOrdersComponent } from './my-orders/my-orders.component';
import { DetallesMiPedidoComponent } from './detalles-mi-pedido/detalles-mi-pedido.component';

import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { PERFECT_SCROLLBAR_CONFIG } from 'ngx-perfect-scrollbar';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { SeeGeneralProductsComponent } from './see-general-products/see-general-products.component';
import { MySalesComponent } from './my-sales/my-sales.component';
import { CreateCategoriesComponent } from './create-categories/create-categories.component';
import { SeeCategoriesComponent } from './see-categories/see-categories.component';
import { SeeProductsByCategoryComponent } from './see-products-by-category/see-products-by-category.component';
import { EditCategoriesComponent } from './edit-categories/edit-categories.component';
import { SeeOffersComponent } from './see-offers/see-offers.component';
import { MostWantedProductsComponent } from './most-wanted-products/most-wanted-products.component';
import { ReportComponent } from './report/report.component';
import { ManageComplaintsComponent } from './manage-complaints/manage-complaints.component';
import { ContactInformationComponent } from './contact-information/contact-information.component';
import { ReturnPolicyComponent } from './return-policy/return-policy.component';
import { CookiesComponent } from './cookies/cookies.component';


const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
    suppressScrollX: true,
    wheelSpeed: 2,
    wheelPropagation: true,
    minScrollbarLength: 20
};

@NgModule({
    declarations: [
        HomeComponent, 
        ProfileComponent, 
        StarterComponent, 
        AddProductComponent, 
        SeeProductsComponent, 
        ProductDetailsComponent,
        CargandoComponent,
        CartComponent,
        MyProductsComponent,
        CheckoutComponent,
        ListAdministratorComponent,
        MyOrdersComponent,
        DetallesMiPedidoComponent,
        SeeGeneralProductsComponent,
        MySalesComponent,
        CreateCategoriesComponent,
        SeeCategoriesComponent,
        SeeProductsByCategoryComponent,
        EditCategoriesComponent,
        SeeOffersComponent,
        MostWantedProductsComponent,
        ReportComponent,
        ManageComplaintsComponent,
        ContactInformationComponent,
        ReturnPolicyComponent,
        CookiesComponent
    ],
    imports: [
        CommonModule, 
        PagesRoutingModule,
        RouterModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,
        NgxPaginationModule,
        PerfectScrollbarModule,
        NgbModule,
        SwiperModule,
        InfiniteScrollModule,
        QuillModule.forRoot(),
        NgxMaskModule.forRoot(),
        NgxSpinnerModule,
    ],
    exports: [
        HomeComponent, 
        ProfileComponent, 
        StarterComponent, 
        AddProductComponent,
        SeeProductsComponent,
        ProductDetailsComponent,
        CartComponent,
        MyProductsComponent,
        MyOrdersComponent
    ],
    providers: [
        {
            provide: PERFECT_SCROLLBAR_CONFIG,
            useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG
        },
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PagesModule {}
