/**
 * Game Manager - Checks win/lose conditions
 * Victory when all player2 buildings destroyed
 * Defeat when all player1 buildings destroyed
 */

import { entityManager } from '@/lib/ecs'
import { ComponentType } from '@/types/ecs'
import type { BuildingComponent, OwnerComponent } from '@/types/ecs'

export type GameStatus = 'playing' | 'victory' | 'defeat'

export function checkGameStatus(): GameStatus {
	const buildings = entityManager.queryEntities(ComponentType.BUILDING, ComponentType.OWNER)

	let player1HasBuildings = false
	let player2HasBuildings = false

	for (const entity of buildings) {
		const owner = entity.components.get(ComponentType.OWNER) as OwnerComponent
		const building = entity.components.get(ComponentType.BUILDING) as BuildingComponent
		if (!owner || !building) continue

		// Only count completed buildings
		if (building.buildProgress >= 1) {
			if (owner.playerId === 'player1') player1HasBuildings = true
			if (owner.playerId === 'player2') player2HasBuildings = true
		}
	}

	if (!player1HasBuildings) return 'defeat'
	if (!player2HasBuildings) return 'victory'
	return 'playing'
}
