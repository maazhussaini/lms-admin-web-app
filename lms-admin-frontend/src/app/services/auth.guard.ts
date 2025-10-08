import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    if (this.authService.isLoggedIn()) {
      // Check for required role if specified in route data
      const requiredRole = route.data?.['role'];
      if (requiredRole) {
        const userRole = this.authService.getCurrentUserRole();
        if (userRole !== requiredRole) {
          this.router.navigate(['/unauthorized']);
          return false;
        }
      }

      // Check for required permission if specified in route data
      const requiredPermission = route.data?.['permission'];
      if (requiredPermission) {
        if (!this.authService.hasPermission(requiredPermission)) {
          this.router.navigate(['/unauthorized']);
          return false;
        }
      }

      return true;
    }

    // User is not logged in, redirect to login
    this.router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  canActivateChild(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    return this.canActivate(route, state);
  }
}

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/auth/login']);
      return false;
    }

    const allowedRoles = route.data?.['roles'] as string[];
    const userRole = this.authService.getCurrentUserRole();

    if (allowedRoles && userRole && allowedRoles.includes(userRole)) {
      return true;
    }

    this.router.navigate(['/unauthorized']);
    return false;
  }
}
