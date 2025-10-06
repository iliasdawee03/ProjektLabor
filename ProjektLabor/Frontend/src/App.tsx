import { Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage.tsx'
import RegisterPage from './pages/RegisterPage.tsx'
import { ProtectedRoute } from './auth/ProtectedRoute.tsx'
import { useAuth } from './auth/useAuth'
import ProfilePage from './pages/ProfilePage.tsx'
import AdminUsersPage from './pages/AdminUsersPage.tsx'
import JobsListPage from './pages/JobsListPage.tsx'
import JobDetailsPage from './pages/JobDetailsPage.tsx'
import CreateJobPage from './pages/CreateJobPage'
import CompanyJobsPage from './pages/CompanyJobsPage'
import EditJobPage from './pages/EditJobPage'
          <Route path="/jobs/:id/edit" element={
            <ProtectedRoute roles={['Company']}>
              <EditJobPage />
            </ProtectedRoute>
          } />

function App() {
  const { user, token, logout } = useAuth()
  const navigate = useNavigate()
  return (
    <div className="min-h-full">
      <header className="border-b bg-white">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="text-lg font-semibold">Álláshírdető</Link>
            <nav className="hidden md:flex items-center gap-4 text-sm text-gray-700">
              <Link to="/" className="hover:text-gray-900">Kezdőlap</Link>
              <Link to="/jobs" className="hover:text-gray-900">Állások</Link>
              {user?.roles?.includes('Company') && (
                <>
                  <Link to="/company/jobs" className="hover:text-gray-900">Cég hirdetései</Link>
                  <Link to="/jobs/create" className="hover:text-gray-900 font-semibold text-blue-700">Új állás feladása</Link>
                </>
              )}
              {user?.roles?.includes('Admin') && (
                <Link to="/admin/users" className="hover:text-gray-900">Admin</Link>
              )}
            </nav>
          </div>
          <div className="flex items-center gap-2">
            {!token ? (
              <>
                <Link to="/login" className="inline-flex items-center justify-center rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-900 shadow hover:bg-gray-300">Bejelentkezés</Link>
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:text-white focus:text-white active:text-white visited:text-white shadow hover:bg-blue-700"
                >
                  Regisztráció
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-700">{user?.fullName ?? user?.email}</span>
                <button className="inline-flex items-center justify-center rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-900 shadow hover:bg-gray-300" onClick={() => navigate('/profile')}>Profil</button>
                <button className="inline-flex items-center justify-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-red-700" onClick={() => { logout(); navigate('/'); }}>Kilépés</button>
              </div>
            )}
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Routes>
          <Route path="/" element={<JobsListPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/jobs" element={<JobsListPage />} />
          <Route path="/jobs/:id" element={<JobDetailsPage />} />
          <Route path="/jobs/:id/edit" element={
            <ProtectedRoute roles={['Company']}>
              <EditJobPage />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />
          <Route path="/jobs/create" element={
            <ProtectedRoute roles={['Company']}>
              <CreateJobPage />
            </ProtectedRoute>
          } />
          <Route path="/company/jobs" element={
            <ProtectedRoute roles={['Company']}>
              <CompanyJobsPage />
            </ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <div>Dashboard (protected)</div>
            </ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute roles={['Admin']}>
              <AdminUsersPage />
            </ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
