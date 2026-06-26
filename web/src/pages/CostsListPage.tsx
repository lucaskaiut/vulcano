import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Pencil, Trash2 } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { useState } from 'react'
import { deleteCost, paginateCosts } from '../services/costService'
import { PageHeader } from '../components/ui/PageHeader'
import { Button } from '../components/ui/Button'
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableHeaderCellCollapsible, TableRow, ExpandableTableRow, TableRowDetails, TableDetail } from '../components/ui/Table'
import { TablePagination } from '../components/ui/TablePagination'
import { ConfirmModal } from '../components/ui/ConfirmModal'
import { useTablePagination } from '../hooks/useTablePagination'
import { usePermissions } from '../hooks/usePermissions'
import type { CollaboratorCost } from '../types/cost'
import { getReport } from '../services/costService'

function currency(value: number | string): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value))
}

export function CostsListPage() {
  const { page, perPage, setPage, setPerPage, allowedPerPageOptions } = useTablePagination()
  const queryClient = useQueryClient()
  const { can } = usePermissions()
  const [deleteTarget, setDeleteTarget] = useState<CollaboratorCost | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['collaborator-costs', page, perPage],
    queryFn: () => paginateCosts({ page, per_page: perPage }),
  })

  const { data: report = [] } = useQuery({
    queryKey: ['costs-report'],
    queryFn: () => getReport(),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteCost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collaborator-costs'] })
      queryClient.invalidateQueries({ queryKey: ['costs-report'] })
      setDeleteTarget(null)
    },
  })

  const costs = data?.data ?? []
  const meta = data?.meta
  const totalCost = report.reduce((sum, r) => sum + r.total, 0)

  return (
    <>
      <PageHeader
        title="Custos"
        description={totalCost > 0 ? `Total mensal: ${currency(totalCost)}` : undefined}
        action={
          can('costs.create') && (
            <Link to="/costs/novo">
              <Button variant="primary" size="sm">Vincular custo</Button>
            </Link>
          )
        }
      />

      {isLoading ? (
        <p className="text-sm text-foreground-muted">Carregando...</p>
      ) : costs.length === 0 ? (
        <p className="py-8 text-center text-sm text-foreground-muted">Nenhum custo cadastrado.</p>
      ) : (
        <>
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Colaborador</TableHeaderCell>
                <TableHeaderCellCollapsible>Categoria</TableHeaderCellCollapsible>
                <TableHeaderCell>Valor</TableHeaderCell>
                <TableHeaderCellCollapsible>Tipo</TableHeaderCellCollapsible>
                <TableHeaderCellCollapsible>Ref.</TableHeaderCellCollapsible>
                <TableHeaderCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {costs.map((cost) => (
                <ExpandableTableRow
                  key={cost.id}
                  mobileColSpan={6}
                  details={
                    <TableRowDetails>
                      <TableDetail label="Categoria">{cost.category?.name ?? '-'}</TableDetail>
                      <TableDetail label="Tipo">{cost.recurring ? 'Recorrente' : 'Pontual'}</TableDetail>
                      <TableDetail label="Referência">{cost.recurring ? 'Mensal' : cost.reference_month ?? '-'}</TableDetail>
                    </TableRowDetails>
                  }
                >
                  <TableCell className="font-medium">{cost.user?.name ?? `#${cost.user_id}`}</TableCell>
                  <TableCell>{cost.category?.name ?? '-'}</TableCell>
                  <TableCell className="font-medium">{currency(cost.amount)}</TableCell>
                  <TableCell>{cost.recurring ? 'Recorrente' : 'Pontual'}</TableCell>
                  <TableCell>{cost.recurring ? 'Mensal' : cost.reference_month ?? '-'}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {can('costs.update') && (
                        <Link to="/costs/$id/editar" params={{ id: String(cost.id) }}>
                          <Button variant="ghost" size="sm" aria-label="Editar">
                            <Pencil className="size-4" />
                          </Button>
                        </Link>
                      )}
                      {can('costs.delete') && (
                        <Button variant="ghost" size="sm" aria-label="Remover" onClick={() => setDeleteTarget(cost)}>
                          <Trash2 className="size-4 text-danger" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </ExpandableTableRow>
              ))}
            </TableBody>
          </Table>

          {meta && (
            <TablePagination
              meta={meta}
              perPage={perPage}
              onPageChange={setPage}
              onPerPageChange={setPerPage}
              allowedPerPageOptions={allowedPerPageOptions}
            />
          )}
        </>
      )}

      <ConfirmModal
        open={deleteTarget !== null}
        title="Remover custo"
        description={`Remover o custo de ${currency(deleteTarget?.amount ?? 0)}?`}
        confirmLabel="Remover"
        isLoading={deleteMutation.isPending}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  )
}
