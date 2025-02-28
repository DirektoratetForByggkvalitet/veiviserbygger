import { sortBy } from 'lodash'
import { OrderedMap } from 'types'

export function getOrdered<T extends object>(value?: OrderedMap<T>): Array<T & { id: string }> {
  return sortBy(
    Object.keys(value || {}).map<T>(
      (key) => ({ ...(value?.[key] || {}), id: key }) as any,
    ) as Array<T & { id: string }>,
    'order',
  )
}

export function getWithIds<T>(docs?: { [id: string]: T }) {
  if (!docs) {
    return []
  }

  return Object.keys(docs).map((id) => ({ ...docs[id], id }))
}
