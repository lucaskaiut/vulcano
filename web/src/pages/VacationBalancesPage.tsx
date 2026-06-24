import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import * as vacationService from '../services/vacationService'
import { Alert } from '../components/ui/Alert'
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
import { TablePagination } from '../components/ui/TablePagination'
import { useTablePagination } from '../hooks/useTablePagination'
import { formatDays } from '../lib/format'

export function VacationBalancesPage() {
  const { page, perPage, setPage, setPerPage, allowedPerPageOptions } = useTablePagination()

  const balancesQuery = useQuery({
    queryKey: ['vacation-balances', page, perPage],
    queryFn: () => vacationService.listVacationBalances({ page, per_page: perPage }),
  })

  const balances = balancesQuery.data?.data ?? []
  const meta = balancesQuery.data?.meta

  return (
    <div>
      <PageHeader
        title="Saldos de férias"
        description="Visão geral do saldo de férias de todos os colaboradores."
      />

      {balancesQuery.isLoading ? (
        <p className="text-sm text-foreground-muted">Carregando saldos...</p>
      ) : balancesQuery.isError ? (
        <Alert variant="danger">Não foi possível carregar os saldos de férias.</Alert>
      ) : (
        <Card className="overflow-hidden">
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Colaborador</TableHeaderCell>
                <TableHeaderCell>Cargo</TableHeaderCell>
                <TableHeaderCell>Disponível</TableHeaderCell>
                <TableHeaderCell>Adquiridos</TableHeaderCell>
                <TableHeaderCell>Utilizados</TableHeaderCell>
                <TableHeaderCell>Adicionais</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {balances.length === 0 ? (
                <TableRow>
                  <TableCell className="text-center text-foreground-muted">
                    Nenhum saldo de férias cadastrado.
                  </TableCell>
                </TableRow>
              ) : (
                balances.map((balance) => (
                  <TableRow key={balance.id}>
                    <TableCell>
                      <Link
                        to={`/users/${balance.user_id}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {balance.user?.name ?? `Colaborador #${balance.user_id}`}
                      </Link>
                    </TableCell>
                    <TableCell>{balance.user?.job_title ?? '—'}</TableCell>
                    <TableCell>{formatDays(balance.available_days)}</TableCell>
                    <TableCell>{formatDays(balance.accrued_days)}</TableCell>
                    <TableCell>{formatDays(balance.used_days)}</TableCell>
                    <TableCell>{formatDays(balance.additional_days)}</TableCell>
                  </TableRow>
                ))
              )}
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
        </Card>
      )}
    </div>
  )
}
