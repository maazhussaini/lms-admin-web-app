import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { ApiMethods } from './api-methods.service';
import { ApiResponse, LoginRequest, LoginResponse, RefreshTokenRequest, ForgotPasswordRequest, ResetPasswordRequest } from '../models';

@Injectable({
  providedIn: 'root'
})
export class HttpRequests {
  
  private baseUrl = environment.BASE_URL;

  constructor(private apiMethods: ApiMethods) { }

  // ============= AUTHENTICATION APIs =============
  
  /**
   * Universal login API for Admin, Super Admin and Teachers
   * This uses our universal authentication endpoint that automatically detects user type
   */
  async login(loginData: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    return this.apiMethods.post<LoginResponse>(`${this.baseUrl}/auth/login`, loginData);
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(refreshData: RefreshTokenRequest): Promise<ApiResponse<LoginResponse>> {
    return this.apiMethods.post<LoginResponse>(`${this.baseUrl}/auth/refresh-token`, refreshData);
  }

  /**
   * Forgot password - sends reset email
   */
  async forgotPassword(forgotData: ForgotPasswordRequest): Promise<ApiResponse<any>> {
    return this.apiMethods.post(`${this.baseUrl}/auth/forgot-password`, forgotData);
  }

  /**
   * Reset password using token from email
   */
  async resetPassword(resetData: ResetPasswordRequest): Promise<ApiResponse<any>> {
    return this.apiMethods.post(`${this.baseUrl}/auth/reset-password`, resetData);
  }

  /**
   * Logout user and invalidate tokens
   */
  async logout(): Promise<ApiResponse<any>> {
    return this.apiMethods.post(`${this.baseUrl}/auth/logout`, {});
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<ApiResponse<any>> {
    return this.apiMethods.get(`${this.baseUrl}/auth/me`);
  }

  // ============= LEGACY APIs (to be removed/updated) =============

  /**
   * @deprecated Use login() instead
   */
  async register(userData: any): Promise<ApiResponse<any>> {
    return this.apiMethods.post(`${this.baseUrl}/auth/register`, userData);
  }

  // ============= CUSTOMER APIs =============
  
  async getAllCustomers(): Promise<ApiResponse<any>> {
    return this.apiMethods.get(`${this.baseUrl}/customers/getAllCustomers`);
  }

  async getCustomerById(id: string): Promise<ApiResponse<any>> {
    return this.apiMethods.get(`${this.baseUrl}/customers/getCustomer/${id}`);
  }

  async createCustomer(customerData: any): Promise<ApiResponse<any>> {
    return this.apiMethods.post(`${this.baseUrl}/customers/createCustomer`, customerData);
  }

  async updateCustomer(id: string, customerData: any): Promise<ApiResponse<any>> {
    return this.apiMethods.put(`${this.baseUrl}/customers/updateCustomer/${id}`, customerData);
  }

  async deleteCustomer(id: string): Promise<ApiResponse<any>> {
    return this.apiMethods.delete(`${this.baseUrl}/customers/deleteCustomer/${id}`);
  }

  // ============= COURSE APIs =============
  
  async getAllCourses(): Promise<ApiResponse<any>> {
    return this.apiMethods.get(`${this.baseUrl}/courses/getAllCourses`);
  }

  async createCourse(courseData: any): Promise<ApiResponse<any>> {
    return this.apiMethods.post(`${this.baseUrl}/courses/createCourse`, courseData);
  }

  // ============= TENANT APIs =============
  
  async getAllTenants(): Promise<ApiResponse<any>> {
    return this.apiMethods.get(`${this.baseUrl}/tenants`);
  }

  async getTenantById(id: string): Promise<ApiResponse<any>> {
    return this.apiMethods.get(`${this.baseUrl}/tenants/${id}`);
  }

  async createTenant(tenantData: any): Promise<ApiResponse<any>> {
    return this.apiMethods.post(`${this.baseUrl}/tenants`, tenantData);
  }

  async updateTenant(id: string, tenantData: any): Promise<ApiResponse<any>> {
    return this.apiMethods.put(`${this.baseUrl}/tenants/${id}`, tenantData);
  }

  async deleteTenant(id: string): Promise<ApiResponse<any>> {
    return this.apiMethods.delete(`${this.baseUrl}/tenants/${id}`);
  }

  // ============= TEACHER APIs =============
  
  async getAllTeachers(): Promise<ApiResponse<any>> {
    return this.apiMethods.get(`${this.baseUrl}/teachers`);
  }

  async getTeacherById(id: string): Promise<ApiResponse<any>> {
    return this.apiMethods.get(`${this.baseUrl}/teachers/${id}`);
  }

  async createTeacher(teacherData: any): Promise<ApiResponse<any>> {
    return this.apiMethods.post(`${this.baseUrl}/teachers`, teacherData);
  }

  async updateTeacher(id: string, teacherData: any): Promise<ApiResponse<any>> {
    return this.apiMethods.put(`${this.baseUrl}/teachers/${id}`, teacherData);
  }

  async deleteTeacher(id: string): Promise<ApiResponse<any>> {
    return this.apiMethods.delete(`${this.baseUrl}/teachers/${id}`);
  }
}
