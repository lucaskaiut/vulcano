import { Check, ChevronDown, Loader2, Search, X } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'

export type SearchSelectOption = {
  value: number
  label: string
  description?: string
}

type SearchSelectProps = {
  label: string
  value: number | null
  onChange: (value: number | null) => void
  onSearch: (query: string) => Promise<SearchSelectOption[]>
  selectedOption?: SearchSelectOption | null
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string
  noResultsMessage?: string
  clearLabel?: string
  error?: string
  disabled?: boolean
}

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedValue(value), delayMs)

    return () => window.clearTimeout(timer)
  }, [value, delayMs])

  return debouncedValue
}

export function SearchSelect({
  label,
  value,
  onChange,
  onSearch,
  selectedOption = null,
  placeholder = 'Selecione...',
  searchPlaceholder = 'Buscar...',
  emptyMessage = 'Digite para buscar.',
  noResultsMessage = 'Nenhum resultado encontrado.',
  clearLabel = 'Sem seleção',
  error,
  disabled = false,
}: SearchSelectProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const listboxId = useId()
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [options, setOptions] = useState<SearchSelectOption[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [resolvedOption, setResolvedOption] = useState<SearchSelectOption | null>(selectedOption)

  const debouncedSearch = useDebouncedValue(search, 300)

  useEffect(() => {
    setResolvedOption(selectedOption)
  }, [selectedOption])

  useEffect(() => {
    if (!isOpen) {
      return
    }

    let cancelled = false
    setIsLoading(true)

    onSearch(debouncedSearch)
      .then((results) => {
        if (!cancelled) {
          setOptions(results)
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [debouncedSearch, isOpen, onSearch])

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

  const currentOption =
    resolvedOption ??
    options.find((option) => option.value === value) ??
    (value !== null ? { value, label: `#${value}` } : null)

  function openDropdown() {
    if (disabled) {
      return
    }

    setIsOpen(true)
  }

  function selectOption(option: SearchSelectOption | null) {
    setResolvedOption(option)
    onChange(option?.value ?? null)
    setIsOpen(false)
    setSearch('')
  }

  return (
    <div ref={containerRef}>
      <p className="mb-1.5 text-sm font-medium text-foreground-muted">{label}</p>

      {currentOption && (
        <div className="mb-2">
          <span className="inline-flex items-center gap-1 rounded-lg bg-primary-muted px-2.5 py-1 text-sm text-primary shadow-surface">
            <span>{currentOption.label}</span>
            {!disabled && (
              <button
                type="button"
                onClick={() => selectOption(null)}
                aria-label={`Remover ${currentOption.label}`}
                className="rounded p-1.5 transition hover:bg-primary/10"
              >
                <X className="size-3.5" aria-hidden />
              </button>
            )}
          </span>
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
          <span className={currentOption ? 'text-foreground' : 'text-foreground-subtle'}>
            {currentOption ? 'Alterar seleção' : placeholder}
          </span>
          <ChevronDown
            className={`size-4 shrink-0 text-foreground-muted transition ${isOpen ? 'rotate-180' : ''}`}
            aria-hidden
          />
        </button>

        {isOpen && (
          <div className="absolute z-30 mt-2 w-full rounded-xl bg-surface p-2 shadow-overlay">
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

            <ul id={listboxId} role="listbox" className="max-h-56 space-y-1 overflow-y-auto">
              <li role="option" aria-selected={value === null}>
                <button
                  type="button"
                  onClick={() => selectOption(null)}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition ${
                    value === null
                      ? 'bg-primary-muted text-primary'
                      : 'text-foreground hover:bg-surface-sunken'
                  }`}
                >
                  <span>{clearLabel}</span>
                  {value === null && <Check className="size-4" aria-hidden />}
                </button>
              </li>

              {isLoading && (
                <li className="flex items-center gap-2 px-3 py-2 text-sm text-foreground-muted">
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  Buscando...
                </li>
              )}

              {!isLoading && options.length === 0 && (
                <li className="px-3 py-2 text-sm text-foreground-muted">
                  {debouncedSearch.trim() === '' ? emptyMessage : noResultsMessage}
                </li>
              )}

              {!isLoading &&
                options.map((option) => {
                  const isSelected = value === option.value

                  return (
                    <li key={option.value} role="option" aria-selected={isSelected}>
                      <button
                        type="button"
                        onClick={() => selectOption(option)}
                        className={`flex w-full items-start justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm transition ${
                          isSelected
                            ? 'bg-primary-muted text-primary'
                            : 'text-foreground hover:bg-surface-sunken'
                        }`}
                      >
                        <span className="min-w-0">
                          <span className="block font-medium">{option.label}</span>
                          {option.description && (
                            <span className="block text-xs text-foreground-muted">{option.description}</span>
                          )}
                        </span>
                        {isSelected && <Check className="mt-0.5 size-4 shrink-0" aria-hidden />}
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
