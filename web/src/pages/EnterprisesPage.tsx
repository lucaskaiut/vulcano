import { useQuery } from '@tanstack/react-query'
import { Pencil } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { paginateEnterprises } from '../services/commissionService'
import { PageHeader } from '../components/ui/PageHeader'
import { Button } from '../components/ui/Button'
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '../components/ui/Table'
import { TablePagination } from '../components/ui/TablePagination'
import { useTablePagination } from '../hooks/useTablePagination'
import { usePermissions } from '../hooks/usePermissions'

export function EnterprisesPage() {
  const { page, perPage, setPage, setPerPage, allowedPerPageOptions } = useTablePagination()
  const { can } = usePermissions()

  const { data, isLoading } = useQuery({
    queryKey: ['enterprises', page, perPage],
    queryFn: () => paginateEnterprises({ page, per_page: perPage }),
  })

  const enterprises = data?.data ?? []
  const meta = data?.meta

  return (
    <>
      <PageHeader
        title="Empreendimentos"
        action={
          can('enterprises.create') && (
            <Link to="/enterprises/novo">
              <Button variant="primary" size="sm">Novo empreendimento</Button>
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
            {enterprises.length === 0 ? (
              <TableRow>
                <TableCell className="text-center text-foreground-muted">Nenhum empreendimento cadastrado.</TableCell>
              </TableRow>
            ) : (
              enterprises.map((enterprise) => (
                <TableRow key={enterprise.id}>
                  <TableCell className="font-medium">{enterprise.name}</TableCell>
                  <TableCell>
                    {can('enterprises.update') && (
                      <Link to="/enterprises/$id/editar" params={{ id: String(enterprise.id) }}>
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
