"use client"

import Image from 'next/image'
import { use } from "react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  MapPin, 
  Calendar, 
  Star, 
  Mail, 
  Phone, 
  Globe, 
  Instagram, 
  Facebook, 
  Twitter, 
  Linkedin,
  MessageSquare,
  Share2,
  Heart,
  Eye,
  Award,
  Clock,
  Camera,
  Edit,
  Settings,
  CheckCircle,
  DollarSign,
  User,
  Briefcase,
  Users,
  Home,
  UserCheck,
  ArrowLeft,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth-firebase";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { Particles } from "@/components/ui/particles";
import AnimatedGradientBackground from "@/components/ui/animated-gradient-background";
import { CollabBridgeFooter } from "@/components/sections/footer";
import { NavBar } from "@/components/navigation/nav-bar";
import { PageTransition } from "@/components/layout/page-transition";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

// Force dynamic rendering to prevent static generation errors
export const dynamic = 'force-dynamic';

interface PublicProfile {
  id: string;
  username: string;
  name: string;
  role: string;
  location: string | null;
  bio: string | null;
  avatar: string | null;
  isVerified: boolean;
  memberSince: string;
  profileUrl: string;
  creative_profiles: {
    categories: string[];
    portfolioImages: string[];
    portfolioLinks: string[];
    hourlyRate: number | null;
    dailyRate: number | null;
    experience: string | null;
    skills: string[];
    languages: string[];
    isAvailable: boolean;
    responseTime: string | null;
    travelRadius: number | null;
    certifications: string[];
    awards: string[];
    socialMedia: any | null;
  };
  reviews: {
    recent: any[];
  };
}

