import { useState, type FormEvent } from 'react'
import { useSearch } from '@tanstack/react-router'
import { ApiError } from '../services/api'
import { getApiErrorMessage } from '../services/getApiErrorMessage'
import { resetPassword } from '../services/authService'
import { Alert } from '../components/ui/Alert'
import { AuthLayout, AuthLink } from '../components/ui/AuthLayout'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'

export function ResetPasswordPage() {
  const searchParams = useSearch({ strict: false }) as Record<string, string | undefined>
  const [email, setEmail] = useState(searchParams.email ?? '')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const token = searchParams.token ?? ''

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setMessage(null)
    setIsSubmitting(true)

    try {
      const responseMessage = await resetPassword({
        email,
        password,
        password_confirmation: passwordConfirmation,
        token,
      })
      setMessage(responseMessage)
    } catch (submitError) {
      if (submitError instanceof ApiError) {
        setError(getApiErrorMessage(submitError, 'email'))
      } else {
        setError('Não foi possível redefinir a senha. Tente novamente.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title="Nova senha"
      description="Defina uma nova senha para sua conta"
      footer={<AuthLink to="/login">Voltar para o login</AuthLink>}
    >
      {!token && (
        <div className="mb-4">
          <Alert variant="warning">
            Link inválido ou expirado. Solicite uma nova recuperação de senha.
          </Alert>
        </div>
      )}

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
          label="Nova senha"
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          autoComplete="new-password"
        />

        <Input
          label="Confirmar senha"
          id="password_confirmation"
          type="password"
          value={passwordConfirmation}
          onChange={(event) => setPasswordConfirmation(event.target.value)}
          required
          autoComplete="new-password"
        />

        {message && <Alert variant="success">{message}</Alert>}
        {error && <Alert variant="danger">{error}</Alert>}

        <Button type="submit" disabled={isSubmitting || !token} className="w-full">
          {isSubmitting ? 'Salvando...' : 'Redefinir senha'}
        </Button>
      </form>
    </AuthLayout>
  )
}
