import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-side-nav',
  imports: [RouterLink, CommonModule],
  templateUrl: './side-nav.html',
  styleUrl: './side-nav.scss'
})
export class SideNav implements OnInit {
  activeMenuItem: string = 'tenants'; // Default active menu item
  currentUserRole: string = '';

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.currentUserRole = this.authService.getCurrentUserRole() || '';
  }

  setActiveMenuItem(menuItem: string): void {
    this.activeMenuItem = menuItem;
  }

  // Check if user has access to specific menu items
  canViewTenants(): boolean {
    return this.currentUserRole === 'SUPER_ADMIN' || this.currentUserRole === 'ADMIN';
  }

  canViewInstitutes(): boolean {
    return this.currentUserRole === 'SUPER_ADMIN' || this.currentUserRole === 'TENANT_ADMIN';
  }

  canViewStudents(): boolean {
    return this.currentUserRole === 'SUPER_ADMIN';
  }
}
