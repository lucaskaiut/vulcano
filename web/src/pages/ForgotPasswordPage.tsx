import { useState, type FormEvent } from 'react'
import { ApiError } from '../services/api'
import { getApiErrorMessage } from '../services/getApiErrorMessage'
import { forgotPassword } from '../services/authService'
import { Alert } from '../components/ui/Alert'
import { AuthLayout, AuthLink } from '../components/ui/AuthLayout'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setMessage(null)
    setIsSubmitting(true)

    try {
      const responseMessage = await forgotPassword(email)
      setMessage(responseMessage)
    } catch (submitError) {
      if (submitError instanceof ApiError) {
        setError(getApiErrorMessage(submitError, 'email'))
      } else {
        setError('Não foi possível enviar o e-mail. Tente novamente.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title="Recuperar senha"
      description="Informe seu e-mail para receber o link de redefinição"
      footer={<AuthLink to="/login">Voltar para o login</AuthLink>}
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

        {message && <Alert variant="success">{message}</Alert>}
        {error && <Alert variant="danger">{error}</Alert>}

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? 'Enviando...' : 'Enviar link'}
        </Button>
      </form>
    </AuthLayout>
  )
}
