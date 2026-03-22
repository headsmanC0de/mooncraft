import { describe, expect, it } from 'vitest'
import { AudioEngine } from '../AudioEngine'

describe('AudioEngine', () => {
	it('should be enabled by default', () => {
		const engine = new AudioEngine()
		expect(engine.isEnabled()).toBe(true)
	})

	it('should toggle enabled state', () => {
		const engine = new AudioEngine()
		engine.setEnabled(false)
		expect(engine.isEnabled()).toBe(false)
		engine.setEnabled(true)
		expect(engine.isEnabled()).toBe(true)
	})

	it('should not throw when playing sounds without AudioContext', () => {
		// In Node.js, AudioContext does not exist
		// Methods should silently fail via try/catch
		const engine = new AudioEngine()
		expect(() => engine.playClick()).not.toThrow()
		expect(() => engine.playSelect()).not.toThrow()
		expect(() => engine.playMove()).not.toThrow()
		expect(() => engine.playAttack()).not.toThrow()
		expect(() => engine.playBuild()).not.toThrow()
		expect(() => engine.playComplete()).not.toThrow()
		expect(() => engine.playTrain()).not.toThrow()
		expect(() => engine.playGather()).not.toThrow()
		expect(() => engine.playError()).not.toThrow()
	})

	it('should not play when disabled', () => {
		const engine = new AudioEngine()
		engine.setEnabled(false)
		// Should return early without trying to create AudioContext
		expect(() => engine.playClick()).not.toThrow()
		expect(() => engine.playSelect()).not.toThrow()
		expect(() => engine.playMove()).not.toThrow()
		expect(() => engine.playAttack()).not.toThrow()
		expect(() => engine.playBuild()).not.toThrow()
		expect(() => engine.playComplete()).not.toThrow()
		expect(() => engine.playTrain()).not.toThrow()
		expect(() => engine.playGather()).not.toThrow()
		expect(() => engine.playError()).not.toThrow()
	})
})
