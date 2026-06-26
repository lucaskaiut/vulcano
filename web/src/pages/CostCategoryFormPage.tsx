import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { Navigate, useNavigate, useParams } from '@tanstack/react-router'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { getCategory, createCategory, updateCategory } from '../services/costService'
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
  type: z.string().min(1, 'Informe o tipo.'),
  active: z.boolean(),
})

type FormValues = z.infer<typeof schema>

export function CostCategoryFormPage() {
  const { id } = useParams({ strict: false })
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const categoryId = id ? Number(id) : null
  const isEditing = categoryId !== null && !Number.isNaN(categoryId)
  const [formError, setFormError] = useState<string | null>(null)

  const categoryQuery = useQuery({
    queryKey: ['cost-categories', categoryId],
    queryFn: () => getCategory(categoryId!),
    enabled: isEditing,
  })

  const { register, handleSubmit, reset, setValue, watch, setError, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', type: '', active: true },
  })

  const active = watch('active')

  useEffect(() => {
    if (!isEditing || !categoryQuery.data) return
    reset({ name: categoryQuery.data.name, type: categoryQuery.data.type, active: categoryQuery.data.active })
  }, [isEditing, categoryQuery.data, reset])

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      if (isEditing && categoryId) return updateCategory(categoryId, values)
      return createCategory(values)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['cost-categories'] })
      navigate({ to: '/cost-categories' })
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        const message = applyApiErrors(error, setError, 'Erro ao salvar.')
        if (message) setFormError(message)
      }
    },
  })

  if (id && Number.isNaN(categoryId)) return <Navigate to="/cost-categories" replace />

  return (
    <div>
      <PageHeader title={isEditing ? 'Editar categoria' : 'Nova categoria'} />
      <Card className="p-6">
        <form className="space-y-4" onSubmit={handleSubmit((v) => mutation.mutate(v))} noValidate>
          <Input label="Nome" error={errors.name?.message} {...register('name')} />
          <Input label="Tipo" error={errors.type?.message} {...register('type')} placeholder="ex: fixed, benefit" />
          <div className="flex items-center gap-2">
            <ToggleSwitch id="active" checked={active} onChange={(v) => setValue('active', v)} ariaLabel="Ativo" />
            <label htmlFor="active" className="text-sm text-foreground-muted">Ativo</label>
          </div>
          {formError && <Alert variant="danger">{formError}</Alert>}
          <FormActions cancelHref="/cost-categories" isSubmitting={isSubmitting || mutation.isPending} />
        </form>
      </Card>
    </div>
  )
}
