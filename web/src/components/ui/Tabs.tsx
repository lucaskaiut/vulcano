import type { ReactNode } from 'react'

export type TabItem = {
  key: string
  label: string
  icon?: ReactNode
  hasError?: boolean
}

type TabsProps = {
  tabs: TabItem[]
  active: string
  onChange: (key: string) => void
}

export function Tabs({ tabs, active, onChange }: TabsProps) {
  return (
    <div
      role="tablist"
      className="flex gap-1 overflow-x-auto rounded-lg bg-surface-sunken p-1"
    >
      {tabs.map((tab) => {
        const isActive = tab.key === active
        return (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.key)}
            className={`flex shrink-0 items-center gap-1.5 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              isActive
                ? 'bg-surface text-foreground shadow-sm'
                : 'text-foreground-muted hover:text-foreground'
            }`}
          >
            {tab.icon}
            {tab.label}
            {tab.hasError && (
              <span
                className="size-1.5 rounded-full bg-danger"
                aria-label="Contém erros"
              />
            )}
          </button>
        )
      })}
    </div>
  )
}
