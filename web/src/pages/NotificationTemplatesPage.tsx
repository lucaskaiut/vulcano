import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import * as engineService from '../services/notificationEngineService'
import { PageHeader } from '../components/ui/PageHeader'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { ConfirmModal } from '../components/ui/ConfirmModal'
import type { NotificationTemplate } from '../types/notificationEngine'

export function NotificationTemplatesPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [deleting, setDeleting] = useState<NotificationTemplate | null>(null)

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['notification-templates'],
    queryFn: engineService.listTemplates,
  })

  const deleteMutation = useMutation({
    mutationFn: engineService.deleteTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-templates'] })
      setDeleting(null)
    },
  })

  return (
    <div>
      <PageHeader
        title="Templates"
        description="Modelos de mensagem para notificações"
        action={
          <Link to="/notification-templates/novo">
            <Button variant="primary" size="sm"><Plus className="size-4" /> Novo template</Button>
          </Link>
        }
      />

      {isLoading ? (
        <p className="text-sm text-foreground-muted">Carregando...</p>
      ) : templates.length === 0 ? (
        <p className="text-sm text-foreground-muted">Nenhum template cadastrado.</p>
      ) : (
        <div className="space-y-4">
          {templates.map((t) => (
            <Card key={t.id} className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-foreground">{t.name}</p>
                  <p className="text-xs text-foreground-muted mt-0.5">Assunto: {t.subject}</p>
                  <p className="mt-1 text-sm text-foreground-muted line-clamp-2 whitespace-pre-wrap">{t.body.slice(0, 120)}</p>
                  {t.available_variables && t.available_variables.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {t.available_variables.map((v) => (
                        <span key={v} className="rounded-md bg-primary-muted px-2 py-0.5 text-xs text-primary">{`{{${v}}}`}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={() => navigate({ to: `/notification-templates/${t.id}/editar` })}>
                    <Pencil className="size-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setDeleting(t)}>
                    <Trash2 className="size-4 text-danger" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <ConfirmModal
        open={deleting !== null}
        title="Excluir template"
        description={`Tem certeza que deseja excluir o template "${deleting?.name}"?`}
        confirmLabel="Excluir"
        onConfirm={() => { if (deleting) deleteMutation.mutate(deleting.id) }}
        onCancel={() => setDeleting(null)}
        isLoading={deleteMutation.isPending}
      />
    </div>
  )
}
