import { LayoutDashboard, Menu } from 'lucide-react'
import { useCallback } from 'react'
import { useLocation, useNavigate } from '@tanstack/react-router'
import { isNavItemActive } from '../../config/navigation'
import { useMobileNavSheet } from '../../hooks/useMobileNavSheet'
import { MobileNavDrawer } from './MobileNavDrawer'

export function BottomNav() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const sheet = useMobileNavSheet()
  const isDashboardActive = isNavItemActive('/', pathname)

  const goHome = useCallback(() => navigate({ to: '/' }), [navigate])

  return (
    <>
      <nav
        aria-label="Navegação principal"
        {...sheet.openDragHandlers}
        className="fixed inset-x-0 bottom-0 z-50 touch-none bg-surface pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_16px_-4px_rgb(26_22_37_/_0.12)] md:hidden"
      >
        <div className="flex items-stretch">
          <button
            type="button"
            onClick={goHome}
            className={`flex min-w-0 flex-1 flex-col items-center gap-1 px-2 py-2.5 text-[11px] font-medium transition ${
              isDashboardActive ? 'text-primary' : 'text-foreground-muted'
            }`}
          >
            <LayoutDashboard className="size-5 shrink-0" aria-hidden />
            <span>Dashboard</span>
          </button>

          <button
            type="button"
            onClick={sheet.open}
            aria-label="Abrir menu"
            aria-expanded={sheet.isOpen}
            className="flex min-w-0 flex-1 flex-col items-center gap-1 px-2 py-2.5 text-[11px] font-medium text-foreground-muted transition hover:text-foreground"
          >
            <Menu className="size-5 shrink-0" aria-hidden />
            <span>Menu</span>
          </button>
        </div>
      </nav>

      <MobileNavDrawer
        isVisible={sheet.isVisible}
        translateY={sheet.translateY}
        isDragging={sheet.isDragging}
        openProgress={sheet.openProgress}
        sheetRef={sheet.sheetRef}
        onClose={sheet.close}
        closeDragHandlers={sheet.closeDragHandlers}
      />
    </>
  )
}
