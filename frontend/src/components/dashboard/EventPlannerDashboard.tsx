'use client'

import React from 'react'
import Link from 'next/link'
import { PlusIcon, CalendarIcon, UsersIcon, StarIcon } from '@heroicons/react/24/outline'

const EventPlannerDashboard: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-soft p-6">
        <h2 className="text-xl font-semibold text-neutral-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link 
            href="/events/create"
            className="flex items-center p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
          >
            <PlusIcon className="w-6 h-6 text-primary-600 mr-3" />
            <div>
              <div className="font-medium text-neutral-900">Create Event</div>
              <div className="text-sm text-neutral-500">Post a new event listing</div>
            </div>
          </Link>
          
          <Link 
            href="/browse/professionals"
            className="flex items-center p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
          >
            <UsersIcon className="w-6 h-6 text-secondary-600 mr-3" />
            <div>
              <div className="font-medium text-neutral-900">Find Professionals</div>
              <div className="text-sm text-neutral-500">Browse creative talent</div>
            </div>
          </Link>
          
          <Link 
            href="/calendar"
            className="flex items-center p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
          >
            <CalendarIcon className="w-6 h-6 text-accent-600 mr-3" />
            <div>
              <div className="font-medium text-neutral-900">View Calendar</div>
              <div className="text-sm text-neutral-500">Manage your schedule</div>
            </div>
          </Link>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-soft p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-neutral-600">Active Events</p>
              <p className="text-2xl font-bold text-neutral-900">3</p>
            </div>
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <CalendarIcon className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-soft p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-neutral-600">Applications</p>
              <p className="text-2xl font-bold text-neutral-900">12</p>
            </div>
            <div className="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center">
              <UsersIcon className="w-6 h-6 text-secondary-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-soft p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-neutral-600">Completed Events</p>
              <p className="text-2xl font-bold text-neutral-900">8</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <StarIcon className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-soft p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-neutral-600">Average Rating</p>
              <p className="text-2xl font-bold text-neutral-900">4.8</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <StarIcon className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Events */}
      <div className="bg-white rounded-xl shadow-soft p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-neutral-900">Recent Events</h2>
          <Link href="/events" className="text-primary-600 hover:text-primary-700 font-medium">
            View all
          </Link>
        </div>
        
        <div className="space-y-4">
          {[1, 2, 3].map((event) => (
            <div key={event} className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
              <div className="flex-1">
                <h3 className="font-medium text-neutral-900">Corporate Annual Gala {event}</h3>
                <p className="text-sm text-neutral-600">December 15, 2024 • New York, NY</p>
                <div className="flex items-center mt-2">
                  <span className="badge-primary">Photography</span>
                  <span className="badge-secondary ml-2">Catering</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-neutral-900">5 Applications</div>
                <div className="text-sm text-neutral-500">$2,500 - $5,000</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default EventPlannerDashboard
