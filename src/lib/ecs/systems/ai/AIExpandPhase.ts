/**
 * AI Expand Phase — grow army and economy (120-300s)
 * Trains more workers, marines, siege tanks; builds factory
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

export function executeExpandPhase(
	entities: Entity[],
	factory: EntityFactory,
	em: EntityManager,
): void {
	const workerCount = countWorkers(entities)
	const factoryCount = countByType(entities, ComponentType.BUILDING, 'factory')
	const supply = getSupplyInfo(entities)

	// Train workers up to 12
	if (workerCount < 12) {
		const cc = findBuildingOfType(entities, 'command_center')
		if (cc && supply.used < supply.max) {
			trainFromBuilding(cc, 'worker')
		}
	}

	// Train marines from barracks
	const barracks = findBuildingOfType(entities, 'barracks')
	if (barracks && supply.used + 1 <= supply.max) {
		trainFromBuilding(barracks, 'marine')
	}

	// Build factory if none
	if (factoryCount === 0) {
		placeBuilding(factory, 'factory')
	}

	// Train siege tanks from factory
	const factoryBuilding = findBuildingOfType(entities, 'factory')
	if (factoryBuilding && supply.used + 3 <= supply.max) {
		trainFromBuilding(factoryBuilding, 'siege_tank')
	}

	// Build supply depots as needed
	if (supply.max - supply.used < 4) {
		placeBuilding(factory, 'supply_depot')
	}

	sendWorkersToGather(entities, em)
}
