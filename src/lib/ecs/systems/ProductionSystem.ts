/**
 * Production System - Processes building production queues
 * Spawns units when production completes
 */

import type { BuildingComponent, Entity, OwnerComponent } from '@/types/ecs'
import { ComponentType } from '@/types/ecs'
import type { ComponentManager } from '../ComponentManager'
import { componentManager as defaultCM } from '../ComponentManager'
import { EntityFactory } from '../EntityFactory'
import type { EntityManager } from '../EntityManager'
import { entityManager as defaultEM } from '../EntityManager'
import { System } from '../SystemManager'

export class ProductionSystem extends System {
	readonly requiredComponents = [ComponentType.BUILDING, ComponentType.OWNER]
	readonly priority = 6
	private factory: EntityFactory

	constructor(em: EntityManager = defaultEM, cm: ComponentManager = defaultCM) {
		super()
		this.factory = new EntityFactory(em, cm)
	}

	update(entities: Entity[], deltaTime: number): void {
		for (const entity of entities) {
			const building = entity.components.get(ComponentType.BUILDING) as BuildingComponent
			const owner = entity.components.get(ComponentType.OWNER) as OwnerComponent
			if (!building || !owner || building.buildProgress < 1 || building.queue.length === 0) continue

			// Process first item in queue
			const item = building.queue[0]
			item.progress += deltaTime

			if (item.progress >= item.duration) {
				// Spawn unit at rally point
				this.factory.createUnit(item.type, owner.playerId, owner.teamId, building.rallyPoint, owner.faction)
				building.queue.shift()
			}
		}
	}
}
