import { Router } from 'express'
import { Requests } from 'types/requests'

const exposePattern = /^(FEATURE_FLAG|PUBLIC)_(.*)/

let config: Requests['/config']['GET']['response']

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const configRouter = (di: DependencyContainer) => {
  const router = Router()

  /**
   * Exposes all env variables prefixed with PUBLIC_ as constants and feature flags as environment variables
   * starting with `FEATURE_FLAG_` and having a value of `1` or `0`.
   */
  router.get<'', undefined, Requests['/config']['GET']['response']>('', async (req, res) => {
    if (!config) {
      config = Object.keys(process.env)
        .filter((k) => k.match(exposePattern))
        .reduce<Requests['/config']['GET']['response']>((acc, key) => {
          const [type, name] = key.match(exposePattern)?.slice(1) ?? []

          return {
            ...acc,
            flags: {
              ...(acc?.flags ?? {}),
              ...(type === 'FEATURE_FLAG' ? { [name]: process.env[key] === '1' } : {}),
            },
            constants: {
              ...(acc?.constants ?? {}),
              ...(type === 'PUBLIC' ? { [name]: process.env[key] || '' } : {}),
            },
          }
        }, {})
    }

    res.json(config)
  })

  return router
}
