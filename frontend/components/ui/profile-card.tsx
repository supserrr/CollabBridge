"use client"

/**
 * ProfileCard Component
 * 
 * A beautiful, interactive card component for displaying professional profiles
 * with full-cover portfolio images, animations, and interactive elements.
 * 
 * Features:
 * - Full-cover portfolio image background
 * - Letter-by-letter name animation using Framer Motion
 * - Interactive hover effects and state management
 * - Skill tags, ratings, and verification badges
 * - Responsive design for all screen sizes
 * - Accessibility support with reduced motion preference
 */

import { motion, useReducedMotion } from "framer-motion"
import { Check, Users, UserCheck, Star, MapPin, Award, Briefcase } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

/**
 * Professional data structure interface
 * Defines the shape of professional profile data
 */
interface Professional {
  id: number
  name: string
  title: string
  company: string
  location: string
  rating: number
  reviews: number
  hourlyRate: string
  skills: string[]
  avatar: string
  verified: boolean
  responseTime: string
  completedProjects: number
  description: string
  availability: string
  portfolioImages?: string[]
}

/**
 * ProfileCard component props interface
 * Defines all configurable options for the ProfileCard component
 */
interface ProfileCardProps {
  professional: Professional              // Professional data to display
  enableAnimations?: boolean               // Toggle animations on/off
  className?: string                       // Additional CSS classes
  onContact?: (id: number) => void        // Contact button click handler
  onViewProfile?: (id: number) => void    // View profile click handler
  onSaveProfile?: (id: number) => void    // Save profile toggle handler
  isSaved?: boolean                       // Whether profile is currently saved
}

/**
 * ProfileCard Component
 * 
 * Renders a beautiful, interactive card for professional profiles with
 * portfolio images, animations, and comprehensive professional information.
 * 
 * @param professional - The professional data to display
 * @param enableAnimations - Whether to enable Framer Motion animations
 * @param className - Additional CSS classes for styling
 * @param onContact - Callback when contact button is clicked
 * @param onViewProfile - Callback when view profile is clicked
 * @param onSaveProfile - Callback when save profile is toggled
 * @param isSaved - Whether the profile is currently saved
 */
