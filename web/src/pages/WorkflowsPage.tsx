import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { Alert } from '../components/ui/Alert'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { PageHeader } from '../components/ui/PageHeader'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from '../components/ui/Table'
import * as workflowService from '../services/workflowService'

export function WorkflowsPage() {
  const navigate = useNavigate()

  const workflowsQuery = useQuery({
    queryKey: ['workflows'],
    queryFn: () => workflowService.listWorkflows(),
  })

  const workflows = workflowsQuery.data ?? []

  return (
    <div>
      <PageHeader
        title="Fluxos de aprovação"
        description="Configure fluxos de aprovação com etapas e responsáveis."
        action={
          <Button type="button" onClick={() => navigate({ to: '/workflows/novo' })}>
            Novo fluxo
          </Button>
        }
      />

      {workflowsQuery.isLoading ? (
        <p className="text-sm text-foreground-muted">Carregando fluxos...</p>
      ) : workflowsQuery.isError ? (
        <Alert variant="danger">Não foi possível carregar os fluxos.</Alert>
      ) : (
        <Card className="overflow-hidden">
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Nome</TableHeaderCell>
                <TableHeaderCell>Descrição</TableHeaderCell>
                <TableHeaderCell>Etapas</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {workflows.length === 0 ? (
                <TableRow>
                  <TableCell className="text-center text-foreground-muted">
                    Nenhum fluxo cadastrado.
                  </TableCell>
                </TableRow>
              ) : (
                workflows.map((workflow) => {
                  const stepsCount = workflow.steps?.length ?? 0

                  return (
                    <tr
                      key={workflow.id}
                      className="cursor-pointer border-b border-surface-sunken hover:bg-surface-sunken/50"
                      onClick={() => navigate({ to: `/workflows/${workflow.id}/editar` })}
                    >
                      <td className="px-4 py-3 font-medium text-foreground">{workflow.name}</td>
                      <td className="px-4 py-3 text-foreground-muted">
                        {workflow.description ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-foreground-muted">
                        {stepsCount} etapa{stepsCount !== 1 ? 's' : ''}
                      </td>
                      <td className="px-4 py-3">
                        {workflow.is_active ? (
                          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                            Ativo
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                            Inativo
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  )
}
