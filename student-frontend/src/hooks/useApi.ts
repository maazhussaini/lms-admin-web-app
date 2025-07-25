/**
 * @file hooks/useApi.ts
 * @description React hooks for API operations with enhanced error handling and loading states
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { apiClient, apiClientWithMeta } from '@/api';
import { ApiError } from '@/types/auth.types';
import { PaginatedResponseResult } from '@/api/response-utils';

// Global unhandled rejection handler for AbortErrors
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    // Check if this is an AbortError that we want to ignore
    if (event.reason instanceof DOMException && event.reason.name === 'AbortError') {
      event.preventDefault(); // Prevent the error from being logged
      return;
    }
    if (event.reason instanceof Error && event.reason.name === 'AbortError') {
      event.preventDefault(); // Prevent the error from being logged
      return;
    }
  });
}

/**
 * Base constraint for API data types
 */
type ApiData = Record<string, any> | any[] | string | number | boolean | null;

/**
 * Base state for API operations with improved typing
 */
interface ApiState<T extends ApiData> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
}

/**
 * Paginated state for list operations with better array type constraints
 */
interface PaginatedState<T extends ApiData> extends Omit<ApiState<T[]>, 'data'> {
  data: T[];
  pagination: PaginatedResponseResult<T>['pagination'] | null;
}

/**
 * Options for API hooks with better type safety
 */
interface ApiHookOptions {
  immediate?: boolean;
  retryOnError?: boolean;
  maxRetries?: number;
  retryDelay?: number;
  /**
   * Custom error handler for specific error types
   */
  onError?: (error: ApiError) => void;
  /**
   * Success callback
   */
  onSuccess?: () => void;
}

/**
 * Parameters for list API calls with proper typing
 */
interface ListParams extends Record<string, any> {
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: 'asc' | 'desc';
  search?: string;
}

/**
 * Hook result with consistent error and loading states
 */
interface BaseApiHookResult {
  loading: boolean;
  error: ApiError | null;
  isRetrying: boolean;
}

/**
 * Hook for fetching a single item with improved type constraints
 */
export function useApiItem<T extends ApiData>(
  endpoint: string,
  options: ApiHookOptions = {}
): ApiState<T> & BaseApiHookResult & {
  refetch: () => void;
} {
  const { 
    immediate = true, 
    retryOnError = false, 
    maxRetries = 3, 
    retryDelay = 1000,
    onError,
    onSuccess
  } = options;
  
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null
  });
  
  const retryCountRef = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);

  const fetchData = useCallback(async (): Promise<void> => {
    // Cancel previous request safely
    if (abortControllerRef.current) {
      try {
        abortControllerRef.current.abort();
      } catch {
        // Ignore any errors from abort()
      }
    }

    abortControllerRef.current = new AbortController();
    
    if (!isMountedRef.current) return;
    
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const data = await apiClient.get<T>(endpoint, {
        signal: abortControllerRef.current.signal
      });
      
      if (!isMountedRef.current) return;
      
      setState({
        data,
        loading: false,
        error: null
      });
      
      retryCountRef.current = 0;
      onSuccess?.();
    } catch (error: unknown) {
      if (!isMountedRef.current) return;
      
      // Handle AbortError - should be ignored (from request cancellation)
      if (error instanceof DOMException && error.name === 'AbortError') {
        // Request was aborted (component unmount, new request, etc.)
        // Don't update state or show error - this is expected behavior
        return;
      }
      
      // Handle other AbortError types
      if (error instanceof Error && error.name === 'AbortError') {
        // Also an abort error, ignore silently
        return;
      }

      if (error instanceof ApiError) {
        setState(prev => ({
          ...prev,
          loading: false,
          error
        }));

        onError?.(error);

        // Retry logic for server errors
        if (retryOnError && 
            error.statusCode >= 500 && 
            retryCountRef.current < maxRetries) {
          
          retryCountRef.current++;
          setTimeout(fetchData, retryDelay * Math.pow(2, retryCountRef.current - 1));
        }
      } else if (error instanceof Error) {
        // Handle other unexpected errors
        const apiError = new ApiError({
          success: false,
          statusCode: 500,
          message: error.message || 'An unexpected error occurred',
          timestamp: new Date().toISOString()
        });

        setState(prev => ({
          ...prev,
          loading: false,
          error: apiError
        }));

        onError?.(apiError);
      }
    }
  }, [endpoint, retryOnError, maxRetries, retryDelay, onError, onSuccess]);

  const refetch = useCallback((): void => {
    retryCountRef.current = 0;
    fetchData().catch(() => {
      // Silently catch any errors from refetch to prevent uncaught promises
    });
  }, [fetchData]);

  useEffect(() => {
    isMountedRef.current = true;
    
    if (immediate) {
      fetchData().catch(() => {
        // Silently handle any errors to prevent uncaught promises
      });
    }

    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        try {
          abortControllerRef.current.abort();
        } catch {
          // Ignore any errors from abort()
        }
      }
    };
  }, [fetchData, immediate]);

  return {
    ...state,
    refetch,
    isRetrying: retryCountRef.current > 0
  };
}

