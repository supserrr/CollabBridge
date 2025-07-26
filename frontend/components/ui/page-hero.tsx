"use client"

import { motion } from "framer-motion"
import { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface PageHeroProps {
  title: string
  subtitle?: string
  description?: string
  className?: string
  children?: ReactNode
  gradient?: "blue" | "green" | "purple" | "orange"
}

const gradientClasses = {
  blue: "from-blue-600 via-blue-500 to-purple-600",
  green: "from-green-600 via-emerald-500 to-blue-600", 
  purple: "from-purple-600 via-pink-500 to-orange-500",
  orange: "from-orange-500 via-red-500 to-pink-600"
}

export function PageHero({ 
  title, 
  subtitle, 
  description, 
  className,
  children,
  gradient = "blue"
}: PageHeroProps) {
  return (
    <section className={cn(
      "relative overflow-hidden bg-gradient-to-br from-background via-muted/20 to-background",
      "border-b border-border/50",
      className
    )}>
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-slide-to-right" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/3 to-transparent animate-slide-to-top" />
      </div>
      
      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--border)) 1px, transparent 0)`,
          backgroundSize: '24px 24px'
        }}
      />
      
      <div className="relative container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          {/* Subtitle badge */}
          {subtitle && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center rounded-full border border-border/50 bg-background/80 backdrop-blur-sm px-4 py-1.5 text-sm font-medium text-muted-foreground mb-6"
            >
              <span className={cn(
                "w-2 h-2 rounded-full mr-2 bg-gradient-to-r",
                gradientClasses[gradient]
              )} />
              {subtitle}
            </motion.div>
          )}
          
          {/* Main title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className={cn(
              "text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6",
              "bg-gradient-to-r bg-clip-text text-transparent",
              gradientClasses[gradient]
            )}
          >
            {title}
          </motion.h1>
          
          {/* Description */}
          {description && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8"
            >
              {description}
            </motion.p>
          )}
          
          {/* Additional content */}
          {children && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              {children}
            </motion.div>
          )}
        </div>
      </div>
      
      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent" />
    </section>
  )
}
