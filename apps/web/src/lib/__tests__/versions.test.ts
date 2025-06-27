import { Timestamp } from 'firebase/firestore'
import { sortVersions } from '../versions'

describe('versions', () => {
  describe('sortVersions', () => {
    const published = { publishedFrom: new Timestamp(130000, 0), publishedTo: undefined }
    const unpublished = { publishedFrom: undefined, publishedTo: undefined }

    const prevPub1 = {
      publishedFrom: new Timestamp(125000, 0),
      publishedTo: new Timestamp(126000, 0),
    }
    const prevPub2 = {
      publishedFrom: new Timestamp(126000, 0),
      publishedTo: new Timestamp(127000, 0),
    }
    const prevPub3 = {
      publishedFrom: new Timestamp(127000, 0),
      publishedTo: new Timestamp(128000, 0),
    }
    const prevPub4 = {
      publishedFrom: new Timestamp(128000, 0),
      publishedTo: new Timestamp(129000, 0),
    }

    const prevPublished = [prevPub3, prevPub1, prevPub4, prevPub2]

    it('identical versions should be left unchanged', () => {
      expect(sortVersions([published, published])).toEqual([published, published])
    })

    it('should sort by publishedTo if both versions has been published', () => {
      expect(sortVersions([prevPub1, prevPub2])).toEqual([prevPub2, prevPub1])
    })

    it('should sort unpublished draft at the top', () => {
      expect(sortVersions([published, unpublished])).toEqual([unpublished, published])
    })

    it('should sort published version before previously published versions', () => {
      expect(sortVersions([...prevPublished, published])).toHaveProperty('0', published)
    })

    it('should sort previously published versions by published date', () => {
      expect(sortVersions(prevPublished)).toEqual([prevPub4, prevPub3, prevPub2, prevPub1])
    })
  })
})
