# LMS Authentication Integration Guide

This guide shows how to integrate the universal authentication system in your Angular frontend that works with the backend's domain-based multi-tenant authentication.

## Features Implemented

✅ **Universal Login API Integration** - Single endpoint for Admin, Super Admin, and Teacher login
✅ **Token Storage Service** - Secure local storage management for tokens and user data  
✅ **HTTP Interceptor** - Automatic token injection and refresh handling
✅ **Authentication Service** - Complete auth state management with observables
✅ **Route Guards** - Role-based and permission-based route protection
✅ **Type Safety** - Full TypeScript interfaces for all auth responses

## Backend Response Format

The backend returns this response format for successful login:

```json
{
    "success": true,
    "statusCode": 200,
    "message": "Login successful",
    "data": {
        "user": {
            "id": 9,
            "username": "eps_admin",
            "full_name": "Hassan Ali",
            "email": "hassan@eps.com",
            "role": {
                "role_type": "TENANT_ADMIN",
                "role_name": "Tenant Admin"
            },
            "tenant_id": 3,
            "user_type": "TENANT_ADMIN"
        },
        "tokens": {
            "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            "expires_in": 1,
            "token_type": "Bearer"
        },
        "permissions": [
            "/tenants:view"
        ]
    },
    "timestamp": "2025-08-05T01:07:40.335Z",
    "correlationId": "760b40bb-46e9-40d7-969a-4b1f8dbf5a4e"
}
```

## Quick Usage Examples

### 1. Basic Login Implementation

```typescript
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <form (ngSubmit)="onLogin()" #loginForm="ngForm">
      <input [(ngModel)]="email" name="email" placeholder="Email or Username" required>
      <input type="password" [(ngModel)]="password" name="password" placeholder="Password" required>
      <button type="submit" [disabled]="loading">
        {{ loading ? 'Signing In...' : 'Sign In' }}
      </button>
    </form>
    @if (message) {
      <div>{{ message }}</div>
    }
  `
})
export class LoginComponent {
  email = '';
  password = '';
  loading = false;
  message = '';

  constructor(private authService: AuthService) {}

  async onLogin() {
    this.loading = true;
    const result = await this.authService.login({
      email: this.email,
      password: this.password
    });
    
    if (result.success) {
      // User is logged in, navigate based on role
      const role = this.authService.getCurrentUserRole();
      if (role === 'SUPER_ADMIN') {
        // Navigate to admin dashboard
      } else if (role === 'TENANT_ADMIN') {
        // Navigate to tenant dashboard
      } else if (role === 'TEACHER') {
        // Navigate to teacher dashboard
      }
    } else {
      this.message = result.message || 'Login failed';
    }
    this.loading = false;
  }
}
```

### 2. Check Authentication State

```typescript
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';

@Component({
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (currentUser) {
      <div>
        <h3>Welcome, {{ currentUser.full_name }}!</h3>
        <p>Role: {{ currentUser.role.role_name }}</p>
        <p>Tenant: {{ currentUser.tenant_id }}</p>
        <button (click)="logout()">Logout</button>
      </div>
    }
  `
})
export class DashboardComponent implements OnInit {
  currentUser: any = null;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    // Subscribe to auth state changes
    this.authService.currentUser$.subscribe((user: any) => {
      this.currentUser = user;
    });
    
    // Or get current state
    this.currentUser = this.authService.getCurrentUser();
  }

  logout() {
    this.authService.logout();
  }
}
```

### 3. Route Protection

```typescript
// app-routing.module.ts
import { AuthGuard, RoleGuard } from './services/auth.guard';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { 
    path: 'admin', 
    component: AdminComponent, 
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['SUPER_ADMIN', 'TENANT_ADMIN'] }
  },
  { 
    path: 'teacher', 
    component: TeacherComponent, 
    canActivate: [AuthGuard],
    data: { role: 'TEACHER' }
  },
  { 
    path: 'tenants', 
    component: TenantsComponent, 
    canActivate: [AuthGuard],
    data: { permission: '/tenants:view' }
  }
];
```

### 4. Check Permissions

```typescript
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';

@Component({
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (canViewTenants) {
      <button (click)="viewTenants()">View Tenants</button>
    }
    
    @if (isSuperAdmin) {
      <div>
        <h3>Super Admin Panel</h3>
      </div>
    }
  `
})
export class SomeComponent {
  constructor(private authService: AuthService) {}

  get canViewTenants(): boolean {
    return this.authService.hasPermission('/tenants:view');
  }

  get isSuperAdmin(): boolean {
    return this.authService.isSuperAdmin();
  }

  get isTeacher(): boolean {
    return this.authService.isTeacher();
  }
}
```

### 5. HTTP Interceptor Setup

```typescript
// app.module.ts or providers in main.ts
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './services/interceptor.service';

export const appConfig: ApplicationConfig = {
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ]
};
```

## API Integration

### Available Authentication Methods

```typescript
// In your components/services
constructor(private httpRequests: HttpRequests) {}

// Login (Universal for Admin, Super Admin, Teacher)
await this.httpRequests.login({ email: 'user@domain.com', password: 'password' });

// Refresh token
await this.httpRequests.refreshToken({ refresh_token: 'token' });

// Forgot password
await this.httpRequests.forgotPassword({ email: 'user@domain.com' });

// Reset password
await this.httpRequests.resetPassword({ token: 'reset_token', new_password: 'new_pass' });

// Logout
await this.httpRequests.logout();

// Get current user profile
await this.httpRequests.getCurrentUser();
```

### Role-Based API Calls

```typescript
// Different APIs based on user role
const userRole = this.authService.getCurrentUserRole();

if (userRole === 'SUPER_ADMIN') {
  // Super admin can access all tenants
  const tenants = await this.httpRequests.getAllTenants();
} else if (userRole === 'TENANT_ADMIN') {
  // Tenant admin can only access their tenant data
  const tenantId = this.authService.getCurrentTenantId();
  const teachers = await this.httpRequests.getAllTeachers();
} else if (userRole === 'TEACHER') {
  // Teachers can access their courses and students
  const courses = await this.httpRequests.getTeacherCourses();
}
```

## Domain-Based Authentication

The system automatically detects which tenant domain is calling the API through IIS reverse proxy headers. Your frontend just needs to make calls to your backend, and the domain-based tenant resolution happens automatically.

**Example domains:**
- `eps.yourdomain.com` → EPS tenant
- `admin.yourdomain.com` → Super admin access
- `school1.yourdomain.com` → School1 tenant

## Key Features

1. **Universal Login**: Single form handles all user types (Admin, Teacher, Super Admin)
2. **Domain-Based Tenancy**: Automatic tenant detection based on subdomain
3. **Token Management**: Automatic token refresh and secure storage
4. **Role-Based Access**: Guards and permissions for route protection
5. **Type Safety**: Full TypeScript interfaces for all responses
6. **Error Handling**: Comprehensive error handling with user-friendly messages

## Security Features

- JWT tokens with automatic refresh
- Secure local storage management
- HTTP interceptor for automatic token injection
- Domain-based tenant isolation
- Permission-based access control
- Automatic logout on token expiry

This implementation provides a complete, production-ready authentication system that integrates seamlessly with your universal backend authentication API.
