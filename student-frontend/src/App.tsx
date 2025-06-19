import AppRouter from '@/routes/AppRouter';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/store/queryClient';
import ErrorBoundary from '@/components/common/ErrorBoundary/ErrorBoundary';
import { HelmetProvider } from 'react-helmet-async';
import { ApiErrorBoundary } from '@/components/common/APIErrorBoundary/ApiErrorBoundary';

function App() {
  return (
    <HelmetProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <ApiErrorBoundary>
            <AppRouter />
          </ApiErrorBoundary>
        </QueryClientProvider>
      </ErrorBoundary>
    </HelmetProvider>
  );
}

export default App;