/**
 * Hook for fetching paginated lists with enhanced type safety
 */
export function useApiList<T extends ApiData>(
  endpoint: string,
  initialParams: ListParams = {},
  options: ApiHookOptions = {}
): PaginatedState<T> & BaseApiHookResult & {
  params: ListParams;
  updateParams: (newParams: Partial<ListParams>) => void;
  resetParams: () => void;
  refetch: () => void;
  goToPage: (page: number) => void;
  changePageSize: (limit: number) => void;
  sort: (field: string, order?: 'asc' | 'desc') => void;
  search: (query: string) => void;
} {
  const { 
    immediate = true, 
    retryOnError = false, 
    maxRetries = 3, 
    retryDelay = 1000,
    onError,
    onSuccess
  } = options;
  
  const [state, setState] = useState<PaginatedState<T>>({
    data: [],
    pagination: null,
    loading: false,
    error: null
  });
  
  const [params, setParams] = useState<ListParams>(initialParams);
  const retryCountRef = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);

  const fetchData = useCallback(async (requestParams: ListParams = params): Promise<void> => {
    // Cancel previous request safely
    if (abortControllerRef.current) {
      try {
        abortControllerRef.current.abort();
      } catch {
        // Ignore any errors from abort()
      }
    }

    abortControllerRef.current = new AbortController();
    
    if (!isMountedRef.current) return;
    
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const queryParams = new URLSearchParams();
      Object.entries(requestParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, String(value));
        }
      });

      const url = queryParams.toString() ? `${endpoint}?${queryParams}` : endpoint;
      
      const result = await apiClientWithMeta.getPaginated<T>(url, {
        signal: abortControllerRef.current.signal
      });
      
      if (!isMountedRef.current) return;
      
      setState({
        data: result.items,
        pagination: result.pagination,
        loading: false,
        error: null
      });
      
      retryCountRef.current = 0;
      onSuccess?.();
    } catch (error: unknown) {
      if (!isMountedRef.current) return;
      
      // Handle AbortError - should be ignored (from request cancellation)
      if (error instanceof DOMException && error.name === 'AbortError') {
        // Request was aborted (component unmount, new request, etc.)
        // Don't update state or show error - this is expected behavior
        return;
      }
      
      // Handle other AbortError types
      if (error instanceof Error && error.name === 'AbortError') {
        // Also an abort error, ignore silently
        return;
      }

      if (error instanceof ApiError) {
        setState(prev => ({
          ...prev,
          loading: false,
          error
        }));

        onError?.(error);

        if (retryOnError && 
            error.statusCode >= 500 && 
            retryCountRef.current < maxRetries) {
          
          retryCountRef.current++;
          setTimeout(() => fetchData(requestParams), retryDelay * Math.pow(2, retryCountRef.current - 1));
        }
      } else if (error instanceof Error) {
        // Handle other unexpected errors
        const apiError = new ApiError({
          success: false,
          statusCode: 500,
          message: error.message || 'An unexpected error occurred',
          timestamp: new Date().toISOString()
        });

        setState(prev => ({
          ...prev,
          loading: false,
          error: apiError
        }));

        onError?.(apiError);
      }
    }
  }, [endpoint, params, retryOnError, maxRetries, retryDelay, onError, onSuccess]);

  const updateParams = useCallback((newParams: Partial<ListParams>): void => {
    setParams(prev => ({ ...prev, ...newParams }));
  }, []);

  const resetParams = useCallback((): void => {
    setParams(initialParams);
  }, [initialParams]);

  const refetch = useCallback((): void => {
    retryCountRef.current = 0;
    fetchData().catch(() => {
      // Silently catch any errors from refetch to prevent uncaught promises
    });
  }, [fetchData]);

  // Navigation helpers with proper typing
  const goToPage = useCallback((page: number): void => {
    updateParams({ page });
  }, [updateParams]);

  const changePageSize = useCallback((limit: number): void => {
    updateParams({ limit, page: 1 }); // Reset to first page when changing page size
  }, [updateParams]);

  const sort = useCallback((field: string, order: 'asc' | 'desc' = 'asc'): void => {
    updateParams({ sortBy: field, order, page: 1 }); // Reset to first page when sorting
  }, [updateParams]);

  const search = useCallback((query: string): void => {
    updateParams({ search: query, page: 1 }); // Reset to first page when searching
  }, [updateParams]);

  useEffect(() => {
    isMountedRef.current = true;
    
    if (immediate) {
      fetchData().catch(() => {
        // Silently handle any errors to prevent uncaught promises
      });
    }

    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        try {
          abortControllerRef.current.abort();
        } catch {
          // Ignore any errors from abort()
        }
      }
    };
  }, [fetchData, immediate]);

  // Re-fetch when params change
  useEffect(() => {
    if (immediate && isMountedRef.current) {
      fetchData(params).catch(() => {
        // Silently handle any errors to prevent uncaught promises
      });
    }
  }, [params, fetchData, immediate]);

  return {
    ...state,
    params,
    updateParams,
    resetParams,
    refetch,
    goToPage,
    changePageSize,
    sort,
    search,
    isRetrying: retryCountRef.current > 0
  };
}

