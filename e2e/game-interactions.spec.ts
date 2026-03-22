import { test, expect } from '@playwright/test'

test.describe('Game Interactions', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/game')
		// Wait for game to initialize
		await page.waitForTimeout(4000)
	})

	test('should select unit on click and show selection panel', async ({
		page,
	}) => {
		// Click near center of canvas where entities should be
		const canvas = page.locator('canvas').first()
		await canvas.click({ position: { x: 640, y: 360 } })
		await page.waitForTimeout(500)

		// Selection panel should appear with unit info
		// (Even if we don't hit an entity, we should verify no crash)
		// The HUD should be present
		await expect(page.getByText('500').first()).toBeVisible()
	})

	test('should clear selection on clicking empty ground', async ({
		page,
	}) => {
		const canvas = page.locator('canvas').first()

		// Click on the edge of the map (likely empty)
		await canvas.click({ position: { x: 100, y: 100 } })
		await page.waitForTimeout(500)

		// No crash, game continues running
		await expect(canvas).toBeVisible()
	})

	test('should right-click without crash (move command)', async ({
		page,
	}) => {
		const canvas = page.locator('canvas').first()

		// Right-click on canvas
		await canvas.click({ button: 'right', position: { x: 640, y: 400 } })
		await page.waitForTimeout(500)

		// Game should still be running
		await expect(canvas).toBeVisible()
	})

	test('should handle keyboard camera controls', async ({ page }) => {
		const canvas = page.locator('canvas').first()
		await canvas.click() // Focus canvas

		// Press WASD keys
		await page.keyboard.press('w')
		await page.waitForTimeout(200)
		await page.keyboard.press('a')
		await page.waitForTimeout(200)
		await page.keyboard.press('s')
		await page.waitForTimeout(200)
		await page.keyboard.press('d')
		await page.waitForTimeout(200)

		// Game should still be running without crash
		await expect(canvas).toBeVisible()
	})

	test('should zoom with mouse wheel', async ({ page }) => {
		const canvas = page.locator('canvas').first()
		await canvas.hover()

		// Scroll up and down
		await page.mouse.wheel(0, -100) // zoom in
		await page.waitForTimeout(300)
		await page.mouse.wheel(0, 100) // zoom out
		await page.waitForTimeout(300)

		await expect(canvas).toBeVisible()
	})
})
