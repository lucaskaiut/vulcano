import { Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'

type Entry = {
  description: string
  days: number
}

type AdditionalDaysSectionProps = {
  entries: Entry[]
  onChange: (entries: Entry[]) => void
  readonly?: boolean
}

export function AdditionalDaysSection({
  entries,
  onChange,
  readonly = false,
}: AdditionalDaysSectionProps) {
  const [newDescription, setNewDescription] = useState('')
  const [newDays, setNewDays] = useState('')
  const [showForm, setShowForm] = useState(false)

  function addEntry() {
    const days = parseInt(newDays, 10)
    if (!newDescription.trim() || isNaN(days) || days < 1) return

    onChange([...entries, { description: newDescription.trim(), days }])
    setNewDescription('')
    setNewDays('')
  }

  function removeEntry(index: number) {
    onChange(entries.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between">
        <h3 className="text-sm font-semibold text-foreground">Dias Adicionais Adquiridos</h3>
        <span className="text-xs text-foreground-subtle">— férias trabalhadas, etc.</span>
      </div>

      <div className="overflow-hidden rounded-lg border border-surface-sunken">
        <div className="grid grid-cols-[1fr_80px] border-b border-surface-sunken bg-surface-sunken/40 px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-foreground-muted">
          <span>Descrição</span>
          <span className="text-right">Dias</span>
        </div>

        {entries.map((entry, index) => (
          <div
            key={index}
            className="grid grid-cols-[1fr_80px] items-center border-b border-surface-sunken px-4 py-2.5 last:border-b-0"
          >
            <span className="truncate text-sm text-foreground">{entry.description}</span>
            <div className="flex items-center justify-end gap-1">
              <span className="text-sm tabular-nums text-foreground">{entry.days}</span>
              {!readonly && (
                <button
                  type="button"
                  onClick={() => removeEntry(index)}
                  className="rounded p-0.5 text-foreground-muted transition hover:text-danger"
                  aria-label={`Remover ${entry.description}`}
                >
                  <Trash2 className="size-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}

        {!readonly && (showForm || entries.length === 0) && (
          <div className="border-t border-dashed border-surface-sunken px-4 py-2">
            <div className="flex gap-2">
              <Input
                label=""
                placeholder="Descrição"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
              />
              <Input
                label=""
                type="number"
                min="1"
                placeholder="Dias"
                value={newDays}
                onChange={(e) => setNewDays(e.target.value)}
                className="w-20"
              />
              <div className="flex items-end pb-2">
                <Button variant="ghost" size="sm" onClick={addEntry}>
                  <Plus className="size-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {!readonly && !showForm && entries.length > 0 && (
          <div className="flex justify-center border-t border-dashed border-surface-sunken px-4 py-3">
            <Button variant="ghost" size="sm" onClick={() => setShowForm(true)}>
              <Plus className="mr-1 size-4" />
              Adicionar dias adicionais
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
