import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { Navigate, useNavigate, useParams } from '@tanstack/react-router'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { getSector, createSector, updateSector } from '../services/aclService'
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

export function SectorFormPage() {
  const { id } = useParams({ strict: false })
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const sectorId = id ? Number(id) : null
  const isEditing = sectorId !== null && !Number.isNaN(sectorId)
  const [formError, setFormError] = useState<string | null>(null)

  const sectorQuery = useQuery({
    queryKey: ['sectors', sectorId],
    queryFn: () => getSector(sectorId!),
    enabled: isEditing,
  })

  const { register, handleSubmit, reset, setError, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '' },
  })

  useEffect(() => {
    if (!isEditing || !sectorQuery.data) return
    reset({ name: sectorQuery.data.name })
  }, [isEditing, sectorQuery.data, reset])

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      if (isEditing && sectorId) return updateSector(sectorId, values)
      return createSector(values)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['sectors'] })
      navigate({ to: '/sectors' })
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        const message = applyApiErrors(error, setError, 'Erro ao salvar.')
        if (message) setFormError(message)
      }
    },
  })

  if (id && Number.isNaN(sectorId)) return <Navigate to="/sectors" replace />

  return (
    <div>
      <PageHeader title={isEditing ? 'Editar setor' : 'Novo setor'} />
      <Card className="p-6">
        <form className="space-y-4" onSubmit={handleSubmit((v) => mutation.mutate(v))} noValidate>
          <Input label="Nome" error={errors.name?.message} {...register('name')} />
          {formError && <Alert variant="danger">{formError}</Alert>}
          <FormActions cancelHref="/sectors" isSubmitting={isSubmitting || mutation.isPending} />
        </form>
      </Card>
    </div>
  )
}
