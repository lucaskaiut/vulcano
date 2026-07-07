import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CalendarDays, Pencil, Plus, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { formatDate, formatDays } from '../../lib/format'
import { ApiError } from '../../services/api'
import * as vacationService from '../../services/vacationService'
import type { VacationBalance, VacationGrant } from '../../types/vacation'
import { Alert } from '../ui/Alert'
import { Button } from '../ui/Button'
import { ConfirmModal } from '../ui/ConfirmModal'
import { DatePicker } from '../ui/DatePicker'
import { Input } from '../ui/Input'
import { Textarea } from '../ui/Textarea'
import { AdditionalDaysSection } from './AdditionalDaysSection'
import { PeriodosAquisitivos } from './PeriodosAquisitivos'

function calcDaysBetween(start: string, end: string): number {
  if (!start || !end) return 0
  const startDate = new Date(start + 'T00:00:00')
  const endDate = new Date(end + 'T00:00:00')
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) return 0
  const diff = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
  return Math.max(1, diff)
}

const grantSchema = z.object({
  start_date: z.string().min(1, 'Informe a data de início.'),
  end_date: z.string().min(1, 'Informe a data de término.'),
  days_used: z.number().int('O valor deve ser um número inteiro.').min(1, 'Informe pelo menos 1 dia.'),
  reason: z.string().max(500, 'Máximo de 500 caracteres.').optional().or(z.literal('')),
})

type GrantFormValues = z.infer<typeof grantSchema>

type UserVacationSectionProps = {
  userId: number
  hireDate?: string | null
  readonly?: boolean
}

function BalanceSummary({ balance }: { balance: VacationBalance }) {
  return (
    <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div>
        <dt className="text-xs font-medium uppercase tracking-wide text-foreground-muted">Saldo disponível</dt>
        <dd className="mt-1 text-lg font-semibold text-foreground">{formatDays(balance.available_days)}</dd>
      </div>
      <div>
        <dt className="text-xs font-medium uppercase tracking-wide text-foreground-muted">Dias adquiridos</dt>
        <dd className="mt-1 text-sm text-foreground">{formatDays(balance.accrued_days)}</dd>
      </div>
      <div>
        <dt className="text-xs font-medium uppercase tracking-wide text-foreground-muted">Dias utilizados</dt>
        <dd className="mt-1 text-sm text-foreground">{formatDays(balance.used_days)}</dd>
      </div>
      <div>
        <dt className="text-xs font-medium uppercase tracking-wide text-foreground-muted">Dias adicionais</dt>
        <dd className="mt-1 text-sm text-foreground">{formatDays(balance.additional_days)}</dd>
      </div>
    </dl>
  )
}

function GrantCard({
  grant,
  onEdit,
  onDelete,
  readonly,
}: {
  grant: VacationGrant
  onEdit: (grant: VacationGrant) => void
  onDelete: (grant: VacationGrant) => void
  readonly: boolean
}) {
  return (
    <article className="rounded-lg border border-surface-sunken bg-surface-sunken/40 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-primary-muted px-2.5 py-0.5 text-xs font-medium text-primary">
            <CalendarDays className="size-3" aria-hidden />
            {formatDate(grant.start_date)} — {formatDate(grant.end_date)}
          </span>
          <span className="text-sm font-semibold text-foreground">{formatDays(grant.days_used)}</span>
          {grant.reason && (
            <span className="text-xs text-foreground-muted">{grant.reason}</span>
          )}
        </div>
        {!readonly && (
          <div className="flex items-center gap-1">
            <Button type="button" variant="ghost" size="sm" onClick={() => onEdit(grant)}>
              <Pencil className="size-3.5" aria-hidden />
              Editar
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => onDelete(grant)}>
              <Trash2 className="size-3.5 text-danger" aria-hidden />
              Excluir
            </Button>
          </div>
        )}
      </div>
    </article>
  )
}

