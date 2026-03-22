import { beforeEach, describe, expect, it } from 'vitest'
import type { BuildingComponent } from '@/types/ecs'
import { ComponentType } from '@/types/ecs'
import { ComponentManager } from '../ComponentManager'
import { EntityFactory } from '../EntityFactory'
import { EntityManager } from '../EntityManager'
import { ProductionSystem } from '../systems/ProductionSystem'

describe('ProductionSystem', () => {
	let em: EntityManager
	let cm: ComponentManager
	let factory: EntityFactory
	let system: ProductionSystem

	beforeEach(() => {
		em = new EntityManager()
		cm = new ComponentManager(em)
		factory = new EntityFactory(em, cm)
		system = new ProductionSystem(em, cm)
	})

	it('should progress queue items', () => {
		const id = factory.createBuilding('barracks', 'p1', 't1', { x: 0, y: 0, z: 0 }, true)
		const building = cm.getComponent<BuildingComponent>(id, ComponentType.BUILDING)!
		building.queue.push({ type: 'marine', progress: 0, duration: 18 })

		const entities = em.queryEntities(ComponentType.BUILDING, ComponentType.OWNER)
		system.update(entities, 5)

		expect(building.queue[0].progress).toBe(5)
	})

	it('should spawn unit when production completes', () => {
		const id = factory.createBuilding('barracks', 'p1', 't1', { x: 10, y: 0, z: 10 }, true)
		const building = cm.getComponent<BuildingComponent>(id, ComponentType.BUILDING)!
		building.queue.push({ type: 'marine', progress: 0, duration: 18 })

		const countBefore = em.getEntityCount()
		const entities = em.queryEntities(ComponentType.BUILDING, ComponentType.OWNER)
		system.update(entities, 20)

		// New entity should have been created
		expect(em.getEntityCount()).toBe(countBefore + 1)
		// Queue should be empty
		expect(building.queue.length).toBe(0)
	})

	it('should not produce from incomplete buildings', () => {
		const id = factory.createBuilding('barracks', 'p1', 't1', { x: 0, y: 0, z: 0 })
		const building = cm.getComponent<BuildingComponent>(id, ComponentType.BUILDING)!
		building.queue.push({ type: 'marine', progress: 0, duration: 18 })

		const entities = em.queryEntities(ComponentType.BUILDING, ComponentType.OWNER)
		system.update(entities, 10)

		// Progress should not have changed
		expect(building.queue[0].progress).toBe(0)
	})

	it('should process multiple queue items sequentially', () => {
		const id = factory.createBuilding('barracks', 'p1', 't1', { x: 0, y: 0, z: 0 }, true)
		const building = cm.getComponent<BuildingComponent>(id, ComponentType.BUILDING)!
		building.queue.push({ type: 'marine', progress: 0, duration: 5 })
		building.queue.push({ type: 'marine', progress: 0, duration: 5 })

		const entities = em.queryEntities(ComponentType.BUILDING, ComponentType.OWNER)
		system.update(entities, 6)

		// First item completed and removed, second should still be in queue
		expect(building.queue.length).toBe(1)
		expect(building.queue[0].progress).toBe(0)
	})

	it('should spawn unit at rally point', () => {
		const id = factory.createBuilding('barracks', 'p1', 't1', { x: 10, y: 0, z: 10 }, true)
		const building = cm.getComponent<BuildingComponent>(id, ComponentType.BUILDING)!
		const rallyPoint = { ...building.rallyPoint }
		building.queue.push({ type: 'marine', progress: 0, duration: 1 })

		const entities = em.queryEntities(ComponentType.BUILDING, ComponentType.OWNER)
		system.update(entities, 2)

		// Find the newly created marine
		const allEntities = em.getAllEntities()
		const marine = allEntities.find((e) => {
			const transform = e.components.get(ComponentType.TRANSFORM)
			if (!transform) return false
			const t = transform as { position: { x: number; y: number; z: number } }
			return t.position.x === rallyPoint.x && t.position.z === rallyPoint.z
		})
		expect(marine).toBeDefined()
	})
})
