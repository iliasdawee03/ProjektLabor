import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './useAuth'
import { Centered, Loading } from '../components/Centered'

//Ellenőrzi, hogy van-e bejelentkezett felhasználó (token).
//Ha nincs token: átirányít a /login oldalra, és eltárolja, honnan jöttél (state.from), hogy belépés után vissza lehessen irányítani.

export function ProtectedRoute({ children, roles }: { children: React.ReactElement, roles?: string[] }) {
  const { token, user, loading } = useAuth()
  const location = useLocation()

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // If we have a token but the user info is still loading, don't redirect yet — show a loader.
  if (token && user === null && loading) {
    return <Centered><Loading /></Centered>
  }

  if (roles && roles.length > 0) {
    const has = user?.roles?.some(r => roles.includes(r))
    if (!has) return <Navigate to="/" replace />
  }

  return children
}
