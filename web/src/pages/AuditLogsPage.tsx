import { useQuery } from '@tanstack/react-query'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { listAuditLogs } from '../services/auditService'
import { formatDateTime } from '../lib/format'
import { PageHeader } from '../components/ui/PageHeader'
import { Select } from '../components/ui/Select'
import { Button } from '../components/ui/Button'
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '../components/ui/Table'

function entityName(entity: string): string {
  return entity.replace(/^.*\\/, '')
}

function actionLabel(action: string): string {
  const map: Record<string, string> = {
    created: 'Criado',
    updated: 'Atualizado',
    deleted: 'Excluído',
  }
  return map[action] ?? action
}

function actionColor(action: string): string {
  const map: Record<string, string> = {
    created: 'bg-success/10 text-success',
    updated: 'bg-primary-muted text-primary',
    deleted: 'bg-danger/10 text-danger',
  }
  return map[action] ?? 'bg-surface-sunken text-foreground-muted'
}

export function AuditLogsPage() {
  const [entity, setEntity] = useState('')
  const [action, setAction] = useState('')
  const [page, setPage] = useState(1)
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const perPage = 20

  const { data, isLoading } = useQuery({
    queryKey: ['audit-logs', page, entity, action],
    queryFn: () => listAuditLogs({
      page,
      per_page: perPage,
      entity: entity || undefined,
      action: action || undefined,
    }),
  })

  const logs = data?.data ?? []
  const meta = data?.meta

  return (
    <div>
      <PageHeader title="Auditoria" description="Registro de todas as alterações do sistema" />

      <div className="mb-4 flex flex-wrap gap-3">
        <div className="w-36">
          <Select
            value={action}
            options={[
              { value: '', label: 'Todas ações' },
              { value: 'created', label: 'Criado' },
              { value: 'updated', label: 'Atualizado' },
              { value: 'deleted', label: 'Excluído' },
            ]}
            onChange={(v) => { setAction(v as string); setPage(1) }}
            aria-label="Filtrar por ação"
          />
        </div>
      </div>

      {isLoading ? (
        <p className="py-8 text-center text-sm text-foreground-muted">Carregando...</p>
      ) : logs.length === 0 ? (
        <div className="rounded-xl border border-dashed border-surface-sunken px-4 py-12 text-center">
          <p className="text-sm text-foreground-muted">Nenhum registro de auditoria encontrado.</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-surface-sunken">
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Ação</TableHeaderCell>
                  <TableHeaderCell>Entidade</TableHeaderCell>
                  <TableHeaderCell>ID</TableHeaderCell>
                  <TableHeaderCell>Usuário</TableHeaderCell>
                  <TableHeaderCell>Data</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {logs.map((log) => {
                  const isExpanded = expandedId === log.id
                  const changedFields: { field: string; old: string; new: string }[] = []

                  if (log.action === 'updated' && log.old_data && log.new_data) {
                    for (const key of Object.keys(log.new_data)) {
                      changedFields.push({
                        field: key,
                        old: log.old_data[key] !== undefined ? String(log.old_data[key]) : '—',
                        new: String(log.new_data[key]),
                      })
                    }
                  } else if (log.action === 'created' && log.new_data) {
                    for (const [key, val] of Object.entries(log.new_data)) {
                      changedFields.push({ field: key, old: '—', new: String(val) })
                    }
                  } else if (log.action === 'deleted' && log.old_data) {
                    for (const [key, val] of Object.entries(log.old_data)) {
                      changedFields.push({ field: key, old: String(val), new: '—' })
                    }
                  }

                  return (
                    <React.Fragment key={log.id}>
                      <TableRow
                        className="cursor-pointer hover:bg-surface-sunken/50"
                        onClick={() => setExpandedId(isExpanded ? null : log.id)}
                      >
                        <TableCell>
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${actionColor(log.action)}`}>
                            {actionLabel(log.action)}
                          </span>
                        </TableCell>
                        <TableCell className="font-medium text-foreground">{entityName(log.entity)}</TableCell>
                        <TableCell className="text-foreground-muted">{log.entity_id}</TableCell>
                        <TableCell className="text-foreground-muted">{log.user?.name ?? 'Sistema'}</TableCell>
                        <TableCell className="flex items-center gap-1 text-sm text-foreground-muted">
                          {formatDateTime(log.created_at)}
                          {changedFields.length > 0 && (
                            <span className="ml-1 text-foreground-subtle">
                              {isExpanded ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                      {isExpanded && changedFields.length > 0 && (
                        <TableRow key={`${log.id}-detail`}>
                          <TableCell colSpan={5} className="bg-surface-sunken/30 px-4 py-3">
                            <div className="space-y-1.5">
                              {changedFields.map((change) => (
                                <div key={change.field} className="flex items-start gap-3 text-xs">
                                  <span className="w-32 shrink-0 font-medium text-foreground">{change.field}</span>
                                  <span className="text-foreground-muted line-through">{change.old}</span>
                                  <span className="text-foreground-subtle">→</span>
                                  <span className="font-medium text-foreground">{change.new}</span>
                                </div>
                              ))}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          {meta && meta.last_page > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-foreground-muted">
                {meta.total} registro{meta.total !== 1 ? 's' : ''}
              </p>
              <div className="flex items-center gap-2">
                <Button type="button" variant="ghost" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                  Anterior
                </Button>
                <span className="text-sm text-foreground-muted">{page} de {meta.last_page}</span>
                <Button type="button" variant="ghost" size="sm" disabled={page >= meta.last_page} onClick={() => setPage(p => p + 1)}>
                  Próximo
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
