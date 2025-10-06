import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuth } from '../auth/useAuth'
import toast from 'react-hot-toast'
import { useLocation, useNavigate } from 'react-router-dom'


import { AppLink, Button } from '../components/Button'
import { Card, CardHeader } from '../components/Card'
import { TextInput } from '../components/TextInput'
import { Alert } from '../components/Alert'

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
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Bejelentkezés</h2>
        </CardHeader>
        <div className="p-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <TextInput
              label="Email"
              type="email"
              {...register('email')}
              error={errors.email?.message}
            />
            <TextInput
              label="Jelszó"
              type="password"
              {...register('password')}
              error={errors.password?.message}
            />
            {/* Globális hibaüzenet, késöbb */}
            {/* {formError && <Alert type="error">{formError}</Alert>} */}
            <Button type="submit" variant="primary" disabled={isSubmitting}>Belépés</Button>
          </form>
          <p className="mt-4 text-sm">Még nincs fiókod? <AppLink href="/register" variant="link" className="text-blue-600">Regisztráció</AppLink></p>
        </div>
      </Card>
    </div>
  )
}
