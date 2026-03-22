/**
 * AI Build Phase — economy bootstrap (0-120s)
 * Trains workers, builds first supply depot and barracks
 */

import type { Entity } from '@/types/ecs'
import { ComponentType } from '@/types/ecs'
import type { EntityFactory } from '../../EntityFactory'
import type { EntityManager } from '../../EntityManager'
import {
	countByType,
	countWorkers,
	findBuildingOfType,
	getSupplyInfo,
	placeBuilding,
	sendWorkersToGather,
	trainFromBuilding,
} from './aiHelpers'

export function executeBuildPhase(
	entities: Entity[],
	factory: EntityFactory,
	em: EntityManager,
): void {
	const workerCount = countWorkers(entities)
	const supplyDepotCount = countByType(entities, ComponentType.BUILDING, 'supply_depot')
	const barracksCount = countByType(entities, ComponentType.BUILDING, 'barracks')
	const supply = getSupplyInfo(entities)

	// Train workers if < 8
	if (workerCount < 8) {
		const cc = findBuildingOfType(entities, 'command_center')
		if (cc && supply.used < supply.max) {
			trainFromBuilding(cc, 'worker')
		}
	}

	// Build supply depot if none
	if (supplyDepotCount === 0) {
		placeBuilding(factory, 'supply_depot')
	}

	// Build barracks if none
	if (barracksCount === 0) {
		placeBuilding(factory, 'barracks')
	}

	// Send idle workers to gather
	sendWorkersToGather(entities, em)
}
