import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { applyApiErrors } from '../lib/applyApiErrors'
import * as aclService from '../services/aclService'
import { ApiError } from '../services/api'
import { roleSchema, type RoleFormValues } from '../schemas/aclSchemas'
import { Alert } from '../components/ui/Alert'
import { Card } from '../components/ui/Card'
import { FormActions } from '../components/ui/FormActions'
import { Input } from '../components/ui/Input'
import { PermissionGroupPicker } from '../components/ui/PermissionGroupPicker'
import { PageHeader } from '../components/ui/PageHeader'

export function RoleFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const roleId = id ? Number(id) : null
  const isEditing = roleId !== null && !Number.isNaN(roleId)
  const [formError, setFormError] = useState<string | null>(null)

  const roleQuery = useQuery({
    queryKey: ['roles', roleId],
    queryFn: () => aclService.getRole(roleId!),
    enabled: isEditing,
  })

  const permissionsQuery = useQuery({
    queryKey: ['permissions', 'name:asc'],
    queryFn: () =>
      aclService.listPermissions({
        sorts: [{ column: 'name', direction: 'asc' }],
        per_page: 50,
      }),
  })

  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RoleFormValues>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      name: '',
      description: '',
      permission_ids: [],
    },
  })

  useEffect(() => {
    if (!isEditing || !roleQuery.data) {
      return
    }

    reset({
      name: roleQuery.data.name,
      description: roleQuery.data.description ?? '',
      permission_ids: roleQuery.data.permissions?.map((permission) => permission.id) ?? [],
    })
  }, [isEditing, roleQuery.data, reset])

  const saveMutation = useMutation({
    mutationFn: async (values: RoleFormValues) => {
      const payload = {
        name: values.name,
        description: values.description || undefined,
        permission_ids: values.permission_ids,
      }

      if (isEditing && roleId) {
        return aclService.updateRole(roleId, payload)
      }

      return aclService.createRole(payload)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['roles'] })
      navigate('/roles')
    },
    onError: (error) => {
      setFormError(null)

      if (error instanceof ApiError) {
        const message = applyApiErrors(error, setError, 'Não foi possível salvar o perfil.')
        if (message) {
          setFormError(message)
        }
        return
      }

      setFormError('Não foi possível salvar o perfil.')
    },
  })

  if (isEditing && roleQuery.isLoading) {
    return <p className="text-sm text-foreground-muted">Carregando perfil...</p>
  }

  if (isEditing && roleQuery.isError) {
    return (
      <div className="space-y-4">
        <Alert variant="danger">Perfil não encontrado.</Alert>
        <Link to="/roles" className="text-sm text-primary hover:underline">
          Voltar para perfis
        </Link>
      </div>
    )
  }

  if (id && Number.isNaN(roleId)) {
    return <Navigate to="/roles" replace />
  }

  return (
    <div>
      <PageHeader
        title={isEditing ? 'Editar perfil' : 'Novo perfil'}
        description={
          isEditing
            ? 'Atualize o perfil e suas permissões.'
            : 'Cadastre um novo perfil de acesso.'
        }
      />

      <Card className="p-6">
        <form
          className="space-y-4"
          onSubmit={handleSubmit((values) => saveMutation.mutate(values))}
          noValidate
        >
          <div className="grid gap-4">
            <Input label="Nome" error={errors.name?.message} {...register('name')} />
            <Input
              label="Descrição"
              error={errors.description?.message}
              {...register('description')}
            />
          </div>

          <Controller
            name="permission_ids"
            control={control}
            render={({ field }) => (
              <PermissionGroupPicker
                permissions={permissionsQuery.data?.data ?? []}
                value={field.value}
                onChange={field.onChange}
                error={errors.permission_ids?.message}
              />
            )}
          />

          {formError && <Alert variant="danger">{formError}</Alert>}

          <FormActions
            cancelHref="/roles"
            isSubmitting={isSubmitting || saveMutation.isPending}
          />
        </form>
      </Card>
    </div>
  )
}
