import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom, catchError, throwError } from 'rxjs';
import { ApiResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class ApiMethods {
  
  constructor(private http: HttpClient) {}

  async get<T>(url: string, headers?: HttpHeaders): Promise<ApiResponse<T>> {
    try {
      const data: any = await firstValueFrom(
        this.http.get<T>(url, { headers }).pipe(
          catchError(this.handleError)
        )
      );
      return data;
    } catch (error: any) {
      return this.createErrorResponse<T>(error);
    }
  }

  async post<T>(
    url: string,
    body: any,
    headers?: HttpHeaders
  ): Promise<ApiResponse<T>> {
    try {
      const finalHeaders = this.prepareHeaders(body, headers);
      
      const data: any = await firstValueFrom(
        this.http.post<T>(url, body, { headers: finalHeaders }).pipe(
          catchError(this.handleError)
        )
      );
      return data;
    } catch (error: any) {
      return this.createErrorResponse<T>(error);
    }
  }

  async put<T>(
    url: string,
    body: any,
    headers?: HttpHeaders
  ): Promise<ApiResponse<T>> {
    try {
      const finalHeaders = this.prepareHeaders(body, headers);
      
      const data: any = await firstValueFrom(
        this.http.put<T>(url, body, { headers: finalHeaders }).pipe(
          catchError(this.handleError)
        )
      );
      return data;
    } catch (error: any) {
      return this.createErrorResponse<T>(error);
    }
  }

  async patch<T>(
    url: string,
    body: any,
    headers?: HttpHeaders
  ): Promise<ApiResponse<T>> {
    try {
      const finalHeaders = this.prepareHeaders(body, headers);
      
      const data: any = await firstValueFrom(
        this.http.patch<T>(url, body, { headers: finalHeaders }).pipe(
          catchError(this.handleError)
        )
      );
      return data;
    } catch (error: any) {
      return this.createErrorResponse<T>(error);
    }
  }

  async delete<T>(url: string, headers?: HttpHeaders): Promise<ApiResponse<T>> {
    try {
      const data: any = await firstValueFrom(
        this.http.delete<T>(url, { headers }).pipe(
          catchError(this.handleError)
        )
      );
      return data;
    } catch (error: any) {
      return this.createErrorResponse<T>(error);
    }
  }

  // Private helper methods
  private prepareHeaders(body: any, headers?: HttpHeaders): HttpHeaders {
    let finalHeaders = headers || new HttpHeaders();
    
    // Auto-detect FormData
    const isFormData = body instanceof FormData;
    
    // For non-FormData, ensure JSON content type
    if (!isFormData && body && typeof body === 'object') {
      if (!finalHeaders.has('Content-Type')) {
        finalHeaders = finalHeaders.set('Content-Type', 'application/json');
      }
    }
    // For FormData, browser automatically sets multipart/form-data
    
    return finalHeaders;
  }

  private handleError = (error: HttpErrorResponse) => {
    console.error('API Error:', error);
    return throwError(() => error);
  };

  private createErrorResponse<T>(error: any): ApiResponse<T> {
    let errorMessage = 'An unexpected error occurred';
    let statusCode = 0;

    if (error instanceof HttpErrorResponse) {
      statusCode = error.status;
      errorMessage = error.error?.message || error.message || `HTTP ${error.status}`;
    } else if (error?.message) {
      errorMessage = error.message;
    }

    return new ApiResponse<T>(false, undefined, errorMessage, statusCode);
  }
}
