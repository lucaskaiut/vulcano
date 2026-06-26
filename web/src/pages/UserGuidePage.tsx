import { useQuery } from '@tanstack/react-query'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { PageHeader } from '../components/ui/PageHeader'

async function fetchGuide(): Promise<string> {
  const base = import.meta.env.VITE_API_BASE_URL ?? '/api'
  const response = await fetch(`${base}/docs/user-guide`)
  if (!response.ok) throw new Error('Erro ao carregar o guia.')
  return response.text()
}

export function UserGuidePage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['user-guide'],
    queryFn: fetchGuide,
    staleTime: Infinity,
  })

  return (
    <div>
      <PageHeader title="Guia do Usuário" description="Documentação completa de todas as funcionalidades" />

      {isLoading ? (
        <p className="text-sm text-foreground-muted">Carregando guia...</p>
      ) : isError ? (
        <p className="text-sm text-danger">Erro ao carregar o guia do usuário.</p>
      ) : (
        <div className="prose prose-sm max-w-3xl prose-headings:text-foreground prose-p:text-foreground-muted prose-strong:text-foreground prose-a:text-primary prose-li:text-foreground-muted prose-code:bg-surface-sunken prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:text-foreground prose-thead:border-surface-sunken prose-tr:border-surface-sunken prose-th:text-foreground prose-td:text-foreground-muted prose-hr:border-surface-sunken">
          <Markdown remarkPlugins={[remarkGfm]}>
            {data}
          </Markdown>
        </div>
      )}
    </div>
  )
}
