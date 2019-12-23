import * as patternHelper from '../src/internal-pattern-helper'
import {MatchKind} from '../src/internal-match-kind'
import {IS_WINDOWS} from '../../io/src/io-util'

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
      patternHelper.getOptions({implicitDescendants: false})
    )
    const matched = itemPaths.filter(
      x => patternHelper.match(patterns, x) === MatchKind.All
    )
    expect(matched).toEqual([
      '/solution1/proj1/proj1.proj',
      '/solution1/proj1/README.txt',
      '/solution1/proj2/proj2.proj',
      '/solution1/solution1.sln',
      '/solution2/solution2.sln'
    ])
  })

  it('match supports excluding directories', () => {
    const itemPaths = ['/', '/foo', '/foo/bar', '/foo/bar/baz']
    const patterns = patternHelper.parse(
      [
        '/foo/**', // include all files and directories
        '!/foo/**/' // exclude directories
      ],
      patternHelper.getOptions({implicitDescendants: false})
    )
    const matchKinds = itemPaths.map(x => patternHelper.match(patterns, x))
    expect(matchKinds).toEqual([
      MatchKind.None,
      MatchKind.File,
      MatchKind.File,
      MatchKind.File
    ])
  })

  it('match supports including directories only', () => {
    const itemPaths = ['/', '/foo/', '/foo/bar', '/foo/bar/baz']
    const patterns = patternHelper.parse(
      [
        '/foo/**/' // include directories only
      ],
      patternHelper.getOptions({implicitDescendants: false})
    )
    const matchKinds = itemPaths.map(x => patternHelper.match(patterns, x))
    expect(matchKinds).toEqual([
      MatchKind.None,
      MatchKind.Directory,
      MatchKind.Directory,
      MatchKind.Directory
    ])
  })

  it('parse skips comments', () => {
    const patterns = patternHelper.parse(
      ['# comment 1', ' # comment 2', '!#hello-world.txt'],
      patternHelper.getOptions({implicitDescendants: false})
    )
    expect(patterns).toHaveLength(1)
    expect(patterns[0].negate).toBeTruthy()
    expect(patterns[0].segments.reverse()[0]).toEqual('#hello-world.txt')
  })

  it('parse skips empty patterns', () => {
    const patterns = patternHelper.parse(
      ['', ' ', 'hello-world.txt'],
      patternHelper.getOptions({implicitDescendants: false})
    )
    expect(patterns).toHaveLength(1)
    expect(patterns[0].segments.reverse()[0]).toEqual('hello-world.txt')
  })

  it('partialMatch skips negate patterns', () => {
    const patterns = patternHelper.parse(
      [
        '/search1/foo/**',
        '/search2/bar/**',
        '!/search2/bar/**',
        '!/search3/baz/**'
      ],
      patternHelper.getOptions({implicitDescendants: false})
    )
    expect(patternHelper.partialMatch(patterns, '/search1')).toBeTruthy()
    expect(patternHelper.partialMatch(patterns, '/search1/foo')).toBeTruthy()
    expect(patternHelper.partialMatch(patterns, '/search2')).toBeTruthy()
    expect(patternHelper.partialMatch(patterns, '/search2/bar')).toBeTruthy()
    expect(patternHelper.partialMatch(patterns, '/search3')).toBeFalsy()
    expect(patternHelper.partialMatch(patterns, '/search3/bar')).toBeFalsy()
  })

  it('omits negate search paths', () => {
    const patterns = patternHelper.parse(
      ['/search1/foo/**', '/search2/bar/**', '!/search3/baz/**'],
      patternHelper.getOptions()
    )
    const searchPaths = patternHelper.getSearchPaths(patterns)
    expect(searchPaths).toEqual(['/search1/foo', '/search2/bar'])
  })

  it('omits search path when ancestor is also a search path', () => {
    if (IS_WINDOWS) {
      const patterns = patternHelper.parse(
        [
          '/Search1/Foo/**',
          '/sEARCH1/fOO/bar/**',
          '/sEARCH1/foo/bar',
          '/Search2/**',
          '/Search3/Foo/Bar/**',
          '/sEARCH3/fOO/bAR/**'
        ],
        patternHelper.getOptions()
      )
      const searchPaths = patternHelper.getSearchPaths(patterns)
      expect(searchPaths).toEqual([
        '/Search1/Foo',
        '/Search2',
        '/Search3/Foo/Bar'
      ])
    } else {
      const patterns = patternHelper.parse(
        [
          '/search1/foo/**',
          '/search1/foo/bar/**',
          '/search2/foo/bar',
          '/search2/**',
          '/search3/foo/bar/**',
          '/search3/foo/bar/**'
        ],
        patternHelper.getOptions()
      )
      const searchPaths = patternHelper.getSearchPaths(patterns)
      expect(searchPaths).toEqual([
        '/search1/foo',
        '/search2',
        '/search3/foo/bar'
      ])
    }
  })
})
