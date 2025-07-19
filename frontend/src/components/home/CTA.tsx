'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowRightIcon, SparklesIcon, RocketLaunchIcon } from '@heroicons/react/24/outline'

const CTA: React.FC = () => {
  return (
    <section className="py-24 bg-gradient-to-br from-[var(--text-primary)] via-[var(--text-secondary)] to-[var(--text-primary)] relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-[var(--accent)]/20 to-[var(--button-primary)]/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-[var(--button-primary)]/20 to-[var(--accent)]/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Main CTA Content */}
          <div className="mb-12">
            <div className="inline-flex items-center px-4 py-2 bg-[var(--bg-primary)]/10 backdrop-blur-sm text-[var(--bg-primary)] rounded-full text-sm font-semibold mb-8 border border-[var(--bg-primary)]/20">
              <SparklesIcon className="w-4 h-4 mr-2" />
              Ready to Transform Your Events?
            </div>
            
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold text-[var(--bg-primary)] mb-8 leading-tight">
              Start creating
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--button-primary)] to-[var(--accent)]">
                {' '}extraordinary
              </span>
              <br />
              events today
            </h2>
            
            <p className="text-xl md:text-2xl text-[var(--bg-primary)]/80 mb-12 max-w-4xl mx-auto leading-relaxed">
              Join event professionals and creative talents worldwide who are already 
              building amazing collaborations and delivering exceptional experiences - completely free.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
            <Link 
              href="/auth/signup"
              className="group inline-flex items-center justify-center px-10 py-5 bg-gradient-to-r from-[var(--button-primary)] to-[var(--accent)] text-[var(--bg-primary)] font-bold text-lg rounded-full hover:opacity-90 transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:-translate-y-2 min-w-[240px]"
            >
              <RocketLaunchIcon className="w-6 h-6 mr-3 group-hover:rotate-12 transition-transform" />
              Start Free Today
              <ArrowRightIcon className="ml-3 w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <Link 
              href="/professionals"
              className="group inline-flex items-center justify-center px-10 py-5 bg-[var(--bg-primary)]/10 backdrop-blur-sm text-[var(--bg-primary)] font-bold text-lg rounded-full hover:bg-[var(--bg-primary)]/20 transition-all duration-300 border-2 border-[var(--bg-primary)]/20 hover:border-[var(--bg-primary)]/40 min-w-[240px]"
            >
              Browse Professionals
              <ArrowRightIcon className="ml-3 w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Value Propositions */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {[
              {
                title: 'Completely Free',
                description: 'No setup fees, no subscription costs, no hidden charges. CollabBridge is free to use forever.',
                icon: '💳'
              },
              {
                title: 'Instant Connections',
                description: 'Find your perfect creative collaborators quickly and easily with our smart matching system.',
                icon: '⚡'
              },
              {
                title: 'Secure Platform',
                description: 'Professional verification and secure communication tools ensure quality collaborations.',
                icon: '🛡️'
              }
            ].map((benefit, index) => (
              <div key={index} className="bg-[var(--bg-primary)]/5 backdrop-blur-sm rounded-2xl p-6 border border-[var(--bg-primary)]/10 hover:bg-[var(--bg-primary)]/10 transition-all duration-300">
                <div className="text-3xl mb-4">{benefit.icon}</div>
                <h3 className="text-xl font-bold text-[var(--bg-primary)] mb-2">{benefit.title}</h3>
                <p className="text-[var(--bg-primary)]/80">{benefit.description}</p>
              </div>
            ))}
          </div>

          {/* Trust Indicators */}
          <div className="bg-[var(--bg-primary)]/5 backdrop-blur-sm rounded-3xl p-8 border border-[var(--bg-primary)]/10">
            <div className="grid md:grid-cols-3 gap-8 items-center">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-[var(--bg-primary)] mb-2">Verified</div>
                <div className="text-[var(--bg-primary)]/70">Professionals</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-[var(--bg-primary)] mb-2">Global</div>
                <div className="text-[var(--bg-primary)]/70">Community</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-[var(--bg-primary)] mb-2">Always Free</div>
                <div className="text-[var(--bg-primary)]/70">Forever</div>
              </div>
            </div>
          </div>

          {/* Final Encouragement */}
          <div className="mt-16">
            <p className="text-lg text-[var(--bg-primary)]/80 mb-4">
              🚀 Ready to join the future of event collaboration?
            </p>
            <p className="text-sm text-[var(--bg-primary)]/60">
              © 2025 CollabBridge • Always free to use • No credit card required
            </p>
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-20 w-4 h-4 bg-[var(--accent)] rounded-full animate-ping opacity-75" />
      <div className="absolute bottom-20 right-20 w-6 h-6 bg-[var(--button-primary)] rounded-full animate-pulse opacity-75" />
      <div className="absolute top-1/2 right-10 w-3 h-3 bg-[var(--accent)] rounded-full animate-bounce opacity-75" />
    </section>
  )
}

export default CTA
