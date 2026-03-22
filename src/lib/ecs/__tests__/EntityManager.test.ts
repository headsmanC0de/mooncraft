import { beforeEach, describe, expect, it } from 'vitest'
import type { HealthComponent, TransformComponent } from '@/types/ecs'
import { ComponentType } from '@/types/ecs'
import { EntityManager } from '../EntityManager'

describe('EntityManager', () => {
	let em: EntityManager

	beforeEach(() => {
		em = new EntityManager()
	})

	it('should create entity with unique id', () => {
		const id = em.createEntity()
		expect(id).toBeDefined()
		expect(typeof id).toBe('string')
		expect(em.hasEntity(id)).toBe(true)
	})

	it('should destroy entity', () => {
		const id = em.createEntity()
		expect(em.destroyEntity(id)).toBe(true)
		expect(em.hasEntity(id)).toBe(false)
	})

	it('should return false when destroying non-existent entity', () => {
		expect(em.destroyEntity('non-existent')).toBe(false)
	})

	it('should query entities by component type', () => {
		const id = em.createEntity()
		const entity = em.getEntity(id)!
		const transform: TransformComponent = {
			type: ComponentType.TRANSFORM,
			position: { x: 0, y: 0, z: 0 },
			rotation: 0,
			scale: { x: 1, y: 1, z: 1 },
		}
		const health: HealthComponent = {
			type: ComponentType.HEALTH,
			current: 100,
			max: 100,
			armor: 0,
		}
		entity.components.set(ComponentType.TRANSFORM, transform)
		entity.components.set(ComponentType.HEALTH, health)
		em._onComponentAdded(id, ComponentType.TRANSFORM)
		em._onComponentAdded(id, ComponentType.HEALTH)

		const result = em.queryEntities(ComponentType.TRANSFORM, ComponentType.HEALTH)
		expect(result).toHaveLength(1)
		expect(result[0].id).toBe(id)
	})

	it('should return empty for unmatched queries', () => {
		const id = em.createEntity()
		const entity = em.getEntity(id)!
		const transform: TransformComponent = {
			type: ComponentType.TRANSFORM,
			position: { x: 0, y: 0, z: 0 },
			rotation: 0,
			scale: { x: 1, y: 1, z: 1 },
		}
		entity.components.set(ComponentType.TRANSFORM, transform)
		em._onComponentAdded(id, ComponentType.TRANSFORM)

		const result = em.queryEntities(ComponentType.TRANSFORM, ComponentType.HEALTH)
		expect(result).toHaveLength(0)
	})

	it('should track entity count', () => {
		em.createEntity()
		em.createEntity()
		expect(em.getEntityCount()).toBe(2)
	})
})
