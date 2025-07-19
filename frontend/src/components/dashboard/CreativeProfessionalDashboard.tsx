'use client'

import React from 'react'
import Link from 'next/link'
import { MagnifyingGlassIcon, BriefcaseIcon, StarIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline'

const CreativeProfessionalDashboard: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-soft p-6">
        <h2 className="text-xl font-semibold text-neutral-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link 
            href="/browse/events"
            className="flex items-center p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
          >
            <MagnifyingGlassIcon className="w-6 h-6 text-primary-600 mr-3" />
            <div>
              <div className="font-medium text-neutral-900">Browse Events</div>
              <div className="text-sm text-neutral-500">Find new opportunities</div>
            </div>
          </Link>
          
          <Link 
            href="/profile/portfolio"
            className="flex items-center p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
          >
            <BriefcaseIcon className="w-6 h-6 text-secondary-600 mr-3" />
            <div>
              <div className="font-medium text-neutral-900">Update Portfolio</div>
              <div className="text-sm text-neutral-500">Showcase your work</div>
            </div>
          </Link>
          
          <Link 
            href="/applications"
            className="flex items-center p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
          >
            <BriefcaseIcon className="w-6 h-6 text-accent-600 mr-3" />
            <div>
              <div className="font-medium text-neutral-900">My Applications</div>
              <div className="text-sm text-neutral-500">Track your submissions</div>
            </div>
          </Link>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-soft p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-neutral-600">Active Applications</p>
              <p className="text-2xl font-bold text-neutral-900">5</p>
            </div>
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <BriefcaseIcon className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-soft p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-neutral-600">Completed Jobs</p>
              <p className="text-2xl font-bold text-neutral-900">15</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <StarIcon className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-soft p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-neutral-600">Total Earnings</p>
              <p className="text-2xl font-bold text-neutral-900">$12,450</p>
            </div>
            <div className="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center">
              <CurrencyDollarIcon className="w-6 h-6 text-secondary-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-soft p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-neutral-600">Rating</p>
              <p className="text-2xl font-bold text-neutral-900">4.9</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <StarIcon className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Applications */}
      <div className="bg-white rounded-xl shadow-soft p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-neutral-900">Recent Applications</h2>
          <Link href="/applications" className="text-primary-600 hover:text-primary-700 font-medium">
            View all
          </Link>
        </div>
        
        <div className="space-y-4">
          {[1, 2, 3].map((app) => (
            <div key={app} className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
              <div className="flex-1">
                <h3 className="font-medium text-neutral-900">Wedding Photography - Sarah & John</h3>
                <p className="text-sm text-neutral-600">Applied 2 days ago • New York, NY</p>
                <div className="flex items-center mt-2">
                  <span className="badge-warning">Pending</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-neutral-900">$1,500</div>
                <div className="text-sm text-neutral-500">June 15, 2024</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended Events */}
      <div className="bg-white rounded-xl shadow-soft p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-neutral-900">Recommended for You</h2>
          <Link href="/browse/events" className="text-primary-600 hover:text-primary-700 font-medium">
            Browse more
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((event) => (
            <div key={event} className="p-4 border border-neutral-200 rounded-lg hover:shadow-soft transition-shadow">
              <h3 className="font-medium text-neutral-900 mb-2">Corporate Holiday Party</h3>
              <p className="text-sm text-neutral-600 mb-3">Looking for a photographer for our annual holiday celebration...</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="badge-primary">Photography</span>
                  <span className="text-sm text-neutral-500">Dec 20, 2024</span>
                </div>
                <div className="text-sm font-medium text-neutral-900">$800 - $1,200</div>
              </div>
              <div className="mt-3">
                <Link href={`/events/${event}`} className="btn-outline text-sm px-4 py-2">
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default CreativeProfessionalDashboard
