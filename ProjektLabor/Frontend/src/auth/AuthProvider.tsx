import { useEffect, useMemo, useState, useCallback } from 'react'
import { api } from '../lib/api'
import { AuthContext, type User } from './AuthContext'

const TOKEN_KEY = 'pl_token'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY))
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token)
      // backend: GET /api/v1/users/me returns { id, email, fullName, roles }
      api.get<User>('/api/v1/users/me').then((r: { data: User }) => setUser(r.data)).catch(() => setUser(null))
    } else {
      localStorage.removeItem(TOKEN_KEY)
      setUser(null)
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

  const value = useMemo(() => ({ user, token, login, register, logout }), [user, token, login, register])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
