'use client'

import { useState, useEffect } from 'react'
import { ArrowRight, Users, Calendar, Star, Sparkles } from 'lucide-react'

export default function HomePage() {
  const [isVisible, setIsVisible] = useState(false)
  const [stats, setStats] = useState({ users: 0, events: 0, reviews: 0 })

  useEffect(() => {
    setIsVisible(true)
    
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
              CollabBridge is the premier platform connecting event planners with Rwanda&apos;s most talented creative professionals. 
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

      {/* Features Section */}
      <section id="features" className="container-responsive py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Everything You Need to Succeed</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Powerful tools and features designed to make event planning and collaboration effortless
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: Users,
              title: "Professional Network",
              description: "Access Rwanda's largest network of verified creative professionals including photographers, designers, musicians, and more.",
              gradient: "from-purple-500 to-pink-500"
            },
            {
              icon: Calendar,
              title: "Smart Scheduling",
              description: "Coordinate schedules seamlessly with built-in calendar integration and real-time availability tracking.",
              gradient: "from-pink-500 to-orange-500"
            },
            {
              icon: Star,
              title: "Quality Assurance",
              description: "Review system and verified portfolios ensure you work with top-tier professionals for your events.",
              gradient: "from-orange-500 to-purple-500"
            }
          ].map((feature, index) => (
            <div 
              key={feature.title}
              className={`card-interactive animate-fade-in-up animate-stagger-${index + 1}`}
            >
              <div className="p-8">
                <div className={`w-12 h-12 bg-gradient-to-r ${feature.gradient} rounded-xl flex items-center justify-center mb-6`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="bg-gradient-to-r from-purple-50 to-pink-50 py-20">
        <div className="container-responsive">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How CollabBridge Works</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Three simple steps to transform your event planning experience
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Post Your Event",
                description: "Share your event details, requirements, and timeline. Our platform matches you with the perfect professionals."
              },
              {
                step: "02", 
                title: "Review & Connect",
                description: "Browse profiles, portfolios, and reviews. Connect directly with professionals who fit your vision and budget."
              },
              {
                step: "03",
                title: "Collaborate & Create",
                description: "Use our collaboration tools to coordinate, communicate, and bring your event to life seamlessly."
              }
            ].map((step, index) => (
              <div key={step.step} className="text-center">
                <div className="relative mb-8">
                  <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-white">{step.step}</span>
                  </div>
                  {index < 2 && (
                    <div className="hidden md:block absolute top-10 left-1/2 w-full h-0.5 bg-gradient-to-r from-purple-300 to-pink-300 transform translate-x-10"></div>
                  )}
                </div>
                <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="container-responsive py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">What Our Users Say</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Real stories from event planners and professionals who&apos;ve transformed their workflow
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              name: "Aisha Uwimana",
              role: "Event Planner",
              company: "Kigali Events Co.",
              testimonial: "CollabBridge revolutionized how I find and work with creative professionals. The quality of talent and ease of collaboration is unmatched.",
              rating: 5
            },
            {
              name: "Jean Baptiste",
              role: "Photographer", 
              company: "Rwanda Visuals",
              testimonial: "As a photographer, this platform connected me with amazing clients and events I never would have found otherwise. Game-changer!",
              rating: 5
            },
            {
              name: "Marie Claire",
              role: "Wedding Planner",
              company: "Elegant Affairs",
              testimonial: "The scheduling tools and professional network made planning my clients' weddings so much smoother. Highly recommend!",
              rating: 5
            }
          ].map((testimonial, index) => (
            <div key={testimonial.name} className={`card animate-fade-in-up animate-stagger-${index + 1}`}>
              <div className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 italic">&quot;{testimonial.testimonial}&quot;</p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center mr-4">
                    <span className="text-white font-semibold">{testimonial.name.charAt(0)}</span>
                  </div>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">{testimonial.role}, {testimonial.company}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 py-20">
        <div className="container-responsive text-center">
          <div className="max-w-3xl mx-auto text-white">
            <h2 className="text-4xl font-bold mb-4">Ready to Transform Your Events?</h2>
            <p className="text-xl mb-8 opacity-90">
              Join Rwanda&apos;s premier creative collaboration platform and bring your events to life
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="btn bg-white text-purple-600 hover:bg-gray-100 btn-lg font-semibold">
                Start Free Trial
              </button>
              <button className="btn bg-transparent border-2 border-white text-white hover:bg-white hover:text-purple-600 btn-lg">
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container-responsive">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">CollabBridge</span>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                Connecting event planners with Rwanda&apos;s most talented creative professionals. 
                Making collaboration seamless and events unforgettable.
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-purple-600 transition-colors cursor-pointer">
                  <span className="text-sm">f</span>
                </div>
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-purple-600 transition-colors cursor-pointer">
                  <span className="text-sm">t</span>
                </div>
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-purple-600 transition-colors cursor-pointer">
                  <span className="text-sm">in</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 CollabBridge. All rights reserved. Made with ❤️ in Rwanda.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}