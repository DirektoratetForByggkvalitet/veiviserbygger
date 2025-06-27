import { doc, DocumentReference, Firestore } from 'firebase/firestore'
import { isString, mapValues } from 'lodash'

const builtInTypes = [
  'Date',
  'RegExp',
  'Symbol',
  'BigInt',
  'WeakSet',
  'WeakMap',
  'ArrayBuffer',
  'DataView',
  'Int8Array',
  'Uint8Array',
  'Uint8ClampedArray',
  'Int16Array',
  'Uint16Array',
  'Int32Array',
  'Uint32Array',
  'Float32Array',
  'Float64Array',
  'JSON',
]

export function rewriteRefs(
  db: Firestore,
  node: any,
  replaceId: DocumentReference['path'],
  replaceWithId: DocumentReference['path'],
): any {
  // walk arrays
  if (Array.isArray(node)) {
    return node.map((p) => rewriteRefs(db, p, replaceId, replaceWithId))
  }

  // don't touch built-in types
  if (typeof node === 'object' && builtInTypes.includes(node.constructor.name)) {
    return node
  }

  // walk sets
  if (node instanceof Set) {
    const newSet = new Set()
    node.forEach((p) => {
      newSet.add(rewriteRefs(db, p, replaceId, replaceWithId))
    })
    return newSet
  }

  // walk maps
  if (node instanceof Map) {
    const newMap = new Map()
    node.forEach((p, k) => {
      newMap.set(k, rewriteRefs(db, p, replaceId, replaceWithId))
    })
    return newMap
  }

  // rewrite firestore references
  if (node?.firestore && node?.path) {
    return doc(db, node.path.replace(replaceId, replaceWithId))
  }

  if (isString(node) && node.startsWith(replaceId)) {
    // if the node is a string and starts with the replaceId, replace it with the replaceWithId
    return node.replace(replaceId, replaceWithId)
  }

  // walk object properties
  if (typeof node === 'object') {
    return mapValues(node, (p) => rewriteRefs(db, p, replaceId, replaceWithId))
  }

  return node
}
