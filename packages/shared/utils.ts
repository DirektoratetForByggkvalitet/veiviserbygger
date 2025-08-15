import { OrderedArr, OrderedMap, WithOrder } from 'types'

export function getOrdered<T extends Record<string, any>>(map?: OrderedMap<T>): OrderedArr<T> {
  if (!map) {
    return []
  }

  return Object.keys(map || {})
    .map((id) => ({
      ...(map[id] as WithOrder<T[keyof T]>), // Preserve full structure
      id: id as keyof T,
    }))
    .sort((a, b) => a.order - b.order)
}

export function getKeyed<T extends Record<string, any>>(arr: OrderedArr<T>): OrderedMap<T> {
  return (arr || []).reduce((acc, { id, ...rest }) => {
    return {
      ...acc,
      [id]: rest as WithOrder<T[keyof T]>,
    }
  }, {} as OrderedMap<T>)
}

export function getWithIds<T>(docs?: { [id: string]: T }) {
  if (!docs) {
    return []
  }

  return Object.keys(docs).map((id) => ({ ...docs[id], id }))
}

export function trimText(text?: string) {
  if (!text) {
    return text
  }

  if (text.match(/^<p>.*<\/p>$/) && Array.from(text.matchAll(/<\/p>/g)).length === 1) {
    return text.replace(/^<p>(.*)<\/p>$/, '$1')
  }

  return text
}

/**
 * Extracts Firebase storage references from HTML content and returns them as an array
 */
export function getStorageRefs(html: string = ''): string[] {
  return Array.from(html.matchAll(/data-firebase-storage="([^"]+)"/g)).map((match) => match[1])
}
