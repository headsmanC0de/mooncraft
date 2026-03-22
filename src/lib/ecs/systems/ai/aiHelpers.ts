/**
 * AI Helpers — shared utilities for AI phase modules
 */

import { getBuildingDef } from '@/config/buildings'
import { getUnitDef } from '@/config/units'
import { calculateSupplyFromEntities } from '@/lib/game/supply'
import { useGameStore } from '@/stores/gameStore'
import type {
	BuildingComponent,
	Entity,
	ResourceCarrierComponent,
	TransformComponent,
} from '@/types/ecs'
import { ComponentType } from '@/types/ecs'
import type { EntityFactory } from '../../EntityFactory'
import type { EntityManager } from '../../EntityManager'

export function getPlayer2Resources() {
	const state = useGameStore.getState()
	return state.players.get('player2')
}

export function deductResources(minerals: number, gas: number): boolean {
	const state = useGameStore.getState()
	const player = state.players.get('player2')
	if (!player) return false
	if (player.resources.minerals < minerals || player.resources.gas < gas) return false

	const players = new Map(state.players)
	players.set('player2', {
		...player,
		resources: {
			...player.resources,
			minerals: player.resources.minerals - minerals,
			gas: player.resources.gas - gas,
		},
	})
	useGameStore.setState({ players })
	return true
}

export function getSupplyInfo(aiEntities: Entity[]): { used: number; max: number } {
	return calculateSupplyFromEntities(aiEntities, 'player2')
}

export function countByType(
	entities: Entity[],
	componentType: ComponentType.BUILDING,
	buildingType: string,
): number {
	return entities.filter((e) => {
		const building = e.components.get(componentType) as BuildingComponent | undefined
		return building?.buildingType === buildingType
	}).length
}

export function countWorkers(entities: Entity[]): number {
	return entities.filter((e) => {
		const carrier = e.components.get(ComponentType.RESOURCE_CARRIER)
		return !!carrier
	}).length
}

export function findBuildingOfType(entities: Entity[], buildingType: string): Entity | undefined {
	return entities.find((e) => {
		const building = e.components.get(ComponentType.BUILDING) as BuildingComponent | undefined
		return building?.buildingType === buildingType && building.buildProgress >= 1
	})
}

export function trainFromBuilding(entity: Entity, unitType: string): void {
	const building = entity.components.get(ComponentType.BUILDING) as BuildingComponent
	if (!building || building.buildProgress < 1) return
	if (building.queue.length >= 2) return

	const unitDef = getUnitDef(unitType)
	const player = getPlayer2Resources()
	if (!player) return

	if (
		player.resources.minerals < unitDef.cost.minerals ||
		player.resources.gas < unitDef.cost.gas
	) {
		return
	}

	if (!deductResources(unitDef.cost.minerals, unitDef.cost.gas)) return

	building.queue.push({
		type: unitType,
		progress: 0,
		duration: unitDef.buildTime,
	})
}

export function placeBuilding(factory: EntityFactory, buildingType: string): void {
	const def = getBuildingDef(buildingType)
	if (!deductResources(def.cost.minerals, def.cost.gas)) return

	const offsetX = (Math.random() - 0.5) * 10
	const offsetZ = (Math.random() - 0.5) * 10
	const position = {
		x: 108 + offsetX,
		y: 0,
		z: 108 + offsetZ,
	}

	factory.createBuilding(buildingType, 'player2', 'team2', position)
}

export function sendWorkersToGather(entities: Entity[], em: EntityManager): void {
	const workers = entities.filter((e) => {
		const carrier = e.components.get(ComponentType.RESOURCE_CARRIER) as
			| ResourceCarrierComponent
			| undefined
		return carrier?.state === 'idle'
	})

	const allEntities = em.getAllEntities()
	const minerals = allEntities.filter((e) => {
		const resource = e.components.get(ComponentType.RESOURCE)
		if (!resource) return false
		const transform = e.components.get(ComponentType.TRANSFORM) as TransformComponent | undefined
		if (!transform) return false
		return transform.position.x > 100
	})

	if (minerals.length === 0) return

	for (const worker of workers) {
		const mineral = minerals[Math.floor(Math.random() * minerals.length)]
		const carrier = worker.components.get(
			ComponentType.RESOURCE_CARRIER,
		) as ResourceCarrierComponent
		carrier.state = 'gathering'
		carrier.targetResourceId = mineral.id

		const cc = entities.find((e) => {
			const b = e.components.get(ComponentType.BUILDING) as BuildingComponent | undefined
			return b?.buildingType === 'command_center' && b.buildProgress >= 1
		})
		if (cc) {
			carrier.returnBuildingId = cc.id
		}
	}
}
