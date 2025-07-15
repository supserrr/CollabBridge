import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Textarea } from '@/components/ui/Textarea';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { FileUpload } from '@/components/ui/FileUpload';
import { apiPost } from '@/utils/api';
import { Event } from '@/types';
import toast from 'react-hot-toast';

interface ApplicationFormData {
  message: string;
  proposedRate?: number;
}

interface ApplicationFormProps {
  event: Event;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const ApplicationForm: React.FC<ApplicationFormProps> = ({
  event,
  onSuccess,
  onCancel
}) => {
  const [loading, setLoading] = useState(false);
  const [portfolio, setPortfolio] = useState<string[]>([]);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ApplicationFormData>();

  const onSubmit = async (data: ApplicationFormData) => {
    try {
      setLoading(true);
      
      const applicationData = {
        eventId: event.id,
        message: data.message.trim(),
        proposedRate: data.proposedRate,
        portfolio,
      };

      const response = await apiPost(`/events/${event.id}/apply`, applicationData);

      if (response.success) {
        toast.success('Application submitted successfully!');
        onSuccess?.();
      } else {
        throw new Error(response.error || 'Failed to submit application');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  const handlePortfolioUpload = (urls: string[]) => {
    setPortfolio(prev => [...prev, ...urls]);
  };

  const removePortfolioItem = (index: number) => {
    setPortfolio(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Apply to: {event.title}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-sm">
          <div>
            <span className="font-medium text-gray-700">Date:</span>
            <span className="ml-2 text-gray-600">
              {new Date(event.date).toLocaleDateString()}
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Location:</span>
            <span className="ml-2 text-gray-600">{event.location}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Budget:</span>
            <span className="ml-2 text-gray-600">
              {event.budget ? `${event.budget.toLocaleString()}` : 'Not specified'}
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Required Roles:</span>
            <span className="ml-2 text-gray-600">
              {event.requiredRoles.join(', ')}
            </span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Textarea
          {...register('message', {
            required: 'Please provide a message with your application',
            minLength: { value: 50, message: 'Message must be at least 50 characters' }
          })}
          label="Cover Letter / Message"
          placeholder="Introduce yourself and explain why you're the perfect fit for this event. Include relevant experience, your approach to this type of event, and any questions you might have..."
          rows={6}
          error={errors.message?.message}
          required
        />

        <Input
          {...register('proposedRate')}
          type="number"
          label="Proposed Rate (Optional)"
          placeholder="1500"
          error={errors.proposedRate?.message}
          hint="Your proposed rate for this event (if different from your standard rate)"
        />

        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Relevant Portfolio Pieces</h4>
          <p className="text-sm text-gray-600">
            Upload samples of your work that are relevant to this event type. This helps the event planner understand your style and quality.
          </p>
          
          <FileUpload
            accept={{
              'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
            }}
            multiple
            maxSize={5 * 1024 * 1024} // 5MB
            onUpload={handlePortfolioUpload}
            folder="applications"
            hint="Upload up to 10 images showcasing relevant work"
          />

          {portfolio.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {portfolio.map((image, index) => (
                <div key={index} className="relative">
                  <img
                    src={image}
                    alt={`Portfolio ${index + 1}`}
                    className="w-full h-24 object-cover rounded border"
                  />
                  <button
                    type="button"
                    onClick={() => removePortfolioItem(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Application Tips</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Personalize your message to show you've read the event details</li>
            <li>• Highlight relevant experience with similar events</li>
            <li>• Include 3-5 of your best relevant portfolio pieces</li>
            <li>• Be professional but let your personality shine through</li>
            <li>• Ask thoughtful questions about the event</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
          <Button
            type="submit"
            loading={loading}
            disabled={loading}
            className="flex-1 sm:flex-none"
          >
            Submit Application
          </Button>
          
          {onCancel && (
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              disabled={loading}
              className="flex-1 sm:flex-none"
            >
              Cancel
            </Button>
          )}
        </div>
      </form>
    </div>
  );
};
