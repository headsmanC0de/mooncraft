import { beforeEach, describe, expect, it } from 'vitest'
import type { HealthComponent } from '@/types/ecs'
import { ComponentType } from '@/types/ecs'
import { ComponentManager } from '../ComponentManager'
import { EntityFactory } from '../EntityFactory'
import { EntityManager } from '../EntityManager'
import { DeathSystem } from '../systems/DeathSystem'

describe('DeathSystem', () => {
	let em: EntityManager
	let cm: ComponentManager
	let factory: EntityFactory
	let system: DeathSystem

	beforeEach(() => {
		em = new EntityManager()
		cm = new ComponentManager(em)
		factory = new EntityFactory(em, cm)
		system = new DeathSystem(em)
	})

	it('should remove entities with 0 HP', () => {
		const id = factory.createUnit('marine', 'player1', 'team1', { x: 0, y: 0, z: 0 })
		const health = cm.getComponent<HealthComponent>(id, ComponentType.HEALTH)!
		health.current = 0

		const entities = em.queryEntities(ComponentType.HEALTH)
		system.update(entities, 0)

		expect(em.hasEntity(id)).toBe(false)
	})

	it('should not remove entities with HP > 0', () => {
		const id = factory.createUnit('marine', 'player1', 'team1', { x: 0, y: 0, z: 0 })

		const entities = em.queryEntities(ComponentType.HEALTH)
		system.update(entities, 0)

		expect(em.hasEntity(id)).toBe(true)
	})

	it('should handle multiple dead entities', () => {
		const id1 = factory.createUnit('marine', 'player1', 'team1', { x: 0, y: 0, z: 0 })
		const id2 = factory.createUnit('marine', 'player1', 'team1', { x: 5, y: 0, z: 0 })
		const id3 = factory.createUnit('marine', 'player1', 'team1', { x: 10, y: 0, z: 0 })

		const health1 = cm.getComponent<HealthComponent>(id1, ComponentType.HEALTH)!
		health1.current = 0

		const health2 = cm.getComponent<HealthComponent>(id2, ComponentType.HEALTH)!
		health2.current = 0

		const entities = em.queryEntities(ComponentType.HEALTH)
		system.update(entities, 0)

		expect(em.hasEntity(id1)).toBe(false)
		expect(em.hasEntity(id2)).toBe(false)
		expect(em.hasEntity(id3)).toBe(true)
	})

	it('should remove entities with negative HP', () => {
		const id = factory.createUnit('marine', 'player1', 'team1', { x: 0, y: 0, z: 0 })
		const health = cm.getComponent<HealthComponent>(id, ComponentType.HEALTH)!
		health.current = -50

		const entities = em.queryEntities(ComponentType.HEALTH)
		system.update(entities, 0)

		expect(em.hasEntity(id)).toBe(false)
	})
})
