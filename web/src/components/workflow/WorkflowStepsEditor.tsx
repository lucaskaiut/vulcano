import {
  ArrowDown,
  ArrowUp,
  Plus,
  Trash2,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { WorkflowStep, WorkflowType } from '../../types/workflow'
import { Button } from '../ui/Button'
import { ConfirmModal } from '../ui/ConfirmModal'
import { Input } from '../ui/Input'
import { SearchSelect, type SearchSelectOption } from '../ui/SearchSelect'
import {
  createStep,
  deleteStep,
  reorderStep,
  updateStep,
} from '../../services/workflowService'
import { listRoles, listUsers } from '../../services/aclService'

type WorkflowStepsEditorProps = {
  type: WorkflowType
  steps: WorkflowStep[]
  onStepsChanged: () => void
}

export function WorkflowStepsEditor({
  type,
  steps,
  onStepsChanged,
}: WorkflowStepsEditorProps) {
  const [deleteTarget, setDeleteTarget] = useState<WorkflowStep | null>(null)
  const [saving, setSaving] = useState(false)
  const [nameCache, setNameCache] = useState<Record<number, string>>({})
  const prevStepsRef = useRef<WorkflowStep[]>(steps)

  useEffect(() => {
    const prev = prevStepsRef.current
    const next: Record<number, string> = { ...nameCache }

    for (const step of steps) {
      const prevStep = prev.find((s) => s.id === step.id)
      if (!prevStep || prevStep.name !== step.name) {
        next[step.id] = step.name
      }
    }

    const currentIds = new Set(steps.map((s) => s.id))
    for (const id of Object.keys(next)) {
      if (!currentIds.has(Number(id))) {
        delete next[Number(id)]
      }
    }

    prevStepsRef.current = steps
    setNameCache(next)
  }, [steps])

  function getName(step: WorkflowStep): string {
    return nameCache[step.id] ?? step.name
  }

  function handleNameChange(step: WorkflowStep, value: string) {
    setNameCache((prev) => ({ ...prev, [step.id]: value }))
  }

  async function handleNameBlur(step: WorkflowStep) {
    const current = nameCache[step.id]
    if (current === undefined || current === step.name) return
    await updateStep(step.id, { name: current })
    onStepsChanged()
  }

  async function handleCreate() {
    setSaving(true)
    try {
      await createStep(type, {
        name: 'Nova etapa',
        order: steps.length + 1,
      })
      onStepsChanged()
    } finally {
      setSaving(false)
    }
  }

  async function handleUpdateResponsible(
    step: WorkflowStep,
    roleId: number | null,
    userId: number | null,
  ) {
    await updateStep(step.id, {
      responsible_role_id: roleId ?? undefined,
      responsible_user_id: userId ?? undefined,
    })
    onStepsChanged()
  }

  async function handleMoveUp(step: WorkflowStep) {
    if (step.order <= 1) return
    await reorderStep(step.id, step.order - 1)
    onStepsChanged()
  }

  async function handleMoveDown(step: WorkflowStep) {
    if (step.order >= steps.length) return
    await reorderStep(step.id, step.order + 1)
    onStepsChanged()
  }

  async function handleDelete() {
    if (!deleteTarget) return
    await deleteStep(deleteTarget.id)
    setDeleteTarget(null)
    onStepsChanged()
  }

  async function searchRoles(query: string): Promise<SearchSelectOption[]> {
    const response = await listRoles({ page: 1, per_page: 50 })

    return response.data
      .filter(
        (r) =>
          query.trim() === '' ||
          r.name.toLowerCase().includes(query.toLowerCase()),
      )
      .map((r) => ({ value: r.id, label: r.name }))
  }

  async function searchUsers(query: string): Promise<SearchSelectOption[]> {
    const response = await listUsers({ page: 1, per_page: 50 })

    return response.data
      .filter(
        (u) =>
          query.trim() === '' ||
          u.name.toLowerCase().includes(query.toLowerCase()),
      )
      .map((u) => ({ value: u.id, label: u.name }))
  }

  return (
    <div className="space-y-3">
      {steps.length === 0 && (
        <p className="py-4 text-center text-sm text-foreground-muted">
          Nenhuma etapa configurada para este fluxo.
        </p>
      )}

      {steps.map((step) => (
        <div
          key={step.id}
          className="flex items-start gap-3 rounded-lg bg-surface-sunken p-4"
        >
          <span className="mt-2.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
            {step.order}
          </span>

          <div className="min-w-0 flex-1 space-y-3">
            <Input
              label="Nome da etapa"
              value={getName(step)}
              onChange={(e) => handleNameChange(step, e.target.value)}
              onBlur={() => handleNameBlur(step)}
            />

            <div className="grid gap-3 sm:grid-cols-2">
              <SearchSelect
                label="Responsável (Perfil)"
                value={step.responsible_role?.id ?? null}
                selectedOption={
                  step.responsible_role
                    ? {
                        value: step.responsible_role.id,
                        label: step.responsible_role.name,
                      }
                    : null
                }
                onChange={(roleId) =>
                  handleUpdateResponsible(
                    step,
                    roleId,
                    step.responsible_user?.id ?? null,
                  )
                }
                onSearch={searchRoles}
                placeholder="Selecione um perfil..."
                searchPlaceholder="Buscar perfis..."
              />

              <SearchSelect
                label="Responsável (Usuário)"
                value={step.responsible_user?.id ?? null}
                selectedOption={
                  step.responsible_user
                    ? {
                        value: step.responsible_user.id,
                        label: step.responsible_user.name,
                      }
                    : null
                }
                onChange={(userId) =>
                  handleUpdateResponsible(
                    step,
                    step.responsible_role?.id ?? null,
                    userId,
                  )
                }
                onSearch={searchUsers}
                placeholder="Selecione um usuário..."
                searchPlaceholder="Buscar usuários..."
              />
            </div>
          </div>

          <div className="flex shrink-0 flex-col gap-1 pt-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleMoveUp(step)}
              disabled={step.order <= 1}
              aria-label="Mover para cima"
            >
              <ArrowUp className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleMoveDown(step)}
              disabled={step.order >= steps.length}
              aria-label="Mover para baixo"
            >
              <ArrowDown className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDeleteTarget(step)}
              aria-label="Remover etapa"
            >
              <Trash2 className="size-4 text-danger" />
            </Button>
          </div>
        </div>
      ))}

      <Button
        variant="ghost"
        size="sm"
        onClick={handleCreate}
        disabled={saving}
        className="w-full"
      >
        <Plus className="mr-1 size-4" />
        Adicionar etapa
      </Button>

      <ConfirmModal
        open={deleteTarget !== null}
        title="Remover etapa"
        description={`Tem certeza que deseja remover a etapa "${deleteTarget?.name}"?`}
        confirmLabel="Remover"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
