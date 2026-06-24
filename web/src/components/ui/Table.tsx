import { ChevronDown } from 'lucide-react'
import { Children, isValidElement, useState, type ReactNode } from 'react'

type TableProps = {
  children: ReactNode
  className?: string
}

export function Table({ children, className = '' }: TableProps) {
  return (
    <div className={`rounded-xl bg-surface shadow-overlay ${className}`}>
      <table className="w-full table-fixed text-left text-sm">{children}</table>
    </div>
  )
}

export function TableHead({ children }: { children: ReactNode }) {
  return (
    <thead className="border-b border-surface-sunken text-xs uppercase tracking-wide text-foreground-muted">
      {children}
    </thead>
  )
}

export function TableBody({ children }: { children: ReactNode }) {
  return <tbody className="divide-y divide-surface-sunken">{children}</tbody>
}

export function TableRow({ children }: { children: ReactNode }) {
  return <tr className="transition hover:bg-surface-sunken/60">{children}</tr>
}

type TableHeaderCellProps = {
  children: ReactNode
  className?: string
}

export function TableHeaderCell({ children, className = '' }: TableHeaderCellProps) {
  return (
    <th className={`px-3 py-2.5 font-medium md:px-4 md:py-3 ${className}`}>{children}</th>
  )
}

/** Coluna oculta no mobile — conteúdo deve aparecer em `details` da ExpandableTableRow. */
export function TableHeaderCellCollapsible({ children, className = '' }: TableHeaderCellProps) {
  return (
    <TableHeaderCell className={`hidden md:table-cell ${className}`}>{children}</TableHeaderCell>
  )
}

/** Cabeçalho da coluna de expansão (somente mobile). */
export function TableHeaderCellExpand() {
  return <th className="w-10 px-2 py-2.5 md:hidden" aria-hidden />
}

export function TableCell({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <td className={`px-3 py-2.5 text-foreground md:px-4 md:py-3 ${className}`}>{children}</td>
  )
}

/** Célula oculta no mobile — conteúdo duplicado em `details` da ExpandableTableRow. */
export function TableCellCollapsible({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <TableCell className={`hidden md:table-cell ${className}`}>{children}</TableCell>
}

type ExpandableTableRowProps = {
  children: ReactNode
  details: ReactNode
  /** Colunas visíveis no mobile (inclui expansão e ações). */
  mobileColSpan: number
}

/**
 * Linha com painel colapsável no mobile. O último filho deve ser a célula de ações.
 * Insere o botão de expansão antes da célula de ações.
 */
export function ExpandableTableRow({ children, details, mobileColSpan }: ExpandableTableRowProps) {
  const [expanded, setExpanded] = useState(false)
  const childArray = Children.toArray(children).filter(isValidElement)
  const actionCell = childArray.at(-1)
  const leadingCells = childArray.slice(0, -1)

  return (
    <>
      <tr className="transition hover:bg-surface-sunken/60">
        {leadingCells}
        <td className="w-10 px-2 py-2.5 md:hidden">
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            aria-expanded={expanded}
            aria-label={expanded ? 'Recolher detalhes' : 'Expandir detalhes'}
            className="flex size-8 items-center justify-center rounded-lg text-foreground-muted transition hover:bg-surface-sunken hover:text-foreground"
          >
            <ChevronDown
              className={`size-4 transition-transform ${expanded ? 'rotate-180' : ''}`}
              aria-hidden
            />
          </button>
        </td>
        {actionCell}
      </tr>
      {expanded && (
        <tr className="md:hidden">
          <td colSpan={mobileColSpan} className="bg-surface-sunken/40 px-3 py-3">
            {details}
          </td>
        </tr>
      )}
    </>
  )
}

export function TableRowDetails({ children }: { children: ReactNode }) {
  return <div className="space-y-3">{children}</div>
}

export function TableDetail({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-foreground-muted">{label}</p>
      <div className="mt-0.5 text-sm text-foreground">{children}</div>
    </div>
  )
}
