import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.scss']
})
export class AdminDashboard implements OnInit {
  
  currentUser: any = null;
  permissions: string[] = [];

  constructor() {}

  ngOnInit(): void {
    // Will be injected later when services are properly available
    this.currentUser = { full_name: 'Super Admin', role: { role_name: 'Super Admin' }, email: 'admin@system.com', user_type: 'SUPER_ADMIN' };
    this.permissions = ['/tenants:view', '/users:manage', '/system:admin'];
  }

  logout(): void {
    console.log('Logout functionality will be added');
  }
}
