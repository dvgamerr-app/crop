import React from 'react';
import ReactDOM from 'react-dom/client';

import { App } from './App.tsx';

// Initialize Google AdSense
declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

// Load AdSense script dynamically
const adsenseClient = import.meta.env.VITE_ADSENSE_CLIENT;
if (adsenseClient) {
  const script = document.createElement('script');
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClient}`;
  script.async = true;
  script.crossOrigin = 'anonymous';
  document.head.appendChild(script);
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
