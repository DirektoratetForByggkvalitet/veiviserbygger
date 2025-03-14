import { getConfig } from '@/services/api'
import PageSimple from '@/components/PageSimple'
import Message from '@/components/Message'
import Help from '@/components/Help'
import Loader from '@/components/Loader'
import { createContext, ReactNode, useEffect, useState } from 'react'

type Config = Awaited<ReturnType<typeof getConfig>> | null
type EnvVar = { key: string; optional?: boolean }

const emulatorEnvVars: EnvVar[] = [
  { key: 'FIREBASE_EMULATOR_AUTH_HOST' },
  { key: 'FIREBASE_EMULATOR_FIRESTORE_HOST' },
  { key: 'FIREBASE_EMULATOR_FIRESTORE_PORT', optional: true },
]

const prodEnvVars: EnvVar[] = [
  { key: 'FIREBASE_API_KEY' },
  { key: 'FIREBASE_APP_ID' },
  { key: 'FIREBASE_AUTH_DOMAIN' },
  { key: 'FIREBASE_PROJECT_ID' },
  { key: 'FIREBASE_STORAGE_BUCKET' },
  { key: 'FIREBASE_MESSAGING_SENDER_ID' },
]

function configOk(envVars: { key: string; optional?: boolean }[], config: Config) {
  return envVars.every(({ key, optional }) => !!config?.constants?.[key] || optional)
}

export const ConfigContext = createContext<Config>(null)

function ConfigStatus({
  configKey,
  optional,
  config,
}: {
  configKey: string
  optional: boolean
  config: Config
}) {
  return (
    <>
      <span>
        {!!config?.constants?.[configKey] && '✅'}
        {!config?.constants?.[configKey] && !optional && '❌'}
      </span>
      {configKey} {optional ? '(optional)' : ''}
    </>
  )
}

export default function ConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<Config>()
  const [error, setError] = useState<Error>()

  useEffect(() => {
    getConfig().then(setConfig).catch(setError)
  }, [])

  if (error && !config) {
    return (
      <PageSimple title="En feil oppstod">
        <Help description="Prøv å lukk siden og gå inn på ny." />
        <Message title="Error">{error.message}</Message>
      </PageSimple>
    )
  }

  if (!config) {
    return <Loader />
  }

  if (!configOk(emulatorEnvVars, config) && !configOk(prodEnvVars, config)) {
    return (
      <PageSimple title="Missing environmental variables">
        <p>
          Depending you're in development or production you either need to set env vars for running
          towards an emulator or towards a production Firebase account.
        </p>
        <p>
          You need to set these env vars in the environment of you API. In local dev that would be{' '}
          <code>apps/api/.env.development</code> while in production it would be by setting
          environment variables.
        </p>

        <h2>Emulator</h2>
        <ul>
          {emulatorEnvVars.map(({ key, optional }) => (
            <li key={key}>
              <ConfigStatus configKey={key} optional={!!optional} config={config} />
            </li>
          ))}
        </ul>

        <h2>Production</h2>
        <ul>
          {prodEnvVars.map(({ key, optional }) => (
            <li key={key}>
              <ConfigStatus configKey={key} optional={!!optional} config={config} />
            </li>
          ))}
        </ul>
      </PageSimple>
    )
  }

  return <ConfigContext.Provider value={config}>{children}</ConfigContext.Provider>
}
