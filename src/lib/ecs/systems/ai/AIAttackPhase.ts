/**
 * AI Attack Phase — send combat units to player base (300s+)
 * Also continues economy and production
 */

import type {
	CombatComponent,
	Entity,
	MovementComponent,
	OwnerComponent,
	TransformComponent,
} from '@/types/ecs'
import { ComponentType } from '@/types/ecs'
import type { EntityFactory } from '../../EntityFactory'
import type { EntityManager } from '../../EntityManager'
import {
	findBuildingOfType,
	getSupplyInfo,
	placeBuilding,
	sendWorkersToGather,
	trainFromBuilding,
} from './aiHelpers'

export function executeAttackPhase(
	entities: Entity[],
	factory: EntityFactory,
	em: EntityManager,
): void {
	// Find all AI combat units (non-workers with combat component)
	const combatUnits = entities.filter((e) => {
		const combat = e.components.get(ComponentType.COMBAT)
		const carrier = e.components.get(ComponentType.RESOURCE_CARRIER)
		return combat && !carrier
	})

	// Target: player1 base area
	const targetPos = { x: 20, y: 0, z: 20 }

	for (const unit of combatUnits) {
		const movement = unit.components.get(ComponentType.MOVEMENT) as MovementComponent | undefined
		if (movement) {
			movement.targetPosition = { ...targetPos }
		}

		// Find nearest player1 entity to set combat target
		const combat = unit.components.get(ComponentType.COMBAT) as CombatComponent | undefined
		const transform = unit.components.get(ComponentType.TRANSFORM) as TransformComponent | undefined
		if (combat && transform && !combat.targetId) {
			const allEntities = em.getAllEntities()
			let nearest: Entity | null = null
			let nearestDist = Infinity

			for (const other of allEntities) {
				const otherOwner = other.components.get(ComponentType.OWNER) as OwnerComponent | undefined
				if (!otherOwner || otherOwner.playerId !== 'player1') continue

				const otherTransform = other.components.get(ComponentType.TRANSFORM) as
					| TransformComponent
					| undefined
				if (!otherTransform) continue

				const dx = otherTransform.position.x - transform.position.x
				const dz = otherTransform.position.z - transform.position.z
				const dist = dx * dx + dz * dz
				if (dist < nearestDist) {
					nearestDist = dist
					nearest = other
				}
			}

			if (nearest) {
				combat.targetId = nearest.id
			}
		}
	}

	// Also continue economy
	const supply = getSupplyInfo(entities)
	const barracks = findBuildingOfType(entities, 'barracks')
	if (barracks && supply.used + 1 <= supply.max) {
		trainFromBuilding(barracks, 'marine')
	}

	const factoryBuilding = findBuildingOfType(entities, 'factory')
	if (factoryBuilding && supply.used + 3 <= supply.max) {
		trainFromBuilding(factoryBuilding, 'siege_tank')
	}

	if (supply.max - supply.used < 4) {
		placeBuilding(factory, 'supply_depot')
	}

	sendWorkersToGather(entities, em)
}
