import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-tenant-dashboard',
  templateUrl: './tenant-dashboard.html',
  styleUrls: ['./tenant-dashboard.scss']
})
export class TenantDashboard implements OnInit {
  
  currentUser: any = null;
  permissions: string[] = [];

  constructor() {}

  ngOnInit(): void {
    // Will be injected later when services are properly available
    this.currentUser = { full_name: 'Tenant Admin', role: { role_name: 'Tenant Admin' }, email: 'admin@tenant.com', user_type: 'TENANT_ADMIN' };
    this.permissions = ['/tenants:view', '/teachers:manage'];
  }

  logout(): void {
    console.log('Logout functionality will be added');
  }
}
