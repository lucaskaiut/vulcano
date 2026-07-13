import {
  ArrowDown,
  ArrowUp,
  Plus,
  Trash2,
  X,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { WorkflowRule, WorkflowStep, WorkflowType } from '../../types/workflow'
import { Button } from '../ui/Button'
import { ConfirmModal } from '../ui/ConfirmModal'
import { Input } from '../ui/Input'
import { SearchSelect, type SearchSelectOption } from '../ui/SearchSelect'
import { Select } from '../ui/Select'
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

type StepRulesDraft = {
  visibility: WorkflowRule[]
  approval: WorkflowRule[]
}

const VISIBILITY_RULE_TYPES = [
  { value: 'requester', label: 'Solicitante' },
  { value: 'manager', label: 'Gestor do solicitante' },
  { value: 'role', label: 'Perfil específico' },
  { value: 'user', label: 'Usuário específico' },
]

const APPROVAL_RULE_TYPES = [
  { value: 'manager', label: 'Gestor do solicitante' },
  { value: 'role', label: 'Perfil específico' },
  { value: 'user', label: 'Usuário específico' },
]

function emptyRule(): WorkflowRule {
  return { type: 'manager' }
}

function normalizeRules(rules: WorkflowRule[] | string | null | undefined): WorkflowRule[] {
  if (Array.isArray(rules)) {
    return rules
  }

  if (typeof rules === 'string' && rules.trim() !== '') {
    try {
      const parsed: unknown = JSON.parse(rules)
      return Array.isArray(parsed) ? (parsed as WorkflowRule[]) : []
    } catch {
      return []
    }
  }

  return []
}

function isRuleComplete(rule: WorkflowRule): boolean {
  if (rule.type === 'role' || rule.type === 'user') {
    return typeof rule.id === 'number'
  }

  return Boolean(rule.type)
}

function areRulesComplete(rules: WorkflowRule[]): boolean {
  return rules.every(isRuleComplete)
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

function RuleEditor({
  rules,
  ruleTypes,
  onChange,
}: {
  rules: WorkflowRule[]
  ruleTypes: { value: string; label: string }[]
  onChange: (rules: WorkflowRule[]) => void
}) {
  const safeRules: WorkflowRule[] = Array.isArray(rules) ? rules : []

  function handleTypeChange(index: number, type: string) {
    const updated = safeRules.map((r, i) =>
      i === index ? { type: type as WorkflowRule['type'] } : r,
    )
    onChange(updated)
  }

  function handleIdChange(index: number, id: number | null) {
    const updated = safeRules.map((r, i) =>
      i === index ? { ...r, id: id ?? undefined } : r,
    )
    onChange(updated)
  }

  function handleRemove(index: number) {
    onChange(safeRules.filter((_, i) => i !== index))
  }

  function handleAdd() {
    onChange([...safeRules, emptyRule()])
  }

  return (
    <div className="space-y-2">
      {safeRules.map((rule, index) => (
        <div key={index} className="flex items-center gap-2">
          <Select
            value={rule.type}
            options={ruleTypes}
            onChange={(v) => handleTypeChange(index, v)}
            className="w-44"
            aria-label="Tipo de regra"
          />
          {(rule.type === 'role' || rule.type === 'user') && (
            <SearchSelect
              label={rule.type === 'role' ? 'Perfil' : 'Usuário'}
              value={rule.id ?? null}
              selectedOption={null}
              onChange={(id) => handleIdChange(index, id)}
              onSearch={rule.type === 'role' ? searchRoles : searchUsers}
              placeholder={
                rule.type === 'role'
                  ? 'Selecione um perfil...'
                  : 'Selecione um usuário...'
              }
              searchPlaceholder={
                rule.type === 'role' ? 'Buscar perfis...' : 'Buscar usuários...'
              }
            />
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleRemove(index)}
            aria-label="Remover regra"
          >
            <X className="size-3.5" />
          </Button>
        </div>
      ))}
      <Button variant="ghost" size="sm" onClick={handleAdd} className="text-xs">
        <Plus className="mr-1 size-3" />
        Adicionar regra
      </Button>
    </div>
  )
}

export function WorkflowStepsEditor({
  type,
  steps,
  onStepsChanged,
}: WorkflowStepsEditorProps) {
  const [deleteTarget, setDeleteTarget] = useState<WorkflowStep | null>(null)
  const [saving, setSaving] = useState(false)
  const [nameCache, setNameCache] = useState<Record<number, string>>({})
  const [rulesDraft, setRulesDraft] = useState<Record<number, StepRulesDraft>>({})
  const prevStepsRef = useRef<WorkflowStep[]>(steps)
  const persistLock = useRef(false)

  useEffect(() => {
    const prev = prevStepsRef.current
    const nextNames: Record<number, string> = { ...nameCache }
    const nextRules: Record<number, StepRulesDraft> = { ...rulesDraft }

    for (const step of steps) {
      const prevStep = prev.find((s) => s.id === step.id)
      if (!prevStep || prevStep.name !== step.name) {
        nextNames[step.id] = step.name
      }

      const incoming = {
        visibility: normalizeRules(step.visibility_rules),
        approval: normalizeRules(step.approval_rules),
      }

      const currentDraft = rulesDraft[step.id]
      const draftIncomplete =
        currentDraft !== undefined &&
        (!areRulesComplete(currentDraft.visibility) ||
          !areRulesComplete(currentDraft.approval))

      // Mantém rascunho incompleto (ex.: tipo role aguardando seleção de id)
      if (!draftIncomplete) {
        nextRules[step.id] = incoming
      } else if (!currentDraft) {
        nextRules[step.id] = incoming
      }
    }

    const currentIds = new Set(steps.map((s) => s.id))
    for (const id of Object.keys(nextNames)) {
      if (!currentIds.has(Number(id))) {
        delete nextNames[Number(id)]
      }
    }
    for (const id of Object.keys(nextRules)) {
      if (!currentIds.has(Number(id))) {
        delete nextRules[Number(id)]
      }
    }

    prevStepsRef.current = steps
    setNameCache(nextNames)
    setRulesDraft(nextRules)
  }, [steps])

  function getName(step: WorkflowStep): string {
    return nameCache[step.id] ?? step.name
  }

  function getRules(step: WorkflowStep): StepRulesDraft {
    return (
      rulesDraft[step.id] ?? {
        visibility: normalizeRules(step.visibility_rules),
        approval: normalizeRules(step.approval_rules),
      }
    )
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

  async function persistRules(step: WorkflowStep, draft: StepRulesDraft) {
    if (!areRulesComplete(draft.visibility) || !areRulesComplete(draft.approval)) {
      return
    }

    if (persistLock.current) return
    persistLock.current = true

    try {
      await updateStep(step.id, {
        visibility_rules: draft.visibility.length > 0 ? draft.visibility : null,
        approval_rules: draft.approval.length > 0 ? draft.approval : null,
      })
      onStepsChanged()
    } finally {
      persistLock.current = false
    }
  }

  function handleRulesChange(
    step: WorkflowStep,
    field: 'visibility' | 'approval',
    rules: WorkflowRule[],
  ) {
    const current = getRules(step)
    const draft: StepRulesDraft = {
      ...current,
      [field]: normalizeRules(rules),
    }

    setRulesDraft((prev) => ({ ...prev, [step.id]: draft }))
    void persistRules(step, draft)
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

  return (
    <div className="space-y-3">
      {steps.length === 0 && (
        <p className="py-4 text-center text-sm text-foreground-muted">
          Nenhuma etapa configurada para este fluxo.
        </p>
      )}

      {steps.map((step) => {
        const draft = getRules(step)

        return (
          <div
            key={step.id}
            className="flex items-start gap-3 rounded-lg bg-surface-sunken p-4"
          >
            <span className="mt-2.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              {step.order}
            </span>

            <div className="min-w-0 flex-1 space-y-4">
              <Input
                label="Nome da etapa"
                value={getName(step)}
                onChange={(e) => handleNameChange(step, e.target.value)}
                onBlur={() => handleNameBlur(step)}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <fieldset className="space-y-1">
                  <legend className="text-xs font-medium text-foreground-muted">
                    Visibilidade
                  </legend>
                  <RuleEditor
                    rules={draft.visibility}
                    ruleTypes={VISIBILITY_RULE_TYPES}
                    onChange={(rules) => handleRulesChange(step, 'visibility', rules)}
                  />
                </fieldset>

                <fieldset className="space-y-1">
                  <legend className="text-xs font-medium text-foreground-muted">
                    Aprovação
                  </legend>
                  <RuleEditor
                    rules={draft.approval}
                    ruleTypes={APPROVAL_RULE_TYPES}
                    onChange={(rules) => handleRulesChange(step, 'approval', rules)}
                  />
                </fieldset>
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
        )
      })}

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
