import { useState } from 'react'

import useAuth from '@/hooks/auth'

import Button from '@/components/Button'
import Form from '@/components/Form'
import Input from '@/components/Input'
import PageSimple from '@/components/PageSimple'

export default function LoginPage() {
  const { user, signUp, login, logout } = useAuth()
  const [error, setError] = useState<string>()
  const [form, setForm] = useState({ email: '', password: '', check: false, color: '' })

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (form.email && form.password) {
      login('email', { email: form.email, password: form.password })?.catch((e) => setError(e.code))
    }
  }

  const handleChange = (field: keyof typeof form) => (value: string | boolean) => {
    setForm({ ...form, [field]: value })
  }

  return (
    <PageSimple title="Logg inn">
      {!user ? (
        <Form onSubmit={handleSubmit}>
          <p>Et verktøy for å lage og administrere veivisere.</p>
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

          <Button type="submit" primary disabled={!form.email || !form.password}>
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
        </Form>
      ) : (
        <>
          <p>
            Det ser ut som du allerede er logget inn. Prøv å last inn siden på ny eller logg ut for
            å komme tilbake til veiviseren.
          </p>
          <Button onClick={logout}>Logg ut</Button>
        </>
      )}
    </PageSimple>
  )
}
