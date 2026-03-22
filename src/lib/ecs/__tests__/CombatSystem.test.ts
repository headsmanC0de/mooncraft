import { describe, it, expect, beforeEach } from 'vitest'
import { EntityManager } from '../EntityManager'
import { ComponentManager } from '../ComponentManager'
import { EntityFactory } from '../EntityFactory'
import { CombatSystem } from '../systems/CombatSystem'
import type { CombatComponent, HealthComponent } from '@/types/ecs'
import { ComponentType } from '@/types/ecs'

describe('CombatSystem', () => {
	let em: EntityManager
	let cm: ComponentManager
	let factory: EntityFactory
	let system: CombatSystem

	beforeEach(() => {
		em = new EntityManager()
		cm = new ComponentManager(em)
		factory = new EntityFactory(em, cm)
		system = new CombatSystem(em)
	})

	it('should deal damage when target in range', () => {
		const attackerId = factory.createUnit('marine', 'player1', 'team1', { x: 0, y: 0, z: 0 })
		const targetId = factory.createUnit('marine', 'player2', 'team2', { x: 2, y: 0, z: 0 })

		const combat = cm.getComponent<CombatComponent>(attackerId, ComponentType.COMBAT)!
		combat.targetId = targetId

		const targetHealth = cm.getComponent<HealthComponent>(targetId, ComponentType.HEALTH)!
		const maxHealth = targetHealth.current

		const entities = em.queryEntities(
			ComponentType.TRANSFORM,
			ComponentType.COMBAT,
			ComponentType.HEALTH,
		)
		system.update(entities, 1)

		expect(targetHealth.current).toBeLessThan(maxHealth)
	})

	it('should not attack when out of range', () => {
		const attackerId = factory.createUnit('marine', 'player1', 'team1', { x: 0, y: 0, z: 0 })
		const targetId = factory.createUnit('marine', 'player2', 'team2', {
			x: 100,
			y: 0,
			z: 0,
		})

		const combat = cm.getComponent<CombatComponent>(attackerId, ComponentType.COMBAT)!
		combat.targetId = targetId

		const targetHealth = cm.getComponent<HealthComponent>(targetId, ComponentType.HEALTH)!
		const maxHealth = targetHealth.current

		const entities = em.queryEntities(
			ComponentType.TRANSFORM,
			ComponentType.COMBAT,
			ComponentType.HEALTH,
		)
		system.update(entities, 1)

		expect(targetHealth.current).toBe(maxHealth)
	})

	it('should respect attack cooldown', () => {
		const attackerId = factory.createUnit('marine', 'player1', 'team1', { x: 0, y: 0, z: 0 })
		const targetId = factory.createUnit('marine', 'player2', 'team2', { x: 2, y: 0, z: 0 })

		const combat = cm.getComponent<CombatComponent>(attackerId, ComponentType.COMBAT)!
		combat.targetId = targetId
		combat.attackCooldown = 5

		const targetHealth = cm.getComponent<HealthComponent>(targetId, ComponentType.HEALTH)!
		const maxHealth = targetHealth.current

		const entities = em.queryEntities(
			ComponentType.TRANSFORM,
			ComponentType.COMBAT,
			ComponentType.HEALTH,
		)
		system.update(entities, 0.1)

		expect(targetHealth.current).toBe(maxHealth)
	})
})
