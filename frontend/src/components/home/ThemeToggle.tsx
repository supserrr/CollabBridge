import React, { useState, useEffect } from 'react'
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline'

const ThemeToggle: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    // Check if user has a saved theme preference
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark')
      document.body.classList.toggle('dark-theme', savedTheme === 'dark')
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setIsDarkMode(prefersDark)
      document.body.classList.toggle('dark-theme', prefersDark)
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = isDarkMode ? 'light' : 'dark'
    setIsDarkMode(!isDarkMode)
    
    // Save preference to localStorage
    localStorage.setItem('theme', newTheme)
    
    // Toggle body class for CSS theme switching
    document.body.classList.toggle('dark-theme', newTheme === 'dark')
  }

  return (
    <button
      onClick={toggleTheme}
      className="p-3 bg-[var(--card-bg)] border border-[var(--border)] rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group"
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDarkMode ? (
        <SunIcon className="w-6 h-6 text-[var(--accent)] group-hover:rotate-180 transition-transform duration-300" />
      ) : (
        <MoonIcon className="w-6 h-6 text-[var(--accent)] group-hover:-rotate-12 transition-transform duration-300" />
      )}
    </button>
  )
}

export default ThemeToggle
