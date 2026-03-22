import { expect, test } from '@playwright/test'

test.describe('Game Page', () => {
	test('should load game page with 3D canvas', async ({ page }) => {
		await page.goto('/game')

		// Canvas should be present (Three.js renders into a canvas)
		const canvas = page.locator('canvas')
		await expect(canvas.first()).toBeVisible({ timeout: 10000 })
	})

	test('should display HUD with resources', async ({ page }) => {
		await page.goto('/game')
		await page.waitForTimeout(3000) // Wait for game to initialize

		// Resource bar should show minerals
		await expect(page.getByText('500')).toBeVisible({ timeout: 5000 })
	})

	test('should have no console errors', async ({ page }) => {
		const errors: string[] = []
		page.on('console', (msg) => {
			if (msg.type() === 'error') {
				errors.push(msg.text())
			}
		})

		await page.goto('/game')
		await page.waitForTimeout(5000) // Let game run for 5 seconds

		// Filter out known acceptable warnings (WebGL, Three.js deprecation notices)
		const realErrors = errors.filter(
			(e) => !e.includes('THREE.') && !e.includes('WebGL') && !e.includes('deprecated'),
		)

		expect(realErrors).toHaveLength(0)
	})

	test('should display minimap', async ({ page }) => {
		await page.goto('/game')
		await page.waitForTimeout(3000)

		// Minimap canvas should exist (it's a separate canvas element)
		const canvases = page.locator('canvas')
		// Should have at least 2 canvases (Three.js + minimap)
		await expect(canvases).toHaveCount(2, { timeout: 5000 })
	})
})
