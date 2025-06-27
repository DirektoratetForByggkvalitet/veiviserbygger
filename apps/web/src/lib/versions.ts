import { Timestamp } from 'firebase/firestore'

export function sortVersions<T extends { publishedFrom?: Timestamp; publishedTo?: Timestamp }>(
  versions: T[],
) {
  return [...versions].sort((a, b) => {
    const getStatusRank = (item: T): number => {
      if (!item.publishedFrom && !item.publishedTo) return 0 // Draft
      if (item.publishedFrom && !item.publishedTo) return 1 // Currently published
      return 2 // Previously published
    }

    const rankA = getStatusRank(a)
    const rankB = getStatusRank(b)

    if (rankA !== rankB) {
      return rankA - rankB
    }

    // if both versions has been published, sort by publishedTo date
    if (a.publishedTo && b.publishedTo) {
      const aTo = a.publishedTo.toMillis()
      const bTo = b.publishedTo.toMillis()
      return bTo - aTo // Descending order
    }

    return 0
  })
}

export function getVersionTitle<
  T extends { title?: string; publishedFrom?: Timestamp; publishedTo?: Timestamp },
>(v: T, index: number): string {
  return `Versjon ${index}`
}

export function getVersionDate<
  T extends { title?: string; publishedFrom?: Timestamp; publishedTo?: Timestamp },
>(v: T): string {
  return `${v.publishedFrom ? formatPublishedDate(v.publishedFrom, 'long') : ''}${v.publishedTo ? ` - ${formatPublishedDate(v.publishedTo, 'long')}` : ''}`
}

export function getVersionState<
  T extends { title?: string; publishedFrom?: Timestamp; publishedTo?: Timestamp },
>(v: T): string {
  return `${v.publishedFrom ? (!v.publishedTo ? 'Publisert nå' : 'Tidligere publisert') : 'Siste utkast'}`
}

export function formatPublishedDate(date: Timestamp, type: 'short' | 'long'): string {
  if (!date) return ''
  if (type === 'short') {
    return date.toDate().toLocaleDateString('nb-NO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  }
  return date.toDate().toLocaleDateString('nb-NO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
