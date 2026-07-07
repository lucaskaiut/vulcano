import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import { Clock, Mail, Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import * as engineService from '../services/notificationEngineService'
import { PageHeader } from '../components/ui/PageHeader'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { ConfirmModal } from '../components/ui/ConfirmModal'
import { ToggleSwitch } from '../components/ui/Toggle'
import { eventLabel } from '../types/notificationEngine'
import type { NotificationRule } from '../types/notificationEngine'

const SCHEDULE_LABELS: Record<string, string> = {
  daily: 'Diário',
  weekly: 'Semanal',
  monthly: 'Mensal',
  once: 'Único',
}

export function NotificationRulesPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [deleting, setDeleting] = useState<NotificationRule | null>(null)

  const { data: rules = [], isLoading } = useQuery({
    queryKey: ['notification-rules'],
    queryFn: engineService.listRules,
  })

  const deleteMutation = useMutation({
    mutationFn: engineService.deleteRule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-rules'] })
      setDeleting(null)
    },
  })

  const toggleMutation = useMutation({
    mutationFn: (rule: NotificationRule) => engineService.updateRule(rule.id, { active: !rule.active }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notification-rules'] }),
  })

  return (
    <div>
      <PageHeader
        title="Notificações"
        description="Configure regras para enviar notificações automaticamente com base em eventos do sistema."
        action={
          <div className="flex gap-2">
            <Link to="/notification-templates">
              <Button variant="ghost" size="sm">Templates</Button>
            </Link>
            <Link to="/notification-history">
              <Button variant="ghost" size="sm">Histórico</Button>
            </Link>
            <Link to="/notification-rules/novo">
              <Button variant="primary" size="sm"><Plus className="size-4" /> Nova regra</Button>
            </Link>
          </div>
        }
      />

      {isLoading ? (
        <p className="text-sm text-foreground-muted">Carregando...</p>
      ) : rules.length === 0 ? (
        <div className="rounded-xl border border-dashed border-surface-sunken px-4 py-12 text-center">
          <p className="text-sm text-foreground-muted">Nenhuma regra configurada.</p>
          <p className="mt-1 text-xs text-foreground-subtle">
            Crie uma regra para definir quando um evento do sistema deve disparar uma notificação.
          </p>
          <Link to="/notification-rules/novo" className="mt-4 inline-block">
            <Button variant="primary" size="sm"><Plus className="size-4" /> Criar primeira regra</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {rules.map((rule) => (
            <Card key={rule.id} className="p-4">
              <div className="flex items-start gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <p className="font-medium text-foreground">{rule.name}</p>
                    <div className="flex flex-wrap items-center gap-1.5 text-xs text-foreground-muted">
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary-muted px-1.5 py-0.5 text-primary">
                        <Mail className="size-3" />
                        {rule.channel}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-surface-sunken px-1.5 py-0.5">
                        <Clock className="size-3" />
                        {SCHEDULE_LABELS[rule.schedule_type] ?? rule.schedule_type}
                        {rule.schedule_config?.time != null ? ` às ${rule.schedule_config.time}` : ''}
                        {rule.schedule_config?.day != null ? ` dia ${rule.schedule_config.day}` : ''}
                      </span>
                    </div>
                  </div>

                  {rule.event && (
                    <p className="text-sm text-foreground-muted">
                      <span className="text-foreground-subtle">Gatilho:</span> {eventLabel(rule.event)}
                    </p>
                  )}
                  {rule.template && (
                    <p className="text-sm text-foreground-muted">
                      <span className="text-foreground-subtle">Template:</span> {rule.template.name}
                    </p>
                  )}
                  {rule.description && (
                    <p className="mt-1 text-xs text-foreground-subtle">{rule.description}</p>
                  )}
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <Button variant="ghost" size="sm" onClick={() => navigate({ to: `/notification-rules/${rule.id}/editar` })}>
                    <Pencil className="size-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setDeleting(rule)}>
                    <Trash2 className="size-4 text-danger" />
                  </Button>
                  <div className="ml-1">
                    <ToggleSwitch
                      checked={rule.active}
                      onChange={() => toggleMutation.mutate(rule)}
                      ariaLabel={rule.active ? 'Desativar regra' : 'Ativar regra'}
                    />
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <ConfirmModal
        open={deleting !== null}
        title="Excluir regra"
        description={`Tem certeza que deseja excluir a regra "${deleting?.name}"?`}
        confirmLabel="Excluir"
        onConfirm={() => { if (deleting) deleteMutation.mutate(deleting.id) }}
        onCancel={() => setDeleting(null)}
        isLoading={deleteMutation.isPending}
      />
    </div>
  )
}
