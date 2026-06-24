export function formatDate(value: string | null | undefined): string {
  if (!value) {
    return '—'
  }

  const [year, month, day] = value.split('-').map(Number)

  if (!year || !month || !day) {
    return '—'
  }

  return new Intl.DateTimeFormat('pt-BR').format(new Date(year, month - 1, day))
}

export function formatSalary(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === '') {
    return '—'
  }

  const amount = typeof value === 'string' ? Number(value) : value

  if (Number.isNaN(amount)) {
    return '—'
  }

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount)
}

export function formatSalaryChange(
  previous: string | number | null | undefined,
  next: string | number,
): string | null {
  if (previous === null || previous === undefined || previous === '') {
    return null
  }

  const previousAmount = typeof previous === 'string' ? Number(previous) : previous
  const nextAmount = typeof next === 'string' ? Number(next) : next

  if (Number.isNaN(previousAmount) || Number.isNaN(nextAmount) || previousAmount === 0) {
    return null
  }

  const percent = ((nextAmount - previousAmount) / previousAmount) * 100
  const formatted = new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(percent / 100)

  return percent >= 0 ? `+${formatted}` : formatted
}

export function toInputDate(value: string | null | undefined): string {
  if (!value) {
    return ''
  }

  return value.slice(0, 10)
}
