import express from 'express'
import setupServer from './server'

const app = express()

;(async () => {
  // const redis = await getRedis()

  // const firebase = setupFirebase(...)

  const server = await setupServer(app, { dependencies: {} })

  server.start()

  process.on('SIGTERM', async () => {
    server.stop()

    try {
      // await redis?.disconnect()
      // !IS_JEST && console.log('Disconnected from redis')
    } catch (err) {
      // ignore
    }

    // if (!IS_JEST) {
    //   try {
    //     await postgres.end()
    //     console.log('Closed down pg connection pool')
    //   } catch (err) {
    //     // ignore
    //   }
    // }
  })
})()