/**
 * Hook for create operations with improved generic constraints
 */
export function useApiCreate<T extends ApiData, D extends ApiData = Record<string, any>>(
  endpoint: string
): ApiState<T> & BaseApiHookResult & {
  create: (data: D) => Promise<T | null>;
  reset: () => void;
} {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null
  });

  const create = useCallback(async (data: D): Promise<T | null> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await apiClient.post<T, D>(endpoint, data);
      
      setState({
        data: result,
        loading: false,
        error: null
      });

      return result;
    } catch (error: unknown) {
      // Handle AbortError - should be ignored (from request cancellation)
      if (error instanceof DOMException && error.name === 'AbortError') {
        // Request was aborted, don't update state
        return null;
      }
      
      // Handle other AbortError types
      if (error instanceof Error && error.name === 'AbortError') {
        // Also an abort error, ignore silently
        return null;
      }

      if (error instanceof ApiError) {
        setState(prev => ({
          ...prev,
          loading: false,
          error
        }));
      } else if (error instanceof Error) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: new ApiError({
            success: false,
            statusCode: 500,
            message: error.message || 'An unexpected error occurred',
            timestamp: new Date().toISOString()
          })
        }));
      }
      return null;
    }
  }, [endpoint]);

  const reset = useCallback((): void => {
    setState({
      data: null,
      loading: false,
      error: null
    });
  }, []);

  return {
    ...state,
    create,
    reset,
    isRetrying: false
  };
}

/**
 * Hook for update operations with enhanced type constraints
 */
export function useApiUpdate<T extends ApiData, D extends ApiData = Record<string, any>>(
  endpoint: string
): ApiState<T> & BaseApiHookResult & {
  update: (id: string | number, data: D) => Promise<T | null>;
  reset: () => void;
} {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null
  });

  const update = useCallback(async (id: string | number, data: D): Promise<T | null> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await apiClient.put<T, D>(`${endpoint}/${id}`, data);
      
      setState({
        data: result,
        loading: false,
        error: null
      });

      return result;
    } catch (error: unknown) {
      // Handle AbortError - should be ignored (from request cancellation)
      if (error instanceof DOMException && error.name === 'AbortError') {
        // Request was aborted, don't update state
        return null;
      }
      
      // Handle other AbortError types
      if (error instanceof Error && error.name === 'AbortError') {
        // Also an abort error, ignore silently
        return null;
      }

      if (error instanceof ApiError) {
        setState(prev => ({
          ...prev,
          loading: false,
          error
        }));
      } else if (error instanceof Error) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: new ApiError({
            success: false,
            statusCode: 500,
            message: error.message || 'An unexpected error occurred',
            timestamp: new Date().toISOString()
          })
        }));
      }
      return null;
    }
  }, [endpoint]);

  const reset = useCallback((): void => {
    setState({
      data: null,
      loading: false,
      error: null
    });
  }, []);

  return {
    ...state,
    update,
    reset,
    isRetrying: false
  };
}

