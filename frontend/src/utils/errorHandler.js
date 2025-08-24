// Suppress ResizeObserver errors globally
export const suppressResizeObserverErrors = () => {
  const originalError = console.error;
  console.error = (...args) => {
    if (args[0] && typeof args[0] === 'string' && args[0].includes('ResizeObserver')) {
      return; // Suppress ResizeObserver errors
    }
    originalError.apply(console, args);
  };

  // Also suppress unhandled promise rejections for ResizeObserver
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason && event.reason.message && event.reason.message.includes('ResizeObserver')) {
      event.preventDefault();
      return;
    }
  });

  // Suppress ResizeObserver errors in error event
  window.addEventListener('error', (event) => {
    if (event.message && event.message.includes('ResizeObserver')) {
      event.preventDefault();
      return;
    }
  });
};

export default suppressResizeObserverErrors;
