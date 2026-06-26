import { useMutation, useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { Navigate, useNavigate, useParams } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import * as documentService from '../services/documentService'
import { Card } from '../components/ui/Card'
import { FormActions } from '../components/ui/FormActions'
import { Input } from '../components/ui/Input'
import { ToggleSwitch } from '../components/ui/Toggle'
import { PageHeader } from '../components/ui/PageHeader'
import { Alert } from '../components/ui/Alert'
import { ApiError } from '../services/api'
import { applyApiErrors } from '../lib/applyApiErrors'

const schema = z.object({
  name: z.string().min(1, 'Informe o nome do tipo de documento.'),
  expiration_required: z.boolean(),
})

type FormValues = z.infer<typeof schema>

export function DocumentTypeFormPage() {
  const { id } = useParams({ strict: false })
  const navigate = useNavigate()
  const typeId = id ? Number(id) : null
  const isEditing = typeId !== null && !Number.isNaN(typeId)
  const [formError, setFormError] = useState<string | null>(null)

  const typeQuery = useQuery({
    queryKey: ['document-type', typeId],
    queryFn: async () => {
      const types = await documentService.listDocumentTypes()
      return types.find((t) => t.id === typeId) ?? null
    },
    enabled: isEditing,
  })

  const { register, handleSubmit, reset, setValue, watch, setError, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', expiration_required: false },
  })

  const expirationRequired = watch('expiration_required')

  useEffect(() => {
    if (!isEditing || !typeQuery.data) return
    reset({
      name: typeQuery.data.name,
      expiration_required: typeQuery.data.expiration_required,
    })
  }, [isEditing, typeQuery.data, reset])

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      if (isEditing && typeId) {
        return documentService.updateDocumentType(typeId, values)
      }
      return documentService.createDocumentType(values)
    },
    onSuccess: () => {
      navigate({ to: '/document-types' })
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        const message = applyApiErrors(error, setError, 'Erro ao salvar.')
        if (message) setFormError(message)
      }
    },
  })

  if (id && Number.isNaN(typeId)) return <Navigate to="/document-types" replace />

  return (
    <div>
      <PageHeader title={isEditing ? 'Editar tipo de documento' : 'Novo tipo de documento'} />
      <Card className="p-6">
        <form className="space-y-4" onSubmit={handleSubmit((v) => mutation.mutate(v))} noValidate>
          <Input
            label="Nome"
            placeholder="Ex: Contrato Social"
            error={errors.name?.message}
            {...register('name')}
          />

          <div className="flex items-center gap-2">
            <ToggleSwitch id="expiration_required" checked={expirationRequired} onChange={(v) => setValue('expiration_required', v)} ariaLabel="Exige vencimento" />
            <label htmlFor="expiration_required" className="text-sm text-foreground-muted">Exige data de vencimento</label>
          </div>

          {formError && <Alert variant="danger">{formError}</Alert>}
          <FormActions cancelHref="/document-types" isSubmitting={isSubmitting || mutation.isPending} />
        </form>
      </Card>
    </div>
  )
}
