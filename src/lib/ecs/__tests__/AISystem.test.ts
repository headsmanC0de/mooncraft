import { describe, it, expect, beforeEach, vi } from 'vitest'
import { EntityManager } from '../EntityManager'
import { ComponentManager } from '../ComponentManager'
import { EntityFactory } from '../EntityFactory'
import { AISystem } from '../systems/AISystem'
import { ComponentType } from '@/types/ecs'
import type { BuildingComponent, MovementComponent } from '@/types/ecs'

// Mock the game store
const mockPlayers = new Map()

function resetPlayers() {
	mockPlayers.clear()
	mockPlayers.set('player2', {
		id: 'player2',
		name: 'Player 2',
		teamId: 'team2',
		resources: { minerals: 500, gas: 250, supply: 10, maxSupply: 50 },
		isAlive: true,
	})
	mockPlayers.set('player1', {
		id: 'player1',
		name: 'Player 1',
		teamId: 'team1',
		resources: { minerals: 500, gas: 250, supply: 10, maxSupply: 50 },
		isAlive: true,
	})
}

const mockState = { players: mockPlayers }

vi.mock('@/stores/gameStore', () => ({
	useGameStore: {
		getState: () => mockState,
		setState: (newState: Record<string, unknown>) => {
			Object.assign(mockState, newState)
		},
	},
}))

describe('AISystem', () => {
	let em: EntityManager
	let cm: ComponentManager
	let factory: EntityFactory
	let system: AISystem

	beforeEach(() => {
		em = new EntityManager()
		cm = new ComponentManager(em)
		factory = new EntityFactory(em, cm)
		system = new AISystem(em, cm)
		resetPlayers()
	})

	it('should not make decisions before interval', () => {
		factory.createBuilding('command_center', 'player2', 'team2', { x: 108, y: 0, z: 108 }, true)

		const entities = em.queryEntities(ComponentType.OWNER)
		const countBefore = em.getEntityCount()

		// Run with small deltaTime (less than 3s interval)
		system.update(entities, 1)

		// No new entities should be created
		expect(em.getEntityCount()).toBe(countBefore)
	})

	it('should train workers in build phase', () => {
		const ccId = factory.createBuilding(
			'command_center',
			'player2',
			'team2',
			{ x: 108, y: 0, z: 108 },
			true,
		)

		const entities = em.queryEntities(ComponentType.OWNER)

		// Run past the decision interval
		system.update(entities, 4)

		// Check that a worker was queued in the CC
		const building = cm.getComponent<BuildingComponent>(ccId, ComponentType.BUILDING)!
		expect(building.queue.length).toBeGreaterThan(0)
		expect(building.queue[0].type).toBe('worker')
	})

	it('should attack player base in attack phase', () => {
		// Create AI marines
		const marineId1 = factory.createUnit('marine', 'player2', 'team2', { x: 100, y: 0, z: 100 })
		const marineId2 = factory.createUnit('marine', 'player2', 'team2', { x: 102, y: 0, z: 100 })

		// Create a player1 building as target
		factory.createBuilding('command_center', 'player1', 'team1', { x: 20, y: 0, z: 20 }, true)

		// Also need AI buildings so supply check works
		factory.createBuilding('command_center', 'player2', 'team2', { x: 108, y: 0, z: 108 }, true)
		factory.createBuilding('barracks', 'player2', 'team2', { x: 105, y: 0, z: 108 }, true)

		// Advance game time past 300s
		const entities = em.queryEntities(ComponentType.OWNER)
		system.update(entities, 301)

		// Marines should now have movement targets toward player base
		const movement1 = cm.getComponent<MovementComponent>(marineId1, ComponentType.MOVEMENT)!
		const movement2 = cm.getComponent<MovementComponent>(marineId2, ComponentType.MOVEMENT)!

		expect(movement1.targetPosition).toEqual({ x: 20, y: 0, z: 20 })
		expect(movement2.targetPosition).toEqual({ x: 20, y: 0, z: 20 })
	})
})
