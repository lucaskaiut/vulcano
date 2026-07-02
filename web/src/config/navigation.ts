import { CalendarPlus, Coins, ClipboardList, DollarSign, FileText, FolderOpen, GitBranch, BarChart3, LayoutDashboard, Palmtree, ReceiptText, Shield, Users, BookOpen, Building2, type LucideIcon } from 'lucide-react'
import { usePermissions } from '../hooks/usePermissions'
import { useMemo } from 'react'

export type NavigationItem = {
  label: string
  href: string
  title: string
  icon: LucideIcon
  permission?: string
}

const allNavigationItems: NavigationItem[] = [
  { label: 'Dashboard', href: '/', title: 'Dashboard', icon: LayoutDashboard },
  { label: 'Colaboradores', href: '/users', title: 'Colaboradores', icon: Users, permission: 'users.view' },
  { label: 'Setores', href: '/sectors', title: 'Setores', icon: Building2, permission: 'users.view' },
  { label: 'Férias', href: '/vacation-balances', title: 'Saldos de férias', icon: Palmtree, permission: 'vacation_balances.view' },
  { label: 'Solicitações', href: '/vacation-requests', title: 'Solicitações de férias', icon: CalendarPlus, permission: 'vacation_requests.view' },
  { label: 'Comissões', href: '/sales', title: 'Comissões', icon: DollarSign, permission: 'commissions.view' },
  { label: 'Categorias de custo', href: '/cost-categories', title: 'Categorias de custo', icon: FolderOpen, permission: 'costs.view' },
  { label: 'Custos', href: '/costs', title: 'Custos', icon: Coins, permission: 'costs.view' },
  { label: 'Tipos de documento', href: '/document-types', title: 'Tipos de documento', icon: FileText, permission: 'documents.view' },
  { label: 'Notas Fiscais', href: '/invoices', title: 'Notas Fiscais', icon: ReceiptText, permission: 'invoices.view' },
  { label: 'Relatórios', href: '/reports', title: 'Relatórios', icon: BarChart3, permission: 'users.view' },
  { label: 'Auditoria', href: '/audit-logs', title: 'Auditoria', icon: ClipboardList, permission: 'audit.view' },
  { label: 'Guia do Usuário', href: '/user-guide', title: 'Guia do Usuário', icon: BookOpen },
  { label: 'Perfis', href: '/roles', title: 'Perfis', icon: Shield, permission: 'roles.view' },
  { label: 'Workflows', href: '/workflows', title: 'Fluxos de Aprovação', icon: GitBranch, permission: 'workflow_steps.update' },
]

const routePermissionMap: Record<string, string> = {
  '/users': 'users.view',
  '/users/novo': 'users.create',
  '/sectors': 'users.view',
  '/sectors/novo': 'users.create',
  '/sales': 'commissions.view',
  '/costs': 'costs.view',
  '/costs/novo': 'costs.create',
  '/cost-categories': 'costs.view',
  '/cost-categories/novo': 'costs.create',
  '/document-types': 'documents.view',
  '/document-types/novo': 'documents.create',
  '/invoices': 'invoices.view',
  '/reports': 'users.view',
  '/audit-logs': 'audit.view',
  '/vacation-balances': 'vacation_balances.view',
  '/vacation-requests': 'vacation_requests.view',
  '/roles': 'roles.view',
  '/roles/novo': 'roles.create',
  '/workflows': 'workflow_steps.update',
  '/workflow-instances': 'workflow_instances.view',
}

const ROUTE_EDIT_PATTERNS: { pattern: RegExp; permission: string }[] = [
  { pattern: /^\/users\/\d+\/editar$/, permission: 'users.update' },
  { pattern: /^\/sectors\/\d+\/editar$/, permission: 'users.update' },
  { pattern: /^\/roles\/\d+\/editar$/, permission: 'roles.update' },
]

const ROUTE_VIEW_PATTERNS: { pattern: RegExp; permission: string }[] = [
  { pattern: /^\/users\/\d+$/, permission: 'users.view' },
  { pattern: /^\/workflow-instances\/\d+$/, permission: 'workflow_instances.view' },
]

export function routeRequiresPermission(pathname: string): string | null {
  if (routePermissionMap[pathname]) {
    return routePermissionMap[pathname]
  }

  for (const { pattern, permission } of ROUTE_EDIT_PATTERNS) {
    if (pattern.test(pathname)) return permission
  }

  for (const { pattern, permission } of ROUTE_VIEW_PATTERNS) {
    if (pattern.test(pathname)) return permission
  }

  return null
}

export function useFilteredNavigation(): NavigationItem[] {
  const { can } = usePermissions()

  return useMemo(
    () => allNavigationItems.filter((item) => !item.permission || can(item.permission)),
    [can],
  )
}

export { allNavigationItems }

export function isNavItemActive(href: string, pathname: string): boolean {
  if (href === '/') {
    return pathname === '/'
  }

  return pathname === href || pathname.startsWith(`${href}/`)
}

export function getNavigationTitle(pathname: string): string {
  if (pathname === '/users/novo') return 'Novo colaborador'
  if (/^\/users\/\d+\/editar$/.test(pathname)) return 'Editar colaborador'
  if (/^\/users\/\d+$/.test(pathname)) return 'Detalhes do colaborador'
  if (pathname === '/roles/novo') return 'Novo perfil'
  if (/^\/roles\/\d+\/editar$/.test(pathname)) return 'Editar perfil'
  if (pathname === '/sales') return 'Comissões'
  if (pathname === '/costs') return 'Custos'
  if (pathname === '/costs/novo') return 'Vincular custo'
  if (/^\/costs\/\d+\/editar$/.test(pathname)) return 'Editar custo'
  if (pathname === '/cost-categories') return 'Categorias de custo'
  if (pathname === '/cost-categories/novo') return 'Nova categoria'
  if (/^\/cost-categories\/\d+\/editar$/.test(pathname)) return 'Editar categoria'
  if (pathname === '/sectors') return 'Setores'
  if (pathname === '/sectors/novo') return 'Novo setor'
  if (/^\/sectors\/\d+\/editar$/.test(pathname)) return 'Editar setor'
  if (pathname === '/document-types') return 'Tipos de documento'
  if (pathname === '/document-types/novo') return 'Novo tipo'
  if (/^\/document-types\/\d+\/editar$/.test(pathname)) return 'Editar tipo'
  if (pathname === '/invoices') return 'Notas Fiscais'
  if (pathname === '/reports') return 'Relatórios'
  if (pathname === '/audit-logs') return 'Auditoria'
  if (pathname === '/user-guide') return 'Guia do Usuário'
  if (pathname === '/vacation-requests') return 'Solicitações de férias'
  if (pathname === '/workflow-instances') return 'Processos'
  if (/^\/workflow-instances\/\d+$/.test(pathname)) return 'Detalhes do processo'

  const exactMatch = allNavigationItems.find((item) => item.href === pathname)
  if (exactMatch) {
    return exactMatch.title
  }

  const prefixMatch = allNavigationItems.find(
    (item) => item.href !== '/' && pathname.startsWith(item.href),
  )

  return prefixMatch?.title ?? 'Vulcano'
}
