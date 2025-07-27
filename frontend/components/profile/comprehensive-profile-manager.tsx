'use client';

import React from 'react';
import { ProfilePictureUpload } from './profile-picture-upload';
import { ProfileEditForm } from './profile-edit-form';
import { UsernameChange } from './username-change';
import { PortfolioManager } from './portfolio-manager';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth-firebase';

interface ComprehensiveProfileManagerProps {
  onProfileUpdate?: () => void;
}

export function ComprehensiveProfileManager({ onProfileUpdate }: ComprehensiveProfileManagerProps) {
  const { user } = useAuth();

  const handleAnyUpdate = () => {
    onProfileUpdate?.();
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <p>Please sign in to access profile management features.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Picture Upload */}
      <ProfilePictureUpload 
        onAvatarUpdate={handleAnyUpdate}
      />

      {/* Profile Information Edit */}
      <ProfileEditForm 
        onProfileUpdate={handleAnyUpdate}
      />

      {/* Username Change */}
      <UsernameChange 
        onUsernameUpdate={handleAnyUpdate}
      />

      {/* Portfolio Management - Only for Creative Professionals */}
      {user.role === 'CREATIVE_PROFESSIONAL' && (
        <PortfolioManager 
          onPortfolioUpdate={handleAnyUpdate}
        />
      )}
    </div>
  );
}
