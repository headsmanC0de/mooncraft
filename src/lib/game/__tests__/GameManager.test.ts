import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { ComponentType } from '@/types/ecs'
import { ComponentManager } from '@/lib/ecs/ComponentManager'
import { EntityFactory } from '@/lib/ecs/EntityFactory'
import { entityManager } from '@/lib/ecs/EntityManager'
import { checkGameStatus, resetGameStatus } from '../GameManager'

describe('checkGameStatus', () => {
	let cm: ComponentManager
	let factory: EntityFactory

	beforeEach(() => {
		resetGameStatus()
		// Use the singleton entityManager since checkGameStatus depends on it
		cm = new ComponentManager(entityManager)
		factory = new EntityFactory(entityManager, cm)
	})

	afterEach(() => {
		// Clean up all entities from singleton
		for (const entity of entityManager.getAllEntities()) {
			entityManager.destroyEntity(entity.id)
		}
		resetGameStatus()
	})

	it('should return playing when both players have buildings', () => {
		factory.createBuilding('command_center', 'player1', 'team1', { x: 0, y: 0, z: 0 }, true)
		factory.createBuilding('command_center', 'player2', 'team2', { x: 20, y: 0, z: 20 }, true)

		// First call sets gameStarted
		expect(checkGameStatus()).toBe('playing')
		// Second call checks with gameStarted = true
		expect(checkGameStatus()).toBe('playing')
	})

	it('should return victory when player2 has no completed buildings', () => {
		factory.createBuilding('command_center', 'player1', 'team1', { x: 0, y: 0, z: 0 }, true)
		factory.createBuilding('command_center', 'player2', 'team2', { x: 20, y: 0, z: 20 }, true)

		// Start the game
		checkGameStatus()

		// Destroy player2 building
		const buildings = entityManager.queryEntities(ComponentType.BUILDING, ComponentType.OWNER)
		for (const entity of buildings) {
			const owner = entity.components.get(ComponentType.OWNER)
			if (owner && 'playerId' in owner && owner.playerId === 'player2') {
				entityManager.destroyEntity(entity.id)
			}
		}

		expect(checkGameStatus()).toBe('victory')
	})

	it('should return defeat when player1 has no completed buildings', () => {
		factory.createBuilding('command_center', 'player1', 'team1', { x: 0, y: 0, z: 0 }, true)
		factory.createBuilding('command_center', 'player2', 'team2', { x: 20, y: 0, z: 20 }, true)

		// Start the game
		checkGameStatus()

		// Destroy player1 building
		const buildings = entityManager.queryEntities(ComponentType.BUILDING, ComponentType.OWNER)
		for (const entity of buildings) {
			const owner = entity.components.get(ComponentType.OWNER)
			if (owner && 'playerId' in owner && owner.playerId === 'player1') {
				entityManager.destroyEntity(entity.id)
			}
		}

		expect(checkGameStatus()).toBe('defeat')
	})

	it('should not trigger before game has started', () => {
		// No buildings at all — game hasn't started
		expect(checkGameStatus()).toBe('playing')
	})

	it('should return playing when only player1 has buildings (game not started)', () => {
		factory.createBuilding('command_center', 'player1', 'team1', { x: 0, y: 0, z: 0 }, true)

		// Game hasn't started because player2 never had buildings
		expect(checkGameStatus()).toBe('playing')
	})

	it('should not count incomplete buildings', () => {
		factory.createBuilding('command_center', 'player1', 'team1', { x: 0, y: 0, z: 0 }, true)
		// Player2 building is under construction (buildProgress = 0)
		factory.createBuilding('command_center', 'player2', 'team2', { x: 20, y: 0, z: 20 })

		// Game should not start because player2 has no completed buildings
		expect(checkGameStatus()).toBe('playing')
	})
})
