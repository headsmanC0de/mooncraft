import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { BuildingComponent, CombatComponent, MovementComponent } from '@/types/ecs'
import { ComponentType } from '@/types/ecs'
import { ComponentManager } from '../../../ComponentManager'
import { EntityFactory } from '../../../EntityFactory'
import { EntityManager } from '../../../EntityManager'
import {
	countByType,
	countWorkers,
	deductResources,
	findBuildingOfType,
	getFactionMapping,
	getPlayer2Resources,
	trainFromBuilding,
} from '../aiHelpers'
import { executeBuildPhase } from '../AIBuildPhase'
import { executeExpandPhase } from '../AIExpandPhase'
import { executeAttackPhase } from '../AIAttackPhase'

// Mock the game store
const mockState: { players: Map<string, unknown> } = { players: new Map() }

function resetPlayers(minerals = 500, gas = 250) {
	const players = new Map()
	players.set('player2', {
		id: 'player2',
		name: 'AI',
		teamId: 'team2',
		faction: 'protoss',
		resources: { minerals, gas, supply: 4, maxSupply: 50 },
		isAlive: true,
	})
	players.set('player1', {
		id: 'player1',
		name: 'Human',
		teamId: 'team1',
		faction: 'terran',
		resources: { minerals: 500, gas: 250, supply: 4, maxSupply: 50 },
		isAlive: true,
	})
	mockState.players = players
}

vi.mock('@/stores/gameStore', () => ({
	useGameStore: {
		getState: () => mockState,
		setState: (newState: Record<string, unknown>) => {
			Object.assign(mockState, newState)
		},
	},
}))

