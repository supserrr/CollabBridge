import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}

// Enhanced hook with custom breakpoint support
export function useIsDevice(breakpoint: number = MOBILE_BREAKPOINT) {
  const [isDevice, setIsDevice] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${breakpoint - 1}px)`)
    const onChange = () => {
      setIsDevice(window.innerWidth < breakpoint)
    }
    mql.addEventListener("change", onChange)
    setIsDevice(window.innerWidth < breakpoint)
    return () => mql.removeEventListener("change", onChange)
  }, [breakpoint])

  return !!isDevice
}

// Tablet breakpoint hook
export function useIsTablet() {
  return useIsDevice(1024) // iPad Pro and smaller
}

// Large mobile breakpoint hook  
export function useIsLargeMobile() {
  return useIsDevice(640) // iPhone Pro Max and smaller
}

