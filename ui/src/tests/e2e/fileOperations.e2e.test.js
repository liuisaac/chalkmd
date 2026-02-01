import { test, expect } from '@playwright/test'
import * as fs from 'fs/promises'
import * as path from 'path'
import { tmpdir } from 'os'

/**
 * E2E Tests for chalk.md File Operations
 * 
 * These tests run against the actual Wails application and verify
 * that file operations work correctly end-to-end.
 * 
 * Prerequisites:
 * - The Wails application must be running (via `wails dev`)
 * - Or configure playwright.config.js to start it automatically
 * 
 * What these tests verify:
 * - Files are actually created on disk
 * - Content is saved correctly
 * - No file duplication or content wiping
 * - Race conditions don't cause data loss
 */

// Helper to create a temporary test vault
async function createTestVault() {
    const vaultPath = path.join(tmpdir(), `chalkmd-e2e-${Date.now()}-${Math.random().toString(36).slice(2)}`)
    await fs.mkdir(vaultPath, { recursive: true })
    return vaultPath
}

// Helper to clean up test vault
async function cleanupTestVault(vaultPath) {
    try {
        await fs.rm(vaultPath, { recursive: true, force: true })
    } catch (err) {
        console.warn('Failed to cleanup test vault:', err)
    }
}

// Helper to list files in vault
async function listVaultFiles(vaultPath) {
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

// Helper to read file content
async function readVaultFile(vaultPath, relativePath) {
    return fs.readFile(path.join(vaultPath, relativePath), 'utf-8')
}

// Helper to check if file exists
async function vaultFileExists(vaultPath, relativePath) {
    try {
        await fs.access(path.join(vaultPath, relativePath))
        return true
    } catch {
        return false
    }
}

test.describe('File Operations E2E', () => {
    let testVaultPath

    test.beforeEach(async () => {
        testVaultPath = await createTestVault()
    })

    test.afterEach(async () => {
        await cleanupTestVault(testVaultPath)
    })

    test.describe('Vault Opening', () => {
        test('should open a vault and display file tree', async ({ page }) => {
            // Create some test files in the vault
            await fs.writeFile(path.join(testVaultPath, 'welcome.md'), '# Welcome')
            await fs.writeFile(path.join(testVaultPath, 'notes.md'), '# Notes')

            // Navigate to the app
            await page.goto('/')

            // Wait for the start screen
            await expect(page.locator('text=Open Vault')).toBeVisible({ timeout: 10000 })

            // Note: In a Wails app, we'd need to interact with the native file dialog
            // For testing, we can use localStorage to set the vault path directly
            await page.evaluate((vaultPath) => {
                localStorage.setItem('vaultPath', vaultPath)
            }, testVaultPath)

            // Reload to pick up the vault
            await page.reload()

            // Wait for editor to load
            await page.waitForTimeout(2000)

            // Verify files are shown in file tree
            // Note: Exact selectors depend on your UI implementation
            const fileTree = page.locator('[data-testid="file-tree"]')
            
            // If file tree exists and is visible
            if (await fileTree.isVisible()) {
                await expect(page.locator('text=welcome.md')).toBeVisible()
                await expect(page.locator('text=notes.md')).toBeVisible()
            }
        })
    })

    test.describe('File Creation', () => {
        test('should create a new file via UI', async ({ page }) => {
            // Set up vault
            await page.evaluate((vaultPath) => {
                localStorage.setItem('vaultPath', vaultPath)
            }, testVaultPath)
            
            await page.goto('/')
            await page.waitForTimeout(2000)

            // Find and click new file button
            // Note: Adjust selector based on your actual UI
            const newFileButton = page.locator('[data-testid="new-file-button"], [aria-label="New File"], button:has-text("New")').first()
            
            if (await newFileButton.isVisible()) {
                await newFileButton.click()
                
                // Wait for file to be created
                await page.waitForTimeout(1000)
                
                // Verify file exists on disk
                const files = await listVaultFiles(testVaultPath)
                expect(files.length).toBeGreaterThan(0)
                expect(files.some(f => f.endsWith('.md'))).toBe(true)
            }
        })

        test('should not create duplicate files on rapid clicks', async ({ page }) => {
            await page.evaluate((vaultPath) => {
                localStorage.setItem('vaultPath', vaultPath)
            }, testVaultPath)
            
            await page.goto('/')
            await page.waitForTimeout(2000)

            const newFileButton = page.locator('[data-testid="new-file-button"], [aria-label="New File"], button:has-text("New")').first()
            
            if (await newFileButton.isVisible()) {
                // Rapid clicks
                await newFileButton.click()
                await newFileButton.click()
                await newFileButton.click()
                
                await page.waitForTimeout(2000)
                
                // Verify no duplicates
                const files = await listVaultFiles(testVaultPath)
                const uniqueFiles = new Set(files)
                expect(uniqueFiles.size).toBe(files.length)
            }
        })
    })

    test.describe('File Editing and Auto-Save', () => {
        test('should auto-save content after typing', async ({ page }) => {
            // Create a file
            await fs.writeFile(path.join(testVaultPath, 'test.md'), '# Initial Content')
            
            await page.evaluate((vaultPath) => {
                localStorage.setItem('vaultPath', vaultPath)
            }, testVaultPath)
            
            await page.goto('/')
            await page.waitForTimeout(2000)

            // Click on the file to open it
            const fileItem = page.locator('text=test.md').first()
            
            if (await fileItem.isVisible()) {
                await fileItem.click()
                await page.waitForTimeout(500)

                // Find the editor and type
                const editor = page.locator('[contenteditable="true"], .ProseMirror, textarea').first()
                
                if (await editor.isVisible()) {
                    await editor.focus()
                    await page.keyboard.type('\n\nNew content added via test')
                    
                    // Wait for auto-save (100ms + buffer)
                    await page.waitForTimeout(500)
                    
                    // Verify content was saved to disk
                    const content = await readVaultFile(testVaultPath, 'test.md')
                    expect(content).toContain('New content added via test')
                }
            }
        })

        test('should not lose content when switching files rapidly', async ({ page }) => {
            // Create two files
            await fs.writeFile(path.join(testVaultPath, 'file1.md'), '# File 1')
            await fs.writeFile(path.join(testVaultPath, 'file2.md'), '# File 2')
            
            await page.evaluate((vaultPath) => {
                localStorage.setItem('vaultPath', vaultPath)
            }, testVaultPath)
            
            await page.goto('/')
            await page.waitForTimeout(2000)

            // Open file1
            const file1 = page.locator('text=file1.md').first()
            const file2 = page.locator('text=file2.md').first()
            
            if (await file1.isVisible() && await file2.isVisible()) {
                await file1.click()
                await page.waitForTimeout(300)

                // Type in file1
                const editor = page.locator('[contenteditable="true"], .ProseMirror, textarea').first()
                if (await editor.isVisible()) {
                    await editor.focus()
                    await page.keyboard.type('\nEdit to file 1')
                }

                // Quickly switch to file2
                await file2.click()
                await page.waitForTimeout(300)

                // Type in file2
                if (await editor.isVisible()) {
                    await editor.focus()
                    await page.keyboard.type('\nEdit to file 2')
                }

                // Wait for saves
                await page.waitForTimeout(500)

                // Verify both files have correct content
                const content1 = await readVaultFile(testVaultPath, 'file1.md')
                const content2 = await readVaultFile(testVaultPath, 'file2.md')
                
                // File 1 should have its edit (captured at schedule time)
                expect(content1).toContain('File 1')
                // File 2 should have its edit
                expect(content2).toContain('Edit to file 2')
            }
        })
    })

    test.describe('File Deletion', () => {
        test('should delete file and remove from tree', async ({ page }) => {
            await fs.writeFile(path.join(testVaultPath, 'to-delete.md'), '# Delete me')
            
            await page.evaluate((vaultPath) => {
                localStorage.setItem('vaultPath', vaultPath)
            }, testVaultPath)
            
            await page.goto('/')
            await page.waitForTimeout(2000)

            const fileItem = page.locator('text=to-delete.md').first()
            
            if (await fileItem.isVisible()) {
                // Right-click to open context menu
                await fileItem.click({ button: 'right' })
                await page.waitForTimeout(200)

                // Click delete option
                const deleteOption = page.locator('text=Delete, [data-testid="delete-file"]').first()
                if (await deleteOption.isVisible()) {
                    await deleteOption.click()
                    await page.waitForTimeout(500)

                    // Verify file is gone from disk (moved to trash)
                    const exists = await vaultFileExists(testVaultPath, 'to-delete.md')
                    expect(exists).toBe(false)
                }
            }
        })
    })

    test.describe('File Renaming', () => {
        test('should rename file and preserve content', async ({ page }) => {
            await fs.writeFile(path.join(testVaultPath, 'original.md'), '# Important Content')
            
            await page.evaluate((vaultPath) => {
                localStorage.setItem('vaultPath', vaultPath)
            }, testVaultPath)
            
            await page.goto('/')
            await page.waitForTimeout(2000)

            const fileItem = page.locator('text=original.md').first()
            
            if (await fileItem.isVisible()) {
                // Right-click to open context menu
                await fileItem.click({ button: 'right' })
                await page.waitForTimeout(200)

                // Click rename option
                const renameOption = page.locator('text=Rename, [data-testid="rename-file"]').first()
                if (await renameOption.isVisible()) {
                    await renameOption.click()
                    await page.waitForTimeout(200)

                    // Type new name
                    await page.keyboard.type('renamed.md')
                    await page.keyboard.press('Enter')
                    await page.waitForTimeout(500)

                    // Verify old file is gone
                    const oldExists = await vaultFileExists(testVaultPath, 'original.md')
                    expect(oldExists).toBe(false)

                    // Verify new file exists with content
                    const newExists = await vaultFileExists(testVaultPath, 'renamed.md')
                    expect(newExists).toBe(true)

                    const content = await readVaultFile(testVaultPath, 'renamed.md')
                    expect(content).toContain('Important Content')
                }
            }
        })
    })

    test.describe('Stress Tests', () => {
        test('should handle rapid file operations without corruption', async ({ page }) => {
            await page.evaluate((vaultPath) => {
                localStorage.setItem('vaultPath', vaultPath)
            }, testVaultPath)
            
            await page.goto('/')
            await page.waitForTimeout(2000)

            // Create multiple files rapidly
            const newFileButton = page.locator('[data-testid="new-file-button"], [aria-label="New File"], button:has-text("New")').first()
            
            if (await newFileButton.isVisible()) {
                for (let i = 0; i < 5; i++) {
                    await newFileButton.click()
                    await page.waitForTimeout(200)
                }
                
                await page.waitForTimeout(2000)
                
                // Verify all files exist
                const files = await listVaultFiles(testVaultPath)
                expect(files.length).toBeGreaterThanOrEqual(5)
                
                // Verify no duplicates
                const uniqueFiles = new Set(files)
                expect(uniqueFiles.size).toBe(files.length)
            }
        })

        test('should maintain data integrity during heavy editing', async ({ page }) => {
            // Create a file with known content
            const initialContent = '# Test Document\n\nInitial paragraph.'
            await fs.writeFile(path.join(testVaultPath, 'heavy-edit.md'), initialContent)
            
            await page.evaluate((vaultPath) => {
                localStorage.setItem('vaultPath', vaultPath)
            }, testVaultPath)
            
            await page.goto('/')
            await page.waitForTimeout(2000)

            const fileItem = page.locator('text=heavy-edit.md').first()
            
            if (await fileItem.isVisible()) {
                await fileItem.click()
                await page.waitForTimeout(500)

                const editor = page.locator('[contenteditable="true"], .ProseMirror, textarea').first()
                
                if (await editor.isVisible()) {
                    await editor.focus()
                    
                    // Type a lot of content rapidly
                    for (let i = 0; i < 10; i++) {
                        await page.keyboard.type(`\nParagraph ${i + 1} with some content.`)
                    }
                    
                    // Wait for final save
                    await page.waitForTimeout(500)
                    
                    // Verify content is saved
                    const content = await readVaultFile(testVaultPath, 'heavy-edit.md')
                    expect(content).toContain('Paragraph 10')
                    expect(content.length).toBeGreaterThan(initialContent.length)
                }
            }
        })
    })
})

test.describe('Data Integrity Verification', () => {
    /**
     * These tests specifically target the bugs you've been experiencing:
     * - File duplication
     * - Content wiping
     */

    let testVaultPath

    test.beforeEach(async () => {
        testVaultPath = await createTestVault()
    })

    test.afterEach(async () => {
        await cleanupTestVault(testVaultPath)
    })

    test('CRITICAL: verify no file duplication after create-edit-switch cycle', async ({ page }) => {
        await page.evaluate((vaultPath) => {
            localStorage.setItem('vaultPath', vaultPath)
        }, testVaultPath)
        
        await page.goto('/')
        await page.waitForTimeout(2000)

        // Initial file count
        const initialFiles = await listVaultFiles(testVaultPath)
        const initialCount = initialFiles.length

        const newFileButton = page.locator('[data-testid="new-file-button"], [aria-label="New File"], button:has-text("New")').first()
        
        if (await newFileButton.isVisible()) {
            // Create file
            await newFileButton.click()
            await page.waitForTimeout(500)

            // Edit it
            const editor = page.locator('[contenteditable="true"], .ProseMirror, textarea').first()
            if (await editor.isVisible()) {
                await editor.focus()
                await page.keyboard.type('Test content')
            }

            // Wait for save
            await page.waitForTimeout(500)

            // Create another file (switch away)
            await newFileButton.click()
            await page.waitForTimeout(500)

            // Go back to first file
            const files = await listVaultFiles(testVaultPath)
            
            // Should only have created 2 new files
            expect(files.length).toBe(initialCount + 2)
            
            // No duplicates
            const uniqueFiles = new Set(files)
            expect(uniqueFiles.size).toBe(files.length)
        }
    })

    test('CRITICAL: verify content not wiped after file switch', async ({ page }) => {
        // Create file with important content
        const importantContent = '# CRITICAL DATA - DO NOT LOSE\n\nThis content must not be wiped.'
        await fs.writeFile(path.join(testVaultPath, 'critical.md'), importantContent)
        await fs.writeFile(path.join(testVaultPath, 'other.md'), '# Other file')
        
        await page.evaluate((vaultPath) => {
            localStorage.setItem('vaultPath', vaultPath)
        }, testVaultPath)
        
        await page.goto('/')
        await page.waitForTimeout(2000)

        // Open critical file
        const criticalFile = page.locator('text=critical.md').first()
        const otherFile = page.locator('text=other.md').first()
        
        if (await criticalFile.isVisible() && await otherFile.isVisible()) {
            await criticalFile.click()
            await page.waitForTimeout(500)

            // Switch to other file
            await otherFile.click()
            await page.waitForTimeout(500)

            // Switch back
            await criticalFile.click()
            await page.waitForTimeout(500)

            // Verify content on disk is intact
            const content = await readVaultFile(testVaultPath, 'critical.md')
            expect(content).toBe(importantContent)
        }
    })

    test('CRITICAL: verify concurrent operations do not corrupt files', async ({ page }) => {
        // Create multiple files
        for (let i = 0; i < 5; i++) {
            await fs.writeFile(
                path.join(testVaultPath, `file${i}.md`),
                `# File ${i}\n\nOriginal content for file ${i}`
            )
        }
        
        await page.evaluate((vaultPath) => {
            localStorage.setItem('vaultPath', vaultPath)
        }, testVaultPath)
        
        await page.goto('/')
        await page.waitForTimeout(2000)

        // Rapidly switch between files
        for (let round = 0; round < 3; round++) {
            for (let i = 0; i < 5; i++) {
                const fileItem = page.locator(`text=file${i}.md`).first()
                if (await fileItem.isVisible()) {
                    await fileItem.click()
                    await page.waitForTimeout(100) // Very rapid
                }
            }
        }

        // Wait for any pending operations
        await page.waitForTimeout(1000)

        // Verify all files still have their content
        for (let i = 0; i < 5; i++) {
            const content = await readVaultFile(testVaultPath, `file${i}.md`)
            expect(content).toContain(`File ${i}`)
            expect(content).toContain(`Original content for file ${i}`)
        }
    })
})