describe('aiHelpers', () => {
	let em: EntityManager
	let cm: ComponentManager
	let factory: EntityFactory

	beforeEach(() => {
		em = new EntityManager()
		cm = new ComponentManager(em)
		factory = new EntityFactory(em, cm)
		resetPlayers()
	})

	describe('getFactionMapping', () => {
		it('should return correct mappings for terran', () => {
			const mapping = getFactionMapping('terran')
			expect(mapping.mainBuilding).toBe('command_center')
			expect(mapping.basicMilitary).toBe('barracks')
			expect(mapping.advancedMilitary).toBe('factory')
			expect(mapping.supplyBuilding).toBe('supply_depot')
			expect(mapping.worker).toBe('worker')
			expect(mapping.basicUnit).toBe('marine')
			expect(mapping.heavyUnit).toBe('siege_tank')
		})

		it('should return correct mappings for protoss', () => {
			const mapping = getFactionMapping('protoss')
			expect(mapping.mainBuilding).toBe('nexus')
			expect(mapping.basicMilitary).toBe('gateway')
			expect(mapping.advancedMilitary).toBe('robotics_facility')
			expect(mapping.supplyBuilding).toBe('pylon')
			expect(mapping.worker).toBe('probe')
			expect(mapping.basicUnit).toBe('zealot')
			expect(mapping.heavyUnit).toBe('colossus')
		})
	})

	describe('countByType', () => {
		it('should count buildings of a specific type', () => {
			factory.createBuilding('barracks', 'player2', 'team2', { x: 10, y: 0, z: 10 }, true)
			factory.createBuilding('barracks', 'player2', 'team2', { x: 20, y: 0, z: 10 }, true)
			factory.createBuilding('command_center', 'player2', 'team2', { x: 30, y: 0, z: 10 }, true)

			const entities = em.getAllEntities()
			expect(countByType(entities, ComponentType.BUILDING, 'barracks')).toBe(2)
			expect(countByType(entities, ComponentType.BUILDING, 'command_center')).toBe(1)
			expect(countByType(entities, ComponentType.BUILDING, 'factory')).toBe(0)
		})
	})

	describe('countWorkers', () => {
		it('should count entities with RESOURCE_CARRIER component', () => {
			factory.createUnit('worker', 'player2', 'team2', { x: 10, y: 0, z: 10 })
			factory.createUnit('worker', 'player2', 'team2', { x: 15, y: 0, z: 10 })
			factory.createUnit('marine', 'player2', 'team2', { x: 20, y: 0, z: 10 })

			const entities = em.getAllEntities()
			expect(countWorkers(entities)).toBe(2)
		})

		it('should return 0 when no workers exist', () => {
			factory.createUnit('marine', 'player2', 'team2', { x: 10, y: 0, z: 10 })
			const entities = em.getAllEntities()
			expect(countWorkers(entities)).toBe(0)
		})
	})

	describe('findBuildingOfType', () => {
		it('should find a completed building of the given type', () => {
			factory.createBuilding('barracks', 'player2', 'team2', { x: 10, y: 0, z: 10 }, true)
			const entities = em.getAllEntities()
			const found = findBuildingOfType(entities, 'barracks')
			expect(found).toBeDefined()
			const building = found!.components.get(ComponentType.BUILDING) as BuildingComponent
			expect(building.buildingType).toBe('barracks')
		})

		it('should not find an incomplete building', () => {
			factory.createBuilding('barracks', 'player2', 'team2', { x: 10, y: 0, z: 10 }, false)
			const entities = em.getAllEntities()
			const found = findBuildingOfType(entities, 'barracks')
			expect(found).toBeUndefined()
		})

		it('should return undefined when no matching building exists', () => {
			const entities = em.getAllEntities()
			expect(findBuildingOfType(entities, 'nexus')).toBeUndefined()
		})
	})

	describe('getPlayer2Resources', () => {
		it('should return player2 data from game store', () => {
			const player = getPlayer2Resources()
			expect(player).toBeDefined()
			expect(player!.resources.minerals).toBe(500)
			expect(player!.resources.gas).toBe(250)
		})
	})

	describe('deductResources', () => {
		it('should deduct resources when sufficient', () => {
			const result = deductResources(100, 50)
			expect(result).toBe(true)
			const player = getPlayer2Resources()
			expect(player!.resources.minerals).toBe(400)
			expect(player!.resources.gas).toBe(200)
		})

		it('should fail when minerals are insufficient', () => {
			const result = deductResources(9999, 0)
			expect(result).toBe(false)
			const player = getPlayer2Resources()
			expect(player!.resources.minerals).toBe(500)
		})

		it('should fail when gas is insufficient', () => {
			const result = deductResources(0, 9999)
			expect(result).toBe(false)
			const player = getPlayer2Resources()
			expect(player!.resources.gas).toBe(250)
		})
	})

	describe('trainFromBuilding', () => {
		it('should add a unit to the building queue', () => {
			const ccId = factory.createBuilding(
				'command_center', 'player2', 'team2', { x: 10, y: 0, z: 10 }, true,
			)
			const entity = em.getEntity(ccId)!
			trainFromBuilding(entity, 'worker')

			const building = entity.components.get(ComponentType.BUILDING) as BuildingComponent
			expect(building.queue.length).toBe(1)
			expect(building.queue[0].type).toBe('worker')
			expect(building.queue[0].progress).toBe(0)
			expect(building.queue[0].duration).toBe(12)
		})

		it('should not queue when building is incomplete', () => {
			const ccId = factory.createBuilding(
				'command_center', 'player2', 'team2', { x: 10, y: 0, z: 10 }, false,
			)
			const entity = em.getEntity(ccId)!
			trainFromBuilding(entity, 'worker')

			const building = entity.components.get(ComponentType.BUILDING) as BuildingComponent
			expect(building.queue.length).toBe(0)
		})

		it('should not queue more than 2 units', () => {
			const ccId = factory.createBuilding(
				'command_center', 'player2', 'team2', { x: 10, y: 0, z: 10 }, true,
			)
			const entity = em.getEntity(ccId)!
			trainFromBuilding(entity, 'worker')
			trainFromBuilding(entity, 'worker')
			trainFromBuilding(entity, 'worker')

			const building = entity.components.get(ComponentType.BUILDING) as BuildingComponent
			expect(building.queue.length).toBe(2)
		})

		it('should not queue when resources are insufficient', () => {
			resetPlayers(0, 0)
			const ccId = factory.createBuilding(
				'command_center', 'player2', 'team2', { x: 10, y: 0, z: 10 }, true,
			)
			const entity = em.getEntity(ccId)!
			trainFromBuilding(entity, 'worker')

			const building = entity.components.get(ComponentType.BUILDING) as BuildingComponent
			expect(building.queue.length).toBe(0)
		})
	})
})