export default function PublicProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params);
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const { user, loading: authLoading } = useAuth();
  
  // Check if the current user owns this profile
  const isOwnProfile = user && user.username === username;

  const getNavItems = () => {
    const baseItems = [
      { name: "Home", url: "/", icon: Home },
      { name: "Events", url: "/events", icon: Calendar },
      { name: "Professionals", url: "/professionals", icon: Users },
    ]

    if (authLoading) {
      return [
        ...baseItems,
        { name: "Connect", url: "/signin", icon: UserCheck },
      ]
    }

    if (user) {
      return [
        ...baseItems,
        { name: "Connect", url: "/dashboard", icon: UserCheck },
      ]
    } else {
      return [
        ...baseItems,
        { name: "Connect", url: "/signin", icon: UserCheck },
      ]
    }
  }

  useEffect(() => {
    fetchPublicProfile();
  }, [username]);

  const fetchPublicProfile = async () => {
    try {
      const response = await fetch(`/api/profiles/${username}`);
      
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      } else if (response.status === 404) {
        console.error('Profile not found for username:', username);
      } else {
        console.error('Unexpected response status:', response.status);
      }
    } catch (error) {
      console.error('Error fetching public profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: `${profile?.name} - ${profile?.role}`,
        text: profile?.bio || `Check out ${profile?.name}'s profile`,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const handleSaveProfile = async () => {
    try {
      // Collect form data
      const formData = {
        name: (document.getElementById('edit-name') as HTMLInputElement)?.value,
        location: (document.getElementById('edit-location') as HTMLInputElement)?.value,
        bio: (document.getElementById('edit-bio') as HTMLTextAreaElement)?.value,
        hourlyRate: Number((document.getElementById('edit-hourly-rate') as HTMLInputElement)?.value) || null,
        responseTime: (document.getElementById('edit-response-time') as HTMLInputElement)?.value,
        experience: (document.getElementById('edit-experience') as HTMLInputElement)?.value,
        skills: (document.getElementById('edit-skills') as HTMLTextAreaElement)?.value
          .split(',')
          .map(skill => skill.trim())
          .filter(skill => skill.length > 0),
        languages: (document.getElementById('edit-languages') as HTMLInputElement)?.value
          .split(',')
          .map(lang => lang.trim())
          .filter(lang => lang.length > 0),
        isAvailable: (document.getElementById('edit-available') as HTMLInputElement)?.checked,
      };

      // Get the backend URL (same logic as in API proxy)
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 
                         process.env.BACKEND_URL || 
                         (process.env.NODE_ENV === 'production' 
                           ? 'https://collabbridge.onrender.com' 
                           : 'http://localhost:5001');

      const response = await fetch(`${backendUrl}/api/profiles/${username}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.id}`, // Use user ID for auth
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        // Refresh the profile data
        await fetchPublicProfile();
        setShowEditModal(false);
        
        // Show success message (you could add a toast notification here)
        alert('Profile updated successfully!');
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <NavBar items={getNavItems()} />
        
        <AuroraBackground className="relative min-h-screen">
          <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-center">
            {/* Profile Icon */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-8"
            >
              <div className="w-32 h-32 rounded-full backdrop-blur-sm border flex items-center justify-center" style={{ backgroundColor: '#d9770620', borderColor: '#d9770630' }}>
                <User className="w-16 h-16" style={{ color: '#d97706' }} />
              </div>
            </motion.div>

            {/* Main Title */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mb-6"
            >
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold mb-4" style={{ color: '#d97706' }}>
                Profile Not Found
              </h1>
            </motion.div>

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="mb-8"
            >
              <p className="text-lg sm:text-xl max-w-2xl font-medium" style={{ color: '#d97706' }}>
                The profile you're looking for doesn't exist or has been removed.
              </p>
            </motion.div>
          </div>
        </AuroraBackground>
        
        {/* Footer */}
        <CollabBridgeFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <NavBar items={getNavItems()} />
      
      <PageTransition>
        {/* Hero Section with Aurora Background */}
        <AuroraBackground className="relative h-auto min-h-[60vh]">
          <div className="container mx-auto px-4 py-20 relative z-10">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center"
              >
                {/* Profile Avatar */}
                <div className="relative inline-block mb-6">
                  <Avatar className="h-32 w-32 border-4 border-white shadow-2xl">
                    <AvatarImage src={profile.avatar || ''} />
                    <AvatarFallback className="text-3xl bg-primary/10 text-primary">
                      {profile.name?.split(' ').map(n => n[0]).join('') || 'U'}
                    </AvatarFallback>
                  </Avatar>
                {profile.creative_profiles?.isAvailable && (
                  <div className="absolute -bottom-2 -right-2 h-10 w-10 bg-green-500 border-4 border-white rounded-full flex items-center justify-center shadow-lg">
                    <CheckCircle className="h-5 w-5 text-white" />
                  </div>
                )}
              </div>

              {/* Name and Title */}
              <div className="space-y-2 mb-6">
                <div className="flex items-center justify-center gap-3">
                  <h1 className="text-4xl md:text-5xl font-bold text-foreground">
                    {profile.name || 'Unknown User'}
                  </h1>
                  {profile.isVerified && (
                    <Badge variant="default" className="bg-blue-500 hover:bg-blue-600">
                      <Award className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
                <p className="text-lg text-muted-foreground font-medium">
                  @{username}
                </p>
                <p className="text-xl text-muted-foreground">
                  {profile.role?.replace('_', ' ') || 'Professional'}
                </p>
              </div>

              {/* Quick Info */}
              <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground mb-8">
                {profile.location && (
                  <div className="flex items-center gap-1 bg-background/50 rounded-full px-3 py-1">
                    <MapPin className="h-4 w-4" />
                    {profile.location}
                  </div>
                )}
                {profile.creative_profiles?.experience && (
                  <div className="flex items-center gap-1 bg-background/50 rounded-full px-3 py-1">
                    <Briefcase className="h-4 w-4" />
                    {profile.creative_profiles.experience}
                  </div>
                )}
                <div className="flex items-center gap-1 bg-background/50 rounded-full px-3 py-1">
                  <User className="h-4 w-4" />
                  Member since {new Date(profile.memberSince).getFullYear()}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-3">
                {isOwnProfile ? (
                  // Show edit options for profile owner
                  <>
                    <Button
                      size="lg"
                      onClick={() => setShowEditModal(true)}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => window.location.href = '/dashboard'}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </Button>
                  </>
                ) : (
                  // Show interaction options for visitors
                  <>
                    {user && user.role === 'EVENT_PLANNER' && (
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={() => setIsLiked(!isLiked)}
                      >
                        <Heart className={cn("h-4 w-4 mr-2", isLiked && "fill-current text-red-500")} />
                        {isLiked ? "Saved" : "Save"}
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={handleShare}
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                    {user && user.role === 'EVENT_PLANNER' && (
                      <Button
                        size="lg"
                        onClick={() => setShowContactModal(true)}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground"
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Contact
                      </Button>
                    )}
                    {!user && (
                      <Button
                        size="lg"
                        onClick={() => window.location.href = '/signin'}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground"
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Sign in to Contact
                      </Button>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </AuroraBackground>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* About Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <Card className="shadow-lg border-0 bg-card relative overflow-hidden">
                  <GlowingEffect proximity={300} spread={60} disabled={false} />
                  {/* Particles Background */}
                  <div className="absolute inset-0 z-0">
                    <Particles
                      className="w-full h-full"
                      quantity={30}
                      staticity={40}
                      ease={50}
                    />
                  </div>
                  <CardHeader className="pb-4 relative z-10 bg-background dark:bg-background">
                      <CardTitle className="flex items-center gap-2 text-xl">
                        <User className="h-5 w-5 text-primary" />
                        About
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 relative z-10 bg-background dark:bg-background">
                      <p className="text-muted-foreground leading-relaxed">
                        {profile.bio || 'This professional hasn\'t added a bio yet.'}
                      </p>
                      
                      {/* Skills */}
                      {profile.creative_profiles?.skills && profile.creative_profiles.skills.length > 0 && (
                        <div className="space-y-3">
                          <Separator />
                          <div>
                            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
                              Skills & Specializations
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {profile.creative_profiles.skills.map((skill, index) => (
                                <Badge 
                                  key={`skill-${index}`} 
                                  variant="secondary" 
                                  className="px-3 py-1 text-sm"
                                >
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Languages */}
                      {profile.creative_profiles?.languages && profile.creative_profiles.languages.length > 0 && (
                        <div className="space-y-3">
                          <Separator />
                          <div>
                            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
                              Languages
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {profile.creative_profiles.languages.map((language, index) => (
                                <Badge 
                                  key={`language-${index}`} 
                                  variant="outline" 
                                  className="px-3 py-1 text-sm"
                                >
                                  {language}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
              </motion.div>

              {/* Portfolio Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Card className="shadow-lg border-0 bg-card relative">
                  <GlowingEffect proximity={280} spread={55} disabled={false} />
                  <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-2 text-xl">
                        <Briefcase className="h-5 w-5 text-primary" />
                        Portfolio
                      </CardTitle>
                    </CardHeader>
                  <CardContent>
                    {profile.creative_profiles?.portfolioImages && profile.creative_profiles.portfolioImages.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {profile.creative_profiles.portfolioImages.map((image, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                            className="group relative aspect-video bg-muted rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300"
                          >
                            <img
                              src={image}
                              alt={`Portfolio item ${index + 1}`}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-16">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-muted rounded-full mb-4">
                          <Camera className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-medium mb-2">No portfolio items</h3>
                        <p className="text-muted-foreground">This professional hasn't showcased any work yet.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Reviews Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <Card className="shadow-lg border-0 bg-card relative">
                  <GlowingEffect proximity={260} spread={50} disabled={false} />
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Star className="h-5 w-5 text-primary" />
                      Reviews
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {profile.reviews?.recent && profile.reviews.recent.length > 0 ? (
                      <div className="space-y-6">
                        {profile.reviews.recent.map((review: any, index: number) => (
                          <div key={index} className="space-y-3">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={cn(
                                      "h-4 w-4",
                                      i < (review.rating || 5)
                                        ? "fill-yellow-400 text-yellow-400"
                                        : "text-muted-foreground"
                                    )}
                                  />
                                ))}
                              </div>
                              <span className="font-medium text-sm">{review.clientName || 'Anonymous'}</span>
                            </div>
                            <p className="text-muted-foreground leading-relaxed">
                              {review.comment || 'Great work!'}
                            </p>
                            {index < profile.reviews.recent.length - 1 && <Separator />}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-16">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-muted rounded-full mb-4">
                          <Star className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-medium mb-2">No reviews yet</h3>
                        <p className="text-muted-foreground">Be the first to work with {profile.name} and leave a review!</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              {/* Contact Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <Card className="shadow-lg border-0 bg-card relative">
                  <GlowingEffect proximity={240} spread={45} disabled={false} />
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <MessageSquare className="h-5 w-5 text-primary" />
                      {isOwnProfile ? 'Profile Status' : 'Get in Touch'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Availability Status */}
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <span className="text-sm font-medium">Availability</span>
                      <Badge 
                        variant={profile.creative_profiles?.isAvailable ? 'default' : 'secondary'}
                        className={profile.creative_profiles?.isAvailable ? 'bg-green-500 hover:bg-green-600' : ''}
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        {profile.creative_profiles?.isAvailable ? 'Available' : 'Busy'}
                      </Badge>
                    </div>

                    {/* Response Time */}
                    {profile.creative_profiles?.responseTime && (
                      <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                        <Clock className="h-4 w-4 text-primary" />
                        <span className="text-sm">Responds in {profile.creative_profiles.responseTime}</span>
                      </div>
                    )}

                    {/* Hourly Rate */}
                    {profile.creative_profiles?.hourlyRate && (
                      <div className="text-center p-4 bg-primary/5 rounded-lg border border-primary/20">
                        <div className="flex items-center justify-center gap-1 text-2xl font-bold text-primary">
                          <DollarSign className="h-5 w-5" />
                          {profile.creative_profiles.hourlyRate}
                        </div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wide">per hour</div>
                      </div>
                    )}

                    {!isOwnProfile && (
                      <>
                        {user ? (
                          <Button 
                            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" 
                            size="lg"
                            onClick={() => setShowContactModal(true)}
                          >
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Send Message
                          </Button>
                        ) : (
                          <Button 
                            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" 
                            size="lg"
                            onClick={() => window.location.href = '/signin'}
                          >
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Sign in to Message
                          </Button>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Professional Info Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <Card className="shadow-lg border-0 bg-card relative">
                  <GlowingEffect proximity={260} spread={50} disabled={false} />
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Award className="h-5 w-5 text-primary" />
                      Professional Info
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Member Since */}
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <div className="text-lg font-semibold mb-1">Member Since</div>
                      <div className="text-2xl font-bold text-primary">
                        {new Date(profile.memberSince).getFullYear()}
                      </div>
                    </div>
                    
                    {/* Categories */}
                    {profile.creative_profiles?.categories && profile.creative_profiles.categories.length > 0 && (
                      <div className="space-y-3">
                        <Separator />
                        <div>
                          <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                            Categories
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {profile.creative_profiles.categories.map((category, index) => (
                              <Badge 
                                key={index} 
                                variant="outline" 
                                className="text-xs px-2 py-1"
                              >
                                {category}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Experience Level */}
                    {profile.creative_profiles?.experience && (
                      <div className="space-y-3">
                        <Separator />
                        <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                          <Briefcase className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium">{profile.creative_profiles.experience} experience</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Modal */}
      <Dialog open={showContactModal} onOpenChange={setShowContactModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Contact {profile.name}</DialogTitle>
            <DialogDescription>
              Send a message to start the conversation.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input id="subject" placeholder="Project inquiry..." />
            </div>
            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea id="message" placeholder="Tell me about your project..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowContactModal(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowContactModal(false)}>
              Send Message
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Profile Modal */}
      {isOwnProfile && (
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Profile</DialogTitle>
              <DialogDescription>
                Update your profile information and professional details.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-name">Full Name</Label>
                    <Input 
                      id="edit-name" 
                      defaultValue={profile?.name || ''} 
                      placeholder="Your full name" 
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-location">Location</Label>
                    <Input 
                      id="edit-location" 
                      defaultValue={profile?.location || ''} 
                      placeholder="City, Country" 
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="edit-bio">Bio</Label>
                  <Textarea 
                    id="edit-bio" 
                    defaultValue={profile?.bio || ''} 
                    placeholder="Tell people about yourself and your work..." 
                    rows={4}
                  />
                </div>
              </div>

              {/* Professional Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Professional Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-hourly-rate">Hourly Rate ($)</Label>
                    <Input 
                      id="edit-hourly-rate" 
                      type="number"
                      defaultValue={profile?.creative_profiles?.hourlyRate || ''} 
                      placeholder="75" 
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-response-time">Response Time</Label>
                    <Input 
                      id="edit-response-time" 
                      defaultValue={profile?.creative_profiles?.responseTime || ''} 
                      placeholder="24 hours" 
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="edit-experience">Experience</Label>
                  <Input 
                    id="edit-experience" 
                    defaultValue={profile?.creative_profiles?.experience || ''} 
                    placeholder="5+ years" 
                  />
                </div>
              </div>

              {/* Skills and Languages */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Skills & Languages</h3>
                <div>
                  <Label htmlFor="edit-skills">Skills (comma-separated)</Label>
                  <Textarea 
                    id="edit-skills" 
                    defaultValue={profile?.creative_profiles?.skills?.join(', ') || ''} 
                    placeholder="React, Node.js, TypeScript, Python" 
                    rows={2}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-languages">Languages (comma-separated)</Label>
                  <Input 
                    id="edit-languages" 
                    defaultValue={profile?.creative_profiles?.languages?.join(', ') || ''} 
                    placeholder="English, Spanish, French" 
                  />
                </div>
              </div>

              {/* Availability */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Availability</h3>
                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    id="edit-available"
                    defaultChecked={profile?.creative_profiles?.isAvailable || false}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="edit-available">Currently available for new projects</Label>
                </div>
              </div>
            </div>
            <DialogFooter className="gap-3">
              <Button variant="outline" onClick={() => setShowEditModal(false)}>
                Cancel
              </Button>
              <Button onClick={() => handleSaveProfile()}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      </PageTransition>
      
      {/* Footer */}
      <CollabBridgeFooter />
    </div>
  );
}
