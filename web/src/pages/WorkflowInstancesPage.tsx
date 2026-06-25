import { useQuery } from '@tanstack/react-query'
import { Eye } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { listInstances, WORKFLOW_TYPE_LABELS } from '../services/workflowService'
import { PageHeader } from '../components/ui/PageHeader'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableHeaderCellCollapsible,
  TableRow,
  ExpandableTableRow,
  TableRowDetails,
  TableDetail,
} from '../components/ui/Table'
import { WorkflowStatusBadge } from '../components/workflow/WorkflowStatusBadge'
import { Button } from '../components/ui/Button'
import type { WorkflowType } from '../types/workflow'

function formatDate(iso?: string | null): string {
  if (!iso) return '-'

  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function WorkflowInstancesPage() {
  const { data: instances = [], isLoading } = useQuery({
    queryKey: ['workflow-instances'],
    queryFn: listInstances,
  })

  return (
    <>
      <PageHeader title="Processos" />

      {isLoading ? (
        <p className="py-8 text-center text-sm text-foreground-muted">
          Carregando...
        </p>
      ) : instances.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-surface-sunken p-8 text-center">
          <p className="text-sm text-foreground-muted">
            Nenhum processo encontrado.
          </p>
        </div>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Título</TableHeaderCell>
              <TableHeaderCellCollapsible>Tipo</TableHeaderCellCollapsible>
              <TableHeaderCellCollapsible>Solicitante</TableHeaderCellCollapsible>
              <TableHeaderCellCollapsible>Etapa atual</TableHeaderCellCollapsible>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCellCollapsible>Data</TableHeaderCellCollapsible>
              <TableHeaderCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {instances.map((instance) => (
              <ExpandableTableRow
                key={instance.id}
                details={
                  <TableRowDetails>
                    <TableDetail label="Tipo">
                      {WORKFLOW_TYPE_LABELS[instance.workflow_type as WorkflowType] ?? instance.workflow_type}
                    </TableDetail>
                    <TableDetail label="Solicitante">
                      {instance.initiated_by?.name ?? '-'}
                    </TableDetail>
                    <TableDetail label="Etapa atual">
                      {instance.current_step?.name ?? '-'}
                    </TableDetail>
                    <TableDetail label="Data">
                      {formatDate(instance.created_at)}
                    </TableDetail>
                  </TableRowDetails>
                }
                mobileColSpan={7}
              >
                <TableCell className="w-full font-medium">
                  {instance.title}
                </TableCell>
                <TableCell>
                  {WORKFLOW_TYPE_LABELS[instance.workflow_type as WorkflowType] ?? instance.workflow_type}
                </TableCell>
                <TableCell>
                  {instance.initiated_by?.name ?? '-'}
                </TableCell>
                <TableCell>
                  {instance.current_step?.name ?? '-'}
                </TableCell>
                <TableCell>
                  <WorkflowStatusBadge status={instance.status} />
                </TableCell>
                <TableCell>
                  {formatDate(instance.created_at)}
                </TableCell>
                <TableCell>
                  <Link
                    to="/workflow-instances/$id"
                    params={{ id: String(instance.id) }}
                  >
                    <Button variant="ghost" size="sm" aria-label="Ver detalhes">
                      <Eye className="size-4" />
                    </Button>
                  </Link>
                </TableCell>
              </ExpandableTableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </>
  )
}
