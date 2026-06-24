import { LogOut, X } from 'lucide-react'
import { useCallback, useEffect, type PointerEvent as ReactPointerEvent } from 'react'
import { useLocation, useNavigate } from '@tanstack/react-router'
import { useAuth } from '../../contexts/AuthContext'
import { isNavItemActive, navigationItems } from '../../config/navigation'
import { MOBILE_NAV_SHEET_ANIMATION_MS } from '../../hooks/useMobileNavSheet'
import { getInitials } from '../../lib/layout'

type MobileNavDrawerProps = {
  isVisible: boolean
  translateY: number
  isDragging: boolean
  openProgress: number
  sheetRef: React.RefObject<HTMLDivElement | null>
  onClose: () => void
  closeDragHandlers: {
    onPointerDown: (event: ReactPointerEvent) => void
    onPointerMove: (event: ReactPointerEvent) => void
    onPointerUp: (event: ReactPointerEvent) => void
    onPointerCancel: (event: ReactPointerEvent) => void
  }
}

export function MobileNavDrawer({
  isVisible,
  translateY,
  isDragging,
  openProgress,
  sheetRef,
  onClose,
  closeDragHandlers,
}: MobileNavDrawerProps) {
  const { pathname } = useLocation()
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const menuItems = navigationItems.filter((item) => item.href !== '/')

  const goTo = useCallback(
    (href: string) => {
      onClose()
      navigate({ to: href })
    },
    [navigate, onClose],
  )

  useEffect(() => {
    if (!isVisible) {
      return
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isVisible, onClose])

  if (!isVisible) {
    return null
  }

  const sheetTransition = isDragging
    ? 'none'
    : `transform ${MOBILE_NAV_SHEET_ANIMATION_MS}ms cubic-bezier(0.32, 0.72, 0, 1)`

  const backdropTransition = isDragging
    ? 'none'
    : `opacity ${MOBILE_NAV_SHEET_ANIMATION_MS}ms ease`

  return (
    <div
      className="fixed inset-0 z-60 md:hidden"
      role="presentation"
      style={{ pointerEvents: openProgress > 0 ? 'auto' : 'none' }}
    >
      <button
        type="button"
        aria-label="Fechar menu"
        className="absolute inset-0 bg-foreground/30"
        style={{
          opacity: openProgress,
          pointerEvents: openProgress > 0 ? 'auto' : 'none',
          transition: backdropTransition,
        }}
        onClick={onClose}
      />

      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label="Menu de navegação"
        className="absolute inset-x-0 bottom-0 max-h-[85dvh] overflow-y-auto rounded-t-2xl bg-surface pb-[env(safe-area-inset-bottom)] shadow-overlay will-change-transform"
        style={{
          transform: `translateY(${translateY}px)`,
          transition: sheetTransition,
        }}
      >
        <div
          {...closeDragHandlers}
          className="cursor-grab touch-none border-b border-surface-sunken active:cursor-grabbing"
        >
          <div className="flex justify-center pt-2.5 pb-1" aria-hidden>
            <span className="h-1 w-10 rounded-full bg-foreground/15" />
          </div>

          <div className="flex items-center justify-between px-4 pb-4">
            <p className="text-base font-semibold text-foreground">Menu</p>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar menu"
              className="flex size-9 items-center justify-center rounded-lg text-foreground-muted transition hover:bg-surface-sunken hover:text-foreground"
            >
              <X className="size-5" aria-hidden />
            </button>
          </div>
        </div>

        {user && (
          <div className="flex items-center gap-3 border-b border-surface-sunken px-4 py-4">
            <div
              className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-muted text-sm font-semibold text-primary shadow-surface"
              aria-hidden
            >
              {getInitials(user.name)}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">{user.name}</p>
              <p className="truncate text-xs text-foreground-muted">{user.email}</p>
            </div>

            <button
              type="button"
              onClick={() => logout()}
              aria-label="Sair"
              className="flex size-9 shrink-0 items-center justify-center rounded-lg text-foreground-muted transition hover:bg-surface-sunken hover:text-foreground"
            >
              <LogOut className="size-4" aria-hidden />
            </button>
          </div>
        )}

        <nav className="space-y-1 p-3">
          {menuItems.map((item) => {
            const isActive = isNavItemActive(item.href, pathname)
            const Icon = item.icon

            return (
              <button
                key={item.href}
                type="button"
                onClick={() => goTo(item.href)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-medium transition ${
                  isActive
                    ? 'bg-primary-muted text-primary shadow-surface'
                    : 'text-foreground-muted hover:bg-surface-sunken hover:text-foreground'
                }`}
              >
                <Icon className="size-5 shrink-0" aria-hidden />
                {item.label}
              </button>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
