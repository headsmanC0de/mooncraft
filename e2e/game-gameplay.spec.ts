import { expect, test } from '@playwright/test'

test.describe('Game Gameplay', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/game')
		await page.waitForTimeout(4000)
	})

	test('should show initial resources in HUD', async ({ page }) => {
		// Check minerals shown
		await expect(page.getByText('500')).toBeVisible()
		// Check supply shown (10/50 or similar format)
		await expect(page.getByText(/\d+\/\d+/)).toBeVisible()
	})

	test('should update game time', async ({ page }) => {
		// Get initial tick count via exposed game store
		const initialTick = await page.evaluate(() => {
			const store = (window as any).__gameStore
			return store ? store.getState().currentTick : 0
		})

		// Wait for game ticks to advance
		await page.waitForTimeout(3000)

		// Tick count should have increased
		const updatedTick = await page.evaluate(() => {
			const store = (window as any).__gameStore
			return store ? store.getState().currentTick : 0
		})

		expect(updatedTick).toBeGreaterThan(initialTick)
	})

	test('should run for 10 seconds without crash', async ({ page }) => {
		const errors: string[] = []
		page.on('console', (msg) => {
			if (msg.type() === 'error') {
				const text = msg.text()
				if (!text.includes('THREE.') && !text.includes('WebGL') && !text.includes('deprecated')) {
					errors.push(text)
				}
			}
		})

		// Let game run for 10 seconds (AI should be making decisions)
		await page.waitForTimeout(10000)

		// No crashes
		const canvas = page.locator('canvas').first()
		await expect(canvas).toBeVisible()

		// No real errors
		expect(errors).toHaveLength(0)
	})

	test('should have working minimap', async ({ page }) => {
		// Minimap is a separate canvas
		const canvases = page.locator('canvas')
		const count = await canvases.count()
		expect(count).toBeGreaterThanOrEqual(2)
	})
})
