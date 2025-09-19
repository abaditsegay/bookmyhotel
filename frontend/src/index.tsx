import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

import App from './App';
import theme from './theme/theme';
import { AuthProvider } from './contexts/AuthContext';
import { TenantProvider, useTenant } from './contexts/TenantContext';
import './index.css';

// Initialize Stripe with better offline handling
const stripePublishableKey = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;
let stripePromise: Promise<any> | null = null;

// Only initialize Stripe if we have a key and can connect
if (stripePublishableKey) {
  try {
    // Create a promise that resolves to null if offline
    stripePromise = navigator.onLine 
      ? loadStripe(stripePublishableKey)
      : Promise.resolve(null);
  } catch (error) {
    console.warn('Stripe initialization failed, continuing without payment processing:', error);
    stripePromise = null;
  }
}

// Initialize React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Component to connect Auth and Tenant contexts
const AppWithProviders: React.FC = () => {
  const { updateTenantFromToken, clearTenant } = useTenant();

  return (
    <AuthProvider 
      onTokenChange={updateTenantFromToken}
      onLogout={clearTenant}
    >
      <App />
    </AuthProvider>
  );
};

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <BrowserRouter future={{ v7_relativeSplatPath: true }}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {stripePromise ? (
            <Elements stripe={stripePromise}>
              <TenantProvider>
                <AppWithProviders />
              </TenantProvider>
            </Elements>
          ) : (
            <TenantProvider>
              <AppWithProviders />
            </TenantProvider>
          )}
        </ThemeProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>
);

// Cleanup existing service workers to prevent errors
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => {
      registration.unregister();
    });
  });
}

// Register service worker for PWA functionality - DISABLED to prevent development errors
/*
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered successfully: ', registration);
        
        // Listen for updates
        registration.addEventListener('updatefound', () => {
          console.log('New service worker is being installed...');
        });
        
        // Force refresh if there's a waiting service worker
        if (registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
        
        // Check for updates every 60 seconds
        setInterval(() => {
          registration.update();
        }, 60000);
      })
      .catch((registrationError) => {
        console.error('SW registration failed: ', registrationError);
      });
      
    // Listen for service worker messages
    navigator.serviceWorker.addEventListener('message', (event) => {
      console.log('Message from service worker:', event.data);
    });
    
    // Listen for controller changes (new SW activated)
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('Service worker controller changed, reloading...');
      window.location.reload();
    });
  });
} else {
  console.log('Service workers are not supported in this browser');
}
*/
