'use client';

import React, { useState } from 'react';
import { Check, AlertTriangle, User } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/use-auth-firebase';
import { toast } from 'sonner';

interface UsernameChangeProps {
  currentUsername?: string;
  onUsernameUpdate?: (newUsername: string) => void;
}

export function UsernameChange({ currentUsername, onUsernameUpdate }: UsernameChangeProps) {
  const { user, checkUsernameAvailability, updateProfile } = useAuth();
  const [newUsername, setNewUsername] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState('');

  const validateUsername = (username: string) => {
    if (username.length < 3) {
      return 'Username must be at least 3 characters long';
    }
    if (username.length > 20) {
      return 'Username must be less than 20 characters';
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      return 'Username can only contain letters, numbers, underscores, and hyphens';
    }
    if (username === currentUsername) {
      return 'This is your current username';
    }
    return '';
  };

  const checkAvailability = async (username: string) => {
    const validationError = validateUsername(username);
    if (validationError) {
      setError(validationError);
      setIsAvailable(null);
      return;
    }

    setIsChecking(true);
    setError('');
    
    try {
      const available = await checkUsernameAvailability(username);
      setIsAvailable(available);
      if (!available) {
        setError('This username is already taken');
      }
    } catch (error) {
      setError('Failed to check username availability');
      setIsAvailable(null);
    } finally {
      setIsChecking(false);
    }
  };

  const handleUsernameChange = (value: string) => {
    setNewUsername(value.toLowerCase().trim());
    setIsAvailable(null);
    setError('');
    
    // Debounce the availability check
    if (value.trim()) {
      const timeoutId = setTimeout(() => {
        checkAvailability(value.toLowerCase().trim());
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  };

  const handleUpdate = async () => {
    if (!newUsername || !isAvailable || !user) return;

    setIsUpdating(true);
    try {
      await updateProfile({ username: newUsername });
      
      if (onUsernameUpdate) {
        onUsernameUpdate(newUsername);
      }

      toast.success('Username updated successfully!');
      setNewUsername('');
      setIsAvailable(null);
      
      // Redirect to new username URL
      window.location.href = `/${newUsername}/dashboard/settings`;
      
    } catch (error: any) {
      console.error('Username update error:', error);
      toast.error(error.message || 'Failed to update username');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Change Username
        </CardTitle>
        <CardDescription>
          Update your unique username. This will change your profile URL.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="current-username">Current Username</Label>
          <Input
            id="current-username"
            value={currentUsername || ''}
            disabled
            className="bg-muted"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="new-username">New Username</Label>
          <div className="relative">
            <Input
              id="new-username"
              value={newUsername}
              onChange={(e) => handleUsernameChange(e.target.value)}
              placeholder="Enter new username"
              className={
                isAvailable === true 
                  ? 'border-green-500 pr-10' 
                  : isAvailable === false || error
                  ? 'border-red-500 pr-10'
                  : ''
              }
            />
            {isChecking && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted border-t-foreground" />
              </div>
            )}
            {isAvailable === true && (
              <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
            )}
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isAvailable === true && (
          <Alert>
            <Check className="h-4 w-4" />
            <AlertDescription>
              Username is available! Your new profile URL will be: /{newUsername}
            </AlertDescription>
          </Alert>
        )}

        <div className="bg-muted p-4 rounded-lg space-y-2">
          <h4 className="font-medium">Username Requirements:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• 3-20 characters long</li>
            <li>• Only letters, numbers, underscores (_), and hyphens (-)</li>
            <li>• Must be unique across the platform</li>
            <li>• Case insensitive</li>
          </ul>
        </div>

        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Warning:</strong> Changing your username will update your profile URL. 
            Old links to your profile will no longer work. Make sure to update any shared links.
          </AlertDescription>
        </Alert>

        <div className="flex justify-end">
          <Button 
            onClick={handleUpdate}
            disabled={!isAvailable || isUpdating || !newUsername}
            className="flex items-center gap-2"
          >
            {isUpdating ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-foreground" />
            ) : (
              <Check className="h-4 w-4" />
            )}
            {isUpdating ? 'Updating...' : 'Update Username'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
