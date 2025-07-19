import React from 'react'
import { 
  MagnifyingGlassIcon, 
  ShieldCheckIcon, 
  CreditCardIcon, 
  ChatBubbleLeftRightIcon,
  SparklesIcon,
  UserGroupIcon 
} from '@heroicons/react/24/outline'

const Features: React.FC = () => {
  const features = [
    {
      icon: MagnifyingGlassIcon,
      title: 'Smart Matching',
      description: 'AI-powered algorithms connect you with the perfect professionals based on your specific event needs, budget, and style preferences.',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Verified Professionals',
      description: 'Every creative professional is thoroughly vetted with background checks, portfolio reviews, and client testimonials.',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: CreditCardIcon,
      title: 'Secure Payments',
      description: 'Built-in escrow system ensures safe transactions with milestone-based payments and dispute resolution.',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: ChatBubbleLeftRightIcon,
      title: 'Seamless Communication',
      description: 'Integrated messaging, video calls, and project management tools keep everyone aligned and informed.',
      color: 'from-amber-500 to-orange-500'
    },
    {
      icon: SparklesIcon,
      title: 'Premium Quality',
      description: 'Access to top-tier professionals who have created exceptional events for clients worldwide.',
      color: 'from-violet-500 to-purple-500'
    },
    {
      icon: UserGroupIcon,
      title: 'Global Network',
      description: 'Connect with professionals worldwide for destination events and international collaborations.',
      color: 'from-indigo-500 to-blue-500'
    }
  ]

  return (
    <section className="py-24 bg-[var(--bg-primary)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center px-4 py-2 bg-[var(--card-bg)] rounded-full mb-6 border border-[var(--border)]">
            <SparklesIcon className="w-5 h-5 text-[var(--accent)] mr-2" />
            <span className="text-[var(--text-primary)] font-medium">Why Choose CollabBridge</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-6">
            Everything you need to create
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--button-primary)] to-[var(--accent)]">
              extraordinary events
            </span>
          </h2>
          <p className="text-xl text-[var(--text-secondary)] max-w-3xl mx-auto">
            From initial planning to final execution, our platform provides all the tools and connections 
            you need to bring your vision to life.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="group relative bg-[var(--card-bg)] rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-[var(--border)] hover:border-[var(--accent)] hover:-translate-y-2"
            >
              {/* Icon */}
              <div className="relative mb-6">
                <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                {/* Floating decoration */}
                <div className={`absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r ${feature.color} rounded-full opacity-20 group-hover:opacity-40 transition-opacity`}></div>
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-3 group-hover:text-[var(--accent)] transition-colors">
                {feature.title}
              </h3>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                {feature.description}
              </p>

              {/* Hover effect background */}
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)]/5 to-[var(--button-primary)]/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-20 text-center">
          <div className="bg-gradient-to-r from-[var(--button-primary)] to-[var(--accent)] rounded-3xl p-12 text-[var(--bg-primary)]">
            <h3 className="text-3xl font-bold mb-4">
              Ready to experience the difference?
            </h3>
            <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
              Join thousands of event professionals who trust CollabBridge for their most important events.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-4 bg-[var(--bg-primary)] text-[var(--button-primary)] font-semibold rounded-xl hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl">
                Start Free Today
              </button>
              <button className="px-8 py-4 bg-transparent border-2 border-[var(--bg-primary)] text-[var(--bg-primary)] font-semibold rounded-xl hover:bg-[var(--bg-primary)] hover:text-[var(--button-primary)] transition-all duration-300">
                Browse Professionals
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Features
