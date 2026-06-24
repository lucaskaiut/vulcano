import { LogOut } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { getNavigationTitle } from '../../config/navigation'

export function AppHeader() {
  const { pathname } = useLocation()
  const { logout } = useAuth()
  const title = getNavigationTitle(pathname)

  return (
    <header className="flex items-center justify-between gap-3 bg-surface px-4 py-4 shadow-surface md:px-8 md:py-5">
      <h1 className="min-w-0 truncate text-lg font-semibold tracking-tight text-foreground md:text-xl">
        {title}
      </h1>

      <button
        type="button"
        onClick={() => logout()}
        aria-label="Sair"
        className="flex size-9 shrink-0 items-center justify-center rounded-lg text-foreground-muted transition hover:bg-surface-sunken hover:text-foreground md:hidden"
      >
        <LogOut className="size-4" aria-hidden />
      </button>
    </header>
  )
}
