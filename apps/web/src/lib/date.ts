import { Timestamp } from 'firebase/firestore'

export function formatTimestamp(date: Timestamp, type: 'short' | 'long'): string {
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
