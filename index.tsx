import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Force unregister any existing service workers to prevent caching issues in the preview environment.
// Wrapped in a load event listener to avoid "The document is in an invalid state" errors.
window.addEventListener('load', async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        await registration.unregister();
        console.log('Service Worker unregistered.');
      }
    } catch (error) {
      // Silently fail if unregistration fails, as this is just a cleanup utility
      console.warn('Service Worker cleanup failed:', error);
    }
  }
});

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);