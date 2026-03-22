/**
 * Shield System - Regenerates shields over time for Protoss entities
 */

import { ComponentType, type Entity, type HealthComponent } from '@/types/ecs'
import { System } from '../SystemManager'

const SHIELD_REGEN_RATE = 2 // shields per second

export class ShieldSystem extends System {
	readonly requiredComponents = [ComponentType.HEALTH] as ComponentType[]
	readonly priority = 3 // Run early, before combat

	update(entities: Entity[], deltaTime: number): void {
		for (const entity of entities) {
			const health = entity.components.get(ComponentType.HEALTH) as HealthComponent
			if (!health || !health.maxShields || health.maxShields <= 0) continue
			if (health.current <= 0) continue // Dead entities don't regen

			const currentShields = health.shields ?? 0
			if (currentShields >= health.maxShields) continue

			health.shields = Math.min(
				health.maxShields,
				currentShields + SHIELD_REGEN_RATE * deltaTime,
			)
		}
	}
}
