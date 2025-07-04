import { FirebaseApp, FirebaseOptions, initializeApp } from 'firebase/app'
import { Auth, connectAuthEmulator, getAuth, OAuthProvider } from 'firebase/auth'
import {
  collection,
  CollectionReference,
  connectFirestoreEmulator,
  deleteDoc,
  deleteField,
  doc,
  DocumentReference,
  DocumentSnapshot,
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
  ComplexExpression,
  DeepPartial,
  OptionalExcept,
  OrderedArr,
  OrderedMap,
  Page,
  PageContent,
  PageContentWithOptions,
  Patch,
  Wizard,
  WizardPage,
  WizardVersion,
} from 'types'
import { v4 as uuid } from 'uuid'
import { get, maxBy, pick, set, values } from 'lodash'
import { merge } from '@/lib/merge'
import { nodesRef, wizardsRef, wizardVersionsRef } from 'shared/firestore'
import { rewriteRefs } from '@/lib/rewrite'
import { buildTree } from './utils/refs'
import { isDeleteAllowed } from './utils/validator'
import { connectStorageEmulator, FirebaseStorage, getStorage, ref } from 'firebase/storage'
import { copyFiles, deleteFiles } from './utils/storage'

type OIDC = {
  name: string
  provider: OAuthProvider
}

let firebaseApp: {
  app: FirebaseApp
  auth: Auth
  firestore: Firestore
  storage: FirebaseStorage
  oidc: OIDC | null
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
    authDomain: options?.constants?.FIREBASE_AUTH_DOMAIN ?? 'veiviserbygger.firebaseapp.com',
    projectId: options?.constants?.FIREBASE_PROJECT_ID ?? 'veiviserbygger',
    storageBucket: options?.constants?.FIREBASE_STORAGE_BUCKET ?? 'veiviserbygger.appspot.com',
    messagingSenderId: options?.constants?.FIREBASE_MESSAGING_SENDER_ID ?? '',
  }

  // if (!firebaseConfig.apiKey || !firebaseConfig.appId) {
  //   console.warn('Missing Firebase config')
  //   return
  // }

  const app = initializeApp(firebaseConfig)

  let auth: Auth
  let firestore: Firestore
  let storage: FirebaseStorage
  let oidc: OIDC | null = null

  if (options?.constants?.FIREBASE_AUTH_OIDC_PROVIDER_ID) {
    oidc = {
      provider: new OAuthProvider(options?.constants?.FIREBASE_AUTH_OIDC_PROVIDER_ID),
      name: options?.constants?.FIREBASE_AUTH_OIDC_PROVIDER_NAME || 'OIDC',
    }
  }

  if (options?.constants?.FIREBASE_EMULATOR_AUTH_HOST) {
    auth = getAuth()
    connectAuthEmulator(auth, options.constants.FIREBASE_EMULATOR_AUTH_HOST)
    console.info('Connected to the Auth emulator')
  } else {
    auth = getAuth(app)
  }

  if (options?.constants?.FIREBASE_EMULATOR_FIRESTORE_HOST) {
    firestore = getFirestore()
    storage = getStorage()

    connectFirestoreEmulator(
      firestore,
      options.constants.FIREBASE_EMULATOR_FIRESTORE_HOST,
      Number(options.constants.FIREBASE_EMULATOR_FIRESTORE_PORT || 8080),
    )

    connectStorageEmulator(
      storage,
      options.constants.FIREBASE_EMULATOR_STORAGE_HOST,
      Number(options.constants.FIREBASE_EMULATOR_STORAGE_PORT || 9199),
    )

    console.info('Connected to the Firestore emulator')
  } else {
    firestore = getFirestore(app)
    storage = getStorage(app)
  }

  return { app, auth, oidc, firestore, storage }
}

export async function getDocument(ref: DocumentReference) {
  const doc = await getDoc(ref)
  return doc.data()
}

