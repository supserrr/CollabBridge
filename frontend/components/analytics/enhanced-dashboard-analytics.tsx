import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Calendar, 
  DollarSign, 
  FileText, 
  MessageSquare, 
  Star,
  Activity,
  Target,
  Clock,
  BarChart3,
  PieChart,
  LineChart,
  Download,
  Filter,
  RefreshCw,
  Eye,
  Heart,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import {
  LineChart as RechartsLineChart,
  BarChart as RechartsBarChart,
  PieChart as RechartsPieChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Line,
  Bar,
  Pie,
  Cell,
  Area,
  AreaChart,
  ComposedChart
} from 'recharts';

interface DashboardMetrics {
  overview: {
    totalRevenue: number;
    revenueChange: number;
    totalBookings: number;
    bookingsChange: number;
    totalClients: number;
    clientsChange: number;
    averageRating: number;
    ratingChange: number;
    activeProjects: number;
    projectsChange: number;
    completionRate: number;
    completionChange: number;
  };
  
  revenueData: Array<{
    month: string;
    revenue: number;
    bookings: number;
    target: number;
  }>;
  
  bookingTrends: Array<{
    date: string;
    bookings: number;
    revenue: number;
    cancellations: number;
  }>;
  
  clientAnalytics: {
    newClients: Array<{
      month: string;
      count: number;
    }>;
    clientRetention: number;
    averageLifetimeValue: number;
    topClients: Array<{
      id: string;
      name: string;
      totalSpent: number;
      bookingsCount: number;
      lastBooking: Date;
    }>;
  };
  
  servicePerformance: Array<{
    serviceName: string;
    bookings: number;
    revenue: number;
    rating: number;
    completionRate: number;
  }>;
  
  portfolioAnalytics: {
    totalViews: number;
    viewsChange: number;
    totalLikes: number;
    likesChange: number;
    totalShares: number;
    sharesChange: number;
    topPerformingItems: Array<{
      id: string;
      title: string;
      views: number;
      likes: number;
      shares: number;
    }>;
    categoryBreakdown: Array<{
      category: string;
      count: number;
      percentage: number;
    }>;
  };
  
  activityTimeline: Array<{
    id: string;
    type: 'booking' | 'review' | 'message' | 'portfolio' | 'payment';
    title: string;
    description: string;
    timestamp: Date;
    icon: string;
    color: string;
  }>;
  
  performanceGoals: Array<{
    id: string;
    title: string;
    current: number;
    target: number;
    unit: string;
    progress: number;
    deadline: Date;
    status: 'on_track' | 'behind' | 'ahead' | 'completed';
  }>;
}

interface AnalyticsFilters {
  timeRange: '7d' | '30d' | '90d' | '1y' | 'custom';
  startDate?: Date;
  endDate?: Date;
  services?: string[];
  clientTypes?: string[];
}

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#f97316'];

const TIME_RANGES = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: '1y', label: 'Last year' },
  { value: 'custom', label: 'Custom range' }
];

