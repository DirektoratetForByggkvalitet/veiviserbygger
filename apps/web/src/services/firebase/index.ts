import { FirebaseApp, FirebaseOptions, initializeApp } from 'firebase/app'
import { Auth, connectAuthEmulator, getAuth } from 'firebase/auth'
import {
  collection,
  connectFirestoreEmulator,
  deleteDoc,
  deleteField,
  doc,
  DocumentReference,
  Firestore,
  getDoc,
  getDocs,
  getFirestore,
  increment,
  runTransaction,
  updateDoc,
} from 'firebase/firestore'

import { getConfig } from '../api'
import { dataPoint } from './utils/db'
import {
  Answer,
  Branch,
  DeepPartial,
  OptionalExcept,
  OrderedArr,
  Page,
  PageContent,
  PageContentWithOptions,
  Patch,
  Wizard,
  WizardPage,
  WizardVersion,
} from 'types'
import { v4 as uuid } from 'uuid'
import deepExtend from 'deep-extend'
import { maxBy, values } from 'lodash'
import { merge } from '@/lib/merge'

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
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  if (firebaseApp!) {
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

export function getWizardVersionRef({ db, wizardId, versionId }: FuncScope) {
  return doc(dataPoint<WizardVersion>(db, 'wizards', wizardId, 'versions'), versionId)
}

export function getNodesRef({ db, wizardId, versionId }: FuncScope) {
  return dataPoint<OptionalExcept<PageContent, 'type'>>(
    db,
    'wizards',
    wizardId,
    'versions',
    versionId,
    'nodes',
  )
}

export function getNodeRef({ db, wizardId, versionId }: FuncScope, nodeId: string) {
  return doc(getNodesRef({ db, wizardId, versionId }), nodeId)
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
      .set(getWizardVersionRef({ db, wizardId: newDocId, versionId: newVersionId }), {})

    return { id: newDocId, versionId: newVersionId }
  })
}

type FuncScope = {
  db: Firestore
  wizardId: string
  versionId: string
}

export async function createPage(
  { db, wizardId, versionId }: FuncScope,
  page: Partial<Omit<WizardPage, 'id'>>,
) {
  await runTransaction(db, async (transaction) => {
    const ref = getWizardVersionRef({ db, wizardId, versionId })
    const current = await transaction.get(ref)

    const maxOrder = maxBy(values(current?.data()?.pages), 'order')?.order ?? -1

    await transaction.update(ref, `pages.${uuid()}`, { order: maxOrder + 1, content: {}, ...page })
  })
}

export async function patchPage(
  { db, wizardId, versionId }: FuncScope,
  pageId: string,
  patch: DeepPartial<WizardPage>,
) {
  await runTransaction(db, async (transaction) => {
    const ref = getWizardVersionRef({ db, wizardId, versionId })
    const current = await transaction.get(ref)

    const patchedPage = current?.data()?.pages?.[pageId]

    if (patchedPage === undefined) {
      throw new Error(`Page with id ${pageId} not found`)
    }

    await transaction.update(ref, `pages.${pageId}`, deepExtend(patchedPage, patch))
  })
}

export async function deletePage({ db, wizardId, versionId }: FuncScope, pageId: string) {
  await runTransaction(db, async (transaction) => {
    const ref = getWizardVersionRef({ db, wizardId, versionId })
    const current = await transaction.get(ref)
    const pageToDelete = current?.data()?.pages?.[pageId]

    if (!pageToDelete) {
      throw new Error(`Page with id ${pageId} not found`)
    }

    await transaction.update(ref, `pages.${pageId}`, deleteField())
  })
}

