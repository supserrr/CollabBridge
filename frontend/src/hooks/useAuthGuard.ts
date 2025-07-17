import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import type { User } from '@/types';

interface UseAuthGuardOptions {
  redirectTo?: string;
  requiredRole?: string;
}

export const useAuthGuard = (options: UseAuthGuardOptions = {}) => {
  const { user, isLoading } = useAuthStore();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      if (isLoading) {
        return;
      }

      if (!user) {
        // User not authenticated
        if (options.redirectTo) {
          window.location.href = options.redirectTo;
        } else {
          window.location.href = '/auth/login';
        }
        setIsAuthorized(false);
        setIsChecking(false);
        return;
      }

      // Check role if required
      if (options.requiredRole && user.role !== options.requiredRole) {
        window.location.href = '/dashboard';
        setIsAuthorized(false);
        setIsChecking(false);
        return;
      }

      setIsAuthorized(true);
      setIsChecking(false);
    };

    checkAuth();
  }, [user, isLoading, options.redirectTo, options.requiredRole]);

  return {
    user,
    isAuthorized,
    isChecking,
  };
};

export const useRequireAuth = () => {
  return useAuthGuard();
};

export const useRequireRole = (requiredRole: string) => {
  return useAuthGuard({ requiredRole });
};

export default useAuthGuard;