/**
 * Hook for delete operations with proper typing
 */
export function useApiDelete(
  endpoint: string
): ApiState<boolean> & BaseApiHookResult & {
  delete: (id: string | number) => Promise<boolean>;
  reset: () => void;
} {
  const [state, setState] = useState<ApiState<boolean>>({
    data: null,
    loading: false,
    error: null
  });

  const deleteItem = useCallback(async (id: string | number): Promise<boolean> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      await apiClient.delete(`${endpoint}/${id}`);
      
      setState({
        data: true,
        loading: false,
        error: null
      });

      return true;
    } catch (error: unknown) {
      // Handle AbortError - should be ignored (from request cancellation)
      if (error instanceof DOMException && error.name === 'AbortError') {
        // Request was aborted, don't update state
        return false;
      }
      
      // Handle other AbortError types
      if (error instanceof Error && error.name === 'AbortError') {
        // Also an abort error, ignore silently
        return false;
      }

      if (error instanceof ApiError) {
        setState(prev => ({
          ...prev,
          loading: false,
          error
        }));
      } else if (error instanceof Error) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: new ApiError({
            success: false,
            statusCode: 500,
            message: error.message || 'An unexpected error occurred',
            timestamp: new Date().toISOString()
          })
        }));
      }
      return false;
    }
  }, [endpoint]);

  const reset = useCallback((): void => {
    setState({
      data: null,
      loading: false,
      error: null
    });
  }, []);

  return {
    ...state,
    delete: deleteItem,
    reset,
    isRetrying: false
  };
}

/**
 * Hook for combined CRUD operations with full type safety
 */
export function useApiCrud<T extends ApiData, D extends ApiData = Record<string, any>>(
  endpoint: string,
  options: ApiHookOptions = {}
) {
  const listHook = useApiList<T>(endpoint, {}, options);
  const createHook = useApiCreate<T, D>(endpoint);
  const updateHook = useApiUpdate<T, D>(endpoint);
  const deleteHook = useApiDelete(endpoint);

  const createAndRefresh = useCallback(async (data: D): Promise<T | null> => {
    const result = await createHook.create(data);
    if (result) {
      listHook.refetch();
    }
    return result;
  }, [createHook, listHook]);

  const updateAndRefresh = useCallback(async (id: string | number, data: D): Promise<T | null> => {
    const result = await updateHook.update(id, data);
    if (result) {
      listHook.refetch();
    }
    return result;
  }, [updateHook, listHook]);

  const deleteAndRefresh = useCallback(async (id: string | number): Promise<boolean> => {
    const result = await deleteHook.delete(id);
    if (result) {
      listHook.refetch();
    }
    return result;
  }, [deleteHook, listHook]);

  const resetAll = useCallback((): void => {
    createHook.reset();
    updateHook.reset();
    deleteHook.reset();
  }, [createHook, updateHook, deleteHook]);

  return {
    // List operations
    list: listHook,
    
    // Individual CRUD operations
    create: createHook,
    update: updateHook,
    delete: deleteHook,
    
    // Combined operations with refresh
    createAndRefresh,
    updateAndRefresh,
    deleteAndRefresh,
    
    // Utility methods
    resetAll,
    
    // Aggregated loading state
    isLoading: listHook.loading || createHook.loading || updateHook.loading || deleteHook.loading,
    
    // Aggregated error state (prioritize create/update/delete errors over list errors)
    error: createHook.error || updateHook.error || deleteHook.error || listHook.error,
    
    // Check if any operation is retrying
    isRetrying: listHook.isRetrying || createHook.isRetrying || updateHook.isRetrying || deleteHook.isRetrying
  };
}

