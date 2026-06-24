import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
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
import { TableRowActions } from '../components/ui/TableRowActions'
import { TablePagination } from '../components/ui/TablePagination'
import { useTablePagination } from '../hooks/useTablePagination'
import { useConfirmDialog } from '../hooks/useConfirmDialog'
import { useTableSort } from '../hooks/useTableSort'
import { encodeSorts } from '../lib/sortQuery'

const ROLE_SORTABLE_COLUMNS = ['name', 'description'] as const

/** Colunas visíveis no mobile: nome + expansão + ações */
const ROLE_MOBILE_COL_SPAN = 3

export function RolesPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { confirm, confirmState, resolveConfirm, rejectConfirm } = useConfirmDialog()
  const { page, perPage, setPage, setPerPage, allowedPerPageOptions } = useTablePagination()
  const { sorts, querySorts, toggleSort } = useTableSort({
    tableKey: 'roles',
    sortableColumns: [...ROLE_SORTABLE_COLUMNS],
  })

  const rolesQuery = useQuery({
    queryKey: ['roles', encodeSorts(querySorts), page, perPage],
    queryFn: () =>
      aclService.listRoles({
        sorts: querySorts,
        page,
        per_page: perPage,
      }),
  })

  const deleteMutation = useMutation({
    mutationFn: aclService.deleteRole,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['roles'] })
    },
    onError: (mutationError) => {
      if (mutationError instanceof ApiError) {
        window.alert(getApiErrorMessage(mutationError))
      }
    },
  })

  const roles = rolesQuery.data?.data ?? []

  return (
    <div>
      <PageHeader
        title="Perfis"
        description="Configure perfis de acesso e suas permissões."
        action={
          <Link to="/roles/novo">
            <Button type="button">Novo perfil</Button>
          </Link>
        }
      />

      {rolesQuery.isLoading ? (
        <p className="text-sm text-foreground-muted">Carregando perfis...</p>
      ) : rolesQuery.isError ? (
        <Alert variant="danger">Não foi possível carregar os perfis.</Alert>
      ) : (
        <>
          <Table>
            <TableHead>
            <TableRow>
              <SortableTableHeader label="Nome" column="name" sorts={sorts} onSort={toggleSort} />
              <SortableTableHeader
                label="Descrição"
                column="description"
                sorts={sorts}
                onSort={toggleSort}
                className="hidden md:table-cell"
              />
              <TableHeaderCellCollapsible>Permissões</TableHeaderCellCollapsible>
              <TableHeaderCellExpand />
              <TableHeaderCell className="w-20 text-right md:w-24">Ações</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {roles.map((role) => {
              const permissionsCount = role.permissions?.length ?? 0

              return (
                <ExpandableTableRow
                  key={role.id}
                  mobileColSpan={ROLE_MOBILE_COL_SPAN}
                  details={
                    <TableRowDetails>
                      <TableDetail label="Descrição">{role.description ?? '—'}</TableDetail>
                      <TableDetail label="Permissões">{permissionsCount}</TableDetail>
                    </TableRowDetails>
                  }
                >
                  <TableCell className="truncate">{role.name}</TableCell>
                  <TableCellCollapsible>{role.description ?? '—'}</TableCellCollapsible>
                  <TableCellCollapsible>{permissionsCount}</TableCellCollapsible>
                  <TableCell className="text-right">
                    <TableRowActions
                      editLabel={`Editar perfil ${role.name}`}
                      deleteLabel={`Excluir perfil ${role.name}`}
                      onEdit={() => navigate({ to: `/roles/${role.id}/editar` })}
                      onDelete={async () => {
                        const confirmed = await confirm({
                          title: 'Excluir perfil',
                          description: `Tem certeza que deseja excluir o perfil ${role.name}? Esta ação não pode ser desfeita.`,
                          confirmLabel: 'Excluir',
                        })

                        if (confirmed) {
                          deleteMutation.mutate(role.id)
                        }
                      }}
                    />
                  </TableCell>
                </ExpandableTableRow>
              )
            })}
          </TableBody>
          </Table>

          {rolesQuery.data?.meta && (
            <TablePagination
              meta={rolesQuery.data.meta}
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
    </div>
  )
}
