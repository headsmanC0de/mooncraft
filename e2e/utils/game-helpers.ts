/**
 * E2E Test Utilities for MoonCraft RTS
 * 
 * Playwright helpers for testing 3D canvas interactions
 * These utilities bridge the gap between Playwright's DOM-based testing
 * and Three.js/React Three Fiber's WebGL canvas.
 */

import { Page, Locator, expect } from '@playwright/test'

// ============================================================================
// Types
// ============================================================================

export interface CanvasPosition {
  x: number
  y: number
}

export interface WorldPosition {
  x: number
  y: number
  z: number
}

export interface SelectionBox {
  start: CanvasPosition
  end: CanvasPosition
}

// ============================================================================
// Canvas Helpers
// ============================================================================

/**
 * Gets the WebGL canvas element
 */
export async function getGameCanvas(page: Page): Promise<Locator> {
  const canvas = page.locator('canvas').first()
  await canvas.waitFor({ state: 'visible', timeout: 10000 })
  return canvas
}

/**
 * Gets canvas dimensions for coordinate calculations
 */
export async function getCanvasDimensions(page: Page): Promise<{
  width: number
  height: number
  x: number
  y: number
}> {
  const canvas = await getGameCanvas(page)
  const box = await canvas.boundingBox()
  
  if (!box) {
    throw new Error('Canvas not found or not visible')
  }
  
  return {
    width: box.width,
    height: box.height,
    x: box.x,
    y: box.y,
  }
}

/**
 * Waits for the game to be fully loaded
 */
export async function waitForGameReady(page: Page): Promise<void> {
  // Wait for canvas to be visible
  const canvas = await getGameCanvas(page)
  
  // Wait for initial render (give WebGL time to initialize)
  await page.waitForTimeout(1000)
  
  // Check that the canvas has rendered something
  await expect(canvas).toBeVisible()
}

// ============================================================================
// Mouse Interactions
// ============================================================================

/**
 * Clicks on the canvas at a specific position
 */
export async function clickOnCanvas(
  page: Page,
  position: CanvasPosition
): Promise<void> {
  const dims = await getCanvasDimensions(page)
  
  await page.mouse.click(
    dims.x + position.x,
    dims.y + position.y
  )
}

/**
 * Performs a drag selection on the canvas
 */
export async function dragSelect(
  page: Page,
  box: SelectionBox
): Promise<void> {
  const dims = await getCanvasDimensions(page)
  
  // Move to start position
  await page.mouse.move(
    dims.x + box.start.x,
    dims.y + box.start.y
  )
  
  // Mouse down
  await page.mouse.down()
  
  // Move to end position (drag)
  await page.mouse.move(
    dims.x + box.end.x,
    dims.y + box.end.y,
    { steps: 10 } // Smooth drag for better detection
  )
  
  // Mouse up
  await page.mouse.up()
}

/**
 * Right-clicks on the canvas (for context menu / move commands)
 */
export async function rightClickOnCanvas(
  page: Page,
  position: CanvasPosition
): Promise<void> {
  const dims = await getCanvasDimensions(page)
  
  await page.mouse.click(
    dims.x + position.x,
    dims.y + position.y,
    { button: 'right' }
  )
}

/**
 * Shift-click for additive selection
 */
export async function shiftClickOnCanvas(
  page: Page,
  position: CanvasPosition
): Promise<void> {
  const dims = await getCanvasDimensions(page)
  
  await page.keyboard.down('Shift')
  await page.mouse.click(
    dims.x + position.x,
    dims.y + position.y
  )
  await page.keyboard.up('Shift')
}

/**
 * Shift-drag for additive selection
 */
export async function shiftDragSelect(
  page: Page,
  box: SelectionBox
): Promise<void> {
  await page.keyboard.down('Shift')
  await dragSelect(page, box)
  await page.keyboard.up('Shift')
}

// ============================================================================
// Camera Controls
// ============================================================================

/**
 * Pans the camera using WASD keys
 */
export async function panCamera(
  page: Page,
  direction: 'up' | 'down' | 'left' | 'right',
  duration = 500
): Promise<void> {
  const keyMap = {
    up: 'w',
    down: 's',
    left: 'a',
    right: 'd',
  }
  
  await page.keyboard.down(keyMap[direction])
  await page.waitForTimeout(duration)
  await page.keyboard.up(keyMap[direction])
}

/**
 * Zooms the camera using mouse wheel
 */
