import React, { createContext, useContext, useEffect } from 'react'

// Simplified theme provider - only supports dark theme
interface ThemeContextType {
  theme: 'dark'
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

interface ThemeProviderProps {
  children: React.ReactNode
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  useEffect(() => {
    // Ensure dark theme is applied to document body
    document.body.classList.remove('light-theme')
    document.body.classList.add('dark-theme')
  }, [])

  return (
    <ThemeContext.Provider value={{ theme: 'dark' }}>
      {children}
    </ThemeContext.Provider>
  )
}

export default ThemeProvider
