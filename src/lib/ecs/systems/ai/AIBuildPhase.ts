/**
 * AI Build Phase — economy bootstrap (0-120s)
 * Trains workers, builds first supply building and basic military
 */

import type { Entity } from '@/types/ecs'
import { ComponentType } from '@/types/ecs'
import type { EntityFactory } from '../../EntityFactory'
import type { EntityManager } from '../../EntityManager'
import {
	countByType,
	countWorkers,
	findBuildingOfType,
	getFactionMapping,
	getSupplyInfo,
	placeBuilding,
	sendWorkersToGather,
	trainFromBuilding,
} from './aiHelpers'

export function executeBuildPhase(
	entities: Entity[],
	factory: EntityFactory,
	em: EntityManager,
	faction: 'terran' | 'protoss' = 'terran',
): void {
	const m = getFactionMapping(faction)
	const workerCount = countWorkers(entities)
	const supplyBuildingCount = countByType(entities, ComponentType.BUILDING, m.supplyBuilding)
	const basicMilitaryCount = countByType(entities, ComponentType.BUILDING, m.basicMilitary)
	const supply = getSupplyInfo(entities)

	// Train workers if < 8
	if (workerCount < 8) {
		const cc = findBuildingOfType(entities, m.mainBuilding)
		if (cc && supply.used < supply.max) {
			trainFromBuilding(cc, m.worker)
		}
	}

	// Build supply building if none
	if (supplyBuildingCount === 0) {
		placeBuilding(factory, m.supplyBuilding)
	}

	// Build basic military building if none
	if (basicMilitaryCount === 0) {
		placeBuilding(factory, m.basicMilitary)
	}

	// Send idle workers to gather
	sendWorkersToGather(entities, em)
}
