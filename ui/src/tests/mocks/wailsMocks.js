import { vi } from 'vitest'

export class MockFileSystem {
  constructor() {
    this.files = new Map()
    this.currentVault = null
    this.deletedFiles = []
  }

  reset() {
    this.files.clear()
    this.currentVault = null
    this.deletedFiles = []
  }

  setVault(path) {
    this.currentVault = path
  }

  addFile(path, content) {
    this.files.set(path, content)
  }

  getFile(path) {
    return this.files.get(path)
  }

  deleteFile(path) {
    const content = this.files.get(path)
    this.files.delete(path)
    this.deletedFiles.push({ path, content })
  }

  renameFile(oldPath, newPath) {
    const content = this.files.get(oldPath)
    this.files.delete(oldPath)
    this.files.set(newPath, content)
  }

  listFiles() {
    return Array.from(this.files.keys())
  }

  fileExists(path) {
    return this.files.has(path)
  }
}

/**
 * Creates mock Wails backend bindings
 */
export function createMockWailsBindings(mockFS) {
  return {
    OpenVault: vi.fn(async (path) => {
      mockFS.setVault(path)
      return null
    }),

    ListVaultFiles: vi.fn(async () => {
      return mockFS.listFiles()
    }),

    SelectVault: vi.fn(async () => {
      return '/mock/vault/path'
    }),

    ReadFile: vi.fn(async (path) => {
      const content = mockFS.getFile(path)
      if (content === undefined) {
        throw new Error(`File not found: ${path}`)
      }
      return content
    }),

    WriteFile: vi.fn(async (path, content) => {
      mockFS.addFile(path, content)
      return null
    }),

    CreateFile: vi.fn(async (path) => {
      const finalPath = path.endsWith('.md') ? path : `${path}.md`
      mockFS.addFile(finalPath, '')
      return finalPath
    }),

    DeleteFile: vi.fn(async (path) => {
      if (!mockFS.fileExists(path)) {
        throw new Error(`File not found: ${path}`)
      }
      mockFS.deleteFile(path)
      return null
    }),

    RenameFile: vi.fn(async (oldPath, newPath) => {
      if (!mockFS.fileExists(oldPath)) {
        throw new Error(`File not found: ${oldPath}`)
      }
      mockFS.renameFile(oldPath, newPath)
      return null
    }),

    MoveFile: vi.fn(async (oldPath, newPath) => {
      if (!mockFS.fileExists(oldPath)) {
        throw new Error(`File not found: ${oldPath}`)
      }
      mockFS.renameFile(oldPath, newPath)
      return null
    }),

    ReadBinaryFile: vi.fn(async (path) => {
      const content = mockFS.getFile(path)
      if (content === undefined) {
        throw new Error(`File not found: ${path}`)
      }
      return content
    }),

    WriteBinaryFile: vi.fn(async (path, content) => {
      mockFS.addFile(path, content)
      return null
    }),

    SpawnWindow: vi.fn(async () => {
      return null
    })
  }
}