describe('AIBuildPhase', () => {
	let em: EntityManager
	let cm: ComponentManager
	let factory: EntityFactory

	beforeEach(() => {
		em = new EntityManager()
		cm = new ComponentManager(em)
		factory = new EntityFactory(em, cm)
		resetPlayers()
	})

	it('should queue worker training when worker count is low', () => {
		const ccId = factory.createBuilding(
			'command_center', 'player2', 'team2', { x: 108, y: 0, z: 108 }, true,
		)
		// Add supply depot so supply.max > supply.used
		factory.createBuilding('supply_depot', 'player2', 'team2', { x: 105, y: 0, z: 108 }, true)

		const entities = em.getAllEntities()
		executeBuildPhase(entities, factory, em, 'terran')

		const building = cm.getComponent<BuildingComponent>(ccId, ComponentType.BUILDING)!
		expect(building.queue.length).toBeGreaterThan(0)
		expect(building.queue[0].type).toBe('worker')
	})

	it('should not queue workers when already at 8', () => {
		const ccId = factory.createBuilding(
			'command_center', 'player2', 'team2', { x: 108, y: 0, z: 108 }, true,
		)
		factory.createBuilding('supply_depot', 'player2', 'team2', { x: 105, y: 0, z: 108 }, true)
		// Create 8 workers
		for (let i = 0; i < 8; i++) {
			factory.createUnit('worker', 'player2', 'team2', { x: 108 + i, y: 0, z: 110 })
		}

		resetPlayers(2000, 500)
		const entities = em.getAllEntities()
		executeBuildPhase(entities, factory, em, 'terran')

		const building = cm.getComponent<BuildingComponent>(ccId, ComponentType.BUILDING)!
		expect(building.queue.filter((q) => q.type === 'worker').length).toBe(0)
	})

	it('should build supply depot when none exists', () => {
		factory.createBuilding('command_center', 'player2', 'team2', { x: 108, y: 0, z: 108 }, true)

		const entitiesBefore = em.getEntityCount()
		const entities = em.getAllEntities()
		executeBuildPhase(entities, factory, em, 'terran')

		// Should have created a supply_depot entity
		const allEntities = em.getAllEntities()
		const supplyDepots = allEntities.filter((e) => {
			const b = e.components.get(ComponentType.BUILDING) as BuildingComponent | undefined
			return b?.buildingType === 'supply_depot'
		})
		expect(supplyDepots.length).toBe(1)
	})

	it('should build barracks when none exists', () => {
		factory.createBuilding('command_center', 'player2', 'team2', { x: 108, y: 0, z: 108 }, true)

		const entities = em.getAllEntities()
		executeBuildPhase(entities, factory, em, 'terran')

		const allEntities = em.getAllEntities()
		const barracks = allEntities.filter((e) => {
			const b = e.components.get(ComponentType.BUILDING) as BuildingComponent | undefined
			return b?.buildingType === 'barracks'
		})
		expect(barracks.length).toBe(1)
	})

	it('should work with protoss faction', () => {
		const nexusId = factory.createBuilding(
			'nexus', 'player2', 'team2', { x: 108, y: 0, z: 108 }, true, 'protoss',
		)

		const entities = em.getAllEntities()
		executeBuildPhase(entities, factory, em, 'protoss')

		const allEntities = em.getAllEntities()
		const pylons = allEntities.filter((e) => {
			const b = e.components.get(ComponentType.BUILDING) as BuildingComponent | undefined
			return b?.buildingType === 'pylon'
		})
		const gateways = allEntities.filter((e) => {
			const b = e.components.get(ComponentType.BUILDING) as BuildingComponent | undefined
			return b?.buildingType === 'gateway'
		})
		expect(pylons.length).toBe(1)
		expect(gateways.length).toBe(1)
	})
})

