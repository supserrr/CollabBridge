"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth-firebase";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, Eye, Heart, Share2, Edit, Trash2 } from "lucide-react";

// Force dynamic rendering to prevent static generation errors
export const dynamic = 'force-dynamic';

interface PageProps {
  params: {
    username: string;
  };
}

export default function PortfolioPage({ params }: PageProps) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push('/signin');
      return;
    }

    if (user.username !== params.username) {
      router.push(`/${user.username}/dashboard/portfolio`);
      return;
    }
  }, [user, authLoading, params.username, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading portfolio...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const portfolioProjects = [
    {
      id: "1",
      title: "Sarah & Mike's Wedding",
      category: "Wedding Photography",
      images: 45,
      views: 1234,
      likes: 89,
      date: "2024-01-15",
      thumbnail: "/portfolio/wedding-1.jpg",
      status: "published"
    },
    {
      id: "2",
      title: "TechCorp Annual Conference",
      category: "Corporate Event",
      images: 120,
      views: 867,
      likes: 54,
      date: "2024-01-10",
      thumbnail: "/portfolio/corporate-1.jpg",
      status: "published"
    },
    {
      id: "3",
      title: "Rodriguez Family Portrait",
      category: "Family Photography",
      images: 25,
      views: 432,
      likes: 28,
      date: "2024-01-05",
      thumbnail: "/portfolio/family-1.jpg",
      status: "draft"
    },
    {
      id: "4",
      title: "Downtown Architecture",
      category: "Architecture",
      images: 60,
      views: 789,
      likes: 76,
      date: "2023-12-28",
      thumbnail: "/portfolio/architecture-1.jpg",
      status: "published"
    }
  ];

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:p-6">
            
            {/* Page Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Portfolio</h1>
                <p className="text-muted-foreground">
                  Showcase your best work and manage your projects
                </p>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50 border">
                <CardHeader className="pb-2">
                  <CardDescription>Total Projects</CardDescription>
                  <CardTitle className="text-2xl font-bold text-blue-900 dark:text-blue-100">24</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">+2 this month</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950/50 dark:to-emerald-900/50 border">
                <CardHeader className="pb-2">
                  <CardDescription>Total Views</CardDescription>
                  <CardTitle className="text-2xl font-bold text-green-900 dark:text-green-100">15.2K</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">+18% from last month</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/50 border">
                <CardHeader className="pb-2">
                  <CardDescription>Inquiries Generated</CardDescription>
                  <CardTitle className="text-2xl font-bold text-purple-900 dark:text-purple-100">89</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">From portfolio views</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-900/50 border">
                <CardHeader className="pb-2">
                  <CardDescription>Conversion Rate</CardDescription>
                  <CardTitle className="text-2xl font-bold text-orange-900 dark:text-orange-100">5.8%</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Views to inquiries</p>
                </CardContent>
              </Card>
            </div>

            {/* Portfolio Grid */}
            <Card>
              <CardHeader>
                <CardTitle>Your Projects</CardTitle>
                <CardDescription>Manage and showcase your photography portfolio</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {portfolioProjects.map((project) => (
                    <div key={project.id} className="group relative overflow-hidden rounded-lg border bg-card hover:shadow-lg transition-all duration-200">
                      <div className="aspect-video relative overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <div className="w-16 h-16 mx-auto mb-2 bg-primary/10 rounded-full flex items-center justify-center">
                              <Eye className="h-8 w-8 text-primary/60" />
                            </div>
                            <p className="text-sm text-muted-foreground">Project Preview</p>
                          </div>
                        </div>
                        
                        {/* Overlay Actions */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center space-x-2">
                          <Button size="sm" variant="secondary">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button size="sm" variant="secondary">
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        </div>
                      </div>
                      
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold truncate">{project.title}</h3>
                          <Badge variant={project.status === 'published' ? 'default' : 'secondary'}>
                            {project.status}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-3">{project.category}</p>
                        
                        <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                          <span>{project.images} images</span>
                          <span>{project.date}</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <div className="flex items-center space-x-1">
                              <Eye className="h-4 w-4" />
                              <span>{project.views}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Heart className="h-4 w-4" />
                              <span>{project.likes}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-1">
                            <Button size="sm" variant="ghost">
                              <Share2 className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Add New Project Card */}
                  <div className="group relative overflow-hidden rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-colors duration-200 cursor-pointer">
                    <div className="aspect-video flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-2 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                          <Plus className="h-8 w-8 text-primary/60 group-hover:text-primary" />
                        </div>
                        <p className="text-sm text-muted-foreground group-hover:text-primary transition-colors">Add New Project</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest portfolio interactions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                        <Eye className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Wedding project viewed</p>
                        <p className="text-xs text-muted-foreground">2 minutes ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                        <Heart className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">New like on corporate event</p>
                        <p className="text-xs text-muted-foreground">15 minutes ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
                        <Share2 className="h-4 w-4 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Portfolio shared on social media</p>
                        <p className="text-xs text-muted-foreground">1 hour ago</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Portfolio Insights</CardTitle>
                  <CardDescription>Optimize your portfolio performance</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Most Popular Category</p>
                    <p className="text-xs text-muted-foreground">Wedding photography generates 60% more views</p>
                  </div>
                  <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <p className="text-sm font-medium text-green-900 dark:text-green-100">Upload Recommendation</p>
                    <p className="text-xs text-muted-foreground">Add 3-5 more corporate event photos</p>
                  </div>
                  <div className="p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                    <p className="text-sm font-medium text-orange-900 dark:text-orange-100">Engagement Boost</p>
                    <p className="text-xs text-muted-foreground">Projects with descriptions get 40% more inquiries</p>
                  </div>
                </CardContent>
              </Card>
            </div>

          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
