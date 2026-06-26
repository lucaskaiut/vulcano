import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Eye, Filter, Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { ApiError } from '../services/api'
import { getApiErrorMessage } from '../services/getApiErrorMessage'
import * as aclService from '../services/aclService'
import { Alert } from '../components/ui/Alert'
import { Button } from '../components/ui/Button'
import { ConfirmModal } from '../components/ui/ConfirmModal'
import { PageHeader } from '../components/ui/PageHeader'
import { SortableTableHeader } from '../components/ui/SortableTableHeader'
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
import { TablePagination } from '../components/ui/TablePagination'
import { UserFilterBadges } from '../components/users/UserFilterBadges'
import { UserFiltersDrawer } from '../components/users/UserFiltersDrawer'
import { useTablePagination } from '../hooks/useTablePagination'
import { useConfirmDialog } from '../hooks/useConfirmDialog'
import { useUserFilters } from '../hooks/useUserFilters'
import { useTableSort } from '../hooks/useTableSort'
import { formatDate, formatSalary } from '../lib/format'
import { encodeSorts } from '../lib/sortQuery'

const USER_SORTABLE_COLUMNS = ['name', 'job_title', 'hired_at'] as const

/** Colunas visíveis no mobile: nome + expansão + ações */
const USER_MOBILE_COL_SPAN = 3

