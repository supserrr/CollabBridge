"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth-firebase";
import { cn } from "@/lib/utils";

interface FloatingCreateButtonProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
}

export function FloatingCreateButton({ 
  className, 
  size = "md",
  position = "bottom-right" 
}: FloatingCreateButtonProps) {
  const { user } = useAuth();

  if (!user?.username) return null;

  const sizeClasses = {
    sm: "h-12 w-12",
    md: "h-14 w-14", 
    lg: "h-16 w-16"
  };

  const iconSizes = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6"
  };

  const positionClasses = {
    "bottom-right": "bottom-6 right-6",
    "bottom-left": "bottom-6 left-6", 
    "top-right": "top-6 right-6",
    "top-left": "top-6 left-6"
  };

  return (
    <div className={cn("fixed z-50", positionClasses[position])}>
      <Link href={`/${user.username}/dashboard/events/create`}>
        <Button
          size="icon"
          className={cn(
            "rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-110",
            "bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800",
            "border-2 border-white/20 backdrop-blur-sm",
            sizeClasses[size],
            className
          )}
        >
          <Plus className={iconSizes[size]} />
          <span className="sr-only">Create Event</span>
        </Button>
      </Link>
      
      {/* Tooltip */}
      <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-900 text-white text-sm rounded-lg opacity-0 hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
        Create Event
        <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
      </div>
    </div>
  );
}
