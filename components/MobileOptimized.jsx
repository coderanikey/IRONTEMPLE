// Mobile optimization utilities
export const isMobile = () => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth <= 768;
};

export const isTouchDevice = () => {
  if (typeof window === 'undefined') return false;
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

// Prevent zoom on input focus (iOS)
export const preventZoom = () => {
  if (typeof window === 'undefined') return;
  
  const viewport = document.querySelector('meta[name="viewport"]');
  if (viewport && isMobile()) {
    viewport.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no');
  }
};

// Restore zoom after input blur
export const restoreZoom = () => {
  if (typeof window === 'undefined') return;
  
  const viewport = document.querySelector('meta[name="viewport"]');
  if (viewport && isMobile()) {
    viewport.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes');
  }
};
