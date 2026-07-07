import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Navigate, useNavigate, useParams } from '@tanstack/react-router'
import { Search, Send } from 'lucide-react'
import { z } from 'zod'
import { applyApiErrors } from '../lib/applyApiErrors'
import * as aclService from '../services/aclService'
import * as engineService from '../services/notificationEngineService'
import { ApiError } from '../services/api'
import { Alert } from '../components/ui/Alert'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { FormActions } from '../components/ui/FormActions'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { EVENT_OPTIONS } from '../types/notificationEngine'
import { Textarea } from '../components/ui/Textarea'
import { PageHeader } from '../components/ui/PageHeader'
import { ToggleSwitch } from '../components/ui/Toggle'

const ruleSchema = z.object({
  name: z.string().min(1, 'Informe o nome.'),
  description: z.string().optional().or(z.literal('')),
  event: z.string().min(1, 'Selecione o evento.'),
  channel: z.string().min(1, 'Selecione o canal.'),
  schedule_type: z.string().min(1, 'Selecione a periodicidade.'),
  schedule_config_day: z.string().optional().or(z.literal('')),
  schedule_config_time: z.string().optional().or(z.literal('')),
  template_id: z.number().nullable().optional(),
  active: z.boolean(),
})

type RuleFormValues = z.infer<typeof ruleSchema>

