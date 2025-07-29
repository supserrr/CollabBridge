"use client"

/**
 * ProfileCard Component
 * 
 * A beautiful, interactive card component for displaying professional profiles
 * with full-cover portfolio images, smooth animations, and immersive design.
 * Follows the same design principles as EventCard for consistency.
 * 
 * Features:
 * - Full-cover portfolio image background with layered gradients
 * - Letter-by-letter name animation using Framer Motion
 * - Interactive hover effects and state management
 * - Positioned badges for verification and availability
 * - Skill tags, ratings, and professional information
 * - Responsive design and accessibility support
 */

import { motion, useReducedMotion } from "framer-motion"
import { Check, Users, UserCheck, Star, MapPin, Award, Briefcase, Clock, MessageCircle } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

/**
 * Professional data structure interface
 * Defines the shape of professional profile data
 */
interface Professional {
  id: number
  name: string
  username?: string
  title: string
  location: string
  rating: number
  reviews: number
  hourlyRate: string
  skills: string[]
  categories: string[]
  avatar: string
  verified: boolean
  responseTime: string
  completedProjects: number
  description: string
  availability: string
  portfolioImages?: string[]
  portfolioLinks?: string[]
  languages?: string[]
  certifications?: string[]
  awards?: string[]
  equipment?: string
  experience?: string
  travelRadius?: number
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
 * Renders an immersive professional profile card with full-cover portfolio images,
 * smooth animations, and comprehensive professional information following EventCard design principles.
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
  // Hover state for interactive animations
  const [hovered, setHovered] = useState(false)
  
  // Respect user's motion preferences for accessibility
  const shouldReduceMotion = useReducedMotion()
  const shouldAnimate = enableAnimations && !shouldReduceMotion

  // Determine the best image to use - priority: portfolio > avatar > placeholder
  const coverImage = professional.portfolioImages?.[0] || professional.avatar || "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&h=800&fit=crop&auto=format&q=80"

  /**
   * Animation variants for the main card container
   * Handles hover effects with scale and lift animations
   */
  const containerVariants = {
    rest: { 
      scale: 1,
      y: 0,
      filter: "blur(0px)",
    },
    hover: shouldAnimate ? { 
      scale: 1.02,           // Subtle scale increase
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
   * Creates a subtle zoom effect on hover for immersion
   */
  const imageVariants = {
    rest: { scale: 1 },
    hover: { scale: 1.05 },  // Slight zoom on hover
  }

  /**
   * Animation variants for the card content
   * Controls entrance animations and staggered child animations
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

      {/* Professional Title Badge */}
      <div className="absolute top-4 left-4 flex flex-col gap-2">
        <div className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-600/90 text-white backdrop-blur-sm">
          {professional.title}
        </div>
      </div>

      {/* Verification Badge - top right */}
      {professional.verified && (
        <div className="absolute top-4 right-4">
          <div className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500/90 text-white backdrop-blur-sm flex items-center gap-1">
            <Check className="w-3 h-3" />
            Verified
          </div>
        </div>
      )}

      {/* Availability Badge - positioned below verification if present */}
      <div className={cn(
        "absolute right-4",
        professional.verified ? "top-16" : "top-4"
      )}>
        <div className={cn(
          "px-3 py-1 rounded-full text-sm font-bold backdrop-blur-sm",
          professional.availability === 'Available' 
            ? "bg-green-500/90 text-white"     // Green for available
            : "bg-orange-500/90 text-white"    // Orange for busy
        )}>
          {professional.availability}
        </div>
      </div>

      {/* Multi-layered Gradient Overlay for Content Readability */}
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
        {/* Professional Name with Letter-by-Letter Animation */}
        <motion.div variants={itemVariants}>
          <motion.h2 
            className="text-2xl font-bold text-foreground line-clamp-1"
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.02,
                }
              }
            }}
          >
            {(professional.name || '').split("").map((letter, index) => (
              <motion.span
                key={index}
                variants={letterVariants}
                className="inline-block"
              >
                {letter === " " ? "\u00A0" : letter}
              </motion.span>
            ))}
          </motion.h2>
        </motion.div>

        {/* Professional Description */}
        <motion.p 
          variants={itemVariants}
          className="text-muted-foreground text-sm leading-relaxed line-clamp-2"
        >
          {professional.description}
        </motion.p>

        {/* Location and Primary Skills */}
        <motion.div variants={itemVariants} className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span className="font-medium text-foreground line-clamp-1">{professional.location}</span>
          </div>
          {professional.skills && professional.skills.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Briefcase className="w-4 h-4" />
              <span className="font-medium text-foreground line-clamp-1">
                {professional.skills.slice(0, 2).join(', ')}
                {professional.skills.length > 2 && ` +${professional.skills.length - 2} more`}
              </span>
            </div>
          )}
        </motion.div>

        {/* Rating and Stats */}
        <motion.div 
          variants={itemVariants}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            {professional.rating > 0 ? (
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium text-foreground">
                  {professional.rating}
                </span>
                <span className="text-xs text-muted-foreground">
                  ({professional.reviews} review{professional.reviews !== 1 ? 's' : ''})
                </span>
              </div>
            ) : (
              <span className="text-xs text-muted-foreground">No reviews yet</span>
            )}
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Award className="w-4 h-4" />
            <span className="text-sm font-medium text-foreground">
              {professional.completedProjects} projects
            </span>
          </div>
        </motion.div>

        {/* Hourly Rate and Response Time */}
        <motion.div 
          variants={itemVariants}
          className="flex items-center justify-between"
        >
          <div className="text-sm">
            <span className="text-muted-foreground">Rate: </span>
            <span className="font-bold text-foreground">{professional.hourlyRate}</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span className="text-foreground">{professional.responseTime}</span>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div variants={itemVariants} className="flex gap-2 pt-2">
          <motion.button
            onClick={() => onViewProfile(professional.id)}
            whileHover={{ 
              scale: 1.02,
              transition: { type: "spring", stiffness: 400, damping: 25 }
            }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              "flex-1 cursor-pointer py-2 px-4 rounded-xl font-medium text-sm transition-all duration-200",
              "border border-border/20 shadow-sm bg-muted text-muted-foreground hover:bg-muted/80",
              "transform-gpu"
            )}
          >
            View Profile
          </motion.button>
          <motion.button
            onClick={() => onContact(professional.id)}
            whileHover={{ 
              scale: 1.02,
              transition: { type: "spring", stiffness: 400, damping: 25 }
            }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              "flex-1 cursor-pointer py-2 px-4 rounded-xl font-medium text-sm transition-all duration-200",
              "border border-border/20 shadow-sm bg-blue-600 text-white hover:bg-blue-700",
              "transform-gpu flex items-center justify-center gap-1"
            )}
          >
            <MessageCircle className="w-4 h-4" />
            Contact
          </motion.button>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
