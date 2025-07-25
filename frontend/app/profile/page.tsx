"use client"

import Image from 'next/image'

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth-firebase";
import { portfolioApi, reviewsApi } from "@/lib/api";
import { 
  User, 
  Mail, 
  MapPin, 
  Calendar, 
  Star, 
  Camera,
  Edit,
  ExternalLink,
  Briefcase,
  Award,
  Loader2,
  AlertCircle
} from "lucide-react";

interface PortfolioProject {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  views: number;
  likes: number;
  tags: string[];
  category: string;
}

interface Review {
  id: string;
  client: string;
  rating: number;
  comment: string;
  event: string;
  date: string;
}

export default function UserProfile() {
  const { user, loading: authLoading } = useAuth();
  const [portfolio, setPortfolio] = useState<PortfolioProject[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading || !user?.username) return;

    const loadProfileData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load portfolio and reviews data
        const [portfolioData, reviewsData] = await Promise.all([
          portfolioApi.getPortfolio(user.username!).catch(() => ({ 
            user: { name: '', email: '', role: '' }, 
            projects: [], 
            reviews: [], 
            stats: { totalProjects: 0, totalViews: 0, averageRating: 0, totalReviews: 0 } 
          })),
          reviewsApi.getReviews(user.id).catch(() => [])
        ]);

        setPortfolio(portfolioData.projects || []);
        setReviews(reviewsData);
      } catch (err) {
        console.error('Error loading profile data:', err);
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    loadProfileData();
  }, [user, authLoading]);

  if (authLoading || loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
            <p className="mt-2 text-gray-600">Loading profile...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto" />
            <p className="mt-2 text-red-600">{error}</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="mt-4"
            >
              Retry
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600">Please sign in to view your profile.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 p-8 text-white"
        >
          <div className="relative z-10 flex items-center gap-6">
            <div className="h-24 w-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-24 w-24 rounded-full object-cover"
                />
              ) : (
                <User className="h-12 w-12 text-white" />
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold">{user.name}</h1>
              <p className="text-white/80 capitalize text-lg">
                {user.role.replace('_', ' ')}
              </p>
              <div className="mt-4 flex items-center gap-4 text-sm text-white/70">
                <span className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  {user.email}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  New York, NY
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Member since 2024
                </span>
              </div>
            </div>
            <Button variant="secondary" className="gap-2">
              <Edit className="h-4 w-4" />
              Edit Profile
            </Button>
          </div>
          
          {/* Background decoration */}
          <div className="absolute right-0 top-0 h-full w-1/3 opacity-10">
            <div className="h-full w-full bg-gradient-to-l from-white to-transparent" />
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid gap-4 md:grid-cols-4"
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-blue-100 dark:bg-blue-900 p-3">
                  <Briefcase className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">24</p>
                  <p className="text-sm text-muted-foreground">Projects</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-green-100 dark:bg-green-900 p-3">
                  <Star className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">4.9</p>
                  <p className="text-sm text-muted-foreground">Rating</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-purple-100 dark:bg-purple-900 p-3">
                  <Award className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">156</p>
                  <p className="text-sm text-muted-foreground">Reviews</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-amber-100 dark:bg-amber-900 p-3">
                  <Camera className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">2.4K</p>
                  <p className="text-sm text-muted-foreground">Views</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Portfolio */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Portfolio</CardTitle>
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </div>
                <CardDescription>
                  Showcase of recent creative work
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {portfolio.map((item) => (
                    <motion.div
                      key={item.id}
                      whileHover={{ scale: 1.02 }}
                      className="group relative overflow-hidden rounded-lg border"
                    >
                      <img
                        src={item.imageUrl || "https://images.unsplash.com/photo-1519741497674-611481863552?w=400"}
                        alt={item.title}
                        className="h-48 w-full object-cover transition-transform group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                        <h3 className="font-semibold">{item.title}</h3>
                        <div className="mt-2 flex items-center justify-between">
                          <Badge variant="secondary">{item.category}</Badge>
                          <div className="flex items-center gap-2 text-sm">
                            <span>{item.views} views</span>
                            <span>•</span>
                            <span>{item.likes} likes</span>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity text-white hover:text-gray-900"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Reviews & Bio */}
          <div className="space-y-6">
            {/* Bio */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>About</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Passionate creative professional with over 5 years of experience in 
                    photography and visual storytelling. Specializing in wedding, corporate, 
                    and fashion photography with a keen eye for detail and emotion.
                  </p>
                  <div className="mt-4 space-y-2">
                    <h4 className="font-semibold text-sm">Specialties</h4>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">Wedding Photography</Badge>
                      <Badge variant="outline">Portrait</Badge>
                      <Badge variant="outline">Event Coverage</Badge>
                      <Badge variant="outline">Fashion</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Recent Reviews */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Recent Reviews</CardTitle>
                  <CardDescription>Client feedback and testimonials</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm">{review.client}</h4>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs">{review.rating}</span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        "{review.comment}"
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {review.event} • {new Date(review.date).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
