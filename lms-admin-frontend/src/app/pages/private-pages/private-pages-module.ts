import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PrivatePagesRoutingModule } from './private-pages-routing-module';

import { AdminDashboard } from './dashboards/admin-dashboard/admin-dashboard';
import { TenantDashboard } from './dashboards/tenant-dashboard/tenant-dashboard';
import { TeacherDashboard } from './dashboards/teacher-dashboard/teacher-dashboard';
import { SideNav } from '../../layouts/side-nav/side-nav';
import { Header } from '../../layouts/header/header';
import { PrivatePageLayout } from './private-page-layout/private-page-layout';



@NgModule({
  declarations: [
    PrivatePageLayout
    // AdminDashboard,
    // TenantDashboard,
    // TeacherDashboard
  ],
  imports: [
    CommonModule,
    PrivatePagesRoutingModule,
    Header, 
    SideNav
  ]
})
export class PrivatePagesModule { }
