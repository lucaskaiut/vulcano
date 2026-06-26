import { useQuery } from '@tanstack/react-query'
import { ChevronDown, ChevronUp, Gift, PiggyBank, Search, TrendingUp, Users, Wallet } from 'lucide-react'
import { useMemo, useState } from 'react'
import { getReport } from '../services/costService'
import { PageHeader } from '../components/ui/PageHeader'
import { Input } from '../components/ui/Input'

type CategoryColor = 'salary' | 'provision' | 'benefit' | 'commission' | 'vacation' | 'other'

const BAR_COLORS: Record<CategoryColor, string> = {
  salary:     'bg-primary',
  provision:  'bg-accent',
  benefit:    'bg-success',
  commission: 'bg-secondary',
  vacation:   'bg-warning',
  other:      'bg-surface-sunken',
}

const PILL_COLORS: Record<CategoryColor, string> = {
  salary:     'bg-primary-muted text-primary',
  provision:  'bg-accent-muted text-accent',
  benefit:    'bg-success-muted text-success',
  commission: 'bg-secondary-muted text-secondary',
  vacation:   'bg-warning-muted text-warning',
  other:      'bg-surface-sunken text-foreground-muted',
}

const SECTION_COLORS: Record<CategoryColor, string> = {
  salary:     'text-primary',
  provision:  'text-accent',
  benefit:    'text-success',
  commission: 'text-secondary',
  vacation:   'text-warning',
  other:      'text-foreground-muted',
}

function classifyCategory(name: string): CategoryColor {
  const n = name.toLowerCase()
  if (n.includes('salário') || n.includes('salario')) return 'salary'
  if (n.includes('provisão') || n.includes('provisao') || n.includes('13º') || n.includes('férias') || n.includes('ferias')) return 'provision'
  if (n.includes('benefício') || n.includes('beneficio') || n.includes('plano') || n.includes('vale') || n.includes('alimentação')) return 'benefit'
  if (n.includes('comissão') || n.includes('comissao')) return 'commission'
  if (n.includes('concedida')) return 'vacation'
  return 'other'
}

function currency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

