import { useQuery } from '@tanstack/react-query'
import { Pencil } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { paginateProvisionRules } from '../services/costService'
import { PageHeader } from '../components/ui/PageHeader'
import { Button } from '../components/ui/Button'
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '../components/ui/Table'
import { TablePagination } from '../components/ui/TablePagination'
import { useTablePagination } from '../hooks/useTablePagination'
import { usePermissions } from '../hooks/usePermissions'

export function ProvisionRulesPage() {
  const { page, perPage, setPage, setPerPage, allowedPerPageOptions } = useTablePagination()
  const { can } = usePermissions()

  const { data, isLoading } = useQuery({
    queryKey: ['provision-rules', page, perPage],
    queryFn: () => paginateProvisionRules({ page, per_page: perPage }),
  })

  const rules = data?.data ?? []
  const meta = data?.meta

  return (
    <>
      <PageHeader
        title="Regras de provisão"
        action={
          can('costs.create') && (
            <Link to="/provision-rules/novo">
              <Button variant="primary" size="sm">Nova regra</Button>
            </Link>
          )
        }
      />

      {isLoading ? (
        <p className="text-sm text-foreground-muted">Carregando...</p>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Nome</TableHeaderCell>
              <TableHeaderCell>Percentual</TableHeaderCell>
              <TableHeaderCell>Ativo</TableHeaderCell>
              <TableHeaderCell> </TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rules.length === 0 ? (
              <TableRow>
                <TableCell className="text-center text-foreground-muted">Nenhuma regra cadastrada.</TableCell>
              </TableRow>
            ) : (
              rules.map((rule) => (
                <TableRow key={rule.id}>
                  <TableCell className="font-medium">{rule.name}</TableCell>
                  <TableCell className="text-foreground-muted">{Number(rule.percentage).toFixed(4)}%</TableCell>
                  <TableCell>{rule.active ? 'Sim' : 'Não'}</TableCell>
                  <TableCell>
                    {can('costs.create') && (
                      <Link to="/provision-rules/$id/editar" params={{ id: String(rule.id) }}>
                        <Button variant="ghost" size="sm" aria-label="Editar">
                          <Pencil className="size-4" />
                        </Button>
                      </Link>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}

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
  )
}
