"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";

interface DashboardBannerProps {
  title: string;
  subtitle?: string;
  className?: string;
  children?: React.ReactNode;
}

export function DashboardBanner({ 
  title, 
  subtitle, 
  className, 
  children 
}: DashboardBannerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={cn(
        "relative w-full bg-gradient-to-r from-background/80 via-background/90 to-background/80 border-b border-border/30 backdrop-blur-sm",
        className
      )}
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/2 via-transparent to-primary/2" />
      
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-4 sm:py-6 gap-4">
          {/* Left side - Title and subtitle */}
          <div className="flex-1 min-w-0 w-full sm:w-auto">
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground truncate"
            >
              {title}
            </motion.h1>
            {subtitle && (
              <motion.p 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mt-1 text-xs sm:text-sm text-muted-foreground/80 line-clamp-2 sm:truncate"
              >
                {subtitle}
              </motion.p>
            )}
          </div>
          
          {/* Right side - Action buttons and theme toggle */}
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-between sm:justify-end">
            {/* Action buttons if provided */}
            {children && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="flex items-center gap-2 sm:gap-3 flex-wrap"
              >
                {children}
              </motion.div>
            )}
            
            {/* Theme toggle */}
            <motion.div 
              initial={{ opacity: 0, rotate: -90 }}
              animate={{ opacity: 1, rotate: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex-shrink-0"
            >
              <div className="p-1.5 sm:p-2 rounded-full bg-background/50 border border-border/30 backdrop-blur-sm hover:bg-background/70 transition-all duration-300 shadow-sm">
                <ThemeToggle />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      
      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />
    </motion.div>
  );
}
