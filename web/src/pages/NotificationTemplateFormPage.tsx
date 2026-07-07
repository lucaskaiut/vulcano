import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Navigate, useNavigate, useParams } from '@tanstack/react-router'
import { Search } from 'lucide-react'
import { z } from 'zod'
import { applyApiErrors } from '../lib/applyApiErrors'
import * as engineService from '../services/notificationEngineService'
import { ApiError } from '../services/api'
import { Alert } from '../components/ui/Alert'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { FormActions } from '../components/ui/FormActions'
import { Input } from '../components/ui/Input'
import { HtmlEditor } from '../components/ui/HtmlEditor'
import { PageHeader } from '../components/ui/PageHeader'

const templateSchema = z.object({
  name: z.string().min(1, 'Informe o nome.'),
  subject: z.string().min(1, 'Informe o assunto.'),
  body: z.string().min(1, 'Informe o corpo da mensagem.'),
  available_variables: z.array(z.string()).optional(),
})

type TemplateFormValues = z.infer<typeof templateSchema>

function categorize(key: string): string {
  if (key.startsWith('prestador.')) return 'Dados pessoais'
  if (key.startsWith('endereco.')) return 'Endereço'
  if (key.startsWith('setor.') || key.startsWith('gestor.')) return 'Setor / Gestor'
  if (key.startsWith('periodo.') || key.startsWith('data.')) return 'Datas / Período'
  return 'Outros'
}

