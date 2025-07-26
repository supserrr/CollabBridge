"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface CTAProps {
  badge?: {
    text: string
  }
  title: string
  description?: string
  action: {
    text: string
    href: string
    variant?: "default" | "glow"
  }
  withGlow?: boolean
  className?: string
}

export function CTASection({
  badge,
  title,
  description,
  action,
  withGlow = true,
  className,
}: CTAProps) {
  return (
    <section className={cn("overflow-hidden pt-0 md:pt-0 w-full", className)}>
      <div className="relative mx-auto flex max-w-none flex-col items-center gap-6 px-4 sm:px-6 md:px-8 py-12 text-center sm:gap-8 md:py-24 w-full">
        {/* Badge */}
        {badge && (
          <Badge
            variant="outline"
            className="animate-fade-in-up animate-delay-100"
          >
            <span className="text-muted-foreground">{badge.text}</span>
          </Badge>
        )}

        {/* Title */}
        <h2 className="text-3xl font-semibold sm:text-5xl animate-fade-in-up animate-delay-200">
          {title}
        </h2>

        {/* Description */}
        {description && (
          <p className="text-muted-foreground animate-fade-in-up animate-delay-300">
            {description}
          </p>
        )}

        {/* Action Button */}
        <Button
          variant={action.variant === "glow" ? "default" : (action.variant || "default")}
          size="lg"
          className="animate-fade-in-up animate-delay-500"
          asChild
        >
          <a href={action.href}>{action.text}</a>
        </Button>

        {/* Glow Effect */}
        {withGlow && (
          <div className="fade-top-lg pointer-events-none absolute left-0 right-0 top-0 bottom-0 w-screen ml-[calc(-50vw+50%)] rounded-2xl shadow-glow animate-scale-in animate-delay-700" />
        )}
      </div>
    </section>
  )
}
