import React from 'react';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { useTheme } from './ThemeProvider';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative p-3 rounded-full bg-[var(--card-bg)] border border-[var(--border)] shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group"
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <div className="relative w-6 h-6">
        <SunIcon 
          className={`absolute inset-0 w-6 h-6 text-[var(--accent)] transition-all duration-300 ${
            theme === 'dark' ? 'opacity-0 rotate-90 scale-75' : 'opacity-100 rotate-0 scale-100 group-hover:rotate-180'
          }`} 
        />
        <MoonIcon 
          className={`absolute inset-0 w-6 h-6 text-[var(--accent)] transition-all duration-300 ${
            theme === 'dark' ? 'opacity-100 rotate-0 scale-100 group-hover:-rotate-12' : 'opacity-0 -rotate-90 scale-75'
          }`} 
        />
      </div>
    </button>
  );
};

export default ThemeToggle;
