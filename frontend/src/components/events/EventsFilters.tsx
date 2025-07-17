import React, { useState } from 'react';
import { useForm } from 'react-hook-form';

interface FilterData {
  category: string;
  date: string;
  location: string;
  price: string;
}

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category: string;
  price: number;
  organizer: {
    name: string;
    image: string;
  };
  image: string;
  attendees: number;
}

const dummyEvents: Event[] = [
  {
    id: '1',
    title: 'Design Systems Workshop',
    description: 'Learn how to build and maintain scalable design systems for your organization.',
    date: '2024-02-15',
    time: '10:00 AM',
    location: 'San Francisco, CA',
    category: 'Design',
    price: 199,
    organizer: {
      name: 'Sarah Johnson',
      image: 'https://i.pravatar.cc/150?img=1'
    },
    image: '/images/events/design-workshop.jpg',
    attendees: 45
  },
  {
    id: '2',
    title: 'Cloud Architecture Summit',
    description: 'Deep dive into modern cloud architecture patterns and best practices.',
    date: '2024-02-20',
    time: '9:00 AM',
    location: 'Seattle, WA',
    category: 'Technology',
    price: 299,
    organizer: {
      name: 'Michael Chen',
      image: 'https://i.pravatar.cc/150?img=2'
    },
    image: '/images/events/cloud-summit.jpg',
    attendees: 120
  },
  // Add more dummy events as needed
];

export function EventsFilters() {
  const [events, setEvents] = useState<Event[]>(dummyEvents);
  const { register, handleSubmit } = useForm<FilterData>();

  const onSubmit = (data: FilterData) => {
    console.log('Filter data:', data);
    // Implement actual filtering logic here
  };

  return (
    <div className="space-y-8">
      {/* Filters */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-6 card">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
              Category
            </label>
            <select
              {...register('category')}
              className="input mt-1"
              defaultValue=""
            >
              <option value="">All Categories</option>
              <option value="design">Design</option>
              <option value="technology">Technology</option>
              <option value="business">Business</option>
              <option value="marketing">Marketing</option>
            </select>
          </div>

          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700">
              Date
            </label>
            <select
              {...register('date')}
              className="input mt-1"
              defaultValue=""
            >
              <option value="">Any Date</option>
              <option value="today">Today</option>
              <option value="this-week">This Week</option>
              <option value="this-month">This Month</option>
              <option value="next-month">Next Month</option>
            </select>
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700">
              Location
            </label>
            <input
              type="text"
              {...register('location')}
              className="input mt-1"
              placeholder="Enter location"
            />
          </div>

          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700">
              Price Range
            </label>
            <select
              {...register('price')}
              className="input mt-1"
              defaultValue=""
            >
              <option value="">Any Price</option>
              <option value="free">Free</option>
              <option value="paid">Paid</option>
              <option value="0-50">$0 - $50</option>
              <option value="51-200">$51 - $200</option>
              <option value="201+">$201+</option>
            </select>
          </div>
        </div>

        <div>
          <button type="submit" className="btn-primary w-full sm:w-auto">
            Apply Filters
          </button>
        </div>
      </form>

      {/* Events Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <article key={event.id} className="card overflow-hidden hover:shadow-lg transition-all duration-200">
            <div className="relative h-48">
              <img
                src={event.image}
                alt={event.title}
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4">
                <div className="flex items-center space-x-2">
                  <span className="badge-primary">
                    {event.category}
                  </span>
                  <span className="badge-secondary">
                    {event.attendees} Attendees
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900">
                {event.title}
              </h3>
              
              <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                {event.description}
              </p>

              <div className="mt-4 space-y-3">
                <div className="flex items-center space-x-2 text-sm">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>{event.date} at {event.time}</span>
                </div>

                <div className="flex items-center space-x-2 text-sm">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{event.location}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <img
                      src={event.organizer.image}
                      alt={event.organizer.name}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                    <span className="text-sm text-gray-600">{event.organizer.name}</span>
                  </div>
                  <span className="font-semibold">
                    {event.price === 0 ? 'Free' : `$${event.price}`}
                  </span>
                </div>
              </div>

              <button className="btn-primary w-full mt-4">
                Register Now
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export default EventsFilters;
