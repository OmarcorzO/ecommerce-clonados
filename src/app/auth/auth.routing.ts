import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';

import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './login/login.component';
import { AuthGuard } from '../guards/auth.guard';
import { RecoverComponent } from './recover/recover.component';

const routes: Routes = [

    { path: 'register', canActivate: [AuthGuard], component: RegisterComponent },
    { path: 'login',     canActivate: [AuthGuard], component: LoginComponent },
    { path: 'recover',   canActivate: [AuthGuard], component: RecoverComponent },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AuthRoutingModule {}
