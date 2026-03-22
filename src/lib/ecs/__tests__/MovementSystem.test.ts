import { beforeEach, describe, expect, it } from 'vitest'
import type { MovementComponent, TransformComponent } from '@/types/ecs'
import { ComponentType } from '@/types/ecs'
import { ComponentManager } from '../ComponentManager'
import { EntityFactory } from '../EntityFactory'
import { EntityManager } from '../EntityManager'
import { MovementSystem } from '../systems/MovementSystem'

describe('MovementSystem', () => {
	let em: EntityManager
	let cm: ComponentManager
	let factory: EntityFactory
	let system: MovementSystem

	beforeEach(() => {
		em = new EntityManager()
		cm = new ComponentManager(em)
		factory = new EntityFactory(em, cm)
		system = new MovementSystem()
	})

	it('should move entity toward target', () => {
		const id = factory.createUnit('marine', 'player1', 'team1', { x: 0, y: 0, z: 0 })

		const movement = cm.getComponent<MovementComponent>(id, ComponentType.MOVEMENT)!
		movement.targetPosition = { x: 10, y: 0, z: 0 }
		movement.isMoving = true

		const entities = em.queryEntities(ComponentType.TRANSFORM, ComponentType.MOVEMENT)
		system.update(entities, 1)

		const transform = cm.getComponent<TransformComponent>(id, ComponentType.TRANSFORM)!
		expect(transform.position.x).toBeGreaterThan(0)
	})

	it('should push apart units that are too close', () => {
		const id1 = factory.createUnit('marine', 'p1', 't1', { x: 5, y: 0, z: 5 })
		const id2 = factory.createUnit('marine', 'p1', 't1', { x: 5, y: 0, z: 5 })

		const entities = em.queryEntities(ComponentType.TRANSFORM, ComponentType.MOVEMENT)
		system.update(entities, 0.016)

		const t1 = cm.getComponent<TransformComponent>(id1, ComponentType.TRANSFORM)
		const t2 = cm.getComponent<TransformComponent>(id2, ComponentType.TRANSFORM)

		const dx = t1!.position.x - t2!.position.x
		const dz = t1!.position.z - t2!.position.z
		const dist = Math.sqrt(dx * dx + dz * dz)
		expect(dist).toBeGreaterThan(0)
	})

	it('should stop when arriving at target', () => {
		const id = factory.createUnit('marine', 'player1', 'team1', { x: 0, y: 0, z: 0 })

		const movement = cm.getComponent<MovementComponent>(id, ComponentType.MOVEMENT)!
		movement.targetPosition = { x: 0.05, y: 0, z: 0 }
		movement.isMoving = true

		const entities = em.queryEntities(ComponentType.TRANSFORM, ComponentType.MOVEMENT)
		system.update(entities, 1)

		expect(movement.isMoving).toBe(false)
		expect(movement.targetPosition).toBeNull()
	})
})
