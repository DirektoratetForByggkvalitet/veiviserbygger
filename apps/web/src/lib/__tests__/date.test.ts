import { Timestamp } from 'firebase/firestore'
import { formatTimestamp } from '../date'

describe('date lib', () => {
  describe('formatTimestamp', () => {
    it('should format correctly in long format', () => {
      expect(formatTimestamp(new Timestamp(1751021815, 0), 'long')).toEqual('27. juni 2025')
    })

    it('should format correctly in short format', () => {
      expect(formatTimestamp(new Timestamp(1751021815, 0), 'short')).toEqual('27.06.2025')
    })
  })
})
