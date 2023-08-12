import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { RouteInfo } from './vertical-sidebar.metadata';
import { RoutesAdmin, RouteCliente, RoutesSuperAdmin } from './vertical-menu-items';


@Injectable({
    providedIn: 'root'
})
export class VerticalSidebarService {

    public screenWidth: any;
    public collapseSidebar: boolean = false;
    public fullScreen: boolean = false;

    public tipoUsuario:string;
    MENUITEMS: RouteInfo[];

    items;

    constructor() {
    }

    elegirMenuPerzonalisado()
    {
        if(this.tipoUsuario==='cliente')
        {
            this.MENUITEMS= RouteCliente;
        }
        else if(this.tipoUsuario==='admin')
        {
            this.MENUITEMS= RoutesAdmin;
        }
        else if(this.tipoUsuario==='super-admin')
        {
            this.MENUITEMS= RoutesSuperAdmin;
        }
        this.items = new BehaviorSubject<RouteInfo[]>(this.MENUITEMS)
    }


}
