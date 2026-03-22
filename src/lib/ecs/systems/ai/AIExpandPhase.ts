/**
 * AI Expand Phase — grow army and economy (120-300s)
 * Trains more workers, basic and heavy units; builds advanced military
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

export function executeExpandPhase(
	entities: Entity[],
	factory: EntityFactory,
	em: EntityManager,
	faction: 'terran' | 'protoss' = 'terran',
): void {
	const m = getFactionMapping(faction)
	const workerCount = countWorkers(entities)
	const advancedMilitaryCount = countByType(entities, ComponentType.BUILDING, m.advancedMilitary)
	const supply = getSupplyInfo(entities)

	// Train workers up to 12
	if (workerCount < 12) {
		const cc = findBuildingOfType(entities, m.mainBuilding)
		if (cc && supply.used < supply.max) {
			trainFromBuilding(cc, m.worker)
		}
	}

	// Train basic units from military building
	const militaryBuilding = findBuildingOfType(entities, m.basicMilitary)
	if (militaryBuilding && supply.used + 1 <= supply.max) {
		trainFromBuilding(militaryBuilding, m.basicUnit)
	}

	// Build advanced military if none
	if (advancedMilitaryCount === 0) {
		placeBuilding(factory, m.advancedMilitary)
	}

	// Train heavy units from advanced military
	const advancedBuilding = findBuildingOfType(entities, m.advancedMilitary)
	if (advancedBuilding && supply.used + 3 <= supply.max) {
		trainFromBuilding(advancedBuilding, m.heavyUnit)
	}

	// Build supply buildings as needed
	if (supply.max - supply.used < 4) {
		placeBuilding(factory, m.supplyBuilding)
	}

	sendWorkersToGather(entities, em)
}
