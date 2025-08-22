import { initializeApp } from 'firebase/app'
import { merge, unset } from '../merge'
import { deleteField, doc, getFirestore, serverTimestamp } from 'firebase/firestore'

beforeEach(() => {
  initializeApp({ projectId: 'ci' })
})

describe('merge', () => {
  it('throws if any argument is an array', () => {
    expect(() => merge([])).toThrow('arguments to merge must be objects')
  })

  it('should merge objects', () => {
    expect(merge({ a: 1 }, { b: 2 })).toEqual({ a: 1, b: 2 })
  })

  it('shuold merge objects with undefined values', () => {
    expect(merge({ a: 1, b: 0 }, { b: 2 })).toEqual({
      a: 1,
      b: 2,
    })
  })

  it('should merge arrays', () => {
    expect(merge({ a: [1, 2] }, { a: [3] })).toEqual({ a: [1, 2, 3] })
  })

  it('should merge nested objects', () => {
    expect(merge({ a: { b: 1 } }, { a: { b: 2 } })).toEqual({
      a: { b: 2 },
    })
  })

  it('should merge nested arrays', () => {
    expect(merge({ a: { b: [1, 2] } }, { a: { b: [3] } })).toEqual({
      a: { b: [1, 2, 3] },
    })
  })

  it('should allow setting undefined', () => {
    expect(merge({ a: 1 }, { a: undefined })).toEqual({ a: undefined })
  })

  it('should allow setting null', () => {
    expect(merge({ a: 1 }, { a: null })).toEqual({ a: null })
  })

  it('should allow setting unset', () => {
    expect(merge({ a: 1, b: 0 }, { b: 2, a: unset })).toEqual({ b: 2 })
  })

  it('should allow unsetting a nested property', () => {
    expect(
      merge({ type: 'Branch', test: { operator: 'gt' } }, { test: { operator: unset } }),
    ).toEqual({ type: 'Branch', test: {} })
  })

  it('should handle dates correctly', () => {
    const date = new Date()
    expect(merge({ a: date }, { a: date })).toEqual({ a: date })
  })

  it('should handle regex correctly', () => {
    const regex = /test/
    expect(merge({ a: regex }, { a: regex })).toEqual({ a: regex })
  })

  it('should handle functions correctly', () => {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const fn = () => {}
    expect(merge({ a: fn }, { a: fn })).toEqual({ a: fn })
  })

  it('should handle symbols correctly', () => {
    const symbol1 = Symbol('test')
    const symbol2 = Symbol('jippo')
    expect(merge({ a: symbol1 }, { a: symbol2 })).toEqual({ a: symbol2 })
  })

  it('should leave deleteField() as is', () => {
    expect(merge({ a: { b: 1, c: 2 } }, { a: deleteField() })).toEqual({ a: deleteField() })
    expect(merge({ a: { b: 1, c: 2 } }, { a: serverTimestamp() })).toEqual({ a: serverTimestamp() })
  })

  it('should handle nested symbols correctly', () => {
    const symbol1 = Symbol('test')
    const symbol2 = Symbol('jippo')
    expect(merge({ a: { b: symbol1 } }, { a: { b: symbol2 } })).toEqual({ a: { b: symbol2 } })
  })

  it('should ignore __proto__', () => {
    expect(merge({ a: 1 }, { __proto__: { b: 2 } } as any)).toEqual({ a: 1 })
  })

  it('should handle adding new properties in a patch', () => {
    expect(merge({ a: 1 }, { b: 2 })).toEqual({ a: 1, b: 2 })
  })

  it('should not merge DocumentReference objects', () => {
    const db = getFirestore()

    const refA = doc(db, 'collection', 'docA')
    const refB = doc(db, 'collection', 'docB')

    expect(merge({ myRef: refA }, { myRef: refB })).toEqual({ myRef: refB })
  })
})
