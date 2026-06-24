import { useAuth } from '../contexts/AuthContext'
import { Card, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'

export function HomePage() {
  const { user } = useAuth()

  return (
    <Card>
      <CardHeader className="text-left">
        <CardTitle>Bem-vindo, {user?.name}</CardTitle>
        <CardDescription>
          Sistema inicial configurado. Autenticação ativa para{' '}
          <span className="font-medium text-foreground">{user?.email}</span>.
        </CardDescription>
      </CardHeader>
    </Card>
  )
}
