import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { ApiMethods } from './api-methods.service';
import { ApiResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class HttpRequests {
  
  private baseUrl = environment.BASE_URL;

  constructor(private apiMethods: ApiMethods) { }

  // Customer APIs
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

  // User APIs
  async login(loginData: any): Promise<ApiResponse<any>> {
    return this.apiMethods.post(`${this.baseUrl}/auth/login`, loginData);
  }

  async register(userData: any): Promise<ApiResponse<any>> {
    return this.apiMethods.post(`${this.baseUrl}/auth/register`, userData);
  }

  // Course APIs
  async getAllCourses(): Promise<ApiResponse<any>> {
    return this.apiMethods.get(`${this.baseUrl}/courses/getAllCourses`);
  }

  async createCourse(courseData: any): Promise<ApiResponse<any>> {
    return this.apiMethods.post(`${this.baseUrl}/courses/createCourse`, courseData);
  }
}
