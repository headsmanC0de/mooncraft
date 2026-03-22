import { beforeEach, describe, expect, it } from 'vitest'
import type { ResourceCarrierComponent, ResourceComponent } from '@/types/ecs'
import { ComponentType } from '@/types/ecs'
import { ComponentManager } from '../ComponentManager'
import { EntityFactory } from '../EntityFactory'
import { EntityManager } from '../EntityManager'
import { ResourceSystem } from '../systems/ResourceSystem'

describe('ResourceSystem', () => {
	let em: EntityManager
	let cm: ComponentManager
	let factory: EntityFactory
	let system: ResourceSystem

	beforeEach(() => {
		em = new EntityManager()
		cm = new ComponentManager(em)
		factory = new EntityFactory(em, cm)
		system = new ResourceSystem(cm)
	})

	it('should gather resources when worker is at mineral patch', () => {
		const mineralId = factory.createMineralPatch({ x: 5, y: 0, z: 5 }, 1000)
		const workerId = factory.createUnit('worker', 'p1', 't1', { x: 5, y: 0, z: 5 })
		// Worker should have RESOURCE_CARRIER component from factory
		cm.updateComponent(workerId, ComponentType.RESOURCE_CARRIER, {
			state: 'gathering' as const,
			targetResourceId: mineralId,
		})

		const entities = em.queryEntities(ComponentType.RESOURCE_CARRIER, ComponentType.TRANSFORM)
		system.update(entities, 2.5)

		const carrier = cm.getComponent<ResourceCarrierComponent>(
			workerId,
			ComponentType.RESOURCE_CARRIER,
		)
		expect(carrier!.currentLoad).toBeGreaterThan(0)
	})

	it('should deplete mineral patch over time', () => {
		const mineralId = factory.createMineralPatch({ x: 5, y: 0, z: 5 }, 10)
		const workerId = factory.createUnit('worker', 'p1', 't1', { x: 5, y: 0, z: 5 })
		cm.updateComponent(workerId, ComponentType.RESOURCE_CARRIER, {
			state: 'gathering' as const,
			targetResourceId: mineralId,
		})

		const entities = em.queryEntities(ComponentType.RESOURCE_CARRIER, ComponentType.TRANSFORM)
		system.update(entities, 2.5)

		const resource = cm.getComponent<ResourceComponent>(mineralId, ComponentType.RESOURCE)
		expect(resource!.amount).toBeLessThan(10)
	})

	it('should switch to returning when full', () => {
		const mineralId = factory.createMineralPatch({ x: 5, y: 0, z: 5 }, 1000)
		const workerId = factory.createUnit('worker', 'p1', 't1', { x: 5, y: 0, z: 5 })
		cm.updateComponent(workerId, ComponentType.RESOURCE_CARRIER, {
			state: 'gathering' as const,
			targetResourceId: mineralId,
		})

		const entities = em.queryEntities(ComponentType.RESOURCE_CARRIER, ComponentType.TRANSFORM)
		// Run enough time to fill capacity
		system.update(entities, 10)

		const carrier = cm.getComponent<ResourceCarrierComponent>(
			workerId,
			ComponentType.RESOURCE_CARRIER,
		)
		// Should have cycled through returning and back to gathering
		expect(carrier!.currentLoad).toBeDefined()
	})

	it('should go idle when resource depleted', () => {
		const mineralId = factory.createMineralPatch({ x: 5, y: 0, z: 5 }, 1)
		const workerId = factory.createUnit('worker', 'p1', 't1', { x: 5, y: 0, z: 5 })
		cm.updateComponent(workerId, ComponentType.RESOURCE_CARRIER, {
			state: 'gathering' as const,
			targetResourceId: mineralId,
		})

		const entities = em.queryEntities(ComponentType.RESOURCE_CARRIER, ComponentType.TRANSFORM)
		system.update(entities, 10)

		const _carrier = cm.getComponent<ResourceCarrierComponent>(
			workerId,
			ComponentType.RESOURCE_CARRIER,
		)
		const resource = cm.getComponent<ResourceComponent>(mineralId, ComponentType.RESOURCE)
		expect(resource!.amount).toBe(0)
	})

	it('should handle gathering from already depleted resource', () => {
		const mineralId = factory.createMineralPatch({ x: 5, y: 0, z: 5 }, 0)
		const workerId = factory.createUnit('worker', 'p1', 't1', { x: 5, y: 0, z: 5 })
		cm.updateComponent(workerId, ComponentType.RESOURCE_CARRIER, {
			state: 'gathering' as const,
			targetResourceId: mineralId,
		})

		const entities = em.queryEntities(ComponentType.RESOURCE_CARRIER, ComponentType.TRANSFORM)
		system.update(entities, 5)

		const carrier = cm.getComponent<ResourceCarrierComponent>(
			workerId,
			ComponentType.RESOURCE_CARRIER,
		)
		expect(carrier!.state).toBe('idle')
		expect(carrier!.targetResourceId).toBeNull()
	})
})
