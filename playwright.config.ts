import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright Configuration for MoonCraft RTS
 * 
 * E2E testing for React Three Fiber / Three.js application
 * 
 * Key considerations for 3D/WebGL testing:
 * - Use headed mode for WebKit (no GPU in headless)
 * - Enable hardware acceleration where possible
 * - Use slower timeouts for 3D rendering
 * - Test canvas interactions via coordinate-based clicks
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results/results.json' }],
  ],
  
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    // Longer timeout for 3D rendering
    actionTimeout: 10000,
    navigationTimeout: 30000,
  },

  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // Enable WebGL hardware acceleration
        launchOptions: {
          args: [
            '--use-gl=egl',           // Use EGL for WebGL
            '--use-angle=gl',         // Use OpenGL ANGLE backend
            '--enable-webgl',         // Ensure WebGL is enabled
            '--ignore-gpu-blocklist', // Ignore GPU blocklist
          ],
        },
      },
    },
    {
      name: 'firefox',
      use: { 
        ...devices['Desktop Firefox'],
        // Firefox has better WebGL support in headless
      },
    },
    {
      name: 'webkit',
      use: { 
        ...devices['Desktop Safari'],
        // WebKit requires headed mode for GPU
        headless: false,
      },
    },
    // Mobile testing (optional - 3D games may not support mobile)
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
  ],

  // Run local dev server before tests
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
})
