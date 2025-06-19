/**
 * @file api/client-with-meta.ts
 * @description Enhanced API client that provides access to full response metadata
 */

import { TListResponse } from '@shared/types/api.types';
import { ResponseWithMeta, PaginatedResponseResult } from './response-utils';
import {
  BaseApiClientOptions,
  buildUrl,
  prepareHeaders,
  createRequestOptions,
  fetchWithTimeoutAndMeta,
  retryWithAuth
} from './client-utils';

/**
 * Extended API client options with metadata preferences
 */
export interface ApiClientOptionsWithMeta extends BaseApiClientOptions {
  includeMeta?: boolean;
}

/**
 * Response with optional metadata based on request options
 */
export type ApiResponseWithOptionalMeta<T, IncludeMeta extends boolean = false> = 
  IncludeMeta extends true ? ResponseWithMeta<T> : T;

/**
 * Paginated response with optional metadata
 */
export type PaginatedApiResponse<T, IncludeMeta extends boolean = false> = 
  IncludeMeta extends true 
    ? ResponseWithMeta<PaginatedResponseResult<T>>
    : PaginatedResponseResult<T>;

/**
 * Enhanced API client with metadata support
 */
export const apiClientWithMeta = {
  /**
   * Send GET request with optional metadata
   */
  async get<T = any, IncludeMeta extends boolean = false>(
    endpoint: string, 
    options: ApiClientOptionsWithMeta & { includeMeta?: IncludeMeta } = {}
  ): Promise<ApiResponseWithOptionalMeta<T, IncludeMeta>> {
    return retryWithAuth(async () => {
      const url = buildUrl(endpoint);
      const headers = await prepareHeaders(options);
      const requestOptions = createRequestOptions('GET', headers, options);
      
      const response = await fetchWithTimeoutAndMeta<T>(url, requestOptions);
      
      if (options.includeMeta) {
        return {
          data: response.data,
          statusCode: response.statusCode,
          message: response.message,
          correlationId: response.correlationId,
          timestamp: response.timestamp,
          success: response.success
        } as ApiResponseWithOptionalMeta<T, IncludeMeta>;
      }
      
      return response.data as ApiResponseWithOptionalMeta<T, IncludeMeta>;
    });
  },

  /**
   * Send GET request for paginated data with optional metadata
   */
  async getPaginated<T = any, IncludeMeta extends boolean = false>(
    endpoint: string,
    options: ApiClientOptionsWithMeta & { includeMeta?: IncludeMeta } = {}
  ): Promise<PaginatedApiResponse<T, IncludeMeta>> {
    return retryWithAuth(async () => {
      const url = buildUrl(endpoint);
      const headers = await prepareHeaders(options);
      const requestOptions = createRequestOptions('GET', headers, options);
      
      const response = await fetchWithTimeoutAndMeta<TListResponse<T>>(url, requestOptions);
      
      const paginatedResult: PaginatedResponseResult<T> = {
        items: response.data.items,
        pagination: response.data.pagination
      };
      
      if (options.includeMeta) {
        return {
          data: paginatedResult,
          statusCode: response.statusCode,
          message: response.message,
          correlationId: response.correlationId,
          timestamp: response.timestamp,
          success: response.success
        } as PaginatedApiResponse<T, IncludeMeta>;
      }
      
      return paginatedResult as PaginatedApiResponse<T, IncludeMeta>;
    });
  },

  /**
   * Send POST request with optional metadata
   */
  async post<T = any, D = any, IncludeMeta extends boolean = false>(
    endpoint: string, 
    data?: D, 
    options: ApiClientOptionsWithMeta & { includeMeta?: IncludeMeta } = {}
  ): Promise<ApiResponseWithOptionalMeta<T, IncludeMeta>> {
    return retryWithAuth(async () => {
      const url = buildUrl(endpoint);
      const headers = await prepareHeaders(options);
      const requestOptions = createRequestOptions('POST', headers, options, data);
      
      const response = await fetchWithTimeoutAndMeta<T>(url, requestOptions);
      
      if (options.includeMeta) {
        return {
          data: response.data,
          statusCode: response.statusCode,
          message: response.message,
          correlationId: response.correlationId,
          timestamp: response.timestamp,
          success: response.success
        } as ApiResponseWithOptionalMeta<T, IncludeMeta>;
      }
      
      return response.data as ApiResponseWithOptionalMeta<T, IncludeMeta>;
    });
  },

  /**
   * Send PUT request with optional metadata
   */
  async put<T = any, D = any, IncludeMeta extends boolean = false>(
    endpoint: string, 
    data?: D, 
    options: ApiClientOptionsWithMeta & { includeMeta?: IncludeMeta } = {}
  ): Promise<ApiResponseWithOptionalMeta<T, IncludeMeta>> {
    return retryWithAuth(async () => {
      const url = buildUrl(endpoint);
      const headers = await prepareHeaders(options);
      const requestOptions = createRequestOptions('PUT', headers, options, data);
      
      const response = await fetchWithTimeoutAndMeta<T>(url, requestOptions);
      
      if (options.includeMeta) {
        return {
          data: response.data,
          statusCode: response.statusCode,
          message: response.message,
          correlationId: response.correlationId,
          timestamp: response.timestamp,
          success: response.success
        } as ApiResponseWithOptionalMeta<T, IncludeMeta>;
      }
      
      return response.data as ApiResponseWithOptionalMeta<T, IncludeMeta>;
    });
  },

  /**
   * Send DELETE request with optional metadata
   */
  async delete<T = any, IncludeMeta extends boolean = false>(
    endpoint: string, 
    options: ApiClientOptionsWithMeta & { includeMeta?: IncludeMeta } = {}
  ): Promise<ApiResponseWithOptionalMeta<T, IncludeMeta>> {
    return retryWithAuth(async () => {
      const url = buildUrl(endpoint);
      const headers = await prepareHeaders(options);
      const requestOptions = createRequestOptions('DELETE', headers, options);
      
      const response = await fetchWithTimeoutAndMeta<T>(url, requestOptions);
      
      if (options.includeMeta) {
        return {
          data: response.data,
          statusCode: response.statusCode,
          message: response.message,
          correlationId: response.correlationId,
          timestamp: response.timestamp,
          success: response.success
        } as ApiResponseWithOptionalMeta<T, IncludeMeta>;
      }
      
      return response.data as ApiResponseWithOptionalMeta<T, IncludeMeta>;
    });
  }
};
