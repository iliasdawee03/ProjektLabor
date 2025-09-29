import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuth } from '../auth/useAuth'
import toast from 'react-hot-toast'
import { useLocation, useNavigate, Link } from 'react-router-dom'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
})

type FormValues = z.infer<typeof schema>

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as { from?: { pathname: string } } | null
  const from = state?.from?.pathname || '/'

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema)
  })

  const onSubmit = async (values: FormValues) => {
    try {
      await login(values.email, values.password)
      toast.success('Sikeres bejelentkezés')
      navigate(from, { replace: true })
    } catch (err: unknown) {
      let message = 'Bejelentkezés sikertelen'
      if (typeof err === 'object' && err && 'response' in err) {
        const resp = (err as { response?: { data?: unknown } }).response
        if (resp?.data && typeof resp.data === 'string') message = resp.data
      }
      toast.error(message)
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 p-4">
          <h2 className="text-lg font-semibold">Bejelentkezés</h2>
        </div>
        <div className="p-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <label className="block space-y-1">
              <span className="text-sm text-gray-700">Email</span>
              <input className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" type="email" {...register('email')} />
              {errors.email && <span className="text-xs text-red-600">{errors.email.message}</span>}
            </label>
            <label className="block space-y-1">
              <span className="text-sm text-gray-700">Jelszó</span>
              <input className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" type="password" {...register('password')} />
              {errors.password && <span className="text-xs text-red-600">{errors.password.message}</span>}
            </label>
            <button disabled={isSubmitting} type="submit" className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue-700 disabled:opacity-50">Belépés</button>
          </form>
          <p className="mt-4 text-sm">Még nincs fiókod? <Link className="text-blue-600" to="/register">Regisztráció</Link></p>
        </div>
      </div>
    </div>
  )
}
