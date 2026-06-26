import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from '@tanstack/react-router'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { getCost, createCost, updateCost, listCategories } from '../services/costService'
import { listUsers } from '../services/aclService'
import { Card } from '../components/ui/Card'
import { FormActions } from '../components/ui/FormActions'
import { Input } from '../components/ui/Input'
import { PageHeader } from '../components/ui/PageHeader'
import { Select } from '../components/ui/Select'
import { SearchSelect, type SearchSelectOption } from '../components/ui/SearchSelect'
import { ToggleSwitch } from '../components/ui/Toggle'
import { Alert } from '../components/ui/Alert'
import { ApiError } from '../services/api'
import { applyApiErrors } from '../lib/applyApiErrors'

const schema = z.object({
  user_id: z.number({ required_error: 'Selecione o colaborador.' }).min(1),
  cost_category_id: z.number({ required_error: 'Selecione a categoria.' }).min(1),
  amount: z.number({ required_error: 'Informe o valor.' }).min(0.01),
  recurring: z.boolean(),
})

type FormValues = z.infer<typeof schema>

export function CostsFormPage() {
  const { id } = useParams({ strict: false })
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const costId = id ? Number(id) : null
  const isEditing = costId !== null && !Number.isNaN(costId)
  const [formError, setFormError] = useState<string | null>(null)
  const [selectedUser, setSelectedUser] = useState<SearchSelectOption | null>(null)

  const costQuery = useQuery({
    queryKey: ['collaborator-cost', costId],
    queryFn: () => getCost(costId!),
    enabled: isEditing,
  })

  const { data: categories = [] } = useQuery({
    queryKey: ['cost-categories-list'],
    queryFn: listCategories,
  })

  const { control, register, handleSubmit, reset, setValue, watch, setError, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { user_id: 0, cost_category_id: 0, amount: 0, recurring: true },
  })

  const recurring = watch('recurring')

  useEffect(() => {
    if (!isEditing || !costQuery.data) return
    reset({
      user_id: costQuery.data.user_id,
      cost_category_id: costQuery.data.category?.id ?? 0,
      amount: Number(costQuery.data.amount),
      recurring: costQuery.data.recurring,
    })
    if (costQuery.data.user) {
      setSelectedUser({ value: costQuery.data.user.id, label: costQuery.data.user.name })
    }
  }, [isEditing, costQuery.data, reset])

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      if (isEditing && costId) return updateCost(costId, values)
      return createCost({ ...values, reference_month: values.recurring ? null : new Date().toISOString().slice(0, 7) })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['collaborator-costs'] })
      await queryClient.invalidateQueries({ queryKey: ['costs-report'] })
      navigate({ to: '/costs' })
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        const message = applyApiErrors(error, setError, 'Erro ao salvar.')
        if (message) setFormError(message)
      }
    },
  })

  async function searchUsers(query: string): Promise<SearchSelectOption[]> {
    const response = await listUsers({ page: 1, per_page: 50 })
    return response.data
      .filter((u) => !query || u.name.toLowerCase().includes(query.toLowerCase()))
      .map((u) => ({ value: u.id, label: u.name }))
  }

  if (id && Number.isNaN(costId)) return <Navigate to="/costs" replace />

  return (
    <div>
      <PageHeader title={isEditing ? 'Editar custo' : 'Vincular custo'} />
      <Card className="p-6">
        <form className="space-y-4" onSubmit={handleSubmit((v) => mutation.mutate(v))} noValidate>
          {!isEditing && (
            <Controller
              name="user_id"
              control={control}
              render={({ field }) => (
                <SearchSelect
                  label="Colaborador"
                  value={field.value || null}
                  selectedOption={selectedUser}
                  onChange={(val) => { field.onChange(val ?? 0); if (!val) setSelectedUser(null) }}
                  onSearch={searchUsers}
                  error={errors.user_id?.message}
                />
              )}
            />
          )}

          <Controller
            name="cost_category_id"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value || 0}
                options={[{ value: 0, label: 'Selecione uma categoria' }, ...categories.map((c) => ({ value: c.id, label: c.name }))]}
                onChange={(v) => field.onChange(v === 0 ? 0 : v)}
                aria-label="Categoria"
                className={errors.cost_category_id ? 'ring-2 ring-danger/30' : ''}
              />
            )}
          />

          <Input
            label="Valor (R$)"
            type="number"
            step="0.01"
            min="0.01"
            error={errors.amount?.message}
            {...register('amount', { valueAsNumber: true })}
          />

          <div className="flex items-center gap-2">
            <ToggleSwitch id="recurring" checked={recurring} onChange={(v) => setValue('recurring', v)} ariaLabel="Recorrente" />
            <label htmlFor="recurring" className="text-sm text-foreground-muted">Recorrente</label>
          </div>

          {formError && <Alert variant="danger">{formError}</Alert>}
          <FormActions cancelHref="/costs" isSubmitting={isSubmitting || mutation.isPending} />
        </form>
      </Card>
    </div>
  )
}
