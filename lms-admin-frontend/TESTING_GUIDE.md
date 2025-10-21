# Testing Your Authentication System

## Quick Test Setup

I've created a `SimpleLoginComponent` for you to test the authentication system. Here's how to use it:

### 1. Add the component to your app

```typescript
// In your app.component.ts or any route
import { SimpleLoginComponent } from './simple-login.component';

@Component({
  template: `<app-simple-login></app-simple-login>`
})
export class AppComponent {}
```

### 2. Test Credentials

Use these test credentials based on your backend:

**Super Admin:**
- Email: `super_admin@system.com` 
- Password: `your_super_admin_password`

**Tenant Admin (EPS):**
- Email: `eps_admin` or `hassan@eps.com`
- Password: `your_tenant_admin_password`

**Teacher:**
- Email: `teacher@eps.com` or teacher username
- Password: `your_teacher_password`

### 3. Expected Results

When you login successfully, you should see:

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
    }
}
```

### 4. Features to Test

✅ **Login Form** - Enter email/username and password
✅ **Error Handling** - Try wrong credentials
✅ **Success Display** - See user info after login  
✅ **Token Storage** - Check localStorage in browser dev tools
✅ **Permissions** - View user permissions list
✅ **Logout** - Clear all data and reset form

### 5. Browser Dev Tools Check

After successful login, check:

1. **Application > Local Storage** should show:
   - `lms_access_token`
   - `lms_refresh_token` 
   - `lms_user_data`
   - `lms_permissions`

2. **Network tab** should show:
   - POST request to `/auth/login`
   - Response with your expected format

3. **Console** should show:
   - User logged in with role: TENANT_ADMIN (or appropriate role)

### 6. Domain Testing

Since you have domain-based tenant isolation:

- Test from `eps.yourdomain.com` → Should login EPS users
- Test from `admin.yourdomain.com` → Should login Super Admin
- Test from different subdomains → Should respect tenant boundaries

### 7. API Integration Test

After login, test API calls with automatic token injection:

```typescript
// These should work automatically with auth headers
await this.httpRequests.getAllTenants();     // Super Admin only
await this.httpRequests.getAllTeachers();    // Tenant Admin + Super Admin  
await this.httpRequests.getCurrentUser();    // All authenticated users
```

The authentication system is now fully integrated and ready for testing!
