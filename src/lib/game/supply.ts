/**
 * Supply calculation utility
 * Calculates supply used and max for a given player
 */

import { getBuildingDef } from '@/config/buildings'
import type {
	BuildingComponent,
	Entity,
	HealthComponent,
	MovementComponent,
	OwnerComponent,
} from '@/types/ecs'
import { ComponentType } from '@/types/ecs'

export function calculateSupplyFromEntities(
	entities: Entity[],
	playerId: string,
): { used: number; max: number } {
	let used = 0
	let max = 0

	for (const entity of entities) {
		const owner = entity.components.get(ComponentType.OWNER) as OwnerComponent | undefined
		if (!owner || owner.playerId !== playerId) continue

		const building = entity.components.get(ComponentType.BUILDING) as BuildingComponent | undefined
		if (building) {
			if (building.buildProgress >= 1) {
				const def = getBuildingDef(building.buildingType)
				max += def.supplyProvided
			}
		} else {
			const movement = entity.components.get(ComponentType.MOVEMENT) as
				| MovementComponent
				| undefined
			if (movement) {
				const health = entity.components.get(ComponentType.HEALTH) as HealthComponent | undefined
				if (health) {
					if (health.max === 160) {
						used += 3 // siege_tank
					} else if (health.max === 150) {
						used += 2 // medivac
					} else {
						used += 1 // worker or marine
					}
				}
			}
		}
	}

	return { used, max }
}
