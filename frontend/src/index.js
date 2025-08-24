import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Suppress ResizeObserver errors globally before React renders
const originalError = console.error;
console.error = (...args) => {
  if (args[0] && typeof args[0] === 'string' && args[0].includes('ResizeObserver')) {
    return; // Suppress ResizeObserver errors
  }
  originalError.apply(console, args);
};

// Suppress unhandled promise rejections for ResizeObserver
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason && event.reason.message && event.reason.message.includes('ResizeObserver')) {
    event.preventDefault();
    return;
  }
});

// Suppress error events for ResizeObserver
window.addEventListener('error', (event) => {
  if (event.message && event.message.includes('ResizeObserver')) {
    event.preventDefault();
    return;
  }
});

// Override ResizeObserver to prevent errors
if (typeof window !== 'undefined' && window.ResizeObserver) {
  const OriginalResizeObserver = window.ResizeObserver;
  window.ResizeObserver = class SafeResizeObserver extends OriginalResizeObserver {
    constructor(callback) {
      super((entries, observer) => {
        try {
          callback(entries, observer);
        } catch (error) {
          if (error.message && error.message.includes('ResizeObserver')) {
            // Silently ignore ResizeObserver errors
            return;
          }
          throw error;
        }
      });
    }
  };
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
