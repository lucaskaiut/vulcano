export function formatDate(value: string | null | undefined): string {
  if (!value) {
    return '—'
  }

  const parts = value.slice(0, 10).split('-')
  if (parts.length !== 3) {
    return '—'
  }

  const [year, month, day] = parts.map(Number)
  if (!year || !month || !day) {
    return '—'
  }

  const date = new Date(year, month - 1, day)

  return new Intl.DateTimeFormat('pt-BR').format(date)
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) {
    return '—'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return '—'
  }

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date)
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

export function maskCpf(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  return digits
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1-$2')
}

export function maskPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 2) return digits
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

export function maskCep(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8)
  if (digits.length <= 5) return digits
  return `${digits.slice(0, 5)}-${digits.slice(5)}`
}

export function maskDate(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8)
  if (digits.length <= 2) return digits
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`
}

export function maskCnpj(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 14)
  return digits
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
}

export function formatDays(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return '—'
  }

  const rounded = Math.round(value * 10) / 10
  const formatted = rounded.toFixed(1).replace('.', ',')

  return `${formatted} ${value === 1 ? 'dia' : 'dias'}`
}
