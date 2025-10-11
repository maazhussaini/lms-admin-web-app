import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PrivatePagesRoutingModule } from './private-pages-routing-module';

import { AdminDashboard } from './dashboards/admin-dashboard/admin-dashboard';
import { TenantDashboard } from './dashboards/tenant-dashboard/tenant-dashboard';
import { TeacherDashboard } from './dashboards/teacher-dashboard/teacher-dashboard';
import { SideNav } from '../../layouts/side-nav/side-nav';
import { Header } from '../../layouts/header/header';
import { PrivatePageLayout } from './private-page-layout/private-page-layout';
import { TenantManagement } from './reports/tenant-management/tenant-management';
import { InstituteManagement } from './reports/institute-management/institute-management';
import { StudentManagement } from './reports/student-management/student-management';
import { ProgramManagement } from './reports/program-management/program-management';
import { BasicTenantForm } from "../../components/forms/basic-tenant-form/basic-tenant-form";
import { OffCanvasWrapper } from "../../components/widgets/off-canvas-wrapper/off-canvas-wrapper";
import { Paginator } from "../../components/widgets/paginator/paginator";
import { FormsModule } from '@angular/forms';



@NgModule({
  declarations: [
    PrivatePageLayout,
    TenantManagement,
    InstituteManagement,
    StudentManagement,
    ProgramManagement
    // AdminDashboard,
    // TenantDashboard,
    // TeacherDashboard
  ],
  imports: [
    CommonModule,
    FormsModule,
    PrivatePagesRoutingModule,
    Header,
    SideNav,
    BasicTenantForm,
    OffCanvasWrapper,
    Paginator
]
})
export class PrivatePagesModule { }
