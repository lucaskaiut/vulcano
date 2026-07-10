import {
  CalendarPlus, Coins, ClipboardList, DollarSign, FileText, Building,
  FolderOpen, GitBranch, BarChart3, LayoutDashboard, Palmtree, PiggyBank,
  ReceiptText, Shield, Users, BookOpen, Building2, Bell,
  type LucideIcon,
} from 'lucide-react'
import { usePermissions } from '../hooks/usePermissions'
import { useMemo } from 'react'

export type NavigationItem = {
  label: string
  href: string
  title: string
  icon: LucideIcon
  permission?: string
  children?: NavigationItem[]
}

type NavigationGroup = {
  label: string
  icon: LucideIcon
  children: NavigationItem[]
  permission?: string
}

const allNavigationItems: (NavigationItem | NavigationGroup)[] = [
  { label: 'Dashboard', href: '/', title: 'Dashboard', icon: LayoutDashboard },

  {
    label: 'Pessoas',
    icon: Users,
    children: [
      { label: 'Colaboradores', href: '/users', title: 'Colaboradores', icon: Users, permission: 'users.view' },
      { label: 'Setores', href: '/sectors', title: 'Setores', icon: Building2, permission: 'users.view' },
      { label: 'Perfis', href: '/roles', title: 'Perfis', icon: Shield, permission: 'roles.view' },
    ],
  },

  {
    label: 'Férias',
    icon: Palmtree,
    children: [
      { label: 'Saldos', href: '/vacation-balances', title: 'Saldos de férias', icon: Palmtree, permission: 'vacation_balances.view' },
      { label: 'Solicitações', href: '/vacation-requests', title: 'Solicitações de férias', icon: CalendarPlus, permission: 'vacation_requests.view' },
    ],
  },

  {
    label: 'Financeiro',
    icon: DollarSign,
    children: [
      { label: 'Comissões', href: '/sales', title: 'Comissões', icon: DollarSign, permission: 'commissions.view' },
      { label: 'Empreendimentos', href: '/enterprises', title: 'Empreendimentos', icon: Building, permission: 'enterprises.view' },
      { label: 'Custos', href: '/costs', title: 'Custos', icon: Coins, permission: 'costs.view' },
      { label: 'Categorias', href: '/cost-categories', title: 'Categorias de custo', icon: FolderOpen, permission: 'costs.view' },
      { label: 'Provisões', href: '/provision-rules', title: 'Regras de provisão', icon: PiggyBank, permission: 'costs.view' },
      { label: 'Notas Fiscais', href: '/invoices', title: 'Notas Fiscais', icon: ReceiptText, permission: 'invoices.view' },
    ],
  },

  {
    label: 'Documentos',
    icon: FileText,
    children: [
      { label: 'Tipos', href: '/document-types', title: 'Tipos de documento', icon: FileText, permission: 'document_types.view' },
    ],
  },

  {
    label: 'Automação',
    icon: GitBranch,
    children: [
      { label: 'Workflows', href: '/workflows', title: 'Fluxos de Aprovação', icon: GitBranch, permission: 'workflow_steps.update' },
      { label: 'Notificações', href: '/notification-rules', title: 'Notificações', icon: Bell, permission: 'notifications.view' },
    ],
  },

  {
    label: 'Sistema',
    icon: BarChart3,
    children: [
      { label: 'Relatórios', href: '/reports', title: 'Relatórios', icon: BarChart3, permission: 'users.view' },
      { label: 'Auditoria', href: '/audit-logs', title: 'Auditoria', icon: ClipboardList, permission: 'audit.view' },
      { label: 'Guia do Usuário', href: '/user-guide', title: 'Guia do Usuário', icon: BookOpen },
    ],
  },
]

// Flatten all navigation items for route matching (groups are not routes)
function flattenItems(items: (NavigationItem | NavigationGroup)[]): NavigationItem[] {
  const result: NavigationItem[] = []
  for (const item of items) {
    if ('href' in item && item.href) {
      result.push(item)
    }
    if ('children' in item && item.children) {
      result.push(...flattenItems(item.children))
    }
  }
  return result
}

const flatItems = flattenItems(allNavigationItems)

