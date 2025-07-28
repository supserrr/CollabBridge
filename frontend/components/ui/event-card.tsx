/**
 * EventCard Component
 * 
 * A beautiful, interactive card component for displaying event information with full-cover images,
 * smooth animations, and comprehensive event details. Features immersive design with glassmorphism
 * effects, organizer information, pricing badges, and responsive interactions.
 * 
 * @component
 * @example
 * ```tsx
 * <EventCard 
 *   event={eventData}
 *   onRegister={handleRegister}
 *   onViewDetails={handleViewDetails}
 *   enableAnimations={true}
 * />
 * ```
 */

"use client"

import { motion, useReducedMotion } from "framer-motion"
import { MapPin, Calendar, Clock, Users, Tag, Star } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

/**
 * Event interface defining the structure of event data
 * Contains all necessary information for displaying event cards
 */
interface Event {
  id: number                    // Unique identifier for the event
  title: string                 // Event title/name
  description: string           // Event description
  date: string                  // Event date (formatted string)
  time: string                  // Event time (formatted string)
  location: string              // Event location/venue
  category: string              // Event category (e.g., "Workshop", "Conference")
  attendees: number             // Current number of registered attendees
  maxAttendees?: number         // Maximum capacity (optional)
  price: number                 // Event price (0 for free events)
  image: string                 // Cover image URL
  organizer: {
    name: string                // Organizer's name
    avatar: string              // Organizer's profile picture URL
    rating?: number             // Organizer's rating (optional)
    totalReviews?: number       // Total number of reviews (optional)
  }
  tags: string[]                // Event tags/keywords
  isFeatured?: boolean          // Whether event is featured (optional)
}

/**
 * Props interface for the EventCard component
 * Defines all available configuration options and callbacks
 */
interface EventCardProps {
  event: Event                  // Event data to display
  enableAnimations?: boolean    // Toggle for animations (default: true)
  className?: string            // Additional CSS classes
  onRegister?: (id: number) => void      // Callback for event registration
  onViewDetails?: (id: number) => void   // Callback for viewing event details
  onSaveEvent?: (id: number) => void     // Callback for saving/bookmarking event
  isSaved?: boolean             // Whether event is currently saved (default: false)
}

/**
 * EventCard Component
 * Renders an immersive event card with full-cover image, organizer details, 
 * pricing information, and interactive elements
 */
export function EventCard({
  event,
  enableAnimations = true,
  className,
  onRegister = () => {},
  onViewDetails = () => {},
  onSaveEvent = () => {},
  isSaved = false,
}: EventCardProps) {
  // Hover state for interactive animations
  const [hovered, setHovered] = useState(false)
  
  // Respect user's motion preferences for accessibility
  const shouldReduceMotion = useReducedMotion()
  const shouldAnimate = enableAnimations && !shouldReduceMotion

  // Default fallback image if event doesn't have a cover image
  const coverImage = event.image || "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&h=800&fit=crop&auto=format&q=80"

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
   * Animation variants for individual letters (used for title animation)
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

  /**
   * Helper function to format event date
   * Converts date string to readable format (e.g., "Dec 15")
   */
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  /**
   * Helper function to format event price
   * Returns "Free" for zero price, otherwise formats as currency
   */
  const formatPrice = (price: number) => {
    return price === 0 ? 'Free' : `$${price}`
  }

  return (
    <motion.div
      data-slot="event-card"
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
        alt={event.title}
        className="absolute inset-0 w-full h-full object-cover"
        variants={imageVariants}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      />

      {/* Event Category Badge */}
      <div className="absolute top-4 left-4 flex flex-col gap-2">
        <div className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-600/90 text-white backdrop-blur-sm">
          {event.category}
        </div>
        {/* Debug: Show if using placeholder image */}
        {event.image.includes('collaborate-book.jpg') && (
          <div className="px-2 py-1 rounded-full text-xs font-medium bg-gray-500/90 text-white backdrop-blur-sm">
            No Image
          </div>
        )}
      </div>

      {/* Featured Event Badge - only shown for featured events */}
      {event.isFeatured && (
        <div className="absolute top-4 right-4">
          <div className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-500/90 text-white backdrop-blur-sm">
            Featured
          </div>
        </div>
      )}

      {/* Price Badge - positioned dynamically based on featured status */}
      <div className={cn(
        "absolute right-4",
        // Adjust position if featured badge is present
        event.isFeatured ? "top-16" : "top-4"
      )}>
        <div className={cn(
          "px-3 py-1 rounded-full text-sm font-bold backdrop-blur-sm",
          // Different colors for free vs paid events
          event.price === 0 
            ? "bg-green-500/90 text-white"     // Green for free events
            : "bg-blue-600/90 text-white"      // Blue for paid events
        )}>
          {formatPrice(event.price)}
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
        {/* Event Title with Letter-by-Letter Animation */}
        <motion.div variants={itemVariants}>
          <motion.h2 
            className="text-2xl font-bold text-foreground line-clamp-2"
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.02,
                }
              }
            }}
          >
            {(event.title || '').split("").map((letter, index) => (
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

        {/* Event Description */}
        <motion.p 
          variants={itemVariants}
          className="text-muted-foreground text-sm leading-relaxed line-clamp-2"
        >
          {event.description}
        </motion.p>

        {/* Date, Time, and Location */}
        <motion.div variants={itemVariants} className="space-y-2">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span className="font-medium text-foreground">{formatDate(event.date)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span className="font-medium text-foreground">{event.time}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span className="font-medium text-foreground line-clamp-1">{event.location}</span>
          </div>
        </motion.div>

        {/* Organizer and Attendees */}
        <motion.div 
          variants={itemVariants}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <img
              src={event.organizer.avatar}
              alt={event.organizer.name}
              className="w-8 h-8 rounded-full object-cover border-2 border-background"
            />
            <div>
              <p className="text-sm font-medium text-foreground">{event.organizer.name}</p>
              {event.organizer.rating && (
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs text-muted-foreground">
                    {event.organizer.rating}
                    {event.organizer.totalReviews && event.organizer.totalReviews > 0 && (
                      <span className="ml-1">({event.organizer.totalReviews} review{event.organizer.totalReviews !== 1 ? 's' : ''})</span>
                    )}
                  </span>
                </div>
              )}
              {(!event.organizer.rating && event.organizer.totalReviews === 0) && (
                <span className="text-xs text-muted-foreground">New organizer</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="w-4 h-4" />
            <span className="text-sm font-medium text-foreground">
              {event.attendees}{event.maxAttendees ? `/${event.maxAttendees}` : ''}
            </span>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div variants={itemVariants} className="flex gap-2 pt-2">
          <motion.button
            onClick={() => onViewDetails(event.id)}
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
            Details
          </motion.button>
          <motion.button
            onClick={() => onRegister(event.id)}
            whileHover={{ 
              scale: 1.02,
              transition: { type: "spring", stiffness: 400, damping: 25 }
            }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              "flex-1 cursor-pointer py-2 px-4 rounded-xl font-medium text-sm transition-all duration-200",
              "border border-border/20 shadow-sm bg-orange-600 text-white hover:bg-orange-700",
              "transform-gpu"
            )}
          >
            Register
          </motion.button>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
