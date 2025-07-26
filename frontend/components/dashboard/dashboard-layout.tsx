/**
 * Dashboard Layout Component
 * 
 * A comprehensive layout wrapper for dashboard pages that provides:
 * - Authentication guard (redirects to signin if not authenticated)
 * - Sidebar navigation with responsive design
 * - Header with user information and controls
 * - Loading states during authentication checks
 * - Consistent layout structure across all dashboard pages
 * 
 * This component ensures that only authenticated users can access dashboard content
 * and provides a unified interface structure for the entire dashboard experience.
 * 
 * @component
 * @example
 * ```tsx
 * <DashboardLayout>
 *   <YourDashboardContent />
 * </DashboardLayout>
 * ```
 */

"use client";

import React, { ReactNode } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/use-auth-firebase";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Props interface for DashboardLayout component
 */
interface DashboardLayoutProps {
  children: ReactNode;  // Dashboard page content to be rendered
}

/**
 * Dashboard Layout Component Implementation
 * Handles authentication, layout structure, and loading states
 */
export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  /**
   * Authentication guard effect
   * Redirects unauthenticated users to sign-in page
   */
  useEffect(() => {
    if (!loading && !user) {
      router.push('/signin');
    }
  }, [user, loading, router]);

  /**
   * Loading state while authentication is being verified
   * Shows spinner until auth state is determined
   */
  if (loading) {
    return (
      <SidebarProvider
        style={
          {
            // CSS custom properties for consistent layout dimensions
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)"
          } as React.CSSProperties
        }
      >
        <AppSidebar />
        <SidebarInset>
          <SiteHeader />
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)"
        } as React.CSSProperties
      }
    >
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}