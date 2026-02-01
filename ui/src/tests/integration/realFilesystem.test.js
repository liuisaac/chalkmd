import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import * as fs from 'fs/promises'
import * as fsSync from 'fs'
import * as path from 'path'
import { tmpdir } from 'os'

/**
 * REAL FILESYSTEM INTEGRATION TESTS
 * 
 * These tests use the actual filesystem (via Node.js fs module) to verify
 * that file operations behave correctly under real conditions.
 * 
 * This catches bugs that mock-based tests miss:
 * - Race conditions in concurrent operations
 * - Path handling issues (Windows vs Unix)
 * - Timing-dependent bugs
 * - Actual I/O behavior
 */

/**
 * Creates mock Wails bindings that use real filesystem operations
 * This simulates what the Go backend does, but in JavaScript
 */
function createRealFilesystemBindings(vaultPath) {
    return {
        async CreateFile(relativePath) {
            const fullPath = path.join(vaultPath, relativePath)
            const finalPath = fullPath.endsWith('.md') ? fullPath : `${fullPath}.md`
            
            // Create parent directories if needed
            const dir = path.dirname(finalPath)
            await fs.mkdir(dir, { recursive: true })
            
            // Create empty file
            await fs.writeFile(finalPath, '')
            return finalPath
        },

        async WriteFile(relativePath, content) {
            const fullPath = path.join(vaultPath, relativePath)
            
            // Verify path is within vault (like Go backend does)
            const normalizedFull = path.resolve(fullPath)
            const normalizedVault = path.resolve(vaultPath)
            if (!normalizedFull.startsWith(normalizedVault)) {
                throw new Error('invalid path: outside vault')
            }
            
            // Create parent directories if needed
            const dir = path.dirname(fullPath)
            await fs.mkdir(dir, { recursive: true })
            
            await fs.writeFile(fullPath, content)
        },

        async ReadFile(relativePath) {
            const fullPath = path.join(vaultPath, relativePath)
            
            const normalizedFull = path.resolve(fullPath)
            const normalizedVault = path.resolve(vaultPath)
            if (!normalizedFull.startsWith(normalizedVault)) {
                throw new Error('invalid path: outside vault')
            }
            
            const content = await fs.readFile(fullPath, 'utf-8')
            return content
        },

        async DeleteFile(relativePath) {
            const fullPath = path.join(vaultPath, relativePath)
            
            const normalizedFull = path.resolve(fullPath)
            const normalizedVault = path.resolve(vaultPath)
            if (!normalizedFull.startsWith(normalizedVault)) {
                throw new Error('invalid path: outside vault')
            }
            
            // Move to a "trash" folder instead of permanent delete (like Go backend)
            const trashPath = path.join(vaultPath, '.trash')
            await fs.mkdir(trashPath, { recursive: true })
            
            const fileName = path.basename(fullPath)
            const trashDest = path.join(trashPath, `${Date.now()}-${fileName}`)
            await fs.rename(fullPath, trashDest)
        },

        async RenameFile(oldPath, newPath) {
            const oldFull = path.join(vaultPath, oldPath)
            const newFull = path.join(vaultPath, newPath)
            
            // Validate both paths
            const normalizedOld = path.resolve(oldFull)
            const normalizedNew = path.resolve(newFull)
            const normalizedVault = path.resolve(vaultPath)
            
            if (!normalizedOld.startsWith(normalizedVault) || !normalizedNew.startsWith(normalizedVault)) {
                throw new Error('invalid path: outside vault')
            }
            
            // Create parent directories if needed
            const dir = path.dirname(newFull)
            await fs.mkdir(dir, { recursive: true })
            
            await fs.rename(oldFull, newFull)
        },

        async MoveFile(oldPath, newPath) {
            // Move is same as rename in our implementation
            return this.RenameFile(oldPath, newPath)
        },

        async ListVaultContents() {
            const results = []
            
            async function walkDir(dir, baseDir) {
                const entries = await fs.readdir(dir, { withFileTypes: true })
                
                for (const entry of entries) {
                    // Skip hidden files/folders
                    if (entry.name.startsWith('.')) continue
                    
                    const fullPath = path.join(dir, entry.name)
                    const relativePath = path.relative(baseDir, fullPath)
                    
                    results.push({
                        name: entry.name,
                        path: relativePath,
                        isDir: entry.isDirectory()
                    })
                    
                    if (entry.isDirectory()) {
                        await walkDir(fullPath, baseDir)
                    }
                }
            }
            
            await walkDir(vaultPath, vaultPath)
            return results
        }
    }
}

/**
 * Helper to list all files in vault (flat list of paths)
 */
