'use client';

import React, { useState, useEffect } from 'react';
import { Save, User, Mail, MapPin, Phone, Calendar, FileText } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/use-auth-firebase';
import { toast } from 'sonner';

interface ProfileData {
  name: string;
  displayName: string;
  email: string;
  bio: string;
  location: string;
  phone: string;
  categories: string[];
  skills: string[];
  experience: string;
  hourlyRate: string;
  dailyRate: string;
  availability: string;
  portfolioImages: string[];
  portfolioLinks: string[];
  equipment: string;
  languages: string[];
  certifications: string[];
  awards: string[];
  responseTime: string;
  travelRadius: string;
}

interface ProfileEditFormProps {
  onProfileUpdate?: (updatedProfile: ProfileData) => void;
}

export function ProfileEditForm({ onProfileUpdate }: ProfileEditFormProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    name: '',
    displayName: '',
    email: '',
    bio: '',
    location: '',
    phone: '',
    categories: [],
    skills: [],
    experience: '',
    hourlyRate: '',
    dailyRate: '',
    availability: '',
    portfolioImages: [],
    portfolioLinks: [],
    equipment: '',
    languages: [],
    certifications: [],
    awards: [],
    responseTime: '',
    travelRadius: '',
  });

  // Load current profile data
  useEffect(() => {
    const loadProfileData = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        // Get Firebase token using the same pattern as the API
        const { getAuth } = await import('firebase/auth');
        const auth = getAuth();
        const firebaseUser = auth.currentUser;
        
        if (!firebaseUser) {
          throw new Error('No authenticated user found');
        }
        
        const token = await firebaseUser.getIdToken();
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          const userData = data.user;
          const creativeProfile = userData.creative_profiles;
          
          setProfileData({
            name: userData.name || '',
            displayName: userData.displayName || userData.name || '',
            email: userData.email || '',
            bio: userData.bio || '',
            location: userData.location || '',
            phone: userData.phone || '',
            categories: creativeProfile?.categories || [],
            skills: creativeProfile?.skills || [],
            experience: creativeProfile?.experience || '',
            hourlyRate: creativeProfile?.hourlyRate?.toString() || '',
            dailyRate: creativeProfile?.dailyRate?.toString() || '',
            availability: creativeProfile?.isAvailable ? 'available' : 'unavailable',
            portfolioImages: creativeProfile?.portfolioImages || [],
            portfolioLinks: creativeProfile?.portfolioLinks || [],
            equipment: creativeProfile?.equipment || '',
            languages: creativeProfile?.languages || [],
            certifications: creativeProfile?.certifications || [],
            awards: creativeProfile?.awards || [],
            responseTime: creativeProfile?.responseTime?.toString() || '',
            travelRadius: creativeProfile?.travelRadius?.toString() || '',
          });
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        toast.error('Failed to load profile data');
      } finally {
        setIsLoading(false);
      }
    };

    loadProfileData();
  }, [user]);

  const handleInputChange = (field: keyof ProfileData, value: string | string[]) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      // Get Firebase token using the same pattern as the API
      const { getAuth } = await import('firebase/auth');
      const auth = getAuth();
      const firebaseUser = auth.currentUser;
      
      if (!firebaseUser) {
        throw new Error('No authenticated user found');
      }
      
      const token = await firebaseUser.getIdToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }

      const updatedData = await response.json();
      
      // Notify parent component
      if (onProfileUpdate) {
        onProfileUpdate(profileData);
      }

      toast.success('Profile updated successfully!');
    } catch (error: any) {
      console.error('Profile update error:', error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Profile Information
        </CardTitle>
        <CardDescription>
          Update your personal information and professional details
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={profileData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter your full name"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              value={profileData.displayName}
              onChange={(e) => handleInputChange('displayName', e.target.value)}
              placeholder="How you want to appear to others"
            />
            <p className="text-xs text-muted-foreground">
              This name will be shown on your professional profile and events
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            value={profileData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="Enter your email"
          />
        </div>

        {/* Bio */}
        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            value={profileData.bio}
            onChange={(e) => handleInputChange('bio', e.target.value)}
            placeholder="Tell us about yourself and your professional background..."
            rows={4}
          />
        </div>

        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="location" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Location
            </Label>
            <Input
              id="location"
              value={profileData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="City, State/Country"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Phone Number
            </Label>
            <Input
              id="phone"
              value={profileData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="+1 (555) 123-4567"
            />
          </div>
        </div>

        {/* Professional Information - Only show for creative professionals */}
        {user?.role === 'CREATIVE_PROFESSIONAL' && (
          <div className="space-y-6">
            {/* Categories */}
            <div className="space-y-2">
              <Label htmlFor="categories">Categories</Label>
              <Input
                id="categories"
                value={profileData.categories.join(', ')}
                onChange={(e) => handleInputChange('categories', e.target.value.split(', ').filter(c => c.trim()))}
                placeholder="Photography, Videography, Design"
              />
              <p className="text-xs text-muted-foreground">
                Separate multiple categories with commas
              </p>
            </div>

            {/* Skills */}
            <div className="space-y-2">
              <Label htmlFor="skills">Skills</Label>
              <Input
                id="skills"
                value={profileData.skills.join(', ')}
                onChange={(e) => handleInputChange('skills', e.target.value.split(', ').filter(s => s.trim()))}
                placeholder="Portrait Photography, Wedding Photography, Adobe Photoshop"
              />
              <p className="text-xs text-muted-foreground">
                Separate multiple skills with commas
              </p>
            </div>

            {/* Experience and Equipment */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="experience">Experience Level</Label>
                <Select
                  value={profileData.experience}
                  onValueChange={(value) => handleInputChange('experience', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Beginner">Beginner (0-2 years)</SelectItem>
                    <SelectItem value="Intermediate">Intermediate (2-5 years)</SelectItem>
                    <SelectItem value="Advanced">Advanced (5-10 years)</SelectItem>
                    <SelectItem value="Expert">Expert (10+ years)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="equipment">Equipment</Label>
                <Input
                  id="equipment"
                  value={profileData.equipment}
                  onChange={(e) => handleInputChange('equipment', e.target.value)}
                  placeholder="Camera gear, software, etc."
                />
              </div>
            </div>

            {/* Rates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
                <Input
                  id="hourlyRate"
                  type="number"
                  value={profileData.hourlyRate}
                  onChange={(e) => handleInputChange('hourlyRate', e.target.value)}
                  placeholder="50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dailyRate">Daily Rate ($)</Label>
                <Input
                  id="dailyRate"
                  type="number"
                  value={profileData.dailyRate}
                  onChange={(e) => handleInputChange('dailyRate', e.target.value)}
                  placeholder="400"
                />
              </div>
            </div>

            {/* Response Time and Travel */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="responseTime">Response Time (hours)</Label>
                <Select
                  value={profileData.responseTime}
                  onValueChange={(value) => handleInputChange('responseTime', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="How quickly do you respond?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Within 1 hour</SelectItem>
                    <SelectItem value="4">Within 4 hours</SelectItem>
                    <SelectItem value="12">Within 12 hours</SelectItem>
                    <SelectItem value="24">Within 24 hours</SelectItem>
                    <SelectItem value="48">Within 48 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="travelRadius">Travel Radius (miles)</Label>
                <Input
                  id="travelRadius"
                  type="number"
                  value={profileData.travelRadius}
                  onChange={(e) => handleInputChange('travelRadius', e.target.value)}
                  placeholder="25"
                />
              </div>
            </div>

            {/* Languages */}
            <div className="space-y-2">
              <Label htmlFor="languages">Languages</Label>
              <Input
                id="languages"
                value={profileData.languages.join(', ')}
                onChange={(e) => handleInputChange('languages', e.target.value.split(', ').filter(l => l.trim()))}
                placeholder="English, Spanish, French"
              />
              <p className="text-xs text-muted-foreground">
                Separate multiple languages with commas
              </p>
            </div>

            {/* Portfolio Links */}
            <div className="space-y-2">
              <Label htmlFor="portfolioLinks">Portfolio Links</Label>
              <Input
                id="portfolioLinks"
                value={profileData.portfolioLinks.join(', ')}
                onChange={(e) => handleInputChange('portfolioLinks', e.target.value.split(', ').filter(l => l.trim()))}
                placeholder="https://portfolio.com, https://instagram.com/username"
              />
              <p className="text-xs text-muted-foreground">
                Separate multiple links with commas
              </p>
            </div>

            {/* Certifications */}
            <div className="space-y-2">
              <Label htmlFor="certifications">Certifications</Label>
              <Input
                id="certifications"
                value={profileData.certifications.join(', ')}
                onChange={(e) => handleInputChange('certifications', e.target.value.split(', ').filter(c => c.trim()))}
                placeholder="Adobe Certified Expert, PPA Certified"
              />
              <p className="text-xs text-muted-foreground">
                Separate multiple certifications with commas
              </p>
            </div>

            {/* Awards */}
            <div className="space-y-2">
              <Label htmlFor="awards">Awards & Recognition</Label>
              <Input
                id="awards"
                value={profileData.awards.join(', ')}
                onChange={(e) => handleInputChange('awards', e.target.value.split(', ').filter(a => a.trim()))}
                placeholder="Best Wedding Photographer 2024, National Geographic Contest Winner"
              />
              <p className="text-xs text-muted-foreground">
                Separate multiple awards with commas
              </p>
            </div>

            {/* Availability */}
            <div className="space-y-2">
              <Label htmlFor="availability">Availability Status</Label>
              <Select
                value={profileData.availability}
                onValueChange={(value) => handleInputChange('availability', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select availability" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available for new projects</SelectItem>
                  <SelectItem value="unavailable">Busy / Not taking new projects</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="flex items-center gap-2"
          >
            {isSaving ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-foreground" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
