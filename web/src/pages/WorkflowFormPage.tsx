import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from '@tanstack/react-router'
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react'
import { z } from 'zod'
import { applyApiErrors } from '../lib/applyApiErrors'
import { ApiError } from '../services/api'
import * as workflowService from '../services/workflowService'
import { Alert } from '../components/ui/Alert'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { FormActions } from '../components/ui/FormActions'
import { Input } from '../components/ui/Input'
import { PageHeader } from '../components/ui/PageHeader'

const workflowSchema = z.object({
  name: z.string().min(1, 'Informe o nome do fluxo.'),
  description: z.string().optional(),
  is_active: z.boolean(),
})

type WorkflowFormValues = z.infer<typeof workflowSchema>

type StepDraft = {
  id: number
  name: string
}

let draftIdCounter = -1
function nextDraftId() {
  return draftIdCounter--
}

export function WorkflowFormPage() {
  const { id } = useParams({ strict: false })
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const workflowId = id ? Number(id) : null
  const isEditing = workflowId !== null && !Number.isNaN(workflowId)
  const [formError, setFormError] = useState<string | null>(null)
  const [stepDrafts, setStepDrafts] = useState<StepDraft[]>([])

  const workflowQuery = useQuery({
    queryKey: ['workflows', workflowId],
    queryFn: () => workflowService.getWorkflow(workflowId!),
    enabled: isEditing,
  })

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<WorkflowFormValues>({
    resolver: zodResolver(workflowSchema),
    defaultValues: { name: '', description: '', is_active: true },
  })

  useEffect(() => {
    if (!isEditing || !workflowQuery.data?.steps) return
    setStepDrafts(
      workflowQuery.data.steps.map((s) => ({ id: s.id, name: s.name })),
    )
  }, [isEditing, workflowQuery.data])

  useEffect(() => {
    if (!isEditing || !workflowQuery.data) return
    reset({
      name: workflowQuery.data.name,
      description: workflowQuery.data.description ?? '',
      is_active: workflowQuery.data.is_active,
    })
  }, [isEditing, workflowQuery.data, reset])

  const invalidate = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['workflows'] })
  }, [queryClient])

  const saveMutation = useMutation({
    mutationFn: async (values: WorkflowFormValues) => {
      const payload = {
        name: values.name,
        description: values.description || undefined,
        is_active: values.is_active,
      }

      if (isEditing && workflowId) {
        return workflowService.updateWorkflow(workflowId, payload)
      }
      return workflowService.createWorkflow(payload)
    },
    onSuccess: async (saved) => {
      await invalidate()
      if (!isEditing) {
        navigate({ to: `/workflows/${saved.id}/editar` })
      }
    },
    onError: (error) => {
      setFormError(null)
      if (error instanceof ApiError) {
        const message = applyApiErrors(error, setError, 'Não foi possível salvar o fluxo.')
        if (message) setFormError(message)
        return
      }
      setFormError('Não foi possível salvar o fluxo.')
    },
  })

  const addStepDraft = () => {
    setStepDrafts((prev) => [...prev, { id: nextDraftId(), name: '' }])
  }

  const updateStepDraft = (draftId: number, name: string) => {
    setStepDrafts((prev) => prev.map((s) => (s.id === draftId ? { ...s, name } : s)))
  }

  const removeStepDraft = (draftId: number) => {
    setStepDrafts((prev) => prev.filter((s) => s.id !== draftId))
  }

  const moveStepDraft = (draftId: number, direction: 'up' | 'down') => {
    setStepDrafts((prev) => {
      const idx = prev.findIndex((s) => s.id === draftId)
      if (idx < 0) return prev
      const target = direction === 'up' ? idx - 1 : idx + 1
      if (target < 0 || target >= prev.length) return prev
      const next = [...prev]
      ;[next[idx], next[target]] = [next[target], next[idx]]
      return next
    })
  }

  const saveSteps = useCallback(async () => {
    if (!workflowId) return

    const existingSteps = workflowQuery.data?.steps ?? []

    for (const step of existingSteps) {
      if (!stepDrafts.some((d) => d.id === step.id)) {
        await workflowService.deleteWorkflowStep(step.id)
      }
    }

    let order = 1
    for (const draft of stepDrafts) {
      if (draft.id < 0) {
        if (draft.name.trim()) {
          await workflowService.addWorkflowStep(workflowId, {
            name: draft.name.trim(),
            order,
          })
          order++
        }
      } else {
        await workflowService.updateWorkflowStep(draft.id, {
          name: draft.name.trim(),
          order,
        })
        order++
      }
    }

    await queryClient.invalidateQueries({ queryKey: ['workflows', workflowId] })
  }, [workflowId, stepDrafts, workflowQuery.data, queryClient])

  if (isEditing && workflowQuery.isLoading) {
    return <p className="text-sm text-foreground-muted">Carregando fluxo...</p>
  }

  if (isEditing && workflowQuery.isError) {
    return <Alert variant="danger">Fluxo não encontrado.</Alert>
  }

  return (
    <div>
      <PageHeader
        title={isEditing ? 'Editar fluxo' : 'Novo fluxo'}
        description={
          isEditing
            ? 'Configure o fluxo de aprovação e suas etapas.'
            : 'Crie um fluxo de aprovação com etapas sequenciais.'
        }
      />

      <Card className="p-6">
        <form
          className="space-y-4"
          onSubmit={handleSubmit((values) => saveMutation.mutate(values))}
          noValidate
        >
          <Input label="Nome" error={errors.name?.message} {...register('name')} />

          <div>
            <label htmlFor="wf-description" className="mb-1.5 block text-sm font-medium text-foreground">
              Descrição (opcional)
            </label>
            <textarea
              id="wf-description"
              rows={3}
              className="w-full rounded-md border border-surface-sunken bg-surface px-3 py-2 text-sm text-foreground placeholder:text-foreground-subtle focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
              {...register('description')}
            />
            {errors.description?.message && (
              <p className="mt-1 text-sm text-danger">{errors.description.message}</p>
            )}
          </div>

          {formError && <Alert variant="danger">{formError}</Alert>}

          <FormActions
            cancelHref="/workflows"
            isSubmitting={isSubmitting || saveMutation.isPending}
          />
        </form>
      </Card>

      {isEditing && workflowQuery.data && (
        <Card className="mt-4 p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-foreground">Etapas</h2>
              <p className="mt-1 text-sm text-foreground-muted">
                Configure a ordem e os responsáveis de cada etapa.
              </p>
            </div>
            <Button type="button" variant="ghost" size="sm" onClick={addStepDraft}>
              <Plus className="size-4" aria-hidden />
              Adicionar etapa
            </Button>
          </div>

          {stepDrafts.length === 0 ? (
            <p className="rounded-lg border border-dashed border-surface-sunken px-4 py-6 text-center text-sm text-foreground-muted">
              Nenhuma etapa configurada.
            </p>
          ) : (
            <div className="space-y-3">
              {stepDrafts.map((draft, index) => (
                <div
                  key={draft.id}
                  className="flex items-center gap-2 rounded-lg border border-surface-sunken bg-surface-sunken/30 p-3"
                >
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => moveStepDraft(draft.id, 'up')}
                      className="rounded p-0.5 text-foreground-muted transition hover:text-foreground disabled:opacity-30"
                      aria-label="Mover para cima"
                    >
                      <ArrowUp className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={index === stepDrafts.length - 1}
                      onClick={() => moveStepDraft(draft.id, 'down')}
                      className="rounded p-0.5 text-foreground-muted transition hover:text-foreground disabled:opacity-30"
                      aria-label="Mover para baixo"
                    >
                      <ArrowDown className="size-3.5" />
                    </button>
                  </div>

                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-surface text-xs font-semibold text-foreground-muted">
                    {index + 1}
                  </span>

                  <input
                    type="text"
                    value={draft.name}
                    onChange={(e) => updateStepDraft(draft.id, e.target.value)}
                    placeholder="Nome da etapa"
                    className="min-w-0 flex-1 rounded-md border border-surface-sunken bg-surface px-2.5 py-1.5 text-sm text-foreground placeholder:text-foreground-subtle focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />

                  <button
                    type="button"
                    onClick={() => removeStepDraft(draft.id)}
                    className="rounded p-1.5 text-foreground-muted transition hover:text-danger"
                    aria-label="Remover etapa"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4">
            <Button type="button" onClick={saveSteps}>
              Salvar etapas
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
