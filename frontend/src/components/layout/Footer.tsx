'use client'

import React from 'react'
import Link from 'next/link'

const Footer: React.FC = () => {
  return (
    <footer className="bg-neutral-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">CB</span>
              </div>
              <span className="text-xl font-bold">CollabBridge</span>
            </div>
            <p className="text-neutral-400">
              Connecting event planners with creative professionals worldwide.
            </p>
          </div>

          {/* For Event Planners */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Event Planners</h3>
            <ul className="space-y-2 text-neutral-400">
              <li>
                <Link href="/browse/professionals" className="hover:text-white transition-colors">
                  Find Professionals
                </Link>
              </li>
              <li>
                <Link href="/auth/signup?role=planner" className="hover:text-white transition-colors">
                  Sign Up as Planner
                </Link>
              </li>
              <li>
                <Link href="/how-it-works/planners" className="hover:text-white transition-colors">
                  How It Works
                </Link>
              </li>
            </ul>
          </div>

          {/* For Creatives */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Creative Professionals</h3>
            <ul className="space-y-2 text-neutral-400">
              <li>
                <Link href="/browse/events" className="hover:text-white transition-colors">
                  Find Events
                </Link>
              </li>
              <li>
                <Link href="/auth/signup?role=creative" className="hover:text-white transition-colors">
                  Join as Creative
                </Link>
              </li>
              <li>
                <Link href="/how-it-works/creatives" className="hover:text-white transition-colors">
                  How It Works
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Company</h3>
            <ul className="space-y-2 text-neutral-400">
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <hr className="border-neutral-800 my-8" />

        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-neutral-400">
            © 2024 CollabBridge. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-neutral-400 hover:text-white transition-colors">
              Twitter
            </a>
            <a href="#" className="text-neutral-400 hover:text-white transition-colors">
              LinkedIn
            </a>
            <a href="#" className="text-neutral-400 hover:text-white transition-colors">
              Instagram
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
