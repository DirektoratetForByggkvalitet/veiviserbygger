import { useState } from 'react'

import useAuth from '@/hooks/auth'

import ButtonBar from '@/components/ButtonBar'
import Button from '@/components/Button'
import Form from '@/components/Form'
import Input from '@/components/Input'
import PageSimple from '@/components/PageSimple'
import Message from '@/components/Message'
import Divider from '@/components/Divider'
import { copy } from '@/lib/copy'

export default function LoginPage() {
  const { user, login, logout, oidc } = useAuth()
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
    <PageSimple title={copy.login.title}>
      <p>{copy.login.description}</p>
      {!user ? (
        <>
          {oidc ? (
            <>
              <ButtonBar margins>
                <Button primary icon="LogIn" size="large" onClick={oidc.login}>
                  Logg inn med {oidc.name}
                </Button>
              </ButtonBar>
              <Divider text="eller" />
            </>
          ) : null}
          <Form onSubmit={handleSubmit}>
            <Input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange('email')}
              label="Epost"
              inputDebounceMs={0}
            />
            <Input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange('password')}
              label="Passord"
              inputDebounceMs={0}
            />
            {error === 'auth/user-not-found' ? (
              <Message title="Brukeren finnes ikke i systemet"></Message>
            ) : null}
            {error === 'auth/wrong-password' ? (
              <Message title="Feil brukernavn/passord"></Message>
            ) : null}
            <ButtonBar>
              <Button type="submit" primary disabled={!form.email || !form.password}>
                Logg inn
              </Button>
            </ButtonBar>
          </Form>
        </>
      ) : (
        <>
          <Message title="Du er allerede innlogget">
            Prøv å last inn siden på ny eller logg ut for å komme tilbake til veiviseren.
          </Message>
          <Button onClick={logout}>Logg ut</Button>
        </>
      )}
    </PageSimple>
  )
}
