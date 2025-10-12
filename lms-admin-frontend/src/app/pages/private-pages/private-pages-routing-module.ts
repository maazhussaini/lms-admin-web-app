import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PrivatePageLayout } from './private-page-layout/private-page-layout';
import { TenantManagement } from './reports/tenant-management/tenant-management';
import { InstituteManagement } from './reports/institute-management/institute-management';
import { StudentManagement } from './reports/student-management/student-management';
import { TeacherManagement } from './reports/teacher-management/teacher-management';
import { AuthGuard, RoleGuard } from '../../services/auth.guard';
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
        canActivate: [RoleGuard],
        data: { 
          title: 'Tenant Management',
          roles: ['SUPER_ADMIN', 'ADMIN']
        }
      },
      {
        path: 'reports/institutes',
        component: InstituteManagement,
        canActivate: [RoleGuard],
        data: { 
          title: 'Institute Management',
          roles: ['SUPER_ADMIN', 'TENANT_ADMIN']
        }
      },
      {
        path: 'reports/students',
        component: StudentManagement,
        canActivate: [RoleGuard],
        data: { 
          title: 'Student Management',
          roles: ['SUPER_ADMIN']
        }
      },
      {
        path: 'reports/teachers',
        component: TeacherManagement,
        canActivate: [RoleGuard],
        data: { 
          title: 'Teacher Management',
          roles: ['SUPER_ADMIN', 'TENANT_ADMIN']
        }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PrivatePagesRoutingModule { }
