import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PrivatePageLayout } from './private-page-layout/private-page-layout';
import { TenantManagement } from './reports/tenant-management/tenant-management';
import { InstituteManagement } from './reports/institute-management/institute-management';
import { AuthGuard } from '../../services/auth.guard';
import { HomeRedirectGuard } from '../../services/home-redirect.guard';

const routes: Routes = [
  {
    path: '',
    component: PrivatePageLayout,
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    children: [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      },
      {
        path: 'home',
        canActivate: [HomeRedirectGuard],
        component: PrivatePageLayout // Dummy component, guard will redirect
      },
      // Reports routes
      {
        path: 'reports/tenants',
        component: TenantManagement,
        data: { title: 'Tenant Management' }
      },
      {
        path: 'reports/institutes',
        component: InstituteManagement,
        data: { title: 'Institute Management' }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PrivatePagesRoutingModule { }