describe('AIExpandPhase', () => {
	let em: EntityManager
	let cm: ComponentManager
	let factory: EntityFactory

	beforeEach(() => {
		em = new EntityManager()
		cm = new ComponentManager(em)
		factory = new EntityFactory(em, cm)
		resetPlayers(2000, 1000)
	})

	it('should train combat units from military buildings', () => {
		factory.createBuilding('command_center', 'player2', 'team2', { x: 108, y: 0, z: 108 }, true)
		factory.createBuilding('supply_depot', 'player2', 'team2', { x: 105, y: 0, z: 108 }, true)
		const barracksId = factory.createBuilding(
			'barracks', 'player2', 'team2', { x: 102, y: 0, z: 108 }, true,
		)

		const entities = em.getAllEntities()
		executeExpandPhase(entities, factory, em, 'terran')

		const building = cm.getComponent<BuildingComponent>(barracksId, ComponentType.BUILDING)!
		expect(building.queue.length).toBeGreaterThan(0)
		expect(building.queue[0].type).toBe('marine')
	})

	it('should train workers up to 12', () => {
		const ccId = factory.createBuilding(
			'command_center', 'player2', 'team2', { x: 108, y: 0, z: 108 }, true,
		)
		factory.createBuilding('supply_depot', 'player2', 'team2', { x: 105, y: 0, z: 108 }, true)

		const entities = em.getAllEntities()
		executeExpandPhase(entities, factory, em, 'terran')

		const building = cm.getComponent<BuildingComponent>(ccId, ComponentType.BUILDING)!
		expect(building.queue.length).toBeGreaterThan(0)
		expect(building.queue[0].type).toBe('worker')
	})

	it('should not train workers when already at 12', () => {
		const ccId = factory.createBuilding(
			'command_center', 'player2', 'team2', { x: 108, y: 0, z: 108 }, true,
		)
		factory.createBuilding('supply_depot', 'player2', 'team2', { x: 105, y: 0, z: 108 }, true)
		factory.createBuilding('supply_depot', 'player2', 'team2', { x: 103, y: 0, z: 108 }, true)
		for (let i = 0; i < 12; i++) {
			factory.createUnit('worker', 'player2', 'team2', { x: 108 + i, y: 0, z: 110 })
		}

		const entities = em.getAllEntities()
		executeExpandPhase(entities, factory, em, 'terran')

		const building = cm.getComponent<BuildingComponent>(ccId, ComponentType.BUILDING)!
		expect(building.queue.filter((q) => q.type === 'worker').length).toBe(0)
	})

	it('should build advanced military building when none exists', () => {
		factory.createBuilding('command_center', 'player2', 'team2', { x: 108, y: 0, z: 108 }, true)
		factory.createBuilding('supply_depot', 'player2', 'team2', { x: 105, y: 0, z: 108 }, true)
		factory.createBuilding('barracks', 'player2', 'team2', { x: 102, y: 0, z: 108 }, true)

		const entities = em.getAllEntities()
		executeExpandPhase(entities, factory, em, 'terran')

		const allEntities = em.getAllEntities()
		const factories = allEntities.filter((e) => {
			const b = e.components.get(ComponentType.BUILDING) as BuildingComponent | undefined
			return b?.buildingType === 'factory'
		})
		expect(factories.length).toBe(1)
	})

	it('should build supply when near cap', () => {
		factory.createBuilding('command_center', 'player2', 'team2', { x: 108, y: 0, z: 108 }, true)
		// CC provides 10 supply, create 8 workers = 8 used, 10-8=2 < 4
		for (let i = 0; i < 8; i++) {
			factory.createUnit('worker', 'player2', 'team2', { x: 108 + i, y: 0, z: 110 })
		}

		const entities = em.getAllEntities()
		executeExpandPhase(entities, factory, em, 'terran')

		const allEntities = em.getAllEntities()
		const supplyDepots = allEntities.filter((e) => {
			const b = e.components.get(ComponentType.BUILDING) as BuildingComponent | undefined
			return b?.buildingType === 'supply_depot'
		})
		expect(supplyDepots.length).toBe(1)
	})
})

