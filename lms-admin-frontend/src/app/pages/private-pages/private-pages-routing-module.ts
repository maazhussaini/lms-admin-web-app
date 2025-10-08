import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PrivatePageLayout } from './private-page-layout/private-page-layout';
import { AdminDashboard } from './dashboards/admin-dashboard/admin-dashboard';
import { TenantDashboard } from './dashboards/tenant-dashboard/tenant-dashboard';
import { TeacherDashboard } from './dashboards/teacher-dashboard/teacher-dashboard';
import { AuthGuard } from '../../services/auth.guard';

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
        component: TenantDashboard // Default dashboard
      },
      {
        path: 'admin',
        component: AdminDashboard
      },
      {
        path: 'tenant',
        component: TenantDashboard
      },
      {
        path: 'teacher',
        component: TeacherDashboard
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PrivatePagesRoutingModule { }
