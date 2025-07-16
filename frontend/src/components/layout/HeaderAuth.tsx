import React from 'react';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { 
  UserIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';

const HeaderAuth: React.FC = () => {
  const { user, logout } = useAuthStore();

  if (!user) {
    return (
      <div className="flex items-center space-x-3">
        <a
          href="/auth/login"
          className="text-sm font-medium text-gray-700 hover:text-brand-600"
        >
          Sign In
        </a>
        <Button size="sm">
          <a href="/auth/register">Get Started</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-4">
      {/* Messages */}
      <a
        href="/messages"
        className="text-gray-400 hover:text-gray-500"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.955 8.955 0 01-4.126-.98L3 20l1.98-5.126A8.955 8.955 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
        </svg>
      </a>

      {/* Notifications */}
      <button className="text-gray-400 hover:text-gray-500 relative">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5-5-5 5h5zm-5-10a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        {/* Notification badge */}
        <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
      </button>

      {/* User dropdown */}
      <div className="relative group">
        <button className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-brand-600">
          <Avatar src={user.avatar} name={user.name} size="sm" />
          <span className="hidden md:block">{user.name}</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Dropdown menu */}
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
          <a
            href="/dashboard"
            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            <UserIcon className="w-4 h-4 mr-2" />
            Dashboard
          </a>
          <a
            href="/profile"
            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            <Cog6ToothIcon className="w-4 h-4 mr-2" />
            Settings
          </a>
          <hr className="my-1" />
          <button
            onClick={logout}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            <ArrowRightOnRectangleIcon className="w-4 h-4 mr-2" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default HeaderAuth;