export function ProfileCard({
  professional,
  enableAnimations = true,
  className,
  onContact = () => {},
  onViewProfile = () => {},
  onSaveProfile = () => {},
  isSaved = false,
}: ProfileCardProps) {
  // Component state management
  const [hovered, setHovered] = useState(false)
  
  // Accessibility: Check user's motion preferences
  const shouldReduceMotion = useReducedMotion()
  const shouldAnimate = enableAnimations && !shouldReduceMotion

  // Determine the best image to use for the card background
  // Priority: portfolio images > avatar > placeholder
  const coverImage = professional.portfolioImages?.[0] || professional.avatar || "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&h=800&fit=crop&auto=format&q=80"

  /**
   * Animation variants for the main card container
   * Defines different states for hover interactions and transitions
   */
  const containerVariants = {
    rest: { 
      scale: 1,
      y: 0,
      filter: "blur(0px)",
    },
    hover: shouldAnimate ? { 
      scale: 1.02,           // Subtle scale increase on hover
      y: -4,                 // Lift effect
      filter: "blur(0px)",
      transition: { 
        type: "spring", 
        stiffness: 400, 
        damping: 28,
        mass: 0.6,
      }
    } : {},
  }

  /**
   * Animation variants for the background image
   * Creates a subtle zoom effect on hover
   */
  const imageVariants = {
    rest: { scale: 1 },
    hover: { scale: 1.05 },  // Slight zoom on hover
  }

  /**
   * Animation variants for the card content
   * Controls the entrance animation and staggered child animations
   */
  const contentVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      filter: "blur(4px)",
    },
    visible: { 
      opacity: 1, 
      y: 0,
      filter: "blur(0px)",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 28,
        mass: 0.6,
        staggerChildren: 0.08,    // Delay between child animations
        delayChildren: 0.1,       // Initial delay before children animate
      },
    },
  }

  /**
   * Animation variants for individual content items
   * Used for staggered animations of child elements
   */
  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 15,
      scale: 0.95,
      filter: "blur(2px)",
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      filter: "blur(0px)",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25,
        mass: 0.5,
      },
    },
  }

  /**
   * Animation variants for individual letters (used for name animation)
   * Creates a staggered letter-by-letter entrance effect
   */
  const letterVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.8,          // Slightly smaller initially
    },
    visible: { 
      opacity: 1, 
      scale: 1,            // Full size when visible
      transition: {
        type: "spring",
        damping: 8,          // Bouncy effect
        stiffness: 200,      // Spring responsiveness
        mass: 0.8,           // Weight of the animation
      },
    },
  }

  return (
    <motion.div
      data-slot="profile-card"
      // Mouse interaction handlers for hover animations
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      // Initial animation state and hover trigger
      initial="rest"
      whileHover="hover"
      variants={containerVariants}
      className={cn(
        // Base styling: size, shape, and visual effects
        "relative w-80 h-96 rounded-3xl border border-border/20 text-card-foreground overflow-hidden shadow-xl shadow-black/5 cursor-pointer group backdrop-blur-sm",
        // Dark mode shadow enhancement
        "dark:shadow-black/20",
        className
      )}
    >
      {/* Full Cover Background Image */}
      <motion.img
        src={coverImage}
        alt={professional.name}
        className="absolute inset-0 w-full h-full object-cover"
        variants={imageVariants}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      />

      {/* Availability Status Badge */}
      <div className="absolute top-4 right-4">
        <div className={cn(
          // Base badge styling with backdrop blur for readability
          "px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm",
          // Dynamic color based on availability status
          professional.availability === 'Available' 
            ? "bg-green-500/90 text-white"     // Green for available professionals
            : "bg-yellow-500/90 text-white"    // Yellow for busy/unavailable
        )}>
          {professional.availability}
        </div>
      </div>

      {/* Multi-layered Gradient Overlay for Smooth Content Readability */}
      {/* Layer 1: Primary background fade from bottom to top */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/40 via-background/20 via-background/10 to-transparent" />
      {/* Layer 2: Content area specific overlay with blur */}
      <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-background/90 via-background/60 via-background/30 via-background/15 via-background/8 to-transparent backdrop-blur-[1px]" />
      {/* Layer 3: Final content protection layer */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background/85 via-background/40 to-transparent backdrop-blur-sm" />

      {/* Main Content Container */}
      <motion.div 
        variants={contentVariants}
        initial="hidden"
        animate="visible"
        className="absolute bottom-0 left-0 right-0 p-6 space-y-4"
      >
        {/* Professional Name with Verification Badge */}
        <motion.div variants={itemVariants} className="flex items-center gap-2">
          <motion.h2 
            className="text-2xl font-bold text-foreground"
            // Staggered letter animation container
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.02,  // Delay between each letter
                }
              }
            }}
          >
            {/* Split name into individual letters for animation */}
            {professional.name.split("").map((letter, index) => (
              <motion.span
                key={index}
                variants={letterVariants}
                className="inline-block"
              >
                {/* Preserve spaces with non-breaking space */}
                {letter === " " ? "\u00A0" : letter}
              </motion.span>
            ))}
          </motion.h2>
          {/* Verification Badge - only shown for verified professionals */}
          {professional.verified && (
            <motion.div 
              variants={itemVariants}
              className="flex items-center justify-center w-4 h-4 rounded-full bg-blue-500 text-white"
              // Interactive hover animation for verification badge
              whileHover={{ 
                scale: 1.1, 
                rotate: 5,
                transition: { type: "spring", stiffness: 400, damping: 20 }
              }}
            >
              <Check className="w-2.5 h-2.5" />
            </motion.div>
          )}
        </motion.div>

        {/* Professional Title and Company Information */}
        <motion.div variants={itemVariants} className="space-y-1">
          <p className="text-sm font-medium text-foreground/90">
            {professional.title}
          </p>
          <p className="text-xs text-muted-foreground">
            {professional.company} • {professional.location}
          </p>
        </motion.div>

        {/* Professional Description - truncated to 2 lines */}
        <motion.p 
          variants={itemVariants}
          className="text-muted-foreground text-sm leading-relaxed line-clamp-2"
        >
          {professional.description}
        </motion.p>

        {/* Professional Statistics - Rating and Project Count */}
        <motion.div 
          variants={itemVariants}
          className="flex items-center gap-6 pt-2"
        >
          {/* Rating Display with Star Icon */}
          <div className="flex items-center gap-2 text-muted-foreground">
            <Star className="w-4 h-4 text-yellow-400" />
            <span className="font-semibold text-foreground">{professional.rating}</span>
            <span className="text-sm">({professional.reviews})</span>
          </div>
          {/* Completed Projects Count */}
          <div className="flex items-center gap-2 text-muted-foreground">
            <Briefcase className="w-4 h-4" />
            <span className="font-semibold text-foreground">{professional.completedProjects}</span>
            <span className="text-sm">projects</span>
          </div>
        </motion.div>

        {/* Pricing and Response Time Information */}
        <motion.div 
          variants={itemVariants}
          className="flex items-center justify-between"
        >
          {/* Hourly Rate - Prominent display with brand color */}
          <span className="text-2xl font-bold text-orange-600">
            {professional.hourlyRate}/hr
          </span>
          {/* Response Time - Additional professional metric */}
          <span className="text-xs text-muted-foreground">
            Responds in {professional.responseTime}
          </span>
        </motion.div>

        {/* Action Buttons - Contact and View Profile */}
        <motion.div variants={itemVariants} className="flex gap-2 pt-2">
          {/* View Profile Button - Secondary action */}
          <motion.button
            onClick={() => onViewProfile(professional.id)}
            // Subtle hover animation with spring physics
            whileHover={{ 
              scale: 1.02,
              transition: { type: "spring", stiffness: 400, damping: 25 }
            }}
            // Tactile feedback on click
            whileTap={{ scale: 0.98 }}
            className={cn(
              // Base button styling
              "flex-1 cursor-pointer py-2 px-4 rounded-xl font-medium text-sm transition-all duration-200",
              // Secondary button appearance
              "border border-border/20 shadow-sm bg-muted text-muted-foreground hover:bg-muted/80",
              // Performance optimization for animations
              "transform-gpu"
            )}
          >
            View Profile
          </motion.button>
          {/* Contact Button - Primary action */}
          <motion.button
            onClick={() => onContact(professional.id)}
            // Matching hover animation for consistency
            whileHover={{ 
              scale: 1.02,
              transition: { type: "spring", stiffness: 400, damping: 25 }
            }}
            // Tactile feedback on click
            whileTap={{ scale: 0.98 }}
            className={cn(
              // Base button styling
              "flex-1 cursor-pointer py-2 px-4 rounded-xl font-medium text-sm transition-all duration-200",
              // Primary button appearance with brand color
              "border border-border/20 shadow-sm bg-orange-600 text-white hover:bg-orange-700",
              // Performance optimization for animations
              "transform-gpu"
            )}
          >
            Contact
          </motion.button>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

/**
 * Export the ProfileCard component as the default export
 * Used throughout the application for displaying professional profiles
 */
