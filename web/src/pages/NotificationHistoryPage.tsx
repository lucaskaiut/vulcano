import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { RefreshCw, MailCheck, MailX, Clock } from 'lucide-react'
import * as engineService from '../services/notificationEngineService'
import { formatDateTime } from '../lib/format'
import { PageHeader } from '../components/ui/PageHeader'
import { Button } from '../components/ui/Button'
import { Select } from '../components/ui/Select'
import {
  ExpandableTableRow,
  Table,
  TableBody,
  TableCell,
  TableCellCollapsible,
  TableDetail,
  TableHead,
  TableHeaderCell,
  TableHeaderCellCollapsible,
  TableHeaderCellExpand,
  TableRow,
  TableRowDetails,
} from '../components/ui/Table'

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendente',
  sent: 'Enviada',
  failed: 'Falha',
}

const STATUS_ICONS: Record<string, typeof MailCheck> = {
  pending: Clock,
  sent: MailCheck,
  failed: MailX,
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'text-warning bg-warning/10',
  sent: 'text-success bg-success/10',
  failed: 'text-danger bg-danger/10',
}

const MOBILE_COL_SPAN = 3

export function NotificationHistoryPage() {
  const queryClient = useQueryClient()
  const [statusFilter, setStatusFilter] = useState('')

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['notification-history', statusFilter],
    queryFn: () => engineService.listNotificationHistory({ status: statusFilter || undefined }),
  })

  const retryMutation = useMutation({
    mutationFn: engineService.retryNotification,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notification-history'] }),
  })

  return (
    <div>
      <PageHeader title="Histórico de envios" description="Status de todas as notificações enviadas pelo sistema" />

      <div className="mb-4 max-w-44">
        <Select
          value={statusFilter}
          options={[
            { value: '', label: 'Todos' },
            { value: 'sent', label: 'Enviadas' },
            { value: 'failed', label: 'Falhas' },
            { value: 'pending', label: 'Pendentes' },
          ]}
          onChange={(v) => setStatusFilter(v as string)}
          aria-label="Filtrar por status"
        />
      </div>

      {isLoading ? (
        <p className="text-sm text-foreground-muted">Carregando...</p>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-surface-sunken px-4 py-12 text-center">
          <p className="text-sm text-foreground-muted">Nenhuma notificação encontrada.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-surface-sunken">
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Assunto</TableHeaderCell>
                <TableHeaderCellCollapsible>Colaborador</TableHeaderCellCollapsible>
                <TableHeaderCellCollapsible>Status</TableHeaderCellCollapsible>
                <TableHeaderCellCollapsible>Data</TableHeaderCellCollapsible>
                <TableHeaderCellExpand />
                <TableHeaderCell className="w-10 text-right md:w-28">Ações</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item) => {
                const StatusIcon = STATUS_ICONS[item.status] ?? MailCheck
                const canRetry = item.status === 'failed' || item.status === 'pending'

                return (
                  <ExpandableTableRow
                    key={item.id}
                    mobileColSpan={MOBILE_COL_SPAN}
                    details={
                      <TableRowDetails>
                        <TableDetail label="Assunto">{item.title}</TableDetail>
                        <TableDetail label="Colaborador">{item.user_name ?? '—'}</TableDetail>
                        <TableDetail label="Status">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[item.status]}`}>
                            <StatusIcon className="size-3" />
                            {STATUS_LABELS[item.status]}
                          </span>
                        </TableDetail>
                        <TableDetail label="Data">{formatDateTime(item.created_at)}</TableDetail>
                        {item.sent_at && <TableDetail label="Enviado em">{formatDateTime(item.sent_at)}</TableDetail>}
                        {item.error && <TableDetail label="Erro"><span className="text-danger">{item.error}</span></TableDetail>}
                      </TableRowDetails>
                    }
                  >
                    <TableCell className="font-medium">{item.title}</TableCell>
                    <TableCellCollapsible>{item.user_name ?? '—'}</TableCellCollapsible>
                    <TableCellCollapsible>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[item.status]}`}>
                        <StatusIcon className="size-3" />
                        {STATUS_LABELS[item.status]}
                      </span>
                    </TableCellCollapsible>
                    <TableCellCollapsible>{formatDateTime(item.created_at)}</TableCellCollapsible>
                    <TableCell className="text-right">
                      {canRetry && (
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={retryMutation.isPending}
                          onClick={() => retryMutation.mutate(item.id)}
                        >
                          <RefreshCw className="size-4" />
                          <span className="hidden md:inline">Reenviar</span>
                        </Button>
                      )}
                    </TableCell>
                  </ExpandableTableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
