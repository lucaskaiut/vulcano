import { Link } from '@tanstack/react-router'
import { Button } from './Button'

type FormActionsProps = {
  cancelHref: string
  isSubmitting?: boolean
}

export function FormActions({ cancelHref, isSubmitting = false }: FormActionsProps) {
  return (
    <div className="flex flex-col-reverse gap-2 sm:flex-row">
      <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
        {isSubmitting ? 'Salvando...' : 'Salvar'}
      </Button>
      <Link to={cancelHref} className="w-full sm:w-auto">
        <Button type="button" variant="ghost" className="w-full">
          Cancelar
        </Button>
      </Link>
    </div>
  )
}
