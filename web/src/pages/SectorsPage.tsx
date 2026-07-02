import { useQuery } from '@tanstack/react-query'
import { Pencil } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { paginateSectors } from '../services/aclService'
import { PageHeader } from '../components/ui/PageHeader'
import { Button } from '../components/ui/Button'
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '../components/ui/Table'
import { TablePagination } from '../components/ui/TablePagination'
import { useTablePagination } from '../hooks/useTablePagination'
import { usePermissions } from '../hooks/usePermissions'

export function SectorsPage() {
  const { page, perPage, setPage, setPerPage, allowedPerPageOptions } = useTablePagination()
  const { can } = usePermissions()

  const { data, isLoading } = useQuery({
    queryKey: ['sectors', page, perPage],
    queryFn: () => paginateSectors({ page, per_page: perPage }),
  })

  const sectors = data?.data ?? []
  const meta = data?.meta

  return (
    <>
      <PageHeader
        title="Setores"
        action={
          can('users.create') && (
            <Link to="/sectors/novo">
              <Button variant="primary" size="sm">Novo setor</Button>
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
              <TableHeaderCell> </TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sectors.length === 0 ? (
              <TableRow>
                <TableCell className="text-center text-foreground-muted">Nenhum setor cadastrado.</TableCell>
              </TableRow>
            ) : (
              sectors.map((sector) => (
                <TableRow key={sector.id}>
                  <TableCell className="font-medium">{sector.name}</TableCell>
                  <TableCell>
                    {can('users.update') && (
                      <Link to="/sectors/$id/editar" params={{ id: String(sector.id) }}>
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
