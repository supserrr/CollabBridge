"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { DashboardBanner } from "@/components/dashboard/dashboard-banner";
import StackedIncidentChart from '@/components/ui/stacked-incident-chart-clean';
import EarningsReportChart from '@/components/ui/earnings-report-chart';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Edit, 
  Plus, 
  TrendingUp, 
  ArrowUp, 
  ArrowDown,
  User,
  MapPin,
  Eye,
  Star,
  Calendar as CalendarIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth-firebase";
import { creativeApi, plannerApi, portfolioApi } from "@/lib/api";
import { useRouter } from "next/navigation";

// Enhanced Stats Widget Component
const StatsWidget = ({ 
  title, 
  value, 
  change, 
  isPositive, 
  chartData 
}: { 
  title: string; 
  value: string; 
  change: number; 
  isPositive: boolean; 
  chartData: number[] 
}) => {
  const [animatedValue, setAnimatedValue] = useState(0);
  
  useEffect(() => {
    const numericValue = parseInt(value.replace(/[^0-9]/g, ''));
    let start = 0;
    const end = numericValue;
    const duration = 1000;
    const increment = end / (duration / 16);
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setAnimatedValue(end);
        clearInterval(timer);
      } else {
        setAnimatedValue(Math.floor(start));
      }
    }, 16);
    
    return () => clearInterval(timer);
  }, [value]);

  return (
    <Card className="relative overflow-hidden">
      <GlowingEffect 
        disabled={false}
        proximity={100}
        spread={30}
        movementDuration={1.5}
        borderWidth={2}
      />
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-center space-x-2">
              <p className="text-2xl font-bold">
                {value.includes('$') ? `$${animatedValue.toLocaleString()}` : `${animatedValue}%`}
              </p>
              <div className={cn(
                "flex items-center space-x-1 text-sm font-medium",
                isPositive ? "text-green-600" : "text-red-600"
              )}>
                {isPositive ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                <span>{Math.abs(change)}%</span>
              </div>
            </div>
          </div>
          
          {/* Mini Chart */}
          <div className="h-16 w-20">
            <svg viewBox="0 0 80 64" className="w-full h-full">
              <defs>
                <linearGradient id={`gradient-${title}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={isPositive ? "#22c55e" : "#ef4444"} stopOpacity={0.3}/>
                  <stop offset="100%" stopColor={isPositive ? "#22c55e" : "#ef4444"} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <path
                d={`M 0 ${64 - chartData[0]} ${chartData.map((point, i) => 
                  `L ${(i * 80) / (chartData.length - 1)} ${64 - point}`
                ).join(' ')}`}
                fill="none"
                stroke={isPositive ? "#22c55e" : "#ef4444"}
                strokeWidth="2"
                className="animate-pulse"
              />
              <path
                d={`M 0 ${64 - chartData[0]} ${chartData.map((point, i) => 
                  `L ${(i * 80) / (chartData.length - 1)} ${64 - point}`
                ).join(' ')} L 80 64 L 0 64 Z`}
                fill={`url(#gradient-${title})`}
              />
            </svg>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Helper function to get user-friendly application status text
const getApplicationStatusText = (status: string) => {
  switch (status?.toUpperCase()) {
    case 'PENDING':
      return 'Applied';
    case 'UNDER_REVIEW':
    case 'REVIEWING':
      return 'Under Review';
    case 'INTERVIEW':
    case 'INTERVIEWING':
      return 'Interview Scheduled';
    case 'ACCEPTED':
    case 'APPROVED':
      return 'Accepted';
    case 'HIRED':
      return 'Hired';
    case 'REJECTED':
    case 'DECLINED':
      return 'Not Selected';
    case 'CANCELLED':
    case 'CANCELED':
      return 'Cancelled';
    case 'COMPLETED':
      return 'Completed';
    case 'ACTIVE':
    case 'IN_PROGRESS':
      return 'Active';
    default:
      return status || 'Unknown';
  }
};

// Main Dashboard Content
export function DashboardContent({ 
  userRole,
  username
}: { 
  userRole: 'professional' | 'planner';
  username?: string;
}) {
  const { user } = useAuth();
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  
  // State for real data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [earningsData, setEarningsData] = useState<any[]>([]);
  const [earningsRange, setEarningsRange] = useState<'week' | 'month' | 'year'>('month');

  // Use provided username or fall back to user's username from auth
  const currentUsername = username || user?.username || '';

  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user || !currentUsername) return;
      
        try {
          setLoading(true);
          setError(null);
          
          if (userRole === 'professional') {
            const [stats, projects, myApplications] = await Promise.all([
              creativeApi.getDashboardStats(currentUsername).catch(() => null),
              creativeApi.getProjects(currentUsername).catch(() => []),
              creativeApi.getMyApplications().catch(() => []),
            ]);
            
            setDashboardStats(stats);
            setProjects(projects || []);
            setApplications(myApplications || []);
          } else {
            const [stats, pendingApplications] = await Promise.all([
              plannerApi.getDashboardStats(currentUsername).catch(() => null),
              plannerApi.getApplications('pending').catch(() => []),
            ]);
            
            setDashboardStats(stats);
            setApplications(pendingApplications || []);
          }
          
          // Generate mock earnings data based on timeframe (this would come from API in production)
          generateEarningsData(earningsRange);

        } catch (err) {
        console.error('Error loading dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user, currentUsername, userRole, earningsRange]);

  // Generate earnings data based on selected range
  const generateEarningsData = (range: 'week' | 'month' | 'year') => {
    const now = new Date();
    const periods = range === 'week' ? 7 : range === 'month' ? 30 : 365;
    
    const data = [
      {
        key: 'Total Earnings',
        data: Array.from({ length: periods }, (_, i) => {
          const date = new Date(now);
          date.setDate(now.getDate() - (periods - 1 - i));
          return {
            key: date,
            data: Math.floor(Math.random() * 2500) + 1500 // Single combined value
          };
        })
      }
    ];
    
    setEarningsData(data);
  };

  // Convert dashboard stats to widget format
  const getStatsWidgets = () => {
    if (!dashboardStats) return [];

    if (userRole === 'professional') {
      return [
        {
          title: "Total Views",
          value: dashboardStats.totalViews?.toString() || "0",
          change: 12,
          isPositive: true,
          chartData: [20, 30, 25, 40, 35, 50, 45]
        },
        {
          title: "Projects",
          value: dashboardStats.totalProjects?.toString() || "0",
          change: 8,
          isPositive: true,
          chartData: [15, 25, 20, 35, 30, 45, 40]
        }
      ];
    } else {
      return [
        {
          title: "Total Events",
          value: dashboardStats.totalEvents?.toString() || "0",
          change: 15,
          isPositive: true,
          chartData: [25, 35, 30, 45, 40, 55, 50]
        },
        {
          title: "Applications",
          value: dashboardStats.totalApplications?.toString() || "0",
          change: 10,
          isPositive: true,
          chartData: [30, 40, 35, 50, 45, 60, 55]
        }
      ];
    }
  };

  const statsWidgets = getStatsWidgets();

  if (loading) {
    return (
      <div className="space-y-4 md:space-y-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4 md:space-y-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <DashboardBanner 
        title={`Welcome back${user?.name ? `, ${user.name}` : ''}! 👋`}
        subtitle={`Your ${userRole === 'professional' ? 'creative professional' : 'event planner'} dashboard overview`}
      />
      
      <div className="space-y-4 md:space-y-6 p-6">
        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 md:gap-8">
          {/* Left Column - Analytics & Projects */}
          <div className="xl:col-span-8 space-y-6 md:space-y-8">
          {/* Analytics Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
            {statsWidgets.length > 0 ? (
              statsWidgets.map((stat, index) => (
                <StatsWidget key={index} {...stat} />
              ))
            ) : (
              <div className="col-span-2 text-center py-8">
                <p className="text-muted-foreground">No statistics available</p>
              </div>
            )}
          </div>

          {/* Earnings Chart with Range Selector */}
          <EarningsReportChart 
            data={earningsData}
            totalEarnings={2500}
            weekTotal={17500}
            growthRate={12.3}
            weekGrowth={15.7}
            range={earningsRange}
            onRangeChange={setEarningsRange}
          />

          {/* Active Projects Table */}
          <Card className="relative">
            <GlowingEffect 
              disabled={false}
              proximity={80}
              spread={35}
              movementDuration={1.8}
              borderWidth={1.5}
            />
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>
                  {userRole === 'professional' ? 'Active Projects' : 'My Events'}
                </CardTitle>
                <p className="text-sm text-muted-foreground">({projects.length})</p>
              </div>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                {userRole === 'professional' ? 'Add project' : 'Create event'}
              </Button>
            </CardHeader>
            <CardContent>
              {projects.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{userRole === 'professional' ? 'Client' : 'Event'}</TableHead>
                      <TableHead>{userRole === 'professional' ? 'Project' : 'Location'}</TableHead>
                      <TableHead>{userRole === 'professional' ? 'Price' : 'Budget'}</TableHead>
                      <TableHead>{userRole === 'professional' ? 'Status' : 'Applications'}</TableHead>
                      <TableHead>Progress</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projects.slice(0, 5).map((project: any) => (
                      <TableRow key={project.id}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={project.imageUrl || "/api/placeholder/32/32"} />
                              <AvatarFallback>
                                {userRole === 'professional' 
                                  ? (project.title?.split(' ').map((n: string) => n[0]).join('') || 'P')
                                  : (project.title?.split(' ').map((n: string) => n[0]).join('') || 'E')
                                }
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">
                                {userRole === 'professional' ? project.title : project.title}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {userRole === 'professional' ? 'View project' : 'View details'}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {userRole === 'professional' ? project.description : project.location}
                        </TableCell>
                        <TableCell className="font-medium">
                          {userRole === 'professional' 
                            ? `$${project.budget || 0}` 
                            : `$${project.budget || 0}`
                          }
                        </TableCell>
                        <TableCell>
                          {userRole === 'professional' 
                            ? project.status || 'Active'
                            : `${project.applications || 0} applications`
                          }
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div className="w-20 bg-muted rounded-full h-2">
                              <div 
                                className="bg-primary h-2 rounded-full transition-all duration-300"
                                style={{ width: `${Math.random() * 100}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium">
                              {Math.floor(Math.random() * 100)}%
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    {userRole === 'professional' ? 'No active projects' : 'No events created'}
                  </p>
                  <Button variant="outline" className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    {userRole === 'professional' ? 'Create your first project' : 'Create your first event'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Profile & Applications */}
        <div className="xl:col-span-4 space-y-6 md:space-y-8">
          {/* Enhanced Profile Card with Brand Colors */}
          <Card className="bg-gradient-to-br from-amber-400 to-amber-500 text-white border-0 shadow-lg relative">
            <GlowingEffect 
              disabled={false}
              proximity={120}
              spread={25}
              movementDuration={2}
              borderWidth={3}
              variant="white"
            />
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <Avatar className="h-20 w-20 border-4 border-white/30 shadow-lg">
                  <AvatarImage src={user?.avatar || "/api/placeholder/80/80"} />
                  <AvatarFallback className="bg-white/20 text-white font-bold text-xl">
                    {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">{user?.name || 'User'}</h3>
                  <div className="flex items-center justify-center gap-1 text-amber-100 text-sm mt-1">
                    <MapPin className="h-3 w-3" />
                    <span>{user?.location || 'Location not set'}</span>
                  </div>
                  <div className="flex items-center justify-center gap-4 mt-2 text-amber-100 text-xs">
                    <div className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      <span>{dashboardStats?.totalViews || 0} views</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3" />
                      <span>{dashboardStats?.rating || 0} rating</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 w-full">
                  <Button 
                    variant="secondary" 
                    className="w-full gap-2 bg-white/20 hover:bg-white/30 text-white border-white/30"
                    onClick={() => router.push(`/${currentUsername}/profile`)}
                  >
                    <User className="h-4 w-4" />
                    View Profile
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Applications Status */}
          <Card className="relative">
            <GlowingEffect 
              disabled={false}
              proximity={90}
              spread={28}
              movementDuration={2.2}
              borderWidth={1.5}
            />
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>
                  {userRole === 'professional' ? 'My Applications' : 'Pending Applications'}
                </span>
                <Badge variant="secondary" className="text-xs">
                  {applications.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-0">
              {applications.length > 0 ? (
                applications.slice(0, 5).map((app: any, index: number) => (
                  <div key={app.id}>
                    <div className="py-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <Badge 
                          variant="outline"
                          className="text-xs"
                        >
                          {userRole === 'professional' 
                            ? getApplicationStatusText(app.status)
                            : (app.status === 'PENDING' ? 'Needs Review' : app.status)
                          }
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <CalendarIcon className="h-3 w-3" />
                          <span>{new Date(app.appliedDate || app.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-medium text-sm">
                          {userRole === 'professional' ? (app.eventTitle || app.title || 'Event') : app.creativeName}
                        </h4>
                        {userRole === 'professional' ? (
                          // Professional view - show planner and event details
                          <>
                            {app.plannerName && (
                              <p className="text-xs text-muted-foreground">
                                By: {app.plannerName}
                              </p>
                            )}
                            {app.eventLocation && (
                              <p className="text-xs text-muted-foreground">
                                📍 {app.eventLocation}
                              </p>
                            )}
                            {app.eventDate && (
                              <p className="text-xs text-muted-foreground">
                                📅 {new Date(app.eventDate).toLocaleDateString()}
                              </p>
                            )}
                            {app.budget && (
                              <p className="text-xs text-muted-foreground">
                                💰 Budget: {app.budget}
                              </p>
                            )}
                            {app.roleType && (
                              <p className="text-xs text-muted-foreground">
                                Role: {app.roleType}
                              </p>
                            )}
                          </>
                        ) : (
                          // Planner view - show creative details
                          <>
                            {app.company && (
                              <p className="text-xs text-muted-foreground">{app.company}</p>
                            )}
                            {app.experience && (
                              <p className="text-xs text-muted-foreground">{app.experience}</p>
                            )}
                          </>
                        )}
                        {app.message && (
                          <p className="text-xs text-muted-foreground italic">"{app.message}"</p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          {app.type && (
                            <Badge variant="outline" className="text-xs">
                              {app.type}
                            </Badge>
                          )}
                          {userRole === 'planner' && app.status === 'PENDING' && (
                            <div className="flex gap-1">
                              <Button size="sm" variant="outline" className="h-6 text-xs px-2">
                                Review
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    {index < applications.length - 1 && (
                      <Separator className="my-0" />
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    {userRole === 'professional' ? 'No applications yet' : 'No pending applications'}
                  </p>
                  {userRole === 'professional' && (
                    <Button variant="outline" className="mt-4" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Browse Events
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
    </>
  );
}
