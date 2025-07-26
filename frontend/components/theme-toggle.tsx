"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"

export function ThemeToggle() {
  const { setTheme, theme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="relative cursor-pointer text-sm font-semibold px-6 py-2 rounded-full transition-colors text-foreground/80 w-[68px] flex items-center justify-center">
        <div className="w-[18px] h-[18px] flex items-center justify-center">
          <Sun size={18} strokeWidth={2.5} />
        </div>
      </div>
    )
  }

  return (
    <button
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className={cn(
        "relative cursor-pointer text-sm font-semibold px-6 py-2 rounded-full transition-colors",
        "hover:text-primary hover:bg-muted/50",
        "w-[68px] flex items-center justify-center", // Fixed width to prevent movement
      )}
    >
      <span className="relative w-[18px] h-[18px] flex items-center justify-center">
        <Sun 
          size={18} 
          strokeWidth={2.5} 
          className={cn(
            "absolute rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0",
            theme === "light" ? "text-primary" : "text-muted-foreground"
          )}
        />
        <Moon 
          size={18} 
          strokeWidth={2.5} 
          className={cn(
            "absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100",
            theme === "dark" ? "text-primary" : "text-muted-foreground"
          )}
        />
      </span>
      
      <span className="sr-only">Toggle theme</span>
    </button>
  )
}
