import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { ApiError } from '../services/api'
import { getApiErrorMessage } from '../services/getApiErrorMessage'
import { useAuth } from '../contexts/AuthContext'
import { Alert } from '../components/ui/Alert'
import { AuthLayout, AuthLink } from '../components/ui/AuthLayout'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      await login(email, password)
      navigate('/', { replace: true })
    } catch (submitError) {
      if (submitError instanceof ApiError) {
        setError(getApiErrorMessage(submitError, 'email'))
      } else {
        setError('Não foi possível entrar. Tente novamente.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title="Entrar"
      description="Acesse sua conta com e-mail e senha"
      footer={<AuthLink to="/forgot-password">Esqueci minha senha</AuthLink>}
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <Input
          label="E-mail"
          id="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          autoComplete="email"
        />

        <Input
          label="Senha"
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          autoComplete="current-password"
        />

        {error && <Alert variant="danger">{error}</Alert>}

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? 'Entrando...' : 'Entrar'}
        </Button>
      </form>
    </AuthLayout>
  )
}
