import * as path from 'path'
import {Pattern} from '../src/internal-pattern'

// todo: replace leading .
// todo: replace leading ~

describe('pattern', () => {
  it('counts leading negate markers', () => {
    const actual = [
      '/initial-includes/*.txt',
      '!!/hello/two-negate-markers.txt',
      '!!!!/hello/four-negate-markers.txt',
      '!/initial-includes/one-negate-markers.txt',
      '!!!/initial-includes/three-negate-markers.txt'
    ].map(x => new Pattern(x).negate)
    expect(actual).toEqual([false, false, false, true, true])
  })

  it('roots exclude pattern', () => {
    const patternStrings = ['!hello.txt', '!**/world.txt']
    const actual = patternStrings.map(x => new Pattern(x))
    const expected = patternStrings
      .map(x => x.substr(1))
      .map(x => path.join(Pattern.globEscape(process.cwd()), x))
      .map(x => `!${x}`)
      .map(x => new Pattern(x))
    expect(actual.map(x => x.negate)).toEqual([true, true])
    expect(actual.map(x => x.segments)).toEqual(expected.map(x => x.segments))
  })

  it('roots include pattern', () => {
    const patternStrings = ['hello.txt', '**/world.txt']
    const actual = patternStrings.map(x => new Pattern(x))
    const expected = patternStrings.map(
      x => new Pattern(path.join(Pattern.globEscape(process.cwd()), x))
    )
    expect(actual.map(x => x.segments)).toEqual(expected.map(x => x.segments))
  })

  it('trims pattern', () => {
    const pattern = new Pattern(' hello.txt ')
    expect(pattern.segments.reverse()[0]).toBe('hello.txt')
  })

  it('trims whitespace after trimming negate markers', () => {
    const pattern = new Pattern(' ! ! ! hello.txt ')
    expect(pattern.negate).toBeTruthy()
    expect(pattern.segments.reverse()[0]).toBe('hello.txt')
  })
})
