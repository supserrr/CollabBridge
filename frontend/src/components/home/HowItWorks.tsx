import React from 'react'
import { 
  UserPlusIcon,
  MagnifyingGlassIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'

const HowItWorks: React.FC = () => {
  const steps = [
    {
      number: '01',
      icon: UserPlusIcon,
      title: 'Create Your Profile',
      description: 'Build a comprehensive profile showcasing your skills, experience, and portfolio. Get verified to unlock premium features.',
      features: ['Portfolio showcase', 'Skill verification', 'Professional certification', 'Background check'],
      color: 'from-blue-500 to-cyan-500'
    },
    {
      number: '02',
      icon: MagnifyingGlassIcon,
      title: 'Discover Opportunities',
      description: 'Browse curated matches or post your event needs. Our AI ensures perfect compatibility between planners and professionals.',
      features: ['Smart matching', 'Advanced filters', 'Real-time availability', 'Geographic targeting'],
      color: 'from-purple-500 to-pink-500'
    },
    {
      number: '03',
      icon: ChatBubbleLeftRightIcon,
      title: 'Connect & Collaborate',
      description: 'Communicate seamlessly through our platform with built-in project management, contracts, and milestone tracking.',
      features: ['Secure messaging', 'Video calls', 'File sharing', 'Contract management'],
      color: 'from-green-500 to-emerald-500'
    },
    {
      number: '04',
      icon: CheckCircleIcon,
      title: 'Execute & Succeed',
      description: 'Deliver exceptional results with payment protection, quality assurance, and post-event reviews to build your reputation.',
      features: ['Milestone payments', 'Quality guarantee', 'Review system', 'Success analytics'],
      color: 'from-amber-500 to-orange-500'
    }
  ]

  return (
    <section className="py-24 bg-[var(--bg-secondary)] relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 -left-40 w-80 h-80 bg-[var(--accent)]/10 rounded-full mix-blend-multiply filter blur-xl"></div>
        <div className="absolute top-40 -right-40 w-80 h-80 bg-[var(--button-primary)]/10 rounded-full mix-blend-multiply filter blur-xl"></div>
        <div className="absolute -bottom-20 left-1/2 w-80 h-80 bg-[var(--accent)]/10 rounded-full mix-blend-multiply filter blur-xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center px-4 py-2 bg-[var(--card-bg)] rounded-full shadow-md border border-[var(--border)] mb-6">
            <SparklesIcon className="w-5 h-5 text-[var(--accent)] mr-2" />
            <span className="text-[var(--text-primary)] font-medium">Simple Process</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-6">
            From concept to creation in
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--button-primary)] to-[var(--accent)]">
              four simple steps
            </span>
          </h2>
          <p className="text-xl text-[var(--text-secondary)] max-w-3xl mx-auto">
            Our streamlined process makes it easy to find, connect, and collaborate with 
            the best creative professionals for your events.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connection Lines */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-[var(--accent)]/20 via-[var(--button-primary)]/20 to-[var(--accent)]/20 transform -translate-y-1/2"></div>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-4">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                {/* Step Card */}
                <div className="group relative bg-[var(--card-bg)] rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-[var(--border)] hover:border-[var(--accent)] hover:-translate-y-4">
                  {/* Step Number */}
                  <div className="absolute -top-4 left-8">
                    <div className={`w-12 h-12 bg-gradient-to-r ${step.color} rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                      {step.number}
                    </div>
                  </div>

                  {/* Icon */}
                  <div className="mb-6 mt-4">
                    <div className={`w-16 h-16 bg-gradient-to-r ${step.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110`}>
                      <step.icon className="w-8 h-8 text-white" />
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-4 group-hover:text-[var(--accent)] transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-[var(--text-secondary)] mb-6 leading-relaxed">
                    {step.description}
                  </p>

                  {/* Features */}
                  <ul className="space-y-2">
                    {step.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center text-sm text-[var(--text-secondary)]">
                        <div className={`w-1.5 h-1.5 bg-gradient-to-r ${step.color} rounded-full mr-3`}></div>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {/* Hover effect background */}
                  <div className={`absolute inset-0 bg-gradient-to-br from-[var(--accent)]/5 to-[var(--button-primary)]/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10`}></div>
                </div>

                {/* Arrow for desktop */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <div className="w-8 h-8 bg-[var(--card-bg)] rounded-full shadow-lg flex items-center justify-center border border-[var(--border)]">
                      <ArrowRightIcon className="w-4 h-4 text-[var(--accent)]" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-20 text-center">
          <div className="max-w-4xl mx-auto bg-[var(--card-bg)] rounded-3xl p-12 shadow-xl border border-[var(--border)]">
            <h3 className="text-3xl font-bold text-[var(--text-primary)] mb-4">
              Ready to get started?
            </h3>
            <p className="text-xl text-[var(--text-secondary)] mb-8">
              Join event professionals worldwide and start creating amazing experiences today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-4 bg-gradient-to-r from-[var(--button-primary)] to-[var(--accent)] text-[var(--bg-primary)] font-semibold rounded-xl hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                Create Free Account
              </button>
              <button className="px-8 py-4 bg-[var(--bg-secondary)] text-[var(--text-primary)] font-semibold rounded-xl hover:bg-[var(--border)] transition-all duration-300 border border-[var(--border)]">
                Browse Professionals
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HowItWorks
