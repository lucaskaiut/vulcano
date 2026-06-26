import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Pencil, Plus, Stethoscope, Trash2, Download } from 'lucide-react'
import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { applyApiErrors } from '../../lib/applyApiErrors'
import { formatDate } from '../../lib/format'
import { ApiError } from '../../services/api'
import * as medicalExamService from '../../services/medicalExamService'
import { getMedicalExamDownloadUrl } from '../../services/medicalExamService'
import type { MedicalExam } from '../../types/medicalExam'
import { Alert } from '../ui/Alert'
import { Button } from '../ui/Button'
import { DatePicker } from '../ui/DatePicker'
import { Input } from '../ui/Input'
import { Textarea } from '../ui/Textarea'
import { usePermissions } from '../../hooks/usePermissions'

const schema = z.object({
  exam_type: z.string().min(1, 'Informe o tipo de exame.'),
  execution_date: z.string().min(1, 'Informe a data de realização.'),
  expiration_date: z.string().min(1, 'Informe a data de vencimento.'),
  notes: z.string().max(1000).optional(),
})

type FormValues = z.infer<typeof schema>

function isExpired(date: string): boolean {
  return new Date(date) < new Date()
}

function isExpiringSoon(date: string): boolean {
  const d = new Date(date)
  const now = new Date()
  const thirtyDaysFromNow = new Date()
  thirtyDaysFromNow.setDate(now.getDate() + 30)
  return d >= now && d <= thirtyDaysFromNow
}

type UserMedicalExamsSectionProps = {
  userId: number
}

