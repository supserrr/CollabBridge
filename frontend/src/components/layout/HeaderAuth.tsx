import React from 'react';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { 
  UserIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  ChatBubbleLeftIcon,
  BellIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';

const HeaderAuth: React.FC = () => {
  const { user, logout } = useAuthStore();

  if (!user) {
    return (
      <div className="flex items-center space-x-3">
        <a
          href="/auth/login"
          className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200"
        >
          Sign In
        </a>
        <a
          href="/auth/register"
          className="zen-btn-primary px-4 py-2 text-sm zen-hover-lift"
        >
          Get Started
        </a>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-4">
      {/* Messages - Zen Browser inspired */}
      <a
        href="/messages"
        className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200 zen-hover-lift"
        title="Messages"
      >
        <ChatBubbleLeftIcon className="w-5 h-5" />
      </a>

      {/* Notifications - Zen Browser inspired */}
      <button 
        className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200 zen-hover-lift"
        title="Notifications"
      >
        <BellIcon className="w-5 h-5" />
        {/* Zen Browser inspired notification badge */}
        <span className="absolute -top-1 -right-1 h-3 w-3 bg-gradient-to-r from-red-500 to-red-600 rounded-full border-2 border-background animate-pulse"></span>
      </button>

      {/* User dropdown - Zen Browser inspired */}
      <div className="relative group">
        <button className="flex items-center space-x-2 p-2 rounded-lg text-sm font-medium text-foreground hover:bg-muted/50 transition-all duration-200 zen-hover-lift">
          <Avatar src={user.avatar} name={user.name} size="sm" />
          <span className="hidden md:block text-muted-foreground">{user.name}</span>
          <ChevronDownIcon className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors duration-200" />
        </button>

        {/* Zen Browser inspired dropdown menu */}
        <div className="absolute right-0 mt-2 w-56 zen-glass rounded-xl shadow-lg border border-border/50 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 backdrop-blur-xl">
          <div className="px-4 py-2 border-b border-border/50 mb-2">
            <p className="text-sm font-medium text-foreground">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
          
          <a
            href="/dashboard"
            className="flex items-center px-4 py-2 text-sm text-foreground hover:bg-muted/50 transition-colors duration-200 zen-hover-lift"
          >
            <UserIcon className="w-4 h-4 mr-3 text-muted-foreground" />
            Dashboard
          </a>
          
          <a
            href="/profile"
            className="flex items-center px-4 py-2 text-sm text-foreground hover:bg-muted/50 transition-colors duration-200 zen-hover-lift"
          >
            <Cog6ToothIcon className="w-4 h-4 mr-3 text-muted-foreground" />
            Settings
          </a>
          
          <hr className="my-2 border-border/50" />
          
          <button
            onClick={logout}
            className="flex items-center w-full px-4 py-2 text-sm text-foreground hover:bg-muted/50 transition-colors duration-200 zen-hover-lift"
          >
            <ArrowRightOnRectangleIcon className="w-4 h-4 mr-3 text-muted-foreground" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default HeaderAuth;