function GrantForm({
  defaultValues,
  onSubmit,
  onCancel,
  isPending,
  submitLabel,
}: {
  defaultValues: GrantFormValues
  onSubmit: (values: GrantFormValues) => void
  onCancel: () => void
  isPending: boolean
  submitLabel: string
}) {
  const form = useForm<GrantFormValues>({
    resolver: zodResolver(grantSchema),
    defaultValues,
  })

  const [formError, setFormError] = useState<string | null>(null)

  const startDate = form.watch('start_date')
  const endDate = form.watch('end_date')

  useEffect(() => {
    if (startDate && endDate) {
      const days = calcDaysBetween(startDate, endDate)
      form.setValue('days_used', days, { shouldValidate: true })
    }
  }, [startDate, endDate, form])

  const handleSubmit = (values: GrantFormValues) => {
    setFormError(null)
    onSubmit(values)
  }

  return (
    <form
      className="space-y-4 rounded-lg border border-surface-sunken bg-surface-sunken/30 p-4"
      onSubmit={form.handleSubmit(handleSubmit)}
      noValidate
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Controller
          name="start_date"
          control={form.control}
          render={({ field }) => (
            <DatePicker
              label="Data de início"
              value={field.value}
              onChange={field.onChange}
              error={form.formState.errors.start_date?.message}
            />
          )}
        />
        <Controller
          name="end_date"
          control={form.control}
          render={({ field }) => (
            <DatePicker
              label="Data de término"
              value={field.value}
              onChange={field.onChange}
              error={form.formState.errors.end_date?.message}
            />
          )}
        />
      </div>
      <Input
        label="Dias utilizados"
        type="number"
        min="1"
        step="1"
        error={form.formState.errors.days_used?.message}
        disabled
        {...form.register('days_used', { valueAsNumber: true })}
      />
      <Textarea
        label="Motivo"
        placeholder="Motivo da concessão de férias (opcional)"
        error={form.formState.errors.reason?.message}
        {...form.register('reason')}
      />
      {formError && <Alert variant="danger">{formError}</Alert>}
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isPending}>
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}

