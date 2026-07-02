import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowRight, Pencil, Plus, TrendingUp } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { applyApiErrors } from '../../lib/applyApiErrors'
import { formatDate, formatSalary, formatSalaryChange } from '../../lib/format'
import { ApiError } from '../../services/api'
import * as aclService from '../../services/aclService'
import type { SalaryHistory } from '../../types/acl'
import { Alert } from '../ui/Alert'
import { Button } from '../ui/Button'
import { CurrencyInput } from '../ui/CurrencyInput'
import { DatePicker } from '../ui/DatePicker'
import { Input } from '../ui/Input'
import { Textarea } from '../ui/Textarea'

const salaryHistorySchema = z.object({
  new_salary: z.number().min(0, 'O salário deve ser maior ou igual a zero.'),
  effective_date: z.string().min(1, 'Informe a data de vigência.'),
  notes: z.string().max(1000, 'A observação deve ter no máximo 1000 caracteres.').optional(),
})

type SalaryHistoryFormValues = z.infer<typeof salaryHistorySchema>

type UserSalaryHistorySectionProps = {
  userId: number
  currentSalary: string
  readonly?: boolean
}

export function SalaryHistoryCard({
  record,
  onEdit,
}: {
  record: SalaryHistory
  onEdit?: (record: SalaryHistory) => void
}) {
  const change = formatSalaryChange(record.previous_salary, record.new_salary)
  const isInitial = record.previous_salary === null

  return (
    <article className="rounded-lg border border-surface-sunken bg-surface-sunken/40 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-primary-muted px-2.5 py-0.5 text-xs font-medium text-primary">
              Vigência: {formatDate(record.effective_date)}
            </span>
            {isInitial && (
              <span className="inline-flex items-center rounded-full bg-surface px-2.5 py-0.5 text-xs font-medium text-foreground-muted">
                Salário inicial
              </span>
            )}
            {change && (
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  change.startsWith('+')
                    ? 'bg-success/10 text-success'
                    : 'bg-danger/10 text-danger'
                }`}
              >
                <TrendingUp className="size-3" aria-hidden />
                {change}
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 text-sm">
            {isInitial ? (
              <span className="font-semibold text-foreground">{formatSalary(record.new_salary)}</span>
            ) : (
              <>
                <span className="text-foreground-muted">{formatSalary(record.previous_salary)}</span>
                <ArrowRight className="size-4 shrink-0 text-foreground-subtle" aria-hidden />
                <span className="font-semibold text-foreground">{formatSalary(record.new_salary)}</span>
              </>
            )}
          </div>

          {record.notes && (
            <p className="text-sm text-foreground-muted">{record.notes}</p>
          )}

          <p className="text-xs text-foreground-subtle">
            Registrado por {record.changed_by?.name ?? '—'}
          </p>
        </div>

        {onEdit && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onEdit(record)}
            className="w-full shrink-0 sm:w-auto"
          >
            <Pencil className="size-4" aria-hidden />
            Editar
          </Button>
        )}
      </div>
    </article>
  )
}

export function UserSalaryHistorySection({
  userId,
  currentSalary,
  readonly = false,
}: UserSalaryHistorySectionProps) {
  const queryClient = useQueryClient()
  const [formOpen, setFormOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<SalaryHistory | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  const historyQuery = useQuery({
    queryKey: ['users', userId, 'salary-histories'],
    queryFn: () => aclService.listSalaryHistories(userId),
  })

  const defaultValues = useMemo<SalaryHistoryFormValues>(
    () => ({
      new_salary: editingRecord ? Number(editingRecord.new_salary) : Number(currentSalary),
      effective_date: editingRecord?.effective_date ?? '',
      notes: editingRecord?.notes ?? '',
    }),
    [editingRecord, currentSalary],
  )

  const {
    register,
    handleSubmit,
    reset,
    setError,
    control,
    formState: { errors, isSubmitting },
  } = useForm<SalaryHistoryFormValues>({
    resolver: zodResolver(salaryHistorySchema),
    defaultValues,
  })

  const saveMutation = useMutation({
    mutationFn: async (values: SalaryHistoryFormValues) => {
      const payload = {
        new_salary: values.new_salary,
        effective_date: values.effective_date,
        notes: values.notes?.trim() || undefined,
      }

      if (editingRecord) {
        return aclService.updateSalaryHistory(userId, editingRecord.id, payload)
      }

      return aclService.createSalaryHistory(userId, payload)
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['users', userId, 'salary-histories'] }),
        queryClient.invalidateQueries({ queryKey: ['users', userId] }),
        queryClient.invalidateQueries({ queryKey: ['users'] }),
      ])
      closeForm()
    },
    onError: (error) => {
      setFormError(null)

      if (error instanceof ApiError) {
        const message = applyApiErrors(error, setError, 'Não foi possível salvar o registro salarial.')
        if (message) {
          setFormError(message)
        }
        return
      }

      setFormError('Não foi possível salvar o registro salarial.')
    },
  })

  function openCreateForm() {
    setEditingRecord(null)
    setFormError(null)
    reset({
      new_salary: Number(currentSalary),
      effective_date: '',
      notes: '',
    })
    setFormOpen(true)
  }

  function openEditForm(record: SalaryHistory) {
    setEditingRecord(record)
    setFormError(null)
    reset({
      new_salary: Number(record.new_salary),
      effective_date: record.effective_date,
      notes: record.notes ?? '',
    })
    setFormOpen(true)
  }

  function closeForm() {
    setFormOpen(false)
    setEditingRecord(null)
    setFormError(null)
  }

  const histories = historyQuery.data ?? []

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground">Histórico salarial</h2>
          <p className="mt-1 text-sm text-foreground-muted">
            Remuneração atual:{' '}
            <span className="font-semibold text-foreground">{formatSalary(currentSalary)}</span>
          </p>
        </div>

        {!readonly && !formOpen && (
          <Button type="button" onClick={openCreateForm} className="w-full sm:w-auto">
            <Plus className="size-4" aria-hidden />
            Registrar reajuste
          </Button>
        )}
      </div>

      {!readonly && formOpen && (
        <div className="rounded-lg border border-surface-sunken bg-surface-sunken/30 p-4 sm:p-5">
          <h3 className="mb-4 text-sm font-semibold text-foreground">
            {editingRecord ? 'Editar registro salarial' : 'Novo reajuste'}
          </h3>

          <form
            className="space-y-4"
            onSubmit={handleSubmit((values) => saveMutation.mutate(values))}
            noValidate
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Controller
                name="new_salary"
                control={control}
                render={({ field }) => (
                  <CurrencyInput
                    label="Novo salário"
                    value={field.value ?? 0}
                    onChange={field.onChange}
                    error={errors.new_salary?.message}
                  />
                )}
              />
              <Controller
                name="effective_date"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    label="Data de vigência"
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.effective_date?.message}
                  />
                )}
              />
            </div>

            <Textarea
              label="Observação"
              placeholder="Ex.: Reajuste anual, promoção de cargo..."
              error={errors.notes?.message}
              {...register('notes')}
            />

            {formError && <Alert variant="danger">{formError}</Alert>}

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button type="button" variant="ghost" onClick={closeForm}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting || saveMutation.isPending}>
                {editingRecord ? 'Salvar alterações' : 'Registrar reajuste'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {historyQuery.isLoading ? (
        <p className="text-sm text-foreground-muted">Carregando histórico salarial...</p>
      ) : historyQuery.isError ? (
        <Alert variant="danger">Não foi possível carregar o histórico salarial.</Alert>
      ) : histories.length === 0 ? (
        <p className="rounded-lg border border-dashed border-surface-sunken px-4 py-6 text-center text-sm text-foreground-muted">
          Nenhum registro salarial encontrado.
        </p>
      ) : (
        <div className="space-y-3">
          {histories.map((record) => (
            <SalaryHistoryCard
              key={record.id}
              record={record}
              onEdit={readonly ? undefined : openEditForm}
            />
          ))}
        </div>
      )}
    </section>
  )
}
