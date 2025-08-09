'use client'

import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

interface ProgressIndicatorProps {
  currentStep: number
  totalSteps: number
}

export function ProgressIndicator({ currentStep, totalSteps }: ProgressIndicatorProps) {
  const progress = (currentStep / totalSteps) * 100

  return (
    <div className="w-full max-w-md mx-auto mb-8">
      <div className="flex justify-between items-center mb-4">
        {Array.from({ length: totalSteps }, (_, i) => {
          const stepNumber = i + 1
          const isActive = stepNumber === currentStep
          const isCompleted = stepNumber < currentStep
          
          return (
            <div
              key={stepNumber}
              className={cn(
                "flex items-center justify-center w-8 h-8 rounded-full border-2 text-sm font-semibold transition-all duration-300",
                isCompleted && "bg-primary border-primary text-primary-foreground",
                isActive && "bg-primary border-primary text-primary-foreground ring-4 ring-primary/20",
                !isActive && !isCompleted && "border-muted-foreground/30 text-muted-foreground"
              )}
            >
              {stepNumber}
            </div>
          )
        })}
      </div>
      
      {/* <Progress value={progress} className="h-2" /> */}
      
      <div className="text-center mt-2 text-sm text-muted-foreground">
        Step {currentStep} of {totalSteps}
      </div>
    </div>
  )
}