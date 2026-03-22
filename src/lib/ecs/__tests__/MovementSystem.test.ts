import { describe, it, expect, beforeEach } from 'vitest'
import { EntityManager } from '../EntityManager'
import { ComponentManager } from '../ComponentManager'
import { EntityFactory } from '../EntityFactory'
import { MovementSystem } from '../systems/MovementSystem'
import type { TransformComponent, MovementComponent } from '@/types/ecs'
import { ComponentType } from '@/types/ecs'

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
