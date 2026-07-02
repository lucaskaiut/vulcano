import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { Navigate, useNavigate, useParams } from '@tanstack/react-router'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { getEnterprise, createEnterprise, updateEnterprise } from '../services/commissionService'
import { Card } from '../components/ui/Card'
import { FormActions } from '../components/ui/FormActions'
import { Input } from '../components/ui/Input'
import { PageHeader } from '../components/ui/PageHeader'
import { Alert } from '../components/ui/Alert'
import { ApiError } from '../services/api'
import { applyApiErrors } from '../lib/applyApiErrors'

const schema = z.object({
  name: z.string().min(1, 'Informe o nome.'),
})

type FormValues = z.infer<typeof schema>

export function EnterpriseFormPage() {
  const { id } = useParams({ strict: false })
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const enterpriseId = id ? Number(id) : null
  const isEditing = enterpriseId !== null && !Number.isNaN(enterpriseId)
  const [formError, setFormError] = useState<string | null>(null)

  const enterpriseQuery = useQuery({
    queryKey: ['enterprises', enterpriseId],
    queryFn: () => getEnterprise(enterpriseId!),
    enabled: isEditing,
  })

  const { register, handleSubmit, reset, setError, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '' },
  })

  useEffect(() => {
    if (!isEditing || !enterpriseQuery.data) return
    reset({ name: enterpriseQuery.data.name })
  }, [isEditing, enterpriseQuery.data, reset])

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      if (isEditing && enterpriseId) return updateEnterprise(enterpriseId, values)
      return createEnterprise(values)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['enterprises'] })
      navigate({ to: '/enterprises' })
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        const message = applyApiErrors(error, setError, 'Erro ao salvar.')
        if (message) setFormError(message)
      }
    },
  })

  if (id && Number.isNaN(enterpriseId)) return <Navigate to="/enterprises" replace />

  return (
    <div>
      <PageHeader title={isEditing ? 'Editar empreendimento' : 'Novo empreendimento'} />
      <Card className="p-6">
        <form className="space-y-4" onSubmit={handleSubmit((v) => mutation.mutate(v))} noValidate>
          <Input label="Nome" error={errors.name?.message} {...register('name')} />
          {formError && <Alert variant="danger">{formError}</Alert>}
          <FormActions cancelHref="/enterprises" isSubmitting={isSubmitting || mutation.isPending} />
        </form>
      </Card>
    </div>
  )
}
