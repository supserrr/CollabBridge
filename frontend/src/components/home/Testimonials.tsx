import React, { useState, useEffect } from 'react'
import { StarIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid'
import { ChatBubbleLeftIcon, UsersIcon, SparklesIcon } from '@heroicons/react/24/outline'

const Testimonials: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0)

  const testimonials = [
    {
      id: 1,
      name: 'Sarah Chen',
      role: 'Senior Event Director',
      company: 'Apex Events',
      image: '/api/placeholder/80/80',
      rating: 5,
      quote: 'CollabBridge transformed how we approach event planning. The quality of creative professionals and the seamless collaboration tools have elevated every single project we\'ve worked on.',
      project: 'Tech Summit 2024 - 5,000 attendees',
      metric: 'Faster project completion',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 2,
      name: 'Marcus Rodriguez',
      role: 'Creative Director',
      company: 'Visionary Studios',
      image: '/api/placeholder/80/80',
      rating: 5,
      quote: 'As a creative professional, finding the right event planners used to be hit or miss. CollabBridge\'s matching algorithm is incredibly accurate - every collaboration has been a perfect fit.',
      project: 'Brand Launch Campaign',
      metric: 'Increased project opportunities',
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 3,
      name: 'Emily Thompson',
      role: 'Wedding Planner',
      company: 'Elegant Moments',
      image: '/api/placeholder/80/80',
      rating: 5,
      quote: 'The platform\'s verification process gives me confidence in every hire. I\'ve built lasting relationships with amazing photographers, florists, and designers through CollabBridge.',
      project: 'Luxury Wedding Series',
      metric: 'Excellent client satisfaction',
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: 4,
      name: 'David Park',
      role: 'Corporate Event Manager',
      company: 'Global Innovations Inc.',
      image: '/api/placeholder/80/80',
      rating: 5,
      quote: 'Our partnership ROI increased dramatically after switching to CollabBridge. The professional network quality and project management tools are unmatched in the industry.',
      project: 'Annual Conference Series',
      metric: 'Successful event outcomes',
      color: 'from-amber-500 to-orange-500'
    }
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % testimonials.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [testimonials.length])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % testimonials.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  return (
    <section className="py-24 bg-[var(--bg-secondary)] relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-10 w-72 h-72 bg-[var(--accent)]/10 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-10 w-72 h-72 bg-[var(--button-primary)]/10 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-pulse animation-delay-2000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center px-4 py-2 bg-[var(--card-bg)] rounded-full shadow-md border border-[var(--border)] mb-6">
            <UsersIcon className="w-5 h-5 text-[var(--accent)] mr-2" />
            <span className="text-[var(--text-primary)] font-medium">Customer Stories</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-6">
            Real stories from
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--button-primary)] to-[var(--accent)]">
              event professionals
            </span>
          </h2>
          <p className="text-xl text-[var(--text-secondary)] max-w-3xl mx-auto">
            See how event professionals worldwide have transformed their businesses 
            and created extraordinary experiences with CollabBridge.
          </p>
        </div>

        {/* Testimonials Carousel */}
        <div className="relative max-w-6xl mx-auto">
          <div className="overflow-hidden rounded-3xl">
            <div 
              className="flex transition-transform duration-700 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {testimonials.map((testimonial, index) => (
                <div key={testimonial.id} className="w-full flex-shrink-0">
                  <div className="bg-[var(--card-bg)] rounded-3xl p-12 shadow-2xl border border-[var(--border)] mx-4">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                      {/* Quote Section */}
                      <div className="relative">
                        <div className="absolute -top-6 -left-6">
                          <div className={`w-16 h-16 bg-gradient-to-r ${testimonial.color} rounded-full flex items-center justify-center opacity-20`}>
                            <ChatBubbleLeftIcon className="w-8 h-8 text-white" />
                          </div>
                        </div>
                        
                        <div className="mb-6">
                          <div className="flex items-center mb-4">
                            {[...Array(testimonial.rating)].map((_, i) => (
                              <StarIcon key={i} className="w-6 h-6 text-amber-400" />
                            ))}
                          </div>
                          <blockquote className="text-2xl font-medium text-[var(--text-primary)] leading-relaxed">
                            "{testimonial.quote}"
                          </blockquote>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                          <div className={`bg-gradient-to-r ${testimonial.color} bg-opacity-10 rounded-xl p-4`}>
                            <div className="font-semibold text-[var(--text-primary)] mb-1">Recent Project</div>
                            <div className="text-sm text-[var(--text-secondary)]">{testimonial.project}</div>
                          </div>
                          <div className={`bg-gradient-to-r ${testimonial.color} bg-opacity-10 rounded-xl p-4`}>
                            <div className="font-semibold text-[var(--text-primary)] mb-1">Key Result</div>
                            <div className="text-sm text-[var(--text-secondary)]">{testimonial.metric}</div>
                          </div>
                        </div>
                      </div>

                      {/* Author Section */}
                      <div className="text-center lg:text-left">
                        <div className="relative inline-block mb-6">
                          <div className={`w-32 h-32 bg-gradient-to-r ${testimonial.color} rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-2xl`}>
                            {testimonial.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-[var(--card-bg)] rounded-full shadow-lg flex items-center justify-center">
                            <SparklesIcon className="w-6 h-6 text-[var(--accent)]" />
                          </div>
                        </div>
                        
                        <div>
                          <div className="text-2xl font-bold text-[var(--text-primary)] mb-2">{testimonial.name}</div>
                          <div className="text-lg text-[var(--accent)] font-semibold mb-1">{testimonial.role}</div>
                          <div className="text-[var(--text-secondary)]">{testimonial.company}</div>
                        </div>

                        <div className="mt-8 pt-8 border-t border-[var(--border)]">
                          <div className="flex items-center justify-center lg:justify-start space-x-4">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-[var(--text-primary)]">150+</div>
                              <div className="text-sm text-[var(--text-secondary)]">Events</div>
                            </div>
                            <div className="w-px h-12 bg-[var(--border)]"></div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-[var(--text-primary)]">5M+</div>
                              <div className="text-sm text-[var(--text-secondary)]">Generated</div>
                            </div>
                            <div className="w-px h-12 bg-[var(--border)]"></div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-[var(--text-primary)]">Excellent</div>
                              <div className="text-sm text-[var(--text-secondary)]">Success Rate</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center mt-12 space-x-4">
            <button 
              onClick={prevSlide}
              className="p-3 bg-[var(--card-bg)] rounded-full shadow-lg hover:shadow-xl transition-all duration-300 border border-[var(--border)] hover:border-[var(--accent)] group"
            >
              <ChevronLeftIcon className="w-6 h-6 text-[var(--text-secondary)] group-hover:text-[var(--accent)]" />
            </button>
            
            <div className="flex space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    currentSlide === index 
                      ? 'bg-[var(--accent)] w-8' 
                      : 'bg-[var(--border)] hover:bg-[var(--text-secondary)]'
                  }`}
                />
              ))}
            </div>
            
            <button 
              onClick={nextSlide}
              className="p-3 bg-[var(--card-bg)] rounded-full shadow-lg hover:shadow-xl transition-all duration-300 border border-[var(--border)] hover:border-[var(--accent)] group"
            >
              <ChevronRightIcon className="w-6 h-6 text-[var(--text-secondary)] group-hover:text-[var(--accent)]" />
            </button>
          </div>
        </div>

        {/* Stats */}
        {/* Bottom Message */}
        <div className="mt-20 text-center max-w-2xl mx-auto">
          <div className="bg-[var(--card-bg)] rounded-2xl p-8 border border-[var(--border)]">
            <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-4">
              Join Our Growing Community
            </h3>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              Event professionals worldwide trust CollabBridge to connect, collaborate, and create extraordinary experiences together.
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </section>
  )
}

export default Testimonials
