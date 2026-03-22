/**
 * Entity Factory - Creates pre-configured entities from config definitions
 * KISS: Simple factory methods for common entity types
 */

import { getBuildingDef } from '@/config/buildings'
import { GAME_CONFIG } from '@/config/game'
import { getUnitDef } from '@/config/units'
import type { EntityId, Vector3 } from '@/types/ecs'
import { ComponentType } from '@/types/ecs'
import type { ComponentManager } from './ComponentManager'
import type { EntityManager } from './EntityManager'

export class EntityFactory {
	constructor(
		private entities: EntityManager,
		private components: ComponentManager,
	) {}

	createUnit(unitType: string, playerId: string, teamId: string, position: Vector3): EntityId {
		const def = getUnitDef(unitType)
		const id = this.entities.createEntity()

		this.components.addComponent(id, {
			type: ComponentType.TRANSFORM,
			position: { ...position },
			rotation: 0,
			scale: { x: def.modelScale, y: def.modelScale, z: def.modelScale },
		})
		this.components.addComponent(id, {
			type: ComponentType.HEALTH,
			current: def.stats.health,
			max: def.stats.health,
			armor: def.stats.armor,
		})
		this.components.addComponent(id, {
			type: ComponentType.MOVEMENT,
			speed: def.stats.speed,
			targetPosition: null,
			path: [],
			isMoving: false,
		})
		this.components.addComponent(id, {
			type: ComponentType.OWNER,
			playerId,
			teamId,
		})
		this.components.addComponent(id, {
			type: ComponentType.SELECTION,
			isSelected: false,
		})
		this.components.addComponent(id, {
			type: ComponentType.RENDER,
			color: def.color,
			visible: true,
		})
		if (def.combat) {
			this.components.addComponent(id, {
				type: ComponentType.COMBAT,
				attackDamage: def.combat.damage,
				attackRange: def.combat.range,
				attackSpeed: def.combat.attackSpeed,
				attackCooldown: 0,
				targetId: null,
			})
		}
		if (def.canGather) {
			this.components.addComponent(id, {
				type: ComponentType.RESOURCE_CARRIER,
				state: 'idle',
				targetResourceId: null,
				returnBuildingId: null,
				currentLoad: 0,
				maxCapacity: GAME_CONFIG.mineralPatch.gatherRate,
				gatherRate: GAME_CONFIG.mineralPatch.gatherRate,
				gatherTimer: 0,
			})
		}
		return id
	}

	createBuilding(
		buildingType: string,
		playerId: string,
		teamId: string,
		position: Vector3,
		preBuilt = false,
	): EntityId {
		const def = getBuildingDef(buildingType)
		const id = this.entities.createEntity()

		this.components.addComponent(id, {
			type: ComponentType.TRANSFORM,
			position: { ...position },
			rotation: 0,
			scale: { x: def.size.width, y: 1, z: def.size.height },
		})
		this.components.addComponent(id, {
			type: ComponentType.HEALTH,
			current: preBuilt ? def.stats.health : 1,
			max: def.stats.health,
			armor: def.stats.armor,
		})
		this.components.addComponent(id, {
			type: ComponentType.BUILDING,
			buildingType: def.id,
			buildProgress: preBuilt ? 1 : 0,
			queue: [],
			rallyPoint: { x: position.x, y: 0, z: position.z + def.size.height + 1 },
		})
		this.components.addComponent(id, {
			type: ComponentType.OWNER,
			playerId,
			teamId,
		})
		this.components.addComponent(id, {
			type: ComponentType.SELECTION,
			isSelected: false,
		})
		this.components.addComponent(id, {
			type: ComponentType.RENDER,
			color: def.color,
			visible: true,
		})
		return id
	}

	createMineralPatch(position: Vector3, amount?: number): EntityId {
		const id = this.entities.createEntity()

		this.components.addComponent(id, {
			type: ComponentType.TRANSFORM,
			position: { ...position },
			rotation: 0,
			scale: { x: 1, y: 1, z: 1 },
		})
		this.components.addComponent(id, {
			type: ComponentType.RESOURCE,
			resourceType: 'mineral',
			amount: amount ?? GAME_CONFIG.mineralPatch.amount,
			maxCapacity: amount ?? GAME_CONFIG.mineralPatch.amount,
		})
		this.components.addComponent(id, {
			type: ComponentType.RENDER,
			color: '#44aaff',
			visible: true,
		})
		return id
	}
}
