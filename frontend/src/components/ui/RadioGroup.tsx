import React, { forwardRef } from 'react';
import { clsx } from 'clsx';

interface RadioOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

interface RadioGroupProps {
  name: string;
  options: RadioOption[];
  value?: string;
  onChange?: (value: string) => void;
  label?: string;
  error?: string;
  className?: string;
  orientation?: 'vertical' | 'horizontal';
}

export const RadioGroup = forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ name, options, value, onChange, label, error, className, orientation = 'vertical' }, ref) => {
    return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-6">
        <h3 className="text-lg font-medium text-gray-900">Event Information</h3>
        
        <Input
          {...register('title')}
          label="Event Title"
          placeholder="e.g., Sarah & John's Wedding Reception"
          error={errors.title?.message}
          required
        />

        <Textarea
          {...register('description')}
          label="Event Description"
          placeholder="Describe your event, style preferences, and any special requirements..."
          rows={4}
          error={errors.description?.message}
          required
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Select
            {...register('eventType')}
            label="Event Type"
            placeholder="Select event type"
            options={eventTypeOptions}
            error={errors.eventType?.message}
            required
          />

          <div className="space-y-1">
            <label className="label">Event Visibility</label>
            <Checkbox
              {...register('isPublic')}
              label="Make this event public"
              description="Public events can be seen by all professionals"
            />
          </div>
        </div>
      </div>

      {/* Date and Location */}
      <div className="space-y-6">
        <h3 className="text-lg font-medium text-gray-900">Date & Location</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            {...register('date')}
            type="datetime-local"
            label="Start Date & Time"
            error={errors.date?.message}
            required
          />

          <Input
            {...register('endDate')}
            type="datetime-local"
            label="End Date & Time (Optional)"
            error={errors.endDate?.message}
            hint="Leave empty for single-day events"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            {...register('location')}
            label="Location"
            placeholder="e.g., Central Park, New York"
            error={errors.location?.message}
            required
          />

          <Input
            {...register('address')}
            label="Full Address (Optional)"
            placeholder="123 Main St, New York, NY 10001"
            error={errors.address?.message}
            hint="Helps professionals plan logistics"
          />
        </div>
      </div>

      {/* Budget */}
      <div className="space-y-6">
        <h3 className="text-lg font-medium text-gray-900">Budget</h3>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="single"
                {...register('budgetType' as any)}
                className="mr-2"
                defaultChecked
              />
              Single Budget
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="range"
                {...register('budgetType' as any)}
                className="mr-2"
              />
              Budget Range
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              {...register('budget')}
              type="number"
              label="Budget ($)"
              placeholder="5000"
              error={errors.budget?.message}
              hint="Total budget for all services"
            />

            <Input
              {...register('minBudget')}
              type="number"
              label="Minimum Budget ($)"
              placeholder="3000"
              error={errors.minBudget?.message}
              hint="Minimum you're willing to spend"
            />
          </div>

          <Input
            {...register('maxBudget')}
            type="number"
            label="Maximum Budget ($)"
            placeholder="8000"
            error={errors.maxBudget?.message}
            hint="Maximum you're willing to spend"
          />
        </div>
      </div>

      {/* Required Roles */}
      <div className="space-y-6">
        <h3 className="text-lg font-medium text-gray-900">Required Services</h3>
        <p className="text-sm text-gray-600">
          Select the types of creative professionals you need for this event.
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {categoryOptions.map((category) => (
            <Checkbox
              key={category.value}
              {...register('requiredRoles')}
              value={category.value}
              label={category.label}
            />
          ))}
        </div>
        
        {errors.requiredRoles && (
          <p className="error-text">{errors.requiredRoles.message}</p>
        )}
      </div>

      {/* Event Images */}
      <div className="space-y-6">
        <h3 className="text-lg font-medium text-gray-900">Event Images</h3>
        <p className="text-sm text-gray-600">
          Add inspiration photos, venue images, or reference materials to help professionals understand your vision.
        </p>
        
        <FileUpload
          label="Upload Images"
          accept={{
            'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
          }}
          multiple
          maxSize={5 * 1024 * 1024} // 5MB
          onUpload={handleImageUpload}
          onError={handleImageError}
          folder="events"
          hint="Drag & drop up to 10 images. Max 5MB each."
        />
      </div>

      {/* Form Actions */}
      <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
        <Button
          type="submit"
          loading={loading}
          disabled={loading}
          className="flex-1 sm:flex-none sm:min-w-[120px]"
        >
          {mode === 'create' ? 'Create Event' : 'Update Event'}
        </Button>
        
        {onCancel && (
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 sm:flex-none sm:min-w-[120px]"
          >
            Cancel
          </Button>
        )}
        
        <div className="flex-1" />
        
        <Button
          type="button"
          variant="ghost"
          disabled={loading}
          className="sm:min-w-[120px]"
        >
          Save as Draft
        </Button>
      </div>
    </form>
  );
};
      <div ref={ref} className={clsx('w-full', className)}>
        {label && (
          <label className="label">{label}</label>
        )}
        
        <div className={clsx(
          'space-y-3',
          {
            'space-y-3': orientation === 'vertical',
            'flex flex-wrap gap-4': orientation === 'horizontal'
          }
        )}>
          {options.map((option) => (
            <div key={option.value} className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id={`${name}-${option.value}`}
                  name={name}
                  type="radio"
                  value={option.value}
                  checked={value === option.value}
                  onChange={(e) => onChange?.(e.target.value)}
                  disabled={option.disabled}
                  className={clsx(
                    'h-4 w-4 border-gray-300 text-brand-600 focus:ring-brand-500',
                    {
                      'border-red-300': error,
                      'opacity-50 cursor-not-allowed': option.disabled,
                    }
                  )}
                />
              </div>
              <div className="ml-3 text-sm">
                <label 
                  htmlFor={`${name}-${option.value}`}
                  className={clsx(
                    'font-medium',
                    option.disabled ? 'text-gray-400' : 'text-gray-700'
                  )}
                >
                  {option.label}
                </label>
                {option.description && (
                  <p className={clsx(
                    'text-gray-500',
                    option.disabled && 'text-gray-400'
                  )}>
                    {option.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {error && (
          <p className="error-text mt-1">{error}</p>
        )}
      </div>
    );
  }
);

RadioGroup.displayName = 'RadioGroup';
