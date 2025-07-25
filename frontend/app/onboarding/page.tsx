'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, UserRole } from '@/hooks/use-auth-firebase';
import { UsernameSetup } from '@/components/auth/username-setup';
import Loader from '@/components/ui/box-loader';

export default function OnboardingPage() {
  const { user, loading, updateProfile } = useAuth();
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    // If user is already authenticated and has a username, redirect to dashboard
    if (!loading && user && user.username) {
      router.push(`/${user.username}/dashboard`);
    }
    // If not authenticated, redirect to signin
    else if (!loading && !user) {
      router.push('/signin');
    }
  }, [user, loading, router]);

  const handleComplete = async (username: string, role: UserRole) => {
    if (!user) return;
    
    setIsUpdating(true);
    try {
      await updateProfile({ username, role });
      // After successful update, redirect to dashboard
      router.push(`/${username}/dashboard`);
    } catch (error) {
      console.error('Error updating profile:', error);
      // Handle error - maybe show a toast notification
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader />
          <p className="text-muted-foreground mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  // Show username setup for users without username
  if (!user.username) {
    return (
      <UsernameSetup
        userEmail={user.email}
        userName={user.name}
        onComplete={handleComplete}
      />
    );
  }

  // If user has username, redirect to dashboard (handled by useEffect)
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <Loader />
        <p className="text-muted-foreground mt-4">Redirecting to dashboard...</p>
      </div>
    </div>
  );
}
