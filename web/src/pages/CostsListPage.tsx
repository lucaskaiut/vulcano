import { useQuery } from '@tanstack/react-query'
import { ChevronDown, ChevronUp, Search, Users, TrendingUp, Gift, PiggyBank, Wallet } from 'lucide-react'
import { useMemo, useState } from 'react'
import { getReport } from '../services/costService'
import { PageHeader } from '../components/ui/PageHeader'
import { Input } from '../components/ui/Input'

type CategoryColor = 'salary' | 'provision' | 'benefit' | 'commission' | 'vacation' | 'other'

const COLOR_MAP: Record<CategoryColor, { bg: string; text: string; bar: string }> = {
  salary:    { bg: 'bg-blue-50', text: 'text-blue-700', bar: 'bg-blue-500' },
  provision: { bg: 'bg-amber-50', text: 'text-amber-700', bar: 'bg-amber-500' },
  benefit:   { bg: 'bg-emerald-50', text: 'text-emerald-700', bar: 'bg-emerald-500' },
  commission:{ bg: 'bg-violet-50', text: 'text-violet-700', bar: 'bg-violet-500' },
  vacation:  { bg: 'bg-rose-50', text: 'text-rose-700', bar: 'bg-rose-500' },
  other:     { bg: 'bg-gray-50', text: 'text-gray-600', bar: 'bg-gray-400' },
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

function SummaryCard({ label, value, sub, icon: Icon, color }: { label: string; value: string; sub?: string; icon: any; color: string }) {
  return (
    <div className="rounded-xl border border-border/50 bg-surface p-4 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-foreground-muted">{label}</p>
          <p className={`mt-1 text-xl font-bold ${color}`}>{value}</p>
          {sub && <p className="mt-0.5 text-xs text-foreground-subtle">{sub}</p>}
        </div>
        <div className={`flex size-10 items-center justify-center rounded-lg ${color.replace('text-', 'bg-').replace('700', '50')}`}>
          <Icon className={`size-5 ${color}`} aria-hidden />
        </div>
      </div>
    </div>
  )
}

function DistributionBar({ data }: { data: { name: string; value: number; color: CategoryColor }[] }) {
  const total = data.reduce((s, d) => s + d.value, 0)
  if (total === 0) return null

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium uppercase tracking-wider text-foreground-muted">Distribuição de custos</p>
      <div className="flex h-3 overflow-hidden rounded-full bg-muted">
        {data.map((d) => {
          const pct = (d.value / total) * 100
          if (pct < 1) return null
          return (
            <div
              key={d.name}
              className={`h-full ${COLOR_MAP[d.color].bar}`}
              style={{ width: `${pct}%` }}
              title={`${d.name}: ${currency(d.value)}`}
            />
          )
        })}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {data.map((d) => (
          <div key={d.name} className="flex items-center gap-1.5 text-xs text-foreground-muted">
            <span className={`size-2 rounded-full ${COLOR_MAP[d.color].bar}`} />
            {d.name}
          </div>
        ))}
      </div>
    </div>
  )
}

