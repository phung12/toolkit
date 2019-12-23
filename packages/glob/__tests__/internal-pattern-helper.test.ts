import * as patternHelper from '../src/internal-pattern-helper'

describe('pattern-helper', () => {
  it('match supports interleaved exclude patterns', () => {
    const itemPaths = [
      '/solution1/proj1/proj1.proj',
      '/solution1/proj1/README.txt',
      '/solution1/proj2/proj2.proj',
      '/solution1/proj2/README.txt',
      '/solution1/solution1.sln',
      '/solution2/proj1/proj1.proj',
      '/solution2/proj1/README.txt',
      '/solution2/proj2/proj2.proj',
      '/solution2/proj2/README.txt',
      '/solution2/solution2.sln'
    ]
    const patterns = patternHelper.parse(
      [
        '/**/*.proj', // include all proj files
        '/**/README.txt', // include all README files
        '!/**/solution2/**', // exclude the solution 2 folder entirely
        '/**/*.sln', // include all sln files
        '!/**/proj2/README.txt' // exclude proj2 README files
      ],
      {}
    )
    const matched = itemPaths.filter(x => patternHelper.match(patterns, x))
    expect(matched).toEqual([
      '/solution1/proj1/proj1.proj',
      '/solution1/proj1/README.txt',
      '/solution1/proj2/proj2.proj',
      '/solution1/solution1.sln',
      '/solution2/solution2.sln'
    ])
  })

  it('parse skips comments', () => {
    const patterns = patternHelper.parse(
      ['# comment 1', ' # comment 2', '!#hello-world.txt'],
      {}
    )
    expect(patterns).toHaveLength(1)
    expect(patterns[0].negate).toBeTruthy()
    expect(patterns[0].segments.reverse()[0]).toEqual('#hello-world.txt')
  })

  it('parse skips empty patterns', () => {
    const patterns = patternHelper.parse(['', ' ', 'hello-world.txt'], {})
    expect(patterns).toHaveLength(1)
    expect(patterns[0].segments.reverse()[0]).toEqual('hello-world.txt')
  })
})