export function UsersPage() {
  const queryClient = useQueryClient()
  const [filtersOpen, setFiltersOpen] = useState(false)
  const { confirm, confirmState, resolveConfirm, rejectConfirm } = useConfirmDialog()
  const {
    drawerFilters,
    apiFilters,
    activeFilterCount,
    applyDrawerFilters,
    clearDrawerFilters,
    removeFilter,
  } = useUserFilters()
  const { page, perPage, setPage, setPerPage, allowedPerPageOptions } = useTablePagination()
  const { sorts, querySorts, toggleSort } = useTableSort({
    tableKey: 'users',
    sortableColumns: [...USER_SORTABLE_COLUMNS],
  })

  const usersQuery = useQuery({
    queryKey: ['users', encodeSorts(querySorts), page, perPage, apiFilters],
    queryFn: () =>
      aclService.listUsers({
        sorts: querySorts,
        page,
        per_page: perPage,
        filters: apiFilters,
      }),
  })

  const deleteMutation = useMutation({
    mutationFn: aclService.deleteUser,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['users'] })
    },
    onError: (mutationError) => {
      if (mutationError instanceof ApiError) {
        window.alert(getApiErrorMessage(mutationError))
      }
    },
  })

  const users = usersQuery.data?.data ?? []

  return (
    <div>
      <PageHeader
        title="Colaboradores"
        description="Gerencie colaboradores, cargos, remuneração e acesso ao sistema."
        action={
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setFiltersOpen(true)}
              className="relative inline-flex w-full items-center justify-center gap-2 sm:w-auto"
            >
              <Filter className="size-4" aria-hidden />
              Filtros
              {activeFilterCount > 0 && (
                <span className="ml-1 inline-flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
                  {activeFilterCount}
                </span>
              )}
            </Button>
            <Link to="/users/novo" className="w-full sm:w-auto">
              <Button type="button" className="w-full">
                Novo colaborador
              </Button>
            </Link>
          </div>
        }
      />

      {usersQuery.isLoading ? (
        <p className="text-sm text-foreground-muted">Carregando colaboradores...</p>
      ) : usersQuery.isError ? (
        <Alert variant="danger">Não foi possível carregar os colaboradores.</Alert>
      ) : (
        <>
          <UserFilterBadges
            filters={drawerFilters}
            onRemove={removeFilter}
            onClearAll={clearDrawerFilters}
          />

          <Table>
            <TableHead>
            <TableRow>
              <SortableTableHeader label="Nome" column="name" sorts={sorts} onSort={toggleSort} />
              <SortableTableHeader
                label="Cargo"
                column="job_title"
                sorts={sorts}
                onSort={toggleSort}
                className="hidden md:table-cell"
              />
              <SortableTableHeader
                label="Contratação"
                column="hired_at"
                sorts={sorts}
                onSort={toggleSort}
                className="hidden lg:table-cell"
              />
              <TableHeaderCellCollapsible>Gestor</TableHeaderCellCollapsible>
              <TableHeaderCellCollapsible>Remuneração</TableHeaderCellCollapsible>
              <TableHeaderCellExpand />
              <TableHeaderCell className="w-28 text-right">Ações</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => {
              const rolesLabel = user.roles?.map((role) => role.name).join(', ') || '—'

              return (
                <ExpandableTableRow
                  key={user.id}
                  mobileColSpan={USER_MOBILE_COL_SPAN}
                  details={
                    <TableRowDetails>
                      <TableDetail label="Cargo">{user.job_title}</TableDetail>
                      <TableDetail label="Contratação">{formatDate(user.hired_at)}</TableDetail>
                      <TableDetail label="Gestor">{user.manager?.name ?? '—'}</TableDetail>
                      <TableDetail label="Remuneração">{formatSalary(user.salary)}</TableDetail>
                      <TableDetail label="E-mail">{user.email}</TableDetail>
                      <TableDetail label="Perfis">{rolesLabel}</TableDetail>
                    </TableRowDetails>
                  }
                >
                  <TableCell className="truncate">{user.name}</TableCell>
                  <TableCellCollapsible className="truncate">{user.job_title}</TableCellCollapsible>
                  <TableCell className="hidden lg:table-cell">{formatDate(user.hired_at)}</TableCell>
                  <TableCellCollapsible>{user.manager?.name ?? '—'}</TableCellCollapsible>
                  <TableCellCollapsible>{formatSalary(user.salary)}</TableCellCollapsible>
                  <TableCell className="text-right">
                    <div className="flex gap-1 justify-end">
                      <Link to="/users/$id" params={{ id: String(user.id) }}>
                        <Button variant="ghost" size="sm" aria-label={`Ver ${user.name}`}>
                          <Eye className="size-4" />
                        </Button>
                      </Link>
                      <Link to="/users/$id/editar" params={{ id: String(user.id) }}>
                        <Button variant="ghost" size="sm" aria-label={`Editar ${user.name}`}>
                          <Pencil className="size-4" />
                        </Button>
                      </Link>
                      <Button variant="ghost" size="sm" aria-label={`Excluir ${user.name}`} onClick={async () => {
                        const confirmed = await confirm({
                          title: 'Excluir colaborador',
                          description: `Tem certeza que deseja excluir ${user.name}? Esta ação não pode ser desfeita.`,
                          confirmLabel: 'Excluir',
                        })
                        if (confirmed) deleteMutation.mutate(user.id)
                      }}>
                        <Trash2 className="size-4 text-danger" />
                      </Button>
                    </div>
                  </TableCell>
                </ExpandableTableRow>
              )
            })}
          </TableBody>
          </Table>

          {usersQuery.data?.meta && (
            <TablePagination
              meta={usersQuery.data.meta}
              perPage={perPage}
              allowedPerPageOptions={allowedPerPageOptions}
              onPageChange={setPage}
              onPerPageChange={setPerPage}
            />
          )}
        </>
      )}

      {confirmState && (
        <ConfirmModal
          open
          title={confirmState.title}
          description={confirmState.description}
          confirmLabel={confirmState.confirmLabel}
          cancelLabel={confirmState.cancelLabel}
          onConfirm={resolveConfirm}
          onCancel={rejectConfirm}
        />
      )}

      <UserFiltersDrawer
        open={filtersOpen}
        initialFilters={drawerFilters}
        onClose={() => setFiltersOpen(false)}
        onApply={(filters) => {
          applyDrawerFilters(filters)
          setFiltersOpen(false)
        }}
        onClear={() => {
          clearDrawerFilters()
          setFiltersOpen(false)
        }}
      />
    </div>
  )
}
