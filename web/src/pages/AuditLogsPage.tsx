import { useQuery } from '@tanstack/react-query'
import { Clock, User, Search } from 'lucide-react'
import { useState } from 'react'
import { listAuditLogs } from '../services/auditService'
import { formatDate } from '../lib/format'
import { PageHeader } from '../components/ui/PageHeader'
import { Select } from '../components/ui/Select'
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '../components/ui/Table'
import { TablePagination } from '../components/ui/TablePagination'
import { useTablePagination } from '../hooks/useTablePagination'

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
  const { page, perPage, setPage, setPerPage, allowedPerPageOptions } = useTablePagination()

  const { data, isLoading } = useQuery({
    queryKey: ['audit-logs', page, perPage, entity, action],
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
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${actionColor(log.action)}`}>
                        {actionLabel(log.action)}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium text-foreground">{entityName(log.entity)}</TableCell>
                    <TableCell className="text-foreground-muted">{log.entity_id}</TableCell>
                    <TableCell className="text-foreground-muted">{log.user?.name ?? 'Sistema'}</TableCell>
                    <TableCell className="text-sm text-foreground-muted">{formatDate(log.created_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {meta && (
            <div className="mt-4">
              <TablePagination
                page={page}
                perPage={perPage}
                total={meta.total}
                lastPage={meta.last_page}
                onPageChange={setPage}
                onPerPageChange={setPerPage}
                allowedPerPageOptions={allowedPerPageOptions}
              />
            </div>
          )}
        </>
      )}
    </div>
  )
}
