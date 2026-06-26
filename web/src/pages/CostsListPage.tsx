import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Pencil, Trash2 } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { useState } from 'react'
import { deleteCost, getReport, paginateCosts } from '../services/costService'
import { PageHeader } from '../components/ui/PageHeader'
import { Button } from '../components/ui/Button'
import { Card, CardHeader, CardTitle } from '../components/ui/Card'
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableHeaderCellCollapsible, TableRow, ExpandableTableRow, TableRowDetails, TableDetail } from '../components/ui/Table'
import { TablePagination } from '../components/ui/TablePagination'
import { ConfirmModal } from '../components/ui/ConfirmModal'
import { useTablePagination } from '../hooks/useTablePagination'
import { usePermissions } from '../hooks/usePermissions'
import type { CollaboratorCost } from '../types/cost'

function currency(value: number | string): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value))
}

export function CostsListPage() {
  const { page, perPage, setPage, setPerPage, allowedPerPageOptions } = useTablePagination()
  const queryClient = useQueryClient()
  const { can } = usePermissions()
  const [deleteTarget, setDeleteTarget] = useState<CollaboratorCost | null>(null)

  const { data: costsData, isLoading } = useQuery({
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

  const costsList = costsData?.data ?? []
  const meta = costsData?.meta
  const totalCost = report.reduce((sum, r) => sum + r.total, 0)

  return (
    <>
      <PageHeader
        title="Custos"
        description={`Demonstrativo mensal — ${currency(totalCost)}`}
        action={
          can('costs.create') && (
            <Link to="/costs/novo">
              <Button variant="primary" size="sm">Adicionar benefício</Button>
            </Link>
          )
        }
      />

      {report.length > 0 ? (
        <Card className="mb-6">
          <CardHeader className="text-left">
            <CardTitle>Demonstrativo Mensal</CardTitle>
          </CardHeader>

          <div className="space-y-4">
            {report.map((row) => (
              <div key={row.user_id} className="rounded-lg bg-surface-sunken p-4">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-foreground">{row.user_name}</p>
                  <p className="font-semibold text-foreground">{currency(row.total)}</p>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {Object.entries(row.categories).map(([name, amount]) => (
                    <span key={name} className="inline-flex items-center gap-1 rounded-full bg-surface px-2 py-0.5 text-xs text-foreground-muted">
                      {name}: {currency(amount)}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      ) : (
        <p className="mb-6 text-sm text-foreground-muted">Nenhum dado de custo disponível.</p>
      )}

      <Card>
        <CardHeader className="text-left">
          <CardTitle>Benefícios manuais</CardTitle>
        </CardHeader>

        {isLoading ? (
          <p className="text-sm text-foreground-muted">Carregando...</p>
        ) : costsList.length === 0 ? (
          <p className="py-4 text-center text-sm text-foreground-muted">Nenhum benefício cadastrado.</p>
        ) : (
          <>
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Colaborador</TableHeaderCell>
                  <TableHeaderCellCollapsible>Categoria</TableHeaderCellCollapsible>
                  <TableHeaderCell>Valor</TableHeaderCell>
                  <TableHeaderCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {costsList.map((cost) => (
                  <ExpandableTableRow
                    key={cost.id}
                    mobileColSpan={4}
                    details={
                      <TableRowDetails>
                        <TableDetail label="Categoria">{cost.category?.name ?? '-'}</TableDetail>
                      </TableRowDetails>
                    }
                  >
                    <TableCell className="font-medium">{cost.user?.name ?? `#${cost.user_id}`}</TableCell>
                    <TableCell>{cost.category?.name ?? '-'}</TableCell>
                    <TableCell className="font-medium">{currency(cost.amount)}</TableCell>
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
      </Card>

      <ConfirmModal
        open={deleteTarget !== null}
        title="Remover benefício"
        description={`Remover o benefício de ${currency(deleteTarget?.amount ?? 0)}?`}
        confirmLabel="Remover"
        isLoading={deleteMutation.isPending}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  )
}
