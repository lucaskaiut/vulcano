import type { UIMatch } from 'react-router-dom'
import { getNavigationTitle } from '../config/navigation'

type AppRouteHandle = {
  title: string
}

export function getRouteTitle(matches: UIMatch[], pathname: string): string {
  for (let index = matches.length - 1; index >= 0; index -= 1) {
    const handle = matches[index].handle as AppRouteHandle | undefined

    if (handle?.title) {
      return handle.title
    }
  }

  return getNavigationTitle(pathname)
}

export function getInitials(name?: string | null): string {
  if (!name?.trim()) {
    return '?'
  }

  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}
