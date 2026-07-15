import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import { formatDate, maskDate, toInputDate } from '../../lib/format'

type DatePickerProps = {
  label: string
  value: string
  onChange: (value: string) => void
  error?: string
  placeholder?: string
  disabled?: boolean
}

const WEEKDAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']
const MONTHS = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
]

const YEAR_RANGE_START = 1900
const YEAR_RANGE_END = new Date().getFullYear() + 10

function parseDateValue(value: string): Date | null {
  if (!value) return null

  const [year, month, day] = value.split('-').map(Number)

  if (!year || !month || !day) return null

  return new Date(year, month - 1, day)
}

function toIsoDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function isSameDay(left: Date, right: Date): boolean {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  )
}

function isValidDate(day: number, month: number, year: number): boolean {
  const date = new Date(year, month - 1, day)
  return (
    !isNaN(date.getTime()) &&
    date.getDate() === day &&
    date.getMonth() === month - 1 &&
    date.getFullYear() === year
  )
}

function inputDisplayDate(isoValue: string): string {
  if (!isoValue) return ''
  const formatted = formatDate(isoValue)
  return formatted !== '—' ? formatted : ''
}

export function DatePicker({
  label,
  value,
  onChange,
  error,
  placeholder = 'dd/mm/aaaa',
  disabled = false,
}: DatePickerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const yearListRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listboxId = useId()
  const selectedDate = parseDateValue(value)
  const today = useMemo(() => new Date(), [])

  const [isOpen, setIsOpen] = useState(false)
  const [viewDate, setViewDate] = useState(() => selectedDate ?? today)
  const [showYearPicker, setShowYearPicker] = useState(false)
  const [draft, setDraft] = useState<string | null>(null)

  const inputValue = draft !== null ? draft : inputDisplayDate(value)

  useEffect(() => {
    if (!isOpen) return

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

  useEffect(() => {
    if (!showYearPicker || !yearListRef.current) return

    const selectedEl = yearListRef.current.querySelector('[data-selected="true"]')
    if (selectedEl) {
      selectedEl.scrollIntoView({ block: 'center' })
    }
  }, [showYearPicker])

  const calendarDays = useMemo(() => {
    const year = viewDate.getFullYear()
    const month = viewDate.getMonth()
    const firstWeekday = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    return Array.from({ length: firstWeekday + daysInMonth }, (_, index) => {
      if (index < firstWeekday) return null

      return new Date(year, month, index - firstWeekday + 1)
    })
  }, [viewDate])

  const years = useMemo(() => {
    const list: number[] = []
    for (let y = YEAR_RANGE_START; y <= YEAR_RANGE_END; y++) {
      list.push(y)
    }
    return list
  }, [])

  const commitDate = useCallback(
    (isoDate: string) => {
      setDraft(null)
      onChange(isoDate)
    },
    [onChange],
  )

  function openCalendar() {
    if (selectedDate) {
      setViewDate(selectedDate)
    }
    setIsOpen(true)
  }

  function selectDate(date: Date) {
    commitDate(toIsoDate(date))
    setIsOpen(false)
  }

  function clearDate() {
    commitDate('')
    setIsOpen(false)
  }

  function goToPreviousMonth() {
    setViewDate((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))
  }

  function goToNextMonth() {
    setViewDate((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))
  }

  function selectYear(year: number) {
    setViewDate((current) => new Date(year, current.getMonth(), 1))
    setShowYearPicker(false)
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const masked = maskDate(e.target.value)
    setDraft(masked)

    if (masked.length === 10) {
      const [day, month, year] = masked.split('/').map(Number)
      if (isValidDate(day, month, year)) {
        onChange(toIsoDate(new Date(year, month - 1, day)))
      }
    }
  }

  function handleInputBlur() {
    if (draft === null) return

    if (draft.length === 0) {
      setDraft(null)
      if (value) {
        onChange('')
      }
      return
    }

    if (draft.length === 10) {
      const [day, month, year] = draft.split('/').map(Number)
      if (isValidDate(day, month, year)) {
        setDraft(null)
        onChange(toIsoDate(new Date(year, month - 1, day)))
        return
      }
    }

    setDraft(null)
  }

  function handleInputClick() {
    if (disabled) return
    if (!isOpen) {
      openCalendar()
    }
  }

  function handleChevronClick() {
    if (disabled) return
    if (isOpen) {
      setIsOpen(false)
    } else {
      openCalendar()
      setTimeout(() => inputRef.current?.focus(), 0)
    }
  }

  return (
    <div ref={containerRef}>
      <label className="mb-1.5 block text-sm font-medium text-foreground-muted">{label}</label>

      <div className="relative">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            onClick={handleInputClick}
            placeholder={placeholder}
            disabled={disabled}
            aria-expanded={isOpen}
            aria-haspopup="dialog"
            aria-controls={listboxId}
            className={`w-full rounded-lg bg-surface-sunken px-3 py-2.5 pr-10 text-sm shadow-inset transition placeholder:text-foreground-subtle hover:bg-surface focus:bg-surface focus:shadow-raised focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${error ? 'ring-2 ring-danger/30' : ''}`}
          />
          <button
            type="button"
            onClick={handleChevronClick}
            disabled={disabled}
            tabIndex={-1}
            className="absolute right-0 top-0 flex h-full items-center justify-center px-2 text-foreground-muted transition hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ChevronDown
              className={`size-4 shrink-0 transition ${isOpen ? 'rotate-180' : ''}`}
              aria-hidden
            />
          </button>
        </div>

        {isOpen && (
          <div
            id={listboxId}
            role="dialog"
            aria-label={label}
            className="absolute z-30 mt-2 w-full min-w-[280px] rounded-xl bg-surface p-3 shadow-overlay sm:min-w-[300px]"
          >
            {showYearPicker ? (
              <>
                <div className="mb-3 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setShowYearPicker(false)}
                    aria-label="Voltar para calendário"
                    className="flex size-11 items-center justify-center rounded-lg text-foreground-muted transition hover:bg-surface-sunken hover:text-foreground"
                  >
                    <ChevronLeft className="size-4" aria-hidden />
                  </button>
                  <p className="text-sm font-semibold text-foreground">Selecione o ano</p>
                  <div className="size-11" />
                </div>
                <div
                  ref={yearListRef}
                  className="grid max-h-48 grid-cols-4 gap-1 overflow-y-auto"
                >
                  {years.map((year) => (
                    <button
                      key={year}
                      type="button"
                      data-selected={year === viewDate.getFullYear()}
                      onClick={() => selectYear(year)}
                      className={`rounded-lg px-1 py-2 text-center text-sm transition ${
                        year === viewDate.getFullYear()
                          ? 'bg-primary font-semibold text-primary-foreground'
                          : year === today.getFullYear()
                            ? 'font-medium text-primary'
                            : 'text-foreground hover:bg-surface-sunken'
                      }`}
                    >
                      {year}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="mb-3 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={goToPreviousMonth}
                    aria-label="Mês anterior"
                    className="flex size-11 items-center justify-center rounded-lg text-foreground-muted transition hover:bg-surface-sunken hover:text-foreground"
                  >
                    <ChevronLeft className="size-4" aria-hidden />
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowYearPicker(true)}
                    className="flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-semibold text-foreground transition hover:bg-surface-sunken"
                  >
                    {MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
                    <ChevronDown className="size-3.5 text-foreground-muted" aria-hidden />
                  </button>

                  <button
                    type="button"
                    onClick={goToNextMonth}
                    aria-label="Próximo mês"
                    className="flex size-11 items-center justify-center rounded-lg text-foreground-muted transition hover:bg-surface-sunken hover:text-foreground"
                  >
                    <ChevronRight className="size-4" aria-hidden />
                  </button>
                </div>

                <div className="mb-1 grid grid-cols-7 gap-1">
                  {WEEKDAYS.map((weekday) => (
                    <span
                      key={weekday}
                      className="py-1 text-center text-[11px] font-semibold uppercase tracking-wide text-foreground-muted"
                    >
                      {weekday}
                    </span>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((day, index) => {
                    if (!day) {
                      return <span key={`empty-${index}`} aria-hidden />
                    }

                    const isSelected = selectedDate ? isSameDay(day, selectedDate) : false
                    const isToday = isSameDay(day, today)

                    return (
                      <button
                        key={toIsoDate(day)}
                        type="button"
                        onClick={() => selectDate(day)}
                        className={`flex size-11 items-center justify-center rounded-lg text-sm transition ${
                          isSelected
                            ? 'bg-primary font-semibold text-primary-foreground shadow-surface'
                            : isToday
                              ? 'bg-primary-muted font-medium text-primary'
                              : 'text-foreground hover:bg-surface-sunken'
                        }`}
                      >
                        {day.getDate()}
                      </button>
                    )
                  })}
                </div>

                <div className="mt-3 flex items-center justify-between gap-2 border-t border-surface-sunken pt-3">
                  <button
                    type="button"
                    onClick={clearDate}
                    className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-foreground-muted transition hover:bg-surface-sunken hover:text-foreground"
                  >
                    Limpar
                  </button>
                  <button
                    type="button"
                    onClick={() => selectDate(today)}
                    className="rounded-lg bg-primary-muted px-2.5 py-1.5 text-xs font-medium text-primary transition hover:brightness-95"
                  >
                    Hoje
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {error && <p className="mt-1.5 text-sm text-danger">{error}</p>}
      {value && <input type="hidden" value={toInputDate(value)} readOnly />}
    </div>
  )
}
