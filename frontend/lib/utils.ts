/**
 * Utility Functions
 * 
 * Core utility functions used throughout the application for common operations.
 * Includes CSS class management, string manipulation, and helper functions.
 * 
 * @utilities
 */

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Conditional class name utility function
 * 
 * Combines clsx for conditional classes and tailwind-merge for Tailwind CSS optimization.
 * Handles class name conflicts and provides a clean API for dynamic styling.
 * 
 * @param inputs - Array of class values (strings, objects, arrays)
 * @returns Merged and optimized class string
 * 
 * @example
 * ```typescript
 * // Basic usage
 * cn("px-4 py-2", "bg-blue-500")
 * 
 * // Conditional classes
 * cn("btn", { "btn-primary": isPrimary, "btn-disabled": isDisabled })
 * 
 * // With Tailwind conflicts resolution
 * cn("px-4 px-6") // Results in "px-6" (latter takes precedence)
 * ```
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
