import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowUpFromLine, Download, ExternalLink, File, FileImage, FileSpreadsheet, FileText, Trash2, Upload, X } from 'lucide-react'
import { type DragEvent, useRef, useState } from 'react'
import { Link } from '@tanstack/react-router'
import * as documentService from '../../services/documentService'
import { formatDate } from '../../lib/format'
import { Alert } from '../ui/Alert'
import { Button } from '../ui/Button'
import { Select } from '../ui/Select'
import { DatePicker } from '../ui/DatePicker'
import { ApiError } from '../../services/api'
import { usePermissions } from '../../hooks/usePermissions'

function getFileTypeInfo(mimeType: string | null): { icon: typeof File; color: string; bgColor: string; isImage: boolean } {
  if (!mimeType) return { icon: File, color: 'text-foreground-muted', bgColor: 'bg-surface-sunken', isImage: false }
  if (mimeType.includes('pdf')) return { icon: FileText, color: 'text-danger', bgColor: 'bg-danger/10', isImage: false }
  if (mimeType.includes('image')) return { icon: FileImage, color: 'text-primary', bgColor: 'bg-primary/10', isImage: true }
  if (mimeType.includes('word') || mimeType.includes('document')) return { icon: FileText, color: 'text-primary', bgColor: 'bg-primary/10', isImage: false }
  if (mimeType.includes('sheet') || mimeType.includes('excel')) return { icon: FileSpreadsheet, color: 'text-success', bgColor: 'bg-success/10', isImage: false }
  return { icon: File, color: 'text-foreground-muted', bgColor: 'bg-surface-sunken', isImage: false }
}

