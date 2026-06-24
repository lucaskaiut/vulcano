import { LayoutDashboard, Shield, Users, type LucideIcon } from 'lucide-react'

export type NavigationItem = {
  label: string
  href: string
  title: string
  icon: LucideIcon
}

export const navigationItems: NavigationItem[] = [
  { label: 'Dashboard', href: '/', title: 'Dashboard', icon: LayoutDashboard },
  { label: 'Colaboradores', href: '/users', title: 'Colaboradores', icon: Users },
  { label: 'Perfis', href: '/roles', title: 'Perfis', icon: Shield },
]

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

  const exactMatch = navigationItems.find((item) => item.href === pathname)
  if (exactMatch) {
    return exactMatch.title
  }

  const prefixMatch = navigationItems.find(
    (item) => item.href !== '/' && pathname.startsWith(item.href),
  )

  return prefixMatch?.title ?? 'Vulcano'
}
