import React from 'react'
import { CheckIcon } from '@heroicons/react/24/solid'

interface Step {
  id: string
  title: string
  description: string
  completed: boolean
  current: boolean
  disabled: boolean
}

interface StepperProps {
  steps: Step[]
  onStepClick?: (stepId: string) => void
}

export const Stepper: React.FC<StepperProps> = ({ steps, onStepClick }) => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center flex-1">
            {/* Step Circle */}
            <div className="flex items-center">
              <button
                onClick={() => !step.disabled && onStepClick?.(step.id)}
                disabled={step.disabled}
                className={`
                  flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200
                  ${step.completed 
                    ? 'bg-orange-600 border-green-600 text-white' 
                    : step.current 
                      ? 'bg-blue-600 border-blue-600 text-white' 
                      : step.disabled
                        ? 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed'
                        : 'bg-white border-gray-300 text-gray-600 hover:border-blue-500 hover:text-blue-600'
                  }
                `}
              >
                {step.completed ? (
                  <CheckIcon className="w-5 h-5" />
                ) : (
                  <span className="text-sm font-semibold">{index + 1}</span>
                )}
              </button>
            </div>

            {/* Step Content */}
            <div className="ml-3 flex-1">
              <h3 className={`text-sm font-medium ${
                step.completed 
                  ? 'text-orange-600' 
                  : step.current 
                    ? 'text-blue-600' 
                    : step.disabled
                      ? 'text-gray-400'
                      : 'text-gray-600'
              }`}>
                {step.title}
              </h3>
              <p className={`text-xs ${
                step.disabled ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {step.description}
              </p>
            </div>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-4 ${
                step.completed ? 'bg-orange-600' : 'bg-gray-300'
              }`} />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
