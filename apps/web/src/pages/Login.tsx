import { useState } from 'react'

import useAuth from '@/hooks/auth'

import Button from '@/components/Button'
import Container from '@/components/Container'
import Input from '@/components/Input'
import Meta from '@/components/Meta'

export default function LoginPage() {
  const { user, signUp, login, logout } = useAuth()
  const [error, setError] = useState<string>()
  const [form, setForm] = useState({ email: '', password: '' })

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (form.email && form.password) {
      login('email', { email: form.email, password: form.password })?.catch((e) => setError(e.code))
    }
  }

  const handleChange = (field: keyof typeof form) => (value: string) => {
    setForm({ ...form, [field]: value })
  }

  return (
    <Container size="tight">
      <Meta title="Velkommen til login siden våres. Du tar det herfra" />

      {user ? (
        <>
          <h1>Innlogga</h1>
          <p>Hei, {user.email}</p>
        </>
      ) : (
        <h1>Utlogga</h1>
      )}

      {!user ? (
        <form onSubmit={handleSubmit}>
          <Input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange('email')}
            label="E-post"
          />
          <Input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange('password')}
            label="Passord"
          />
          <Button type="submit" primary>
            Logg inn
          </Button>

          {error === 'auth/user-not-found' ? (
            <p>
              Brukeren finnes inn.{' '}
              <button onClick={() => signUp(form.email, form.password)}>
                Registrér ny bruker i stedet
              </button>
            </p>
          ) : null}
        </form>
      ) : (
        <button onClick={logout}>Logg ut</button>
      )}
    </Container>
  )
}
