import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright E2E Test Configuration for chalk.md
 * 
 * These tests run against the actual Wails application to verify
 * real-world behavior including filesystem operations.
 * 
 * Usage:
 *   npm run test:e2e          - Run all E2E tests
 *   npm run test:e2e:ui       - Run with Playwright UI
 *   npm run test:e2e:headed   - Run with visible browser
 */

export default defineConfig({
    testDir: './src/tests/e2e',
    
    // Run tests sequentially to avoid filesystem conflicts
    fullyParallel: false,
    workers: 1,
    
    // Fail the build on CI if you accidentally left test.only in the source code
    forbidOnly: !!process.env.CI,
    
    // Retry failed tests on CI
    retries: process.env.CI ? 2 : 0,
    
    // Reporter configuration
    reporter: [
        ['html', { outputFolder: 'playwright-report' }],
        ['list']
    ],
    
    // Timeout for each test
    timeout: 60000,
    
    // Global test options
    use: {
        // Base URL for the application
        // When running wails dev, the app runs on localhost:34115
        baseURL: 'http://localhost:34115',
        
        // Collect trace when retrying the failed test
        trace: 'on-first-retry',
        
        // Take screenshot on failure
        screenshot: 'only-on-failure',
        
        // Video recording for debugging
        video: 'retain-on-failure',
    },
    
    // Configure projects for different scenarios
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
        // Wails apps are essentially Chromium, so we focus on Chromium
        // Add more browsers if needed for web-based testing
    ],
    
    // Web server configuration - starts the Wails dev server
    // Note: For actual Wails testing, you may need to run `wails dev` separately
    // and use webServer: null, or use a custom setup
    webServer: {
        command: 'cd .. && wails dev',
        url: 'http://localhost:34115',
        reuseExistingServer: !process.env.CI,
        timeout: 120000, // Wails dev can take a while to start
    },
    
    // Output directory for test artifacts
    outputDir: 'test-results',
})
