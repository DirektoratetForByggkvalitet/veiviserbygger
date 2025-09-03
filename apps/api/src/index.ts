import admin, { AppOptions } from 'firebase-admin'

// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config({
  path: ['.env.local', '.env.development', '.env'],
  debug: true,
})

const projectId = process.env.PUBLIC_FIREBASE_PROJECT_ID ?? 'veiviserbygger'

// Assuming you have your service account JSON as base64 in an env variable
let credential: AppOptions['credential']

if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  try {
    credential = admin.credential.cert(
      JSON.parse(Buffer.from(process.env.GOOGLE_APPLICATION_CREDENTIALS, 'base64').toString()),
    )
  } catch (error) {
    console.error('Failed to parse GOOGLE_APPLICATION_CREDENTIALS:', error)
  }
} else if (process.env.PUBLIC_FIREBASE_EMULATOR_FIRESTORE_HOST) {
  /**
   * When using the Firestore emulator, the Admin SDK can be initialized without credentials.
   * We set a few env vars that the admin SDK looks for when initializing in an emulator environment.
   */

  // Firestore emulator
  process.env.FIRESTORE_EMULATOR_HOST = `${process.env.PUBLIC_FIREBASE_EMULATOR_FIRESTORE_HOST}:${process.env.PUBLIC_FIREBASE_EMULATOR_FIRESTORE_PORT}`

  // Auth emulator
  process.env.PUBLIC_FIREBASE_EMULATOR_AUTH_HOST || 'localhost:9099'

  // Storage emulator
  process.env.STORAGE_EMULATOR_HOST = process.env.PUBLIC_FIREBASE_EMULATOR_STORAGE_HOST
    ? `http://${process.env.PUBLIC_FIREBASE_EMULATOR_STORAGE_HOST}:${process.env.PUBLIC_FIREBASE_EMULATOR_STORAGE_PORT}`
    : 'http://localhost:9199'
}

// Initialize Admin SDK WITHOUT credentials
admin.initializeApp({
  ...(credential
    ? {
        // set credentials if we have them
        credential,
      }
    : {
        // ...otherwise, we're probably in an emulator environment. We still
        // need to set the projectId, otherwise the Admin SDK will complain.
        projectId,
      }),
  storageBucket: process.env.PUBLIC_FIREBASE_STORAGE_BUCKET ?? 'veiviserbygger.appspot.com',
})

import express from 'express'
import setupServer from './server'
import { getFirestore } from 'firebase-admin/firestore'
import { getStorage } from 'firebase-admin/storage'
import { getCache } from './services/cache'
import { IS_JEST } from './constants'

const app = express()

;(async () => {
  const db = getFirestore()
  const storage = getStorage()
  const redis = await getCache()

  const server = await setupServer(app, { dependencies: { db, storage, redis } })

  server.start()

  process.on('SIGTERM', async () => {
    server.stop()

    try {
      await redis?.destroy()
      !IS_JEST && console.log('Disconnected from redis')
    } catch (err) {
      // ignore
    }
  })
})()
