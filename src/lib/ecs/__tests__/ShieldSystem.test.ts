import { beforeEach, describe, expect, it } from 'vitest'
import type { HealthComponent } from '@/types/ecs'
import { ComponentType } from '@/types/ecs'
import { ComponentManager } from '../ComponentManager'
import { EntityFactory } from '../EntityFactory'
import { EntityManager } from '../EntityManager'
import { ShieldSystem } from '../systems/ShieldSystem'

describe('ShieldSystem', () => {
	let em: EntityManager
	let cm: ComponentManager
	let factory: EntityFactory
	let system: ShieldSystem

	beforeEach(() => {
		em = new EntityManager()
		cm = new ComponentManager(em)
		factory = new EntityFactory(em, cm)
		system = new ShieldSystem()
	})

	it('should regenerate shields over time', () => {
		const id = factory.createUnit('zealot', 'player1', 'team1', { x: 0, y: 0, z: 0 }, 'protoss')
		const health = cm.getComponent<HealthComponent>(id, ComponentType.HEALTH)!
		health.shields = 0

		const entities = em.queryEntities(ComponentType.HEALTH)
		system.update(entities, 1)

		expect(health.shields).toBe(2) // 2 shields/sec * 1 sec
	})

	it('should not exceed maxShields', () => {
		const id = factory.createUnit('zealot', 'player1', 'team1', { x: 0, y: 0, z: 0 }, 'protoss')
		const health = cm.getComponent<HealthComponent>(id, ComponentType.HEALTH)!
		// Shields already at max from creation
		const maxShields = health.maxShields!

		const entities = em.queryEntities(ComponentType.HEALTH)
		system.update(entities, 10)

		expect(health.shields).toBe(maxShields)
	})

	it('should cap regeneration at maxShields', () => {
		const id = factory.createUnit('zealot', 'player1', 'team1', { x: 0, y: 0, z: 0 }, 'protoss')
		const health = cm.getComponent<HealthComponent>(id, ComponentType.HEALTH)!
		health.shields = health.maxShields! - 1

		const entities = em.queryEntities(ComponentType.HEALTH)
		system.update(entities, 5) // Would add 10 shields, but should cap

		expect(health.shields).toBe(health.maxShields)
	})

	it('should not regenerate for dead entities', () => {
		const id = factory.createUnit('zealot', 'player1', 'team1', { x: 0, y: 0, z: 0 }, 'protoss')
		const health = cm.getComponent<HealthComponent>(id, ComponentType.HEALTH)!
		health.current = 0
		health.shields = 0

		const entities = em.queryEntities(ComponentType.HEALTH)
		system.update(entities, 1)

		expect(health.shields).toBe(0)
	})

	it('should not affect entities without shields', () => {
		const id = factory.createUnit('marine', 'player1', 'team1', { x: 0, y: 0, z: 0 }, 'terran')
		const health = cm.getComponent<HealthComponent>(id, ComponentType.HEALTH)!
		const before = { ...health }

		const entities = em.queryEntities(ComponentType.HEALTH)
		system.update(entities, 1)

		expect(health.current).toBe(before.current)
		expect(health.shields).toBe(before.shields)
	})
})
