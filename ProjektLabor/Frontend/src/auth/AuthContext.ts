import { createContext } from 'react'

export type Role = 'Admin' | 'Company' | 'JobSeeker'

export type User = {
  id: string
  email: string
  fullName?: string
  roles: Role[]
}

type AuthState = {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, fullName: string) => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthState | undefined>(undefined)
