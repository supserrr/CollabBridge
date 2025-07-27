import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import { NotificationDropdown } from "@/components/ui/notification-dropdown"
import { ConnectionStatus } from "@/components/ui/connection-status"
import { IconSearch } from "@tabler/icons-react"
import { useAuth } from "@/hooks/use-auth-firebase"
import { usePathname } from "next/navigation"

export function SiteHeader() {
  const { user } = useAuth();
  const pathname = usePathname();
  
  // Get page title based on current route
  const getPageTitle = () => {
    if (pathname?.includes('/dashboard/professional')) return 'Professional Dashboard';
    if (pathname?.includes('/dashboard/browse-professionals')) return 'Browse Professionals';
    if (pathname?.includes('/dashboard/browse-events')) return 'Browse Events';
    if (pathname?.includes('/dashboard/portfolio')) return 'Portfolio';
    if (pathname?.includes('/dashboard/bookings')) return 'Bookings';
    if (pathname?.includes('/dashboard/messages')) return 'Messages';
    if (pathname?.includes('/dashboard/analytics')) return 'Analytics';
    if (pathname?.includes('/dashboard/applications')) return 'Applications';
    if (pathname?.includes('/dashboard/calendar')) return 'Calendar';
    if (pathname?.includes('/dashboard/events')) return 'Events';
    if (pathname?.includes('/dashboard/planner')) return 'Event Planner Dashboard';
    if (pathname?.includes('/dashboard/reviews')) return 'Reviews';
    if (pathname?.includes('/dashboard/settings')) return 'Settings';
    return 'Dashboard';
  };

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <div className="flex items-center gap-2">
          <h1 className="text-base font-semibold">{getPageTitle()}</h1>
          {user?.username && (
            <span className="text-sm text-muted-foreground">@{user.username}</span>
          )}
        </div>
      </div>
      
      <div className="ml-auto flex items-center gap-2 px-4">
        {/* Search */}
        <div className="relative hidden md:block">
          <IconSearch className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search projects, clients..."
            className="w-64 pl-8"
          />
        </div>
        
        {/* Theme Toggle */}
        <ThemeToggle />
        
        {/* Connection Status */}
        <ConnectionStatus />
        
        {/* Notifications */}
        <NotificationDropdown />
      </div>
    </header>
  )
}