export async function addNodes(
  { db, wizardId, versionId }: FuncScope,
  pageId: string | undefined,
  /**
   * If provided, the new nodes will be inserted after the node with this id.
   * Otherwise they will be appended to the end of the page.
   */
  afterNodeId: string | undefined,
  nodes: OptionalExcept<PageContent, 'type'>[],
) {
  console.log('adding nodes', nodes, 'to page', pageId, 'after node', afterNodeId)

  const nodeRefs = nodes.map(() => getNodeRef({ db, wizardId, versionId }, uuid()))

  await runTransaction(db, async (transaction) => {
    const versionRef = getWizardVersionRef({ db, wizardId, versionId })
    const current = await transaction.get(versionRef)

    // figure out what the highest order value is
    const maxOrder = !pageId
      ? -1
      : (maxBy(values(current?.data()?.pages?.[pageId]?.content ?? {}), 'order')?.order ?? -1)

    // if we're adding after a node, get the order of that node
    const afterNodeOrder =
      pageId && afterNodeId
        ? (values(current?.data()?.pages?.[pageId]?.content).find((n) => n.node.id === afterNodeId)
            ?.order ?? undefined)
        : undefined

    // what should be the order value of the first new node
    const newNodeInitOrder = afterNodeOrder === undefined ? maxOrder + 1 : afterNodeOrder + 1

    console.log('new node init order', newNodeInitOrder)

    // create nodes
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i]
      const nodeRef = nodeRefs[i]

      // create the node
      await transaction.set(nodeRef, node)

      // if we're not adding it to the page, skip the rest
      if (!pageId) {
        continue
      }

      if (!current.data()?.pages?.[pageId].content) {
        console.log('Create missing content map')
        await transaction.update(versionRef, { [`pages.${pageId}.content`]: {} })
      }

      // create references to nodes
      await transaction.update(versionRef, {
        [`pages.${pageId}.content.${uuid()}`]: {
          node: nodeRef,
          order: newNodeInitOrder + i,
        },
      })

      console.log('added node to page with order ', newNodeInitOrder + i)
    }

    // if we're adding after a node, push orders of nodes after the new nodes
    if (pageId && afterNodeId) {
      console.log('pushing orders of nodes after the new nodes')

      for (const [key, value] of Object.entries(current.data()?.pages?.[pageId]?.content ?? {})) {
        console.log(value.order, typeof value.order)

        if (value.order >= newNodeInitOrder) {
          await transaction.update(
            versionRef,
            `pages.${pageId}.content.${key}.order`,
            increment(nodes.length),
          )

          console.log('pushed order of node', key, 'to', value.order + nodes.length)
        }
      }
    }
  })

  return nodeRefs as DocumentReference[]
}

export async function patchNode(
  { db, wizardId, versionId }: FuncScope,
  nodeId: string,
  patch: Patch<PageContent>,
) {
  await runTransaction(db, async (transaction) => {
    const ref = getNodeRef({ db, wizardId, versionId }, nodeId)

    const current = await transaction.get(ref)

    const patchedNode = current?.data()

    if (!patchedNode) {
      throw new Error(`Node with id ${nodeId} not found`)
    }

    await transaction.update(ref, merge(patchedNode as any, patch))
  })
}

export async function removeExpressionClause(
  { db, wizardId, versionId }: FuncScope,
  nodeId: string,
  clauseId: string,
) {
  await runTransaction(db, async (transaction) => {
    const ref = getNodeRef({ db, wizardId, versionId }, nodeId)
    const current = await transaction.get(ref)

    const node = current?.data() as Branch

    if (!node?.test?.type || !node.test.clauses[clauseId]) {
      throw new Error(`Clause with id ${clauseId} not found in node with id ${nodeId}`)
    }

    console.log('removeExpressionClause')
    await transaction.update(ref, `test.clauses.${clauseId}`, deleteField())
  })
}

export async function reorderNodes(
  { db, wizardId, versionId }: FuncScope,
  pageId: string,
  nodes: OrderedArr<Page['content'][0]>,
) {
  await runTransaction(db, async (transaction) => {
    const ref = getWizardVersionRef({ db, wizardId, versionId })
    const current = await transaction.get(ref)

    const page = current?.data()?.pages?.[pageId]

    if (!page) {
      throw new Error(`Page with id ${pageId} not found`)
    }

    await transaction.update(
      ref,
      nodes.reduce((res, node, i) => {
        return {
          ...res,
          [`pages.${pageId}.content.${node.id}.order`]: i,
        }
      }, {}),
    )
  })
}

