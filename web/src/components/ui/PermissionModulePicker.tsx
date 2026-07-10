import { useMemo, useState } from 'react'
import {
  ChevronDown,
  Check,
  Minus,
  Search,
  Shield,
  Users,
  GitBranch,
  Workflow,
  Palmtree,
  CalendarDays,
  CalendarCheck,
  CalendarPlus,
  Building,
  DollarSign,
  Coins,
  FileText,
  FolderOpen,
  ReceiptText,
  Stethoscope,
  Bell,
  ClipboardList,
} from 'lucide-react'
import type { Permission } from '../../types/acl'
import { Input } from './Input'

// ---------------------------------------------------------------------------
// Module definitions
// ---------------------------------------------------------------------------

type ModuleGroup = { label: string; keys: string[] }

type ModuleDef = {
  key: string
  label: string
  icon: typeof Shield
  groups: ModuleGroup[]
}

const MODULES: ModuleDef[] = [
  {
    key: 'users',
    label: 'Colaboradores',
    icon: Users,
    groups: [
      { label: 'Visualização', keys: ['view'] },
      { label: 'Gerenciamento', keys: ['create', 'update', 'delete'] },
    ],
  },
  {
    key: 'roles',
    label: 'Perfis',
    icon: Shield,
    groups: [
      { label: 'Visualização', keys: ['view'] },
      { label: 'Gerenciamento', keys: ['create', 'update', 'delete'] },
    ],
  },
  {
    key: 'workflow_steps',
    label: 'Etapas de Workflow',
    icon: GitBranch,
    groups: [
      { label: 'Visualização', keys: ['view'] },
      { label: 'Gerenciamento', keys: ['create', 'update', 'delete'] },
    ],
  },
  {
    key: 'workflow_instances',
    label: 'Processos',
    icon: Workflow,
    groups: [
      { label: 'Visualização', keys: ['view', 'view_all'] },
      { label: 'Gerenciamento', keys: ['create'] },
      { label: 'Ações', keys: ['approve', 'reject', 'cancel'] },
    ],
  },
  {
    key: 'vacation_balances',
    label: 'Saldos de Férias',
    icon: Palmtree,
    groups: [
      { label: 'Visualização', keys: ['view', 'view_all'] },
      { label: 'Gerenciamento', keys: ['create', 'update'] },
    ],
  },
  {
    key: 'vacation_grants',
    label: 'Concessões de Férias',
    icon: CalendarDays,
    groups: [
      { label: 'Visualização', keys: ['view', 'view_all'] },
      { label: 'Gerenciamento', keys: ['create', 'update', 'delete'] },
    ],
  },
  {
    key: 'vacation_periods',
    label: 'Períodos Aquisitivos',
    icon: CalendarCheck,
    groups: [
      { label: 'Visualização', keys: ['view', 'view_all'] },
      { label: 'Gerenciamento', keys: ['create'] },
      { label: 'Ações', keys: ['close'] },
    ],
  },
  {
    key: 'vacation_requests',
    label: 'Solicitações de Férias',
    icon: CalendarPlus,
    groups: [
      { label: 'Visualização', keys: ['view', 'view_all'] },
      { label: 'Gerenciamento', keys: ['create', 'cancel'] },
      { label: 'Aprovação', keys: ['approve', 'reject'] },
    ],
  },
  {
    key: 'commissions',
    label: 'Comissões',
    icon: DollarSign,
    groups: [
      { label: 'Visualização', keys: ['view', 'view_all'] },
      { label: 'Gerenciamento', keys: ['create'] },
      { label: 'Ações', keys: ['pay', 'approve', 'reject'] },
    ],
  },
  {
    key: 'enterprises',
    label: 'Empreendimentos',
    icon: Building,
    groups: [
      { label: 'Visualização', keys: ['view'] },
      { label: 'Gerenciamento', keys: ['create', 'update', 'delete'] },
    ],
  },
  {
    key: 'costs',
    label: 'Custos',
    icon: Coins,
    groups: [
      { label: 'Visualização', keys: ['view', 'view_all'] },
      { label: 'Gerenciamento', keys: ['create', 'update', 'delete'] },
    ],
  },
  {
    key: 'documents',
    label: 'Documentos',
    icon: FileText,
    groups: [
      { label: 'Visualização', keys: ['view', 'view_all'] },
      { label: 'Gerenciamento', keys: ['create', 'delete'] },
    ],
  },
  {
    key: 'document_types',
    label: 'Tipos de Documento',
    icon: FolderOpen,
    groups: [
      { label: 'Visualização', keys: ['view'] },
      { label: 'Gerenciamento', keys: ['create', 'update', 'delete'] },
    ],
  },
  {
    key: 'invoices',
    label: 'Notas Fiscais',
    icon: ReceiptText,
    groups: [
      { label: 'Visualização', keys: ['view', 'view_all'] },
      { label: 'Gerenciamento', keys: ['create'] },
      { label: 'Aprovação', keys: ['approve', 'reject'] },
    ],
  },
  {
    key: 'medical_exams',
    label: 'Exames Médicos',
    icon: Stethoscope,
    groups: [
      { label: 'Visualização', keys: ['view', 'view_all'] },
      { label: 'Gerenciamento', keys: ['create', 'update', 'delete'] },
    ],
  },
  {
    key: 'notifications',
    label: 'Notificações',
    icon: Bell,
    groups: [
      { label: 'Visualização', keys: ['view'] },
    ],
  },
  {
    key: 'audit',
    label: 'Auditoria',
    icon: ClipboardList,
    groups: [
      { label: 'Visualização', keys: ['view'] },
    ],
  },
]

