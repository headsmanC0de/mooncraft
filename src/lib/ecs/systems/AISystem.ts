/**
 * AI System - Simple state machine AI for player2
 * Phases: BUILD (0-120s), EXPAND (120-300s), ATTACK (300s+)
 */

import { ComponentType } from '@/types/ecs'
import type {
	BuildingComponent,
	CombatComponent,
	Entity,
	MovementComponent,
	OwnerComponent,
	ResourceCarrierComponent,
	TransformComponent,
} from '@/types/ecs'
import { getBuildingDef } from '@/config/buildings'
import { getUnitDef } from '@/config/units'
import { System } from '../SystemManager'
import { EntityFactory } from '../EntityFactory'
import type { EntityManager } from '../EntityManager'
import { entityManager as defaultEM } from '../EntityManager'
import type { ComponentManager } from '../ComponentManager'
import { componentManager as defaultCM } from '../ComponentManager'
import { useGameStore } from '@/stores/gameStore'

export class AISystem extends System {
	readonly requiredComponents = [ComponentType.OWNER]
	readonly priority = 50
	private timer = 0
	private decisionInterval = 3 // seconds
	private gameTime = 0
	private factory: EntityFactory
	private em: EntityManager
	private cm: ComponentManager

	constructor(em?: EntityManager, cm?: ComponentManager) {
		super()
		this.em = em ?? defaultEM
		this.cm = cm ?? defaultCM
		this.factory = new EntityFactory(this.em, this.cm)
	}

	update(entities: Entity[], deltaTime: number): void {
		this.timer += deltaTime
		this.gameTime += deltaTime
		if (this.timer < this.decisionInterval) return
		this.timer = 0

		const aiEntities = entities.filter((e) => {
			const owner = e.components.get(ComponentType.OWNER) as OwnerComponent
			return owner?.playerId === 'player2'
		})

		if (this.gameTime < 120) {
			this.buildPhase(aiEntities)
		} else if (this.gameTime < 300) {
			this.expandPhase(aiEntities)
		} else {
			this.attackPhase(aiEntities)
		}
	}

	private getPlayer2Resources() {
		const state = useGameStore.getState()
		return state.players.get('player2')
	}

