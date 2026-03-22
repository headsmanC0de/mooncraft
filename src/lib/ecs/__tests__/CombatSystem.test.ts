import { beforeEach, describe, expect, it } from 'vitest'
import type { CombatComponent, HealthComponent } from '@/types/ecs'
import { ComponentType } from '@/types/ecs'
import { ComponentManager } from '../ComponentManager'
import { EntityFactory } from '../EntityFactory'
import { EntityManager } from '../EntityManager'
import { CombatSystem } from '../systems/CombatSystem'

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

	it('should clear target when target entity is destroyed', () => {
		const attackerId = factory.createUnit('marine', 'player1', 'team1', { x: 0, y: 0, z: 0 })
		const targetId = factory.createUnit('marine', 'player2', 'team2', { x: 2, y: 0, z: 0 })

		const combat = cm.getComponent<CombatComponent>(attackerId, ComponentType.COMBAT)!
		combat.targetId = targetId

		// Destroy the target
		em.destroyEntity(targetId)

		const entities = em.queryEntities(
			ComponentType.TRANSFORM,
			ComponentType.COMBAT,
			ComponentType.HEALTH,
		)
		system.update(entities, 1)

		expect(combat.targetId).toBeNull()
	})

	it('should apply armor reduction correctly', () => {
		const attackerId = factory.createUnit('marine', 'player1', 'team1', { x: 0, y: 0, z: 0 })
		const targetId = factory.createUnit('marine', 'player2', 'team2', { x: 2, y: 0, z: 0 })

		const combat = cm.getComponent<CombatComponent>(attackerId, ComponentType.COMBAT)!
		combat.targetId = targetId
		combat.attackDamage = 10

		const targetHealth = cm.getComponent<HealthComponent>(targetId, ComponentType.HEALTH)!
		targetHealth.armor = 3
		const healthBefore = targetHealth.current

		const entities = em.queryEntities(
			ComponentType.TRANSFORM,
			ComponentType.COMBAT,
			ComponentType.HEALTH,
		)
		system.update(entities, 1)

		// damage = max(1, 10 - 3) = 7
		expect(targetHealth.current).toBe(healthBefore - 7)
	})

	it('should deal minimum 1 damage even with high armor', () => {
		const attackerId = factory.createUnit('marine', 'player1', 'team1', { x: 0, y: 0, z: 0 })
		const targetId = factory.createUnit('marine', 'player2', 'team2', { x: 2, y: 0, z: 0 })

		const combat = cm.getComponent<CombatComponent>(attackerId, ComponentType.COMBAT)!
		combat.targetId = targetId
		combat.attackDamage = 2

		const targetHealth = cm.getComponent<HealthComponent>(targetId, ComponentType.HEALTH)!
		targetHealth.armor = 100
		const healthBefore = targetHealth.current

		const entities = em.queryEntities(
			ComponentType.TRANSFORM,
			ComponentType.COMBAT,
			ComponentType.HEALTH,
		)
		system.update(entities, 1)

		// damage = max(1, 2 - 100) = 1
		expect(targetHealth.current).toBe(healthBefore - 1)
	})
})
