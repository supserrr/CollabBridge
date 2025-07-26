"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface NavItem {
  name: string
  url: string
  icon: LucideIcon
}

interface DashboardNavBarProps {
  items: NavItem[]
  className?: string
}

export function DashboardNavBar({ items, className }: DashboardNavBarProps) {
  const pathname = usePathname()
  const [activeTab, setActiveTab] = useState("")
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    // Find the active item based on current pathname
    const activeItem = items.find(item => pathname === item.url || pathname.startsWith(item.url))
    if (activeItem) {
      setActiveTab(activeItem.name)
    }
  }, [pathname, items])

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "flex justify-center w-full",
        className,
      )}
    >
      <div className="flex items-center gap-1 bg-background/10 border border-border/40 backdrop-blur-2xl py-2 px-2 rounded-2xl shadow-2xl shadow-primary/10">
        {items.map((item, index) => {
          const Icon = item.icon
          const isActive = activeTab === item.name

          return (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Link
                href={item.url}
                onClick={() => setActiveTab(item.name)}
                className={cn(
                  "relative cursor-pointer text-sm font-semibold px-5 py-3 rounded-xl transition-all duration-300",
                  "text-foreground/70 hover:text-primary hover:scale-105",
                  isActive && "text-primary font-bold shadow-lg",
                )}
              >
                <span className="hidden md:inline relative z-10">{item.name}</span>
                <span className="md:hidden relative z-10">
                  <Icon size={20} strokeWidth={2.5} />
                </span>
                {isActive && (
                  <motion.div
                    layoutId="dashboardLamp"
                    className="absolute inset-0 w-full bg-primary/10 rounded-xl border border-primary/20"
                    initial={false}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 30,
                    }}
                  >
                    {/* Enhanced lamp effect */}
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-10 h-0.5 bg-primary/60 rounded-full">
                      <div className="absolute w-16 h-3 bg-primary/20 rounded-full blur-sm -top-1 -left-3" />
                      <div className="absolute w-12 h-4 bg-primary/15 rounded-full blur-md -top-1.5 -left-1" />
                      <div className="absolute w-6 h-2 bg-primary/25 rounded-full blur-xs top-0 left-2" />
                    </div>
                    
                    {/* Subtle inner glow */}
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 rounded-xl" />
                  </motion.div>
                )}
              </Link>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