export function NotificationTemplateFormPage() {
  const { id } = useParams({ strict: false })
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const templateId = id ? Number(id) : null
  const isEditing = templateId !== null && !Number.isNaN(templateId)
  const [formError, setFormError] = useState<string | null>(null)
  const [varSearch, setVarSearch] = useState('')
  const [preview, setPreview] = useState(false)

  const templateQuery = useQuery({
    queryKey: ['notification-templates', templateId],
    queryFn: () => engineService.getTemplate(templateId!),
    enabled: isEditing,
  })

  const variablesQuery = useQuery({
    queryKey: ['notification-variables'],
    queryFn: engineService.listVariables,
  })

  const { register, handleSubmit, reset, setValue, watch, setError, formState: { errors, isSubmitting } } = useForm<TemplateFormValues>({
    resolver: zodResolver(templateSchema),
    defaultValues: { name: '', subject: '', body: '', available_variables: [] },
  })

  useEffect(() => {
    if (!isEditing || !templateQuery.data) return
    reset({
      name: templateQuery.data.name,
      subject: templateQuery.data.subject,
      body: templateQuery.data.body,
      available_variables: templateQuery.data.available_variables ?? [],
    })
  }, [isEditing, templateQuery.data, reset])

  const saveMutation = useMutation({
    mutationFn: async (values: TemplateFormValues) => {
      if (isEditing && templateId) return engineService.updateTemplate(templateId, values)
      return engineService.createTemplate(values)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['notification-templates'] })
      navigate({ to: '/notification-templates' })
    },
    onError: (error) => {
      setFormError(null)
      if (error instanceof ApiError) {
        const msg = applyApiErrors(error, setError, 'Não foi possível salvar o template.')
        if (msg) setFormError(msg)
        return
      }
      setFormError('Não foi possível salvar o template.')
    },
  })

  const variables = variablesQuery.data ?? {}
  const bodyValue = watch('body')
  const subjectValue = watch('subject')

  const filteredVars = useMemo(() => {
    const q = varSearch.toLowerCase()
    if (!q) return Object.entries(variables)

    return Object.entries(variables).filter(
      ([key, label]) =>
        key.toLowerCase().includes(q) || label.toLowerCase().includes(q),
    )
  }, [variables, varSearch])

  const groupedVars = useMemo(() => {
    const groups: Record<string, [string, string][]> = {}
    for (const [key, label] of filteredVars) {
      const cat = categorize(key)
      if (!groups[cat]) groups[cat] = []
      groups[cat].push([key, label])
    }
    return groups
  }, [filteredVars])

  function insertVar(key: string) {
    const el = document.activeElement as HTMLElement | null
    const isSubject = el instanceof HTMLInputElement && el.name === 'subject'

    if (isSubject) {
      const start = el.selectionStart ?? el.value.length
      const end = el.selectionEnd ?? el.value.length
      const text = ` {{${key}}} `
      setValue('subject', subjectValue.slice(0, start) + text + subjectValue.slice(end))
      el.focus()
      el.setSelectionRange(start + text.length, start + text.length)
    } else if (el && el.isContentEditable) {
      // Insert at cursor in contentEditable
      el.focus()
      document.execCommand('insertHTML', false, ` {{${key}}} `)
      // Trigger form onChange
      setValue('body', el.innerHTML, { shouldValidate: true })
    } else {
      setValue('body', bodyValue + ` {{${key}}} `)
    }
  }

  function renderPreview(html: string): string {
    return html
      .replace(/\{\{([a-zA-Z0-9_.]+)\}\}/g, '<span style="background:#e8e0f0;color:#6d28d9;padding:1px 4px;border-radius:3px;font-size:11px;font-family:monospace">{{$1}}</span>')
      .replace(/\n/g, '<br>')
  }

  if (id && (templateId === null || Number.isNaN(templateId))) return <Navigate to="/notification-templates" replace />
  if (isEditing && templateQuery.isLoading) return <p className="text-sm text-foreground-muted">Carregando...</p>

  return (
    <div>
      <PageHeader title={isEditing ? 'Editar template' : 'Novo template'} />
      <Card className="p-6">
        <form className="space-y-6" onSubmit={handleSubmit((v) => saveMutation.mutate(v))} noValidate>
          <Input label="Nome do template" error={errors.name?.message} {...register('name')} />
          <Input label="Assunto do e-mail" placeholder="Ex: Lembrete de emissão de nota fiscal" error={errors.subject?.message} {...register('subject')} />

          {/* Editor */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-foreground-muted">
                {preview ? 'Pré-visualização' : 'Corpo da mensagem (HTML)'}
              </label>
              <Button type="button" variant="ghost" size="sm" onClick={() => setPreview(!preview)}>
                {preview ? 'Editor' : 'Preview'}
              </Button>
            </div>

            {preview ? (
              <div
                className="min-h-[200px] rounded-md border border-surface-sunken bg-surface-sunken/30 p-4 text-sm text-foreground"
                dangerouslySetInnerHTML={{ __html: renderPreview(bodyValue) }}
              />
            ) : (
              <HtmlEditor
                label=""
                value={bodyValue}
                onChange={(v) => setValue('body', v, { shouldValidate: true })}
                error={errors.body?.message}
                placeholder="<p>Olá {{prestador.nome}},</p><p>Sua nota fiscal do período {{periodo.atual}} vence em {{data.limite_nf}}.</p>"
              />
            )}
          </div>

          {/* Variables panel */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-foreground-subtle">
                Variáveis — clique para inserir no texto
              </p>
              <span className="text-xs text-foreground-muted">
                {Object.keys(variables).length} disponíveis
              </span>
            </div>

            {/* Search */}
            <div className="relative mb-3">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-foreground-subtle" aria-hidden />
              <Input
                label=""
                placeholder="Buscar variável..."
                value={varSearch}
                onChange={(e) => setVarSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Scrollable variable list */}
            <div className="max-h-64 overflow-y-auto rounded-lg border border-surface-sunken bg-surface-sunken/20 p-2">
              {Object.keys(groupedVars).length === 0 ? (
                <p className="py-4 text-center text-xs text-foreground-muted">Nenhuma variável encontrada.</p>
              ) : (
                Object.entries(groupedVars).map(([cat, vars]) => (
                  <div key={cat} className="mb-1 last:mb-0">
                    <p className="sticky top-0 bg-surface-sunken/70 backdrop-blur-sm px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-foreground-subtle rounded">
                      {cat}
                    </p>
                    <div className="flex flex-wrap gap-1 px-1 py-1">
                      {vars.map(([key, label]) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => insertVar(key)}
                          className="rounded-md bg-surface px-2.5 py-1.5 text-xs text-foreground-muted transition-colors hover:bg-primary-muted hover:text-primary"
                          title={`{{${key}}}`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {formError && <Alert variant="danger">{formError}</Alert>}
          <FormActions cancelHref="/notification-templates" isSubmitting={isSubmitting || saveMutation.isPending} />
        </form>
      </Card>
    </div>
  )
}
