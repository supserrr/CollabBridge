/**
 * Navigation Bar Component
 * 
 * A responsive navigation bar with animated tab indicators and theme toggle.
 * Features smooth motion animations, mobile optimization, and active state tracking.
 * Uses Framer Motion for tab indicator animations and supports dynamic navigation items.
 * 
 * @component
 * @example
 * ```tsx
 * const navItems = [
 *   { name: "Home", url: "/", icon: Home },
 *   { name: "About", url: "/about", icon: Info }
 * ];
 * <NavBar items={navItems} />
 * ```
 */

"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/theme-toggle"

/**
 * Navigation item interface
 * Defines the structure for navigation menu items
 */
interface NavItem {
  name: string        // Display name for the navigation item
  url: string         // URL/route for the navigation item
  icon: LucideIcon    // Lucide icon component for the item
}

/**
 * NavBar component props interface
 */
interface NavBarProps {
  items: NavItem[]    // Array of navigation items to display
  className?: string  // Optional additional CSS classes
}

/**
 * NavBar component implementation
 * Renders a responsive navigation bar with animated active indicators
 */
export function NavBar({ items, className }: NavBarProps) {
  const pathname = usePathname()
  const [activeTab, setActiveTab] = useState("")
  const [isMobile, setIsMobile] = useState(false)

  /**
   * Update active tab based on current pathname
   * Automatically highlights the current page in navigation
   */
  useEffect(() => {
    const currentItem = items.find(item => item.url === pathname)
    if (currentItem) {
      setActiveTab(currentItem.name)
    } else {
      // Default to first item if no exact match found
      setActiveTab(items[0]?.name || "")
    }
  }, [pathname, items])

  /**
   * Handle responsive design by tracking window size
   * Switches between mobile and desktop layouts
   */
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <div
      className={cn(
        "fixed top-0 left-1/2 -translate-x-1/2 z-50 pt-4 sm:pt-6 px-4 sm:px-0",
        className,
      )}
    >
      <div className="flex items-center gap-1 bg-background/10 border border-border/50 backdrop-blur-xl py-1 px-1 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 min-w-fit">
        {items.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.name

          return (
            <Link
              key={item.name}
              href={item.url}
              prefetch={true}
              className={cn(
                "relative cursor-pointer text-sm font-semibold px-4 sm:px-6 py-2 rounded-full transition-all duration-300 ease-in-out",
                "text-foreground/80 hover:text-primary hover:scale-105 hover:bg-background/20",
                "focus:outline-none focus:ring-2 focus:ring-primary/20",
                "group",
                isActive && "text-primary scale-105",
              )}
            >
              <span className="relative z-10 flex items-center gap-2">
                <span className="hidden md:inline transition-transform group-hover:scale-110">
                  {item.name}
                </span>
                <span className="md:hidden transition-transform group-hover:scale-110">
                  <Icon size={18} strokeWidth={2.5} />
                </span>
              </span>
              {isActive && (
                <motion.div
                  layoutId="lamp"
                  className="absolute inset-0 w-full bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-full -z-10 border border-primary/20"
                  initial={false}
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 30,
                    duration: 0.3
                  }}
                >
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-primary to-purple-500 rounded-t-full">
                    <div className="absolute w-12 h-6 bg-primary/20 rounded-full blur-md -top-2 -left-2" />
                    <div className="absolute w-8 h-6 bg-primary/20 rounded-full blur-md -top-1" />
                    <div className="absolute w-4 h-4 bg-primary/20 rounded-full blur-sm top-0 left-2" />
                  </div>
                </motion.div>
              )}
            </Link>
          )
        })}
        
        <div className="ml-2 border-l border-border/50 pl-2">
          <ThemeToggle />
        </div>
      </div>
    </div>
  )
}
