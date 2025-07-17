import React, { useState } from 'react';
import { useForm } from 'react-hook-form';

interface SearchFilters {
  expertise: string;
  location: string;
  availability: string;
  rateRange: string;
}

interface Professional {
  id: string;
  name: string;
  title: string;
  expertise: string[];
  location: string;
  rate: number;
  rating: number;
  availability: string;
  image: string;
}

const dummyProfessionals: Professional[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    title: 'Senior UX Designer',
    expertise: ['UX Design', 'UI Design', 'Prototyping'],
    location: 'San Francisco, CA',
    rate: 120,
    rating: 4.9,
    availability: 'Full-time',
    image: 'https://i.pravatar.cc/150?img=1'
  },
  {
    id: '2',
    name: 'Michael Chen',
    title: 'Software Architect',
    expertise: ['Cloud Architecture', 'Microservices', 'DevOps'],
    location: 'Seattle, WA',
    rate: 150,
    rating: 4.8,
    availability: 'Part-time',
    image: 'https://i.pravatar.cc/150?img=2'
  },
  // Add more dummy data as needed
];

export function ProfessionalsSearch() {
  const [professionals, setProfessionals] = useState<Professional[]>(dummyProfessionals);
  const { register, handleSubmit } = useForm<SearchFilters>();

  const onSubmit = (data: SearchFilters) => {
    console.log('Search filters:', data);
    // Implement actual search logic here
  };

  return (
    <div className="space-y-8">
      {/* Search Filters */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-6 card">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label htmlFor="expertise" className="block text-sm font-medium text-gray-700">
              Expertise
            </label>
            <select
              {...register('expertise')}
              className="input mt-1"
              defaultValue=""
            >
              <option value="">All Expertise</option>
              <option value="ux-design">UX Design</option>
              <option value="development">Development</option>
              <option value="devops">DevOps</option>
              <option value="data-science">Data Science</option>
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
            <label htmlFor="availability" className="block text-sm font-medium text-gray-700">
              Availability
            </label>
            <select
              {...register('availability')}
              className="input mt-1"
              defaultValue=""
            >
              <option value="">Any Availability</option>
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
              <option value="contract">Contract</option>
            </select>
          </div>

          <div>
            <label htmlFor="rateRange" className="block text-sm font-medium text-gray-700">
              Rate Range
            </label>
            <select
              {...register('rateRange')}
              className="input mt-1"
              defaultValue=""
            >
              <option value="">Any Rate</option>
              <option value="0-50">$0 - $50/hr</option>
              <option value="51-100">$51 - $100/hr</option>
              <option value="101-150">$101 - $150/hr</option>
              <option value="151+">$151+/hr</option>
            </select>
          </div>
        </div>

        <div>
          <button type="submit" className="btn-primary w-full sm:w-auto">
            Search Professionals
          </button>
        </div>
      </form>

      {/* Results Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {professionals.map((professional) => (
          <div key={professional.id} className="card p-6 hover:shadow-lg transition-all duration-200">
            <div className="flex items-start space-x-4">
              <img
                src={professional.image}
                alt={professional.name}
                className="h-16 w-16 rounded-full object-cover"
              />
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {professional.name}
                </h3>
                <p className="text-sm text-gray-500">{professional.title}</p>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex items-center">
                <span className="text-sm text-gray-500">Location:</span>
                <span className="ml-2 text-sm">{professional.location}</span>
              </div>

              <div>
                <span className="text-sm text-gray-500">Expertise:</span>
                <div className="mt-1 flex flex-wrap gap-2">
                  {professional.expertise.map((skill) => (
                    <span
                      key={skill}
                      className="badge-primary"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-gray-900">
                  ${professional.rate}/hr
                </span>
                <span className="badge-secondary">
                  {professional.availability}
                </span>
              </div>

              <div className="flex items-center">
                <span className="text-yellow-400">★</span>
                <span className="ml-1 text-sm font-medium">
                  {professional.rating.toFixed(1)}
                </span>
              </div>

              <button className="btn-outline w-full mt-4">
                View Profile
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProfessionalsSearch;
