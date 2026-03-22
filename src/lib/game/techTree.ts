import { componentManager, entityManager } from '@/lib/ecs'
import { ComponentType } from '@/types/ecs'
import type { BuildingComponent, Entity, OwnerComponent } from '@/types/ecs'
import { getBuildingDef } from '@/config/buildings'

/**
 * Check if a player has met the requirements to build a specific building.
 * Requirements are other building types that must be completed.
 *
 * Optionally accepts an entity list for testability; defaults to querying
 * the global entity manager.
 */
export function canBuild(
	buildingType: string,
	playerId: string,
	entities?: Entity[],
): boolean {
	const def = getBuildingDef(buildingType)
	if (def.requirements.length === 0) return true

	const resolved =
		entities ??
		entityManager.queryEntities(ComponentType.BUILDING, ComponentType.OWNER)

	const playerBuildings = new Set<string>()

	for (const entity of resolved) {
		const owner = entity.components.get(ComponentType.OWNER) as
			| OwnerComponent
			| undefined
		const building = entity.components.get(ComponentType.BUILDING) as
			| BuildingComponent
			| undefined
		if (!owner || !building) continue
		if (owner.playerId !== playerId) continue
		if (building.buildProgress >= 1) {
			playerBuildings.add(building.buildingType)
		}
	}

	return def.requirements.every((req) => playerBuildings.has(req))
}
