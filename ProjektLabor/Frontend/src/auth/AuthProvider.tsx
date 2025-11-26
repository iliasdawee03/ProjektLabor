import { useEffect, useMemo, useState, useCallback } from 'react'
import { api } from '../lib/api'
import { AuthContext, type User } from './AuthContext'

const TOKEN_KEY = 'pl_token'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY))
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState<boolean>(() => !!localStorage.getItem(TOKEN_KEY))

  useEffect(() => {
    if (token) {
      setLoading(true)
      localStorage.setItem(TOKEN_KEY, token)
      // backend: GET /api/v1/users/me returns { id, email, fullName, roles }
      api.get<User>('/api/v1/users/me')
        .then((r: { data: User }) => setUser(r.data))
        .catch(() => setUser(null))
        .finally(() => setLoading(false))
    } else {
      localStorage.removeItem(TOKEN_KEY)
      setUser(null)
      setLoading(false)
    }
  }, [token])

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.post<{ token: string }>('/api/v1/auth/login', { email, password })
    setToken(res.data.token)
  }, [])

  const register = useCallback(async (email: string, password: string, fullName: string) => {
    await api.post('/api/v1/auth/register', { email, password, fullName })
    await login(email, password)
  }, [login])

  const logout = () => setToken(null)

  const value = useMemo(() => ({ user, token, login, register, logout, loading }), [user, token, login, register, loading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
