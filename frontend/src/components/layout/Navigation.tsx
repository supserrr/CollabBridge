import React, { useState, useEffect } from 'react';
import { 
  Bars3Icon, 
  XMarkIcon, 
  UserCircleIcon,
  ChatBubbleBottomCenterTextIcon,
  BellIcon,
  MagnifyingGlassIcon,
  SunIcon,
  MoonIcon,
} from '@heroicons/react/24/outline';
import { Button, Avatar, Badge } from '../ui';
import { cn } from '../../lib/utils';
import authService from '../../services/auth';
import messageService from '../../services/messages';
import type { User } from '../../types';

interface NavigationProps {
  user?: User | null;
  onAuthModal?: (type: 'login' | 'register') => void;
  unreadCount?: number;
}

const Navigation: React.FC<NavigationProps> = ({ 
  user, 
  onAuthModal,
  unreadCount = 0 
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const theme = localStorage.getItem('theme') || 'light';
    setIsDarkMode(theme === 'dark');
  }, []);

  const toggleTheme = () => {
    const newTheme = isDarkMode ? 'light' : 'dark';
    setIsDarkMode(!isDarkMode);
    localStorage.setItem('theme', newTheme);
    
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-40">
      <div className="container">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <a href="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-gradient-to-br from-primary to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">CB</span>
              </div>
              <span className="font-bold text-xl text-foreground">CollabBridge</span>
            </a>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="/professionals" className="text-foreground hover:text-primary transition-colors">
              Browse Professionals
            </a>
            <a href="/events" className="text-foreground hover:text-primary transition-colors">
              Events
            </a>
            <a href="/about" className="text-foreground hover:text-primary transition-colors">
              How it Works
            </a>
            <a href="/help" className="text-foreground hover:text-primary transition-colors">
              Help
            </a>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <button className="btn-ghost btn-sm p-2 hidden sm:flex">
              <MagnifyingGlassIcon className="h-5 w-5" />
            </button>

            {/* Theme Toggle */}
            <button onClick={toggleTheme} className="btn-ghost btn-sm p-2">
              {isDarkMode ? (
                <SunIcon className="h-5 w-5" />
              ) : (
                <MoonIcon className="h-5 w-5" />
              )}
            </button>

            {user ? (
              <>
                {/* Messages */}
                <a href="/dashboard/messages" className="btn-ghost btn-sm p-2 relative">
                  <ChatBubbleBottomCenterTextIcon className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 text-xs">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </Badge>
                  )}
                </a>

                {/* Notifications */}
                <button className="btn-ghost btn-sm p-2 relative">
                  <BellIcon className="h-5 w-5" />
                </button>

                {/* User Menu */}
                <div className="relative">
                  <button 
                    className="flex items-center space-x-2 p-1 rounded-full hover:bg-accent transition-colors"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                  >
                    <Avatar
                      src={user.profileImage}
                      firstName={user.firstName}
                      lastName={user.lastName}
                      size="sm"
                    />
                  </button>

                  {/* Dropdown Menu */}
                  {isMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 card shadow-lg z-50">
                      <div className="py-1">
                        <div className="px-4 py-2 border-b border-border">
                          <p className="text-sm font-medium text-foreground">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                        
                        <a
                          href="/dashboard"
                          className="block px-4 py-2 text-sm text-foreground hover:bg-accent transition-colors"
                        >
                          Dashboard
                        </a>
                        
                        <a
                          href="/profile"
                          className="block px-4 py-2 text-sm text-foreground hover:bg-accent transition-colors"
                        >
                          Profile
                        </a>
                        
                        <a
                          href="/settings"
                          className="block px-4 py-2 text-sm text-foreground hover:bg-accent transition-colors"
                        >
                          Settings
                        </a>
                        
                        <div className="border-t border-border">
                          <button
                            onClick={handleLogout}
                            className="block w-full text-left px-4 py-2 text-sm text-foreground hover:bg-accent transition-colors"
                          >
                            Sign out
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onAuthModal?.('login')}
                >
                  Sign In
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onAuthModal?.('register')}
                >
                  Sign Up
                </Button>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden btn-ghost btn-sm p-2"
            >
              {isMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-border">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <a
                href="/professionals"
                className="block px-3 py-2 text-base font-medium text-foreground hover:bg-accent rounded-md transition-colors"
              >
                Browse Professionals
              </a>
              <a
                href="/events"
                className="block px-3 py-2 text-base font-medium text-foreground hover:bg-accent rounded-md transition-colors"
              >
                Events
              </a>
              <a
                href="/about"
                className="block px-3 py-2 text-base font-medium text-foreground hover:bg-accent rounded-md transition-colors"
              >
                How it Works
              </a>
              <a
                href="/help"
                className="block px-3 py-2 text-base font-medium text-foreground hover:bg-accent rounded-md transition-colors"
              >
                Help
              </a>
              
              {!user && (
                <div className="pt-4 border-t border-border space-y-2">
                  <Button
                    variant="outline"
                    fullWidth
                    onClick={() => onAuthModal?.('login')}
                  >
                    Sign In
                  </Button>
                  <Button
                    variant="primary"
                    fullWidth
                    onClick={() => onAuthModal?.('register')}
                  >
                    Sign Up
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
