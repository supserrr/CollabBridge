import React, { useState, useCallback } from 'react';
import { Button } from './Button';
import { clsx } from 'clsx';

interface Step {
  id: string;
  title: string;
  description?: string;
  component: React.ComponentType<any>;
  validation?: (data: any) => boolean;
}

interface MultiStepFormProps {
  steps: Step[];
  onComplete: (data: any) => void;
  onCancel?: () => void;
  className?: string;
}

export const MultiStepForm: React.FC<MultiStepFormProps> = ({
  steps,
  onComplete,
  onCancel,
  className
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({});
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const updateFormData = useCallback((stepData: any) => {
    setFormData(prev => ({ ...prev, ...stepData }));
  }, []);

  const goToStep = (stepIndex: number) => {
    if (stepIndex <= completedSteps.size || stepIndex === currentStep) {
      setCurrentStep(stepIndex);
    }
  };

  const nextStep = () => {
    const currentStepData = steps[currentStep];
    
    // Validate current step if validation function exists
    if (currentStepData.validation && !currentStepData.validation(formData)) {
      return;
    }

    setCompletedSteps(prev => new Set([...prev, currentStep]));

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(formData);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const CurrentStepComponent = steps[currentStep]?.component;

  return (
    <div className={clsx('w-full', className)}>
      {/* Step Indicator */}
      <div className="mb-8">
        <nav aria-label="Progress">
          <ol className="flex items-center">
            {steps.map((step, index) => (
              <li key={step.id} className={clsx(
                'relative',
                index !== steps.length - 1 && 'pr-8 sm:pr-20'
              )}>
                {/* Connector Line */}
                {index !== steps.length - 1 && (
                  <div 
                    className={clsx(
                      'absolute inset-0 flex items-center',
                      'aria-hidden="true"'
                    )}
                  >
                    <div className={clsx(
                      'h-0.5 w-full',
                      completedSteps.has(index) ? 'bg-brand-600' : 'bg-gray-200'
                    )} />
                  </div>
                )}

                {/* Step Circle */}
                <button
                  onClick={() => goToStep(index)}
                  className={clsx(
                    'relative flex h-10 w-10 items-center justify-center rounded-full',
                    'focus:outline-none focus:ring-2 focus:ring-brand-500',
                    {
                      'bg-brand-600 text-white': currentStep === index || completedSteps.has(index),
                      'border-2 border-gray-300 bg-white text-gray-500': currentStep !== index && !completedSteps.has(index),
                      'cursor-pointer': completedSteps.has(index) || index === currentStep,
                      'cursor-not-allowed': !completedSteps.has(index) && index !== currentStep
                    }
                  )}
                  disabled={!completedSteps.has(index) && index !== currentStep}
                >
                  {completedSteps.has(index) ? (
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </button>

                {/* Step Label */}
                <div className="absolute top-12 -left-4 w-18 text-center">
                  <p className={clsx(
                    'text-sm font-medium',
                    currentStep === index || completedSteps.has(index) 
                      ? 'text-brand-600' 
                      : 'text-gray-500'
                  )}>
                    {step.title}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </nav>
      </div>

      {/* Step Content */}
      <div className="mb-8">
        {steps[currentStep] && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {steps[currentStep].title}
            </h2>
            {steps[currentStep].description && (
              <p className="text-gray-600 mb-6">
                {steps[currentStep].description}
              </p>
            )}
            
            <CurrentStepComponent
              data={formData}
              updateData={updateFormData}
              onNext={nextStep}
              onPrev={prevStep}
            />
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6 border-t">
        <div>
          {currentStep > 0 && (
            <Button
              type="button"
              variant="secondary"
              onClick={prevStep}
            >
              Previous
            </Button>
          )}
        </div>

        <div className="flex space-x-3">
          {onCancel && (
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
            >
              Cancel
            </Button>
          )}
          
          <Button
            type="button"
            onClick={nextStep}
          >
            {currentStep === steps.length - 1 ? 'Complete' : 'Next'}
          </Button>
        </div>
      </div>
    </div>
  );
};
