import { useQuery } from '@tanstack/react-query'
import { Pencil } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import * as documentService from '../services/documentService'
import { PageHeader } from '../components/ui/PageHeader'
import { Button } from '../components/ui/Button'
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '../components/ui/Table'
import { usePermissions } from '../hooks/usePermissions'

export function DocumentTypesPage() {
  const { can } = usePermissions()

  const { data: types = [], isLoading } = useQuery({
    queryKey: ['document-types'],
    queryFn: () => documentService.listDocumentTypes(),
  })

  return (
    <>
      <PageHeader
        title="Tipos de documento"
        action={
          can('documents.create') && (
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
                <TableCell colSpan={3} className="py-8 text-center text-sm text-foreground-muted">
                  Nenhum tipo de documento encontrado.
                </TableCell>
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
                    {can('documents.create') && (
                      <Link to="/document-types/$id/editar" params={{ id: String(type.id) }}>
                        <Button variant="ghost" size="sm">
                          <Pencil className="size-4" aria-hidden />
                          Editar
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
    </>
  )
}
