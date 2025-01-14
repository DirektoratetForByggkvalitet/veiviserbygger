import { Timestamp } from 'firebase/firestore'

export function sortVersions<T extends { publishedFrom?: Timestamp; publishedTo?: Timestamp }>(
  versions: T[],
) {
  return [...versions].sort((a, b) => {
    if (!a.publishedFrom || !b.publishedFrom) {
      return -1
    }

    if (!a.publishedTo) {
      return -1
    }

    return a.publishedFrom.toMillis() - b.publishedFrom.toMillis()
  })
}
