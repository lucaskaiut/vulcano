import { Fragment, useMemo } from 'react'
import type { Permission } from '../../types/acl'
import { ToggleSwitch } from './Toggle'

const CONTEXT_LABELS: Record<string, string> = {
  users: 'Colaboradores',
  roles: 'Perfis',
}

const ACTION_LABELS: Record<string, string> = {
  view: 'Visualizar',
  create: 'Criar',
  update: 'Atualizar',
  delete: 'Excluir',
}

const ACTION_ORDER = ['view', 'create', 'update', 'delete']

type PermissionGroup = {
  context: string
  label: string
  permissions: Permission[]
}

function getContext(slug: string): string {
  return slug.split('.')[0] ?? slug
}

function getAction(slug: string): string {
  return slug.split('.')[1] ?? slug
}

function permissionLabel(permission: Permission): string {
  const action = getAction(permission.slug)
  return ACTION_LABELS[action] ?? permission.name
}

function groupPermissions(permissions: Permission[]): PermissionGroup[] {
  const groups = new Map<string, Permission[]>()

  for (const permission of permissions) {
    const context = getContext(permission.slug)

    if (context === 'permissions') {
      continue
    }

    const items = groups.get(context) ?? []
    items.push(permission)
    groups.set(context, items)
  }

  return [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([context, items]) => ({
      context,
      label: CONTEXT_LABELS[context] ?? context,
      permissions: items.sort(
        (a, b) =>
          ACTION_ORDER.indexOf(getAction(a.slug)) - ACTION_ORDER.indexOf(getAction(b.slug)),
      ),
    }))
}

type PermissionGroupPickerProps = {
  label?: string
  permissions: Permission[]
  value: number[]
  onChange: (value: number[]) => void
  error?: string
}

export function PermissionGroupPicker({
  label = 'Permissões',
  permissions,
  value,
  onChange,
  error,
}: PermissionGroupPickerProps) {
  const groups = useMemo(() => groupPermissions(permissions), [permissions])

  function togglePermission(permissionId: number, checked: boolean) {
    if (checked) {
      onChange([...value, permissionId])
      return
    }

    onChange(value.filter((id) => id !== permissionId))
  }

  return (
    <fieldset>
      <legend className="mb-3 text-sm font-medium text-foreground-muted">{label}</legend>
      <div className="flex flex-col flex-wrap items-start gap-6 sm:flex-row sm:gap-8">
        {groups.map((group) => (
          <div key={group.context} className="w-fit">
            <p className="mb-3 text-sm font-semibold text-foreground">{group.label}</p>
            <div className="inline-grid w-fit grid-cols-[max-content_2.75rem] items-center gap-x-4 gap-y-3">
              {group.permissions.map((permission) => {
                const label = permissionLabel(permission)
                const inputId = `permission-${permission.id}`

                return (
                  <Fragment key={permission.id}>
                    <label htmlFor={inputId} className="cursor-pointer text-sm text-foreground">
                      {label}
                    </label>
                    <ToggleSwitch
                      id={inputId}
                      checked={value.includes(permission.id)}
                      onChange={(checked) => togglePermission(permission.id, checked)}
                      ariaLabel={label}
                    />
                  </Fragment>
                )
              })}
            </div>
          </div>
        ))}
      </div>
      {error && <p className="mt-1.5 text-sm text-danger">{error}</p>}
    </fieldset>
  )
}