describe('AIAttackPhase', () => {
	let em: EntityManager
	let cm: ComponentManager
	let factory: EntityFactory

	beforeEach(() => {
		em = new EntityManager()
		cm = new ComponentManager(em)
		factory = new EntityFactory(em, cm)
		resetPlayers(2000, 1000)
	})

	it('should set movement targets toward player base for combat units', () => {
		const marineId1 = factory.createUnit('marine', 'player2', 'team2', { x: 100, y: 0, z: 100 })
		const marineId2 = factory.createUnit('marine', 'player2', 'team2', { x: 102, y: 0, z: 100 })
		factory.createBuilding('command_center', 'player2', 'team2', { x: 108, y: 0, z: 108 }, true)
		factory.createBuilding('supply_depot', 'player2', 'team2', { x: 105, y: 0, z: 108 }, true)

		const aiEntities = em.getAllEntities().filter((e) => {
			const owner = e.components.get(ComponentType.OWNER) as { playerId: string } | undefined
			return owner?.playerId === 'player2'
		})
		executeAttackPhase(aiEntities, factory, em, 'terran')

		const movement1 = cm.getComponent<MovementComponent>(marineId1, ComponentType.MOVEMENT)!
		const movement2 = cm.getComponent<MovementComponent>(marineId2, ComponentType.MOVEMENT)!

		expect(movement1.targetPosition).toEqual({ x: 20, y: 0, z: 20 })
		expect(movement2.targetPosition).toEqual({ x: 20, y: 0, z: 20 })
	})

	it('should not move workers toward player base', () => {
		const workerId = factory.createUnit('worker', 'player2', 'team2', { x: 100, y: 0, z: 100 })
		factory.createBuilding('command_center', 'player2', 'team2', { x: 108, y: 0, z: 108 }, true)
		factory.createBuilding('supply_depot', 'player2', 'team2', { x: 105, y: 0, z: 108 }, true)

		const aiEntities = em.getAllEntities().filter((e) => {
			const owner = e.components.get(ComponentType.OWNER) as { playerId: string } | undefined
			return owner?.playerId === 'player2'
		})
		executeAttackPhase(aiEntities, factory, em, 'terran')

		const movement = cm.getComponent<MovementComponent>(workerId, ComponentType.MOVEMENT)!
		expect(movement.targetPosition).toBeNull()
	})

	it('should set combat target to nearest player1 entity', () => {
		const marineId = factory.createUnit('marine', 'player2', 'team2', { x: 100, y: 0, z: 100 })
		factory.createBuilding('command_center', 'player2', 'team2', { x: 108, y: 0, z: 108 }, true)
		factory.createBuilding('supply_depot', 'player2', 'team2', { x: 105, y: 0, z: 108 }, true)

		// Create player1 entities at different distances
		const farId = factory.createBuilding(
			'command_center', 'player1', 'team1', { x: 20, y: 0, z: 20 }, true,
		)
		const nearId = factory.createUnit('marine', 'player1', 'team1', { x: 80, y: 0, z: 80 })

		const aiEntities = em.getAllEntities().filter((e) => {
			const owner = e.components.get(ComponentType.OWNER) as { playerId: string } | undefined
			return owner?.playerId === 'player2'
		})
		executeAttackPhase(aiEntities, factory, em, 'terran')

		const combat = cm.getComponent<CombatComponent>(marineId, ComponentType.COMBAT)!
		// The nearest player1 entity should be the marine at (80,0,80)
		expect(combat.targetId).toBe(nearId)
	})

	it('should continue training units during attack phase', () => {
		factory.createUnit('marine', 'player2', 'team2', { x: 100, y: 0, z: 100 })
		factory.createBuilding('command_center', 'player2', 'team2', { x: 108, y: 0, z: 108 }, true)
		factory.createBuilding('supply_depot', 'player2', 'team2', { x: 105, y: 0, z: 108 }, true)
		const barracksId = factory.createBuilding(
			'barracks', 'player2', 'team2', { x: 102, y: 0, z: 108 }, true,
		)

		const aiEntities = em.getAllEntities().filter((e) => {
			const owner = e.components.get(ComponentType.OWNER) as { playerId: string } | undefined
			return owner?.playerId === 'player2'
		})
		executeAttackPhase(aiEntities, factory, em, 'terran')

		const building = cm.getComponent<BuildingComponent>(barracksId, ComponentType.BUILDING)!
		expect(building.queue.length).toBeGreaterThan(0)
		expect(building.queue[0].type).toBe('marine')
	})
})
