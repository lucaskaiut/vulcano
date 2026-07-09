import { useMemo } from 'react'

function fmt(date: Date): string {
  return date.toLocaleDateString('pt-BR')
}

function parseLocalDate(value: string): Date {
  const [datePart] = value.split('T')
  const [year, month, day] = datePart.split('-').map(Number)
  return new Date(year, month - 1, day)
}

type AcquisitionPeriod = {
  yearNumber: number
  startDate: Date
  endDate: Date
  isCurrent: boolean
  isCompleted: boolean
  progressPercent: number
}

function addYears(date: Date, years: number): Date {
  const result = new Date(date)
  result.setFullYear(result.getFullYear() + years)

  return result
}

function diffDays(from: Date, to: Date): number {
  const ms = to.getTime() - from.getTime()
  return Math.ceil(ms / (1000 * 60 * 60 * 24))
}

type PeriodosAquisitivosProps = {
  hireDate: string
}

export function PeriodosAquisitivos({ hireDate }: PeriodosAquisitivosProps) {
  const periods = useMemo<AcquisitionPeriod[]>(() => {
    const hire = parseLocalDate(hireDate)
    const today = new Date()

    // First period starts at hire date, each is 12 months
    const totalMonths =
      (today.getFullYear() - hire.getFullYear()) * 12 +
      (today.getMonth() - hire.getMonth()) +
      1 // include current potential period

    const result: AcquisitionPeriod[] = []

    for (let i = 0; i < totalMonths; i++) {
      const start = addYears(hire, i)
      const end = addYears(hire, i + 1)
      // Subtract 1 day because the period ends the day before the next one starts
      end.setDate(end.getDate() - 1)

      const isCompleted = today > end
      const isCurrent = today >= start && today <= end

      if (!isCompleted && !isCurrent) {
        break // future periods not shown
      }

      const totalDays = diffDays(start, end) + 1

      let elapsedDays: number
      if (isCompleted) {
        elapsedDays = totalDays
      } else {
        elapsedDays = diffDays(start, today)
      }

      const progressPercent = Math.min(100, Math.round((elapsedDays / totalDays) * 100))

      result.push({
        yearNumber: i + 1,
        startDate: start,
        endDate: end,
        isCurrent,
        isCompleted,
        progressPercent,
      })
    }

    return result
  }, [hireDate])

  if (periods.length === 0) {
    return null
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground">Períodos Aquisitivos</h3>

      <div className="flex gap-4 overflow-x-auto pb-2">
        {periods.map((period) => (
          <div
            key={period.yearNumber}
            className="min-w-[220px] shrink-0 rounded-lg border border-surface-sunken bg-surface-sunken/40 p-4"
          >
            <div className="mb-2 flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                  period.isCompleted
                    ? 'bg-green-100 text-green-700'
                    : 'bg-blue-100 text-blue-700'
                }`}
              >
                {period.isCompleted ? '✓ Concluído' : '▶ Atual'}
                {' — Ano '}
                {period.yearNumber}
              </span>
            </div>

            <p className="text-xs text-foreground-muted">
              {fmt(period.startDate)} — {fmt(period.endDate)}
            </p>

            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-200">
              <div
                className={`h-full rounded-full transition-all ${
                  period.isCompleted ? 'bg-green-500' : 'bg-green-500'
                }`}
                style={{ width: `${period.progressPercent}%` }}
              />
            </div>

            <p
              className={`mt-1 text-xs ${
                period.isCompleted ? 'text-green-600' : 'text-foreground-muted'
              }`}
            >
              {period.progressPercent}% completado
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
