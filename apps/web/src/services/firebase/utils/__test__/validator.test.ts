import { doc, getFirestore } from 'firebase/firestore'
import { TreeNode } from '../refs'
import { findAdditionalDeletes, isDeleteAllowed } from '../validator'
import { initializeApp } from 'firebase/app'

beforeEach(() => {
  initializeApp({ projectId: 'ci' })
})

describe('validator util', () => {
  describe('findAdditionalDeletes', () => {
    it('should return an empty array if the node to delete does not exist in the treeNodes list', () => {
      const firestore = getFirestore()
      const a = doc(firestore, 'collection', 'doc-a')

      expect(findAdditionalDeletes([], a)).toEqual([])
    })

    it('should find additional deletes for a given node', () => {
      const firestore = getFirestore()
      const a = doc(firestore, 'collection', 'doc-a')
      const b = doc(firestore, 'collection', 'doc-b')

      /**
       * a → b
       */
      const treeNodes: TreeNode[] = [
        {
          doc: a,
          incoming: [],
          outgoing: [
            {
              ref: b,
              path: ['content', '1234', 'node'],
              type: 'content-node',
            },
          ],
        },
        {
          doc: b,
          incoming: [
            {
              ref: a,
              path: ['content', '1234', 'node'],
              type: 'content-node',
            },
          ],
          outgoing: [],
        },
      ]

      const additionalDeletes = findAdditionalDeletes(treeNodes, a)

      expect(additionalDeletes).toEqual([
        {
          doc: expect.toBeReferenceTo(b),
          reason: 'unreferenced-after-delete',
        },
      ])
    })

    it('should only return nodes that are referenced only by the node being deleted', () => {
      const firestore = getFirestore()
      const a = doc(firestore, 'collection', 'doc-a')
      const b = doc(firestore, 'collection', 'doc-b')
      const c = doc(firestore, 'collection', 'doc-c')
      const d = doc(firestore, 'collection', 'doc-d')
      const x = doc(firestore, 'collection', 'doc-x')

      /**
       * x → b
       *     ↑
       *     a → c → d
       */
      const treeNodes: TreeNode[] = [
        {
          doc: x,
          incoming: [],
          outgoing: [
            {
              ref: b,
              path: ['content', '1234', 'node'],
              type: 'content-node',
            },
          ],
        },
        {
          doc: a,
          incoming: [],
          outgoing: [
            {
              ref: b,
              path: ['content', '1234', 'node'],
              type: 'content-node',
            },
            {
              ref: c,
              path: ['content', '1234', 'node'],
              type: 'content-node',
            },
          ],
        },
        {
          doc: b,
          incoming: [
            {
              ref: a,
              path: ['content', '1234', 'node'],
              type: 'content-node',
            },
            {
              ref: x,
              path: ['content', '1234', 'node'],
              type: 'content-node',
            },
          ],
          outgoing: [],
        },
        {
          doc: c,
          incoming: [
            {
              ref: a,
              path: ['content', '1234', 'node'],
              type: 'content-node',
            },
          ],
          outgoing: [
            {
              ref: d,
              path: ['content', '1234', 'node'],
              type: 'content-node',
            },
          ],
        },
        {
          doc: d,
          incoming: [
            {
              ref: c,
              path: ['content', '1234', 'node'],
              type: 'content-node',
            },
          ],
          outgoing: [],
        },
      ]

      const additionalDeletes = findAdditionalDeletes(treeNodes, a)

      expect(additionalDeletes).toEqual([
        {
          doc: expect.toBeReferenceTo(c),
          reason: 'unreferenced-after-delete',
        },
        {
          doc: expect.toBeReferenceTo(d),
          reason: 'unreferenced-after-delete',
        },
      ])
    })

    it('should not run into infinite loops', () => {
      const firestore = getFirestore()
      const a = doc(firestore, 'collection', 'doc-a')
      const b = doc(firestore, 'collection', 'doc-b')
      const c = doc(firestore, 'collection', 'doc-c')
      const d = doc(firestore, 'collection', 'doc-d')

      /**
       *
       * ↓←←←←←←←↑
       * a → b → c
       *     ↑
       *     d
       */
      const treeNodes: TreeNode[] = [
        {
          doc: a,
          incoming: [
            {
              ref: c,
              path: ['content', '1234', 'node'],
              type: 'content-node',
            },
          ],
          outgoing: [
            {
              ref: b,
              path: ['content', '1234', 'node'],
              type: 'content-node',
            },
          ],
        },
        {
          doc: b,
          incoming: [
            {
              ref: a,
              path: ['content', '1234', 'node'],
              type: 'content-node',
            },
            {
              ref: d,
              path: ['content', '1234', 'node'],
              type: 'content-node',
            },
          ],
          outgoing: [
            {
              ref: c,
              path: ['content', '1234', 'node'],
              type: 'content-node',
            },
          ],
        },
        {
          doc: c,
          incoming: [
            {
              ref: b,
              path: ['content', '1234', 'node'],
              type: 'content-node',
            },
          ],
          outgoing: [
            {
              ref: a,
              path: ['content', '1234', 'node'],
              type: 'content-node',
            },
          ],
        },
        {
          doc: d,
          incoming: [],
          outgoing: [
            {
              ref: b,
              path: ['content', '1234', 'node'],
              type: 'content-node',
            },
          ],
        },
      ]

      expect(findAdditionalDeletes(treeNodes, a)).toEqual([])
    })
  })

  describe('isDeleteAllowed', () => {
    it('should allow if the node is not referenced anywhere', () => {
      const firestore = getFirestore()
      const a = doc(firestore, 'collection', 'doc-a')

      const treeNodes: TreeNode[] = [
        {
          doc: a,
          incoming: [],
          outgoing: [],
        },
      ]

      expect(isDeleteAllowed(treeNodes, a)).toEqual({
        allowed: true,
        reason: 'unreferenced',
        additionalDeletes: [],
      })
    })

    it('should not allow if the node is referenced in an incoming reference', () => {
      const firestore = getFirestore()
      const a = doc(firestore, 'collection', 'doc-a')
      const b = doc(firestore, 'collection', 'doc-b')

      const treeNodes: TreeNode[] = [
        {
          doc: b,
          incoming: [
            {
              ref: a,
              path: ['content', '1234', 'node'],
              type: 'content-node',
            },
          ],
          outgoing: [],
        },
        {
          doc: a,
          incoming: [],
          outgoing: [
            {
              ref: b,
              path: ['content', '1234', 'node'],
              type: 'content-node',
            },
          ],
        },
      ]

      expect(isDeleteAllowed(treeNodes, b)).toEqual({
        allowed: false,
        reason: 'referenced',
        blockedBy: expect.arrayContaining([
          expect.objectContaining({
            doc: expect.toBeReferenceTo(a),
            path: ['content', '1234', 'node'],
            type: 'content-node',
          }),
        ]),
      })
    })

    it('should allow if the node is referenced in an incoming reference that is being deleted', () => {
      const firestore = getFirestore()
      const a = doc(firestore, 'collection', 'doc-a')
      const b = doc(firestore, 'collection', 'doc-b')

      const treeNodes: TreeNode[] = [
        {
          doc: b,
          incoming: [
            {
              ref: a,
              path: ['content', '1234', 'node'],
              type: 'content-node',
            },
          ],
          outgoing: [],
        },
        {
          doc: a,
          incoming: [],
          outgoing: [
            {
              ref: b,
              path: ['content', '1234', 'node'],
              type: 'content-node',
            },
          ],
        },
      ]

      expect(isDeleteAllowed(treeNodes, b, { doc: a, path: ['content', '1234', 'node'] })).toEqual({
        allowed: true,
        reason: 'unreferenced-after-delete',
        additionalDeletes: [],
      })
    })

    it('should not allow if the node is referenced in an incoming reference that is being deleted, but the path is different', () => {
      const firestore = getFirestore()
      const a = doc(firestore, 'collection', 'doc-a')
      const b = doc(firestore, 'collection', 'doc-b')

      const treeNodes: TreeNode[] = [
        {
          doc: b,
          incoming: [
            {
              ref: a,
              path: ['content', '1234', 'node'],
              type: 'content-node',
            },
          ],
          outgoing: [],
        },
        {
          doc: a,
          incoming: [],
          outgoing: [
            {
              ref: b,
              path: ['content', '1234', 'node'],
              type: 'content-node',
            },
          ],
        },
      ]

      expect(isDeleteAllowed(treeNodes, b, { doc: a, path: ['content', '4321', 'node'] })).toEqual({
        allowed: false,
        reason: 'referenced',
        blockedBy: expect.arrayContaining([
          expect.objectContaining({
            doc: expect.toBeReferenceTo(a),
            path: ['content', '1234', 'node'],
            type: 'content-node',
          }),
        ]),
      })
    })

    it('should provide list of other nodes to delete, which are nodes where this node is the only node referencing it', () => {
      const firestore = getFirestore()
      const a = doc(firestore, 'collection', 'doc-a')
      const b = doc(firestore, 'collection', 'doc-b')
      const c = doc(firestore, 'collection', 'doc-c')

      /**
       * a → b → c
       */
      const treeNodes: TreeNode[] = [
        {
          doc: c,
          incoming: [
            {
              ref: b,
              path: ['content', '1234', 'node'],
              type: 'content-node',
            },
          ],
          outgoing: [],
        },
        {
          doc: b,
          incoming: [
            {
              ref: a,
              path: ['content', '1234', 'node'],
              type: 'content-node',
            },
          ],
          outgoing: [
            {
              ref: c,
              path: ['content', '1234', 'node'],
              type: 'content-node',
            },
          ],
        },
        {
          doc: a,
          incoming: [],
          outgoing: [
            {
              ref: b,
              path: ['content', '1234', 'node'],
              type: 'content-node',
            },
          ],
        },
      ]

      expect(isDeleteAllowed(treeNodes, b, { doc: a, path: ['content', '1234', 'node'] })).toEqual({
        allowed: true,
        reason: 'unreferenced-after-delete',
        additionalDeletes: expect.arrayContaining([
          expect.objectContaining({
            doc: expect.toBeReferenceTo(c),
            reason: 'unreferenced-after-delete',
          }),
        ]),
      })
    })
  })
})
