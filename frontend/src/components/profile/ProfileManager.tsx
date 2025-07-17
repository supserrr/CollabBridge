import React, { useState } from 'react';
import { useForm } from 'react-hook-form';

interface ProfileData {
  name: string;
  email: string;
  title: string;
  bio: string;
  location: string;
  skills: string[];
  hourlyRate: number;
  availability: string;
  portfolioLinks: string[];
  socialLinks: {
    website?: string;
    linkedin?: string;
    twitter?: string;
    instagram?: string;
  };
}

export function ProfileManager() {
  const [isEditing, setIsEditing] = useState(false);

  // Dummy data - replace with actual user data from your auth system
  const defaultValues: ProfileData = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    title: 'Senior Creative Director',
    bio: 'Creative professional with over 10 years of experience in brand strategy and design direction.',
    location: 'San Francisco, CA',
    skills: ['Brand Strategy', 'Art Direction', 'UI/UX Design', 'Team Leadership'],
    hourlyRate: 150,
    availability: 'Full-time',
    portfolioLinks: [
      'https://portfolio.example.com/project1',
      'https://portfolio.example.com/project2',
    ],
    socialLinks: {
      website: 'https://johndoe.com',
      linkedin: 'https://linkedin.com/in/johndoe',
      twitter: 'https://twitter.com/johndoe',
      instagram: 'https://instagram.com/johndoe',
    },
  };

  const { register, handleSubmit, formState: { errors }, watch } = useForm<ProfileData>({
    defaultValues,
  });

  const onSubmit = (data: ProfileData) => {
    console.log('Profile data:', data);
    // Implement profile update logic here
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Profile</h2>
          <p className="mt-1 text-sm text-gray-600">
            Manage your profile information and visibility
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsEditing(!isEditing)}
          className="btn-secondary"
        >
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Info */}
        <div className="card p-6 space-y-6">
          <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                type="text"
                {...register('name', { required: 'Name is required' })}
                className="input mt-1"
                disabled={!isEditing}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                {...register('email', { required: 'Email is required' })}
                className="input mt-1"
                disabled={!isEditing}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Professional Title
              </label>
              <input
                type="text"
                {...register('title', { required: 'Title is required' })}
                className="input mt-1"
                disabled={!isEditing}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                Location
              </label>
              <input
                type="text"
                {...register('location', { required: 'Location is required' })}
                className="input mt-1"
                disabled={!isEditing}
              />
              {errors.location && (
                <p className="mt-1 text-sm text-destructive">{errors.location.message}</p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                Bio
              </label>
              <textarea
                {...register('bio', { required: 'Bio is required' })}
                rows={4}
                className="input mt-1"
                disabled={!isEditing}
              />
              {errors.bio && (
                <p className="mt-1 text-sm text-destructive">{errors.bio.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Professional Details */}
        <div className="card p-6 space-y-6">
          <h3 className="text-lg font-medium text-gray-900">Professional Details</h3>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="hourlyRate" className="block text-sm font-medium text-gray-700">
                Hourly Rate (USD)
              </label>
              <input
                type="number"
                {...register('hourlyRate', {
                  required: 'Hourly rate is required',
                  min: { value: 0, message: 'Rate must be positive' }
                })}
                className="input mt-1"
                disabled={!isEditing}
              />
              {errors.hourlyRate && (
                <p className="mt-1 text-sm text-destructive">{errors.hourlyRate.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="availability" className="block text-sm font-medium text-gray-700">
                Availability
              </label>
              <select
                {...register('availability')}
                className="input mt-1"
                disabled={!isEditing}
              >
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="not-available">Not Available</option>
              </select>
            </div>
          </div>
        </div>

        {/* Portfolio & Social Links */}
        <div className="card p-6 space-y-6">
          <h3 className="text-lg font-medium text-gray-900">Online Presence</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Portfolio Links</label>
              <div className="mt-2 space-y-2">
                {defaultValues.portfolioLinks.map((link, index) => (
                  <input
                    key={index}
                    type="url"
                    value={link}
                    className="input w-full"
                    disabled={!isEditing}
                    placeholder="https://..."
                  />
                ))}
                {isEditing && (
                  <button
                    type="button"
                    className="btn-secondary mt-2"
                    onClick={() => {/* Add new portfolio link */}}
                  >
                    Add Portfolio Link
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="website" className="block text-sm font-medium text-gray-700">
                  Website
                </label>
                <input
                  type="url"
                  {...register('socialLinks.website')}
                  className="input mt-1"
                  disabled={!isEditing}
                  placeholder="https://..."
                />
              </div>

              <div>
                <label htmlFor="linkedin" className="block text-sm font-medium text-gray-700">
                  LinkedIn
                </label>
                <input
                  type="url"
                  {...register('socialLinks.linkedin')}
                  className="input mt-1"
                  disabled={!isEditing}
                  placeholder="https://linkedin.com/in/..."
                />
              </div>

              <div>
                <label htmlFor="twitter" className="block text-sm font-medium text-gray-700">
                  Twitter
                </label>
                <input
                  type="url"
                  {...register('socialLinks.twitter')}
                  className="input mt-1"
                  disabled={!isEditing}
                  placeholder="https://twitter.com/..."
                />
              </div>

              <div>
                <label htmlFor="instagram" className="block text-sm font-medium text-gray-700">
                  Instagram
                </label>
                <input
                  type="url"
                  {...register('socialLinks.instagram')}
                  className="input mt-1"
                  disabled={!isEditing}
                  placeholder="https://instagram.com/..."
                />
              </div>
            </div>
          </div>
        </div>

        {isEditing && (
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Save Changes
            </button>
          </div>
        )}
      </form>
    </div>
  );
}

export default ProfileManager;
