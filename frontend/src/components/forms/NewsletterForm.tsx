import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { validateEmail } from '@/utils/auth';
import { apiPost } from '@/utils/api';
import toast from 'react-hot-toast';

interface NewsletterFormData {
  email: string;
  name?: string;
  preferences: string[];
}

interface NewsletterFormProps {
  variant?: 'inline' | 'modal' | 'footer';
  onSuccess?: () => void;
}

export const NewsletterForm: React.FC<NewsletterFormProps> = ({
  variant = 'inline',
  onSuccess
}) => {
  const [loading, setLoading] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<NewsletterFormData>();

  const onSubmit = async (data: NewsletterFormData) => {
    try {
      setLoading(true);
      
      if (!validateEmail(data.email)) {
        toast.error('Please enter a valid email address');
        return;
      }

      const response = await apiPost('/newsletter/subscribe', data);

      if (response.success) {
        toast.success('Successfully subscribed to our newsletter!');
        reset();
        onSuccess?.();
      } else {
        throw new Error(response.error || 'Failed to subscribe');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to subscribe');
    } finally {
      setLoading(false);
    }
  };

  if (variant === 'footer') {
    return (
      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 lg:mt-0 lg:flex-shrink-0">
        <div className="flex">
          <Input
            {...register('email', {
              required: 'Email is required',
              validate: (value) => validateEmail(value) || 'Please enter a valid email address'
            })}
            type="email"
            placeholder="Enter your email"
            className="w-full min-w-0 appearance-none rounded-md border border-transparent bg-white px-4 py-2 text-base text-gray-900 placeholder-gray-500 focus:border-white focus:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
            error={errors.email?.message}
          />
          <div className="ml-4 flex-shrink-0">
            <Button
              type="submit"
              loading={loading}
              disabled={loading}
              className="flex w-full items-center justify-center rounded-md border border-transparent bg-brand-600 px-4 py-2 text-base font-medium text-white hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 focus:ring-offset-gray-800"
            >
              Subscribe
            </Button>
          </div>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {variant === 'modal' && (
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Stay Updated</h3>
          <p className="mt-2 text-sm text-gray-600">
            Get the latest event planning tips, platform updates, and special offers.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
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

        {variant !== 'footer' && (
          <Input
            {...register('name')}
            label="Name (Optional)"
            placeholder="Your name"
            error={errors.name?.message}
          />
        )}
      </div>

      {variant === 'modal' && (
        <div className="space-y-3">
          <label className="label">What would you like to receive?</label>
          <div className="space-y-2">
            <Checkbox
              {...register('preferences')}
              value="tips"
              label="Event planning tips & guides"
              defaultChecked
            />
            <Checkbox
              {...register('preferences')}
              value="updates"
              label="Platform updates & new features"
              defaultChecked
            />
            <Checkbox
              {...register('preferences')}
              value="offers"
              label="Special offers & promotions"
            />
            <Checkbox
              {...register('preferences')}
              value="community"
              label="Community highlights & success stories"
            />
          </div>
        </div>
      )}

      <Button
        type="submit"
        loading={loading}
        disabled={loading}
        className="w-full"
      >
        Subscribe to Newsletter
      </Button>

      <p className="text-xs text-gray-500 text-center">
        We respect your privacy. Unsubscribe at any time.
      </p>
    </form>
  );
};
