import { describe, it, expect, beforeEach, vi } from 'vitest'
import { MockFileSystem, createMockWailsBindings } from '../mocks/wailsMocks'

/**
 * SIMPLE BACKEND TESTS
 * Tests the mock file system to catch file duplication and data loss bugs
 * NO React components needed - pure logic tests
 */

describe('File Operations - Simple Backend Tests', () => {
  let mockFS
  let mockBindings

  beforeEach(() => {
    mockFS = new MockFileSystem()
    mockBindings = createMockWailsBindings(mockFS)
    
    mockFS.setVault('/test/vault')
    mockFS.addFile('note1.md', '# Original Content')
    mockFS.addFile('note2.md', '# Second Note')
  })

  describe('File Creation', () => {
    it('should create a file successfully', async () => {
      await mockBindings.CreateFile('newfile.md')
      
      expect(mockFS.fileExists('newfile.md')).toBe(true)
      expect(mockFS.getFile('newfile.md')).toBe('')
    })

    it('should auto-add .md extension', async () => {
      await mockBindings.CreateFile('noextension')
      
      expect(mockFS.fileExists('noextension.md')).toBe(true)
    })

    it('should handle concurrent file creation without duplicates', async () => {
      await Promise.all([
        mockBindings.CreateFile('file1.md'),
        mockBindings.CreateFile('file2.md'),
        mockBindings.CreateFile('file3.md')
      ])

      const files = mockFS.listFiles()
      expect(files).toHaveLength(5)
      
      const uniqueFiles = new Set(files)
      expect(uniqueFiles.size).toBe(5)
    })
  })

  describe('File Writing', () => {
    it('should write content to file', async () => {
      await mockBindings.WriteFile('note1.md', 'New content')
      
      expect(mockFS.getFile('note1.md')).toBe('New content')
    })

    it('should allow empty content', async () => {
      await mockBindings.WriteFile('note1.md', '')
      
      expect(mockFS.getFile('note1.md')).toBe('')
      expect(mockFS.fileExists('note1.md')).toBe(true)
    })

    it('should handle concurrent writes to different files', async () => {
      await Promise.all([
        mockBindings.WriteFile('note1.md', 'Content 1'),
        mockBindings.WriteFile('note2.md', 'Content 2')
      ])

      expect(mockFS.getFile('note1.md')).toBe('Content 1')
      expect(mockFS.getFile('note2.md')).toBe('Content 2')
    })

    it('should handle rapid sequential writes', async () => {
      for (let i = 1; i <= 10; i++) {
        await mockBindings.WriteFile('note1.md', `Version ${i}`)
      }

      expect(mockFS.getFile('note1.md')).toBe('Version 10')
    })
  })

  describe('File Reading', () => {
    it('should read file content', async () => {
      const content = await mockBindings.ReadFile('note1.md')
      expect(content).toBe('# Original Content')
    })

    it('should throw error for non-existent file', async () => {
      await expect(
        mockBindings.ReadFile('missing.md')
      ).rejects.toThrow('File not found')
    })
  })

  describe('File Deletion', () => {
    it('should delete file and move to trash', async () => {
      await mockBindings.DeleteFile('note1.md')

      expect(mockFS.fileExists('note1.md')).toBe(false)
      expect(mockFS.deletedFiles).toHaveLength(1)
      expect(mockFS.deletedFiles[0].path).toBe('note1.md')
    })

    it('should preserve content in trash', async () => {
      const original = mockFS.getFile('note1.md')
      await mockBindings.DeleteFile('note1.md')

      expect(mockFS.deletedFiles[0].content).toBe(original)
    })

    it('should throw error when deleting non-existent file', async () => {
      await expect(
        mockBindings.DeleteFile('missing.md')
      ).rejects.toThrow('File not found')
    })
  })

  describe('File Renaming', () => {
    it('should rename file and preserve content', async () => {
      const original = mockFS.getFile('note1.md')
      await mockBindings.RenameFile('note1.md', 'renamed.md')

      expect(mockFS.fileExists('note1.md')).toBe(false)
      expect(mockFS.fileExists('renamed.md')).toBe(true)
      expect(mockFS.getFile('renamed.md')).toBe(original)
    })

    it('should throw error when renaming non-existent file', async () => {
      await expect(
        mockBindings.RenameFile('missing.md', 'new.md')
      ).rejects.toThrow('File not found')
    })
  })

  describe('Vault Operations', () => {
    it('should list all files in vault', async () => {
      const files = await mockBindings.ListVaultFiles()

      expect(files).toContain('note1.md')
      expect(files).toContain('note2.md')
      expect(files).toHaveLength(2)
    })

    it('should open vault', async () => {
      await mockBindings.OpenVault('/new/vault')
      expect(mockFS.currentVault).toBe('/new/vault')
    })
  })

  describe('Stress Tests', () => {
    it('should handle 100 rapid operations', async () => {
      const operations = []
      
      for (let i = 0; i < 100; i++) {
        if (i % 2 === 0) {
          operations.push(mockBindings.CreateFile(`file${i}.md`))
        } else {
          operations.push(
            mockBindings.WriteFile(`file${i-1}.md`, `Content ${i}`)
          )
        }
      }

      await Promise.allSettled(operations)

      const files = mockFS.listFiles()
      const uniqueFiles = new Set(files)
      
      expect(uniqueFiles.size).toBe(files.length)
    })
  })
})
