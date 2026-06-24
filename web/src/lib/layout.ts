export function getInitials(name: string): string {
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
