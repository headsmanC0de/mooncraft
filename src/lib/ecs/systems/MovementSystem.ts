/**
 * Movement System - Handles entity movement and pathfinding
 */

import { System } from '../SystemManager'
import { ComponentType, type Entity, type MovementComponent, type TransformComponent } from '@/types/ecs'

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
    }
  }

  private moveTowards(
    transform: TransformComponent,
    movement: MovementComponent,
    deltaTime: number
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
