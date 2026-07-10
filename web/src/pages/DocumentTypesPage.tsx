import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Pencil, Trash2 } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { useState } from 'react'
import * as documentService from '../services/documentService'
import { PageHeader } from '../components/ui/PageHeader'
import { Button } from '../components/ui/Button'
import { ConfirmModal } from '../components/ui/ConfirmModal'
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '../components/ui/Table'
import { usePermissions } from '../hooks/usePermissions'
import type { DocumentType } from '../types/document'

export function DocumentTypesPage() {
  const { can } = usePermissions()
  const queryClient = useQueryClient()
  const [deleting, setDeleting] = useState<DocumentType | null>(null)

  const { data: types = [], isLoading } = useQuery({
    queryKey: ['document-types'],
    queryFn: () => documentService.listDocumentTypes(),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => documentService.deleteDocumentType(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['document-types'] })
      setDeleting(null)
    },
    onError: () => {
      setDeleting(null)
    },
  })

  return (
    <>
      <PageHeader
        title="Tipos de documento"
        action={
          can('document_types.create') && (
            <Link to="/document-types/novo">
              <Button variant="primary" size="sm">Novo tipo</Button>
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
              <TableHeaderCell>Exige vencimento</TableHeaderCell>
              <TableHeaderCell> </TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {types.length === 0 ? (
              <TableRow>
                <TableCell className="text-center text-foreground-muted">Nenhum tipo de documento encontrado.</TableCell>
              </TableRow>
            ) : (
              types.map((type) => (
                <TableRow key={type.id}>
                  <TableCell className="font-medium text-foreground">{type.name}</TableCell>
                  <TableCell>
                    {type.expiration_required ? (
                      <span className="inline-flex items-center rounded-full bg-warning/10 px-2 py-0.5 text-xs font-medium text-warning">Sim</span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-surface-sunken px-2 py-0.5 text-xs font-medium text-foreground-muted">Não</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {can('document_types.update') && (
                        <Link to="/document-types/$id/editar" params={{ id: String(type.id) }}>
                          <Button variant="ghost" size="sm">
                            <Pencil className="size-4" aria-hidden />
                            Editar
                          </Button>
                        </Link>
                      )}
                      {can('document_types.delete') && (
                        <Button variant="ghost" size="sm" onClick={() => setDeleting(type)}>
                          <Trash2 className="size-4 text-danger" aria-hidden />
                          Excluir
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}

      <ConfirmModal
        open={deleting !== null}
        title="Excluir tipo de documento"
        description={`Tem certeza que deseja excluir o tipo "${deleting?.name}"?`}
        confirmLabel="Excluir"
        isLoading={deleteMutation.isPending}
        onConfirm={() => {
          if (deleting) deleteMutation.mutate(deleting.id)
        }}
        onCancel={() => setDeleting(null)}
      />
    </>
  )
}
