import { merge, deepExtend } from '../merge'

describe('merge', () => {
  it('should merge two objects', () => {
    const a = { a: 1, b: 2 }
    const b = { b: 3, c: 4 }
    const expected = { a: 1, b: 3, c: 4 }

    expect(merge(a, b)).toEqual(expected)
    expect(deepExtend(a, b)).toEqual(expected)
  })
})