// ---------------------------------------------------------------------------
// Preset templates
// ---------------------------------------------------------------------------

type Preset = {
  key: string
  label: string
  permission_slugs: string[]
}

const PRESETS: Preset[] = [
  {
    key: 'admin',
    label: 'Administrador',
    permission_slugs: [
      'users.view', 'users.create', 'users.update', 'users.delete',
      'roles.view', 'roles.create', 'roles.update', 'roles.delete',
      'workflow_steps.view', 'workflow_steps.create', 'workflow_steps.update', 'workflow_steps.delete',
      'workflow_instances.view', 'workflow_instances.view_all', 'workflow_instances.create',
      'workflow_instances.approve', 'workflow_instances.reject', 'workflow_instances.cancel',
      'vacation_balances.view', 'vacation_balances.create', 'vacation_balances.update', 'vacation_balances.view_all',
      'vacation_grants.view', 'vacation_grants.create', 'vacation_grants.update', 'vacation_grants.delete', 'vacation_grants.view_all',
      'vacation_periods.view', 'vacation_periods.create', 'vacation_periods.close', 'vacation_periods.view_all',
      'vacation_requests.view', 'vacation_requests.create', 'vacation_requests.cancel', 'vacation_requests.view_all',
      'commissions.view', 'commissions.create', 'commissions.pay', 'commissions.view_all',
      'enterprises.view', 'enterprises.create', 'enterprises.update', 'enterprises.delete',
      'costs.view', 'costs.create', 'costs.update', 'costs.delete', 'costs.view_all',
      'documents.view', 'documents.create', 'documents.delete', 'documents.view_all',
      'document_types.view', 'document_types.create', 'document_types.update', 'document_types.delete',
      'invoices.view', 'invoices.create', 'invoices.view_all',
      'medical_exams.view', 'medical_exams.create', 'medical_exams.update', 'medical_exams.delete', 'medical_exams.view_all',
      'notifications.view', 'audit.view',
    ],
  },
  {
    key: 'manager',
    label: 'Gestor',
    permission_slugs: [
      'users.view',
      'vacation_balances.view',
      'vacation_grants.view',
      'vacation_periods.view',
      'vacation_requests.view', 'vacation_requests.create', 'vacation_requests.cancel',
      'workflow_instances.view', 'workflow_instances.approve', 'workflow_instances.reject',
      'documents.view',
      'document_types.view',
      'enterprises.view',
      'invoices.view',
      'costs.view',
      'commissions.view',
      'notifications.view',
    ],
  },
  {
    key: 'collaborator',
    label: 'Colaborador',
    permission_slugs: [
      'users.view',
      'vacation_requests.view', 'vacation_requests.create', 'vacation_requests.cancel',
      'invoices.view', 'invoices.create',
      'documents.view',
      'document_types.view',
      'notifications.view',
    ],
  },
  {
    key: 'readonly',
    label: 'Somente leitura',
    permission_slugs: [
      'users.view',
      'roles.view',
      'workflow_steps.view',
      'workflow_instances.view',
      'vacation_balances.view',
      'vacation_grants.view',
      'vacation_periods.view',
      'vacation_requests.view',
      'commissions.view',
      'enterprises.view',
      'costs.view',
      'documents.view',
      'document_types.view',
      'invoices.view',
      'medical_exams.view',
      'notifications.view',
      'audit.view',
    ],
  },
]

