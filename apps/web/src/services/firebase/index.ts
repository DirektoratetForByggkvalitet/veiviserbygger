import { FirebaseApp, FirebaseOptions, initializeApp } from 'firebase/app'
import { Auth, connectAuthEmulator, getAuth } from 'firebase/auth'
import {
  arrayRemove,
  arrayUnion,
  connectFirestoreEmulator,
  doc,
  DocumentReference,
  Firestore,
  getDoc,
  getFirestore,
  runTransaction,
  updateDoc,
} from 'firebase/firestore'
import { getConfig } from '../api'
import { dataPoint } from './utils/db'
import { DeepPartial, Wizard, WizardPage, WizardVersion } from 'types'
import { defaultsDeep, uniqueId } from 'lodash'
import { v4 as uuid } from 'uuid'
import deepExtend from 'deep-extend'

let firebaseApp: {
  app: FirebaseApp
  auth: Auth
  firestore: Firestore
}

/**
 * Set up and return a Firebase app with the given configuration. Should be called once per app,
 * from the FirebaseProvider component.
 */
export function getFirebaseApp(
  options?: Awaited<ReturnType<typeof getConfig>>,
): typeof firebaseApp {
  if (firebaseApp) {
    return firebaseApp
  }

  const firebaseConfig: FirebaseOptions = {
    ...(options?.constants?.FIREBASE_EMULATOR_AUTH_HOST
      ? { apiKey: 'not-a-real-key' }
      : { apiKey: options?.constants?.FIREBASE_API_KEY ?? '' }),
    appId: options?.constants?.FIREBASE_APP_ID ?? '',
    authDomain: options?.constants?.FIREBASE_AUTH_DOMAIN ?? '',
    projectId: options?.constants?.FIREBASE_PROJECT_ID ?? 'veiviserbygger',
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

// export async function getDocuments(
//   ref: CollectionReference,
//   constraint?: QueryFieldFilterConstraint,
// ) {
//   if (constraint) {
//     const res = query(ref, constraint)
//     return await getDocs(res)
//   }

//   return await getDocs(ref)
// }

export async function getDocument(ref: DocumentReference) {
  const doc = await getDoc(ref)
  return doc.data()
}

export function getWizardsRef(db: Firestore) {
  return dataPoint<Wizard>(db, 'wizards')
}

export function getWizardRef(db: Firestore, id: string) {
  return doc(getWizardsRef(db), id)
}

export function getWizardVersionsRef(db: Firestore, id: string) {
  return dataPoint<WizardVersion>(db, 'wizards', id, 'versions')
}

export function getWizardVersionRef(db: Firestore, id: string, version: string) {
  return doc(dataPoint<WizardVersion>(db, 'wizards', id, 'versions'), version)
}

export async function createWizard(db: Firestore, data: Wizard) {
  return runTransaction(db, async (transaction) => {
    const newDocId = uuid()
    const newVersionId = uuid()

    await transaction
      .set(getWizardRef(db, newDocId), {
        ...data,
        draftVersionId: newVersionId,
      })
      .set(getWizardVersionRef(db, newDocId, newVersionId), {})

    return { id: newDocId, versionId: newVersionId }
  })
}

export async function createPage(
  db: Firestore,
  wizardId: string,
  versionId: string,
  page: Partial<WizardPage>,
) {
  await runTransaction(db, async (transaction) => {
    const ref = getWizardVersionRef(db, wizardId, versionId)

    await transaction.update(
      ref,
      `pages`,
      arrayUnion({
        ...page,
        id: uniqueId(),
      }),
    )
  })
}

export async function patchPage(
  db: Firestore,
  wizardId: string,
  versionId: string,
  pageId: string,
  patch: DeepPartial<WizardPage>,
) {
  await runTransaction(db, async (transaction) => {
    const ref = getWizardVersionRef(db, wizardId, versionId)
    const current = await transaction.get(ref)

    const currentPages = current?.data()?.pages || []
    const patchedPageIndex = current?.data()?.pages?.findIndex((p) => p.id === pageId)

    if (patchedPageIndex === undefined) {
      throw new Error(`Page with id ${pageId} not found`)
    }

    await transaction.update(ref, {
      pages: [
        ...currentPages.slice(0, patchedPageIndex),
        deepExtend(currentPages[patchedPageIndex], patch),
        ...currentPages.slice(patchedPageIndex + 1),
      ],
    })
  })
}

export async function addPage(
  db: Firestore,
  wizardId: string,
  versionId: string,
  page: Partial<WizardPage>,
) {
  await runTransaction(db, async (transaction) => {
    const ref = getWizardVersionRef(db, wizardId, versionId)

    await transaction.update(
      ref,
      `pages`,
      arrayUnion({
        ...page,
        id: uniqueId(),
      }),
    )
  })
}

export async function deletePage(
  db: Firestore,
  wizardId: string,
  versionId: string,
  pageId: string,
) {
  await runTransaction(db, async (transaction) => {
    const ref = getWizardVersionRef(db, wizardId, versionId)
    const current = await transaction.get(ref)
    const pageToDelete = current?.data()?.pages?.find((p) => p.id === pageId)

    if (!pageToDelete) {
      throw new Error(`Page with id ${pageId} not found`)
    }

    await transaction.update(ref, 'pages', arrayRemove(pageToDelete))
  })
}