export function CostsListPage() {
  const [search, setSearch] = useState('')
  const [expandedUsers, setExpandedUsers] = useState<Set<number>>(new Set())

  const { data: report = [], isLoading } = useQuery({
    queryKey: ['costs-report'],
    queryFn: () => getReport(),
  })

  // Compute summary
  const totalCost = report.reduce((s, r) => s + r.total, 0)
  const collaborators = report.length
  const avgCost = collaborators > 0 ? totalCost / collaborators : 0

  // Categorize all items for distribution
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

  return (
    <div className="space-y-6">
      <PageHeader title="Custos" />

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <SummaryCard label="Custo Total" value={currency(totalCost)} icon={Wallet} color="text-primary" />
        <SummaryCard label="Colaboradores" value={String(collaborators)} icon={Users} color="text-blue-600" />
        <SummaryCard label="Média por Colab." value={currency(avgCost)} icon={TrendingUp} color="text-emerald-600" />
        <SummaryCard label="Benefícios" value={currency(benefitsTotal)} icon={Gift} color="text-violet-600" />
        <SummaryCard label="Provisões" value={currency(provisionsTotal)} sub="13º + Férias" icon={PiggyBank} color="text-amber-600" />
      </div>

      {/* Distribution bar */}
      <div className="rounded-xl border border-border/50 bg-surface p-4 shadow-sm">
        <DistributionBar data={distribution} />
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
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
        <p className="py-8 text-center text-sm text-foreground-muted">Nenhum colaborador encontrado.</p>
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
              <div key={row.user_id} className="overflow-hidden rounded-xl border border-border/50 bg-surface shadow-sm transition hover:shadow-md">
                {/* Header */}
                <div className="border-b border-border/30 bg-surface-sunken/50 px-5 py-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-foreground">{row.user_name}</p>
                      <p className="mt-0.5 text-xs text-foreground-muted">Custo total mensal</p>
                    </div>
                    <p className="text-lg font-bold text-primary">{currency(row.total)}</p>
                  </div>

                  {/* Compact category pills */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {salaryItems.map(([cat, val]) => {
                      const color = COLOR_MAP.salary
                      return (
                        <span key={cat} className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ${color.bg} ${color.text}`}>
                          {cat.replace('Salário', 'Salário')}: {currency(val as number)}
                        </span>
                      )
                    })}
                    {provisionItems.length > 0 && (
                      <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ${COLOR_MAP.provision.bg} ${COLOR_MAP.provision.text}`}>
                        Provisões: {currency(provisionItems.reduce((s, [, v]) => s + (v as number), 0))}
                      </span>
                    )}
                    {benefitItems.length > 0 && (
                      <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ${COLOR_MAP.benefit.bg} ${COLOR_MAP.benefit.text}`}>
                        Benefícios: {currency(benefitItems.reduce((s, [, v]) => s + (v as number), 0))}
                      </span>
                    )}
                    {otherItems.length > 0 && (
                      <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium bg-gray-50 text-gray-600`}>
                        Outros: {currency(otherItems.reduce((s, [, v]) => s + (v as number), 0))}
                      </span>
                    )}
                  </div>
                </div>

                {/* Expand button */}
                <button
                  type="button"
                  onClick={() => toggleExpand(row.user_id)}
                  className="flex w-full items-center justify-center gap-1 border-t border-border/20 px-5 py-2 text-xs font-medium text-foreground-muted transition hover:bg-surface-sunken/50"
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className="size-3.5" /> Recolher detalhes
                    </>
                  ) : (
                    <>
                      <ChevronDown className="size-3.5" /> Ver detalhes
                    </>
                  )}
                </button>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="space-y-4 border-t border-border/20 px-5 py-4">
                    {/* Salary */}
                    {salaryItems.length > 0 && (
                      <div>
                        <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-blue-600">Salário</p>
                        {salaryItems.map(([cat, val]) => (
                          <div key={cat} className="flex justify-between text-sm">
                            <span className="text-foreground-muted">{cat}</span>
                            <span className="font-medium text-foreground">{currency(val as number)}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Provisions */}
                    {provisionItems.length > 0 && (
                      <div>
                        <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-amber-600">Provisões</p>
                        {provisionItems.map(([cat, val]) => (
                          <div key={cat} className="flex justify-between text-sm">
                            <span className="text-foreground-muted">{cat}</span>
                            <span className="font-medium text-foreground">{currency(val as number)}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Benefits */}
                    {benefitItems.length > 0 && (
                      <div>
                        <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-600">Benefícios</p>
                        {benefitItems.map(([cat, val]) => (
                          <div key={cat} className="flex justify-between text-sm">
                            <span className="text-foreground-muted">{cat}</span>
                            <span className="font-medium text-foreground">{currency(val as number)}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Other */}
                    {otherItems.length > 0 && (
                      <div>
                        <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500">Outros</p>
                        {otherItems.map(([cat, val]) => (
                          <div key={cat} className="flex justify-between text-sm">
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
    </div>
  )
}
