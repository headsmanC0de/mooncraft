/**
 * Combat System - Handles attacks and damage
 */

import { System } from '../SystemManager'
import { ComponentType, type Entity, type CombatComponent, type TransformComponent, type HealthComponent } from '@/types/ecs'
import { componentManager, entityManager } from '../index'

export class CombatSystem extends System {
  readonly requiredComponents = [
    ComponentType.TRANSFORM,
    ComponentType.COMBAT,
    ComponentType.HEALTH,
  ] as ComponentType[]
  readonly priority = 20

  update(entities: Entity[], deltaTime: number): void {
    for (const entity of entities) {
      const combat = entity.components.get(ComponentType.COMBAT) as CombatComponent

      // Reduce cooldown
      if (combat.attackCooldown > 0) {
        combat.attackCooldown -= deltaTime
      }

      // Attack if ready and has target
      if (combat.targetId && combat.attackCooldown <= 0) {
        this.tryAttack(entity, combat)
      }
    }
  }

  private tryAttack(attacker: Entity, combat: CombatComponent): void {
    const target = entityManager.getEntity(combat.targetId!)
    if (!target) {
      combat.targetId = null
      return
    }

    const attackerTransform = attacker.components.get(ComponentType.TRANSFORM) as TransformComponent
    const targetTransform = target.components.get(ComponentType.TRANSFORM) as TransformComponent
    const targetHealth = target.components.get(ComponentType.HEALTH) as HealthComponent

    // Check if target is dead
    if (targetHealth.current <= 0) {
      combat.targetId = null
      return
    }

    // Check range
    const distance = this.getDistance(attackerTransform.position, targetTransform.position)
    if (distance > combat.attackRange) {
      // Too far, need to move closer (handled by AI system)
      return
    }

    // Perform attack
    this.dealDamage(target, combat.attackDamage, targetHealth)
    combat.attackCooldown = 1 / combat.attackSpeed // Reset cooldown
  }

  private dealDamage(
    target: Entity,
    damage: number,
    health: HealthComponent
  ): void {
    // Apply armor reduction
    const actualDamage = Math.max(1, damage - health.armor)
    
    // Damage shields first if present
    if (health.shields && health.shields > 0) {
      const shieldDamage = Math.min(health.shields, actualDamage)
      health.shields -= shieldDamage
      const remainingDamage = actualDamage - shieldDamage
      if (remainingDamage > 0) {
        health.current -= remainingDamage
      }
    } else {
      health.current -= actualDamage
    }

    // Check death
    if (health.current <= 0) {
      health.current = 0
      // Death handled by separate system
    }
  }

  private getDistance(a: { x: number; z: number }, b: { x: number; z: number }): number {
    const dx = b.x - a.x
    const dz = b.z - a.z
    return Math.sqrt(dx * dx + dz * dz)
  }
}
