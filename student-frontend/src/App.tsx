import AppRouter from '@/routes/AppRouter';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/store/queryClient';
import ErrorBoundary from '@/components/common/ErrorBoundary/ErrorBoundary';
import { HelmetProvider } from 'react-helmet-async';

function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary>
          <AppRouter />
        </ErrorBoundary>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;