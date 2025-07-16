import { useState, useEffect } from 'react';

// Zen-style breakpoints matching Tailwind's configuration
const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

type Breakpoint = keyof typeof breakpoints;

// Custom hook for responsive design
export function useMediaQuery(breakpoint: Breakpoint, direction: 'min' | 'max' = 'min') {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const query = `(${direction}-width: ${breakpoints[breakpoint]})`;
    const mediaQuery = window.matchMedia(query);
    
    const updateMatch = (e: MediaQueryListEvent | MediaQueryList) => {
      setMatches(e.matches);
    };

    // Initial check
    updateMatch(mediaQuery);

    // Listen for changes
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', updateMatch);
      return () => mediaQuery.removeEventListener('change', updateMatch);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(updateMatch);
      return () => mediaQuery.removeListener(updateMatch);
    }
  }, [breakpoint, direction]);

  return matches;
}

// Hook for managing reduced motion preference
export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    const updateMotionPreference = (e: MediaQueryListEvent | MediaQueryList) => {
      setPrefersReducedMotion(e.matches);
    };

    // Initial check
    updateMotionPreference(mediaQuery);

    // Listen for changes
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', updateMotionPreference);
      return () => mediaQuery.removeEventListener('change', updateMotionPreference);
    } else {
      mediaQuery.addListener(updateMotionPreference);
      return () => mediaQuery.removeListener(updateMotionPreference);
    }
  }, []);

  return prefersReducedMotion;
}

// Hook for managing color scheme preference
export function useColorScheme() {
  const [colorScheme, setColorScheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const updateColorScheme = (e: MediaQueryListEvent | MediaQueryList) => {
      setColorScheme(e.matches ? 'dark' : 'light');
    };

    // Initial check
    updateColorScheme(mediaQuery);

    // Listen for changes
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', updateColorScheme);
      return () => mediaQuery.removeEventListener('change', updateColorScheme);
    } else {
      mediaQuery.addListener(updateColorScheme);
      return () => mediaQuery.removeListener(updateColorScheme);
    }
  }, []);

  return colorScheme;
}
