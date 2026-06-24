import { Check, ChevronDown } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'

export type SelectOption<T extends string | number = string | number> = {
  value: T
  label: string
}

type SelectProps<T extends string | number = string | number> = {
  value: T
  options: readonly SelectOption<T>[]
  onChange: (value: T) => void
  'aria-label'?: string
  disabled?: boolean
  className?: string
  placement?: 'top' | 'bottom'
}

export function Select<T extends string | number = string | number>({
  value,
  options,
  onChange,
  'aria-label': ariaLabel,
  disabled = false,
  className = '',
  placement = 'bottom',
}: SelectProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null)
  const listboxId = useId()
  const [isOpen, setIsOpen] = useState(false)

  const selectedOption = options.find((option) => option.value === value)

  useEffect(() => {
    if (!isOpen) {
      return
    }

    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  function selectOption(optionValue: T) {
    onChange(optionValue)
    setIsOpen(false)
  }

  const dropdownPosition = placement === 'top' ? 'bottom-full mb-1' : 'top-full mt-1'

  return (
    <div ref={containerRef} className="relative inline-flex">
      <button
        type="button"
        disabled={disabled}
        aria-label={ariaLabel}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={listboxId}
        onClick={() => setIsOpen((open) => !open)}
        className={`inline-flex items-center gap-1 rounded-md bg-surface py-1.5 pl-2.5 pr-2 text-xs font-semibold text-primary shadow-surface outline-none transition hover:bg-surface-sunken focus:bg-surface focus:shadow-raised focus:ring-2 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-50 sm:py-2 sm:pl-3 sm:text-sm ${className}`}
      >
        <span>{selectedOption?.label ?? value}</span>
        <ChevronDown
          className={`size-4 shrink-0 text-primary/70 transition ${isOpen ? 'rotate-180' : ''}`}
          aria-hidden
        />
      </button>

      {isOpen && (
        <ul
          id={listboxId}
          role="listbox"
          aria-label={ariaLabel}
          className={`absolute ${dropdownPosition} right-0 z-30 min-w-full overflow-hidden rounded-md bg-surface p-1 shadow-overlay`}
        >
          {options.map((option) => {
            const isSelected = option.value === value

            return (
              <li key={String(option.value)} role="option" aria-selected={isSelected}>
                <button
                  type="button"
                  onClick={() => selectOption(option.value)}
                  className={`flex w-full items-center justify-between gap-2 rounded-sm px-2.5 py-1.5 text-left text-xs font-medium transition sm:text-sm ${
                    isSelected
                      ? 'bg-primary-muted text-primary'
                      : 'text-foreground hover:bg-surface-sunken'
                  }`}
                >
                  <span>{option.label}</span>
                  {isSelected && <Check className="size-3.5 shrink-0" aria-hidden />}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
