type ToggleSwitchProps = {
  checked: boolean
  onChange: (checked: boolean) => void
  id?: string
  disabled?: boolean
  ariaLabel: string
  className?: string
}

export function ToggleSwitch({
  checked,
  onChange,
  id,
  disabled = false,
  ariaLabel,
  className = '',
}: ToggleSwitchProps) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${checked ? 'bg-primary' : 'bg-surface-sunken shadow-inset'} disabled:cursor-not-allowed ${className}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow-surface transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`}
      />
    </button>
  )
}

type ToggleProps = {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  id?: string
  disabled?: boolean
  className?: string
}

export function Toggle({
  label,
  checked,
  onChange,
  id,
  disabled = false,
  className = '',
}: ToggleProps) {
  const toggleId = id ?? label

  return (
    <label
      htmlFor={toggleId}
      className={`inline-grid w-fit cursor-pointer grid-cols-[max-content_2.75rem] items-center gap-x-4 text-sm ${disabled ? 'cursor-not-allowed opacity-50' : ''} ${className}`}
    >
      <span className="text-foreground">{label}</span>
      <ToggleSwitch
        id={toggleId}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        ariaLabel={label}
      />
    </label>
  )
}
