import { Check, ChevronDown, Search, X } from 'lucide-react'
import { useEffect, useId, useMemo, useRef, useState } from 'react'

export type MultiSelectOption<T extends string | number = number> = {
  value: T
  label: string
  description?: string
}

type MultiSelectProps<T extends string | number = number> = {
  label: string
  options: MultiSelectOption<T>[]
  value: T[]
  onChange: (value: T[]) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string
  noResultsMessage?: string
  error?: string
  disabled?: boolean
}

function normalizeText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

export function MultiSelect<T extends string | number = number>({
  label,
  options,
  value,
  onChange,
  placeholder = 'Selecione...',
  searchPlaceholder = 'Buscar...',
  emptyMessage = 'Nenhuma opção disponível.',
  noResultsMessage = 'Nenhum resultado encontrado.',
  error,
  disabled = false,
}: MultiSelectProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const listboxId = useId()
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')

  const selectedOptions = useMemo(
    () => options.filter((option) => value.includes(option.value)),
    [options, value],
  )

  const filteredOptions = useMemo(() => {
    const query = normalizeText(search.trim())

    if (!query) {
      return options
    }

    return options.filter((option) => {
      const haystack = normalizeText(`${option.label} ${option.description ?? ''}`)
      return haystack.includes(query)
    })
  }, [options, search])

  useEffect(() => {
    if (!isOpen) {
      return
    }

    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false)
        setSearch('')
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false)
        setSearch('')
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen) {
      searchInputRef.current?.focus()
    }
  }, [isOpen])

  function toggleOption(optionValue: T) {
    if (value.includes(optionValue)) {
      onChange(value.filter((item) => item !== optionValue))
      return
    }

    onChange([...value, optionValue])
  }

  function removeOption(optionValue: T) {
    onChange(value.filter((item) => item !== optionValue))
  }

  function openDropdown() {
    if (disabled) {
      return
    }

    setIsOpen(true)
  }

  const triggerLabel =
    selectedOptions.length === 0
      ? placeholder
      : `${selectedOptions.length} selecionado${selectedOptions.length === 1 ? '' : 's'}`

  return (
    <div ref={containerRef}>
      <p className="mb-1.5 text-sm font-medium text-foreground-muted">{label}</p>

      {selectedOptions.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {selectedOptions.map((option) => (
            <span
              key={String(option.value)}
              className="inline-flex items-center gap-1 rounded-lg bg-primary-muted px-2.5 py-1 text-sm text-primary shadow-surface"
            >
              <span>{option.label}</span>
              {!disabled && (
                <button
                  type="button"
                  onClick={() => removeOption(option.value)}
                  aria-label={`Remover ${option.label}`}
                  className="rounded p-1.5 transition hover:bg-primary/10"
                >
                  <X className="size-3.5" aria-hidden />
                </button>
              )}
            </span>
          ))}
        </div>
      )}

      <div className="relative">
        <button
          type="button"
          disabled={disabled}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-controls={listboxId}
          onClick={() => (isOpen ? setIsOpen(false) : openDropdown())}
          className={`flex w-full items-center justify-between rounded-lg bg-surface-sunken px-3 py-2.5 text-left text-sm shadow-inset transition hover:bg-surface focus:bg-surface focus:shadow-raised disabled:cursor-not-allowed disabled:opacity-50 ${error ? 'ring-2 ring-danger/30' : ''}`}
        >
          <span className={selectedOptions.length === 0 ? 'text-foreground-subtle' : 'text-foreground'}>
            {triggerLabel}
          </span>
          <ChevronDown
            className={`size-4 shrink-0 text-foreground-muted transition ${isOpen ? 'rotate-180' : ''}`}
            aria-hidden
          />
        </button>

        {isOpen && (
          <div className="absolute z-20 mt-2 w-full rounded-xl bg-surface p-2 shadow-overlay">
            <div className="relative mb-2">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-foreground-subtle"
                aria-hidden
              />
              <input
                ref={searchInputRef}
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={searchPlaceholder}
                className="w-full rounded-lg bg-surface-sunken py-2 pl-9 pr-3 text-sm text-foreground shadow-inset outline-none placeholder:text-foreground-subtle focus:bg-surface focus:shadow-raised"
              />
            </div>

            <ul
              id={listboxId}
              role="listbox"
              aria-multiselectable="true"
              className="max-h-56 space-y-1 overflow-y-auto"
            >
              {options.length === 0 && (
                <li className="px-3 py-2 text-sm text-foreground-muted">{emptyMessage}</li>
              )}

              {options.length > 0 && filteredOptions.length === 0 && (
                <li className="px-3 py-2 text-sm text-foreground-muted">{noResultsMessage}</li>
              )}

              {filteredOptions.map((option) => {
                const isSelected = value.includes(option.value)

                return (
                  <li key={String(option.value)} role="option" aria-selected={isSelected}>
                    <button
                      type="button"
                      onClick={() => toggleOption(option.value)}
                      className={`flex w-full items-start gap-3 rounded-lg px-3 py-2 text-left text-sm transition ${
                        isSelected
                          ? 'bg-primary-muted text-primary'
                          : 'text-foreground hover:bg-surface-sunken'
                      }`}
                    >
                      <span
                        className={`mt-0.5 flex size-4 shrink-0 items-center justify-center rounded ${
                          isSelected ? 'bg-primary text-primary-foreground' : 'bg-surface-sunken shadow-inset'
                        }`}
                        aria-hidden
                      >
                        {isSelected && <Check className="size-3" />}
                      </span>
                      <span className="min-w-0">
                        <span className="block font-medium">{option.label}</span>
                        {option.description && (
                          <span className="block text-xs text-foreground-muted">{option.description}</span>
                        )}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        )}
      </div>

      {error && <p className="mt-1.5 text-sm text-danger">{error}</p>}
    </div>
  )
}
