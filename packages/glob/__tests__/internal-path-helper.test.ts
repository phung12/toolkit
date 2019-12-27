import * as path from 'path'
import * as pathHelper from '../src/internal-path-helper'

const IS_WINDOWS = process.platform === 'win32'

// todo test ensureAbsoluteRoot and hasAbsoluteRoot

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

  it('ensureRoot roots paths', () => {
    // Preserves relative pathing
    assertEnsureRoot('/foo', '.', `/foo${path.sep}.`)
    assertEnsureRoot('/foo/..', 'bar', `/foo/..${path.sep}bar`)
    assertEnsureRoot('/foo', 'bar/../baz', `/foo${path.sep}bar/../baz`)

    if (IS_WINDOWS) {
      // Already rooted - drive root
      assertEnsureRoot('D:\\', 'C:/', 'C:/')
      assertEnsureRoot('D:\\', 'a:/hello', 'a:/hello')
      assertEnsureRoot('D:\\', 'C:\\', 'C:\\')
      assertEnsureRoot('D:\\', 'C:\\hello', 'C:\\hello')

      // Already rooted - relative drive root
      assertEnsureRoot('D:\\', 'C:', 'C:')
      assertEnsureRoot('D:\\', 'C:hello', 'C:hello')
      assertEnsureRoot('D:\\', 'C:hello/world', 'C:hello/world')
      assertEnsureRoot('D:\\', 'C:hello\\world', 'C:hello\\world')

      // Already rooted - current drive root
      assertEnsureRoot('D:\\', '/', '/')
      assertEnsureRoot('D:\\', '/hello', '/hello')
      assertEnsureRoot('D:\\', '\\', '\\')
      assertEnsureRoot('D:\\', '\\hello', '\\hello')

      // Already rooted - UNC
      assertEnsureRoot('D:\\', '//machine/share', '//machine/share')
      assertEnsureRoot('D:\\', '\\\\machine\\share', '\\\\machine\\share')

      // Relative
      assertEnsureRoot('D:', 'hello', 'D:hello')
      assertEnsureRoot('D:/', 'hello', 'D:/hello')
      assertEnsureRoot('D:/', 'hello/world', 'D:/hello/world')
      assertEnsureRoot('D:\\', 'hello', 'D:\\hello')
      assertEnsureRoot('D:\\', 'hello\\world', 'D:\\hello\\world')
      assertEnsureRoot('D:/root', 'hello', 'D:/root\\hello')
      assertEnsureRoot('D:/root', 'hello/world', 'D:/root\\hello/world')
      assertEnsureRoot('D:\\root', 'hello', 'D:\\root\\hello')
      assertEnsureRoot('D:\\root', 'hello\\world', 'D:\\root\\hello\\world')
      assertEnsureRoot('D:/root/', 'hello', 'D:/root/hello')
      assertEnsureRoot('D:/root/', 'hello/world', 'D:/root/hello/world')
      assertEnsureRoot('D:\\root\\', 'hello', 'D:\\root\\hello')
      assertEnsureRoot('D:\\root\\', 'hello\\world', 'D:\\root\\hello\\world')
    } else {
      // Already rooted
      assertEnsureRoot('/root', '/', '/')
      assertEnsureRoot('/root', '/hello', '/hello')
      assertEnsureRoot('/root', '/hello/world', '/hello/world')

      // Not already rooted - Windows style drive root
      assertEnsureRoot('/root', 'C:/', '/root/C:/')
      assertEnsureRoot('/root', 'C:/hello', '/root/C:/hello')
      assertEnsureRoot('/root', 'C:\\', '/root/C:\\')

      // Not already rooted - Windows style relative drive root
      assertEnsureRoot('/root', 'C:', '/root/C:')
      assertEnsureRoot('/root', 'C:hello/world', '/root/C:hello/world')

      // Not already rooted - Windows style current drive root
      assertEnsureRoot('/root', '\\', '/root/\\')
      assertEnsureRoot('/root', '\\hello\\world', '/root/\\hello\\world')

      // Not already rooted - Windows style UNC
      assertEnsureRoot(
        '/root',
        '\\\\machine\\share',
        '/root/\\\\machine\\share'
      )

      // Not already rooted - relative
      assertEnsureRoot('/', 'hello', '/hello')
      assertEnsureRoot('/', 'hello/world', '/hello/world')
      assertEnsureRoot('/', 'hello\\world', '/hello\\world')
      assertEnsureRoot('/root', 'hello', '/root/hello')
      assertEnsureRoot('/root', 'hello/world', '/root/hello/world')
      assertEnsureRoot('/root', 'hello\\world', '/root/hello\\world')
      assertEnsureRoot('/root/', 'hello', '/root/hello')
      assertEnsureRoot('/root/', 'hello/world', '/root/hello/world')
      assertEnsureRoot('/root/', 'hello\\world', '/root/hello\\world')
      assertEnsureRoot('/root\\', 'hello', '/root\\/hello')
      assertEnsureRoot('/root\\', 'hello/world', '/root\\/hello/world')
      assertEnsureRoot('/root\\', 'hello\\world', '/root\\/hello\\world')
    }
  })

  it('isRooted detects root', () => {
    if (IS_WINDOWS) {
      // Drive root
      assertHasRoot('C:/', true)
      assertHasRoot('a:/hello', true)
      assertHasRoot('c:/hello', true)
      assertHasRoot('z:/hello', true)
      assertHasRoot('A:/hello', true)
      assertHasRoot('C:/hello', true)
      assertHasRoot('Z:/hello', true)
      assertHasRoot('C:\\', true)
      assertHasRoot('C:\\hello', true)

      // Relative drive root
      assertHasRoot('C:', true)
      assertHasRoot('C:hello', true)
      assertHasRoot('C:hello/world', true)
      assertHasRoot('C:hello\\world', true)

      // Current drive root
      assertHasRoot('/', true)
      assertHasRoot('/hello', true)
      assertHasRoot('/hello/world', true)
      assertHasRoot('\\', true)
      assertHasRoot('\\hello', true)
      assertHasRoot('\\hello\\world', true)

      // UNC
      assertHasRoot('//machine/share', true)
      assertHasRoot('//machine/share/', true)
      assertHasRoot('//machine/share/hello', true)
      assertHasRoot('\\\\machine\\share', true)
      assertHasRoot('\\\\machine\\share\\', true)
      assertHasRoot('\\\\machine\\share\\hello', true)

      // Relative
      assertHasRoot('hello', false)
      assertHasRoot('hello/world', false)
      assertHasRoot('hello\\world', false)
    } else {
      // Root
      assertHasRoot('/', true)
      assertHasRoot('/hello', true)
      assertHasRoot('/hello/world', true)

      // Windows style drive root - false on OSX/Linux
      assertHasRoot('C:/', false)
      assertHasRoot('a:/hello', false)
      assertHasRoot('c:/hello', false)
      assertHasRoot('z:/hello', false)
      assertHasRoot('A:/hello', false)
      assertHasRoot('C:/hello', false)
      assertHasRoot('Z:/hello', false)
      assertHasRoot('C:\\', false)
      assertHasRoot('C:\\hello', false)

      // Windows style relative drive root - false on OSX/Linux
      assertHasRoot('C:', false)
      assertHasRoot('C:hello', false)
      assertHasRoot('C:hello/world', false)
      assertHasRoot('C:hello\\world', false)

      // Windows style current drive root - false on OSX/Linux
      assertHasRoot('\\', false)
      assertHasRoot('\\hello', false)
      assertHasRoot('\\hello\\world', false)

      // Windows style UNC - false on OSX/Linux
      assertHasRoot('\\\\machine\\share', false)
      assertHasRoot('\\\\machine\\share\\', false)
      assertHasRoot('\\\\machine\\share\\hello', false)

      // Relative
      assertHasRoot('hello', false)
      assertHasRoot('hello/world', false)
      assertHasRoot('hello\\world', false)
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

function assertEnsureRoot(
  root: string,
  itemPath: string,
  expected: string
): void {
  expect(pathHelper.ensureRoot(root, itemPath)).toBe(expected)
}

function assertHasRoot(itemPath: string, expected: boolean): void {
  expect(pathHelper.hasRoot(itemPath)).toBe(expected)
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
