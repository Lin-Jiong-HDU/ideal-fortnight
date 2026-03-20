'use client';

import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface Step {
  title: string;
  content: ReactNode;
}

interface StepWizardProps {
  steps: Step[];
  currentStep: number;
  onNext: () => void;
  onPrev: () => void;
  onComplete: () => void;
  isSubmitting?: boolean;
}

export function StepWizard({
  steps,
  currentStep,
  onPrev,
  onNext,
  onComplete,
  isSubmitting = false,
}: StepWizardProps) {
  return (
    <div>
      {/* Progress indicator */}
      <div className="flex items-center justify-center mb-8">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center">
            <div
              className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center font-medium',
                currentStep === index
                  ? 'bg-primary text-primary-foreground'
                  : currentStep > index
                  ? 'bg-green-600 text-white dark:bg-green-700'
                  : 'bg-muted text-muted-foreground'
              )}
            >
              {index + 1}
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'w-16 h-1 mx-2',
                  currentStep > index ? 'bg-green-600 dark:bg-green-700' : 'bg-muted'
                )}
              />
            )}
            {index < steps.length - 1 && (
              <div className="ml-4 text-sm text-muted-foreground">{step.title}</div>
            )}
          </div>
        ))}
      </div>

      {/* Current step content */}
      <div className="mb-6">{steps[currentStep].content}</div>

      {/* Navigation buttons */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrev} disabled={currentStep === 0}>
          上一步
        </Button>
        {currentStep < steps.length - 1 ? (
          <Button onClick={onNext}>下一步</Button>
        ) : (
          <Button onClick={onComplete} disabled={isSubmitting}>
            {isSubmitting ? '创建中...' : '创建'}
          </Button>
        )}
      </div>
    </div>
  );
}