const routePermissionMap: Record<string, string> = {
  '/users': 'users.view',
  '/users/novo': 'users.create',
  '/sectors': 'users.view',
  '/sectors/novo': 'users.create',
  '/enterprises': 'enterprises.view',
  '/enterprises/novo': 'enterprises.create',
  '/sales': 'commissions.view',
  '/costs': 'costs.view',
  '/costs/novo': 'costs.create',
  '/cost-categories': 'costs.view',
  '/cost-categories/novo': 'costs.create',
  '/provision-rules': 'costs.view',
  '/provision-rules/novo': 'costs.create',
  '/document-types': 'document_types.view',
  '/document-types/novo': 'document_types.create',
  '/invoices': 'invoices.view',
  '/reports': 'users.view',
  '/audit-logs': 'audit.view',
  '/vacation-balances': 'vacation_balances.view',
  '/vacation-requests': 'vacation_requests.view',
  '/roles': 'roles.view',
  '/roles/novo': 'roles.create',
  '/workflows': 'workflow_steps.update',
  '/workflow-instances': 'workflow_instances.view',
  '/notification-templates': 'notifications.view',
  '/notification-templates/novo': 'notifications.view',
  '/notification-rules': 'notifications.view',
  '/notification-rules/novo': 'notifications.view',
  '/notification-history': 'notifications.view',
}

const ROUTE_EDIT_PATTERNS: { pattern: RegExp; permission: string }[] = [
  { pattern: /^\/users\/\d+\/editar$/, permission: 'users.update' },
  { pattern: /^\/sectors\/\d+\/editar$/, permission: 'users.update' },
  { pattern: /^\/enterprises\/\d+\/editar$/, permission: 'enterprises.update' },
  { pattern: /^\/provision-rules\/\d+\/editar$/, permission: 'costs.create' },
  { pattern: /^\/document-types\/\d+\/editar$/, permission: 'document_types.update' },
  { pattern: /^\/roles\/\d+\/editar$/, permission: 'roles.update' },
  { pattern: /^\/notification-templates\/\d+\/editar$/, permission: 'notifications.view' },
  { pattern: /^\/notification-rules\/\d+\/editar$/, permission: 'notifications.view' },
]

const ROUTE_VIEW_PATTERNS: { pattern: RegExp; permission: string }[] = [
  { pattern: /^\/users\/\d+$/, permission: 'users.view' },
  { pattern: /^\/workflow-instances\/\d+$/, permission: 'workflow_instances.view' },
]

export function routeRequiresPermission(pathname: string): string | null {
  if (routePermissionMap[pathname]) return routePermissionMap[pathname]
  for (const { pattern, permission } of ROUTE_EDIT_PATTERNS) {
    if (pattern.test(pathname)) return permission
  }
  for (const { pattern, permission } of ROUTE_VIEW_PATTERNS) {
    if (pattern.test(pathname)) return permission
  }
  return null
}

export function useFilteredNavigation(): (NavigationItem | NavigationGroup)[] {
  const { can } = usePermissions()

  return useMemo(
    () => filterNavigation(allNavigationItems, can),
    [can],
  )
}

function filterNavigation(
  items: (NavigationItem | NavigationGroup)[],
  can: (slug: string) => boolean,
): (NavigationItem | NavigationGroup)[] {
  const result: (NavigationItem | NavigationGroup)[] = []

  for (const item of items) {
    // Regular nav item
    if ('href' in item && item.href) {
      if (!item.permission || can(item.permission)) {
        result.push(item)
      }
      continue
    }

    // Group item
    if ('children' in item && item.children) {
      const visibleChildren = item.children.filter(
        (child) => !child.permission || can(child.permission),
      )
      if (visibleChildren.length > 0) {
        result.push({ ...item, children: visibleChildren })
      }
    }
  }

  return result
}

export function isNavItemActive(href: string, pathname: string): boolean {
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(`${href}/`)
}

export { allNavigationItems, flatItems }

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
  if (pathname === '/enterprises') return 'Empreendimentos'
  if (pathname === '/enterprises/novo') return 'Novo empreendimento'
  if (/^\/enterprises\/\d+\/editar$/.test(pathname)) return 'Editar empreendimento'
  if (pathname === '/provision-rules') return 'Regras de provisão'
  if (pathname === '/provision-rules/novo') return 'Nova regra'
  if (/^\/provision-rules\/\d+\/editar$/.test(pathname)) return 'Editar regra'
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
  if (pathname === '/notification-templates') return 'Templates'
  if (pathname === '/notification-templates/novo') return 'Novo template'
  if (/^\/notification-templates\/\d+\/editar$/.test(pathname)) return 'Editar template'
  if (pathname === '/notification-rules') return 'Regras'
  if (pathname === '/notification-rules/novo') return 'Nova regra'
  if (/^\/notification-rules\/\d+\/editar$/.test(pathname)) return 'Editar regra'

  const exactMatch = flatItems.find((item) => item.href === pathname)
  if (exactMatch) return exactMatch.title

  const prefixMatch = flatItems.find(
    (item) => item.href !== '/' && pathname.startsWith(item.href),
  )
  return prefixMatch?.title ?? 'Vulcano'
}
