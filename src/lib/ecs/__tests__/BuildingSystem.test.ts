import { beforeEach, describe, expect, it } from 'vitest'
import type { BuildingComponent, HealthComponent } from '@/types/ecs'
import { ComponentType } from '@/types/ecs'
import { ComponentManager } from '../ComponentManager'
import { EntityFactory } from '../EntityFactory'
import { EntityManager } from '../EntityManager'
import { BuildingSystem } from '../systems/BuildingSystem'

describe('BuildingSystem', () => {
	let em: EntityManager
	let cm: ComponentManager
	let factory: EntityFactory
	let system: BuildingSystem

	beforeEach(() => {
		em = new EntityManager()
		cm = new ComponentManager(em)
		factory = new EntityFactory(em, cm)
		system = new BuildingSystem()
	})

	it('should advance build progress over time', () => {
		const id = factory.createBuilding('barracks', 'p1', 't1', { x: 0, y: 0, z: 0 })
		const entities = em.queryEntities(ComponentType.BUILDING, ComponentType.HEALTH)
		system.update(entities, 10)
		const building = cm.getComponent<BuildingComponent>(id, ComponentType.BUILDING)
		expect(building!.buildProgress).toBeGreaterThan(0)
		expect(building!.buildProgress).toBeLessThanOrEqual(1)
	})

	it('should increase health as building progresses', () => {
		const id = factory.createBuilding('barracks', 'p1', 't1', { x: 0, y: 0, z: 0 })
		const entities = em.queryEntities(ComponentType.BUILDING, ComponentType.HEALTH)
		system.update(entities, 20)
		const health = cm.getComponent<HealthComponent>(id, ComponentType.HEALTH)
		expect(health!.current).toBeGreaterThan(1)
	})

	it('should cap progress at 1', () => {
		const id = factory.createBuilding('supply_depot', 'p1', 't1', { x: 0, y: 0, z: 0 })
		const entities = em.queryEntities(ComponentType.BUILDING, ComponentType.HEALTH)
		system.update(entities, 1000)
		const building = cm.getComponent<BuildingComponent>(id, ComponentType.BUILDING)
		expect(building!.buildProgress).toBe(1)
	})

	it('should not advance already completed buildings', () => {
		const id = factory.createBuilding('command_center', 'p1', 't1', { x: 0, y: 0, z: 0 }, true)
		const entities = em.queryEntities(ComponentType.BUILDING, ComponentType.HEALTH)
		const healthBefore = cm.getComponent<HealthComponent>(id, ComponentType.HEALTH)!.current
		system.update(entities, 10)
		const healthAfter = cm.getComponent<HealthComponent>(id, ComponentType.HEALTH)!.current
		expect(healthAfter).toBe(healthBefore)
	})
})
