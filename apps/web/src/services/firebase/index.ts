import { FirebaseOptions, initializeApp } from 'firebase/app'
import { Auth, connectAuthEmulator, getAuth } from 'firebase/auth'
import {
  collection,
  CollectionReference,
  connectFirestoreEmulator,
  doc,
  DocumentReference,
  Firestore,
  getDoc,
  getDocs,
  getFirestore,
  onSnapshot,
  query,
  QueryFieldFilterConstraint,
  where,
} from 'firebase/firestore'
import { getConfig } from '../api'
import { converter, dataPoint } from './utils/db'
import { Wizard, WizardVersion } from './types'

/**
 * Set up and return a Firebase app with the given configuration. Should be called once per app,
 * from the FirebaseProvider component.
 */
export function getFirebaseApp(options: Awaited<ReturnType<typeof getConfig>>) {
  const firebaseConfig: FirebaseOptions = {
    ...(options?.constants?.FIREBASE_EMULATOR_AUTH_HOST
      ? { apiKey: 'not-a-real-key' }
      : { apiKey: options?.constants?.FIREBASE_API_KEY ?? '' }),
    appId: options?.constants?.FIREBASE_APP_ID ?? '',
    authDomain: options?.constants?.FIREBASE_AUTH_DOMAIN ?? '',
    projectId: options?.constants?.FIREBASE_PROJECT_ID ?? '',
    storageBucket: options?.constants?.FIREBASE_STORAGE_BUCKET ?? '',
    messagingSenderId: options?.constants?.FIREBASE_MESSAGING_SENDER_ID ?? '',
  }

  // if (!firebaseConfig.apiKey || !firebaseConfig.appId) {
  //   console.warn('Missing Firebase config')
  //   return
  // }

  const app = initializeApp(firebaseConfig)
  let auth: Auth
  let firestore: Firestore

  if (options?.constants?.FIREBASE_EMULATOR_AUTH_HOST) {
    auth = getAuth()
    connectAuthEmulator(auth, options.constants.FIREBASE_EMULATOR_AUTH_HOST)
    console.info('Connected to the Auth emulator')
  } else {
    auth = getAuth(app)
  }

  if (options?.constants?.FIREBASE_EMULATOR_FIRESTORE_HOST) {
    firestore = getFirestore()
    connectFirestoreEmulator(
      firestore,
      options.constants.FIREBASE_EMULATOR_FIRESTORE_HOST,
      Number(options.constants.FIREBASE_EMULATOR_FIRESTORE_PORT || 8080),
    )
    console.info('Connected to the Firestore emulator')
  } else {
    firestore = getFirestore(app)
  }

  return { app, auth, firestore }
}

export async function getDocuments(
  ref: CollectionReference,
  constraint?: QueryFieldFilterConstraint,
) {
  if (constraint) {
    const res = query(ref, constraint)
    return await getDocs(res)
  }

  return await getDocs(ref)
}

export async function getDocument(ref: DocumentReference, id: string) {
  const doc = await getDoc(ref)
  return doc.data()
}

export async function getWizardsRef() {
  return dataPoint<Wizard>('wizards')
}

export function getWizardVersionRef(id: string, version: string) {
  return doc(dataPoint<WizardVersion>('wizards', id, 'versions'), version)
}