// ---------------------------------------------------------------------------
// DANGER / sensitive permissions
// ---------------------------------------------------------------------------

const DANGER_SUFFIXES = ['delete', 'approve', 'reject', 'pay']

function isDanger(action: string): boolean {
  return DANGER_SUFFIXES.includes(action)
}

// ---------------------------------------------------------------------------
// Action label map
// ---------------------------------------------------------------------------

const ACTION_LABEL: Record<string, string> = {
  view: 'Visualizar',
  view_all: 'Visualizar todos',
  create: 'Criar',
  update: 'Atualizar',
  delete: 'Excluir',
  approve: 'Aprovar',
  reject: 'Reprovar',
  cancel: 'Cancelar',
  close: 'Encerrar',
  pay: 'Pagar',
}

function getAction(slug: string): string {
  const parts = slug.split('.')
  parts.shift()
  return parts.join('.')
}

function permissionActionLabel(perm: Permission): string {
  return ACTION_LABEL[getAction(perm.slug)] ?? perm.name
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

type PermissionModulePickerProps = {
  permissions: Permission[]
  value: string[]
  onChange: (value: string[]) => void
  error?: string
}

export function PermissionModulePicker({
  permissions,
  value,
  onChange,
  error,
}: PermissionModulePickerProps) {
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  const slugSet = useMemo(() => new Set(value), [value])

  const permissionsBySlug = useMemo(() => {
    const map = new Map<string, Permission>()
    for (const p of permissions) map.set(p.slug, p)
    return map
  }, [permissions])

  // filter modules and their permissions by search
  const filteredModules = useMemo(() => {
    const q = search.toLowerCase()
    if (!q) return MODULES

    return MODULES.filter((mod) => {
      const moduleMatch = mod.label.toLowerCase().includes(q)

      const hasMatchingPerms = mod.groups.some((group) =>
        group.keys.some((action) => {
          const slug = `${mod.key}.${action}`
          const perm = permissionsBySlug.get(slug)
          return perm && (perm.name.toLowerCase().includes(q) || perm.slug.toLowerCase().includes(q))
        }),
      )

      return moduleMatch || hasMatchingPerms
    })
  }, [search, permissionsBySlug])

  function toggle(slug: string) {
    if (slugSet.has(slug)) {
      onChange(value.filter((s) => s !== slug))
    } else {
      onChange([...value, slug])
    }
  }

  function getModuleSelectedCount(mod: ModuleDef): number {
    let count = 0
    for (const group of mod.groups) {
      for (const action of group.keys) {
        if (slugSet.has(`${mod.key}.${action}`)) count++
      }
    }
    return count
  }

  function getModuleTotalCount(mod: ModuleDef): number {
    let count = 0
    for (const group of mod.groups) {
      count += group.keys.length
    }
    return count
  }

  function isModuleAllSelected(mod: ModuleDef): boolean {
    for (const group of mod.groups) {
      for (const action of group.keys) {
        if (!slugSet.has(`${mod.key}.${action}`)) return false
      }
    }
    return true
  }

  function isModulePartiallySelected(mod: ModuleDef): boolean {
    let any = false
    let all = true
    for (const group of mod.groups) {
      for (const action of group.keys) {
        if (slugSet.has(`${mod.key}.${action}`)) any = true
        else all = false
      }
    }
    return any && !all
  }

  function toggleModule(mod: ModuleDef) {
    const allSlugs = mod.groups.flatMap((g) => g.keys.map((a) => `${mod.key}.${a}`))
    const allSelected = isModuleAllSelected(mod)

    if (allSelected) {
      onChange(value.filter((s) => !allSlugs.includes(s)))
    } else {
      const newSet = new Set(value)
      for (const slug of allSlugs) newSet.add(slug)
      onChange(Array.from(newSet))
    }
  }

  function toggleExpand(key: string) {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const totalSelected = value.length
  const totalAvailable = permissions.length

  function handlePreset(preset: Preset) {
    onChange(preset.permission_slugs)
  }

  const searchFiltered = search.trim().length > 0

  // auto-expand filtered modules
  useMemo(() => {
    if (searchFiltered) {
      const keys = filteredModules.map((m) => m.key)
      setExpanded(new Set(keys))
    }
  }, [searchFiltered, filteredModules])

  return (
    <fieldset>
      <legend className="mb-3 text-sm font-medium text-foreground-muted">Permissões</legend>

      {/* Presets */}
      <div className="mb-4 flex flex-wrap gap-2">
        {PRESETS.map((preset) => (
          <button
            key={preset.key}
            type="button"
            onClick={() => handlePreset(preset)}
            className="rounded-md border border-surface-sunken bg-surface px-3 py-1.5 text-xs font-medium text-foreground-muted transition-colors hover:border-primary/30 hover:text-primary"
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Search + counter */}
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-foreground-subtle" aria-hidden />
          <Input
            label=""
            placeholder="Buscar permissão..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <span className="text-xs text-foreground-muted">
          {totalSelected} de {totalAvailable} selecionadas
        </span>
      </div>

      {/* Module accordions */}
      <div className="space-y-2">
        {filteredModules.map((mod) => {
          const selectedCount = getModuleSelectedCount(mod)
          const totalCount = getModuleTotalCount(mod)
          const isExpanded = expanded.has(mod.key)
          const Icon = mod.icon
          const partial = isModulePartiallySelected(mod)
          const allSelected = isModuleAllSelected(mod)

          let statusLabel = ''
          if (selectedCount === 0) statusLabel = 'Nenhuma permissão'
          else if (allSelected) statusLabel = 'Todas as permissões'
          else statusLabel = `${selectedCount} de ${totalCount} permissões`

          return (
            <div
              key={mod.key}
              className="rounded-lg border border-surface-sunken overflow-hidden"
            >
              {/* Header */}
              <button
                type="button"
                onClick={() => toggleExpand(mod.key)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-sunken/30"
              >
                <label
                  className="flex items-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div
                    onClick={() => toggleModule(mod)}
                    className={`flex size-5 shrink-0 cursor-pointer items-center justify-center rounded border-2 transition-colors ${
                      allSelected
                        ? 'border-primary bg-primary text-primary-foreground'
                        : partial
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-surface-sunken bg-surface'
                    }`}
                  >
                    {allSelected && <Check className="size-3.5" />}
                    {partial && <Minus className="size-3.5" />}
                  </div>
                </label>

                <div className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${
                  selectedCount > 0 ? 'bg-primary-muted text-primary' : 'bg-surface-sunken text-foreground-muted'
                }`}>
                  <Icon className="size-4" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{mod.label}</p>
                  <p className="text-xs text-foreground-muted">{statusLabel}</p>
                </div>

                <ChevronDown
                  className={`size-4 shrink-0 text-foreground-subtle transition-transform ${
                    isExpanded ? 'rotate-180' : ''
                  }`}
                  aria-hidden
                />
              </button>

              {/* Body */}
              {isExpanded && (
                <div className="border-t border-surface-sunken px-4 py-3 space-y-3">
                  {mod.groups.map((group) => {
                    // filter perms in this group that exist
                    const groupPerms = group.keys
                      .map((action) => {
                        const slug = `${mod.key}.${action}`
                        return permissionsBySlug.get(slug)
                      })
                      .filter(Boolean) as Permission[]

                    if (groupPerms.length === 0) return null

                    return (
                      <div key={group.label}>
                        <p className="mb-1.5 text-xs font-medium uppercase tracking-wider text-foreground-subtle">
                          {group.label}
                        </p>
                        <div className="space-y-0.5">
                          {groupPerms.map((perm) => {
                            const checked = slugSet.has(perm.slug)
                            const action = getAction(perm.slug)
                            const dangerous = isDanger(action)
                            const id = `perm-${perm.slug.replace(/\./g, '-')}`

                            return (
                              <label
                                key={perm.slug}
                                htmlFor={id}
                                className={`flex cursor-pointer items-center gap-3 rounded-md px-2 py-1.5 transition-colors hover:bg-surface-sunken ${
                                  dangerous && checked ? 'bg-danger/5' : ''
                                }`}
                              >
                                <div
                                  onClick={(e) => {
                                    e.preventDefault()
                                    toggle(perm.slug)
                                  }}
                                  className={`flex size-5 shrink-0 items-center justify-center rounded border-2 transition-colors ${
                                    checked
                                      ? dangerous
                                        ? 'border-danger bg-danger text-danger-foreground'
                                        : 'border-primary bg-primary text-primary-foreground'
                                      : 'border-surface-sunken bg-surface'
                                  }`}
                                >
                                  {checked && <Check className="size-3.5" />}
                                </div>
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <span className="text-sm text-foreground">
                                    {permissionActionLabel(perm)}
                                  </span>
                                  {dangerous && (
                                    <span className="shrink-0 rounded bg-warning/10 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-warning">
                                      Admin
                                    </span>
                                  )}
                                </div>
                              </label>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {error && <p className="mt-1.5 text-sm text-danger">{error}</p>}
    </fieldset>
  )
}
