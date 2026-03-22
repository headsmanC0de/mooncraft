/**
 * Death System - Removes entities with 0 or less HP
 * Runs last so all other systems process before cleanup
 */

import { ComponentType } from '@/types/ecs'
import type { Entity, HealthComponent } from '@/types/ecs'
import { System } from '../SystemManager'
import { entityManager as defaultEM } from '../EntityManager'
import type { EntityManager } from '../EntityManager'

export class DeathSystem extends System {
	readonly requiredComponents = [ComponentType.HEALTH] as ComponentType[]
	readonly priority = 99 // Run last, after all other systems

	constructor(private em: EntityManager = defaultEM) {
		super()
	}

	update(entities: Entity[], _deltaTime: number): void {
		const toRemove: string[] = []

		for (const entity of entities) {
			const health = entity.components.get(ComponentType.HEALTH) as HealthComponent
			if (!health) continue
			if (health.current <= 0) {
				toRemove.push(entity.id)
			}
		}

		for (const id of toRemove) {
			this.em.destroyEntity(id)
		}
	}
}
