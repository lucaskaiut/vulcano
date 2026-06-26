import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import {
  createCategory,
  createCost,
  deleteCost,
  getReport,
  listCategories,
  listCosts,
} from '../services/costService'
import { listUsers } from '../services/aclService'
import { Button } from '../components/ui/Button'
import { Card, CardHeader, CardTitle } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { PageHeader } from '../components/ui/PageHeader'
import { Select } from '../components/ui/Select'
import { SearchSelect, type SearchSelectOption } from '../components/ui/SearchSelect'
import { ToggleSwitch } from '../components/ui/Toggle'
import { formatDate } from '../lib/format'

function currency(value: number | string): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value))
}

export function CostsPage() {
  const queryClient = useQueryClient()
  const [showCatForm, setShowCatForm] = useState(false)
  const [catName, setCatName] = useState('')
  const [catType, setCatType] = useState('benefit')
  const [showCostForm, setShowCostForm] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)
  const [costAmount, setCostAmount] = useState('')
  const [isRecurring, setIsRecurring] = useState(true)

  const { data: categories = [] } = useQuery({ queryKey: ['cost-categories'], queryFn: listCategories })
  const { data: costs = [] } = useQuery({ queryKey: ['collaborator-costs'], queryFn: () => listCosts() })
  const { data: report = [] } = useQuery({ queryKey: ['costs-report'], queryFn: () => getReport() })

  const catMutation = useMutation({
    mutationFn: () => createCategory({ name: catName, type: catType }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cost-categories'] })
      setShowCatForm(false); setCatName(''); setCatType('benefit')
    },
  })

  const costMutation = useMutation({
    mutationFn: () =>
      createCost({
        user_id: selectedUserId!,
        cost_category_id: selectedCategoryId!,
        amount: parseFloat(costAmount),
        recurring: isRecurring,
        reference_month: isRecurring ? null : new Date().toISOString().slice(0, 7),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collaborator-costs'] })
      queryClient.invalidateQueries({ queryKey: ['costs-report'] })
      setShowCostForm(false); setSelectedUserId(null); setSelectedCategoryId(null); setCostAmount('')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteCost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collaborator-costs'] })
      queryClient.invalidateQueries({ queryKey: ['costs-report'] })
    },
  })

  async function searchUsers(query: string): Promise<SearchSelectOption[]> {
    const response = await listUsers({ page: 1, per_page: 50 })
    return response.data
      .filter((u) => !query || u.name.toLowerCase().includes(query.toLowerCase()))
      .map((u) => ({ value: u.id, label: u.name }))
  }

  const totalCost = report.reduce((sum, r) => sum + r.total, 0)

  return (
    <>
      <PageHeader title="Gestão de Custos" />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="text-left">
            <CardTitle>Categorias</CardTitle>
          </CardHeader>

          <div className="space-y-2">
            {categories.map((cat) => (
              <div key={cat.id} className="flex items-center justify-between rounded-lg bg-surface-sunken px-3 py-2 text-sm">
                <span className="font-medium text-foreground">{cat.name}</span>
                <span className="text-xs text-foreground-muted">{cat.type}</span>
              </div>
            ))}

            {!showCatForm ? (
              <Button variant="ghost" size="sm" className="w-full" onClick={() => setShowCatForm(true)}>
                <Plus className="mr-1 size-4" />Nova categoria
              </Button>
            ) : (
              <div className="space-y-2 rounded-lg border border-surface-sunken p-3">
                <Input label="Nome" value={catName} onChange={(e) => setCatName(e.target.value)} />
                <Input label="Tipo" value={catType} onChange={(e) => setCatType(e.target.value)} placeholder="ex: benefit, fixed" />
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setShowCatForm(false)}>Cancelar</Button>
                  <Button size="sm" onClick={() => catMutation.mutate()} disabled={catMutation.isPending}>Salvar</Button>
                </div>
              </div>
            )}
          </div>
        </Card>

        <Card>
          <CardHeader className="text-left">
            <CardTitle>Vincular custo ao colaborador</CardTitle>
          </CardHeader>

          <div className="space-y-4">
            {!showCostForm ? (
              <Button variant="ghost" size="sm" className="w-full" onClick={() => setShowCostForm(true)}>
                <Plus className="mr-1 size-4" />Vincular custo
              </Button>
            ) : (
              <div className="space-y-3 rounded-lg border border-surface-sunken p-3">
                <SearchSelect
                  label="Colaborador"
                  value={selectedUserId}
                  selectedOption={null}
                  onChange={setSelectedUserId}
                  onSearch={searchUsers}
                />
                <Select
                  value={selectedCategoryId ?? 0}
                  options={[
                    { value: 0, label: 'Selecione uma categoria' },
                    ...categories.map((c) => ({ value: c.id, label: c.name })),
                  ]}
                  onChange={(v) => setSelectedCategoryId(v === 0 ? null : v)}
                  aria-label="Categoria"
                />
                <Input label="Valor (R$)" type="number" step="0.01" value={costAmount} onChange={(e) => setCostAmount(e.target.value)} />
                <div className="flex items-center gap-2">
                  <ToggleSwitch id="recurring" checked={isRecurring} onChange={setIsRecurring} ariaLabel="Recorrente" />
                  <label htmlFor="recurring" className="text-sm text-foreground-muted">Recorrente</label>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setShowCostForm(false)}>Cancelar</Button>
                  <Button size="sm" onClick={() => costMutation.mutate()} disabled={costMutation.isPending}>Salvar</Button>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader className="text-left">
          <CardTitle>Demonstrativo mensal — {currency(totalCost)}</CardTitle>
        </CardHeader>

        {report.length === 0 ? (
          <p className="py-4 text-center text-sm text-foreground-muted">Nenhum custo cadastrado.</p>
        ) : (
          <div className="space-y-4">
            {report.map((row) => (
              <div key={row.user_id} className="rounded-lg bg-surface-sunken p-4">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-foreground">{row.user_name}</p>
                  <p className="font-semibold text-foreground">{currency(row.total)}</p>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {Object.entries(row.categories).map(([name, amount]) => (
                    <span key={name} className="inline-flex items-center gap-1 rounded-full bg-surface px-2 py-0.5 text-xs text-foreground-muted">
                      {name}: {currency(amount)}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {costs.length > 0 && (
        <Card className="mt-6">
          <CardHeader className="text-left">
            <CardTitle>Todos os custos</CardTitle>
          </CardHeader>

          <div className="space-y-1">
            {costs.map((cost) => (
              <div key={cost.id} className="flex items-center justify-between rounded-lg bg-surface-sunken px-3 py-2 text-sm">
                <span className="text-foreground">{cost.user?.name} — {cost.category?.name}</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{currency(cost.amount)}</span>
                  <span className="text-xs text-foreground-muted">{cost.recurring ? 'recorrente' : cost.reference_month}</span>
                  <button onClick={() => deleteMutation.mutate(cost.id)} className="text-foreground-muted hover:text-danger">
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </>
  )
}
