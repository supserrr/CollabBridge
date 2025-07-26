'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/use-auth-firebase';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

type UserRole = 'EVENT_PLANNER' | 'CREATIVE_PROFESSIONAL';

interface UsernameSetupProps {
  userEmail: string;
  userName: string;
  onComplete: (username: string, role: UserRole) => void;
}

export function UsernameSetup({ userEmail, userName, onComplete }: UsernameSetupProps) {
  const [username, setUsername] = useState('');
  const [role, setRole] = useState<UserRole>('CREATIVE_PROFESSIONAL');
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { checkUsernameAvailability } = useAuth();

  // Generate initial username suggestion
  useEffect(() => {
    const suggestedUsername = userName.toLowerCase().replace(/\s+/g, '') || 
                            userEmail.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
    setUsername(suggestedUsername);
  }, [userName, userEmail]);

  // Check username availability with debounce
  useEffect(() => {
    if (username.length < 3) {
      setUsernameAvailable(null);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsCheckingUsername(true);
      try {
        const available = await checkUsernameAvailability(username);
        setUsernameAvailable(available);
      } catch (error) {
        console.error('Error checking username:', error);
        setUsernameAvailable(null);
      } finally {
        setIsCheckingUsername(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [username, checkUsernameAvailability]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (username.length < 3 || !usernameAvailable) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onComplete(username, role);
    } catch (error) {
      console.error('Error completing setup:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getUsernameStatus = () => {
    if (username.length < 3) {
      return { icon: null, text: 'Username must be at least 3 characters', color: 'text-muted-foreground' };
    }
    if (isCheckingUsername) {
      return { icon: <Loader2 className="h-4 w-4 animate-spin" />, text: 'Checking availability...', color: 'text-muted-foreground' };
    }
    if (usernameAvailable === true) {
      return { icon: <CheckCircle className="h-4 w-4" />, text: 'Username available!', color: 'text-green-600' };
    }
    if (usernameAvailable === false) {
      return { icon: <XCircle className="h-4 w-4" />, text: 'Username already taken', color: 'text-red-600' };
    }
    return { icon: null, text: '', color: 'text-muted-foreground' };
  };

  const status = getUsernameStatus();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-white to-cyan-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-cyan-600 bg-clip-text text-transparent">
            Complete Your Profile
          </CardTitle>
          <CardDescription>
            Choose a username and select your role to finish setting up your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                placeholder="Enter your username"
                className="transition-colors focus:border-violet-400"
                maxLength={30}
              />
              {status.icon && (
                <div className={`flex items-center gap-2 text-sm ${status.color}`}>
                  {status.icon}
                  <span>{status.text}</span>
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Username can only contain letters, numbers, and underscores
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Your Role</Label>
              <Select value={role} onValueChange={(value: string) => setRole(value as UserRole)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EVENT_PLANNER">Event Planner</SelectItem>
                  <SelectItem value="CREATIVE_PROFESSIONAL">Creative Professional</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-700 hover:to-cyan-700"
              disabled={!usernameAvailable || isSubmitting || username.length < 3}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Complete Setup
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
