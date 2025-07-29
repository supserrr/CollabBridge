"use client";

import { useState, useEffect, useRef } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth-firebase";
import { auth } from "@/lib/firebase";
import { 
  User, 
  Camera, 
  Save, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Eye, 
  EyeOff, 
  Settings, 
  Globe,
  Shield,
  Bell,
  CreditCard,
  Tags,
  MapPin,
  Briefcase,
  Star,
  Clock,
  DollarSign,
  X
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface UserProfile {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  displayName: string;
  bio: string;
  avatar: string;
  location: string;
  website: string;
  phone: string;
  role: 'planner' | 'professional';
  isProfilePublic: boolean;
  showOnProfessionalsPage: boolean;
  professionalInfo?: {
    title: string;
    company: string;
    skills: string[];
    hourlyRate: number;
    availability: 'available' | 'busy' | 'unavailable';
    portfolioImages: string[];
    yearsExperience: number;
    category: string;
  };
  preferences: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    marketingEmails: boolean;
  };
}

interface UsernameCheck {
  available: boolean;
  error?: string;
}

export default function SettingsPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [usernameCheck, setUsernameCheck] = useState<UsernameCheck | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchUserProfile();
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user || !auth.currentUser) return;
    
    try {
      setLoading(true);
      const token = await auth.currentUser.getIdToken();
      
      const response = await fetch('/api/users/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data.user);
      } else {
        // Handle specific error responses
        if (response.status === 404) {
          // User profile doesn't exist yet, create a basic one
          const firebaseUser = auth.currentUser;
          const newProfile: UserProfile = {
            id: firebaseUser?.uid || '',
            email: firebaseUser?.email || '',
            username: firebaseUser?.displayName?.toLowerCase().replace(/\s+/g, '') || 'user',
            firstName: firebaseUser?.displayName?.split(' ')[0] || '',
            lastName: firebaseUser?.displayName?.split(' ').slice(1).join(' ') || '',
            displayName: firebaseUser?.displayName || '',
            bio: '',
            avatar: firebaseUser?.photoURL || '',
            location: '',
            website: '',
            phone: '',
            role: 'professional',
            isProfilePublic: true,
            showOnProfessionalsPage: true,
            professionalInfo: {
              title: '',
              company: '',
              skills: [],
              hourlyRate: 0,
              availability: 'available',
              portfolioImages: [],
              yearsExperience: 0,
              category: 'design'
            },
            preferences: {
              emailNotifications: true,
              smsNotifications: false,
              marketingEmails: false
            }
          };
          setProfile(newProfile);
          setMessage({ type: 'success', text: 'Creating new profile. Please fill in your information.' });
        } else {
          throw new Error(`Failed to fetch profile: ${response.status}`);
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setMessage({ type: 'error', text: 'Failed to load profile. Please check your connection and try again.' });
    } finally {
      setLoading(false);
    }
  };

  const checkUsernameAvailability = async (username: string) => {
    if (!username || username.length < 3) {
      setUsernameCheck({ available: false, error: 'Username must be at least 3 characters' });
      return;
    }

    if (profile && username === profile.username) {
      setUsernameCheck({ available: true });
      return;
    }

    setCheckingUsername(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      const response = await fetch('/api/users/check-username', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
      });

      if (response.ok) {
        const data = await response.json();
        setUsernameCheck({ available: data.available });
      } else {
        setUsernameCheck({ available: false, error: 'Unable to check username availability' });
      }
    } catch (error) {
      console.error('Username check error:', error);
      setUsernameCheck({ available: false, error: 'Network error. Please try again.' });
    } finally {
      setCheckingUsername(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Upload failed');
      }

      const uploadData = await uploadResponse.json();
      
      if (profile) {
        setProfile({ ...profile, avatar: uploadData.url });
      }
      
      setMessage({ type: 'success', text: 'Avatar uploaded successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to upload avatar' });
    } finally {
      setUploading(false);
    }
  };

  const addSkill = () => {
    if (!newSkill.trim() || !profile?.professionalInfo) return;
    
    const skills = profile.professionalInfo?.skills || [];
    if (skills.includes(newSkill.trim())) return;
    
    setProfile({
      ...profile,
      professionalInfo: {
        ...profile.professionalInfo,
        skills: [...skills, newSkill.trim()]
      }
    });
    setNewSkill('');
  };

  const removeSkill = (skillToRemove: string) => {
    if (!profile?.professionalInfo) return;
    
    setProfile({
      ...profile,
      professionalInfo: {
        ...profile.professionalInfo,
        skills: profile.professionalInfo?.skills?.filter(skill => skill !== skillToRemove) || []
      }
    });
  };

  const handleSave = async () => {
    if (!profile || !user || !auth.currentUser) return;

    setSaving(true);
    setMessage(null);
    
    try {
      const token = await auth.currentUser.getIdToken();
      
      // Filter out null values that cause validation issues
      const cleanProfile = Object.fromEntries(
        Object.entries(profile).filter(([_, value]) => value !== null)
      );
      
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cleanProfile),
      });

      if (response.ok) {
        const data = await response.json();
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        // Optionally update the local profile with server response
        if (data.user) {
          setProfile(data.user);
        }
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        setMessage({ 
          type: 'error', 
          text: errorData.error || `Failed to update profile (${response.status})` 
        });
      }
    } catch (error) {
      console.error('Save error:', error);
      setMessage({ 
        type: 'error', 
        text: 'Network error. Please check your connection and try again.' 
      });
    } finally {
      setSaving(false);
      // Clear success messages after 3 seconds
      if (message?.type === 'success') {
        setTimeout(() => setMessage(null), 3000);
      }
    }
  };

  if (loading) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold">Settings</h1>
                <p className="text-muted-foreground">
                  Manage your account settings and preferences
                </p>
              </div>
              <div className="grid gap-6">
                <Card>
                  <CardHeader>
                    <Skeleton className="h-6 w-32" />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Skeleton className="h-20 w-20 rounded-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  if (!profile) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold">Settings</h1>
                <p className="text-muted-foreground">
                  Failed to load profile data
                </p>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  if (!profile) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold">Settings</h1>
                <p className="text-muted-foreground">
                  Profile data not available
                </p>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold">Settings</h1>
              <p className="text-muted-foreground">
                Manage your account settings and preferences
              </p>
            </div>

            {message && (
              <Alert className={message.type === 'success' ? 'border-green-500' : 'border-red-500'}>
                <AlertDescription className={message.type === 'success' ? 'text-green-700' : 'text-red-700'}>
                  {message.text}
                </AlertDescription>
              </Alert>
            )}

            <div className="grid gap-6">
        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar */}
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profile?.avatar} />
                <AvatarFallback>
                  {profile?.firstName?.[0]}{profile?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <Button 
                  variant="outline" 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Camera className="h-4 w-4" />
                  )}
                  {uploading ? 'Uploading...' : 'Change Avatar'}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </div>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={profile?.firstName || ''}
                  onChange={(e) => profile && setProfile({ ...profile, firstName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={profile?.lastName || ''}
                  onChange={(e) => profile && setProfile({ ...profile, lastName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  value={profile?.displayName || ''}
                  onChange={(e) => profile && setProfile({ ...profile, displayName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <Input
                    id="username"
                    value={profile?.username || ''}
                    onChange={(e) => {
                      if (profile) {
                        setProfile({ ...profile, username: e.target.value });
                        checkUsernameAvailability(e.target.value);
                      }
                    }}
                  />
                  {checkingUsername && (
                    <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin" />
                  )}
                  {usernameCheck && !checkingUsername && (
                    <div className="absolute right-3 top-3">
                      {usernameCheck.available ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  )}
                </div>
                {usernameCheck && !usernameCheck.available && (
                  <p className="text-sm text-red-500">{usernameCheck.error}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={profile?.bio || ''}
                onChange={(e) => profile && setProfile({ ...profile, bio: e.target.value })}
                placeholder="Tell people about yourself..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={profile?.location || ''}
                  onChange={(e) => profile && setProfile({ ...profile, location: e.target.value })}
                  placeholder="City, Country"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={profile?.website || ''}
                  onChange={(e) => profile && setProfile({ ...profile, website: e.target.value })}
                  placeholder="https://yourwebsite.com"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Professional Information */}
        {profile.role === 'professional' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Professional Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Professional Title</Label>
                  <Input
                    id="title"
                    value={profile.professionalInfo?.title || ''}
                    onChange={(e) => setProfile({
                      ...profile,
                      professionalInfo: {
                        ...profile.professionalInfo!,
                        title: e.target.value
                      }
                    })}
                    placeholder="e.g., Senior UX Designer"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    value={profile.professionalInfo?.company || ''}
                    onChange={(e) => setProfile({
                      ...profile,
                      professionalInfo: {
                        ...profile.professionalInfo!,
                        company: e.target.value
                      }
                    })}
                    placeholder="e.g., Google"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={profile.professionalInfo?.category || ''}
                    onValueChange={(value) => setProfile({
                      ...profile,
                      professionalInfo: {
                        ...profile.professionalInfo!,
                        category: value
                      }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="design">Design</SelectItem>
                      <SelectItem value="development">Development</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="photography">Photography</SelectItem>
                      <SelectItem value="videography">Videography</SelectItem>
                      <SelectItem value="writing">Writing</SelectItem>
                      <SelectItem value="consulting">Consulting</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
                  <Input
                    id="hourlyRate"
                    type="number"
                    value={profile.professionalInfo?.hourlyRate || ''}
                    onChange={(e) => setProfile({
                      ...profile,
                      professionalInfo: {
                        ...profile.professionalInfo!,
                        hourlyRate: Number(e.target.value)
                      }
                    })}
                    placeholder="e.g., 120"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="yearsExperience">Years of Experience</Label>
                  <Input
                    id="yearsExperience"
                    type="number"
                    value={profile.professionalInfo?.yearsExperience || ''}
                    onChange={(e) => setProfile({
                      ...profile,
                      professionalInfo: {
                        ...profile.professionalInfo!,
                        yearsExperience: Number(e.target.value)
                      }
                    })}
                    placeholder="e.g., 5"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="availability">Availability</Label>
                  <Select
                    value={profile.professionalInfo?.availability || 'available'}
                    onValueChange={(value: 'available' | 'busy' | 'unavailable') => setProfile({
                      ...profile,
                      professionalInfo: {
                        ...profile.professionalInfo!,
                        availability: value
                      }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="busy">Busy</SelectItem>
                      <SelectItem value="unavailable">Unavailable</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Skills */}
              <div className="space-y-4">
                <Label>Skills</Label>
                <div className="flex flex-wrap gap-2">
                  {profile.professionalInfo?.skills?.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {skill}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => removeSkill(skill)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Add a skill..."
                    onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                  />
                  <Button onClick={addSkill} variant="outline">
                    Add
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Privacy Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Privacy Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Public Profile</Label>
                <p className="text-sm text-muted-foreground">
                  Allow others to view your public profile
                </p>
              </div>
              <Switch
                checked={profile.isProfilePublic}
                onCheckedChange={(checked) => setProfile({ ...profile, isProfilePublic: checked })}
              />
            </div>
            
            {profile.role === 'professional' && (
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Show on Professionals Page</Label>
                  <p className="text-sm text-muted-foreground">
                    Display your profile on the public professionals directory
                  </p>
                </div>
                <Switch
                  checked={profile.showOnProfessionalsPage}
                  onCheckedChange={(checked) => setProfile({ ...profile, showOnProfessionalsPage: checked })}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notification Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive email notifications for important updates
                </p>
              </div>
              <Switch
                checked={profile?.preferences?.emailNotifications ?? true}
                onCheckedChange={(checked) => profile && setProfile({
                  ...profile,
                  preferences: { ...profile.preferences, emailNotifications: checked }
                })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>SMS Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive SMS notifications for urgent messages
                </p>
              </div>
              <Switch
                checked={profile?.preferences?.smsNotifications ?? false}
                onCheckedChange={(checked) => profile && setProfile({
                  ...profile,
                  preferences: { ...profile.preferences, smsNotifications: checked }
                })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Marketing Emails</Label>
                <p className="text-sm text-muted-foreground">
                  Receive updates about new features and promotions
                </p>
              </div>
              <Switch
                checked={profile?.preferences?.marketingEmails ?? false}
                onCheckedChange={(checked) => profile && setProfile({
                  ...profile,
                  preferences: { ...profile.preferences, marketingEmails: checked }
                })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
