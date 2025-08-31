import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PrivatePagesRoutingModule } from './private-pages-routing-module';
import { PrivatePageLayout } from './private-page-layout/private-page-layout';
import { AdminDashboard } from './dashboards/admin-dashboard/admin-dashboard';
import { TenantDashboard } from './dashboards/tenant-dashboard/tenant-dashboard';
import { TeacherDashboard } from './dashboards/teacher-dashboard/teacher-dashboard';



@NgModule({
  declarations: [
    PrivatePageLayout,
    // AdminDashboard,
    // TenantDashboard,
    // TeacherDashboard
  ],
  imports: [
    CommonModule,
    PrivatePagesRoutingModule
  ]
})
export class PrivatePagesModule { }
