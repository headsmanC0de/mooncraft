/**
 * Resource System - Handles worker resource gathering
 */

import {
	ComponentType,
	type Entity,
	type OwnerComponent,
	type ResourceCarrierComponent,
	type ResourceComponent,
} from '@/types/ecs'
import { GAME_CONFIG } from '@/config/game'
import type { EntityManager } from '../EntityManager'
import { entityManager as defaultEntityManager } from '../EntityManager'
import type { ComponentManager } from '../ComponentManager'
import { componentManager as defaultComponentManager } from '../ComponentManager'
import { System } from '../SystemManager'

export type DepositCallback = (playerId: string, amount: number) => void

export class ResourceSystem extends System {
	readonly requiredComponents = [ComponentType.RESOURCE_CARRIER, ComponentType.TRANSFORM] as ComponentType[]
	readonly priority = 8
	private entityManager: EntityManager
	private componentManager: ComponentManager
	private onDeposit: DepositCallback | null = null

	constructor(entityManager?: EntityManager, componentManager?: ComponentManager) {
		super()
		this.entityManager = entityManager ?? defaultEntityManager
		this.componentManager = componentManager ?? defaultComponentManager
	}

	setDepositCallback(callback: DepositCallback): void {
		this.onDeposit = callback
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
					this.processReturning(entity, carrier)
					break
				case 'idle':
				case 'moving_to_resource':
					break
			}
		}
	}

	private processReturning(entity: Entity, carrier: ResourceCarrierComponent): void {
		if (carrier.currentLoad > 0 && this.onDeposit) {
			const owner = entity.components.get(ComponentType.OWNER) as OwnerComponent
			if (owner) {
				this.onDeposit(owner.playerId, carrier.currentLoad)
			}
		}
		carrier.currentLoad = 0
		carrier.state = carrier.targetResourceId ? 'gathering' : 'idle'
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
