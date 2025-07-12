'use client'

import { useState, useEffect } from 'react'
import { ArrowRight, Users, Calendar, Star, Sparkles, ChevronDown } from 'lucide-react'

export default function HomePage() {
  const [isVisible, setIsVisible] = useState(false)
  const [stats, setStats] = useState({ users: 0, events: 0, reviews: 0 })

  useEffect(() => {
    setIsVisible(true)
    
    // Animate stats
    const animateStats = () => {
      const targetStats = { users: 250, events: 150, reviews: 98 }
      const duration = 2000
      const steps = 60
      const stepDuration = duration / steps
      
      let currentStep = 0
      const interval = setInterval(() => {
        currentStep++
        const progress = currentStep / steps
        
        setStats({
          users: Math.floor(targetStats.users * progress),
          events: Math.floor(targetStats.events * progress),
          reviews: Math.floor(targetStats.reviews * progress),
        })
        
        if (currentStep >= steps) {
          clearInterval(interval)
          setStats(targetStats)
        }
      }, stepDuration)
      
      return () => clearInterval(interval)
    }
    
    const timer = setTimeout(animateStats, 1000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
      {/* Header Navigation */}
      <header className="container-responsive py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold gradient-text-purple">CollabBridge</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="nav-link">Features</a>
            <a href="#how-it-works" className="nav-link">How it Works</a>
            <a href="#testimonials" className="nav-link">Testimonials</a>
            <a href="#pricing" className="nav-link">Pricing</a>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="btn btn-ghost btn-md">Sign In</button>
            <button className="btn btn-primary btn-md">Get Started</button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container-responsive py-20">
        <div className="text-center max-w-4xl mx-auto">
          <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="inline-flex items-center px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium mb-8">
              <Star className="w-4 h-4 mr-2" />
              Trusted by 250+ professionals in Rwanda
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              Connect. Collaborate.{' '}
              <span className="gradient-text-purple">Create Magic.</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              CollabBridge is the premier platform connecting event planners with Rwanda's most talented creative professionals. 
              Make your events unforgettable with seamless collaboration.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button className="btn btn-primary btn-lg group">
                Start Your Journey
                <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
              </button>
              <button className="btn btn-secondary btn-lg">
                Watch Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container-responsive py-16">
        <div className={`grid grid-cols-1 md:grid-cols-3 gap-8 transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="text-center">
            <div className="text-4xl font-bold text-purple-600 mb-2">{stats.users}+</div>
            <div className="text-gray-600">Creative Professionals</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-pink-600 mb-2">{stats.events}+</div>
            <div className="text-gray-600">Successful Events</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-orange-600 mb-2">{stats.reviews}%</div>
            <div className="text-gray-600">Client Satisfaction</div>
          </div>
        </div>
      </section>

      {/* Features Section */