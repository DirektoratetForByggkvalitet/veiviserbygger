import { useState } from 'react'

import useAuth from '@/hooks/auth'

import Button from '@/components/Button'
import Checkbox from '@/components/Checkbox'
import Container from '@/components/Container'
import Dropdown from '@/components/Dropdown'
import Input from '@/components/Input'
import Meta from '@/components/Meta'

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
    <Container size="tight">
      <Meta title="Velkommen til login siden våres. Du tar det herfra" />

      {user ? (
        <>
          <h1>Innlogga</h1>
          <p>Hei, {user.email}</p>
        </>
      ) : (
        <h1>Login</h1>
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

          <Checkbox label="Ja, eller nei" onChange={handleChange('check')} checked={form.check} />

          <Dropdown
            label="Velg farge"
            value={form.color}
            options={[
              { label: 'Blå', value: 'blue' },
              { label: 'Gul', value: 'yellow' },
              { label: 'Hund', value: 'dog' },
              { label: 'Katt', value: 'cat' },
              { label: 'Hus', value: 'house' },
              { label: 'Fly', value: 'plain' },
              { label: 'Sko', value: 'shoes' },
            ]}
            onChange={handleChange('color')}
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
