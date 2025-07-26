"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatsWidget } from "@/components/ui/stats-widget";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  TrendingUp,
  TrendingDown,
  Users,
  Eye,
  Star,
  DollarSign,
  Calendar,
  Award,
  ArrowUp,
  ArrowDown,
  Filter,
  Download
} from "lucide-react";

interface AnalyticsData {
  overview: {
    totalRevenue: { value: number; change: number };
    totalProjects: { value: number; change: number };
    clientSatisfaction: { value: number; change: number };
    profileViews: { value: number; change: number };
  };
  topProjects: Array<{
    id: string;
    name: string;
    client: string;
    revenue: number;
    status: string;
    rating: number;
  }>;
  monthlyData: Array<{
    month: string;
    revenue: number;
    projects: number;
    clients: number;
  }>;
  performanceMetrics: {
    responseTime: { value: string; change: number };
    completionRate: { value: string; change: number };
    repeatClients: { value: string; change: number };
    avgProjectValue: { value: number; change: number };
  };
}

interface DashboardAnalyticsProps {
  data: AnalyticsData;
  userRole: "CREATIVE_PROFESSIONAL" | "EVENT_PLANNER";
  timeframe?: string;
  onTimeframeChange?: (timeframe: string) => void;
}

export function DashboardAnalytics({ 
  data, 
  userRole, 
  timeframe = "month",
  onTimeframeChange 
}: DashboardAnalyticsProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState(timeframe);

  const getChangeIcon = (change: number) => {
    if (change > 0) return <ArrowUp className="h-3 w-3 text-green-500" />;
    if (change < 0) return <ArrowDown className="h-3 w-3 text-red-500" />;
    return null;
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return "text-green-600 dark:text-green-400";
    if (change < 0) return "text-red-600 dark:text-red-400";
    return "text-muted-foreground";
  };

  const formatCurrency = (value: number) => `$${value.toLocaleString()}`;
  const formatChange = (change: number) => `${change > 0 ? '+' : ''}${change}%`;

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Track your performance and growth metrics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </motion.div>

      {/* Key Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsWidget
            title="Total Revenue"
            amount={data.overview.totalRevenue.value}
            change={data.overview.totalRevenue.change}
            currency="$"
          />
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {userRole === "CREATIVE_PROFESSIONAL" ? "Projects" : "Events"}
              </CardTitle>
              {userRole === "CREATIVE_PROFESSIONAL" ? (
                <Award className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Calendar className="h-4 w-4 text-muted-foreground" />
              )}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.overview.totalProjects.value}</div>
              <div className="flex items-center text-xs">
                {getChangeIcon(data.overview.totalProjects.change)}
                <span className={getChangeColor(data.overview.totalProjects.change)}>
                  {formatChange(data.overview.totalProjects.change)} from last {selectedTimeframe}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Profile Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.overview.profileViews.value}</div>
              <div className="flex items-center text-xs">
                {getChangeIcon(data.overview.profileViews.change)}
                <span className={getChangeColor(data.overview.profileViews.change)}>
                  {formatChange(data.overview.profileViews.change)} from last {selectedTimeframe}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Satisfaction</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.overview.clientSatisfaction.value}/5</div>
              <div className="flex items-center text-xs">
                {getChangeIcon(data.overview.clientSatisfaction.change)}
                <span className={getChangeColor(data.overview.clientSatisfaction.change)}>
                  {formatChange(data.overview.clientSatisfaction.change)} from last {selectedTimeframe}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Performance Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.performanceMetrics.responseTime.value}</div>
              <div className="flex items-center text-xs">
                {getChangeIcon(data.performanceMetrics.responseTime.change)}
                <span className={getChangeColor(data.performanceMetrics.responseTime.change)}>
                  {formatChange(data.performanceMetrics.responseTime.change)} faster
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.performanceMetrics.completionRate.value}</div>
              <div className="flex items-center text-xs">
                {getChangeIcon(data.performanceMetrics.completionRate.change)}
                <span className={getChangeColor(data.performanceMetrics.completionRate.change)}>
                  {formatChange(data.performanceMetrics.completionRate.change)} from last {selectedTimeframe}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Repeat Clients</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.performanceMetrics.repeatClients.value}</div>
              <div className="flex items-center text-xs">
                {getChangeIcon(data.performanceMetrics.repeatClients.change)}
                <span className={getChangeColor(data.performanceMetrics.repeatClients.change)}>
                  {formatChange(data.performanceMetrics.repeatClients.change)} from last {selectedTimeframe}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Avg Project Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(data.performanceMetrics.avgProjectValue.value)}</div>
              <div className="flex items-center text-xs">
                {getChangeIcon(data.performanceMetrics.avgProjectValue.change)}
                <span className={getChangeColor(data.performanceMetrics.avgProjectValue.change)}>
                  {formatChange(data.performanceMetrics.avgProjectValue.change)} from last {selectedTimeframe}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Top Projects/Events Table */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader>
              <CardTitle>
                Top {userRole === "CREATIVE_PROFESSIONAL" ? "Projects" : "Events"} This {selectedTimeframe}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Rating</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.topProjects.map((project) => (
                    <TableRow key={project.id}>
                      <TableCell className="font-medium">{project.name}</TableCell>
                      <TableCell>{project.client}</TableCell>
                      <TableCell>{formatCurrency(project.revenue)}</TableCell>
                      <TableCell>
                        <Badge variant={project.status === 'completed' ? 'default' : 'secondary'}>
                          {project.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                          {project.rating}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </motion.div>

        {/* Monthly Performance */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Monthly Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.monthlyData.slice(-6).map((month, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium">{month.month}</p>
                      <p className="text-sm text-muted-foreground">
                        {month.projects} {userRole === "CREATIVE_PROFESSIONAL" ? "projects" : "events"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{formatCurrency(month.revenue)}</p>
                      <p className="text-sm text-muted-foreground">{month.clients} clients</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

export default DashboardAnalytics;
