import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { Navigate, useNavigate, useParams } from '@tanstack/react-router'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { getProvisionRule, createProvisionRule, updateProvisionRule } from '../services/costService'
import { Card } from '../components/ui/Card'
import { FormActions } from '../components/ui/FormActions'
import { Input } from '../components/ui/Input'
import { PageHeader } from '../components/ui/PageHeader'
import { Alert } from '../components/ui/Alert'
import { ToggleSwitch } from '../components/ui/Toggle'
import { ApiError } from '../services/api'
import { applyApiErrors } from '../lib/applyApiErrors'

const schema = z.object({
  name: z.string().min(1, 'Informe o nome.'),
  percentage: z.number().min(0, 'O percentual deve ser maior ou igual a zero.').max(100, 'O percentual não pode ser maior que 100.'),
  active: z.boolean(),
})

type FormValues = z.infer<typeof schema>

export function ProvisionRuleFormPage() {
  const { id } = useParams({ strict: false })
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const ruleId = id ? Number(id) : null
  const isEditing = ruleId !== null && !Number.isNaN(ruleId)
  const [formError, setFormError] = useState<string | null>(null)

  const ruleQuery = useQuery({
    queryKey: ['provision-rules', ruleId],
    queryFn: () => getProvisionRule(ruleId!),
    enabled: isEditing,
  })

  const { register, handleSubmit, reset, setValue, watch, setError, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', percentage: 0, active: true },
  })

  const active = watch('active')

  useEffect(() => {
    if (!isEditing || !ruleQuery.data) return
    reset({
      name: ruleQuery.data.name,
      percentage: Number(ruleQuery.data.percentage),
      active: ruleQuery.data.active,
    })
  }, [isEditing, ruleQuery.data, reset])

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      if (isEditing && ruleId) return updateProvisionRule(ruleId, values)
      return createProvisionRule(values)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['provision-rules'] })
      navigate({ to: '/provision-rules' })
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        const message = applyApiErrors(error, setError, 'Erro ao salvar.')
        if (message) setFormError(message)
      }
    },
  })

  if (id && Number.isNaN(ruleId)) return <Navigate to="/provision-rules" replace />

  return (
    <div>
      <PageHeader title={isEditing ? 'Editar regra' : 'Nova regra'} />
      <Card className="p-6">
        <form className="space-y-4" onSubmit={handleSubmit((v) => mutation.mutate(v))} noValidate>
          <Input label="Nome" error={errors.name?.message} {...register('name')} />
          <Input
            label="Percentual (%)"
            type="number"
            step="0.0001"
            min="0"
            max="100"
            error={errors.percentage?.message}
            {...register('percentage', { valueAsNumber: true })}
          />
          <div className="flex items-center gap-2">
            <ToggleSwitch id="active" checked={active} onChange={(v) => setValue('active', v)} ariaLabel="Ativo" />
            <label htmlFor="active" className="text-sm text-foreground-muted">Ativo</label>
          </div>
          {formError && <Alert variant="danger">{formError}</Alert>}
          <FormActions cancelHref="/provision-rules" isSubmitting={isSubmitting || mutation.isPending} />
        </form>
      </Card>
    </div>
  )
}
