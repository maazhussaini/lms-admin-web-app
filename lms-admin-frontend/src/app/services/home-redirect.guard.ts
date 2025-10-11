import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class HomeRedirectGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    const userRole = this.authService.getCurrentUserRole();
    const currentUser = this.authService.getCurrentUser();
    
    console.log('🔍 HomeRedirectGuard - Current User:', currentUser);
    console.log('🔍 HomeRedirectGuard - User Role:', userRole);
    console.log('🔍 HomeRedirectGuard - Current URL:', this.router.url);
    
    // Role-based redirect
    if (userRole === 'SUPER_ADMIN' || userRole === 'ADMIN') {
      console.log('✅ Redirecting to Tenant Management: /private/reports/tenants');
      // Super Admin sees Tenant Management
      this.router.navigate(['/private/reports/tenants']).then(success => {
        console.log('✅ Navigation success:', success);
      }).catch(error => {
        console.error('❌ Navigation error:', error);
      });
    } else if (userRole === 'TENANT_ADMIN') {
      console.log('✅ Redirecting to Institute Management: /private/reports/institutes');
      // Tenant Admin sees Institute Management
      this.router.navigate(['/private/reports/institutes']).then(success => {
        console.log('✅ Navigation success:', success);
      }).catch(error => {
        console.error('❌ Navigation error:', error);
      });
    } else {
      console.log('⚠️ Unknown role, redirecting to Tenant Management (fallback)');
      // Default fallback
      this.router.navigate(['/private/reports/tenants']).then(success => {
        console.log('✅ Navigation success:', success);
      }).catch(error => {
        console.error('❌ Navigation error:', error);
      });
    }
    
    return false; // Always return false because we're redirecting
  }
}