export function CostsListPage() {
  const [search, setSearch] = useState('')
  const [expandedUsers, setExpandedUsers] = useState<Set<number>>(new Set())

  const { data: report = [], isLoading } = useQuery({
    queryKey: ['costs-report'],
    queryFn: () => getReport(),
  })

  const totalCost = report.reduce((s, r) => s + r.total, 0)
  const collaborators = report.length
  const avgCost = collaborators > 0 ? totalCost / collaborators : 0

  const distribution = useMemo(() => {
    const map: Record<string, { value: number; color: CategoryColor }> = {}
    for (const row of report) {
      for (const [cat, val] of Object.entries(row.categories)) {
        const color = classifyCategory(cat)
        const key = color === 'provision' ? 'Provisões' : color === 'benefit' ? 'Benefícios' : cat
        if (!map[key]) map[key] = { value: 0, color }
        map[key].value += val as number
      }
    }
    return Object.entries(map).map(([name, d]) => ({ name, value: d.value, color: d.color }))
  }, [report])

  const benefitsTotal = useMemo(() => {
    return report.reduce((s, r) => {
      return s + Object.entries(r.categories)
        .filter(([cat]) => classifyCategory(cat) === 'benefit')
        .reduce((a, [, v]) => a + (v as number), 0)
    }, 0)
  }, [report])

  const provisionsTotal = useMemo(() => {
    return report.reduce((s, r) => {
      return s + Object.entries(r.categories)
        .filter(([cat]) => classifyCategory(cat) === 'provision')
        .reduce((a, [, v]) => a + (v as number), 0)
    }, 0)
  }, [report])

  const filtered = useMemo(() => {
    if (!search.trim()) return report
    const q = search.toLowerCase()
    return report.filter((r) => r.user_name.toLowerCase().includes(q))
  }, [report, search])

  function toggleExpand(userId: number) {
    setExpandedUsers((prev) => {
      const next = new Set(prev)
      if (next.has(userId)) next.delete(userId)
      else next.add(userId)
      return next
    })
  }

  const distTotal = distribution.reduce((s, d) => s + d.value, 0)

  return (
    <>
      <PageHeader title="Custos" />

      {/* Summary Cards */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-xl bg-surface p-5 shadow-overlay">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-foreground-muted">Custo Total</p>
              <p className="mt-1 text-xl font-bold text-primary">{currency(totalCost)}</p>
            </div>
            <Wallet className="size-5 text-primary" aria-hidden />
          </div>
        </div>

        <div className="rounded-xl bg-surface p-5 shadow-overlay">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-foreground-muted">Colaboradores</p>
              <p className="mt-1 text-xl font-bold text-foreground">{collaborators}</p>
            </div>
            <Users className="size-5 text-foreground-muted" aria-hidden />
          </div>
        </div>

        <div className="rounded-xl bg-surface p-5 shadow-overlay">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-foreground-muted">Média por Colab.</p>
              <p className="mt-1 text-xl font-bold text-foreground">{currency(avgCost)}</p>
            </div>
            <TrendingUp className="size-5 text-foreground-muted" aria-hidden />
          </div>
        </div>

        <div className="rounded-xl bg-surface p-5 shadow-overlay">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-foreground-muted">Benefícios</p>
              <p className="mt-1 text-xl font-bold text-success">{currency(benefitsTotal)}</p>
            </div>
            <Gift className="size-5 text-success" aria-hidden />
          </div>
        </div>

        <div className="rounded-xl bg-surface p-5 shadow-overlay">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-foreground-muted">Provisões</p>
              <p className="mt-1 text-xl font-bold text-accent">{currency(provisionsTotal)}</p>
            </div>
            <PiggyBank className="size-5 text-accent" aria-hidden />
          </div>
        </div>
      </div>

      {/* Distribution bar */}
      {distTotal > 0 && (
        <div className="mb-6 rounded-xl bg-surface p-5 shadow-overlay">
          <p className="mb-3 text-xs font-medium uppercase tracking-wider text-foreground-muted">Distribuição de custos</p>
          <div className="flex h-3 overflow-hidden rounded-full bg-surface-sunken">
            {distribution.map((d) => {
              const pct = (d.value / distTotal) * 100
              if (pct < 1) return null
              return (
                <div
                  key={d.name}
                  className={`h-full ${BAR_COLORS[d.color]}`}
                  style={{ width: `${pct}%` }}
                />
              )
            })}
          </div>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
            {distribution.map((d) => (
              <div key={d.name} className="flex items-center gap-1.5 text-xs text-foreground-muted">
                <span className={`size-2 rounded-full ${BAR_COLORS[d.color]}`} />
                {d.name}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative mb-6 max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-foreground-subtle" aria-hidden />
        <Input
          label=""
          placeholder="Buscar colaborador..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Collaborator Cards */}
      {isLoading ? (
        <p className="py-8 text-center text-sm text-foreground-muted">Carregando...</p>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl bg-surface p-8 text-center shadow-overlay">
          <p className="text-sm text-foreground-muted">Nenhum colaborador encontrado.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((row) => {
            const isExpanded = expandedUsers.has(row.user_id)
            const categories = Object.entries(row.categories)

            const salaryItems = categories.filter(([cat]) => classifyCategory(cat) === 'salary')
            const provisionItems = categories.filter(([cat]) => classifyCategory(cat) === 'provision')
            const benefitItems = categories.filter(([cat]) => classifyCategory(cat) === 'benefit')
            const otherItems = categories.filter(([cat]) => {
              const c = classifyCategory(cat)
              return c !== 'salary' && c !== 'provision' && c !== 'benefit'
            })

            return (
              <div key={row.user_id} className="relative overflow-visible rounded-xl bg-surface shadow-overlay">
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">{row.user_name}</p>
                      <p className="mt-0.5 text-xs text-foreground-muted">Custo total mensal</p>
                    </div>
                    <p className="shrink-0 text-lg font-bold text-primary">{currency(row.total)}</p>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {salaryItems.map(([cat, val]) => (
                      <span key={cat} className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ${PILL_COLORS.salary}`}>
                        {cat}: {currency(val as number)}
                      </span>
                    ))}
                    {provisionItems.length > 0 && (
                      <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ${PILL_COLORS.provision}`}>
                        Provisões: {currency(provisionItems.reduce((s, [, v]) => s + (v as number), 0))}
                      </span>
                    )}
                    {benefitItems.length > 0 && (
                      <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ${PILL_COLORS.benefit}`}>
                        Benefícios: {currency(benefitItems.reduce((s, [, v]) => s + (v as number), 0))}
                      </span>
                    )}
                    {otherItems.length > 0 && (
                      <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ${PILL_COLORS.other}`}>
                        Outros: {currency(otherItems.reduce((s, [, v]) => s + (v as number), 0))}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => toggleExpand(row.user_id)}
                  className="flex w-full items-center justify-center gap-1 bg-surface-sunken/50 py-2 text-xs font-medium text-foreground-muted transition hover:bg-surface-sunken"
                >
                  {isExpanded ? (
                    <><ChevronUp className="size-3.5" /> Recolher detalhes</>
                  ) : (
                    <><ChevronDown className="size-3.5" /> Ver detalhes</>
                  )}
                </button>

                {isExpanded && (
                  <div className="absolute left-0 right-0 top-full z-20 space-y-4 rounded-b-xl bg-surface px-5 py-4 shadow-overlay">
                    {salaryItems.length > 0 && (
                      <div>
                        <p className={`mb-1.5 text-xs font-semibold uppercase tracking-wider ${SECTION_COLORS.salary}`}>Salário</p>
                        {salaryItems.map(([cat, val]) => (
                          <div key={cat} className="flex justify-between py-0.5 text-sm">
                            <span className="text-foreground-muted">{cat}</span>
                            <span className="font-medium text-foreground">{currency(val as number)}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {provisionItems.length > 0 && (
                      <div>
                        <p className={`mb-1.5 text-xs font-semibold uppercase tracking-wider ${SECTION_COLORS.provision}`}>Provisões</p>
                        {provisionItems.map(([cat, val]) => (
                          <div key={cat} className="flex justify-between py-0.5 text-sm">
                            <span className="text-foreground-muted">{cat}</span>
                            <span className="font-medium text-foreground">{currency(val as number)}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {benefitItems.length > 0 && (
                      <div>
                        <p className={`mb-1.5 text-xs font-semibold uppercase tracking-wider ${SECTION_COLORS.benefit}`}>Benefícios</p>
                        {benefitItems.map(([cat, val]) => (
                          <div key={cat} className="flex justify-between py-0.5 text-sm">
                            <span className="text-foreground-muted">{cat}</span>
                            <span className="font-medium text-foreground">{currency(val as number)}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {otherItems.length > 0 && (
                      <div>
                        <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-foreground-muted">Outros</p>
                        {otherItems.map(([cat, val]) => (
                          <div key={cat} className="flex justify-between py-0.5 text-sm">
                            <span className="text-foreground-muted">{cat}</span>
                            <span className="font-medium text-foreground">{currency(val as number)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}
