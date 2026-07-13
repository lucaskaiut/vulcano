import { Check } from 'lucide-react'

export type StepperStep = {
  key: string
  label: string
  hasError?: boolean
}

type StepperProps = {
  steps: StepperStep[]
  current: number
  onStepClick?: (index: number) => void
}

export function Stepper({ steps, current, onStepClick }: StepperProps) {
  return (
    <div>
      {/* Mobile: compact progress */}
      <div className="sm:hidden">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-foreground">{steps[current]?.label}</p>
          <p className="text-xs font-medium text-foreground-muted">
            {current + 1} de {steps.length}
          </p>
        </div>
        <div className="mt-2 flex gap-1">
          {steps.map((step, index) => (
            <span
              key={step.key}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                step.hasError
                  ? 'bg-danger'
                  : index <= current
                    ? 'bg-primary'
                    : 'bg-surface-sunken'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Desktop: full stepper */}
      <ol className="hidden items-center sm:flex">
        {steps.map((step, index) => {
          const isCompleted = index < current
          const isCurrent = index === current
          const isClickable = onStepClick && index <= current
          const hasError = step.hasError

          return (
            <li key={step.key} className="flex flex-1 items-center last:flex-none">
              <button
                type="button"
                disabled={!isClickable}
                onClick={() => isClickable && onStepClick(index)}
                className={`group flex items-center gap-2.5 rounded-lg px-1 py-1 text-left outline-none transition ${
                  isClickable ? 'cursor-pointer' : 'cursor-default'
                }`}
              >
                <span
                  className={`flex size-8 shrink-0 items-center justify-center rounded-full border text-sm font-semibold transition ${
                    hasError
                      ? 'border-danger bg-danger-muted text-danger'
                      : isCompleted
                        ? 'border-primary bg-primary text-primary-foreground'
                        : isCurrent
                          ? 'border-primary bg-primary-muted text-primary'
                          : 'border-surface-sunken bg-surface-sunken text-foreground-subtle'
                  }`}
                >
                  {isCompleted && !hasError ? <Check className="size-4" aria-hidden /> : index + 1}
                </span>
                <span
                  className={`hidden text-sm font-medium transition lg:block ${
                    hasError
                      ? 'text-danger'
                      : isCurrent || isCompleted
                        ? 'text-foreground'
                        : 'text-foreground-subtle'
                  }`}
                >
                  {step.label}
                </span>
              </button>
              {index < steps.length - 1 && (
                <span
                  className={`mx-2 h-px flex-1 transition-colors ${
                    index < current ? 'bg-primary' : 'bg-surface-sunken'
                  }`}
                  aria-hidden
                />
              )}
            </li>
          )
        })}
      </ol>
    </div>
  )
}