function formatFileSize(bytes: number | null): string {
  if (bytes === null || bytes === undefined) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function isExpired(date: string | null): boolean {
  if (!date) return false
  return new Date(date) < new Date()
}

function isExpiringSoon(date: string | null): boolean {
  if (!date) return false
  const d = new Date(date)
  const now = new Date()
  const thirtyDaysFromNow = new Date()
  thirtyDaysFromNow.setDate(now.getDate() + 30)
  return d >= now && d <= thirtyDaysFromNow
}

type UserDocumentsSectionProps = {
  userId: number
}

export function UserDocumentsSection({ userId }: UserDocumentsSectionProps) {
  const queryClient = useQueryClient()
  const { can } = usePermissions()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [uploadFormOpen, setUploadFormOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [documentTypeId, setDocumentTypeId] = useState<number>(0)
  const [expirationDate, setExpirationDate] = useState('')
  const [uploadError, setUploadError] = useState<string | null>(null)
  const dragCounter = useRef(0)

  const documentsQuery = useQuery({
    queryKey: ['users', userId, 'documents'],
    queryFn: () => documentService.listDocuments(userId),
  })

  const typesQuery = useQuery({
    queryKey: ['document-types'],
    queryFn: () => documentService.listDocumentTypes(),
  })

  const documents = documentsQuery.data ?? []
  const types = typesQuery.data ?? []
  const canManage = can('documents.create')
  const canDelete = can('documents.delete')

  const uploadMutation = useMutation({
    mutationFn: () => {
      if (!selectedFile) throw new Error('Nenhum arquivo selecionado.')
      return documentService.uploadDocument(
        userId,
        selectedFile,
        documentTypeId,
        expirationDate || null,
      )
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', userId, 'documents'] })
      resetUploadForm()
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        setUploadError(error.message)
      } else {
        setUploadError('Erro ao enviar documento.')
      }
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => documentService.deleteDocument(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', userId, 'documents'] })
    },
  })

  function resetUploadForm() {
    setSelectedFile(null)
    setDocumentTypeId(0)
    setExpirationDate('')
    setUploadError(null)
    setUploadFormOpen(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  function handleFileSelect(file: File | null) {
    if (!file) {
      setSelectedFile(null)
      return
    }
    setSelectedFile(file)
    setUploadError(null)
  }

  function handleDragEnter(e: DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    dragCounter.current++
    if (e.dataTransfer.items.length > 0) {
      setIsDragging(true)
    }
  }

  function handleDragLeave(e: DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    dragCounter.current--
    if (dragCounter.current === 0) {
      setIsDragging(false)
    }
  }

  function handleDragOver(e: DragEvent) {
    e.preventDefault()
    e.stopPropagation()
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    dragCounter.current = 0

    if (e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground">Documentos</h2>
          <p className="mt-1 text-sm text-foreground-muted">
            {documents.length} documento{documents.length !== 1 ? 's' : ''} anexado{documents.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          {canManage && (
            <Link to="/document-types" className="inline-flex items-center gap-1.5 text-sm text-foreground-muted transition-colors hover:text-foreground">
              <ExternalLink className="size-4" aria-hidden />
              Tipos de documento
            </Link>
          )}
          {canManage && types.length > 0 && !uploadFormOpen && (
            <Button type="button" size="sm" onClick={() => setUploadFormOpen(true)}>
              <Upload className="size-4" aria-hidden />
              Enviar documento
            </Button>
          )}
        </div>
      </div>

      {/* Upload form */}
      {canManage && uploadFormOpen && (
        <div className="rounded-lg border border-surface-sunken bg-surface-sunken/30 p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Enviar documento</h3>
            <Button type="button" variant="ghost" size="sm" onClick={resetUploadForm}>
              <X className="size-4" aria-hidden />
              Cancelar
            </Button>
          </div>

          {/* Drop zone */}
          {!selectedFile ? (
            <div
              className={`relative rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
                isDragging
                  ? 'border-primary bg-primary/5'
                  : 'border-surface-sunken hover:border-foreground-subtle'
              }`}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="absolute inset-0 cursor-pointer opacity-0"
                onChange={(e) => handleFileSelect(e.target.files?.[0] ?? null)}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.txt"
              />
              <div className="flex flex-col items-center gap-2">
                <div className={`flex size-12 items-center justify-center rounded-full transition-colors ${
                  isDragging ? 'bg-primary-muted text-primary' : 'bg-surface-sunken text-foreground-muted'
                }`}>
                  <ArrowUpFromLine className="size-6" aria-hidden />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {isDragging ? 'Solte o arquivo aqui' : 'Arraste o arquivo ou clique para selecionar'}
                  </p>
                  <p className="mt-1 text-xs text-foreground-subtle">PDF, Word, Excel, Imagens até 10 MB</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-surface-sunken bg-surface p-4">
              {(() => {
                const info = getFileTypeInfo(selectedFile.type)
                const Icon = info.icon
                const isImage = info.isImage && selectedFile.type.includes('image')

                return (
                  <div className="flex items-center gap-3">
                    {isImage ? (
                      <img
                        src={URL.createObjectURL(selectedFile)}
                        alt=""
                        className="size-12 shrink-0 rounded-lg object-cover"
                      />
                    ) : (
                      <div className={`flex size-12 shrink-0 items-center justify-center rounded-lg ${info.bgColor} ${info.color}`}>
                        <Icon className="size-6" aria-hidden />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{selectedFile.name}</p>
                      <p className="text-xs text-foreground-muted">{formatFileSize(selectedFile.size)}</p>
                    </div>
                    <Button type="button" variant="ghost" size="sm" onClick={() => handleFileSelect(null)}>
                      Trocar
                    </Button>
                  </div>
                )
              })()}
            </div>
          )}

          {selectedFile && (
            <div className="mt-4 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Select
                  value={documentTypeId}
                  options={[
                    { value: 0, label: 'Selecione um tipo' },
                    ...types.map((t) => ({ value: t.id, label: t.name })),
                  ]}
                  onChange={(v) => setDocumentTypeId(v as number)}
                  aria-label="Tipo de documento"
                />

                <DatePicker
                  label="Data de vencimento (opcional)"
                  value={expirationDate}
                  onChange={setExpirationDate}
                  placeholder="Sem vencimento"
                />
              </div>

              {uploadError && <Alert variant="danger">{uploadError}</Alert>}

              <div className="flex justify-end">
                <Button
                  type="button"
                  disabled={documentTypeId === 0 || uploadMutation.isPending}
                  onClick={() => uploadMutation.mutate()}
                >
                  {uploadMutation.isPending ? 'Enviando...' : 'Enviar'}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* No types - show link to types page */}
      {canManage && types.length === 0 && !uploadFormOpen && (
        <div className="rounded-lg border border-dashed border-surface-sunken px-4 py-6 text-center">
          <p className="text-sm text-foreground-muted">
            Nenhum tipo de documento cadastrado.
          </p>
          <Link to="/document-types" className="mt-2 inline-flex items-center gap-1 text-sm text-primary hover:underline">
            Cadastrar tipos de documento
            <ExternalLink className="size-3.5" aria-hidden />
          </Link>
        </div>
      )}

      {/* Loading state */}
      {documentsQuery.isLoading || typesQuery.isLoading ? (
        <p className="text-sm text-foreground-muted">Carregando documentos...</p>
      ) : documentsQuery.isError ? (
        <Alert variant="danger">Não foi possível carregar os documentos.</Alert>
      ) : documents.length === 0 && !uploadFormOpen ? (
        <div className="rounded-lg border border-dashed border-surface-sunken px-4 py-6 text-center">
          <p className="text-sm text-foreground-muted">Nenhum documento anexado.</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
          {documents.map((doc) => (
            <DocumentCard
              key={doc.id}
              document={doc}
              canDelete={canDelete}
              onDelete={() => deleteMutation.mutate(doc.id)}
              isDeleting={deleteMutation.isPending && deleteMutation.variables === doc.id}
            />
          ))}
        </div>
      )}
    </section>
  )
}

function DocumentCard({
  document: doc,
  canDelete,
  onDelete,
  isDeleting,
}: {
  document: import('../../types/document').Document
  canDelete: boolean
  onDelete: () => void
  isDeleting: boolean
}) {
  const expired = isExpired(doc.expiration_date)
  const expiring = isExpiringSoon(doc.expiration_date)
  const info = getFileTypeInfo(doc.mime_type)
  const Icon = info.icon
  const isImage = info.isImage
  const isPdf = doc.mime_type?.includes('pdf')
  const previewUrl = documentService.getDocumentPreviewUrl(doc.id)
  const downloadUrl = documentService.getDocumentDownloadUrl(doc.id)

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-lg border border-surface-sunken bg-surface transition-shadow hover:shadow-overlay">
      {/* Preview area */}
      <a
        href={downloadUrl}
        download={doc.original_name}
        className="relative flex h-28 items-center justify-center bg-surface-sunken/30"
      >
        {isImage ? (
          <img
            src={previewUrl}
            alt={doc.original_name}
            className="size-full object-cover"
            loading="lazy"
          />
        ) : isPdf ? (
          <iframe
            src={previewUrl}
            title={doc.original_name}
            className="size-full"
          />
        ) : (
          <div className={`flex size-12 items-center justify-center rounded-xl ${info.bgColor} ${info.color}`}>
            <Icon className="size-6" aria-hidden />
          </div>
        )}

        {/* Status badge */}
        {(expired || expiring) && (
          <div className="absolute left-1.5 top-1.5">
            <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold text-white ${expired ? 'bg-danger' : 'bg-warning'}`}>
              {expired ? 'Vencido' : 'Expira'}
            </span>
          </div>
        )}

        {/* Action buttons overlay */}
        <div className="absolute right-1.5 top-1.5 flex gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
          <a
            href={downloadUrl}
            download={doc.original_name}
            className="inline-flex size-6 items-center justify-center rounded bg-surface text-foreground-muted shadow-overlay transition-colors hover:text-foreground"
            title="Download"
          >
            <Download className="size-3" aria-hidden />
          </a>
          {canDelete && (
            <button
              type="button"
              disabled={isDeleting}
              onClick={onDelete}
              className="inline-flex size-6 items-center justify-center rounded bg-surface text-danger shadow-overlay transition-colors hover:bg-danger/10"
              title="Excluir"
            >
              <Trash2 className="size-3" aria-hidden />
            </button>
          )}
        </div>
      </a>

      {/* Info below */}
      <div className="flex flex-col gap-0.5 p-2">
        <p className="truncate text-[11px] font-medium text-foreground" title={doc.original_name}>
          {doc.original_name}
        </p>
        {doc.document_type && (
          <span className="inline-flex w-fit truncate rounded bg-surface-sunken px-1 py-px text-[10px] font-medium text-foreground-muted">
            {doc.document_type.name}
          </span>
        )}
      </div>
    </article>
  )
}
