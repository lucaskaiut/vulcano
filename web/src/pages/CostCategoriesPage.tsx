import { useQuery } from '@tanstack/react-query'
import { Pencil } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { paginateCategories } from '../services/costService'
import { PageHeader } from '../components/ui/PageHeader'
import { Button } from '../components/ui/Button'
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '../components/ui/Table'
import { TablePagination } from '../components/ui/TablePagination'
import { useTablePagination } from '../hooks/useTablePagination'
import { usePermissions } from '../hooks/usePermissions'

export function CostCategoriesPage() {
  const { page, perPage, setPage, setPerPage, allowedPerPageOptions } = useTablePagination()
  const { can } = usePermissions()

  const { data, isLoading } = useQuery({
    queryKey: ['cost-categories', page, perPage],
    queryFn: () => paginateCategories({ page, per_page: perPage }),
  })

  const categories = data?.data ?? []
  const meta = data?.meta

  return (
    <>
      <PageHeader
        title="Categorias de custo"
        action={
          can('costs.create') && (
            <Link to="/cost-categories/novo">
              <Button variant="primary" size="sm">Nova categoria</Button>
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
              <TableHeaderCell>Tipo</TableHeaderCell>
              <TableHeaderCell>Ativo</TableHeaderCell>
              <TableHeaderCell> </TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categories.length === 0 ? (
              <TableRow>
                <TableCell className="text-center text-foreground-muted">Nenhuma categoria cadastrada.</TableCell>
              </TableRow>
            ) : (
              categories.map((cat) => (
                <TableRow key={cat.id}>
                  <TableCell className="font-medium">{cat.name}</TableCell>
                  <TableCell className="text-foreground-muted">{cat.type}</TableCell>
                  <TableCell>{cat.active ? 'Sim' : 'Não'}</TableCell>
                  <TableCell>
                    {can('costs.update') && (
                      <Link to="/cost-categories/$id/editar" params={{ id: String(cat.id) }}>
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
