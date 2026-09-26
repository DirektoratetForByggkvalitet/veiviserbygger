import { isNil } from 'lodash'

export function inboundOutbound(str: string) {
  if (!str) {
    return str
  }
  const list = str.split('\n').filter((str) => !!str.trim())

  return commaList(list)
}

export function commaList(items: Array<string>): string | null {
  if (!items || items.length === 0) {
    return null
  }

  return [items.slice(0, items.length - 1).join(', '), items[items.length - 1]]
    .filter((item) => Boolean(item))
    .join(' og ')
}

export function truncate(string: string, length: number, dots = '...') {
  if (string.length > length) {
    return `${string.substring(0, `${string} `.lastIndexOf(' ', length))}${dots}`
  }

  return string
}

export function containsLongWord(str: string, length = 15): boolean {
  if (!str || !str.length) {
    return false
  }

  return str.split(' ').some((word) => word.length > length)
}

export function shouldBeSmaller(
  str: string,
  { wordLength, textLength } = { wordLength: 14, textLength: 90 },
): boolean {
  if (!str || !str.length) {
    return false
  }

  const hasLongWords = str.split(' ').some((word) => word.length > wordLength)
  const isLongText = str.length > textLength

  return hasLongWords || isLongText
}

export function canBeLarger(
  str: string,
  { wordLength, textLength } = { wordLength: 8, textLength: 40 },
): boolean {
  if (!str || !str.length) {
    return false
  }

  const hasLongWords = str.split(' ').some((word) => word.length > wordLength)
  const isLongText = str.length > textLength

  return !hasLongWords && !isLongText
}

export function formatThousands(n: string | number | null | undefined): string {
  if (isNil(n)) {
    return ''
  }

  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

export function getNumber(value: string | number | null): number {
  const number = `${value}`.match(/\d+/g)?.join('')

  return number ? parseInt(number) : 0
}

export function formatBigNumber(n: number): string | undefined {
  if (n < 1e3) {
    return formatThousands(n)
  } else if (n >= 1e3 && n < 1e6) {
    return +(n / 1e3).toFixed(1) + 'K'
  } else if (n >= 1e6 && n < 1e9) {
    return +(n / 1e6).toFixed(1) + 'M'
  } else if (n >= 1e9 && n < 1e12) {
    return +(n / 1e9).toFixed(1) + 'B'
  } else if (n >= 1e12) {
    return +(n / 1e12).toFixed(1) + 'T'
  }

  return undefined
}

/**
 * Summarize a list of values as a short badge: the first value (truncated) followed by
 * a count of the remaining values, e.g. "Valgfritt +2". Empty values are ignored.
 */
export function getValuesBadge(
  values: Array<string | number | false | null | undefined>,
  maxLength = 20,
): string | undefined {
  const present = values
    .filter((value) => !isNil(value) && value !== false)
    .map((value) => `${value}`.trim())
    .filter(Boolean)

  if (!present.length) {
    return undefined
  }

  const [first] = present
  const text = first.length > maxLength ? `${first.slice(0, maxLength).trimEnd()}…` : first

  return present.length > 1 ? `${text} +${present.length - 1}` : text
}

export function stripHtml(html?: string): string {
  return (html ?? '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}
