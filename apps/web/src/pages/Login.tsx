import { useState } from 'react'

import useAuth from '@/hooks/auth'

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

  const handleChange =
    (field: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setForm({ ...form, [field]: event.target.value })
    }

  return (
    <>
      <Meta title="Velkommen til internett. Vi tar det herfra" />

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
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange('email')}
            placeholder="E-post"
          />
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange('password')}
            placeholder="Passord"
          />
          <button type="submit">Logg inn</button>

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
    </>
  )
}
