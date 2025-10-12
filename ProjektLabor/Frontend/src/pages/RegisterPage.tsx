import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuth } from '../auth/useAuth'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { toMessage } from '../lib/errors'


import { AppLink, Button } from '../components/Button'
import { Card, CardHeader } from '../components/Card'
import { TextInput } from '../components/TextInput'

const schema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6)
})

type FormValues = z.infer<typeof schema>

export default function RegisterPage() {
  const { register: registerUser } = useAuth()
  const navigate = useNavigate()

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema)
  })

  const onSubmit = async (values: FormValues) => {
    try {
      await registerUser(values.email, values.password, values.fullName)
      toast.success('Sikeres regisztráció')
      navigate('/')
    } catch (err: unknown) {
      toast.error(toMessage(err))
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Regisztráció</h2>
        </CardHeader>
        <div className="p-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <TextInput
              label="Teljes név"
              type="text"
              {...register('fullName')}
              error={errors.fullName?.message}
            />
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
            {/* Globális hibaüzenet, késöbb esetleg */}
            {/* {formError && <Alert type="error">{formError}</Alert>} */}
            <Button type="submit" variant="primary" disabled={isSubmitting}>Regisztráció</Button>
          </form>
          <p className="mt-4 text-sm">Van már fiókod? <AppLink href="/login" variant="link" className="text-blue-600">Bejelentkezés</AppLink></p>
        </div>
      </Card>
    </div>
  )
}
