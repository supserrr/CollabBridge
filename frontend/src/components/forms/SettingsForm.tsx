import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/Switch';
import { Select } from '@/components/ui/Select';
import { RadioGroup } from '@/components/ui/RadioGroup';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { useAuth } from '@/hooks/useAuth';
import { apiPut } from '@/utils/api';
import { validatePassword } from '@/utils/auth';
import toast from 'react-hot-toast';

interface SettingsFormData {
  // Account Settings
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
  
  // Notification Settings
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  marketingEmails: boolean;
  eventReminders: boolean;
  messageNotifications: boolean;
  
  // Privacy Settings
  profileVisibility: 'public' | 'private' | 'contacts';
  showLocation: boolean;
  showPhone: boolean;
  showEmail: boolean;
  
  // Preferences
  language: string;
  timezone: string;
  dateFormat: string;
  currency: string;
  
  // Account Actions
  deactivateAccount?: boolean;
}

interface SettingsFormProps {
  onSuccess?: () => void;
}

export const SettingsForm: React.FC<SettingsFormProps> = ({ onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('account');
  const { user } = useAuth();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setError,
  } = useForm<SettingsFormData>({
    defaultValues: {
      emailNotifications: true,
      pushNotifications: true,
      smsNotifications: false,
      marketingEmails: true,
      eventReminders: true,
      messageNotifications: true,
      profileVisibility: 'public',
      showLocation: true,
      showPhone: false,
      showEmail: false,
      language: 'en',
      timezone: 'America/New_York',
      dateFormat: 'MM/DD/YYYY',
      currency: 'USD',
    }
  });

  const newPassword = watch('newPassword');

  const languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Español' },
    { value: 'fr', label: 'Français' },
    { value: 'de', label: 'Deutsch' },
    { value: 'pt', label: 'Português' },
  ];

  const timezoneOptions = [
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/Denver', label: 'Mountain Time (MT)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { value: 'Europe/London', label: 'London (GMT)' },
    { value: 'Europe/Paris', label: 'Paris (CET)' },
  ];

  const visibilityOptions = [
    { 
      value: 'public', 
      label: 'Public', 
      description: 'Anyone can view your profile' 
    },
    { 
      value: 'private', 
      label: 'Private', 
      description: 'Only you can view your profile' 
    },
    { 
      value: 'contacts', 
      label: 'Contacts Only', 
      description: 'Only people you\'ve worked with can view your profile' 
    },
  ];

  const tabs = [
    { id: 'account', label: 'Account', icon: '👤' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'privacy', label: 'Privacy', icon: '🔒' },
    { id: 'preferences', label: 'Preferences', icon: '⚙️' },
  ];

  const onSubmit = async (data: SettingsFormData) => {
    try {
      setLoading(true);
      
      // Validate password change if attempted
      if (data.newPassword) {
        if (!data.currentPassword) {
          setError('currentPassword', { message: 'Current password is required' });
          return;
        }
        if (data.newPassword !== data.confirmPassword) {
          setError('confirmPassword', { message: 'Passwords do not match' });
          return;
        }
        const passwordErrors = validatePassword(data.newPassword);
        if (passwordErrors.length > 0) {
          setError('newPassword', { message: passwordErrors[0] });
          return;
        }
      }

      const response = await apiPut('/users/settings', data);

      if (response.success) {
        toast.success('Settings updated successfully!');
        onSuccess?.();
      } else {
        throw new Error(response.error || 'Failed to update settings');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'account':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Change Password</h3>
            
            <PasswordInput
              {...register('currentPassword')}
              label="Current Password"
              placeholder="Enter your current password"
              error={errors.currentPassword?.message}
            />

            <PasswordInput
              {...register('newPassword')}
              label="New Password"
              placeholder="Enter a new password"
              error={errors.newPassword?.message}
              showStrengthIndicator
            />

            <PasswordInput
              {...register('confirmPassword')}
              label="Confirm New Password"
              placeholder="Confirm your new password"
              error={errors.confirmPassword?.message}
            />

            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="font-medium text-yellow-900 mb-2">⚠️ Danger Zone</h4>
              <p className="text-sm text-yellow-800 mb-3">
                These actions cannot be undone. Please be certain.
              </p>
              <Button variant="danger" size="sm">
                Deactivate Account
              </Button>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Notification Preferences</h3>
            
            <div className="space-y-4">
              <Switch
                {...register('emailNotifications')}
                label="Email Notifications"
                description="Receive notifications via email"
              />
              
              <Switch
                {...register('pushNotifications')}
                label="Push  const onSubmit = async (data: ContactFormData) => {
    try {
      setLoading(true);
      
      // Validate email
      if (!validateEmail(data.email)) {
        toast.error('Please enter a valid email address');
        return;
      }

      const response = await apiPost('/contact', data);

      if (response.success) {
        toast.success('Message sent successfully! We\'ll get back to you soon.');
        reset();
        onSuccess?.();
      } else {
        throw new Error(response.error || 'Failed to send message');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Get in Touch</h2>
        <p className="mt-2 text-gray-600">
          Have questions? We're here to help. Send us a message and we'll respond as soon as possible.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          {...register('name', {
            required: 'Name is required',
            minLength: { value: 2, message: 'Name must be at least 2 characters' }
          })}
          label="Full Name"
          placeholder="Your full name"
          error={errors.name?.message}
          required
        />

        <Input
          {...register('email', {
            required: 'Email is required',
            validate: (value) => validateEmail(value) || 'Please enter a valid email address'
          })}
          type="email"
          label="Email Address"
          placeholder="your.email@example.com"
          error={errors.email?.message}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Select
          {...register('category', {
            required: 'Please select a category'
          })}
          label="Category"
          placeholder="Select a category"
          options={categoryOptions}
          error={errors.category?.message}
          required
        />

        <Input
          {...register('subject', {
            required: 'Subject is required',
            minLength: { value: 5, message: 'Subject must be at least 5 characters' }
          })}
          label="Subject"
          placeholder="Brief description of your inquiry"
          error={errors.subject?.message}
          required
        />
      </div>

      <Textarea
        {...register('message', {
          required: 'Message is required',
          minLength: { value: 10, message: 'Message must be at least 10 characters' }
        })}
        label="Message"
        placeholder="Please provide details about your inquiry..."
        rows={6}
        error={errors.message?.message}
        required
      />

      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Response Times</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• General inquiries: Within 24 hours</li>
          <li>• Technical support: Within 12 hours</li>
          <li>• Billing issues: Within 4 hours</li>
          <li>• Urgent matters: Call us at (555) 123-4567</li>
        </ul>
      </div>

      <Button
        type="submit"
        size="lg"
        loading={loading}
        disabled={loading}
        className="w-full"
      >
        Send Message
      </Button>

      <div className="text-center text-sm text-gray-500">
        You can also email us directly at{' '}
        <a href="mailto:support@collabbridge.com" className="text-brand-600 hover:text-brand-500">
          support@collabbridge.com
        </a>
      </div>
    </form>
  );
};
