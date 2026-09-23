import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerServiceWorker } from './services/serviceWorkerManager';

// Auto-register Service Worker for PWA, background push, and native OS notifications
if (typeof window !== 'undefined') {
  registerServiceWorker().catch((err) => {
    console.warn('[PromoRadar] SW auto-registration:', err);
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
