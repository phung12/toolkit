import * as path from 'path'
import * as pathHelper from '../src/internal-path-helper'

const IS_WINDOWS = process.platform === 'win32'

describe('path-helper', () => {
  it('dirname interprets directory name from paths', () => {
    assertDirectoryName('', '.')
    assertDirectoryName('.', '.')
    assertDirectoryName('..', '.')
    assertDirectoryName('hello', '.')
    assertDirectoryName('hello/', '.')
    assertDirectoryName('hello/world', 'hello')

    if (IS_WINDOWS) {
      // Removes redundant slashes
      assertDirectoryName('C:\\\\hello\\\\\\world\\\\', 'C:\\hello')
      assertDirectoryName('C://hello///world//', 'C:\\hello')
      // Relative root:
      assertDirectoryName('\\hello\\\\world\\\\again\\\\', '\\hello\\world')
      assertDirectoryName('/hello///world//again//', '\\hello\\world')
      // UNC:
      assertDirectoryName('\\\\hello\\world\\again\\', '\\\\hello\\world')
      assertDirectoryName(
        '\\\\hello\\\\\\world\\\\again\\\\',
        '\\\\hello\\world'
      )
      assertDirectoryName(
        '\\\\\\hello\\\\\\world\\\\again\\\\',
        '\\\\hello\\world'
      )
      assertDirectoryName(
        '\\\\\\\\hello\\\\\\world\\\\again\\\\',
        '\\\\hello\\world'
      )
      assertDirectoryName('//hello///world//again//', '\\\\hello\\world')
      assertDirectoryName('///hello///world//again//', '\\\\hello\\world')
      assertDirectoryName('/////hello///world//again//', '\\\\hello\\world')
      // Relative:
      assertDirectoryName('hello\\world', 'hello')

      // Directory trimming
      assertDirectoryName('a:/hello', 'a:\\')
      assertDirectoryName('z:/hello', 'z:\\')
      assertDirectoryName('A:/hello', 'A:\\')
      assertDirectoryName('Z:/hello', 'Z:\\')
      assertDirectoryName('C:/', 'C:\\')
      assertDirectoryName('C:/hello', 'C:\\')
      assertDirectoryName('C:/hello/', 'C:\\')
      assertDirectoryName('C:/hello/world', 'C:\\hello')
      assertDirectoryName('C:/hello/world/', 'C:\\hello')
      assertDirectoryName('C:', 'C:')
      assertDirectoryName('C:hello', 'C:')
      assertDirectoryName('C:hello/', 'C:')
      assertDirectoryName('C:hello/world', 'C:hello')
      assertDirectoryName('C:hello/world/', 'C:hello')
      assertDirectoryName('/', '\\')
      assertDirectoryName('/hello', '\\')
      assertDirectoryName('/hello/', '\\')
      assertDirectoryName('/hello/world', '\\hello')
      assertDirectoryName('/hello/world/', '\\hello')
      assertDirectoryName('\\', '\\')
      assertDirectoryName('\\hello', '\\')
      assertDirectoryName('\\hello\\', '\\')
      assertDirectoryName('\\hello\\world', '\\hello')
      assertDirectoryName('\\hello\\world\\', '\\hello')
      assertDirectoryName('//hello', '\\\\hello')
      assertDirectoryName('//hello/', '\\\\hello')
      assertDirectoryName('//hello/world', '\\\\hello\\world')
      assertDirectoryName('//hello/world/', '\\\\hello\\world')
      assertDirectoryName('\\\\hello', '\\\\hello')
      assertDirectoryName('\\\\hello\\', '\\\\hello')
      assertDirectoryName('\\\\hello\\world', '\\\\hello\\world')
      assertDirectoryName('\\\\hello\\world\\', '\\\\hello\\world')
      assertDirectoryName('//hello/world/again', '\\\\hello\\world')
      assertDirectoryName('//hello/world/again/', '\\\\hello\\world')
      assertDirectoryName('hello/world/', 'hello')
      assertDirectoryName('hello/world/again', 'hello\\world')
      assertDirectoryName('../../hello', '..\\..')
    } else {
      // Should not converts slashes
      assertDirectoryName('/hello\\world', '/')
      assertDirectoryName('/hello\\world/', '/')
      assertDirectoryName('\\\\hello\\world\\again', '.')
      assertDirectoryName('\\\\hello\\world/', '.')
      assertDirectoryName('\\\\hello\\world/again', '\\\\hello\\world')
      assertDirectoryName('hello\\world', '.')
      assertDirectoryName('hello\\world/', '.')

      // Should remove redundant slashes (rooted paths; UNC format not special)
      assertDirectoryName('//hello', '/')
      assertDirectoryName('//hello/world', '/hello')
      assertDirectoryName('//hello/world/', '/hello')
      assertDirectoryName('//hello//world//', '/hello')
      assertDirectoryName('///hello////world///', '/hello')

      // Should remove redundant slashes (relative paths)
      assertDirectoryName('hello//world//again//', 'hello/world')
      assertDirectoryName('hello///world///again///', 'hello/world')

      // Directory trimming (Windows drive root format not special)
      assertDirectoryName('C:/', '.')
      assertDirectoryName('C:/hello', 'C:')
      assertDirectoryName('C:/hello/', 'C:')
      assertDirectoryName('C:/hello/world', 'C:/hello')
      assertDirectoryName('C:/hello/world/', 'C:/hello')
      assertDirectoryName('C:', '.')
      assertDirectoryName('C:hello', '.')
      assertDirectoryName('C:hello/', '.')
      assertDirectoryName('C:hello/world', 'C:hello')
      assertDirectoryName('C:hello/world/', 'C:hello')

      // Directory trimming (rooted paths)
      assertDirectoryName('/', '/')
      assertDirectoryName('/hello', '/')
      assertDirectoryName('/hello/', '/')
      assertDirectoryName('/hello/world', '/hello')
      assertDirectoryName('/hello/world/', '/hello')

      // Directory trimming (relative paths)
      assertDirectoryName('hello/world/', 'hello')
      assertDirectoryName('hello/world/again', 'hello/world')
      assertDirectoryName('../../hello', '../..')
    }
  })

  it('ensureRooted roots paths', () => {
    // Preserves relative pathing
    assertEnsureRooted('/foo', '.', `/foo${path.sep}.`)
    assertEnsureRooted('/foo/..', 'bar', `/foo/..${path.sep}bar`)
    assertEnsureRooted('/foo', 'bar/../baz', `/foo${path.sep}bar/../baz`)

    if (IS_WINDOWS) {
      // Already rooted - drive root
      assertEnsureRooted('D:\\', 'C:/', 'C:/')
      assertEnsureRooted('D:\\', 'a:/hello', 'a:/hello')
      assertEnsureRooted('D:\\', 'C:\\', 'C:\\')
      assertEnsureRooted('D:\\', 'C:\\hello', 'C:\\hello')

      // Already rooted - relative drive root
      assertEnsureRooted('D:\\', 'C:', 'C:')
      assertEnsureRooted('D:\\', 'C:hello', 'C:hello')
      assertEnsureRooted('D:\\', 'C:hello/world', 'C:hello/world')
      assertEnsureRooted('D:\\', 'C:hello\\world', 'C:hello\\world')

      // Already rooted - current drive root
      assertEnsureRooted('D:\\', '/', '/')
      assertEnsureRooted('D:\\', '/hello', '/hello')
      assertEnsureRooted('D:\\', '\\', '\\')
      assertEnsureRooted('D:\\', '\\hello', '\\hello')

      // Already rooted - UNC
      assertEnsureRooted('D:\\', '//machine/share', '//machine/share')
      assertEnsureRooted('D:\\', '\\\\machine\\share', '\\\\machine\\share')

      // Relative
      assertEnsureRooted('D:', 'hello', 'D:hello')
      assertEnsureRooted('D:/', 'hello', 'D:/hello')
      assertEnsureRooted('D:/', 'hello/world', 'D:/hello/world')
      assertEnsureRooted('D:\\', 'hello', 'D:\\hello')
      assertEnsureRooted('D:\\', 'hello\\world', 'D:\\hello\\world')
      assertEnsureRooted('D:/root', 'hello', 'D:/root\\hello')
      assertEnsureRooted('D:/root', 'hello/world', 'D:/root\\hello/world')
      assertEnsureRooted('D:\\root', 'hello', 'D:\\root\\hello')
      assertEnsureRooted('D:\\root', 'hello\\world', 'D:\\root\\hello\\world')
      assertEnsureRooted('D:/root/', 'hello', 'D:/root/hello')
      assertEnsureRooted('D:/root/', 'hello/world', 'D:/root/hello/world')
      assertEnsureRooted('D:\\root\\', 'hello', 'D:\\root\\hello')
      assertEnsureRooted('D:\\root\\', 'hello\\world', 'D:\\root\\hello\\world')
    } else {
      // Already rooted
      assertEnsureRooted('/root', '/', '/')
      assertEnsureRooted('/root', '/hello', '/hello')
      assertEnsureRooted('/root', '/hello/world', '/hello/world')

      // Not already rooted - Windows style drive root
      assertEnsureRooted('/root', 'C:/', '/root/C:/')
      assertEnsureRooted('/root', 'C:/hello', '/root/C:/hello')
      assertEnsureRooted('/root', 'C:\\', '/root/C:\\')

      // Not already rooted - Windows style relative drive root
      assertEnsureRooted('/root', 'C:', '/root/C:')
      assertEnsureRooted('/root', 'C:hello/world', '/root/C:hello/world')

      // Not already rooted - Windows style current drive root
      assertEnsureRooted('/root', '\\', '/root/\\')
      assertEnsureRooted('/root', '\\hello\\world', '/root/\\hello\\world')

      // Not already rooted - Windows style UNC
      assertEnsureRooted(
        '/root',
        '\\\\machine\\share',
        '/root/\\\\machine\\share'
      )

      // Not already rooted - relative
      assertEnsureRooted('/', 'hello', '/hello')
      assertEnsureRooted('/', 'hello/world', '/hello/world')
      assertEnsureRooted('/', 'hello\\world', '/hello\\world')
      assertEnsureRooted('/root', 'hello', '/root/hello')
      assertEnsureRooted('/root', 'hello/world', '/root/hello/world')
      assertEnsureRooted('/root', 'hello\\world', '/root/hello\\world')
      assertEnsureRooted('/root/', 'hello', '/root/hello')
      assertEnsureRooted('/root/', 'hello/world', '/root/hello/world')
      assertEnsureRooted('/root/', 'hello\\world', '/root/hello\\world')
      assertEnsureRooted('/root\\', 'hello', '/root\\/hello')
      assertEnsureRooted('/root\\', 'hello/world', '/root\\/hello/world')
      assertEnsureRooted('/root\\', 'hello\\world', '/root\\/hello\\world')
    }
  })

  it('isRooted detects root', () => {
    if (IS_WINDOWS) {
      // Drive root
      assertIsRooted('C:/', true)
      assertIsRooted('a:/hello', true)
      assertIsRooted('c:/hello', true)
      assertIsRooted('z:/hello', true)
      assertIsRooted('A:/hello', true)
      assertIsRooted('C:/hello', true)
      assertIsRooted('Z:/hello', true)
      assertIsRooted('C:\\', true)
      assertIsRooted('C:\\hello', true)

      // Relative drive root
      assertIsRooted('C:', true)
      assertIsRooted('C:hello', true)
      assertIsRooted('C:hello/world', true)
      assertIsRooted('C:hello\\world', true)

      // Current drive root
      assertIsRooted('/', true)
      assertIsRooted('/hello', true)
      assertIsRooted('/hello/world', true)
      assertIsRooted('\\', true)
      assertIsRooted('\\hello', true)
      assertIsRooted('\\hello\\world', true)

      // UNC
      assertIsRooted('//machine/share', true)
      assertIsRooted('//machine/share/', true)
      assertIsRooted('//machine/share/hello', true)
      assertIsRooted('\\\\machine\\share', true)
      assertIsRooted('\\\\machine\\share\\', true)
      assertIsRooted('\\\\machine\\share\\hello', true)

      // Relative
      assertIsRooted('hello', false)
      assertIsRooted('hello/world', false)
      assertIsRooted('hello\\world', false)
    } else {
      // Root
      assertIsRooted('/', true)
      assertIsRooted('/hello', true)
      assertIsRooted('/hello/world', true)

      // Windows style drive root - false on OSX/Linux
      assertIsRooted('C:/', false)
      assertIsRooted('a:/hello', false)
      assertIsRooted('c:/hello', false)
      assertIsRooted('z:/hello', false)
      assertIsRooted('A:/hello', false)
      assertIsRooted('C:/hello', false)
      assertIsRooted('Z:/hello', false)
      assertIsRooted('C:\\', false)
      assertIsRooted('C:\\hello', false)

      // Windows style relative drive root - false on OSX/Linux
      assertIsRooted('C:', false)
      assertIsRooted('C:hello', false)
      assertIsRooted('C:hello/world', false)
      assertIsRooted('C:hello\\world', false)

      // Windows style current drive root - false on OSX/Linux
      assertIsRooted('\\', false)
      assertIsRooted('\\hello', false)
      assertIsRooted('\\hello\\world', false)

      // Windows style UNC - false on OSX/Linux
      assertIsRooted('\\\\machine\\share', false)
      assertIsRooted('\\\\machine\\share\\', false)
      assertIsRooted('\\\\machine\\share\\hello', false)

      // Relative
      assertIsRooted('hello', false)
      assertIsRooted('hello/world', false)
      assertIsRooted('hello\\world', false)
    }
  })

  it('normalizeSeparators normalizes slashes', () => {
    if (IS_WINDOWS) {
      // Drive-rooted
      assertNormalizeSeparators('C:/', 'C:\\')
      assertNormalizeSeparators('C:/hello', 'C:\\hello')
      assertNormalizeSeparators('C:/hello/', 'C:\\hello\\')
      assertNormalizeSeparators('C:\\', 'C:\\')
      assertNormalizeSeparators('C:\\hello', 'C:\\hello')
      assertNormalizeSeparators('C:', 'C:')
      assertNormalizeSeparators('C:hello', 'C:hello')
      assertNormalizeSeparators('C:hello/world', 'C:hello\\world')
      assertNormalizeSeparators('C:hello\\world', 'C:hello\\world')
      assertNormalizeSeparators('/', '\\')
      assertNormalizeSeparators('/hello', '\\hello')
      assertNormalizeSeparators('/hello/world', '\\hello\\world')
      assertNormalizeSeparators('/hello//world', '\\hello\\world')
      assertNormalizeSeparators('\\', '\\')
      assertNormalizeSeparators('\\hello', '\\hello')
      assertNormalizeSeparators('\\hello\\', '\\hello\\')
      assertNormalizeSeparators('\\hello\\world', '\\hello\\world')
      assertNormalizeSeparators('\\hello\\\\world', '\\hello\\world')

      // UNC
      assertNormalizeSeparators('//machine/share', '\\\\machine\\share')
      assertNormalizeSeparators('//machine/share/', '\\\\machine\\share\\')
      assertNormalizeSeparators(
        '//machine/share/hello',
        '\\\\machine\\share\\hello'
      )
      assertNormalizeSeparators('///machine/share', '\\\\machine\\share')
      assertNormalizeSeparators('\\\\machine\\share', '\\\\machine\\share')
      assertNormalizeSeparators('\\\\machine\\share\\', '\\\\machine\\share\\')
      assertNormalizeSeparators(
        '\\\\machine\\share\\hello',
        '\\\\machine\\share\\hello'
      )
      assertNormalizeSeparators('\\\\\\machine\\share', '\\\\machine\\share')

      // Relative
      assertNormalizeSeparators('hello', 'hello')
      assertNormalizeSeparators('hello/world', 'hello\\world')
      assertNormalizeSeparators('hello//world', 'hello\\world')
      assertNormalizeSeparators('hello\\world', 'hello\\world')
      assertNormalizeSeparators('hello\\\\world', 'hello\\world')
    } else {
      // Rooted
      assertNormalizeSeparators('/', '/')
      assertNormalizeSeparators('/hello', '/hello')
      assertNormalizeSeparators('/hello/world', '/hello/world')
      assertNormalizeSeparators('//hello/world/', '/hello/world/')

      // Backslash not converted
      assertNormalizeSeparators('C:\\', 'C:\\')
      assertNormalizeSeparators('C:\\\\hello\\\\', 'C:\\\\hello\\\\')
      assertNormalizeSeparators('\\', '\\')
      assertNormalizeSeparators('\\hello', '\\hello')
      assertNormalizeSeparators('\\hello\\world', '\\hello\\world')
      assertNormalizeSeparators('hello\\world', 'hello\\world')

      // UNC not converted
      assertNormalizeSeparators('\\\\machine\\share', '\\\\machine\\share')

      // UNC not preserved
      assertNormalizeSeparators('//machine/share', '/machine/share')

      // Relative
      assertNormalizeSeparators('hello', 'hello')
      assertNormalizeSeparators('hello/////world', 'hello/world')
    }
  })

  it('safeTrimTrailingSeparator safely trims trailing separator', () => {
    assertSafeTrimTrailingSeparator('', '')

    if (IS_WINDOWS) {
      // Removes redundant slashes
      assertSafeTrimTrailingSeparator(
        'C:\\\\hello\\\\\\world\\\\',
        'C:\\hello\\world'
      )
      assertSafeTrimTrailingSeparator('C://hello///world//', 'C:\\hello\\world')
      // Relative root:
      assertSafeTrimTrailingSeparator(
        '\\hello\\\\world\\\\again\\\\',
        '\\hello\\world\\again'
      )
      assertSafeTrimTrailingSeparator(
        '/hello///world//again//',
        '\\hello\\world\\again'
      )
      // UNC:
      assertSafeTrimTrailingSeparator('\\\\hello\\world\\', '\\\\hello\\world')
      assertSafeTrimTrailingSeparator(
        '\\\\hello\\world\\\\',
        '\\\\hello\\world'
      )
      assertSafeTrimTrailingSeparator(
        '\\\\hello\\\\\\world\\\\again\\',
        '\\\\hello\\world\\again'
      )
      assertSafeTrimTrailingSeparator('//hello/world/', '\\\\hello\\world')
      assertSafeTrimTrailingSeparator('//hello/world//', '\\\\hello\\world')
      assertSafeTrimTrailingSeparator(
        '//hello//world//again/',
        '\\\\hello\\world\\again'
      )
      // Relative:
      assertSafeTrimTrailingSeparator('hello\\world\\', 'hello\\world')

      // Slash trimming
      assertSafeTrimTrailingSeparator('a:/hello/', 'a:\\hello')
      assertSafeTrimTrailingSeparator('z:/hello', 'z:\\hello')
      assertSafeTrimTrailingSeparator('C:/', 'C:\\')
      assertSafeTrimTrailingSeparator('C:\\', 'C:\\')
      assertSafeTrimTrailingSeparator('C:/hello/world', 'C:\\hello\\world')
      assertSafeTrimTrailingSeparator('C:/hello/world/', 'C:\\hello\\world')
      assertSafeTrimTrailingSeparator('C:', 'C:')
      assertSafeTrimTrailingSeparator('C:hello/', 'C:hello')
      assertSafeTrimTrailingSeparator('/', '\\')
      assertSafeTrimTrailingSeparator('/hello/', '\\hello')
      assertSafeTrimTrailingSeparator('\\', '\\')
      assertSafeTrimTrailingSeparator('\\hello\\', '\\hello')
      assertSafeTrimTrailingSeparator('//hello/', '\\\\hello')
      assertSafeTrimTrailingSeparator('//hello/world', '\\\\hello\\world')
      assertSafeTrimTrailingSeparator('//hello/world/', '\\\\hello\\world')
      assertSafeTrimTrailingSeparator('\\\\hello', '\\\\hello')
      assertSafeTrimTrailingSeparator('\\\\hello\\', '\\\\hello')
      assertSafeTrimTrailingSeparator('\\\\hello\\world', '\\\\hello\\world')
      assertSafeTrimTrailingSeparator('\\\\hello\\world\\', '\\\\hello\\world')
      assertSafeTrimTrailingSeparator('hello/world/', 'hello\\world')
      assertSafeTrimTrailingSeparator('hello/', 'hello')
      assertSafeTrimTrailingSeparator('../../', '..\\..')
    } else {
      // Should not converts slashes
      assertSafeTrimTrailingSeparator('/hello\\world', '/hello\\world')
      assertSafeTrimTrailingSeparator('/hello\\world/', '/hello\\world')
      assertSafeTrimTrailingSeparator('\\\\hello\\world/', '\\\\hello\\world')
      assertSafeTrimTrailingSeparator('hello\\world/', 'hello\\world')

      // Should remove redundant slashes (rooted paths; UNC format not special)
      assertSafeTrimTrailingSeparator('//hello', '/hello')
      assertSafeTrimTrailingSeparator('//hello/world', '/hello/world')
      assertSafeTrimTrailingSeparator('//hello/world/', '/hello/world')
      assertSafeTrimTrailingSeparator('//hello//world//', '/hello/world')
      assertSafeTrimTrailingSeparator('///hello////world///', '/hello/world')

      // Should remove redundant slashes (relative paths)
      assertSafeTrimTrailingSeparator('hello//world//', 'hello/world')
      assertSafeTrimTrailingSeparator('hello///world///', 'hello/world')

      // Slash trimming (Windows drive root format not special)
      assertSafeTrimTrailingSeparator('C:/', 'C:')
      assertSafeTrimTrailingSeparator('C:/hello', 'C:/hello')
      assertSafeTrimTrailingSeparator('C:/hello/', 'C:/hello')
      assertSafeTrimTrailingSeparator('C:hello/', 'C:hello')

      // Slash trimming (rooted paths)
      assertSafeTrimTrailingSeparator('/', '/')
      assertSafeTrimTrailingSeparator('/hello', '/hello')
      assertSafeTrimTrailingSeparator('/hello/', '/hello')
      assertSafeTrimTrailingSeparator('/hello/world/', '/hello/world')

      // Slash trimming (relative paths)
      assertSafeTrimTrailingSeparator('hello/world/', 'hello/world')
      assertSafeTrimTrailingSeparator('../../', '../..')
    }
  })
})

function assertDirectoryName(itemPath: string, expected: string): void {
  expect(pathHelper.dirname(itemPath)).toBe(expected)
}

function assertEnsureRooted(
  root: string,
  itemPath: string,
  expected: string
): void {
  expect(pathHelper.ensureRooted(root, itemPath)).toBe(expected)
}

function assertIsRooted(itemPath: string, expected: boolean): void {
  expect(pathHelper.isRooted(itemPath)).toBe(expected)
}

function assertNormalizeSeparators(itemPath: string, expected: string): void {
  expect(pathHelper.normalizeSeparators(itemPath)).toBe(expected)
}

function assertSafeTrimTrailingSeparator(
  itemPath: string,
  expected: string
): void {
  expect(pathHelper.safeTrimTrailingSeparator(itemPath)).toBe(expected)
}
