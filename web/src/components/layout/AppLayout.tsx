import { useLayoutEffect, useRef } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AppHeader } from './AppHeader'
import { BottomNav } from './BottomNav'
import { Sidebar } from './Sidebar'

export function AppLayout() {
  const location = useLocation()
  const mainRef = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    document.body.style.overflow = ''
    mainRef.current?.scrollTo({ top: 0, left: 0 })
  }, [location.key])

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <AppHeader />

        <main
          ref={mainRef}
          className="flex-1 overflow-y-auto px-4 py-4 pb-24 md:px-8 md:py-8 md:pb-8"
        >
          <Outlet key={location.key} />
        </main>
      </div>

      <BottomNav />
    </div>
  )
}
