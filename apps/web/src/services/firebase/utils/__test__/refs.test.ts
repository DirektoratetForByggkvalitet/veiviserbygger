import { doc, DocumentReference, getFirestore } from 'firebase/firestore'
import {
  findRefs,
  determineType,
  isUninteresting,
  buildTree,
  TreeNode,
  getContentDeps,
} from '../refs'
import { initializeApp } from 'firebase/app'

beforeEach(() => {
  initializeApp({ projectId: 'ci' })
})

describe('refs util', () => {
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
      const sourceDocRef = doc(firestore, 'wizards', '123', 'versions', '456')
      const referencedNodeRef = doc(firestore, 'nodes', 'node-123')
      expect(findRefs(sourceDocRef, referencedNodeRef)).toEqual([
        { doc: sourceDocRef, ref: referencedNodeRef, path: [], type: 'unknown' },
      ])
    })

    it('should find DocumentReference instances in a flat object', () => {
      const firestore = getFirestore()
      const sourceDocRef = doc(firestore, 'wizards', '123', 'versions', '456')
      const referencedNodeRef = doc(firestore, 'nodes', 'node-123')

      expect(findRefs(sourceDocRef, { a: referencedNodeRef })).toEqual([
        { doc: sourceDocRef, ref: referencedNodeRef, path: ['a'], type: 'unknown' },
      ])
    })

    it('should find DocumentReference instances in a nested object', () => {
      const firestore = getFirestore()
      const sourceDocRef = doc(firestore, 'wizards', '123', 'versions', '456')
      const referencedNodeRef = doc(firestore, 'nodes', 'node-123')

      expect(
        findRefs(sourceDocRef, [
          {
            a: {
              b: [
                {
                  c: referencedNodeRef,
                  date: new Date(),
                },
              ],
              meaningOfLife: 42,
            },
          },
        ]),
      ).toEqual([
        {
          doc: sourceDocRef,
          ref: referencedNodeRef,
          path: ['0', 'a', 'b', '0', 'c'],
          type: 'unknown',
        },
      ])
    })
  })

  describe('buildTree', () => {
    /**
     * a -> b -> c
     *        -> d -> e
     * a -> d
     */

    it('builds a doubly linked tree from a list of nodes', () => {
      const firestore = getFirestore()

      type NodeKey = 'a' | 'b' | 'c' | 'd' | 'e'

      const refs: Record<NodeKey, DocumentReference> = {
        a: doc(firestore, 'collection', 'doc-a'),
        b: doc(firestore, 'collection', 'doc-b'),
        c: doc(firestore, 'collection', 'doc-c'),
        d: doc(firestore, 'collection', 'doc-d'),
        e: doc(firestore, 'collection', 'doc-e'),
      }

      const docs = [
        {
          ref: refs.a,
          data: () => ({ show: { field: refs.d }, content: { b: { node: refs.b } } }),
        },
        { ref: refs.b, data: () => ({ content: { c: { node: refs.c }, d: { node: refs.d } } }) },
        { ref: refs.c, data: () => ({}) },
        { ref: refs.d, data: () => ({ content: { e: { node: refs.e } } }) },
        { ref: refs.e, data: () => ({}) },
      ]

      const treeNodes = buildTree(docs)

      // The next part is extremely verbose, but it ensures that the tree is built correctly
      expect(treeNodes).toEqual(
        expect.arrayContaining([
          // node a
          expect.objectContaining({
            doc: expect.toBeReferenceTo(refs.a),
            incoming: [],
            outgoing: [
              expect.objectContaining({
                path: ['show', 'field'],
                ref: expect.toBeReferenceTo(refs.d),
                type: 'in-expression',
              }),
              expect.objectContaining({
                path: ['content', 'b', 'node'],
                ref: expect.toBeReferenceTo(refs.b),
                type: 'content-node',
              }),
            ],
          }),

          // node b
          expect.objectContaining({
            doc: expect.toBeReferenceTo(refs.b),
            incoming: [
              expect.objectContaining({
                path: ['content', 'b', 'node'],
                ref: expect.toBeReferenceTo(refs.a),
                type: 'content-node',
              }),
            ],
            outgoing: [
              expect.objectContaining({
                path: ['content', 'c', 'node'],
                ref: expect.toBeReferenceTo(refs.c),
                type: 'content-node',
              }),

              expect.objectContaining({
                path: ['content', 'd', 'node'],
                ref: expect.toBeReferenceTo(refs.d),
                type: 'content-node',
              }),
            ],
          }),

          /**
           * ‼️ The C node is not included in the tree because it has no outgoing references. It should be,
           * but the current implementation of buildTree does not include nodes that have no outgoing references.
           *
           * We want to include nodes with no outgoing references, as well as nodes that ha no incoming references.
           * This is useful for identifiing orphaned nodes and to be able to clean them up.
           */
          // node c
          expect.objectContaining({
            doc: expect.toBeReferenceTo(refs.c),
            incoming: [
              expect.objectContaining({
                ref: expect.toBeReferenceTo(refs.b),
                type: 'content-node',
              }),
            ],
            outgoing: [],
          }),

          // node d
          expect.objectContaining({
            doc: expect.toBeReferenceTo(refs.d),
            incoming: [
              expect.objectContaining({
                path: ['show', 'field'],
                ref: expect.toBeReferenceTo(refs.a),
                type: 'in-expression',
              }),
              expect.objectContaining({
                path: ['content', 'd', 'node'],
                ref: expect.toBeReferenceTo(refs.b),
                type: 'content-node',
              }),
            ],
            outgoing: [
              expect.objectContaining({
                path: ['content', 'e', 'node'],
                ref: expect.toBeReferenceTo(refs.e),
                type: 'content-node',
              }),
            ],
          }),
        ]),
      )

      expect.objectContaining({
        doc: expect.toBeReferenceTo(refs.e),
        incoming: [
          expect.objectContaining({
            path: ['content', 'e', 'node'],
            ref: expect.toBeReferenceTo(refs.d),
            type: 'content-node',
          }),
        ],
        outgoing: [],
      })
    })
  })

  describe('getContentDeps', () => {
    it('should return an empty array for a document with no outgoing references', () => {
      const firestore = getFirestore()

      const tree: TreeNode[] = [
        { doc: doc(firestore, 'collection', 'a'), incoming: [], outgoing: [] },
      ]

      expect(getContentDeps(doc(firestore, 'collection', 'a'), 'intro', tree)).toEqual([])
    })

    it('should return all direct dependencies', () => {
      const firestore = getFirestore()

      const a = doc(firestore, 'collection', 'a')
      const b = doc(firestore, 'collection', 'b')
      const c = doc(firestore, 'collection', 'c')

      const tree: TreeNode[] = [
        {
          doc: a,
          incoming: [],
          outgoing: [
            { ref: b, path: ['intro', 'content', '123'], type: 'content-node' },
            { ref: c, path: ['intro', 'content', '234'], type: 'content-node' },
          ],
        },
        { doc: b, incoming: [], outgoing: [] },
        { doc: c, incoming: [], outgoing: [] },
      ]

      expect(getContentDeps(doc(firestore, 'collection', 'a'), 'intro', tree)).toEqual([b, c])
    })

    it('should return transitive dependencies', () => {
      const firestore = getFirestore()

      const a = doc(firestore, 'collection', 'a')
      const b = doc(firestore, 'collection', 'b')
      const c = doc(firestore, 'collection', 'c')
      const d = doc(firestore, 'collection', 'd')
      const e = doc(firestore, 'collection', 'e')

      const tree: TreeNode[] = [
        {
          doc: a,
          incoming: [],
          outgoing: [{ ref: b, path: ['pages', '1234', 'content', '123'], type: 'content-node' }],
        },
        {
          doc: b,
          incoming: [],
          outgoing: [{ ref: c, path: ['pages', '1234', 'content', '456'], type: 'content-node' }],
        },
        { doc: c, incoming: [], outgoing: [] },
        { doc: d, incoming: [], outgoing: [{ ref: e, path: [], type: 'content-node' }] },
        { doc: e, incoming: [], outgoing: [] },
      ]

      expect(getContentDeps(doc(firestore, 'collection', 'a'), '1234', tree)).toEqual([b, c])
    })

    it('should return deeeeep transitive dependencies', () => {
      const firestore = getFirestore()

      const a = doc(firestore, 'collection', 'a')
      const b = doc(firestore, 'collection', 'b')
      const c = doc(firestore, 'collection', 'c')
      const d = doc(firestore, 'collection', 'd')
      const e = doc(firestore, 'collection', 'e')
      const f = doc(firestore, 'collection', 'f')

      const tree: TreeNode[] = [
        {
          doc: a,
          incoming: [],
          outgoing: [{ ref: b, path: ['pages', '1234', 'content', 'a'], type: 'content-node' }],
        },
        {
          doc: b,
          incoming: [],
          outgoing: [{ ref: c, path: ['pages', '1234', 'content', 'b'], type: 'content-node' }],
        },
        {
          doc: c,
          incoming: [],
          outgoing: [{ ref: d, path: ['pages', '1234', 'content', 'c'], type: 'content-node' }],
        },
        {
          doc: d,
          incoming: [],
          outgoing: [{ ref: e, path: ['pages', '1234', 'content', 'd'], type: 'content-node' }],
        },
        {
          doc: e,
          incoming: [],
          outgoing: [{ ref: f, path: ['pages', '1234', 'content', 'e'], type: 'content-node' }],
        },
        { doc: f, incoming: [], outgoing: [] },
      ]

      expect(getContentDeps(doc(firestore, 'collection', 'a'), '1234', tree)).toEqual([
        b,
        c,
        d,
        e,
        f,
      ])
    })
  })
})
