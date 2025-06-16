import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { initializeApi } from '@/api'
import { configureTokenStorage, securityUtils } from '@/utils/tokenManagement'

// Configure secure token storage based on environment
if (import.meta.env.PROD) {
  // Production: Use high security settings
  configureTokenStorage({
    strategy: 'sessionStorage',
    securityLevel: 'high',
    encryptTokens: true,
    autoCleanup: true
  });
} else {
  // Development: More permissive for debugging
  configureTokenStorage({
    strategy: 'sessionStorage',
    securityLevel: 'medium',
    encryptTokens: true,
    autoCleanup: true
  });
}

// Warn if not in secure context
if (!securityUtils.isSecureContext()) {
  console.warn('Application is not running in a secure context (HTTPS). Token security may be compromised.');
}

// Initialize the API system with interceptors and auth provider
initializeApi();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
