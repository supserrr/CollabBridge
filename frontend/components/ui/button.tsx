/**
 * Button Component
 * 
 * A flexible, accessible button component built on top of Radix UI's Slot primitive.
 * Supports multiple variants (default, destructive, outline, secondary, ghost, link)
 * and sizes (default, sm, lg, icon). Uses class-variance-authority for variant management
 * and provides consistent styling across the application.
 * 
 * @component
 * @example
 * ```tsx
 * <Button variant="default" size="lg">Click me</Button>
 * <Button variant="outline" size="sm">Secondary action</Button>
 * <Button variant="ghost" size="icon"><Icon /></Button>
 * ```
 */

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Button variant styles using class-variance-authority
 * Defines the base styles and all possible combinations of variants and sizes
 */
const buttonVariants = cva(
  // Base styles applied to all button variants
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Primary button style - main call-to-action
        default:
          "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        // Destructive actions (delete, remove, etc.)
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        // Secondary button with border
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        // Secondary button style
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        // Minimal button style
        ghost: "hover:bg-accent hover:text-accent-foreground",
        // Text link style
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",      // Standard button size
        sm: "h-8 rounded-md px-3 text-xs",  // Small button
        lg: "h-10 rounded-md px-8",    // Large button
        icon: "h-9 w-9",               // Square icon button
      },
    },
    defaultVariants: {
      variant: "default",  // Use primary style by default
      size: "default",     // Use standard size by default
    },
  }
)

/**
 * Button component props interface
 * Extends HTML button attributes and includes variant props
 */
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean  // When true, renders as a Slot for composition
}

/**
 * Button component implementation
 * Uses forwardRef for proper ref forwarding to the underlying button element
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    // Use Slot when asChild is true for composition patterns
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
