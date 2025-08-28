import admin from 'firebase-admin'

// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config({
  path: ['.env.local', '.env.development', '.env'],
  debug: true,
})

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
}

admin.initializeApp({
  ...(credential ? { credential } : {}),
  storageBucket: process.env.PUBLIC_FIREBASE_STORAGE_BUCKET ?? 'veiviserbygger.appspot.com',
})

// Set up environment variables for Firebase emulators if they are defined
if (process.env.PUBLIC_FIREBASE_EMULATOR_FIRESTORE_HOST) {
  // Firestore Emulator
  process.env.FIRESTORE_EMULATOR_HOST = `${process.env.PUBLIC_FIREBASE_EMULATOR_FIRESTORE_HOST}:${process.env.PUBLIC_FIREBASE_EMULATOR_FIRESTORE_PORT}`

  // Auth Emulator
  process.env.FIREBASE_AUTH_EMULATOR_HOST =
    process.env.PUBLIC_FIREBASE_EMULATOR_AUTH_HOST || 'http://localhost:9099'

  // Cloud Storage Emulator (if needed)
  process.env.FIREBASE_STORAGE_EMULATOR_HOST = process.env.PUBLIC_FIREBASE_EMULATOR_STORAGE_HOST
    ? `${process.env.PUBLIC_FIREBASE_EMULATOR_STORAGE_HOST}:${process.env.PUBLIC_FIREBASE_EMULATOR_STORAGE_PORT}`
    : 'http://localhost:9199'
}

import express from 'express'
import setupServer from './server'
import { getFirestore } from 'firebase-admin/firestore'
import { AppOptions } from 'firebase-admin/app'
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
