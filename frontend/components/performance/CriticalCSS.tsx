'use client'

import { useEffect } from 'react'

interface CriticalCSSProps {
  children: React.ReactNode
}

export function CriticalCSS({ children }: CriticalCSSProps) {
  useEffect(() => {
    // Preload critical fonts
    const fonts = [
      '/fonts/inter.woff2',
      '/fonts/inter-medium.woff2',
      '/fonts/inter-semibold.woff2'
    ]

    fonts.forEach(font => {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'font'
      link.type = 'font/woff2'
      link.crossOrigin = 'anonymous'
      link.href = font
      document.head.appendChild(link)
    })

    // Preload critical CSS
    const criticalCSS = `
      /* Critical CSS for instant loading */
      .loading-skeleton {
        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
        background-size: 200% 100%;
        animation: loading 1.5s infinite;
      }
      
      @keyframes loading {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
      
      .fast-fade-in {
        animation: fadeIn 0.3s ease-in-out;
      }
      
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      /* Reduce motion for accessibility */
      @media (prefers-reduced-motion: reduce) {
        *, *::before, *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
      }
    `

    const style = document.createElement('style')
    style.innerHTML = criticalCSS
    document.head.appendChild(style)

    // Cleanup
    return () => {
      fonts.forEach(font => {
        const existing = document.querySelector(`link[href="${font}"]`)
        if (existing) document.head.removeChild(existing)
      })
      if (style.parentNode) {
        document.head.removeChild(style)
      }
    }
  }, [])

  return <>{children}</>
}

// Fast loading component wrapper
interface FastLoadProps {
  children: React.ReactNode
  className?: string
}

export function FastLoad({ children, className = '' }: FastLoadProps) {
  return (
    <div className={`fast-fade-in ${className}`}>
      {children}
    </div>
  )
}
