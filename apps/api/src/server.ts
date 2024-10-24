import {
  type ErrorRequestHandler,
  type Handler,
  type RequestHandler,
  type Application,
  json,
} from 'express'
import cors from 'cors'
import { IS_JEST } from './constants'
import { Server } from 'http'
import * as bodyParser from 'body-parser'
import { configRouter } from './routes/config'

let server: Server | undefined

export default function setupServer(
  app: Application,
  config: {
    dependencies: DependencyContainer
    beforeRequestHandlers?: Array<ErrorRequestHandler | Handler>
    beforeRoutes?: Array<ErrorRequestHandler | RequestHandler>
    afterRoutes?: Array<ErrorRequestHandler | RequestHandler>
    onStop?: () => void
  },
) {
  for (const handler of config?.beforeRequestHandlers || []) {
    app.use(handler)
  }

  app.use(cors({ origin: '*' }))
  app.use(bodyParser.json({ limit: '200mb' }))
  app.use(json())

  for (const handler of config?.beforeRoutes || []) {
    app.use(handler)
  }

  const { PORT = 4000 } = process.env

  app.get('/', (_, res) => {
    res.send('👀')
  })

  app.use('/config', configRouter(config.dependencies))

  for (const handler of config?.afterRoutes || []) {
    app.use(handler)
  }

  return {
    start: async (port?: number) => {
      const listenPort = port || Number(PORT)

      return new Promise((resolve) => {
        server = app.listen(listenPort, async () => {
          !IS_JEST && console.log(`Server started at http://localhost:${listenPort} 🚀`)
          resolve(server)
        })
      })
    },
    stop: async () => {
      await server?.close()
      !IS_JEST && console.log('Closed http server')

      config?.onStop?.()
      server = undefined
    },
  }
}
