import { TApiSuccessResponse } from '@shared/types/api.types';
import {
  BaseApiClientOptions,
  ApiError,
  TimeoutError,
  buildUrl,
  prepareHeaders,
  createRequestOptions,
  createFormDataRequestOptions,
  fetchWithTimeout,
  retryWithAuth,
  addAuthHeaders
} from './client-utils';

/**
 * Interface for API client options
 */
export interface ApiClientOptions extends BaseApiClientOptions {}

// Re-export errors for backward compatibility
export { ApiError, TimeoutError };

/**
 * API client with authentication and error handling
 */
export const apiClient = {
  /**
   * Send GET request
   */
  async get<T = any>(
    endpoint: string, 
    options: ApiClientOptions = {}
  ): Promise<T> {
    return retryWithAuth(async () => {
      const url = buildUrl(endpoint);
      const headers = await prepareHeaders(options);
      const requestOptions = createRequestOptions('GET', headers, options);
      
      const response = await fetchWithTimeout<TApiSuccessResponse<T>>(url, requestOptions);
      return response.data;
    });
  },

  /**
   * Send POST request
   */
  async post<T = any, D = any>(
    endpoint: string, 
    data?: D, 
    options: ApiClientOptions = {}
  ): Promise<T> {
    return retryWithAuth(async () => {
      const url = buildUrl(endpoint);
      const headers = await prepareHeaders(options);
      const requestOptions = createRequestOptions('POST', headers, options, data);
      
      const response = await fetchWithTimeout<TApiSuccessResponse<T>>(url, requestOptions);
      return response.data;
    });
  },

  /**
   * Send PUT request
   */
  async put<T = any, D = any>(
    endpoint: string, 
    data?: D, 
    options: ApiClientOptions = {}
  ): Promise<T> {
    return retryWithAuth(async () => {
      const url = buildUrl(endpoint);
      const headers = await prepareHeaders(options);
      const requestOptions = createRequestOptions('PUT', headers, options, data);
      
      const response = await fetchWithTimeout<TApiSuccessResponse<T>>(url, requestOptions);
      return response.data;
    });
  },

  /**
   * Send DELETE request
   */
  async delete<T = any>(
    endpoint: string, 
    options: ApiClientOptions = {}
  ): Promise<T> {
    return retryWithAuth(async () => {
      const url = buildUrl(endpoint);
      const headers = await prepareHeaders(options);
      const requestOptions = createRequestOptions('DELETE', headers, options);
      
      const response = await fetchWithTimeout<TApiSuccessResponse<T>>(url, requestOptions);
      return response.data;
    });
  },

  /**
   * Upload file
   */
  async uploadFile<T = any>(
    endpoint: string, 
    file: File, 
    fieldName: string = 'file',
    options: ApiClientOptions = {}
  ): Promise<T> {
    return retryWithAuth(async () => {
      const url = buildUrl(endpoint);
      const headers = new Headers(options.headers);
      
      if (options.withAuth !== false) {
        await addAuthHeaders(headers);
      }
      
      const formData = new FormData();
      formData.append(fieldName, file);
      
      const requestOptions = createFormDataRequestOptions(headers, formData, options);
      
      const response = await fetchWithTimeout<TApiSuccessResponse<T>>(url, requestOptions);
      return response.data;
    });
  }
};