	private deductResources(minerals: number, gas: number): boolean {
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

	private getSupplyInfo(aiEntities: Entity[]): { used: number; max: number } {
		let used = 0
		let max = 0

		for (const entity of aiEntities) {
			const building = entity.components.get(ComponentType.BUILDING) as BuildingComponent | undefined
			if (building && building.buildProgress >= 1) {
				const def = getBuildingDef(building.buildingType)
				max += def.supplyProvided
			} else if (!building) {
				const movement = entity.components.get(ComponentType.MOVEMENT) as MovementComponent | undefined
				if (movement) {
					const health = entity.components.get(ComponentType.HEALTH) as
						| { current: number; max: number }
						| undefined
					if (health) {
						if (health.max === 160) {
							used += 3
						} else if (health.max === 150) {
							used += 2
						} else {
							used += 1
						}
					}
				}
			}
		}

		return { used, max }
	}

	private countByType(
		entities: Entity[],
		componentType: ComponentType.BUILDING,
		buildingType: string,
	): number {
		return entities.filter((e) => {
			const building = e.components.get(componentType) as BuildingComponent | undefined
			return building?.buildingType === buildingType
		}).length
	}

	private countWorkers(entities: Entity[]): number {
		return entities.filter((e) => {
			const carrier = e.components.get(ComponentType.RESOURCE_CARRIER)
			return !!carrier
		}).length
	}

	private findBuildingOfType(entities: Entity[], buildingType: string): Entity | undefined {
		return entities.find((e) => {
			const building = e.components.get(ComponentType.BUILDING) as BuildingComponent | undefined
			return building?.buildingType === buildingType && building.buildProgress >= 1
		})
	}

	private trainFromBuilding(entity: Entity, unitType: string): void {
		const building = entity.components.get(ComponentType.BUILDING) as BuildingComponent
		if (!building || building.buildProgress < 1) return
		if (building.queue.length >= 2) return

		const unitDef = getUnitDef(unitType)
		const player = this.getPlayer2Resources()
		if (!player) return

		if (
			player.resources.minerals < unitDef.cost.minerals ||
			player.resources.gas < unitDef.cost.gas
		) {
			return
		}

		if (!this.deductResources(unitDef.cost.minerals, unitDef.cost.gas)) return

		building.queue.push({
			type: unitType,
			progress: 0,
			duration: unitDef.buildTime,
		})
	}

	private placeBuilding(buildingType: string): void {
		const def = getBuildingDef(buildingType)
		if (!this.deductResources(def.cost.minerals, def.cost.gas)) return

		// Place near AI base with some offset
		const offsetX = (Math.random() - 0.5) * 10
		const offsetZ = (Math.random() - 0.5) * 10
		const position = {
			x: 108 + offsetX,
			y: 0,
			z: 108 + offsetZ,
		}

		this.factory.createBuilding(buildingType, 'player2', 'team2', position)
	}

	private sendWorkersToGather(entities: Entity[]): void {
		const workers = entities.filter((e) => {
			const carrier = e.components.get(ComponentType.RESOURCE_CARRIER) as
				| ResourceCarrierComponent
				| undefined
			return carrier?.state === 'idle'
		})

		// Find mineral patches near AI base
		const allEntities = this.em.getAllEntities()
		const minerals = allEntities.filter((e) => {
			const resource = e.components.get(ComponentType.RESOURCE)
			if (!resource) return false
			const transform = e.components.get(ComponentType.TRANSFORM) as TransformComponent | undefined
			if (!transform) return false
			// Near AI base
			return transform.position.x > 100
		})

		if (minerals.length === 0) return

		for (const worker of workers) {
			const mineral = minerals[Math.floor(Math.random() * minerals.length)]
			const carrier = worker.components.get(ComponentType.RESOURCE_CARRIER) as ResourceCarrierComponent
			carrier.state = 'gathering'
			carrier.targetResourceId = mineral.id

			// Find CC for return building
			const cc = entities.find((e) => {
				const b = e.components.get(ComponentType.BUILDING) as BuildingComponent | undefined
				return b?.buildingType === 'command_center' && b.buildProgress >= 1
			})
			if (cc) {
				carrier.returnBuildingId = cc.id
			}
		}
	}

	private buildPhase(entities: Entity[]): void {
		const workerCount = this.countWorkers(entities)
		const supplyDepotCount = this.countByType(entities, ComponentType.BUILDING, 'supply_depot')
		const barracksCount = this.countByType(entities, ComponentType.BUILDING, 'barracks')
		const supply = this.getSupplyInfo(entities)

		// Train workers if < 8
		if (workerCount < 8) {
			const cc = this.findBuildingOfType(entities, 'command_center')
			if (cc && supply.used < supply.max) {
				this.trainFromBuilding(cc, 'worker')
			}
		}

		// Build supply depot if none
		if (supplyDepotCount === 0) {
			this.placeBuilding('supply_depot')
		}

		// Build barracks if none
		if (barracksCount === 0) {
			this.placeBuilding('barracks')
		}

		// Send idle workers to gather
		this.sendWorkersToGather(entities)
	}

	private expandPhase(entities: Entity[]): void {
		const workerCount = this.countWorkers(entities)
		const factoryCount = this.countByType(entities, ComponentType.BUILDING, 'factory')
		const supply = this.getSupplyInfo(entities)

		// Train workers up to 12
		if (workerCount < 12) {
			const cc = this.findBuildingOfType(entities, 'command_center')
			if (cc && supply.used < supply.max) {
				this.trainFromBuilding(cc, 'worker')
			}
		}

		// Train marines from barracks
		const barracks = this.findBuildingOfType(entities, 'barracks')
		if (barracks && supply.used + 1 <= supply.max) {
			this.trainFromBuilding(barracks, 'marine')
		}

		// Build factory if none
		if (factoryCount === 0) {
			this.placeBuilding('factory')
		}

		// Train siege tanks from factory
		const factory = this.findBuildingOfType(entities, 'factory')
		if (factory && supply.used + 3 <= supply.max) {
			this.trainFromBuilding(factory, 'siege_tank')
		}

		// Build supply depots as needed
		if (supply.max - supply.used < 4) {
			this.placeBuilding('supply_depot')
		}

		this.sendWorkersToGather(entities)
	}

	private attackPhase(entities: Entity[]): void {
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
				const allEntities = this.em.getAllEntities()
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
		const supply = this.getSupplyInfo(entities)
		const barracks = this.findBuildingOfType(entities, 'barracks')
		if (barracks && supply.used + 1 <= supply.max) {
			this.trainFromBuilding(barracks, 'marine')
		}

		const factory = this.findBuildingOfType(entities, 'factory')
		if (factory && supply.used + 3 <= supply.max) {
			this.trainFromBuilding(factory, 'siege_tank')
		}

		if (supply.max - supply.used < 4) {
			this.placeBuilding('supply_depot')
		}

		this.sendWorkersToGather(entities)
	}
}
