import { describe, it, expect, beforeEach } from 'vitest'
import { EntityManager } from '../EntityManager'
import { ComponentManager } from '../ComponentManager'
import type { TransformComponent, HealthComponent } from '@/types/ecs'
import { ComponentType } from '@/types/ecs'

describe('ComponentManager', () => {
	let em: EntityManager
	let cm: ComponentManager

	beforeEach(() => {
		em = new EntityManager()
		cm = new ComponentManager(em)
	})

	it('should add and retrieve component', () => {
		const id = em.createEntity()
		const transform: TransformComponent = {
			type: ComponentType.TRANSFORM,
			position: { x: 5, y: 0, z: 10 },
			rotation: 0,
			scale: { x: 1, y: 1, z: 1 },
		}

		expect(cm.addComponent(id, transform)).toBe(true)

		const retrieved = cm.getComponent<TransformComponent>(id, ComponentType.TRANSFORM)
		expect(retrieved).toBeDefined()
		expect(retrieved!.position).toEqual({ x: 5, y: 0, z: 10 })
	})

	it('should update component partially', () => {
		const id = em.createEntity()
		const health: HealthComponent = {
			type: ComponentType.HEALTH,
			current: 100,
			max: 100,
			armor: 5,
		}

		cm.addComponent(id, health)
		const updated = cm.updateComponent<HealthComponent>(id, ComponentType.HEALTH, {
			current: 50,
		})

		expect(updated).toBe(true)
		const retrieved = cm.getComponent<HealthComponent>(id, ComponentType.HEALTH)
		expect(retrieved!.current).toBe(50)
		expect(retrieved!.max).toBe(100)
		expect(retrieved!.armor).toBe(5)
	})

	it('should remove component', () => {
		const id = em.createEntity()
		const transform: TransformComponent = {
			type: ComponentType.TRANSFORM,
			position: { x: 0, y: 0, z: 0 },
			rotation: 0,
			scale: { x: 1, y: 1, z: 1 },
		}

		cm.addComponent(id, transform)
		expect(cm.hasComponent(id, ComponentType.TRANSFORM)).toBe(true)

		const removed = cm.removeComponent(id, ComponentType.TRANSFORM)
		expect(removed).toBe(true)
		expect(cm.hasComponent(id, ComponentType.TRANSFORM)).toBe(false)
		expect(cm.getComponent(id, ComponentType.TRANSFORM)).toBeUndefined()
	})
})
