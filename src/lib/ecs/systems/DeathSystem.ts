/**
 * Death System - Removes entities with 0 or less HP
 * Runs last so all other systems process before cleanup
 */

import type { Entity, HealthComponent } from '@/types/ecs'
import { ComponentType } from '@/types/ecs'
import type { EntityManager } from '../EntityManager'
import { entityManager as defaultEM } from '../EntityManager'
import { System } from '../SystemManager'

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
