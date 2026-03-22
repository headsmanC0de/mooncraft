import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SystemManager, System } from '../SystemManager'
import { ComponentType } from '@/types/ecs'
import type { Entity } from '@/types/ecs'

vi.mock('../EntityManager', () => ({
	entityManager: {
		queryEntities: vi.fn(() => []),
	},
}))

import { entityManager } from '../EntityManager'

class TestSystemA extends System {
	readonly requiredComponents = [ComponentType.TRANSFORM]
	readonly priority = 10
	updateCalls = 0
	lastEntities: Entity[] = []
	lastDeltaTime = 0
	update(entities: Entity[], deltaTime: number): void {
		this.updateCalls++
		this.lastEntities = entities
		this.lastDeltaTime = deltaTime
	}
}

class TestSystemB extends System {
	readonly requiredComponents = [ComponentType.HEALTH]
	readonly priority = 5
	updateCalls = 0
	update(_entities: Entity[], _deltaTime: number): void {
		this.updateCalls++
	}
}

class TestSystemC extends System {
	readonly requiredComponents = [ComponentType.COMBAT]
	readonly priority = 1
	updateCalls = 0
	update(_entities: Entity[], _deltaTime: number): void {
		this.updateCalls++
	}
}

describe('SystemManager', () => {
	let sm: SystemManager

	beforeEach(() => {
		sm = new SystemManager()
		vi.clearAllMocks()
	})

	describe('registerSystem', () => {
		it('should add a system', () => {
			const systemA = new TestSystemA()
			sm.registerSystem(systemA)
			expect(sm.getAllSystems()).toHaveLength(1)
			expect(sm.getAllSystems()[0]).toBe(systemA)
		})

		it('should sort systems by priority after registration', () => {
			const systemA = new TestSystemA() // priority 10
			const systemB = new TestSystemB() // priority 5
			sm.registerSystem(systemA)
			sm.registerSystem(systemB)
			const all = sm.getAllSystems()
			expect(all[0]).toBe(systemB)
			expect(all[1]).toBe(systemA)
		})

		it('should handle multiple systems registered in any order', () => {
			const systemA = new TestSystemA() // priority 10
			const systemB = new TestSystemB() // priority 5
			const systemC = new TestSystemC() // priority 1
			sm.registerSystem(systemA)
			sm.registerSystem(systemC)
			sm.registerSystem(systemB)
			const all = sm.getAllSystems()
			expect(all[0]).toBe(systemC)
			expect(all[1]).toBe(systemB)
			expect(all[2]).toBe(systemA)
		})
	})

	describe('removeSystem', () => {
		it('should remove a registered system and return true', () => {
			const systemA = new TestSystemA()
			sm.registerSystem(systemA)
			expect(sm.removeSystem(systemA)).toBe(true)
			expect(sm.getAllSystems()).toHaveLength(0)
		})

		it('should return false when removing a system that is not registered', () => {
			const systemA = new TestSystemA()
			expect(sm.removeSystem(systemA)).toBe(false)
		})

		it('should only remove the specified system', () => {
			const systemA = new TestSystemA()
			const systemB = new TestSystemB()
			sm.registerSystem(systemA)
			sm.registerSystem(systemB)
			sm.removeSystem(systemA)
			expect(sm.getAllSystems()).toHaveLength(1)
			expect(sm.getAllSystems()[0]).toBe(systemB)
		})
	})

	describe('update', () => {
		it('should call update on all registered systems when running', () => {
			const systemA = new TestSystemA()
			const systemB = new TestSystemB()
			sm.registerSystem(systemA)
			sm.registerSystem(systemB)
			sm.start()
			sm.update(16)
			expect(systemA.updateCalls).toBe(1)
			expect(systemB.updateCalls).toBe(1)
		})

		it('should pass deltaTime to systems', () => {
			const systemA = new TestSystemA()
			sm.registerSystem(systemA)
			sm.start()
			sm.update(33.3)
			expect(systemA.lastDeltaTime).toBe(33.3)
		})

		it('should query entityManager with required components', () => {
			const systemA = new TestSystemA()
			sm.registerSystem(systemA)
			sm.start()
			sm.update(16)
			expect(entityManager.queryEntities).toHaveBeenCalledWith(
				ComponentType.TRANSFORM,
			)
		})

		it('should pass queried entities to the system', () => {
			const mockEntities: Entity[] = [
				{ id: 'e1', components: new Map() },
				{ id: 'e2', components: new Map() },
			]
			vi.mocked(entityManager.queryEntities).mockReturnValue(mockEntities)
			const systemA = new TestSystemA()
			sm.registerSystem(systemA)
			sm.start()
			sm.update(16)
			expect(systemA.lastEntities).toBe(mockEntities)
		})

		it('should NOT call update when stopped', () => {
			const systemA = new TestSystemA()
			sm.registerSystem(systemA)
			sm.update(16)
			expect(systemA.updateCalls).toBe(0)
		})

		it('should not call update after stop is called', () => {
			const systemA = new TestSystemA()
			sm.registerSystem(systemA)
			sm.start()
			sm.update(16)
			expect(systemA.updateCalls).toBe(1)
			sm.stop()
			sm.update(16)
			expect(systemA.updateCalls).toBe(1)
		})
	})

	describe('start/stop', () => {
		it('should enable updates after start', () => {
			const systemA = new TestSystemA()
			sm.registerSystem(systemA)
			sm.start()
			sm.update(16)
			expect(systemA.updateCalls).toBe(1)
		})

		it('should disable updates after stop', () => {
			const systemA = new TestSystemA()
			sm.registerSystem(systemA)
			sm.start()
			sm.stop()
			sm.update(16)
			expect(systemA.updateCalls).toBe(0)
		})

		it('should allow restart after stop', () => {
			const systemA = new TestSystemA()
			sm.registerSystem(systemA)
			sm.start()
			sm.stop()
			sm.start()
			sm.update(16)
			expect(systemA.updateCalls).toBe(1)
		})
	})

	describe('getSystem', () => {
		it('should retrieve a system by class type', () => {
			const systemA = new TestSystemA()
			sm.registerSystem(systemA)
			expect(sm.getSystem(TestSystemA)).toBe(systemA)
		})

		it('should return undefined for unregistered system type', () => {
			expect(sm.getSystem(TestSystemA)).toBeUndefined()
		})

		it('should return the correct system when multiple are registered', () => {
			const systemA = new TestSystemA()
			const systemB = new TestSystemB()
			sm.registerSystem(systemA)
			sm.registerSystem(systemB)
			expect(sm.getSystem(TestSystemA)).toBe(systemA)
			expect(sm.getSystem(TestSystemB)).toBe(systemB)
		})
	})

	describe('getAllSystems', () => {
		it('should return empty array when no systems registered', () => {
			expect(sm.getAllSystems()).toEqual([])
		})

		it('should return all registered systems', () => {
			const systemA = new TestSystemA()
			const systemB = new TestSystemB()
			sm.registerSystem(systemA)
			sm.registerSystem(systemB)
			expect(sm.getAllSystems()).toHaveLength(2)
		})

		it('should return a copy of the systems array', () => {
			const systemA = new TestSystemA()
			sm.registerSystem(systemA)
			const all = sm.getAllSystems()
			all.pop()
			expect(sm.getAllSystems()).toHaveLength(1)
		})
	})

	describe('clear', () => {
		it('should remove all systems', () => {
			sm.registerSystem(new TestSystemA())
			sm.registerSystem(new TestSystemB())
			sm.registerSystem(new TestSystemC())
			sm.clear()
			expect(sm.getAllSystems()).toHaveLength(0)
		})

		it('should result in no updates being called', () => {
			const systemA = new TestSystemA()
			sm.registerSystem(systemA)
			sm.start()
			sm.clear()
			sm.update(16)
			expect(systemA.updateCalls).toBe(0)
		})
	})

	describe('priority ordering', () => {
		it('should call systems in priority order (lower priority first)', () => {
			const callOrder: string[] = []
			const systemA = new TestSystemA() // priority 10
			const systemC = new TestSystemC() // priority 1
			const systemB = new TestSystemB() // priority 5

			systemC.update = () => {
				callOrder.push('C')
			}
			systemB.update = () => {
				callOrder.push('B')
			}
			systemA.update = () => {
				callOrder.push('A')
			}

			sm.registerSystem(systemA)
			sm.registerSystem(systemC)
			sm.registerSystem(systemB)
			sm.start()
			sm.update(16)

			expect(callOrder).toEqual(['C', 'B', 'A'])
		})
	})
})
