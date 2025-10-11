import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/auth',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    loadChildren: () => import('./pages/public-pages/public-pages-module').then(m => m.PublicPagesModule)
  },
  {
    path: 'private',
    loadChildren: () => import('./pages/private-pages/private-pages-module').then(m => m.PrivatePagesModule)
  },
  {
    path: 'dashboard',
    redirectTo: '/private',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: '/auth'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
