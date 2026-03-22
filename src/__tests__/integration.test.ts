import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ComponentManager } from '@/lib/ecs/ComponentManager'
import { EntityFactory } from '@/lib/ecs/EntityFactory'
import { EntityManager } from '@/lib/ecs/EntityManager'
import { BuildingSystem } from '@/lib/ecs/systems/BuildingSystem'
import { CombatSystem } from '@/lib/ecs/systems/CombatSystem'
import { DeathSystem } from '@/lib/ecs/systems/DeathSystem'
import { MovementSystem } from '@/lib/ecs/systems/MovementSystem'
import { ProductionSystem } from '@/lib/ecs/systems/ProductionSystem'
import { ResourceSystem } from '@/lib/ecs/systems/ResourceSystem'
import { ShieldSystem } from '@/lib/ecs/systems/ShieldSystem'
import type { BuildingComponent, CombatComponent, HealthComponent } from '@/types/ecs'
import { ComponentType } from '@/types/ecs'

// Mock audio
vi.mock('@/lib/audio', () => ({
	audioEngine: {
		playAttack: vi.fn(),
		playClick: vi.fn(),
		playSelect: vi.fn(),
		playMove: vi.fn(),
		playBuild: vi.fn(),
		playComplete: vi.fn(),
		playTrain: vi.fn(),
		playGather: vi.fn(),
		playError: vi.fn(),
	},
}))

describe('Integration: Combat Scenario', () => {
	let em: EntityManager
	let cm: ComponentManager
	let factory: EntityFactory

	beforeEach(() => {
		em = new EntityManager()
		cm = new ComponentManager(em)
		factory = new EntityFactory(em, cm)
	})

	it('should kill a unit through combat and remove it via DeathSystem', () => {
		const attacker = factory.createUnit('marine', 'p1', 't1', { x: 0, y: 0, z: 0 })
		const target = factory.createUnit('marine', 'p2', 't2', { x: 2, y: 0, z: 0 })

		cm.updateComponent<CombatComponent>(attacker, ComponentType.COMBAT, { targetId: target })

		const combatSystem = new CombatSystem(em)
		const deathSystem = new DeathSystem(em)

		// Attack many times until target dies
		const entities = () =>
			em.queryEntities(ComponentType.TRANSFORM, ComponentType.COMBAT, ComponentType.HEALTH)
		for (let i = 0; i < 100; i++) {
			combatSystem.update(entities(), 1)
		}

		const health = cm.getComponent<HealthComponent>(target, ComponentType.HEALTH)
		expect(health!.current).toBeLessThanOrEqual(0)

		// DeathSystem removes it
		const healthEntities = () => em.queryEntities(ComponentType.HEALTH)
		deathSystem.update(healthEntities(), 0)

		expect(em.hasEntity(target)).toBe(false)
	})

	it('should move unit toward target and attack when in range', () => {
		const attacker = factory.createUnit('marine', 'p1', 't1', { x: 0, y: 0, z: 0 })
		const target = factory.createUnit('marine', 'p2', 't2', { x: 10, y: 0, z: 0 })

		// Set move target and combat target
		cm.updateComponent(attacker, ComponentType.MOVEMENT, {
			targetPosition: { x: 10, y: 0, z: 0 },
		})
		cm.updateComponent<CombatComponent>(attacker, ComponentType.COMBAT, { targetId: target })

		const moveSystem = new MovementSystem()
		const combatSystem = new CombatSystem(em)

		// Move toward target
		for (let i = 0; i < 10; i++) {
			const moveEntities = em.queryEntities(ComponentType.TRANSFORM, ComponentType.MOVEMENT)
			moveSystem.update(moveEntities, 0.5)
		}

		// Should be close enough to attack
		const combatEntities = em.queryEntities(
			ComponentType.TRANSFORM,
			ComponentType.COMBAT,
			ComponentType.HEALTH,
		)
		combatSystem.update(combatEntities, 1)

		const targetHealth = cm.getComponent<HealthComponent>(target, ComponentType.HEALTH)
		// Marine should have taken damage (started at 40)
		expect(targetHealth!.current).toBeLessThan(40)
	})

	it('should regenerate Protoss shields after damage', () => {
		const zealot = factory.createUnit('zealot', 'p1', 't1', { x: 0, y: 0, z: 0 }, 'protoss')

		// Damage shields
		cm.updateComponent<HealthComponent>(zealot, ComponentType.HEALTH, { shields: 0 })

		const shieldSystem = new ShieldSystem()

		// Regen for 5 seconds
		const entities = em.queryEntities(ComponentType.HEALTH)
		shieldSystem.update(entities, 5)

		const health = cm.getComponent<HealthComponent>(zealot, ComponentType.HEALTH)
		expect(health!.shields).toBeGreaterThan(0)
		expect(health!.shields).toBeLessThanOrEqual(health!.maxShields!)
	})

	it('should build a building to completion', () => {
		const buildingId = factory.createBuilding('barracks', 'p1', 't1', { x: 10, y: 0, z: 10 })

		const buildingSystem = new BuildingSystem()

		// Run for enough time to complete (barracks buildTime = 40)
		const entities = () => em.queryEntities(ComponentType.BUILDING, ComponentType.HEALTH)
		for (let i = 0; i < 50; i++) {
			buildingSystem.update(entities(), 1)
		}

		const building = cm.getComponent<BuildingComponent>(buildingId, ComponentType.BUILDING)
		expect(building!.buildProgress).toBe(1)
	})

	it('should produce unit from completed building', () => {
		const buildingId = factory.createBuilding('barracks', 'p1', 't1', { x: 10, y: 0, z: 10 }, true)

		// Add marine to queue
		const building = cm.getComponent<BuildingComponent>(buildingId, ComponentType.BUILDING)
		building!.queue.push({ type: 'marine', progress: 0, duration: 18 })

		const productionSystem = new ProductionSystem(em, cm)

		const initialCount = em.getEntityCount()

		// Run production for enough time
		const entities = () => em.queryEntities(ComponentType.BUILDING, ComponentType.OWNER)
		for (let i = 0; i < 20; i++) {
			productionSystem.update(entities(), 1)
		}

		// New entity should have been created
		expect(em.getEntityCount()).toBeGreaterThan(initialCount)
	})

	it('should complete full resource gathering cycle', () => {
		const mineral = factory.createMineralPatch({ x: 5, y: 0, z: 5 }, 100)
		const worker = factory.createUnit('worker', 'p1', 't1', { x: 5, y: 0, z: 5 })

		// Set worker to gather
		cm.updateComponent(worker, ComponentType.RESOURCE_CARRIER, {
			state: 'gathering',
			targetResourceId: mineral,
		})

		let deposited = 0
		const resourceSystem = new ResourceSystem(cm)
		resourceSystem.setDepositCallback((_playerId, amount) => {
			deposited += amount
		})

		// Run gathering for multiple cycles
		const entities = () => em.queryEntities(ComponentType.RESOURCE_CARRIER, ComponentType.TRANSFORM)
		for (let i = 0; i < 30; i++) {
			resourceSystem.update(entities(), 1)
		}

		expect(deposited).toBeGreaterThan(0)
	})
})