export default function EnhancedDashboardAnalytics() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [filters, setFilters] = useState<AnalyticsFilters>({
    timeRange: '30d'
  });

  useEffect(() => {
    loadDashboardMetrics();
  }, [filters]);

  const loadDashboardMetrics = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        timeRange: filters.timeRange,
        ...(filters.startDate && { startDate: filters.startDate.toISOString() }),
        ...(filters.endDate && { endDate: filters.endDate.toISOString() }),
        ...(filters.services?.length && { services: filters.services.join(',') }),
        ...(filters.clientTypes?.length && { clientTypes: filters.clientTypes.join(',') })
      });

      const response = await fetch(`/api/analytics/dashboard?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMetrics(data.data);
      }
    } catch (error) {
      console.error('Failed to load dashboard metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <ArrowUpRight className="h-4 w-4 text-green-500" />;
    if (change < 0) return <ArrowDownRight className="h-4 w-4 text-red-500" />;
    return null;
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const renderOverviewMetrics = () => {
    if (!metrics) return null;

    const { overview } = metrics;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(overview.totalRevenue)}</p>
                <div className="flex items-center space-x-1 mt-2">
                  {getChangeIcon(overview.revenueChange)}
                  <span className={`text-sm ${getChangeColor(overview.revenueChange)}`}>
                    {formatPercentage(overview.revenueChange)}
                  </span>
                </div>
              </div>
              <div className="p-3 bg-green-50 rounded-full">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Bookings</p>
                <p className="text-2xl font-bold">{overview.totalBookings}</p>
                <div className="flex items-center space-x-1 mt-2">
                  {getChangeIcon(overview.bookingsChange)}
                  <span className={`text-sm ${getChangeColor(overview.bookingsChange)}`}>
                    {formatPercentage(overview.bookingsChange)}
                  </span>
                </div>
              </div>
              <div className="p-3 bg-blue-50 rounded-full">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Clients</p>
                <p className="text-2xl font-bold">{overview.totalClients}</p>
                <div className="flex items-center space-x-1 mt-2">
                  {getChangeIcon(overview.clientsChange)}
                  <span className={`text-sm ${getChangeColor(overview.clientsChange)}`}>
                    {formatPercentage(overview.clientsChange)}
                  </span>
                </div>
              </div>
              <div className="p-3 bg-purple-50 rounded-full">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Average Rating</p>
                <p className="text-2xl font-bold">{overview.averageRating.toFixed(1)}</p>
                <div className="flex items-center space-x-1 mt-2">
                  {getChangeIcon(overview.ratingChange)}
                  <span className={`text-sm ${getChangeColor(overview.ratingChange)}`}>
                    {formatPercentage(overview.ratingChange)}
                  </span>
                </div>
              </div>
              <div className="p-3 bg-yellow-50 rounded-full">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Projects</p>
                <p className="text-2xl font-bold">{overview.activeProjects}</p>
                <div className="flex items-center space-x-1 mt-2">
                  {getChangeIcon(overview.projectsChange)}
                  <span className={`text-sm ${getChangeColor(overview.projectsChange)}`}>
                    {formatPercentage(overview.projectsChange)}
                  </span>
                </div>
              </div>
              <div className="p-3 bg-orange-50 rounded-full">
                <FileText className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completion Rate</p>
                <p className="text-2xl font-bold">{overview.completionRate.toFixed(1)}%</p>
                <div className="flex items-center space-x-1 mt-2">
                  {getChangeIcon(overview.completionChange)}
                  <span className={`text-sm ${getChangeColor(overview.completionChange)}`}>
                    {formatPercentage(overview.completionChange)}
                  </span>
                </div>
              </div>
              <div className="p-3 bg-red-50 rounded-full">
                <Target className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderRevenueChart = () => {
    if (!metrics?.revenueData) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <LineChart className="h-5 w-5" />
            <span>Revenue Trends</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={metrics.revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip formatter={(value, name) => [
                name === 'revenue' || name === 'target' ? formatCurrency(value as number) : value,
                name
              ]} />
              <Legend />
              <Bar yAxisId="right" dataKey="bookings" fill="#3b82f6" name="Bookings" />
              <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#10b981" name="Revenue" strokeWidth={3} />
              <Line yAxisId="left" type="monotone" dataKey="target" stroke="#ef4444" strokeDasharray="5 5" name="Target" />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    );
  };

  const renderServicePerformance = () => {
    if (!metrics?.servicePerformance) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Service Performance</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <RechartsBarChart data={metrics.servicePerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="serviceName" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="bookings" fill="#3b82f6" name="Bookings" />
              <Bar yAxisId="right" dataKey="revenue" fill="#10b981" name="Revenue" />
            </RechartsBarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    );
  };

  const renderPortfolioAnalytics = () => {
    if (!metrics?.portfolioAnalytics) return null;

    const { portfolioAnalytics } = metrics;

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Portfolio Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Eye className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">Total Views</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{portfolioAnalytics.totalViews.toLocaleString()}</div>
                  <div className={`text-xs ${getChangeColor(portfolioAnalytics.viewsChange)}`}>
                    {formatPercentage(portfolioAnalytics.viewsChange)}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Heart className="h-4 w-4 text-red-500" />
                  <span className="text-sm font-medium">Total Likes</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{portfolioAnalytics.totalLikes.toLocaleString()}</div>
                  <div className={`text-xs ${getChangeColor(portfolioAnalytics.likesChange)}`}>
                    {formatPercentage(portfolioAnalytics.likesChange)}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Activity className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">Total Shares</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{portfolioAnalytics.totalShares.toLocaleString()}</div>
                  <div className={`text-xs ${getChangeColor(portfolioAnalytics.sharesChange)}`}>
                    {formatPercentage(portfolioAnalytics.sharesChange)}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Category Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={portfolioAnalytics.categoryBreakdown}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  label={({ category, percentage }) => `${category} (${percentage}%)`}
                >
                  {portfolioAnalytics.categoryBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderPerformanceGoals = () => {
    if (!metrics?.performanceGoals) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>Performance Goals</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {metrics.performanceGoals.map(goal => (
              <div key={goal.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">{goal.title}</h4>
                  <Badge variant={
                    goal.status === 'completed' ? 'default' :
                    goal.status === 'on_track' ? 'secondary' :
                    goal.status === 'ahead' ? 'default' : 'destructive'
                  }>
                    {goal.status.replace('_', ' ')}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                  <span>{goal.current} / {goal.target} {goal.unit}</span>
                  <span>Due: {goal.deadline.toLocaleDateString()}</span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all ${
                      goal.status === 'completed' ? 'bg-green-500' :
                      goal.status === 'on_track' ? 'bg-blue-500' :
                      goal.status === 'ahead' ? 'bg-green-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(goal.progress, 100)}%` }}
                  />
                </div>
                
                <div className="text-right text-xs text-muted-foreground mt-1">
                  {goal.progress.toFixed(1)}% complete
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderActivityTimeline = () => {
    if (!metrics?.activityTimeline) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>Recent Activity</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {metrics.activityTimeline.slice(0, 10).map(activity => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className={`p-2 rounded-full ${activity.color}`}>
                  <Activity className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm">{activity.title}</h4>
                  <p className="text-xs text-muted-foreground">{activity.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {activity.timestamp.toLocaleDateString()} at {activity.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 mx-auto mb-4 animate-spin" />
              <p>Loading analytics data...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Enhanced Dashboard Analytics</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Select 
                value={filters.timeRange} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, timeRange: value as any }))}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIME_RANGES.map(range => (
                    <SelectItem key={range.value} value={range.value}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button variant="outline" size="sm" onClick={loadDashboardMetrics}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Overview Metrics */}
      {renderOverviewMetrics()}

      {/* Main Analytics */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {renderActivityTimeline()}
            {renderPerformanceGoals()}
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6 mt-6">
          {renderRevenueChart()}
        </TabsContent>

        <TabsContent value="services" className="space-y-6 mt-6">
          {renderServicePerformance()}
        </TabsContent>

        <TabsContent value="portfolio" className="space-y-6 mt-6">
          {renderPortfolioAnalytics()}
        </TabsContent>

        <TabsContent value="goals" className="space-y-6 mt-6">
          {renderPerformanceGoals()}
        </TabsContent>
      </Tabs>
    </div>
  );
}
