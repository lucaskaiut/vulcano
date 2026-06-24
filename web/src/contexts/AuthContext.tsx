import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { ApiError } from '../services/api'
import * as authService from '../services/authService'
import { mergeUserPreferences } from '../lib/mergeUserPreferences'
import { mergePreferencesOptimistic } from '../services/preferencesService'
import type { User } from '../services/authService'
import type { PreferencesPayload } from '../types/preferences'

type AuthContextValue = {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
  mergePreferences: (partial: PreferencesPayload) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshUser = useCallback(async () => {
    try {
      const currentUser = await authService.getCurrentUser()
      setUser(currentUser)
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        setUser(null)
        return
      }

      throw error
    }
  }, [])

  useEffect(() => {
    refreshUser()
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false))
  }, [refreshUser])

  const login = useCallback(async (email: string, password: string) => {
    const authenticatedUser = await authService.login(email, password)
    setUser(authenticatedUser)
  }, [])

  const logout = useCallback(async () => {
    await authService.logout()
    setUser(null)
  }, [])

  const mergePreferences = useCallback((partial: PreferencesPayload) => {
    setUser((current) => {
      if (!current) {
        return current
      }

      return {
        ...current,
        preferences: mergeUserPreferences(current.preferences, partial),
      }
    })

    void mergePreferencesOptimistic(partial).then((merged) => {
      if (!merged) {
        return
      }

      setUser((current) => (current ? { ...current, preferences: merged } : current))
    })
  }, [])

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: user !== null,
      login,
      logout,
      refreshUser,
      mergePreferences,
    }),
    [user, isLoading, login, logout, refreshUser, mergePreferences],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider.')
  }

  return context
}
