/**
 * Resource System - Handles worker resource gathering
 */

import {
	ComponentType,
	type Entity,
	type ResourceCarrierComponent,
	type ResourceComponent,
} from '@/types/ecs'
import { GAME_CONFIG } from '@/config/game'
import type { EntityManager } from '../EntityManager'
import { entityManager as defaultEntityManager } from '../EntityManager'
import type { ComponentManager } from '../ComponentManager'
import { componentManager as defaultComponentManager } from '../ComponentManager'
import { System } from '../SystemManager'

export class ResourceSystem extends System {
	readonly requiredComponents = [ComponentType.RESOURCE_CARRIER, ComponentType.TRANSFORM] as ComponentType[]
	readonly priority = 8
	private entityManager: EntityManager
	private componentManager: ComponentManager

	constructor(entityManager?: EntityManager, componentManager?: ComponentManager) {
		super()
		this.entityManager = entityManager ?? defaultEntityManager
		this.componentManager = componentManager ?? defaultComponentManager
	}

	update(entities: Entity[], deltaTime: number): void {
		for (const entity of entities) {
			const carrier = entity.components.get(ComponentType.RESOURCE_CARRIER) as ResourceCarrierComponent
			if (!carrier) continue

			switch (carrier.state) {
				case 'gathering':
					this.processGathering(carrier, deltaTime)
					break
				case 'returning':
					// Simplified: instant return, reset load, go back to gathering
					carrier.currentLoad = 0
					carrier.state = carrier.targetResourceId ? 'gathering' : 'idle'
					break
				case 'idle':
				case 'moving_to_resource':
					break
			}
		}
	}

	private processGathering(carrier: ResourceCarrierComponent, deltaTime: number): void {
		if (!carrier.targetResourceId) {
			carrier.state = 'idle'
			return
		}

		const resource = this.componentManager.getComponent<ResourceComponent>(
			carrier.targetResourceId,
			ComponentType.RESOURCE,
		)
		if (!resource || resource.amount <= 0) {
			carrier.state = 'idle'
			carrier.targetResourceId = null
			return
		}

		carrier.gatherTimer += deltaTime
		const interval = GAME_CONFIG.mineralPatch.gatherInterval

		if (carrier.gatherTimer >= interval) {
			carrier.gatherTimer -= interval
			const amount = Math.min(carrier.gatherRate, resource.amount, carrier.maxCapacity - carrier.currentLoad)
			resource.amount -= amount
			carrier.currentLoad += amount

			if (carrier.currentLoad >= carrier.maxCapacity) {
				carrier.state = 'returning'
			}
		}
	}
}
