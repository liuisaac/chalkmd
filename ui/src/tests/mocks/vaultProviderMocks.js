import { vi } from 'vitest'

/**
 * Mock implementations for VaultProvider dependencies
 * These are used by vaultProvider.test.jsx
 */

// Shared state
export const mockFileSystem = new Map()
export const mockVaultState = { path: null }

// Reset function
export function resetMocks() {
  mockFileSystem.clear()
  mockVaultState.path = null
}

// Mock file operations
export const createFile = vi.fn(async (name, files, vaultPath, setCurrentFile, reload) => {
  const finalName = name.endsWith('.md') ? name : `${name}.md`
  mockFileSystem.set(finalName, '')
  if (setCurrentFile) setCurrentFile(finalName)
  if (reload) await reload()
})

export const createFolder = vi.fn(async (name, files, reload) => {
  mockFileSystem.set(`${name}/`, '')
  if (reload) await reload()
})

export const renameFile = vi.fn(async (oldPath, newPath, reload) => {
  const content = mockFileSystem.get(oldPath) || ''
  mockFileSystem.delete(oldPath)
  mockFileSystem.set(newPath, content)
  if (reload) await reload()
})

export const moveFile = vi.fn(async (oldPath, newPath, reload) => {
  const content = mockFileSystem.get(oldPath) || ''
  mockFileSystem.delete(oldPath)
  mockFileSystem.set(newPath, content)
  if (reload) await reload()
})

export const deleteFile = vi.fn(async (path, reload) => {
  mockFileSystem.delete(path)
  if (reload) await reload()
})

export const readFile = vi.fn(async (path) => {
  return mockFileSystem.get(path) || ''
})

// Mock vault operations
export const loadVaultContents = vi.fn(async (setFiles) => {
  const files = Array.from(mockFileSystem.keys()).filter(k => !k.endsWith('/'))
  setFiles(files)
})

export const createVault = vi.fn(async (path) => {
  mockVaultState.path = path
})

export const openVault = vi.fn(async (path, setVaultPath, setFiles) => {
  mockVaultState.path = path
  if (setVaultPath) setVaultPath(path)
  const files = Array.from(mockFileSystem.keys()).filter(k => !k.endsWith('/'))
  if (setFiles) setFiles(files)
})

export const selectVaultFolder = vi.fn(async () => {
  return '/mock/vault'
})

// Mock asset operations
export const readBinaryFile = vi.fn(async (path) => {
  return mockFileSystem.get(path) || ''
})

export const writeBinaryFile = vi.fn(async (path, content) => {
  mockFileSystem.set(path, content)
})

// Mock window operations
export const spawnInstance = vi.fn(async () => {
  // Mock
})