export async function getCollection(ref: CollectionReference) {
  const snapshot = await getDocs(ref)
  return snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }))
}

export function getWizardsRef(db: Firestore) {
  return dataPoint(db, wizardsRef())
}

export function getWizardRef(db: Firestore, wizardId: string) {
  return doc(getWizardsRef(db), wizardId)
}

export function getWizardVersionsRef(db: Firestore, wizardId: string) {
  return dataPoint(db, wizardVersionsRef(wizardId))
}

export function getWizardVersionRef({ db, wizardId, versionId }: Omit<FuncScope, 'storage'>) {
  return doc(getWizardVersionsRef(db, wizardId), versionId)
}

export function getNodesRef({ db, wizardId, versionId }: Omit<FuncScope, 'storage'>) {
  return dataPoint(db, nodesRef(wizardId, versionId))
}

export function getNodeRef(funcScope: Omit<FuncScope, 'storage'>, nodeId: string) {
  return doc(getNodesRef(funcScope), nodeId)
}

export async function createWizard(db: Firestore, data: Wizard) {
  return runTransaction(db, async (transaction) => {
    const newDocId = uuid()
    const newVersionId = uuid()

    const newVersionRef = getWizardVersionRef({ db, wizardId: newDocId, versionId: newVersionId })

    await transaction
      .set(getWizardRef(db, newDocId), { ...data, draftVersion: newVersionRef })
      .set(newVersionRef, { intro: { id: 'intro', type: 'Intro', heading: '', content: {} } })

    return { id: newDocId, versionId: newVersionId }
  })
}

type FuncScope = {
  db: Firestore
  storage: FirebaseStorage
  wizardId: string
  versionId: string
}

