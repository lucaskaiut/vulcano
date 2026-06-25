import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useNavigate } from '@tanstack/react-router'
import { z } from 'zod'
import { applyApiErrors } from '../lib/applyApiErrors'
import * as aclService from '../services/aclService'
import { ApiError } from '../services/api'
import * as vacationRequestService from '../services/vacationRequestService'
import * as workflowService from '../services/workflowService'
import { Alert } from '../components/ui/Alert'
import { Card } from '../components/ui/Card'
import { DatePicker } from '../components/ui/DatePicker'
import { FormActions } from '../components/ui/FormActions'
import { Input } from '../components/ui/Input'
import { PageHeader } from '../components/ui/PageHeader'
import { SearchSelect } from '../components/ui/SearchSelect'

const formSchema = z.object({
  user_id: z.number({ message: 'Selecione o colaborador.' }).min(1, 'Selecione o colaborador.'),
  workflow_id: z.number({ message: 'Selecione o fluxo de aprovação.' }).min(1, 'Selecione o fluxo.'),
  start_date: z.string().min(1, 'Informe a data de início.'),
  end_date: z.string().min(1, 'Informe a data de término.'),
  requested_days: z.number().min(1, 'Informe pelo menos 1 dia.'),
  justification: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

export default function VacationRequestFormPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [formError, setFormError] = useState<string | null>(null)

  const workflowsQuery = useQuery({
    queryKey: ['workflows'],
    queryFn: () => workflowService.listWorkflows(),
  })

  const searchUsers = useCallback(async (query: string) => {
    const response = await aclService.listUsers({
      filters: { search: query.trim() === '' ? undefined : query },
      sorts: [{ column: 'name', direction: 'asc' }],
      per_page: 25,
    })

    return response.data.map((user) => ({
      value: user.id,
      label: user.name,
      description: user.job_title,
    }))
  }, [])

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      user_id: 0,
      workflow_id: 0,
      start_date: '',
      end_date: '',
      requested_days: 10,
      justification: '',
    },
  })

  const activeWorkflows = useMemo(
    () => (workflowsQuery.data ?? []).filter((w) => w.is_active),
    [workflowsQuery.data],
  )

  const saveMutation = useMutation({
    mutationFn: (values: FormValues) =>
      vacationRequestService.createVacationRequest({
        user_id: values.user_id,
        workflow_id: values.workflow_id,
        start_date: values.start_date,
        end_date: values.end_date,
        requested_days: values.requested_days,
        justification: values.justification || undefined,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['vacation-requests'] })
      navigate({ to: '/vacation-requests' })
    },
    onError: (error) => {
      setFormError(null)
      if (error instanceof ApiError) {
        const message = applyApiErrors(error, setError, 'Não foi possível criar a solicitação.')
        if (message) setFormError(message)
        return
      }
      setFormError('Não foi possível criar a solicitação.')
    },
  })

  return (
    <div>
      <PageHeader
        title="Nova solicitação de férias"
        description="Crie uma solicitação de férias que passará pelo fluxo de aprovação."
      />

      <Card className="p-6">
        <form
          className="space-y-4"
          onSubmit={handleSubmit((values) => saveMutation.mutate(values))}
          noValidate
        >
          <Controller
            name="user_id"
            control={control}
            render={({ field }) => (
              <SearchSelect
                label="Colaborador"
                value={field.value > 0 ? field.value : null}
                onChange={(val) => {
                  field.onChange(val)
                }}
                onSearch={searchUsers}
                placeholder="Selecione o colaborador"
                searchPlaceholder="Buscar colaborador..."
                emptyMessage="Digite para buscar colaboradores."
                noResultsMessage="Nenhum colaborador encontrado."
                error={errors.user_id?.message}
              />
            )}
          />

          <Controller
            name="workflow_id"
            control={control}
            render={({ field }) => (
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Fluxo de aprovação
                </label>
                {workflowsQuery.isLoading ? (
                  <p className="text-sm text-foreground-muted">Carregando fluxos...</p>
                ) : activeWorkflows.length === 0 ? (
                  <p className="text-sm text-foreground-muted">Nenhum fluxo ativo disponível.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {activeWorkflows.map((w) => (
                      <button
                        key={w.id}
                        type="button"
                        onClick={() => field.onChange(w.id)}
                        className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                          field.value === w.id
                            ? 'border-primary bg-primary-muted text-primary'
                            : 'border-surface-sunken text-foreground-muted hover:border-primary/40 hover:text-foreground'
                        }`}
                      >
                        {w.name}
                      </button>
                    ))}
                  </div>
                )}
                {errors.workflow_id?.message && (
                  <p className="mt-1 text-sm text-danger">{errors.workflow_id.message}</p>
                )}
              </div>
            )}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Controller
              name="start_date"
              control={control}
              render={({ field }) => (
                <DatePicker
                  label="Data de início"
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.start_date?.message}
                />
              )}
            />

            <Controller
              name="end_date"
              control={control}
              render={({ field }) => (
                <DatePicker
                  label="Data de término"
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.end_date?.message}
                />
              )}
            />
          </div>

          <Input
            label="Dias solicitados"
            type="number"
            min="1"
            error={errors.requested_days?.message}
            {...register('requested_days', { valueAsNumber: true })}
          />

          <Input
            label="Justificativa (opcional)"
            error={errors.justification?.message}
            {...register('justification')}
          />

          {formError && <Alert variant="danger">{formError}</Alert>}

          <FormActions
            cancelHref="/vacation-requests"
            isSubmitting={isSubmitting || saveMutation.isPending}
          />
        </form>
      </Card>
    </div>
  )
}
