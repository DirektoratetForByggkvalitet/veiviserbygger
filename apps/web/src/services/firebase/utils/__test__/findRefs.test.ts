import { initializeApp } from 'firebase/app'
import { doc, getFirestore } from 'firebase/firestore'
import findRefs, { determineType, isUninteresting } from '../findRefs'

beforeEach(() => {
  initializeApp({ projectId: 'ci' })
})

describe('findRefs', () => {
  describe('isUninteresting', () => {
    it('should find no interest in Date instances', () => {
      expect(isUninteresting(new Date())).toBeTruthy()
    })

    it('should find no interest in RegExp instances', () => {
      expect(isUninteresting(new RegExp('.*'))).toBeTruthy()
    })

    it('should find no interest in RegExp instances', () => {
      expect(
        isUninteresting(function ABC() {
          return 'CBA'
        }),
      ).toBeTruthy()
    })

    it('should not consider other values uninteresting', () => {
      const firestore = getFirestore()
      const ref = doc(firestore, 'collection', 'doc')

      expect(isUninteresting(ref)).toBeFalsy()
      expect(isUninteresting(1)).toBeFalsy()
      expect(isUninteresting('string')).toBeFalsy()
      expect(isUninteresting({ a: 1 })).toBeFalsy()
      expect(isUninteresting([1, 2, 3])).toBeFalsy()
      expect(isUninteresting(null)).toBeFalsy()
      expect(isUninteresting(undefined)).toBeFalsy()
    })
  })

  describe('determineType', () => {
    it('returns content-node if the last path segment is "node" and one of the parents are "content"', () => {
      expect(determineType(['a', 'content', 'b', 'node'])).toBe('content-node')
    })

    it('returns in-expression if the last path segment is "field"', () => {
      expect(determineType(['a', 'b', 'field'])).toBe('in-expression')
    })

    it('returns unknown for other paths', () => {
      expect(determineType(['a', 'b', 'c'])).toBe('unknown')
      expect(determineType()).toBe('unknown')
    })
  })

  describe('findRefs', () => {
    it('should return the ref itself if it is a DocumentReference', () => {
      const firestore = getFirestore()
      const ref = doc(firestore, 'collection', 'doc') // Mock DocumentReference
      expect(findRefs(ref)).toEqual([{ ref, path: [], type: 'unknown' }])
    })

    it('should find DocumentReference instances in a flat object', () => {
      const firestore = getFirestore()
      const ref = doc(firestore, 'collection', 'doc') // Mock DocumentReference

      expect(findRefs({ a: ref })).toEqual([{ ref, path: ['a'], type: 'unknown' }])
    })

    it('should find DocumentReference instances in a nested object', () => {
      const firestore = getFirestore()
      const ref = doc(firestore, 'collection', 'doc') // Mock DocumentReference

      expect(
        findRefs([
          {
            a: {
              b: [
                {
                  c: ref,
                  date: new Date(),
                },
              ],
              meaningOfLife: 42,
            },
          },
        ]),
      ).toEqual([
        {
          ref,
          path: ['0', 'a', 'b', '0', 'c'],
          type: 'unknown',
        },
      ])
    })
  })
})
