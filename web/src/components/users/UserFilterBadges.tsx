import { X } from 'lucide-react'
import { formatDate, formatSalary } from '../../lib/format'
import {
  getActiveUserFilterBadges,
  USER_FILTER_KEYS,
  type UserDrawerFilters,
} from '../../lib/userFilters'
import { Button } from '../ui/Button'

type UserFilterBadgesProps = {
  filters: UserDrawerFilters
  onRemove: (key: (typeof USER_FILTER_KEYS)[number]) => void
  onClearAll: () => void
  valueDisplay?: Partial<Record<(typeof USER_FILTER_KEYS)[number], string>>
}

function formatFilterValue(key: (typeof USER_FILTER_KEYS)[number], value: string): string {
  if (key === 'hired_from' || key === 'hired_to' || key === 'created_from' || key === 'created_to') {
    return formatDate(value)
  }

  if (key === 'salary_min' || key === 'salary_max') {
    return formatSalary(value)
  }

  return value
}

export function UserFilterBadges({ filters, onRemove, onClearAll, valueDisplay }: UserFilterBadgesProps) {
  const badges = getActiveUserFilterBadges(filters)

  if (badges.length === 0) {
    return null
  }

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      {badges.map((badge) => (
        <span
          key={badge.key}
          className="inline-flex items-center gap-1 rounded-full border border-border bg-surface-raised px-2.5 py-1 text-xs text-foreground"
        >
          <span className="text-foreground-muted">{badge.label}:</span>
          <span className="font-medium">{valueDisplay?.[badge.key] ?? formatFilterValue(badge.key, badge.value)}</span>
          <button
            type="button"
            onClick={() => onRemove(badge.key)}
            className="ml-0.5 inline-flex size-4 items-center justify-center rounded-full text-foreground-muted transition-colors hover:bg-surface-sunken hover:text-foreground"
            aria-label={`Remover filtro ${badge.label}`}
          >
            <X className="size-3" aria-hidden />
          </button>
        </span>
      ))}

      <Button type="button" variant="ghost" size="sm" onClick={onClearAll} className="h-7 px-2 text-xs">
        Limpar todos
      </Button>
    </div>
  )
}
