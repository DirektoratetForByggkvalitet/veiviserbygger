import { sortBy, transform, values } from 'lodash'
import { OrderedMap } from 'types'

export function getOrdered<T extends Object>(value?: OrderedMap<T>): T[] {
  return sortBy(
    Object.keys(value || {}).map<T>((key) => ({ ...(value?.[key] || {}), id: key }) as any) as T[],
    'order',
  )
}

export function getWithId<T>(
  value: { [key: string]: T } | undefined,
  id: string | undefined | null,
) {
  if (!id || !value?.[id]) {
    return undefined
  }

  return { ...value[id], id }
}
