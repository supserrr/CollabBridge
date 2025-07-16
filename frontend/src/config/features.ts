// Feature flags and app configuration
export const features = {
  // UI Features
  enableGlassmorphism: true,
  enableParallaxEffects: true,
  enableSkeletonLoading: true,
  enableInfiniteScroll: true,
  
  // Performance
  enableImageLazyLoading: true,
  enableRoutePrefetching: true,
  enableProgressiveHydration: true,
  
  // UX Enhancements
  enableSmartSearch: true,
  enableAutoComplete: true,
  enableLivePreview: true,
  
  // Animations
  enablePageTransitions: true,
  enableMicroInteractions: true,
  enableReducedMotion: true, // Respects user's system preferences
  
  // Experimental
  enableVirtualScroll: false,
  enableExperimentalUI: false
} as const;

// Theme configuration
export const theme = {
  colorMode: {
    defaultTheme: 'system', // 'light' | 'dark' | 'system'
    disableTransitionOnChange: false,
  },
  radius: {
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
  },
  animation: {
    default: '0.2s ease-in-out',
    fast: '0.1s ease-in-out',
    slow: '0.3s ease-in-out',
  }
} as const;

// Performance metrics thresholds
export const metrics = {
  fcp: 1800, // First Contentful Paint (ms)
  lcp: 2500, // Largest Contentful Paint (ms)
  fid: 100,  // First Input Delay (ms)
  cls: 0.1,  // Cumulative Layout Shift
  ttfb: 800, // Time to First Byte (ms)
} as const;

// Progressive enhancement features
export const progressiveEnhancement = {
  supportsViewTransitions: 'ViewTransition' in window,
  supportsContainerQueries: 'container' in document.documentElement.style,
  supportsHasSelector: CSS.supports('selector(:has(*))'),
  supportsStickyElements: CSS.supports('position', 'sticky'),
} as const;
