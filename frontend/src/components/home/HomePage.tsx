import React from 'react'
import Hero from './Hero'
import Features from './Features'
import HowItWorks from './HowItWorks'
import Testimonials from './Testimonials'
import CTA from './CTA'
import ThemeToggle from './ThemeToggle'

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Theme Toggle */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      
      {/* Page Sections */}
      <Hero />
      <Features />
      <HowItWorks />
      <Testimonials />
      <CTA />
    </div>
  )
}

export default HomePage