export function NotificationRuleFormPage() {
  const { id } = useParams({ strict: false })
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const ruleId = id ? Number(id) : null
  const isEditing = ruleId !== null && !Number.isNaN(ruleId)
  const [formError, setFormError] = useState<string | null>(null)
  const [testModalOpen, setTestModalOpen] = useState(false)
  const [testSearch, setTestSearch] = useState('')
  const [testUserId, setTestUserId] = useState<number | null>(null)
  const [testSending, setTestSending] = useState(false)
  const [testResult, setTestResult] = useState<string | null>(null)

  const ruleQuery = useQuery({
    queryKey: ['notification-rules', ruleId],
    queryFn: () => engineService.getRule(ruleId!),
    enabled: isEditing,
  })

  const templatesQuery = useQuery({ queryKey: ['notification-templates'], queryFn: engineService.listTemplates })

  const usersQuery = useQuery({
    queryKey: ['users', 'list'],
    queryFn: () => aclService.listUsers({ page: 1, per_page: 50, sorts: [{ column: 'name', direction: 'asc' }] }),
  })

  const { register, control, handleSubmit, reset, watch, setError, formState: { errors, isSubmitting } } = useForm<RuleFormValues>({
    resolver: zodResolver(ruleSchema),
    defaultValues: { name: '', description: '', event: '', channel: 'email', schedule_type: 'daily', schedule_config_day: '', schedule_config_time: '08:00', template_id: null, active: true },
  })

  useEffect(() => {
    if (!isEditing || !ruleQuery.data) return
    const r = ruleQuery.data
    reset({
      name: r.name,
      description: r.description ?? '',
      event: r.event,
      channel: r.channel,
      schedule_type: r.schedule_type,
      schedule_config_day: (r.schedule_config as Record<string, unknown>)?.day?.toString() ?? '',
      schedule_config_time: (r.schedule_config as Record<string, unknown>)?.time?.toString() ?? '08:00',
      template_id: r.template_id,
      active: r.active,
    })
  }, [isEditing, ruleQuery.data, reset])

  const saveMutation = useMutation({
    mutationFn: async (values: RuleFormValues) => {
      const scheduleConfig: Record<string, unknown> = {}
      if (values.schedule_config_time) scheduleConfig.time = values.schedule_config_time
      if (values.schedule_type === 'monthly' && values.schedule_config_day) scheduleConfig.day = parseInt(values.schedule_config_day)

      const payload = {
        name: values.name,
        description: values.description || undefined,
        event: values.event,
        channel: values.channel,
        schedule_type: values.schedule_type,
        schedule_config: Object.keys(scheduleConfig).length > 0 ? scheduleConfig : undefined,
        template_id: values.template_id ?? undefined,
        active: values.active,
      }

      if (isEditing && ruleId) return engineService.updateRule(ruleId, payload)
      return engineService.createRule(payload)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['notification-rules'] })
      navigate({ to: '/notification-rules' })
    },
    onError: (error) => {
      setFormError(null)
      if (error instanceof ApiError) {
        const msg = applyApiErrors(error, setError, 'Não foi possível salvar a regra.')
        if (msg) setFormError(msg)
        return
      }
      setFormError('Não foi possível salvar a regra.')
    },
  })

  const scheduleType = watch('schedule_type')
  const templates = templatesQuery.data ?? []
  const users = usersQuery.data?.data ?? []

  const filteredUsers = testSearch.trim()
    ? users.filter((u) => u.name.toLowerCase().includes(testSearch.toLowerCase()))
    : users

  async function handleTestSend() {
    if (!testUserId || !ruleId) return
    setTestSending(true)
    setTestResult(null)
    try {
      await engineService.testSendRule(ruleId, testUserId)
      setTestResult('Enviado com sucesso!')
    } catch {
      setTestResult('Erro ao enviar.')
    } finally {
      setTestSending(false)
    }
  }

  if (id && (ruleId === null || Number.isNaN(ruleId))) return <Navigate to="/notification-rules" replace />
  if (isEditing && ruleQuery.isLoading) return <p className="text-sm text-foreground-muted">Carregando...</p>

  return (
    <div>
      <PageHeader title={isEditing ? 'Editar regra' : 'Nova regra'} />
      <Card className="p-6">
        <form className="space-y-6" onSubmit={handleSubmit((v) => saveMutation.mutate(v))} noValidate>
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-foreground-subtle">Informações básicas</p>
            <Input label="Nome" error={errors.name?.message} {...register('name')} />
            <Textarea label="Descrição" error={errors.description?.message} {...register('description')} />
          </div>

          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-foreground-subtle">Gatilho e periodicidade</p>
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground-muted">Quando disparar</label>
              <Controller
                name="event"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    options={EVENT_OPTIONS}
                    onChange={field.onChange}
                    aria-label="Quando disparar"
                  />
                )}
              />
              {errors.event?.message && <p className="mt-1 text-sm text-danger">{errors.event.message}</p>}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground-muted">Periodicidade</label>
                <Controller
                  name="schedule_type"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      options={[
                        { value: 'daily', label: 'Diário' },
                        { value: 'weekly', label: 'Semanal' },
                        { value: 'monthly', label: 'Mensal' },
                        { value: 'once', label: 'Único' },
                      ]}
                      onChange={field.onChange}
                      aria-label="Periodicidade"
                    />
                  )}
                />
                {errors.schedule_type?.message && <p className="mt-1 text-sm text-danger">{errors.schedule_type.message}</p>}
              </div>
              {scheduleType === 'monthly' && (
                <Input
                  label="Dia do mês"
                  type="number"
                  min="1"
                  max="31"
                  placeholder="1"
                  error={errors.schedule_config_day?.message}
                  {...register('schedule_config_day')}
                />
              )}
            </div>
            <Input label="Horário (HH:MM)" placeholder="08:00" error={errors.schedule_config_time?.message} {...register('schedule_config_time')} />
          </div>

          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-foreground-subtle">Mensagem</p>
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground-muted">Template de mensagem</label>
              <Controller
                name="template_id"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value ? String(field.value) : ''}
                    options={[
                      { value: '', label: 'Nenhum' },
                      ...templates.map((t) => ({ value: String(t.id), label: t.name })),
                    ]}
                    onChange={(v) => field.onChange(v ? parseInt(v as string) : null)}
                    aria-label="Template de mensagem"
                  />
                )}
              />
              {errors.template_id?.message && <p className="mt-1 text-sm text-danger">{errors.template_id.message}</p>}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isEditing && (
              <Button type="button" variant="ghost" size="sm" onClick={() => { setTestModalOpen(true); setTestResult(null); setTestSearch(''); setTestUserId(null) }}>
                <Send className="size-4" />
                Testar envio
              </Button>
            )}
            <Controller
              name="active"
              control={control}
              render={({ field }) => (
                <ToggleSwitch checked={field.value} onChange={field.onChange} ariaLabel="Regra ativa" />
              )}
            />
            <span className="text-sm text-foreground">Ativo</span>
          </div>

          {formError && <Alert variant="danger">{formError}</Alert>}
          <FormActions cancelHref="/notification-rules" isSubmitting={isSubmitting || saveMutation.isPending} />
        </form>
      </Card>

      {/* Test send modal */}
      {testModalOpen && (
        <div className="fixed inset-0 z-70 flex items-end justify-center p-4 sm:items-center" role="presentation">
          <button type="button" aria-label="Fechar" className="absolute inset-0 bg-foreground/30" onClick={() => setTestModalOpen(false)} />
          <div role="dialog" aria-modal="true" className="relative w-full max-w-md rounded-lg bg-surface p-5 shadow-overlay sm:p-6">
            <h2 className="text-base font-semibold text-foreground">Testar envio</h2>
            <p className="mt-1 text-sm text-foreground-muted">Selecione um colaborador para receber o e-mail de teste.</p>

            <div className="relative mt-4">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-foreground-subtle" />
              <Input
                label=""
                placeholder="Buscar colaborador..."
                value={testSearch}
                onChange={(e) => setTestSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="mt-2 max-h-48 overflow-y-auto rounded-lg border border-surface-sunken">
              {filteredUsers.length === 0 ? (
                <p className="px-3 py-6 text-center text-sm text-foreground-muted">Nenhum colaborador encontrado.</p>
              ) : (
                filteredUsers.slice(0, 30).map((u) => (
                  <label
                    key={u.id}
                    className={`flex cursor-pointer items-center gap-3 px-3 py-2.5 transition-colors hover:bg-surface-sunken ${
                      testUserId === u.id ? 'bg-primary-muted' : ''
                    }`}
                  >
                    <input
                      type="radio"
                      name="test-user"
                      checked={testUserId === u.id}
                      onChange={() => setTestUserId(u.id)}
                      className="size-4 accent-primary"
                    />
                    <div>
                      <p className="text-sm font-medium text-foreground">{u.name}</p>
                      <p className="text-xs text-foreground-muted">{u.job_title}{u.email ? ` · ${u.email}` : ''}</p>
                    </div>
                  </label>
                ))
              )}
            </div>

            {testResult && (
              <p className={`mt-3 text-sm font-medium ${testResult.includes('Erro') ? 'text-danger' : 'text-success'}`}>
                {testResult}
              </p>
            )}

            <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button type="button" variant="ghost" onClick={() => setTestModalOpen(false)}>Fechar</Button>
              <Button type="button" disabled={!testUserId || testSending} onClick={handleTestSend}>
                {testSending ? 'Enviando...' : 'Enviar e-mail'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