export async function deleteNode({ db, wizardId, versionId }: FuncScope, nodeId: string) {
  await runTransaction(db, async (transaction) => {
    const nodeRef = getNodeRef({ db, wizardId, versionId }, nodeId)
    const versionRef = getWizardVersionRef({ db, wizardId, versionId })

    const [node, version] = await Promise.all([
      transaction.get(nodeRef),
      transaction.get(versionRef),
    ])

    const pageIds = Object.keys(version.data()?.pages || {})
    const nodeToDelete = node?.data()

    if (!nodeToDelete) {
      return
    }

    await transaction.delete(nodeRef)

    await transaction.update(
      versionRef,
      pageIds.reduce((res, pageId) => {
        const content = version.data()?.pages?.[pageId].content || {}
        const pageNodeKeys = Object.keys(content)

        return {
          ...res,
          ...pageNodeKeys.reduce((res, key) => {
            if (content[key].node.id !== nodeId) {
              return res
            }

            return {
              ...res,
              [`pages.${pageId}.content.${key}`]: deleteField(),
            }
          }, {}),
        }
      }, {}),
    )
  })
}

export async function addAnswer(
  { db, wizardId, versionId }: FuncScope,
  nodeId: string,
  answer: Partial<Omit<Answer, 'id'>>,
) {
  await runTransaction(db, async (transaction) => {
    const ref = getNodeRef({ db, wizardId, versionId }, nodeId)
    const current = await transaction.get(ref)

    const currentOptions = current.data() as PageContentWithOptions

    const maxOrder = maxBy(values(currentOptions.options), 'order')?.order ?? -1

    await transaction.update(ref, `options.${uuid()}`, { order: maxOrder + 1, ...answer })
  })
}

export function patchAnswer(
  { db, wizardId, versionId }: FuncScope,
  nodeId: string,
  answerId: string,
  patch: Partial<Answer>,
) {
  return runTransaction(db, async (transaction) => {
    const ref = getNodeRef({ db, wizardId, versionId }, nodeId)
    const current = await transaction.get(ref)

    const node = current?.data() as PageContentWithOptions

    if (!node || !node.options || !node.options[answerId]) {
      throw new Error(`Answer with id ${answerId} not found in node with id ${nodeId}`)
    }

    await transaction.update(ref, `options.${answerId}`, deepExtend(node.options[answerId], patch))
  })
}

export function deleteAnswer(
  { db, wizardId, versionId }: FuncScope,
  nodeId: string,
  answerId: string,
) {
  return runTransaction(db, async (transaction) => {
    const ref = getNodeRef({ db, wizardId, versionId }, nodeId)
    const current = await transaction.get(ref)

    const node = current?.data()

    if (!node) {
      return
    }

    console.log('deleteAnswer')
    await transaction.update(ref, `options.${answerId}`, deleteField())
  })
}

export async function reorderAnswers(
  { db, wizardId, versionId }: FuncScope,
  nodeId: string,
  answers: OrderedArr<Answer>,
) {
  await runTransaction(db, async (transaction) => {
    const ref = getNodeRef({ db, wizardId, versionId }, nodeId)

    await transaction.update(
      ref,
      answers.reduce((res, option, i) => {
        return {
          ...res,
          [`options.${option.id}.order`]: i,
        }
      }, {}),
    )
  })
}

export async function patchWizard({ db, wizardId }: FuncScope, patch: Patch<Wizard>) {
  updateDoc(getWizardRef(db, wizardId), patch)
}

export async function deleteVersion({ db, wizardId, versionId }: FuncScope) {
  const nodes = await getDocs(collection(db, 'wizards', wizardId, 'versions', versionId, 'nodes'))

  await Promise.all(nodes.docs.map((doc) => deleteDoc(doc.ref)))

  console.log('Deleted all nodes in wizards', wizardId, 'versions', versionId, 'nodes')

  await deleteDoc(getWizardVersionRef({ db, wizardId, versionId }))

  console.log('Deleted version', versionId, 'in wizard', wizardId)
}

export async function deleteWizard({ db, wizardId }: FuncScope) {
  const versions = await getDocs(collection(db, 'wizards', wizardId, 'versions'))

  await Promise.all(versions.docs.map((doc) => deleteVersion({ db, wizardId, versionId: doc.id })))

  console.log('Deleted all versions in wizard', wizardId)

  await deleteDoc(getWizardRef(db, wizardId))

  console.log('Deleted wizard', wizardId)
}