export async function patch(
  { db }: FuncScope,
  ref: DocumentReference,
  path: string | string[],
  patchData: any,
) {
  await runTransaction(db, async (transaction) => {
    const current = await transaction.get(ref)

    if (!current.exists()) {
      throw new Error(`Document with id ${ref.id} not found`)
    }

    await transaction.update(ref, merge(current.data(), set({}, path, patchData)))
  })
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

    // if we're patching the intro page, just update the intro field
    if (pageId === 'intro') {
      await transaction.update(ref, 'intro', merge(current?.data()?.intro ?? {}, patch))
      return
    }

    // if we're patching a regular page, update the page
    const patchedPage = current?.data()?.pages?.[pageId]

    if (patchedPage === undefined) {
      throw new Error(`Page with id ${pageId} not found`)
    }

    await transaction.update(ref, `pages.${pageId}`, merge(patchedPage, patch))
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
  { db, storage, wizardId, versionId }: FuncScope,
  {
    pageId,
    afterNodeId,
    parentNodeId,
  }: {
    pageId?: string
    /**
     * If provided, the new nodes will be inserted after the node with this id.
     * Otherwise they will be appended to the end of the page.
     */
    afterNodeId?: string
    /**
     * If provided, the new node will be inserted in the content of the node with this id.
     */
    parentNodeId?: string
  },
  nodes: OptionalExcept<PageContent<true>, 'type'>[],
) {
  console.group('[addNodes]')

  console.log(
    'adding nodes',
    nodes,
    `to ${parentNodeId ? `node ${parentNodeId}` : ''}${pageId ? `page ${pageId}` : ''}`,
    'after node',
    afterNodeId,
  )

  const nodeRefs = nodes.map(() => getNodeRef({ db, wizardId, versionId }, uuid()))

  await runTransaction(db, async (transaction) => {
    const versionRef = getWizardVersionRef({ db, wizardId, versionId })
    const current = await transaction.get(versionRef)
    const parentNodeRef = parentNodeId
      ? getNodeRef({ db, wizardId, versionId }, parentNodeId)
      : undefined
    const currentParentNode = parentNodeRef ? await transaction.get(parentNodeRef) : undefined

    const updateDocRef = (parentNodeId ? parentNodeRef : versionRef) as DocumentReference

    if (!updateDocRef) {
      throw new Error('Neither versionRef nor parentNodeRef has been found')
    }

    let contentPath = `pages.${pageId}.content`
    let currentContent: OrderedMap<{ node: DocumentReference }> | undefined

    if (pageId === 'intro') {
      contentPath = 'intro.content'
      currentContent = current.data()?.intro?.content
    } else if (pageId) {
      currentContent = current.data()?.pages?.[pageId]?.content
    } else if (parentNodeId) {
      contentPath = `content`
      currentContent = (currentParentNode?.data() as Branch)?.content
    }

    // figure out what the highest order value is
    const maxOrder = maxBy(values(currentContent), 'order')?.order ?? -1
    // if we're adding after a node, get the order of that node

    const afterNodeOrder = afterNodeId
      ? (values(currentContent).find((n) => n.node.id === afterNodeId)?.order ?? undefined)
      : undefined

    console.log(':::', `add nodes to page ${pageId} after node ${afterNodeId}`, {
      maxOrder,
      afterNodeOrder,
    })

    // what should be the order value of the first new node
    const newNodeInitOrder = afterNodeOrder === undefined ? maxOrder + 1 : afterNodeOrder + 1
    console.log('new node init order', newNodeInitOrder)

    // create nodes
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i]
      const nodeRef = nodeRefs[i]

      // create the node
      await transaction.set(nodeRef, {
        ...node,

        // Branches are special as they can contain other nodes. We need to allow adding them on creation
        // so we allow content to be an array of nodes (instead of an OrderedMap of node references) and
        // create them and create the OrderedMap from the created nodes
        ...(node.type === 'Branch' && Array.isArray(node.content)
          ? {
              content: (
                await addNodes({ db, storage, wizardId, versionId }, {}, node.content)
              ).reduce(
                (res, node, index) => ({
                  ...res,
                  [uuid()]: {
                    order: index + 1,
                    node,
                  },
                }),
                {},
              ),
            }
          : {}),
      })

      // not adding to a page or node, so skip the rest
      if (!pageId && !parentNodeId) {
        continue
      }
      // there's no content map for the page/node, so create it
      if (!currentContent) {
        console.log('Create missing content map')
        await transaction.update(updateDocRef, { [contentPath]: {} })
      }

      // create references to nodes
      await transaction.update(updateDocRef, {
        [`${contentPath}.${uuid()}`]: {
          node: nodeRef,
          order: newNodeInitOrder + i,
        },
      })

      console.log(
        `added node to ${pageId && 'page'}${parentNodeId && 'node'} with order `,
        newNodeInitOrder + i,
      )
    }

    // if we're adding after a node, push orders of nodes after the new nodes
    if (pageId || afterNodeId) {
      console.log('pushing orders of nodes after the new nodes')
      for (const [key, value] of Object.entries(currentContent ?? {})) {
        console.log(value.order, typeof value.order)

        if (value.order >= newNodeInitOrder) {
          await transaction.update(
            updateDocRef,
            `${contentPath}.${key}.order`,
            increment(nodes.length),
          )

          console.log('pushed order of node', key, 'to', value.order + nodes.length)
        }
      }
    }
  })

  console.groupEnd()

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
  { db }: FuncScope,
  docRef: DocumentReference,
  path: string,
  clauseId: string,
) {
  await runTransaction(db, async (transaction) => {
    const current = await transaction.get(docRef)

    const expression = get(current?.data(), path) as ComplexExpression

    if (!expression) {
      throw new Error(`Expression not found at path ${path} in document ${docRef.path}`)
    }

    if (!expression?.clauses?.[clauseId]) {
      throw new Error(`Clause with id ${clauseId} not found in expression at path ${path}`)
    }

    console.log('removeExpressionClause')
    await transaction.update(docRef, `${path}.clauses.${clauseId}`, deleteField())
  })
}

