import { collection, doc, getFirestore } from 'firebase/firestore'
import { rewriteRefs } from '../rewrite'
import { initializeApp } from 'firebase/app'

initializeApp({ projectId: 'test' })

describe('rewrite lib', () => {
  describe('does not touch', () => {
    it('string that does not start with replaceId', () => {
      expect(rewriteRefs(getFirestore(), 'foo', '123', '345')).toEqual('foo')
    })

    it('date', () => {
      const date = new Date()
      expect(rewriteRefs(getFirestore(), date, '123', '345')).toEqual(date)
    })

    it('boolean', () => {
      expect(rewriteRefs(getFirestore(), true, '123', '345')).toEqual(true)
    })

    it('number', () => {
      expect(rewriteRefs(getFirestore(), 123, '123', '345')).toEqual(123)
    })
  })

  describe('traverses', () => {
    it('arrays', () => {
      expect(rewriteRefs(getFirestore(), ['foo', 'bar'], '123', '345')).toEqual(['foo', 'bar'])
    })

    it('objects', () => {
      expect(rewriteRefs(getFirestore(), { foo: 'bar' }, '123', '345')).toEqual({ foo: 'bar' })
    })

    it('sets', () => {
      const versionsRef = collection(getFirestore(), 'wizards/abc123apekatt/versions')
      const copyVersionRef = doc(versionsRef, '123')
      const newVersionRef = doc(versionsRef, '456')

      const set = new Set([1, doc(copyVersionRef, 'nodes/node-1'), 3])
      expect(rewriteRefs(getFirestore(), set, copyVersionRef.path, newVersionRef.path)).toEqual(
        new Set([1, doc(newVersionRef, 'nodes/node-1'), 3]),
      )
    })

    it('sets', () => {
      const versionsRef = collection(getFirestore(), 'wizards/abc123apekatt/versions')
      const copyVersionRef = doc(versionsRef, '123')
      const newVersionRef = doc(versionsRef, '456')

      const map = new Map()
      map.set('foo', 123)
      map.set('bar', doc(copyVersionRef, 'nodes/node-1'))

      expect(
        rewriteRefs(getFirestore(), map, copyVersionRef.path, newVersionRef.path).get('bar'),
      ).toEqual(doc(newVersionRef, 'nodes/node-1'))
    })
  })

  describe('rewrites', () => {
    it('a firestore reference', () => {
      const ref = doc(getFirestore(), 'wizards/abc123apekatt/versions/123/nodes/123')

      expect(rewriteRefs(getFirestore(), ref, 'abc123apekatt', 'other456kattkatt')).toHaveProperty(
        'path',
        'wizards/other456kattkatt/versions/123/nodes/123',
      )
    })

    it('a string that starts with replaceId', () => {
      const sourceRef = 'wizards/abc123apekatt/versions/123'
      const destinationRef = 'wizards/abc123apekatt/versions/456'

      expect(
        rewriteRefs(
          getFirestore(),
          {
            file: `${sourceRef}/node/789/image`,
          },
          sourceRef,
          destinationRef,
        ),
      ).toEqual({
        file: `${destinationRef}/node/789/image`,
      })
    })

    it('a nested firestore reference', () => {
      const versionsRef = collection(getFirestore(), 'wizards/abc123apekatt/versions')
      const copyVersionRef = doc(versionsRef, '123')
      const newVersionRef = doc(versionsRef, '456')

      const rewriteResult = rewriteRefs(
        getFirestore(),
        {
          intro: {
            content: {
              'content-1': {
                node: doc(copyVersionRef, 'nodes/node-1'),
                order: 1,
              },
              'content-2': {
                node: doc(copyVersionRef, 'nodes/node-2'),
                order: 2,
              },
            },
            heading: 'Introsiden',
            id: 'intro-1',
            type: 'Intro',
          },
          pages: {
            'page-1': {
              content: {
                'content-1': {
                  node: doc(copyVersionRef, 'nodes/node-1'),
                  order: 1,
                },
              },
              heading: 'Første side',
              id: 'page-1',
              type: 'Page',
            },
          },
          refs: [
            doc(copyVersionRef, 'nodes/node-1'),
            doc(copyVersionRef, 'nodes/node-3'),
            doc(copyVersionRef, 'nodes/node-5'),
          ],
        },
        copyVersionRef.path,
        newVersionRef.path,
      )

      expect(rewriteResult).toHaveProperty(
        'intro.content.content-1.node',
        doc(newVersionRef, 'nodes/node-1'),
      )

      expect(rewriteResult).toHaveProperty(
        'pages.page-1.content.content-1.node',
        doc(newVersionRef, 'nodes/node-1'),
      )
    })
  })
})
