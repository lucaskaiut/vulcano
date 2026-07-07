import { useLayoutEffect, useMemo, useRef } from 'react'
import { Navigate, Outlet, useLocation } from '@tanstack/react-router'
import { useAuth } from '../../contexts/AuthContext'
import { routeRequiresPermission } from '../../config/navigation'
import { AppHeader } from './AppHeader'
import { BottomNav } from './BottomNav'
import { Sidebar } from './Sidebar'

function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <p className="text-sm font-medium text-foreground-muted">Carregando...</p>
    </div>
  )
}

export default function AppLayout() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const location = useLocation()
  const mainRef = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    mainRef.current?.scrollTo({ top: 0, left: 0 })
  }, [location.pathname])

  const requiredPermission = useMemo(
    () => routeRequiresPermission(location.pathname),
    [location.pathname],
  )

  const userPermissionSlugs = useMemo(
    () =>
      user?.roles
        ? [...new Set(user.roles.flatMap((r) => r.permission_slugs))]
        : [],
    [user?.roles],
  )

  const hasPermission =
    !requiredPermission || userPermissionSlugs.includes(requiredPermission)

  if (isLoading) {
    return <LoadingScreen />
  }

  if (!isAuthenticated) {
    if (location.pathname !== '/login') {
      sessionStorage.setItem('redirect_after_login', location.pathname + location.searchStr)
    }
    return <Navigate to="/login" />
  }

  if (!hasPermission) {
    return <Navigate to="/" />
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader />

        <main
          ref={mainRef}
          className="flex-1 overflow-y-auto px-4 py-4 pb-24 md:px-8 md:py-8 md:pb-8"
        >
          <Outlet />
        </main>
      </div>

      <BottomNav />
    </div>
  )
}
