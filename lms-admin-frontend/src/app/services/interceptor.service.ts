import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject, filter, take, switchMap, catchError } from 'rxjs';
import { TokenStorage } from './token-storage';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthInterceptor implements HttpInterceptor {
  
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(
    private tokenStorage: TokenStorage,
    private router: Router
  ) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Skip auth for login, register, forgot password endpoints
    const skipAuth = this.shouldSkipAuth(req.url);
    
    if (skipAuth) {
      return next.handle(req);
    }

    // Add auth token if available
    const authReq = this.addTokenToRequest(req);
    
    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          return this.handle401Error(authReq, next);
        }
        return throwError(() => error);
      })
    );
  }

  private shouldSkipAuth(url: string): boolean {
    const skipUrls = ['/auth/login', '/auth/register', '/auth/forgot-password', '/auth/reset-password'];
    return skipUrls.some(skipUrl => url.includes(skipUrl));
  }

  private addTokenToRequest(req: HttpRequest<any>): HttpRequest<any> {
    const accessToken = this.tokenStorage.getAccessToken();
    
    if (accessToken) {
      return req.clone({
        setHeaders: {
          Authorization: `Bearer ${accessToken}`
        }
      });
    }
    
    return req;
  }

  private handle401Error(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      const refreshToken = this.tokenStorage.getRefreshToken();
      
      if (refreshToken) {
        return this.refreshToken(refreshToken).pipe(
          switchMap((response: any) => {
            this.isRefreshing = false;
            
            if (response && response.success && response.data?.tokens) {
              this.tokenStorage.saveTokens(response.data.tokens);
              this.refreshTokenSubject.next(response.data.tokens.access_token);
              
              // Retry original request with new token
              const newAuthReq = this.addTokenToRequest(req);
              return next.handle(newAuthReq);
            }
            
            // If refresh failed, logout user
            this.logout();
            return throwError(() => new Error('Token refresh failed'));
          }),
          catchError((error) => {
            this.isRefreshing = false;
            this.logout();
            return throwError(() => error);
          })
        );
      } else {
        this.logout();
        return throwError(() => new Error('No refresh token available'));
      }
    } else {
      // Wait for refresh to complete
      return this.refreshTokenSubject.pipe(
        filter(token => token !== null),
        take(1),
        switchMap(() => {
          const newAuthReq = this.addTokenToRequest(req);
          return next.handle(newAuthReq);
        })
      );
    }
  }

  private refreshToken(refreshToken: string): Observable<any> {
    // This would typically call your refresh token endpoint
    // For now, returning empty observable - you'll need to implement this
    return throwError(() => new Error('Refresh token endpoint not implemented'));
  }

  private logout(): void {
    this.tokenStorage.clearAllData();
    this.router.navigate(['/auth/login']);
  }
}
