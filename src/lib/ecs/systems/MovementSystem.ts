/**
 * Movement System - Handles entity movement and pathfinding
 */

import {
	ComponentType,
	type Entity,
	type MovementComponent,
	type TransformComponent,
} from '@/types/ecs'
import { System } from '../SystemManager'

export class MovementSystem extends System {
	readonly requiredComponents = [ComponentType.TRANSFORM, ComponentType.MOVEMENT] as ComponentType[]
	readonly priority = 10

	update(entities: Entity[], deltaTime: number): void {
		for (const entity of entities) {
			const transform = entity.components.get(ComponentType.TRANSFORM) as TransformComponent
			const movement = entity.components.get(ComponentType.MOVEMENT) as MovementComponent

			if (movement.targetPosition) {
				this.moveTowards(transform, movement, deltaTime)
			}

			this.applySeparation(entities, entity, transform)
		}
	}

	private applySeparation(
		entities: Entity[],
		currentEntity: Entity,
		transform: TransformComponent,
	): void {
		const separationRadius = 1.5
		const separationForce = 0.5

		let pushX = 0
		let pushZ = 0
		let neighbors = 0

		for (const other of entities) {
			if (other.id === currentEntity.id) continue
			const otherTransform = other.components.get(ComponentType.TRANSFORM) as TransformComponent
			if (!otherTransform) continue

			let dx = transform.position.x - otherTransform.position.x
			let dz = transform.position.z - otherTransform.position.z
			let dist = Math.sqrt(dx * dx + dz * dz)

			if (dist === 0) {
				// Nudge in a random-ish direction based on entity ids
				const angle = (currentEntity.id.charCodeAt(0) - other.id.charCodeAt(0) || 1) * 0.7854
				dx = Math.cos(angle)
				dz = Math.sin(angle)
				dist = 0.01
			}

			if (dist < separationRadius) {
				pushX += (dx / dist) * (separationRadius - dist)
				pushZ += (dz / dist) * (separationRadius - dist)
				neighbors++
			}
		}

		if (neighbors > 0) {
			transform.position.x += (pushX / neighbors) * separationForce
			transform.position.z += (pushZ / neighbors) * separationForce
		}
	}

	private moveTowards(
		transform: TransformComponent,
		movement: MovementComponent,
		deltaTime: number,
	): void {
		const dx = movement.targetPosition!.x - transform.position.x
		const dz = movement.targetPosition!.z - transform.position.z
		const distance = Math.sqrt(dx * dx + dz * dz)

		// Arrived at destination
		if (distance < 0.1) {
			movement.isMoving = false
			movement.targetPosition = null
			movement.path = []
			return
		}

		// Move towards target
		const speed = movement.speed * deltaTime
		const moveX = (dx / distance) * speed
		const moveZ = (dz / distance) * speed

		// Update position
		transform.position.x += moveX
		transform.position.z += moveZ

		// Update rotation to face direction
		transform.rotation = Math.atan2(dx, dz)

		movement.isMoving = true
	}
}