export async function zoomCamera(
  page: Page,
  direction: 'in' | 'out',
  amount = 100
): Promise<void> {
  const canvas = await getGameCanvas(page)
  const box = await canvas.boundingBox()
  
  if (!box) return
  
  const centerX = box.x + box.width / 2
  const centerY = box.y + box.height / 2
  
  await page.mouse.move(centerX, centerY)
  await page.mouse.wheel(
    direction === 'in' ? -amount : amount,
    0
  )
}

// ============================================================================
// Game State Inspection
// ============================================================================

/**
 * Evaluates JavaScript in the browser context to get game state
 */
export async function getGameState<T>(
  page: Page,
  selector: string
): Promise<T | null> {
  return page.evaluate((sel) => {
    // Access the Zustand store from window
    const store = (window as any).__MOONCRAFT_STORE__
    if (!store) return null
    
    const state = store.getState()
    return sel.split('.').reduce((obj: any, key) => obj?.[key], state)
  }, selector)
}

/**
 * Sets up the game store on window for E2E testing
 * Call this in the game's initialization
 */
export function exposeStoreForTesting(store: any): void {
  if (typeof window !== 'undefined') {
    (window as any).__MOONCRAFT_STORE__ = store
  }
}

/**
 * Gets selected unit IDs
 */
export async function getSelectedUnits(page: Page): Promise<string[]> {
  return getGameState<string[]>(page, 'selectedUnits') ?? []
}

/**
 * Checks if game is paused
 */
export async function isGamePaused(page: Page): Promise<boolean> {
  return getGameState<boolean>(page, 'isPaused') ?? true
}

/**
 * Gets current tick
 */
export async function getGameTick(page: Page): Promise<number> {
  return getGameState<number>(page, 'tick') ?? 0
}

// ============================================================================
// Visual Testing
// ============================================================================

/**
 * Takes a screenshot of the game canvas
 */
export async function captureGameScreenshot(
  page: Page,
  name: string
): Promise<Buffer> {
  const canvas = await getGameCanvas(page)
  return canvas.screenshot() as Promise<Buffer>
}

/**
 * Compares current canvas with a baseline
 */
export async function compareCanvasSnapshot(
  page: Page,
  name: string,
  threshold = 0.1
): Promise<void> {
  const canvas = await getGameCanvas(page)
  await expect(canvas).toHaveScreenshot(`${name}.png`, {
    maxDiffPixels: Math.round(800 * 600 * threshold),
  })
}

// ============================================================================
// Performance Testing
// ============================================================================

/**
 * Measures FPS during gameplay
 */
export async function measureFPS(
  page: Page,
  duration = 5000
): Promise<{ avg: number; min: number; max: number }> {
  return page.evaluate(async (ms) => {
    return new Promise((resolve) => {
      const frames: number[] = []
      let lastTime = performance.now()
      
      function measure() {
        const now = performance.now()
        const delta = now - lastTime
        lastTime = now
        
        if (delta > 0) {
          frames.push(1000 / delta)
        }
        
        if (frames.length < ms / 16) {
          requestAnimationFrame(measure)
        } else {
          resolve({
            avg: frames.reduce((a, b) => a + b, 0) / frames.length,
            min: Math.min(...frames),
            max: Math.max(...frames),
          })
        }
      }
      
      requestAnimationFrame(measure)
    })
  }, duration)
}

/**
 * Checks WebGL capabilities
 */
export async function getWebGLInfo(page: Page): Promise<{
  vendor: string
  renderer: string
  version: string
}> {
  return page.evaluate(() => {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
    
    if (!gl) {
      return { vendor: 'N/A', renderer: 'N/A', version: 'N/A' }
    }
    
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
    
    return {
      vendor: debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : 'unknown',
      renderer: debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : 'unknown',
      version: gl.getParameter(gl.VERSION),
    }
  })
}

// ============================================================================
// Test Flow Helpers
// ============================================================================

/**
 * Complete test flow: navigate to game and wait for ready
 */
export async function setupGameTest(page: Page): Promise<void> {
  await page.goto('/game')
  await waitForGameReady(page)
}

/**
 * Selects units by dragging a selection box
 */
export async function selectUnitsByDrag(
  page: Page,
  box: SelectionBox,
  additive = false
): Promise<void> {
  if (additive) {
    await shiftDragSelect(page, box)
  } else {
    await dragSelect(page, box)
  }
  
  // Wait for selection to process
  await page.waitForTimeout(100)
}

/**
 * Issues a move command to selected units
 */
export async function issueMoveCommand(
  page: Page,
  position: CanvasPosition
): Promise<void> {
  await rightClickOnCanvas(page, position)
  await page.waitForTimeout(100)
}
