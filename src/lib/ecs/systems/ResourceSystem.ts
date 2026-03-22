/**
 * Resource System - Handles worker resource gathering
 */

import { GAME_CONFIG } from '@/config/game'
import {
	ComponentType,
	type Entity,
	type MovementComponent,
	type OwnerComponent,
	type ResourceCarrierComponent,
	type ResourceComponent,
	type TransformComponent,
} from '@/types/ecs'
import type { ComponentManager } from '../ComponentManager'
import { componentManager as defaultComponentManager } from '../ComponentManager'
import { System } from '../SystemManager'

export type DepositCallback = (
	playerId: string,
	amount: number,
	resourceType: 'mineral' | 'gas',
) => void

export class ResourceSystem extends System {
	readonly requiredComponents = [
		ComponentType.RESOURCE_CARRIER,
		ComponentType.TRANSFORM,
	] as ComponentType[]
	readonly priority = 8
	private componentManager: ComponentManager
	private onDeposit: DepositCallback | null = null

	constructor(componentManager?: ComponentManager) {
		super()
		this.componentManager = componentManager ?? defaultComponentManager
	}

	setDepositCallback(callback: DepositCallback): void {
		this.onDeposit = callback
	}

	update(entities: Entity[], deltaTime: number): void {
		for (const entity of entities) {
			const carrier = entity.components.get(
				ComponentType.RESOURCE_CARRIER,
			) as ResourceCarrierComponent
			if (!carrier) continue

			const transform = entity.components.get(ComponentType.TRANSFORM) as TransformComponent

			switch (carrier.state) {
				case 'gathering':
					this.processGathering(carrier, deltaTime)
					break
				case 'returning':
					this.processReturning(entity, carrier)
					break
				case 'moving_to_resource':
					this.checkArrivalAtResource(entity, carrier, transform)
					break
				case 'idle':
					break
			}
		}
	}

	private processReturning(entity: Entity, carrier: ResourceCarrierComponent): void {
		if (carrier.currentLoad > 0 && this.onDeposit) {
			const owner = entity.components.get(ComponentType.OWNER) as OwnerComponent
			if (owner && carrier.targetResourceId) {
				const resource = this.componentManager.getComponent<ResourceComponent>(
					carrier.targetResourceId,
					ComponentType.RESOURCE,
				)
				const resourceType = resource?.resourceType ?? 'mineral'
				this.onDeposit(owner.playerId, carrier.currentLoad, resourceType)
			}
		}
		carrier.currentLoad = 0

		if (carrier.targetResourceId) {
			const resourceTransform = this.componentManager.getComponent<TransformComponent>(
				carrier.targetResourceId,
				ComponentType.TRANSFORM,
			)
			if (resourceTransform) {
				const movement = entity.components.get(ComponentType.MOVEMENT) as MovementComponent
				if (movement) {
					movement.targetPosition = { ...resourceTransform.position }
					movement.isMoving = true
				}
				carrier.state = 'moving_to_resource'
			} else {
				carrier.state = 'idle'
				carrier.targetResourceId = null
			}
		} else {
			carrier.state = 'idle'
		}
	}

	private checkArrivalAtResource(
		_entity: Entity,
		carrier: ResourceCarrierComponent,
		transform: TransformComponent,
	): void {
		if (!carrier.targetResourceId) {
			carrier.state = 'idle'
			return
		}

		const resourceTransform = this.componentManager.getComponent<TransformComponent>(
			carrier.targetResourceId,
			ComponentType.TRANSFORM,
		)
		if (!resourceTransform) {
			carrier.state = 'idle'
			carrier.targetResourceId = null
			return
		}

		const dx = resourceTransform.position.x - transform.position.x
		const dz = resourceTransform.position.z - transform.position.z
		const distance = Math.sqrt(dx * dx + dz * dz)

		if (distance < 1.5) {
			carrier.state = 'gathering'
			carrier.gatherTimer = 0
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
		const interval =
			resource.resourceType === 'gas'
				? GAME_CONFIG.gasGeyser.gatherInterval
				: GAME_CONFIG.mineralPatch.gatherInterval

		if (carrier.gatherTimer >= interval) {
			carrier.gatherTimer -= interval
			const amount = Math.min(
				carrier.gatherRate,
				resource.amount,
				carrier.maxCapacity - carrier.currentLoad,
			)
			resource.amount -= amount
			carrier.currentLoad += amount

			if (carrier.currentLoad >= carrier.maxCapacity) {
				carrier.state = 'returning'
			}
		}
	}
}
