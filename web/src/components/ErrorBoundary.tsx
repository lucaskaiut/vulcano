import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Button } from './ui/Button'

type ErrorBoundaryProps = {
  children: ReactNode
}

type ErrorBoundaryState = {
  hasError: boolean
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Erro de renderização:', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4">
          <div className="max-w-md rounded-xl bg-surface p-8 shadow-overlay text-center">
            <h1 className="text-lg font-semibold text-foreground">Algo deu errado</h1>
            <p className="mt-2 text-sm text-foreground-muted">
              Não foi possível carregar a página. Tente novamente.
            </p>
            <Button
              type="button"
              className="mt-6"
              onClick={() => {
                this.setState({ hasError: false })
                window.location.assign('/')
              }}
            >
              Recarregar
            </Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