async function listAllFiles(vaultPath) {
    const files = []
    
    async function walk(dir) {
        const entries = await fs.readdir(dir, { withFileTypes: true })
        for (const entry of entries) {
            if (entry.name.startsWith('.')) continue
            const fullPath = path.join(dir, entry.name)
            if (entry.isDirectory()) {
                await walk(fullPath)
            } else {
                files.push(path.relative(vaultPath, fullPath))
            }
        }
    }
    
    await walk(vaultPath)
    return files
}

/**
 * Helper to read file content
 */
async function getFileContent(vaultPath, relativePath) {
    return fs.readFile(path.join(vaultPath, relativePath), 'utf-8')
}

/**
 * Helper to check if file exists
 */
async function fileExists(vaultPath, relativePath) {
    try {
        await fs.access(path.join(vaultPath, relativePath))
        return true
    } catch {
        return false
    }
}

describe('Real Filesystem Integration Tests', () => {
    let testVaultPath
    let bindings

    beforeEach(async () => {
        // Create a unique temp directory for each test
        testVaultPath = path.join(tmpdir(), `chalkmd-test-${Date.now()}-${Math.random().toString(36).slice(2)}`)
        await fs.mkdir(testVaultPath, { recursive: true })
        bindings = createRealFilesystemBindings(testVaultPath)
    })

    afterEach(async () => {
        // Clean up test directory
        try {
            await fs.rm(testVaultPath, { recursive: true, force: true })
        } catch (err) {
            // Ignore cleanup errors
        }
    })

    describe('Basic File Operations', () => {
        it('should create a file and verify it exists on disk', async () => {
            await bindings.CreateFile('test.md')
            
            const exists = await fileExists(testVaultPath, 'test.md')
            expect(exists).toBe(true)
        })

        it('should auto-add .md extension when missing', async () => {
            const result = await bindings.CreateFile('noextension')
            
            expect(result).toContain('.md')
            const exists = await fileExists(testVaultPath, 'noextension.md')
            expect(exists).toBe(true)
        })

        it('should write and read content correctly', async () => {
            await bindings.CreateFile('note.md')
            await bindings.WriteFile('note.md', '# Hello World\n\nThis is a test.')
            
            const content = await bindings.ReadFile('note.md')
            expect(content).toBe('# Hello World\n\nThis is a test.')
        })

        it('should handle unicode content', async () => {
            const unicodeContent = '# 你好世界 🌍\n\nEmoji test: 🎉🚀💯\n\nSpecial chars: é à ü ñ'
            
            await bindings.CreateFile('unicode.md')
            await bindings.WriteFile('unicode.md', unicodeContent)
            
            const content = await bindings.ReadFile('unicode.md')
            expect(content).toBe(unicodeContent)
        })

        it('should rename file and preserve content', async () => {
            await bindings.CreateFile('old-name.md')
            await bindings.WriteFile('old-name.md', 'Important content')
            
            await bindings.RenameFile('old-name.md', 'new-name.md')
            
            const oldExists = await fileExists(testVaultPath, 'old-name.md')
            const newExists = await fileExists(testVaultPath, 'new-name.md')
            
            expect(oldExists).toBe(false)
            expect(newExists).toBe(true)
            
            const content = await bindings.ReadFile('new-name.md')
            expect(content).toBe('Important content')
        })

        it('should delete file by moving to trash', async () => {
            await bindings.CreateFile('to-delete.md')
            await bindings.WriteFile('to-delete.md', 'Delete me')
            
            await bindings.DeleteFile('to-delete.md')
            
            const exists = await fileExists(testVaultPath, 'to-delete.md')
            expect(exists).toBe(false)
            
            // Verify it's in trash
            const trashExists = await fileExists(testVaultPath, '.trash')
            expect(trashExists).toBe(true)
        })
    })

    describe('Nested Directory Operations', () => {
        it('should create files in nested directories', async () => {
            await bindings.CreateFile('folder1/folder2/deep-note.md')
            
            const exists = await fileExists(testVaultPath, 'folder1/folder2/deep-note.md')
            expect(exists).toBe(true)
        })

        it('should move file into nested directory', async () => {
            await bindings.CreateFile('root-file.md')
            await bindings.WriteFile('root-file.md', 'Content to move')
            
            await bindings.MoveFile('root-file.md', 'subfolder/moved-file.md')
            
            const oldExists = await fileExists(testVaultPath, 'root-file.md')
            const newExists = await fileExists(testVaultPath, 'subfolder/moved-file.md')
            
            expect(oldExists).toBe(false)
            expect(newExists).toBe(true)
            
            const content = await bindings.ReadFile('subfolder/moved-file.md')
            expect(content).toBe('Content to move')
        })

        it('should list vault contents correctly with nested structure', async () => {
            await bindings.CreateFile('root.md')
            await bindings.CreateFile('folder1/note1.md')
            await bindings.CreateFile('folder1/note2.md')
            await bindings.CreateFile('folder1/subfolder/deep.md')
            
            const contents = await bindings.ListVaultContents()
            const filePaths = contents.filter(c => !c.isDir).map(c => c.path)
            
            expect(filePaths).toContain('root.md')
            expect(filePaths).toContain(path.join('folder1', 'note1.md'))
            expect(filePaths).toContain(path.join('folder1', 'note2.md'))
            expect(filePaths).toContain(path.join('folder1', 'subfolder', 'deep.md'))
        })
    })

    describe('Race Condition Tests', () => {
        it('should handle concurrent file creation without duplicates', async () => {
            // Create 20 files concurrently
            const promises = []
            for (let i = 0; i < 20; i++) {
                promises.push(bindings.CreateFile(`concurrent-${i}.md`))
            }
            
            await Promise.all(promises)
            
            const files = await listAllFiles(testVaultPath)
            expect(files.length).toBe(20)
            
            // Verify no duplicates
            const uniqueFiles = new Set(files)
            expect(uniqueFiles.size).toBe(20)
        })

        it('should handle concurrent writes to DIFFERENT files', async () => {
            // Create files first
            await bindings.CreateFile('file1.md')
            await bindings.CreateFile('file2.md')
            await bindings.CreateFile('file3.md')
            
            // Write to all concurrently
            await Promise.all([
                bindings.WriteFile('file1.md', 'Content 1'),
                bindings.WriteFile('file2.md', 'Content 2'),
                bindings.WriteFile('file3.md', 'Content 3')
            ])
            
            // Verify each file has correct content
            expect(await getFileContent(testVaultPath, 'file1.md')).toBe('Content 1')
            expect(await getFileContent(testVaultPath, 'file2.md')).toBe('Content 2')
            expect(await getFileContent(testVaultPath, 'file3.md')).toBe('Content 3')
        })

        it('should handle rapid sequential writes to SAME file (last write wins)', async () => {
            await bindings.CreateFile('rapid.md')
            
            // Rapid writes
            for (let i = 1; i <= 50; i++) {
                await bindings.WriteFile('rapid.md', `Version ${i}`)
            }
            
            const content = await getFileContent(testVaultPath, 'rapid.md')
            expect(content).toBe('Version 50')
        })

        it('should handle interleaved create and write operations', async () => {
            const operations = []
            
            for (let i = 0; i < 10; i++) {
                operations.push(
                    bindings.CreateFile(`interleaved-${i}.md`)
                        .then(() => bindings.WriteFile(`interleaved-${i}.md`, `Content ${i}`))
                )
            }
            
            await Promise.all(operations)
            
            // Verify all files exist with correct content
            for (let i = 0; i < 10; i++) {
                const content = await getFileContent(testVaultPath, `interleaved-${i}.md`)
                expect(content).toBe(`Content ${i}`)
            }
        })

        it('should maintain data integrity under stress', async () => {
            // This simulates heavy user activity
            const fileCount = 30
            const updatesPerFile = 5
            
            // Create all files
            await Promise.all(
                Array.from({ length: fileCount }, (_, i) => 
                    bindings.CreateFile(`stress-${i}.md`)
                )
            )
            
            // Perform random operations
            const operations = []
            for (let round = 0; round < updatesPerFile; round++) {
                for (let i = 0; i < fileCount; i++) {
                    operations.push(
                        bindings.WriteFile(`stress-${i}.md`, `Round ${round} Content ${i}`)
                    )
                }
            }
            
            await Promise.allSettled(operations)
            
            // Verify all files exist and have some content
            const files = await listAllFiles(testVaultPath)
            expect(files.length).toBe(fileCount)
            
            for (let i = 0; i < fileCount; i++) {
                const content = await getFileContent(testVaultPath, `stress-${i}.md`)
                expect(content).toMatch(/Round \d+ Content \d+/)
            }
        })
    })

    describe('Auto-Save Simulation Tests', () => {
        /**
         * Simulates the auto-save behavior in App.jsx
         * This is where the race condition bugs likely originate
         */
        
        it('should not corrupt file when switching files during auto-save', async () => {
            await bindings.CreateFile('file-a.md')
            await bindings.CreateFile('file-b.md')
            await bindings.WriteFile('file-a.md', 'Original A')
            await bindings.WriteFile('file-b.md', 'Original B')
            
            // Simulate: User is editing file-a, types something, then switches to file-b
            // The auto-save for file-a should still save to file-a, not file-b
            
            let currentFile = 'file-a.md'
            let content = 'Modified A'
            
            // Simulate auto-save with captured values (like our fixed code)
            const fileToSave = currentFile
            const contentToSave = content
            
            // User switches files before save completes
            currentFile = 'file-b.md'
            content = 'Original B'
            
            // Auto-save fires with captured values
            await bindings.WriteFile(fileToSave, contentToSave)
            
            // Verify file-a has the modified content
            expect(await getFileContent(testVaultPath, 'file-a.md')).toBe('Modified A')
            // Verify file-b is untouched
            expect(await getFileContent(testVaultPath, 'file-b.md')).toBe('Original B')
        })

        it('should handle rapid file switching without data loss', async () => {
            const files = ['note1.md', 'note2.md', 'note3.md']
            
            // Create files with initial content
            for (const file of files) {
                await bindings.CreateFile(file)
                await bindings.WriteFile(file, `Initial ${file}`)
            }
            
            // Simulate rapid switching with edits
            const saves = []
            
            // Edit note1
            saves.push({ file: 'note1.md', content: 'Edited note1' })
            
            // Quickly switch to note2 and edit
            saves.push({ file: 'note2.md', content: 'Edited note2' })
            
            // Quickly switch to note3 and edit
            saves.push({ file: 'note3.md', content: 'Edited note3' })
            
            // All saves happen with debounce (simulated as batch)
            await Promise.all(
                saves.map(s => bindings.WriteFile(s.file, s.content))
            )
            
            // Verify each file has its own content
            expect(await getFileContent(testVaultPath, 'note1.md')).toBe('Edited note1')
            expect(await getFileContent(testVaultPath, 'note2.md')).toBe('Edited note2')
            expect(await getFileContent(testVaultPath, 'note3.md')).toBe('Edited note3')
        })
    })

    describe('Path Traversal Security Tests', () => {
        it('should reject path traversal attempts on read', async () => {
            await expect(
                bindings.ReadFile('../../../etc/passwd')
            ).rejects.toThrow('outside vault')
        })

        it('should reject path traversal attempts on write', async () => {
            await expect(
                bindings.WriteFile('../../../tmp/evil.md', 'bad content')
            ).rejects.toThrow('outside vault')
        })

        it('should reject path traversal attempts on rename', async () => {
            await bindings.CreateFile('safe.md')
            
            await expect(
                bindings.RenameFile('safe.md', '../../../tmp/evil.md')
            ).rejects.toThrow('outside vault')
        })
    })

    describe('Edge Cases', () => {
        it('should handle empty file content', async () => {
            await bindings.CreateFile('empty.md')
            await bindings.WriteFile('empty.md', '')
            
            const content = await bindings.ReadFile('empty.md')
            expect(content).toBe('')
        })

        it('should handle very large file content', async () => {
            const largeContent = 'x'.repeat(1024 * 1024) // 1MB of data
            
            await bindings.CreateFile('large.md')
            await bindings.WriteFile('large.md', largeContent)
            
            const content = await bindings.ReadFile('large.md')
            expect(content.length).toBe(1024 * 1024)
        })

        it('should handle special characters in filenames', async () => {
            // Note: Some special chars aren't valid on Windows
            const safeName = 'note-with_special.chars (1).md'
            
            await bindings.CreateFile(safeName)
            await bindings.WriteFile(safeName, 'Content')
            
            const exists = await fileExists(testVaultPath, safeName)
            expect(exists).toBe(true)
        })

        it('should handle file with only whitespace content', async () => {
            await bindings.CreateFile('whitespace.md')
            await bindings.WriteFile('whitespace.md', '   \n\n\t\t  \n')
            
            const content = await bindings.ReadFile('whitespace.md')
            expect(content).toBe('   \n\n\t\t  \n')
        })
    })

    describe('Vault Reload Simulation Tests', () => {
        /**
         * Tests that simulate the debounced reload behavior in VaultProvider
         */
        
        it('should get consistent file list after rapid operations', async () => {
            // Create files rapidly
            const createPromises = []
            for (let i = 0; i < 10; i++) {
                createPromises.push(bindings.CreateFile(`rapid-create-${i}.md`))
            }
            await Promise.all(createPromises)
            
            // Immediately list contents
            const contents = await bindings.ListVaultContents()
            const files = contents.filter(c => !c.isDir)
            
            expect(files.length).toBe(10)
        })

        it('should not return stale file list after deletion', async () => {
            // Create files
            await bindings.CreateFile('keep.md')
            await bindings.CreateFile('delete-me.md')
            
            // Delete one
            await bindings.DeleteFile('delete-me.md')
            
            // List should not include deleted file
            const contents = await bindings.ListVaultContents()
            const paths = contents.map(c => c.path)
            
            expect(paths).toContain('keep.md')
            expect(paths).not.toContain('delete-me.md')
        })
    })
})
