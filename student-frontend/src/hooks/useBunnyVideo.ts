/**
 * @file hooks/useBunnyVideo.ts
 * @description Custom hooks for Bunny.net video operations
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { videoService, BunnyEmbedTokenResponse, BunnyVideoConfig } from '@/services/videoService';
import { ApiError } from '@/types/auth.types';

/**
 * Base state for API operations
 */
interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
}

/**
 * Hook for generating Bunny.net embed tokens
 * 
 * @param config - Video configuration with library ID and video ID
 * @returns Object with token data, loading state, error, and refetch function
 */
export function useBunnyEmbedToken(config: BunnyVideoConfig | null) {
  const [state, setState] = useState<ApiState<BunnyEmbedTokenResponse>>({
    data: null,
    loading: false,
    error: null
  });

  // Stable values for dependencies
  const videoId = config?.videoId || null;
  const expires = config?.expires || null;

  const fetchToken = useCallback(async () => {
    if (!videoId) {
      setState({
        data: null,
        loading: false,
        error: null
      });
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const tokenData = await videoService.getBunnyEmbedToken({ 
        videoId, 
        expires: expires || undefined 
      });
      setState({
        data: tokenData,
        loading: false,
        error: null
      });
    } catch (error: unknown) {
      console.error('Failed to fetch Bunny embed token:', error);
      
      if (error instanceof ApiError) {
        setState(prev => ({
          ...prev,
          loading: false,
          error
        }));
      } else {
        const apiError = new ApiError({
          success: false,
          statusCode: 500,
          message: error instanceof Error ? error.message : 'Failed to generate video access token',
          timestamp: new Date().toISOString()
        });

        setState(prev => ({
          ...prev,
          loading: false,
          error: apiError
        }));
      }
    }
  }, [videoId, expires]);

  useEffect(() => {
    fetchToken();
  }, [fetchToken]);

  return {
    ...state,
    refetch: fetchToken
  };
}

/**
 * Hook for managing Bunny.net embed URL with token
 * 
 * @param videoId - Bunny.net video ID
 * @param expires - Token expiration in seconds (optional)
 * @returns Object with embed URL, loading state, error, and refetch function
 */
export function useBunnyEmbedUrl(videoId: string | null, expires?: number) {
  const config = useMemo(() => {
    return videoId ? { videoId, expires } : null;
  }, [videoId, expires]);
  
  const { data: tokenData, loading, error, refetch } = useBunnyEmbedToken(config);

  const embedUrl = useMemo(() => {
    return tokenData?.videoUrl || null;
  }, [tokenData?.videoUrl]);

  return {
    embedUrl,
    tokenData,
    loading,
    error,
    refetch
  };
}

/**
 * Hook for checking if Bunny.net token is expired
 * 
 * @param tokenData - Token response data
 * @returns Boolean indicating if token is expired
 */
export function useIsBunnyTokenExpired(tokenData: BunnyEmbedTokenResponse | null): boolean {
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!tokenData?.expires) {
      setIsExpired(false);
      return;
    }

    const checkExpiration = () => {
      const expirationTime = tokenData.expires * 1000; // Convert to milliseconds
      const currentTime = Date.now();
      const bufferTime = 5 * 60 * 1000; // 5 minutes buffer
      
      setIsExpired(currentTime >= (expirationTime - bufferTime));
    };

    // Check immediately
    checkExpiration();

    // Set up interval to check every minute
    const interval = setInterval(checkExpiration, 60 * 1000);

    return () => clearInterval(interval);
  }, [tokenData?.expires]);

  return isExpired;
}
