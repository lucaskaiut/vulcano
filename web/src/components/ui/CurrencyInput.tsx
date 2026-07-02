import { useCallback, useEffect, useRef, useState } from 'react'

type CurrencyInputProps = {
  label?: string
  value: number
  onChange: (value: number) => void
  error?: string
  disabled?: boolean
  name?: string
}

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(cents / 100)
}

function formatEditing(cents: number): string {
  const reais = Math.floor(cents / 100)
  const centavos = cents % 100
  return `${reais},${String(centavos).padStart(2, '0')}`
}

export function CurrencyInput({
  label,
  value,
  onChange,
  error,
  disabled = false,
  name,
}: CurrencyInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [focused, setFocused] = useState(false)
  const centsRef = useRef(Math.round((value || 0) * 100))

  useEffect(() => {
    centsRef.current = Math.round((value || 0) * 100)
  }, [value])

  const updateCents = useCallback(
    (newCents: number) => {
      centsRef.current = newCents
      onChange(newCents / 100)
    },
    [onChange],
  )

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    const key = e.key
    const cents = centsRef.current

    if (key >= '0' && key <= '9') {
      e.preventDefault()
      const digit = parseInt(key)
      const newCents = Math.min(cents * 10 + digit, 999999999)
      updateCents(newCents)
    } else if (key === 'Backspace') {
      e.preventDefault()
      const newCents = Math.floor(cents / 10)
      updateCents(newCents)
    } else if (key === 'Delete') {
      e.preventDefault()
      updateCents(0)
    } else if (
      key === 'ArrowLeft' ||
      key === 'ArrowRight' ||
      key === 'ArrowUp' ||
      key === 'ArrowDown' ||
      key === 'Tab' ||
      key === 'Enter' ||
      key === 'Home' ||
      key === 'End'
    ) {
      return
    } else {
      e.preventDefault()
    }
  }

  function handleFocus() {
    setFocused(true)
    setTimeout(() => inputRef.current?.select(), 0)
  }

  function handleBlur() {
    setFocused(false)
  }

  const cents = centsRef.current
  const displayValue = focused ? formatEditing(cents) : formatCurrency(cents)
  const isZero = cents === 0

  return (
    <div>
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-foreground-muted">
          {label}
        </label>
      )}
      <input
        ref={inputRef}
        type="text"
        inputMode="none"
        name={name}
        disabled={disabled}
        value={displayValue}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        autoComplete="off"
        readOnly
        className={`w-full rounded-lg bg-surface-sunken px-3 py-2.5 text-foreground shadow-inset outline-none cursor-text transition focus:bg-surface focus:shadow-raised disabled:cursor-not-allowed disabled:opacity-50 ${
          isZero && !focused ? 'text-foreground-subtle' : ''
        } ${error ? 'ring-2 ring-danger/30' : ''}`}
      />
      {error && <p className="mt-1.5 text-sm text-danger">{error}</p>}
    </div>
  )
}
