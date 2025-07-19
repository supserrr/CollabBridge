import React from 'react';
import Link from 'next/link';
import { ArrowRightIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const Hero: React.FC = () => {
  return (
    <section className="relative min-h-screen flex items-center bg-gradient-to-br from-[var(--bg-primary)] via-[var(--bg-secondary)] to-[var(--accent)] overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--accent)] rounded-full blur-3xl opacity-20 animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[var(--button-primary)] rounded-full blur-3xl opacity-10 animate-pulse delay-1000" />
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center">
          {/* Main Hero Content */}
          <div className="mb-12">
            <div className="inline-flex items-center px-4 py-2 bg-[var(--card-bg)] backdrop-blur-sm text-[var(--text-primary)] rounded-full text-sm font-semibold mb-8 border border-[var(--border)] shadow-lg">
              <span className="w-2 h-2 bg-[var(--accent)] rounded-full mr-2 animate-pulse"></span>
              Free Platform for Event Collaboration
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-[var(--text-primary)] mb-8 leading-tight">
              Connect. Collaborate.
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[var(--button-primary)] to-[var(--accent)]">
                Create Amazing Events
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-[var(--text-secondary)] mb-12 max-w-4xl mx-auto leading-relaxed">
              The premier platform connecting event planners with skilled creative professionals. 
              Find your perfect match and bring extraordinary events to life - completely free.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
            <Link 
              href="/auth/signup"
              className="group inline-flex items-center justify-center px-10 py-5 bg-[var(--button-primary)] text-[var(--bg-primary)] font-bold text-lg rounded-full hover:opacity-90 transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:-translate-y-2 min-w-[240px]"
            >
              Get Started Free
              <ArrowRightIcon className="ml-3 w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <Link 
              href="/professionals"
              className="group inline-flex items-center justify-center px-10 py-5 bg-[var(--card-bg)] backdrop-blur-sm text-[var(--text-primary)] font-bold text-lg rounded-full hover:bg-[var(--bg-secondary)] transition-all duration-300 border-2 border-[var(--border)] hover:border-[var(--accent)] min-w-[240px]"
            >
              Browse Professionals
              <ArrowRightIcon className="ml-3 w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Search Bar */}
          <div className="max-w-3xl mx-auto">
            <div className="bg-[var(--card-bg)] rounded-2xl p-4 shadow-2xl backdrop-blur-lg border border-[var(--border)]">
              <div className="flex flex-col lg:flex-row gap-3">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="What type of professional do you need?"
                    className="w-full px-6 py-4 text-[var(--text-primary)] placeholder-[var(--text-secondary)] bg-[var(--bg-primary)] rounded-xl border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] shadow-sm text-lg transition-all"
                  />
                </div>
                <div className="lg:w-48">
                  <input
                    type="text"
                    placeholder="Location"
                    className="w-full px-6 py-4 text-[var(--text-primary)] placeholder-[var(--text-secondary)] bg-[var(--bg-primary)] rounded-xl border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] shadow-sm text-lg transition-all"
                  />
                </div>
                <button className="bg-[var(--button-primary)] text-[var(--bg-primary)] px-8 py-4 rounded-xl hover:opacity-90 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl flex items-center justify-center min-w-[120px]">
                  <MagnifyingGlassIcon className="w-6 h-6 mr-2" />
                  Search
                </button>
              </div>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="mt-16 text-center max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex items-center justify-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-[var(--button-primary)] to-[var(--accent)] rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-[var(--text-primary)] font-semibold">Verified Professionals</span>
              </div>
              <div className="flex items-center justify-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-[var(--button-primary)] to-[var(--accent)] rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <span className="text-[var(--text-primary)] font-semibold">Secure Platform</span>
              </div>
              <div className="flex items-center justify-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-[var(--button-primary)] to-[var(--accent)] rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span className="text-[var(--text-primary)] font-semibold">Always Free</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-20 w-4 h-4 bg-[var(--accent)] rounded-full animate-ping opacity-75" />
      <div className="absolute bottom-20 right-20 w-6 h-6 bg-[var(--button-primary)] rounded-full animate-pulse opacity-30" />
      <div className="absolute top-1/2 right-10 w-3 h-3 bg-[var(--accent)] rounded-full animate-bounce opacity-50" />
    </section>
  );
};

export default Hero;