export async function reorderNodes(
  { db, wizardId, versionId }: FuncScope,
  pageId: string,
  nodes: OrderedArr<Page['content'][0]>,
) {
  await runTransaction(db, async (transaction) => {
    const ref = getWizardVersionRef({ db, wizardId, versionId })
    const data = (await transaction.get(ref)).data()

    const path = pageId === 'intro' ? 'intro.content' : `pages.${pageId}.content`
    const currentContent =
      pageId === 'intro' ? data?.intro?.content : data?.pages?.[pageId]?.content

    await transaction.update(
      ref,
      nodes.reduce((res, node, i) => {
        if (!currentContent?.[node.id].node) {
          return res
        }

        return {
          ...res,
          [`${path}.${node.id}.order`]: i,
        }
      }, {}),
    )
  })
}

export async function deleteNode(
  { db, storage, wizardId, versionId }: FuncScope,
  nodeId: string,
  ref: { doc: DocumentReference; path: string[] },
) {
  console.log('**', ref.path)

  const nodeRef = getNodeRef({ db, wizardId, versionId }, nodeId)

  const deleteValidationResult = await validateDelete(
    { db, storage, wizardId, versionId },
    { node: nodeRef, ref },
  )

  if (!deleteValidationResult.allowed) {
    throw new Error(
      `Node with id ${nodeId} cannot be deleted because it is referenced by other nodes: ${JSON.stringify(
        deleteValidationResult.blockedBy,
      )}`,
    )
  }

  await runTransaction(db, async (transaction) => {
    console.debug('Deleting node', nodeRef.path)
    await transaction.delete(nodeRef)

    for (const additionalDeletes of deleteValidationResult.additionalDeletes || []) {
      // delete the additional nodes that are not referenced anywhere
      await transaction.delete(additionalDeletes.doc)

      console.debug(
        'Deleted additional node',
        additionalDeletes.doc.path,
        'because it was not referenced anywhere',
      )
    }

    await transaction.update(ref.doc, {
      [ref.path.slice(0, -1).join('.')]: deleteField(),
    })
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

    await transaction.update(ref, `options.${answerId}`, merge(node.options[answerId], patch))
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
    const current = (await transaction.get(ref)) as unknown as PageContentWithOptions

    await transaction.update(
      ref,
      answers.reduce((res, option, i) => {
        if (!current?.options?.[option.id]) {
          return res
        }

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

export async function deleteVersion({ db, storage, wizardId, versionId }: FuncScope) {
  console.log('Deleting version', versionId, 'in wizard', wizardId)

  const nodes = await getDocs(collection(db, 'wizards', wizardId, 'versions', versionId, 'nodes'))

  await runTransaction(db, async (transaction) => {
    const wizardRef = getWizardRef(db, wizardId)
    const wizard = await transaction.get(wizardRef)

    await Promise.all(nodes.docs.map((doc) => deleteDoc(doc.ref)))

    console.log('Deleted all nodes in wizards', wizardId, 'versions', versionId, 'nodes')

    await deleteDoc(getWizardVersionRef({ db, wizardId, versionId }))

    console.log('Deleted version', versionId, 'in wizard', wizardId)

    if (wizard.data()?.draftVersion?.id === versionId) {
      await transaction.update(wizardRef, { draftVersion: deleteField() })
    }

    console.log('Delete files in storage for version', versionId)
    await deleteFiles(ref(storage, getWizardVersionRef({ db, wizardId, versionId }).path))
  })
}

export async function deleteWizard({ db, storage, wizardId }: FuncScope) {
  const versions = await getDocs(collection(db, 'wizards', wizardId, 'versions'))

  await Promise.all(
    versions.docs.map((doc) => deleteVersion({ db, storage, wizardId, versionId: doc.id })),
  )

  console.log('Deleted all versions in wizard', wizardId)

  await deleteDoc(getWizardRef(db, wizardId))

  console.log('Deleted wizard', wizardId)
}

export async function patchVersion(
  funcScope: FuncScope,
  patch: Patch<Omit<WizardVersion, 'pages' | 'intro'>>,
) {
  await updateDoc(getWizardVersionRef(funcScope), patch)
}

export async function publishVersion({ db, wizardId, versionId }: FuncScope) {
  await runTransaction(db, async (transaction) => {
    const versionRef = getWizardVersionRef({ db, wizardId, versionId })
    const wizardRef = getWizardRef(db, wizardId)

    // get current version data
    const wizard = await transaction.get(wizardRef)

    // if a version is already published, set the date it was published to until
    const oldVersionId = wizard.data()?.publishedVersion?.id
    if (oldVersionId) {
      const oldVersionRef = getWizardVersionRef({ db, wizardId, versionId: oldVersionId })
      await transaction.update(oldVersionRef, 'publishedTo', new Date())
    }

    await transaction.update(wizardRef, {
      publishedVersion: versionRef,
      draftVersion: deleteField(),
    })

    await transaction.update(versionRef, { publishedFrom: new Date() })
  })
}

export async function createDraftVersion(
  { db, storage, wizardId }: Omit<FuncScope, 'versionId'>,
  copyFromVersionId?: string,
) {
  const nodes = copyFromVersionId
    ? await getDocs(getNodesRef({ db, wizardId, versionId: copyFromVersionId }))
    : undefined

  return runTransaction(db, async (transaction) => {
    const wizardRef = getWizardRef(db, wizardId)
    const copyFromVersionRef = copyFromVersionId
      ? getWizardVersionRef({ db, wizardId, versionId: copyFromVersionId })
      : undefined

    const newVersionRef = getWizardVersionRef({ db, wizardId, versionId: uuid() })

    if (copyFromVersionId && copyFromVersionRef) {
      const copyFromVersion = await transaction.get(copyFromVersionRef)
      await transaction.set(
        newVersionRef,
        pick(rewriteRefs(db, copyFromVersion.data(), copyFromVersionRef.path, newVersionRef.path), [
          'content',
          'intro',
          'pages',
        ]),
      )
      console.log('copied version', copyFromVersionRef.path, 'to', newVersionRef.path)

      if (nodes?.docs?.length) {
        for (const node of nodes.docs) {
          const newNodeRef = getNodeRef({ db, wizardId, versionId: newVersionRef.id }, node.id)

          await transaction.set(
            newNodeRef,
            rewriteRefs(db, node.data(), copyFromVersionRef.path, newVersionRef.path),
          )
          console.log('copied node', node.ref.path, 'to', newNodeRef.path)
        }
      }

      console.log(
        'TODO: Copy files in storage from version',
        copyFromVersionRef.path,
        'to',
        newVersionRef.path,
      )

      await copyFiles(ref(storage, copyFromVersionRef.path), ref(storage, newVersionRef.path))
    } else {
      transaction.set(newVersionRef, {})
    }

    transaction.update(wizardRef, { draftVersion: newVersionRef })

    return newVersionRef.id
  })
}

export async function getDependencyTree(funcScope: FuncScope) {
  const nodes = await getDocs(getNodesRef(funcScope))
  const version = await getDoc(getWizardVersionRef(funcScope))

  const docs: DocumentSnapshot[] = [version]
  nodes.forEach((doc) => {
    docs.push(doc)
  })

  return buildTree(docs)
}

export async function validateDelete(
  funcScope: FuncScope,

  args: {
    /**
     * The node that is being checked for deletion
     */
    node: DocumentReference

    /**
     * Reference from which the node is being deleted. When deleting a node that is
     * visible somewhere, this is the reference to the document in which the node is
     * being deleted. In addition to the node document reference, we need the path
     * to the reference inside the document.
     */
    ref?: {
      doc: DocumentReference
      path: string[]
    }
  },
) {
  const treeNodes = await getDependencyTree(funcScope)

  return isDeleteAllowed(treeNodes, args.node, args.ref || undefined)
}
