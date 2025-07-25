"use client"

import { motion } from "framer-motion"
import { Search, ArrowLeft, Home, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import AnimatedGradientBackground from "@/components/ui/animated-gradient-background"
import { TextEffect } from "@/components/ui/text-effect"

export function Illustration(props: React.ComponentPropsWithoutRef<"svg">) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 362 145" 
      {...props}
    >
      <path
        fill="currentColor"
        d="M62.6 142c-2.133 0-3.2-1.067-3.2-3.2V118h-56c-2 0-3-1-3-3V92.8c0-1.333.4-2.733 1.2-4.2L58.2 4c.8-1.333 2.067-2 3.8-2h28c2 0 3 1 3 3v85.4h11.2c.933 0 1.733.333 2.4 1 .667.533 1 1.267 1 2.2v21.2c0 .933-.333 1.733-1 2.4-.667.533-1.467.8-2.4.8H93v20.8c0 2.133-1.067 3.2-3.2 3.2H62.6zM33 90.4h26.4V51.2L33 90.4zM181.67 144.6c-7.333 0-14.333-1.333-21-4-6.666-2.667-12.866-6.733-18.6-12.2-5.733-5.467-10.266-13-13.6-22.6-3.333-9.6-5-20.667-5-33.2 0-12.533 1.667-23.6 5-33.2 3.334-9.6 7.867-17.133 13.6-22.6 5.734-5.467 11.934-9.533 18.6-12.2 6.667-2.8 13.667-4.2 21-4.2 7.467 0 14.534 1.4 21.2 4.2 6.667 2.667 12.8 6.733 18.4 12.2 5.734 5.467 10.267 13 13.6 22.6 3.334 9.6 5 20.667 5 33.2 0 12.533-1.666 23.6-5 33.2-3.333 9.6-7.866 17.133-13.6 22.6-5.6 5.467-11.733 9.533-18.4 12.2-6.666 2.667-13.733 4-21.2 4zm0-31c9.067 0 15.6-3.733 19.6-11.2 4.134-7.6 6.2-17.533 6.2-29.8s-2.066-22.2-6.2-29.8c-4.133-7.6-10.666-11.4-19.6-11.4-8.933 0-15.466 3.8-19.6 11.4-4 7.6-6 17.533-6 29.8s2 22.2 6 29.8c4.134 7.467 10.667 11.2 19.6 11.2zM316.116 142c-2.134 0-3.2-1.067-3.2-3.2V118h-56c-2 0-3-1-3-3V92.8c0-1.333.4-2.733 1.2-4.2l56.6-84.6c.8-1.333 2.066-2 3.8-2h28c2 0 3 1 3 3v85.4h11.2c.933 0 1.733.333 2.4 1 .666.533 1 1.267 1 2.2v21.2c0 .933-.334 1.733-1 2.4-.667.533-1.467.8-2.4.8h-11.2v20.8c0 2.133-1.067 3.2-3.2 3.2h-27.2zm-29.6-51.6h26.4V51.2l-26.4 39.2z"
      />
    </svg>
  )
}

export default function NotFoundPage() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Animated Gradient Background */}
      <AnimatedGradientBackground
        Breathing={true}
        startingGap={120}
        breathingRange={8}
        animationSpeed={0.015}
        gradientColors={[
          "#0A0A0A",
          "#1a1a2e",
          "#16213e",
          "#0f3460", 
          "#533483",
          "#7209b7",
          "#a663cc"
        ]}
        gradientStops={[20, 35, 50, 65, 75, 85, 100]}
        topOffset={10}
      />

      {/* Floating particles effect */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full"
            initial={{ 
              x: Math.random() * 100 + "%", 
              y: "100%",
              opacity: 0 
            }}
            animate={{ 
              y: "-10%", 
              opacity: [0, 1, 0],
              scale: [0, 1, 0]
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "linear"
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-center">
        {/* 404 Illustration */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <Illustration className="w-48 h-20 text-white/80 sm:w-64 sm:h-28" />
        </motion.div>

        {/* Main Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-6"
        >
          <TextEffect
            per="char"
            preset="fade"
            className="text-4xl sm:text-6xl lg:text-7xl font-bold text-white mb-4"
          >
            Page not found
          </TextEffect>
        </motion.div>

        {/* Description */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mb-8"
        >
          <TextEffect
            per="word"
            preset="blur"
            className="text-lg sm:text-xl text-white/80 max-w-2xl font-medium"
            delay={0.8}
          >
            The page you're looking for seems to have wandered off into the digital void.
          </TextEffect>
        </motion.div>

        {/* Search Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mb-8 w-full max-w-md"
        >
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/60" />
              <Input 
                placeholder="Search for what you need..." 
                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60 backdrop-blur-sm focus:bg-white/20 transition-all duration-300"
              />
            </div>
            <Button 
              variant="secondary" 
              className="bg-white/20 hover:bg-white/30 text-white border-white/20 backdrop-blur-sm transition-all duration-300"
            >
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Button 
            variant="default" 
            asChild 
            className="group bg-white/90 hover:bg-white text-black border-0 px-6 py-3 transition-all duration-300 hover:scale-105"
          >
            <a href="/">
              <Home className="w-4 h-4 mr-2 transition-transform group-hover:scale-110" />
              Go Home
            </a>
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()}
            className="group bg-white/10 hover:bg-white/20 text-white border-white/30 hover:border-white/50 px-6 py-3 backdrop-blur-sm transition-all duration-300 hover:scale-105"
          >
            <RefreshCw className="w-4 h-4 mr-2 transition-transform group-hover:rotate-180" />
            Try Again
          </Button>
          
          <Button 
            variant="ghost" 
            onClick={() => window.history.back()}
            className="group text-white/80 hover:text-white hover:bg-white/10 px-6 py-3 transition-all duration-300 hover:scale-105"
          >
            <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
            Go Back
          </Button>
        </motion.div>

        {/* Help Text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="mt-12 text-center"
        >
          <p className="text-white/60 text-sm">
            Still lost? Contact our{" "}
            <a 
              href="/contact" 
              className="text-white/80 hover:text-white underline transition-colors duration-300"
            >
              support team
            </a>{" "}
            for assistance.
          </p>
        </motion.div>
      </div>
    </div>
  )
}
