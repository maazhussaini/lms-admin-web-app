import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      throwOnError: true, // Send API errors to error boundary
    },
    mutations: {
      throwOnError: true,
    },
  },
});