export function UserVacationSection({ userId, hireDate, readonly = false }: UserVacationSectionProps) {
  const queryClient = useQueryClient()
  const [grantFormOpen, setGrantFormOpen] = useState(false)
  const [editingGrant, setEditingGrant] = useState<VacationGrant | null>(null)
  const [deletingGrant, setDeletingGrant] = useState<VacationGrant | null>(null)

  const balanceQuery = useQuery({
    queryKey: ['vacation-balances', 'user', userId],
    queryFn: async () => {
      const [balance, grants] = await Promise.all([
        vacationService.getVacationBalanceForUser(userId),
        vacationService.listVacationGrants(userId),
      ])

      return { balance, grants }
    },
  })

  const invalidateVacationQueries = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['vacation-balances'] }),
      queryClient.invalidateQueries({ queryKey: ['vacation-balances', 'user', userId] }),
    ])
  }

  const createMutation = useMutation({
    mutationFn: (values: GrantFormValues) =>
      vacationService.createVacationGrant({
        user_id: userId,
        start_date: values.start_date,
        end_date: values.end_date,
        days_used: values.days_used,
        reason: values.reason || null,
      }),
    onSuccess: async () => {
      await invalidateVacationQueries()
      setGrantFormOpen(false)
    },
    onError: (error) => {
      if (!(error instanceof ApiError)) return
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, ...values }: GrantFormValues & { id: number }) =>
      vacationService.updateVacationGrant(id, {
        start_date: values.start_date,
        end_date: values.end_date,
        days_used: values.days_used,
        reason: values.reason || null,
      }),
    onSuccess: async () => {
      await invalidateVacationQueries()
      setEditingGrant(null)
    },
    onError: (error) => {
      if (!(error instanceof ApiError)) return
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => vacationService.deleteVacationGrant(id),
    onSuccess: async () => {
      await invalidateVacationQueries()
      setDeletingGrant(null)
    },
    onError: () => {
      setDeletingGrant(null)
    },
  })

  const additionalDaysMutation = useMutation({
    mutationFn: (entries: { description: string; days: number }[]) => {
      if (!balanceQuery.data?.balance) return Promise.resolve(null)

      return vacationService.updateVacationBalance(balanceQuery.data.balance.id, {
        additional_days_entries: entries,
      })
    },
    onSuccess: () => {
      invalidateVacationQueries()
    },
  })

  const balance = balanceQuery.data?.balance
  const grants = useMemo(() => balanceQuery.data?.grants ?? [], [balanceQuery.data?.grants])

  const isFormOpen = grantFormOpen || editingGrant !== null

  if (balanceQuery.isLoading) {
    return <p className="text-sm text-foreground-muted">Carregando informações de férias...</p>
  }

  if (balanceQuery.isError) {
    return <Alert variant="danger">Não foi possível carregar as informações de férias.</Alert>
  }

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-base font-semibold text-foreground">Férias</h2>
        <p className="mt-1 text-sm text-foreground-muted">
          Saldo de férias calculado automaticamente (2,5 dias/mês desde a contratação).
        </p>
      </div>

      {balance ? (
        <>
          <BalanceSummary balance={balance} />

          {!readonly && balance && (
            <AdditionalDaysSection
              entries={balance.additional_days_entries ?? []}
              onChange={(entries) => additionalDaysMutation.mutate(entries)}
            />
          )}
        </>
      ) : hireDate ? (
        <p className="rounded-lg border border-dashed border-surface-sunken px-4 py-6 text-center text-sm text-foreground-muted">
          Os dados de férias estão sendo processados. Atualize a página.
        </p>
      ) : (
        <p className="rounded-lg border border-dashed border-surface-sunken px-4 py-6 text-center text-sm text-foreground-muted">
          Nenhum saldo de férias cadastrado para este colaborador.
        </p>
      )}

      {hireDate && <PeriodosAquisitivos hireDate={hireDate} />}

      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-sm font-semibold text-foreground">Férias concedidas</h3>
          {!readonly && !isFormOpen && (
            <Button type="button" variant="ghost" size="sm" onClick={() => setGrantFormOpen(true)}>
              <Plus className="size-4" aria-hidden />
              Registrar concessão
            </Button>
          )}
        </div>

        {grantFormOpen && (
          <GrantForm
            defaultValues={{ start_date: '', end_date: '', days_used: 1, reason: '' }}
            onSubmit={(values) => createMutation.mutate(values)}
            onCancel={() => setGrantFormOpen(false)}
            isPending={createMutation.isPending}
            submitLabel="Registrar concessão"
          />
        )}

        {editingGrant && (
          <GrantForm
            defaultValues={{
              start_date: editingGrant.start_date,
              end_date: editingGrant.end_date,
              days_used: editingGrant.days_used,
              reason: editingGrant.reason ?? '',
            }}
            onSubmit={(values) => updateMutation.mutate({ id: editingGrant.id, ...values })}
            onCancel={() => setEditingGrant(null)}
            isPending={updateMutation.isPending}
            submitLabel="Atualizar concessão"
          />
        )}

        {grants.length === 0 ? (
          <p className="rounded-lg border border-dashed border-surface-sunken px-4 py-6 text-center text-sm text-foreground-muted">
            Nenhuma concessão de férias registrada.
          </p>
        ) : (
          <div className="space-y-3">
            {grants.map((grant) => (
              <GrantCard
                key={grant.id}
                grant={grant}
                onEdit={setEditingGrant}
                onDelete={setDeletingGrant}
                readonly={readonly}
              />
            ))}
          </div>
        )}
      </div>

      <ConfirmModal
        open={deletingGrant !== null}
        title="Excluir concessão"
        description={`Tem certeza que deseja excluir esta concessão de ${deletingGrant ? formatDays(deletingGrant.days_used) : ''}? Os dias serão devolvidos ao saldo.`}
        confirmLabel="Excluir"
        isLoading={deleteMutation.isPending}
        onConfirm={() => {
          if (deletingGrant) deleteMutation.mutate(deletingGrant.id)
        }}
        onCancel={() => setDeletingGrant(null)}
      />
    </section>
  )
}