/**
 * Hook for bulk operations (optional enhancement)
 */
export function useApiBulk<T extends ApiData>(
  endpoint: string
): ApiState<T[]> & BaseApiHookResult & {
  bulkDelete: (ids: (string | number)[]) => Promise<boolean>;
  bulkUpdate: (updates: { id: string | number; data: Partial<T> }[]) => Promise<T[] | null>;
  reset: () => void;
} {
  const [state, setState] = useState<ApiState<T[]>>({
    data: null,
    loading: false,
    error: null
  });

  const bulkDelete = useCallback(async (ids: (string | number)[]): Promise<boolean> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      await apiClient.post(`${endpoint}/bulk-delete`, { ids });
      
      setState({
        data: [],
        loading: false,
        error: null
      });

      return true;
    } catch (error: unknown) {
      // Handle AbortError - should be ignored (from request cancellation)
      if (error instanceof DOMException && error.name === 'AbortError') {
        // Request was aborted, don't update state
        return false;
      }
      
      // Handle other AbortError types
      if (error instanceof Error && error.name === 'AbortError') {
        // Also an abort error, ignore silently
        return false;
      }

      if (error instanceof ApiError) {
        setState(prev => ({ ...prev, loading: false, error }));
      } else if (error instanceof Error) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: new ApiError({
            success: false,
            statusCode: 500,
            message: error.message || 'Bulk delete failed',
            timestamp: new Date().toISOString()
          })
        }));
      }
      return false;
    }
  }, [endpoint]);

  const bulkUpdate = useCallback(async (updates: { id: string | number; data: Partial<T> }[]): Promise<T[] | null> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await apiClient.post<T[]>(`${endpoint}/bulk-update`, { updates });
      
      setState({
        data: result,
        loading: false,
        error: null
      });

      return result;
    } catch (error: unknown) {
      // Handle AbortError - should be ignored (from request cancellation)
      if (error instanceof DOMException && error.name === 'AbortError') {
        // Request was aborted, don't update state
        return null;
      }
      
      // Handle other AbortError types
      if (error instanceof Error && error.name === 'AbortError') {
        // Also an abort error, ignore silently
        return null;
      }

      if (error instanceof ApiError) {
        setState(prev => ({ ...prev, loading: false, error }));
      } else if (error instanceof Error) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: new ApiError({
            success: false,
            statusCode: 500,
            message: error.message || 'Bulk update failed',
            timestamp: new Date().toISOString()
          })
        }));
      }
      return null;
    }
  }, [endpoint]);

  const reset = useCallback((): void => {
    setState({
      data: null,
      loading: false,
      error: null
    });
  }, []);

  return {
    ...state,
    bulkDelete,
    bulkUpdate,
    reset,
    isRetrying: false
  };
}

/**
 * Hook for batch retry operations across multiple API hooks
 * Useful when you need to retry several API calls at once
 */
export function useBatchRetry(hooks: Array<{ refetch?: () => void }>) {
  const retryAll = useCallback(() => {
    hooks.forEach(hook => {
      if (hook.refetch) {
        hook.refetch();
      }
    });
  }, [hooks]);

  const hasErrors = useMemo(() => {
    return hooks.some(hook => 'error' in hook && hook.error);
  }, [hooks]);

  const isLoading = useMemo(() => {
    return hooks.some(hook => 'loading' in hook && hook.loading);
  }, [hooks]);

  return {
    retryAll,
    hasErrors,
    isLoading,
  };
}

/**
 * Hook for aggregating state across multiple API hooks
 * Useful for getting combined loading/error states
 */
export function useApiStateAggregator(hooks: Array<{ loading?: boolean; error?: unknown }>) {
  const aggregatedState = useMemo(() => {
    const loading = hooks.some(hook => hook.loading);
    const errors = hooks.filter(hook => hook.error).map(hook => hook.error);
    const hasErrors = errors.length > 0;

    return {
      loading,
      hasErrors,
      errors,
      firstError: errors[0] || null,
    };
  }, [hooks]);

  return aggregatedState;
}
