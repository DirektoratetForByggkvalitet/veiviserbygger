import admin from 'firebase-admin'

// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config({
  path: ['.env.local', '.env.development', '.env'],
  debug: process.env.NODE_ENV === 'production',
})

// Assuming you have your service account JSON as base64 in an env variable
let credential: AppOptions['credential']

if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  credential = admin.credential.cert(
    JSON.parse(Buffer.from(process.env.GOOGLE_APPLICATION_CREDENTIALS, 'base64').toString()),
  )
}
admin.initializeApp({
  credential,
  // projectId: process.env.PUBLIC_FIREBASE_PROJECT_ID,
  // databaseURL: process.env.PUBLIC_FIREBASE_EMULATOR_FIRESTORE_HOST
  //   ? `http://${process.env.PUBLIC_FIREBASE_EMULATOR_FIRESTORE_HOST}:${process.env.PUBLIC_FIREBASE_EMULATOR_FIRESTORE_PORT}`
  //   : `https://${process.env.PUBLIC_FIREBASE_PROJECT_ID}.firebaseio.com`,
})

if (process.env.PUBLIC_FIREBASE_EMULATOR_FIRESTORE_HOST) {
  // Firestore Emulator
  process.env.FIRESTORE_EMULATOR_HOST = `${process.env.PUBLIC_FIREBASE_EMULATOR_FIRESTORE_HOST}:${process.env.PUBLIC_FIREBASE_EMULATOR_FIRESTORE_PORT}`

  // Auth Emulator
  process.env.FIREBASE_AUTH_EMULATOR_HOST =
    process.env.PUBLIC_FIREBASE_EMULATOR_AUTH_HOST || 'http://localhost:9099'

  // Cloud Storage Emulator (if needed)
  process.env.FIREBASE_STORAGE_EMULATOR_HOST =
    process.env.PUBLIC_FIREBASE_EMULATOR_STORAGE_HOST || 'http://localhost:9199'
}

import express from 'express'
import setupServer from './server'
import { getFirestore } from 'firebase-admin/firestore'
import { AppOptions } from 'firebase-admin/app'

const app = express()

;(async () => {
  const db = getFirestore()

  const server = await setupServer(app, { dependencies: { db } })

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
