"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Calendar, 
  MapPin, 
  DollarSign,
  Eye,
  MessageSquare,
  Filter,
  Search,
  AlertCircle,
  TrendingUp,
  FileText,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { useAuth } from "@/hooks/use-auth-firebase";

// Force dynamic rendering to prevent static generation errors
export const dynamic = 'force-dynamic';

interface Application {
  id: string;
  eventId: string;
  eventTitle: string;
  eventType: string;
  clientName: string;
  clientAvatar: string;
  appliedDate: string;
  eventDate: string;
  location: string;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  proposedRate: number;
  message: string;
  requirements: string[];
  priority: 'high' | 'medium' | 'low';
}

export default function ApplicationsPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    fetchApplications();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [applications, searchQuery, statusFilter, sortBy]);

  const fetchApplications = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/applications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setApplications(data);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = applications;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(app => 
        app.eventTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.eventType.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(app => app.status === statusFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime();
        case "oldest":
          return new Date(a.appliedDate).getTime() - new Date(b.appliedDate).getTime();
        case "event-date":
          return new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime();
        case "rate":
          return b.proposedRate - a.proposedRate;
        default:
          return 0;
      }
    });

    setFilteredApplications(filtered);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'accepted':
        return <CheckCircle className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'secondary';
      case 'accepted':
        return 'default';
      case 'rejected':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const stats = {
    total: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    accepted: applications.filter(a => a.status === 'accepted').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Applications</h1>
          <p className="text-muted-foreground">Track your event applications and their status</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Awaiting response</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accepted</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.accepted}</div>
            <p className="text-xs text-muted-foreground">Success rate: {Math.round((stats.accepted / Math.max(stats.total, 1)) * 100)}%</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.rejected}</div>
            <p className="text-xs text-muted-foreground">Learn and improve</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search applications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="accepted">Accepted</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="event-date">Event Date</SelectItem>
            <SelectItem value="rate">Highest Rate</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        {filteredApplications.map((application) => (
          <motion.div
            key={application.id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group"
          >
            <Card className="hover:shadow-lg transition-all duration-200 group-hover:border-primary/50">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={application.clientAvatar} />
                      <AvatarFallback>
                        {application.clientName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                            {application.eventTitle}
                          </h3>
                          <p className="text-muted-foreground">
                            {application.clientName} • {application.eventType}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={getStatusColor(application.status) as any}
                            className="gap-1"
                          >
                            {getStatusIcon(application.status)}
                            {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                          </Badge>
                          {application.priority === 'high' && (
                            <Badge variant="destructive">High Priority</Badge>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>Event: {new Date(application.eventDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span>{application.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          <span>${application.proposedRate}/hr</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-2">
                          {application.requirements.slice(0, 3).map((req, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {req}
                            </Badge>
                          ))}
                          {application.requirements.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{application.requirements.length - 3} more
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" className="gap-1">
                            <Eye className="h-3 w-3" />
                            View Event
                          </Button>
                          <Button variant="outline" size="sm" className="gap-1">
                            <MessageSquare className="h-3 w-3" />
                            Message
                          </Button>
                        </div>
                      </div>

                      {application.message && (
                        <div className="bg-muted/50 p-3 rounded-lg">
                          <p className="text-sm italic">"{application.message}"</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {filteredApplications.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium mb-2">No applications found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || statusFilter !== "all" 
                ? "Try adjusting your search or filters" 
                : "Start applying to events to see them here"
              }
            </p>
            <Button variant="outline" onClick={() => {
              setSearchQuery("");
              setStatusFilter("all");
            }}>
              Clear Filters
            </Button>
          </div>
        )}
      </div>
      </div>
    </DashboardLayout>
  );
}
