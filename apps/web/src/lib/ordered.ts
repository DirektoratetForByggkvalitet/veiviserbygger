import { sortBy, transform, values } from 'lodash'
import { OrderedMap } from 'types'

export function getOrdered<T extends Object>(value?: OrderedMap<T>): T[] {
  return sortBy(
    Object.keys(value || {}).map<T>((key) => ({ ...(value?.[key] || {}), id: key }) as any) as T[],
    'order',
  )
}

export function getWithIds<T>(docs?: { [id: string]: T }) {
  if (!docs) {
    return []
  }

  return Object.keys(docs).map((id) => ({ ...docs[id], id }))
}
