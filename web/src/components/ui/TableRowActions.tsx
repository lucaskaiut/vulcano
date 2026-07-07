import { Eye, Pencil, Trash2 } from 'lucide-react'

type TableRowActionsProps = {
  onEdit: () => void
  onDelete: () => void
  onView?: () => void
  editLabel?: string
  deleteLabel?: string
  viewLabel?: string
}

export function TableRowActions({
  onEdit,
  onDelete,
  onView,
  editLabel = 'Editar',
  deleteLabel = 'Excluir',
  viewLabel = 'Ver detalhes',
}: TableRowActionsProps) {
  return (
    <div className="inline-flex justify-end gap-1">
      {onView && (
        <button
          type="button"
          onClick={onView}
          aria-label={viewLabel}
          title={viewLabel}
          className="flex size-10 items-center justify-center rounded-lg text-primary transition hover:bg-primary-muted"
        >
          <Eye className="size-4" aria-hidden />
        </button>
      )}
      <button
        type="button"
        onClick={onEdit}
        aria-label={editLabel}
        title={editLabel}
        className="flex size-10 items-center justify-center rounded-lg text-secondary transition hover:bg-secondary-muted"
      >
        <Pencil className="size-4" aria-hidden />
      </button>
      <button
        type="button"
        onClick={onDelete}
        aria-label={deleteLabel}
        title={deleteLabel}
        className="flex size-10 items-center justify-center rounded-lg text-danger transition hover:bg-danger-muted"
      >
        <Trash2 className="size-4" aria-hidden />
      </button>
    </div>
  )
}