export function UserMedicalExamsSection({ userId }: UserMedicalExamsSectionProps) {
  const queryClient = useQueryClient()
  const { can } = usePermissions()
  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const canManage = can('medical_exams.create')

  const { data: exams = [], isLoading } = useQuery({
    queryKey: ['users', userId, 'medical-exams'],
    queryFn: () => medicalExamService.listMedicalExams(userId),
  })

  const { register, control, handleSubmit, reset, setError, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { exam_type: '', execution_date: '', expiration_date: '', notes: '' },
  })

  const saveMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      if (editingId) {
        return medicalExamService.updateMedicalExam(editingId, {
          ...values,
          notes: values.notes?.trim() || null,
          file: selectedFile,
        })
      }
      return medicalExamService.createMedicalExam(userId, {
        ...values,
        notes: values.notes?.trim() || undefined,
        file: selectedFile,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', userId, 'medical-exams'] })
      closeForm()
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        const message = applyApiErrors(error, setError, 'Erro ao salvar exame.')
        if (message) setFormError(message)
      }
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => medicalExamService.deleteMedicalExam(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', userId, 'medical-exams'] })
    },
  })

  function openCreateForm() {
    setEditingId(null)
    setFormError(null)
    setSelectedFile(null)
    reset({ exam_type: '', execution_date: '', expiration_date: '', notes: '' })
    setFormOpen(true)
  }

  function openEditForm(exam: MedicalExam) {
    setEditingId(exam.id)
    setFormError(null)
    setSelectedFile(null)
    reset({
      exam_type: exam.exam_type,
      execution_date: exam.execution_date,
      expiration_date: exam.expiration_date,
      notes: exam.notes ?? '',
    })
    setFormOpen(true)
  }

  function closeForm() {
    setFormOpen(false)
    setEditingId(null)
    setFormError(null)
    setSelectedFile(null)
  }

  const canUpdate = can('medical_exams.update')
  const canDelete = can('medical_exams.delete')

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground">Exames periódicos</h2>
          <p className="mt-1 text-sm text-foreground-muted">
            {exams.length} exame{exams.length !== 1 ? 's' : ''} registrado{exams.length !== 1 ? 's' : ''}
          </p>
        </div>
        {canManage && !formOpen && (
          <Button type="button" size="sm" onClick={openCreateForm}>
            <Plus className="size-4" aria-hidden />
            Registrar exame
          </Button>
        )}
      </div>

      {canManage && formOpen && (
        <div className="rounded-lg border border-surface-sunken bg-surface-sunken/30 p-4 sm:p-5">
          <h3 className="mb-4 text-sm font-semibold text-foreground">
            {editingId ? 'Editar exame' : 'Novo exame'}
          </h3>
          <form className="space-y-4" onSubmit={handleSubmit((v) => saveMutation.mutate(v))} noValidate>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Tipo de exame"
                placeholder="ASO, Audiometria..."
                error={errors.exam_type?.message}
                {...register('exam_type')}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Controller
                name="execution_date"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    label="Data de realização"
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.execution_date?.message}
                  />
                )}
              />
              <Controller
                name="expiration_date"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    label="Data de vencimento"
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.expiration_date?.message}
                  />
                )}
              />
            </div>
            <Textarea
              label="Observações (opcional)"
              {...register('notes')}
            />

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Arquivo (opcional)</label>
              {selectedFile ? (
                <div className="flex items-center gap-3 rounded-lg border border-surface-sunken bg-surface p-3">
                  <span className="text-sm font-medium text-foreground">{selectedFile.name}</span>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setSelectedFile(null)}>
                    Remover
                  </Button>
                </div>
              ) : (
                <div className="relative rounded-lg border-2 border-dashed border-surface-sunken p-4 text-center hover:border-foreground-subtle">
                  <input
                    type="file"
                    className="absolute inset-0 cursor-pointer opacity-0"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                  <p className="text-sm text-foreground-muted">Clique para selecionar um arquivo</p>
                </div>
              )}
            </div>
            {formError && <Alert variant="danger">{formError}</Alert>}
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button type="button" variant="ghost" onClick={closeForm}>Cancelar</Button>
              <Button type="submit" disabled={isSubmitting || saveMutation.isPending}>
                {editingId ? 'Salvar' : 'Registrar'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? (
        <p className="text-sm text-foreground-muted">Carregando exames...</p>
      ) : exams.length === 0 ? (
        <div className="rounded-lg border border-dashed border-surface-sunken px-4 py-6 text-center">
          <p className="text-sm text-foreground-muted">Nenhum exame registrado.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {exams.map((exam) => {
            const expired = isExpired(exam.expiration_date)
            const expiring = isExpiringSoon(exam.expiration_date)
            return (
              <article key={exam.id} className="flex items-center justify-between rounded-lg border border-surface-sunken bg-surface p-3">
                <div className="flex items-center gap-3">
                  <div className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${expired ? 'bg-danger/10 text-danger' : expiring ? 'bg-warning/10 text-warning' : 'bg-surface-sunken text-foreground-muted'}`}>
                    <Stethoscope className="size-5" aria-hidden />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium text-foreground">{exam.exam_type}</p>
                      {expired && (
                        <span className="inline-flex items-center rounded-full bg-danger/10 px-1.5 py-0.5 text-[10px] font-semibold text-danger">Vencido</span>
                      )}
                      {expiring && (
                        <span className="inline-flex items-center rounded-full bg-warning/10 px-1.5 py-0.5 text-[10px] font-semibold text-warning">Vence em breve</span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-foreground-muted">
                      Realizado {formatDate(exam.execution_date)} — Vence {formatDate(exam.expiration_date)}
                      {exam.notes && <span className="ml-1 text-foreground-subtle">— {exam.notes}</span>}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  {exam.original_name && (
                    <a
                      href={getMedicalExamDownloadUrl(exam.id)}
                      download
                      className="inline-flex size-8 items-center justify-center rounded-md text-foreground-muted transition-colors hover:bg-surface-sunken hover:text-foreground"
                      title="Download"
                    >
                      <Download className="size-4" aria-hidden />
                    </a>
                  )}
                  {canUpdate && (
                    <Button type="button" variant="ghost" size="sm" className="size-8 p-0" onClick={() => openEditForm(exam)} aria-label="Editar">
                      <Pencil className="size-4" aria-hidden />
                    </Button>
                  )}
                  {canDelete && (
                    <Button type="button" variant="ghost" size="sm" className="size-8 p-0" disabled={deleteMutation.isPending} onClick={() => deleteMutation.mutate(exam.id)} aria-label="Excluir">
                      <Trash2 className="size-4 text-danger" aria-hidden />
                    </Button>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}
