import { useCallback, useEffect, useMemo, useState } from 'react'
import { DatePicker } from '../ui/DatePicker'
import { FilterDrawer } from '../ui/FilterDrawer'
import { Input } from '../ui/Input'
import { SearchSelect } from '../ui/SearchSelect'
import { listSectors } from '../../services/aclService'
import {
  EMPTY_USER_DRAWER_FILTERS,
  hasUserDrawerFilterErrors,
  validateUserDrawerFilters,
  type UserDrawerFilters,
} from '../../lib/userFilters'

type UserFiltersDrawerProps = {
  open: boolean
  initialFilters: UserDrawerFilters
  onClose: () => void
  onApply: (filters: UserDrawerFilters) => void
  onClear: () => void
}

export function UserFiltersDrawer({
  open,
  initialFilters,
  onClose,
  onApply,
  onClear,
}: UserFiltersDrawerProps) {
  const [draft, setDraft] = useState<UserDrawerFilters>(initialFilters)

  useEffect(() => {
    if (open) {
      setDraft(initialFilters)
    }
  }, [open, initialFilters])

  const errors = useMemo(() => validateUserDrawerFilters(draft), [draft])
  const hasErrors = hasUserDrawerFilterErrors(errors)

  function updateField<K extends keyof UserDrawerFilters>(key: K, value: UserDrawerFilters[K]) {
    setDraft((current) => ({ ...current, [key]: value }))
  }

  function handleApply() {
    if (hasErrors) {
      return
    }

    onApply(draft)
  }

  const searchSectors = useCallback(
    async (query: string) => {
      const sectors = await listSectors()
      const normalizedQuery = query
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')

      return sectors
        .filter((s) => {
          if (query.trim() === '') return true
          const normalizedName = s.name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
          return normalizedName.includes(normalizedQuery)
        })
        .map((s) => ({
          value: s.id,
          label: s.name,
        }))
    },
    [],
  )

  const selectedSectorId = useMemo(() => {
    const id = draft.sector_id ? Number(draft.sector_id) : null
    return id && !Number.isNaN(id) ? id : null
  }, [draft.sector_id])

  const selectedSectorOption = useMemo(() => {
    if (selectedSectorId === null) return null
    return {
      value: selectedSectorId,
      label: `Setor ${selectedSectorId}`,
    }
  }, [selectedSectorId])

  return (
    <FilterDrawer
      open={open}
      title="Filtrar colaboradores"
      onClose={onClose}
      onApply={handleApply}
      applyDisabled={hasErrors}
      onClear={() => {
        setDraft(EMPTY_USER_DRAWER_FILTERS)
        onClear()
      }}
    >
      <div className="space-y-5">
        <Input
          label="E-mail"
          type="email"
          value={draft.email}
          onChange={(event) => updateField('email', event.target.value)}
          placeholder="Buscar por e-mail"
        />

        <SearchSelect
          label="Setor"
          value={selectedSectorId}
          onChange={(value) => updateField('sector_id', value !== null ? String(value) : '')}
          onSearch={searchSectors}
          selectedOption={selectedSectorOption}
          placeholder="Selecione o setor"
          searchPlaceholder="Buscar setor..."
          emptyMessage="Digite para buscar setores."
          noResultsMessage="Nenhum setor encontrado."
          clearLabel="Sem setor"
        />

        <div className="space-y-3">
          <p className="text-sm font-medium text-foreground">Contratação</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <DatePicker
              label="De"
              value={draft.hired_from}
              onChange={(value) => updateField('hired_from', value)}
              error={errors.hired_from}
            />
            <DatePicker
              label="Até"
              value={draft.hired_to}
              onChange={(value) => updateField('hired_to', value)}
              error={errors.hired_to}
            />
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-medium text-foreground">Data de criação</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <DatePicker
              label="De"
              value={draft.created_from}
              onChange={(value) => updateField('created_from', value)}
              error={errors.created_from}
            />
            <DatePicker
              label="Até"
              value={draft.created_to}
              onChange={(value) => updateField('created_to', value)}
              error={errors.created_to}
            />
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-medium text-foreground">Remuneração</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Mínimo"
              type="number"
              min="0"
              step="0.01"
              value={draft.salary_min}
              onChange={(event) => updateField('salary_min', event.target.value)}
              placeholder="0,00"
              error={errors.salary_min}
            />
            <Input
              label="Máximo"
              type="number"
              min="0"
              step="0.01"
              value={draft.salary_max}
              onChange={(event) => updateField('salary_max', event.target.value)}
              placeholder="0,00"
              error={errors.salary_max}
            />
          </div>
        </div>
      </div>
    </FilterDrawer>
  )
}
