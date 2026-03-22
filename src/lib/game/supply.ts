/**
 * Supply calculation utility
 * Calculates supply used and max for a given player
 */

import { getBuildingDef } from '@/config/buildings'
import { UNIT_DEFINITIONS } from '@/config/units'
import type {
	BuildingComponent,
	Entity,
	HealthComponent,
	MovementComponent,
	OwnerComponent,
} from '@/types/ecs'
import { ComponentType } from '@/types/ecs'

/**
 * Build a lookup from (faction, health.max) → supply cost
 * so we can determine supply cost from entity components.
 */
const supplyLookup = new Map<string, number>()
for (const def of Object.values(UNIT_DEFINITIONS)) {
	const key = `${def.faction}:${def.stats.health}`
	supplyLookup.set(key, def.cost.supply)
}

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
					const key = `${owner.faction}:${health.max}`
					const supplyCost = supplyLookup.get(key) ?? 1
					used += supplyCost
				}
			}
		}
	}

	return { used, max }
}
