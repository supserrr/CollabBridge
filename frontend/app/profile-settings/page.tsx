'use client';

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Camera, Briefcase, Settings } from 'lucide-react';
import { ProfilePictureUpload } from '@/components/profile/profile-picture-upload';
import { ProfileEditForm } from '@/components/profile/profile-edit-form';
import { UsernameChange } from '@/components/profile/username-change';
import { PortfolioManager } from '@/components/profile/portfolio-manager';
import { useAuth } from '@/hooks/use-auth-firebase';

export default function ProfileSettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
              <p className="text-muted-foreground">
                Please sign in to access your profile settings.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Profile Settings</h1>
        <p className="text-muted-foreground">
          Manage your profile information, portfolio, and account settings
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="picture" className="flex items-center gap-2">
            <Camera className="h-4 w-4" />
            Picture
          </TabsTrigger>
          {user.role === 'CREATIVE_PROFESSIONAL' && (
            <TabsTrigger value="portfolio" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Portfolio
            </TabsTrigger>
          )}
          <TabsTrigger value="account" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Account
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <ProfileEditForm 
            onProfileUpdate={(data) => {
              console.log('Profile updated:', data);
            }}
          />
        </TabsContent>

        <TabsContent value="picture" className="space-y-4">
          <ProfilePictureUpload 
            onAvatarUpdate={(url: string) => {
              console.log('Profile picture updated:', url);
            }}
          />
        </TabsContent>

        {user.role === 'CREATIVE_PROFESSIONAL' && (
          <TabsContent value="portfolio" className="space-y-4">
            <PortfolioManager 
              onPortfolioUpdate={(portfolio) => {
                console.log('Portfolio updated:', portfolio);
              }}
            />
          </TabsContent>
        )}

        <TabsContent value="account" className="space-y-4">
          <div className="grid gap-4">
            <UsernameChange 
              onUsernameUpdate={(username) => {
                console.log('Username updated:', username);
              }}
            />
            
            <Card>
              <CardHeader>
                <CardTitle className="text-red-600">Danger Zone</CardTitle>
                <CardDescription>
                  Irreversible and destructive actions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border border-red-200 rounded-lg">
                    <h4 className="font-semibold text-red-600 mb-2">Delete Account</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Once you delete your account, there is no going back. This action cannot be undone.
                    </p>
                    <button 
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                      onClick={() => {
                        alert('Account deletion feature coming soon');
                      }}
                    >
                      Delete Account
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
