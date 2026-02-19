/**
 * MoonCraft E2E Tests - Game Scene
 * 
 * Tests the core game functionality including:
 * - Game initialization
 * - Canvas rendering
 * - Selection mechanics
 * - Camera controls
 */

import { test, expect } from '@playwright/test'
import {
  setupGameTest,
  getCanvasDimensions,
  dragSelect,
  clickOnCanvas,
  rightClickOnCanvas,
  panCamera,
  zoomCamera,
  getSelectedUnits,
  measureFPS,
  getWebGLInfo,
  type SelectionBox,
} from './utils/game-helpers'

test.describe('Game Scene', () => {
  test.beforeEach(async ({ page }) => {
    await setupGameTest(page)
  })

  test('should render the game canvas', async ({ page }) => {
    const canvas = page.locator('canvas').first()
    await expect(canvas).toBeVisible()
    
    const dims = await getCanvasDimensions(page)
    expect(dims.width).toBeGreaterThan(0)
    expect(dims.height).toBeGreaterThan(0)
  })

  test('should have WebGL context', async ({ page }) => {
    const glInfo = await getWebGLInfo(page)
    
    // Should have some WebGL info
    expect(glInfo.version).not.toBe('N/A')
  })

  test('should maintain acceptable FPS', async ({ page }) => {
    // Wait for initial render
    await page.waitForTimeout(2000)
    
    const fps = await measureFPS(page, 3000)
    
    // Should maintain at least 30 FPS
    expect(fps.avg).toBeGreaterThan(30)
    console.log(`FPS: avg=${fps.avg.toFixed(1)}, min=${fps.min.toFixed(1)}, max=${fps.max.toFixed(1)}`)
  })
})

test.describe('Selection Mechanics', () => {
  test.beforeEach(async ({ page }) => {
    await setupGameTest(page)
  })

  test('should start with no units selected', async ({ page }) => {
    const selected = await getSelectedUnits(page)
    expect(selected).toHaveLength(0)
  })

  test('should perform drag selection without errors', async ({ page }) => {
    const dims = await getCanvasDimensions(page)
    
    // Perform a selection drag in the center of the screen
    const box: SelectionBox = {
      start: { x: dims.width * 0.3, y: dims.height * 0.3 },
      end: { x: dims.width * 0.7, y: dims.height * 0.7 },
    }
    
    await dragSelect(page, box)
    
    // Should complete without errors
    await page.waitForTimeout(500)
  })

  test('should handle click without selection', async ({ page }) => {
    const dims = await getCanvasDimensions(page)
    
    // Click in center
    await clickOnCanvas(page, { 
      x: dims.width / 2, 
      y: dims.height / 2 
    })
    
    // Should complete without errors
    await page.waitForTimeout(100)
  })

  test('should handle right-click (move command)', async ({ page }) => {
    const dims = await getCanvasDimensions(page)
    
    // Right-click in center
    await rightClickOnCanvas(page, { 
      x: dims.width / 2, 
      y: dims.height / 2 
    })
    
    // Should complete without errors
    await page.waitForTimeout(100)
  })
})

test.describe('Camera Controls', () => {
  test.beforeEach(async ({ page }) => {
    await setupGameTest(page)
  })

  test('should pan camera with WASD keys', async ({ page }) => {
    // Pan camera in each direction
    await panCamera(page, 'up', 300)
    await panCamera(page, 'down', 300)
    await panCamera(page, 'left', 300)
    await panCamera(page, 'right', 300)
    
    // Should complete without errors
    await page.waitForTimeout(100)
  })

  test('should zoom camera with mouse wheel', async ({ page }) => {
    // Zoom in and out
    await zoomCamera(page, 'in')
    await zoomCamera(page, 'out')
    
    // Should complete without errors
    await page.waitForTimeout(100)
  })

  test('should handle arrow keys for camera movement', async ({ page }) => {
    await page.keyboard.down('ArrowUp')
    await page.waitForTimeout(300)
    await page.keyboard.up('ArrowUp')
    
    await page.keyboard.down('ArrowDown')
    await page.waitForTimeout(300)
    await page.keyboard.up('ArrowDown')
    
    // Should complete without errors
  })
})

test.describe('Performance', () => {
  test('should render within acceptable time', async ({ page }) => {
    const startTime = Date.now()
    
    await page.goto('/game')
    await page.locator('canvas').first().waitFor({ state: 'visible' })
    
    const loadTime = Date.now() - startTime
    
    // Should load within 5 seconds
    expect(loadTime).toBeLessThan(5000)
    console.log(`Game load time: ${loadTime}ms`)
  })

  test('should handle rapid interactions', async ({ page }) => {
    await setupGameTest(page)
    
    const dims = await getCanvasDimensions(page)
    
    // Rapid clicks
    for (let i = 0; i < 10; i++) {
      await clickOnCanvas(page, {
        x: dims.width * (0.3 + Math.random() * 0.4),
        y: dims.height * (0.3 + Math.random() * 0.4),
      })
    }
    
    // Should complete without errors
    await page.waitForTimeout(100)
  })
})
