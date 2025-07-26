"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { DashboardNavBar } from "./dashboard-navbar";
import { useAuth } from "@/hooks/use-auth-firebase";
import {
  Home,
  Calendar,
  Search,
  MessageSquare,
  Briefcase,
  Star,
  FileText,
  PlusCircle,
  Users,
  BarChart3
} from "lucide-react";

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  className?: string;
  children?: React.ReactNode;
  showNavigation?: boolean;
}

export function DashboardHeader({ 
  title, 
  subtitle, 
  className, 
  children,
  showNavigation = true 
}: DashboardHeaderProps) {
  const { user } = useAuth();

  // Create navigation items based on user role
  const getNavigationItems = () => {
    if (!user) return [];

    const commonItems = [
      {
        name: "Dashboard",
        url: `/${user.username}/dashboard/professional`,
        icon: Home
      },
      {
        name: "Messages",
        url: `/${user.username}/dashboard/messages`,
        icon: MessageSquare
      },
      {
        name: "Calendar",
        url: `/${user.username}/dashboard/calendar`,
        icon: Calendar
      },
      {
        name: "Analytics",
        url: `/${user.username}/dashboard/analytics`,
        icon: BarChart3
      }
    ];

    const roleSpecificItems = user.role === "CREATIVE_PROFESSIONAL" 
      ? [
          {
            name: "Portfolio",
            url: `/${user.username}/dashboard/portfolio`,
            icon: Briefcase
          },
          {
            name: "Browse Events",
            url: `/${user.username}/dashboard/browse-events`,
            icon: Search
          },
          {
            name: "Applications",
            url: `/${user.username}/dashboard/applications`,
            icon: FileText
          }
        ]
      : [
          {
            name: "Browse Professionals",
            url: `/${user.username}/dashboard/browse-professionals`,
            icon: Users
          },
          {
            name: "Create Event",
            url: `/${user.username}/dashboard/events/create`,
            icon: PlusCircle
          },
          {
            name: "Reviews",
            url: `/${user.username}/dashboard/reviews`,
            icon: Star
          }
        ];

    // Limit to most important navigation items for header
    return [...commonItems.slice(0, 4), ...roleSpecificItems.slice(0, 2)];
  };
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={cn(
        "sticky top-0 z-50 w-full bg-background/80 backdrop-blur-xl border-b border-border/50",
        className
      )}
    >
      {/* Enhanced Navigation Bar */}
      {showNavigation && user && (
        <div className="flex justify-center pt-6 pb-2 px-4">
          <DashboardNavBar items={getNavigationItems()} />
        </div>
      )}
      
      {/* Enhanced Header Content */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="relative mx-4 mb-6"
      >
        <div className="flex items-center gap-4 bg-gradient-to-r from-background/20 via-background/40 to-background/20 border border-border/30 backdrop-blur-2xl py-4 px-8 rounded-2xl shadow-xl shadow-primary/5">
          
          {/* Decorative gradient background */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 rounded-2xl" />
          
          <div className="relative flex-1">
            <div className="flex items-center gap-6">
              <div className="space-y-1">
                <motion.h1 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent"
                >
                  {title}
                </motion.h1>
                {subtitle && (
                  <motion.p 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="text-sm text-muted-foreground/80 font-medium"
                  >
                    {subtitle}
                  </motion.p>
                )}
              </div>
              
              {children && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="flex items-center gap-3"
                >
                  {children}
                </motion.div>
              )}
            </div>
          </div>
          
          {/* Enhanced Theme Toggle */}
          <motion.div 
            initial={{ opacity: 0, rotate: -90 }}
            animate={{ opacity: 1, rotate: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="relative"
          >
            <div className="p-2 rounded-full bg-background/50 border border-border/30 backdrop-blur-sm hover:bg-background/70 transition-all duration-300">
              <ThemeToggle />
            </div>
          </motion.div>
        </div>
        
        {/* Subtle bottom glow effect */}
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      </motion.div>
    </motion.header>
  );
}
