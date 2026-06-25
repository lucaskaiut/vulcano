import { useMemo } from 'react'
import { useAuth } from '../contexts/AuthContext'

export function usePermissions() {
  const { user } = useAuth()

  const permissionSlugs = useMemo(() => {
    if (!user?.roles) return []

    return [...new Set(user.roles.flatMap((r) => r.permission_slugs))]
  }, [user?.roles])

  const can = useMemo(() => {
    return (slug: string) => permissionSlugs.includes(slug)
  }, [permissionSlugs])

  return { permissionSlugs, can }
}
