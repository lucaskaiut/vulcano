import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CalendarDays, Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { applyApiErrors } from '../../lib/applyApiErrors'
import { formatDate, formatDays } from '../../lib/format'
import { ApiError } from '../../services/api'
import * as vacationService from '../../services/vacationService'
import type { VacationBalance, VacationGrant } from '../../types/vacation'
import { Alert } from '../ui/Alert'
import { Button } from '../ui/Button'
import { DatePicker } from '../ui/DatePicker'
import { Input } from '../ui/Input'
import { AdditionalDaysSection } from './AdditionalDaysSection'
import { PeriodosAquisitivos } from './PeriodosAquisitivos'

const grantSchema = z.object({
  start_date: z.string().min(1, 'Informe a data de início.'),
  end_date: z.string().min(1, 'Informe a data de término.'),
  days_used: z.number().int('O valor deve ser um número inteiro.').min(1, 'Informe pelo menos 1 dia.'),
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

function GrantCard({ grant }: { grant: VacationGrant }) {
  return (
    <article className="rounded-lg border border-surface-sunken bg-surface-sunken/40 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1 rounded-full bg-primary-muted px-2.5 py-0.5 text-xs font-medium text-primary">
          <CalendarDays className="size-3" aria-hidden />
          {formatDate(grant.start_date)} — {formatDate(grant.end_date)}
        </span>
        <span className="text-sm font-semibold text-foreground">{formatDays(grant.days_used)}</span>
      </div>
    </article>
  )
}

export function UserVacationSection({ userId, hireDate, readonly = false }: UserVacationSectionProps) {
  const queryClient = useQueryClient()
  const [grantFormOpen, setGrantFormOpen] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

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

  const grantForm = useForm<GrantFormValues>({
    resolver: zodResolver(grantSchema),
    defaultValues: { start_date: '', end_date: '', days_used: 10 },
  })

  const invalidateVacationQueries = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['vacation-balances'] }),
      queryClient.invalidateQueries({ queryKey: ['vacation-balances', 'user', userId] }),
    ])
  }

  const grantMutation = useMutation({
    mutationFn: (values: GrantFormValues) =>
      vacationService.createVacationGrant({ user_id: userId, ...values }),
    onSuccess: async () => {
      await invalidateVacationQueries()
      setGrantFormOpen(false)
      grantForm.reset()
      setFormError(null)
    },
    onError: (error) => {
      setFormError(null)
      if (error instanceof ApiError) {
        const message = applyApiErrors(error, grantForm.setError, 'Não foi possível registrar as férias.')
        if (message) setFormError(message)
        return
      }
      setFormError('Não foi possível registrar as férias.')
    },
  })

  const additionalDaysMutation = useMutation({
    mutationFn: (entries: { description: string; days: number }[]) => {
      if (!balanceQuery.data?.balance) return Promise.resolve(null)

      return vacationService.updateVacationBalance(balanceQuery.data.balance.id, {
        additional_days_entries: entries,
      } as any)
    },
    onSuccess: () => {
      invalidateVacationQueries()
    },
  })

  const balance = balanceQuery.data?.balance
  const grants = useMemo(() => balanceQuery.data?.grants ?? [], [balanceQuery.data?.grants])

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
              entries={(balance as any).additional_days_entries ?? []}
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
          {!readonly && !grantFormOpen && (
            <Button type="button" variant="ghost" size="sm" onClick={() => setGrantFormOpen(true)}>
              <Plus className="size-4" aria-hidden />
              Registrar concessão
            </Button>
          )}
        </div>

        {!readonly && grantFormOpen && (
          <form
            className="space-y-4 rounded-lg border border-surface-sunken bg-surface-sunken/30 p-4"
            onSubmit={grantForm.handleSubmit((values) => grantMutation.mutate(values))}
            noValidate
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Controller
                name="start_date"
                control={grantForm.control}
                render={({ field }) => (
                  <DatePicker
                    label="Data de início"
                    value={field.value}
                    onChange={field.onChange}
                    error={grantForm.formState.errors.start_date?.message}
                  />
                )}
              />
              <Controller
                name="end_date"
                control={grantForm.control}
                render={({ field }) => (
                  <DatePicker
                    label="Data de término"
                    value={field.value}
                    onChange={field.onChange}
                    error={grantForm.formState.errors.end_date?.message}
                  />
                )}
              />
            </div>
            <Input
              label="Dias utilizados"
              type="number"
              min="1"
              step="1"
              error={grantForm.formState.errors.days_used?.message}
              {...grantForm.register('days_used', { valueAsNumber: true })}
            />
            {formError && grantFormOpen && <Alert variant="danger">{formError}</Alert>}
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button type="button" variant="ghost" onClick={() => setGrantFormOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={grantMutation.isPending}>
                Registrar concessão
              </Button>
            </div>
          </form>
        )}

        {grants.length === 0 ? (
          <p className="rounded-lg border border-dashed border-surface-sunken px-4 py-6 text-center text-sm text-foreground-muted">
            Nenhuma concessão de férias registrada.
          </p>
        ) : (
          <div className="space-y-3">
            {grants.map((grant) => (
              <GrantCard key={grant.id} grant={grant} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
