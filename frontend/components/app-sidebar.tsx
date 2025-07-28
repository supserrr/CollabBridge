"use client"

import * as React from "react"
import {
  IconBriefcase,
  IconCalendar,
  IconChartBar,
  IconCamera,
  IconDashboard,
  IconFileDescription,
  IconInnerShadowTop,
  IconMessage,
  IconSettings,
  IconUser,
  IconUsers,
  IconSearch,
  IconCalendarEvent,
  IconStar,
  IconUserPlus,
  IconLogout,
  IconPlus,
} from "@tabler/icons-react"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import { CollabBridgeLogo } from "@/components/ui/collabbridge-logo"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useAuth } from "@/hooks/use-auth-firebase"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, signOut } = useAuth();
  
  // Handle user logout
  const handleLogout = async () => {
    try {
      await signOut();
      // Redirect to home page after logout
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };
  
  // Role-based navigation items
  const getNavigationItems = () => {
    if (!user) return { navMain: [], navSecondary: [] };

    // Common navigation items for all users
    const commonItems = [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: IconDashboard,
      },
      {
        title: "Updates",
        url: user.role === 'EVENT_PLANNER' ? "/dashboard/planner/updates" : "/dashboard/professional/updates",
        icon: IconMessage,
      },
    ];

    // Role-specific navigation items
    let roleSpecificItems: Array<{
      title: string;
      url: string;
      icon: ((props: any) => JSX.Element);
    }> = [];
    
    if (user.role === 'CREATIVE_PROFESSIONAL') {
      roleSpecificItems = [
        {
          title: "Portfolio",
          url: "/dashboard/professional/portfolio",
          icon: IconBriefcase,
        },
        {
          title: "Browse Events",
          url: "/dashboard/professional/browse-events",
          icon: IconSearch,
        },
        {
          title: "Applications",
          url: "/dashboard/professional/applications",
          icon: IconFileDescription,
        },
        {
          title: "Reviews",
          url: "/dashboard/reviews",
          icon: IconStar,
        },
      ];
    } else if (user.role === 'EVENT_PLANNER') {
      roleSpecificItems = [
        {
          title: "Event Management",
          url: "/dashboard/planner/manage-events",
          icon: IconCalendarEvent,
        },
        {
          title: "Browse Professionals",
          url: "/dashboard/planner/browse-professionals",
          icon: IconUserPlus,
        },
        {
          title: "Reviews",
          url: "/dashboard/reviews",
          icon: IconStar,
        },
      ];
    }

    return {
      navMain: [...commonItems, ...roleSpecificItems],
      navSecondary: [
        {
          title: "Settings",
          url: "/dashboard/settings",
          icon: IconSettings,
        },
        {
          title: "Logout",
          url: "#",
          icon: IconLogout,
          onClick: handleLogout,
        },
      ],
    };
  };
  
  const navigationItems = getNavigationItems();
  
  const data = {
    user: {
      name: user?.name || "User",
      email: user?.email || "user@example.com",
      avatar: user?.avatar || "/avatars/default.jpg",
      username: user?.username || "",
    },
    ...navigationItems,
  }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="/" className="flex items-center">
                <CollabBridgeLogo variant="wordmark" size="md" />
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
