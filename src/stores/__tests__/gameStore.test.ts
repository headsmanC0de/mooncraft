import { beforeEach, describe, expect, it, vi } from 'vitest'
import { componentManager, EntityFactory, entityManager } from '@/lib/ecs'
import { ComponentType } from '@/types/ecs'
import type { MovementComponent, SelectionComponent } from '@/types/ecs'

vi.mock('@/lib/audio', () => ({
	audioEngine: {
		playSelect: vi.fn(),
		playMove: vi.fn(),
		playClick: vi.fn(),
		playError: vi.fn(),
		playBuild: vi.fn(),
		playTrain: vi.fn(),
	},
	AudioEngine: vi.fn(),
}))

// Import store after mock setup
const { useGameStore } = await import('../gameStore')

describe('GameStore', () => {
	let factory: EntityFactory

	beforeEach(() => {
		useGameStore.setState({
			selectedUnits: [],
			isPaused: true,
			currentTick: 0,
			controlGroups: new Map(),
		})
		for (const entity of entityManager.getAllEntities()) {
			entityManager.destroyEntity(entity.id)
		}
		factory = new EntityFactory(entityManager, componentManager)
	})

	describe('selectUnits', () => {
		it('should select units and update selection component', () => {
			const id = factory.createUnit('marine', 'player1', 'team1', { x: 0, y: 0, z: 0 })
			useGameStore.getState().selectUnits([id])

			expect(useGameStore.getState().selectedUnits).toContain(id)
			const sel = componentManager.getComponent<SelectionComponent>(
				id,
				ComponentType.SELECTION,
			)
			expect(sel?.isSelected).toBe(true)
		})

		it('should clear previous selection when not additive', () => {
			const id1 = factory.createUnit('marine', 'player1', 'team1', { x: 0, y: 0, z: 0 })
			const id2 = factory.createUnit('marine', 'player1', 'team1', { x: 5, y: 0, z: 0 })

			useGameStore.getState().selectUnits([id1])
			useGameStore.getState().selectUnits([id2])

			expect(useGameStore.getState().selectedUnits).toEqual([id2])
		})

		it('should deselect previous units in component state', () => {
			const id1 = factory.createUnit('marine', 'player1', 'team1', { x: 0, y: 0, z: 0 })
			const id2 = factory.createUnit('marine', 'player1', 'team1', { x: 5, y: 0, z: 0 })

			useGameStore.getState().selectUnits([id1])
			useGameStore.getState().selectUnits([id2])

			const sel1 = componentManager.getComponent<SelectionComponent>(
				id1,
				ComponentType.SELECTION,
			)
			expect(sel1?.isSelected).toBe(false)
		})

		it('should add to selection when additive', () => {
			const id1 = factory.createUnit('marine', 'player1', 'team1', { x: 0, y: 0, z: 0 })
			const id2 = factory.createUnit('marine', 'player1', 'team1', { x: 5, y: 0, z: 0 })

			useGameStore.getState().selectUnits([id1])
			useGameStore.getState().selectUnits([id2], true)

			expect(useGameStore.getState().selectedUnits).toHaveLength(2)
			expect(useGameStore.getState().selectedUnits).toContain(id1)
			expect(useGameStore.getState().selectedUnits).toContain(id2)
		})

		it('should not duplicate units in additive mode', () => {
			const id1 = factory.createUnit('marine', 'player1', 'team1', { x: 0, y: 0, z: 0 })

			useGameStore.getState().selectUnits([id1])
			useGameStore.getState().selectUnits([id1], true)

			expect(useGameStore.getState().selectedUnits).toHaveLength(1)
		})
	})

	describe('clearSelection', () => {
		it('should clear all selected units', () => {
			const id = factory.createUnit('marine', 'player1', 'team1', { x: 0, y: 0, z: 0 })
			useGameStore.getState().selectUnits([id])
			useGameStore.getState().clearSelection()

			expect(useGameStore.getState().selectedUnits).toHaveLength(0)
		})

		it('should update selection component to deselected', () => {
			const id = factory.createUnit('marine', 'player1', 'team1', { x: 0, y: 0, z: 0 })
			useGameStore.getState().selectUnits([id])
			useGameStore.getState().clearSelection()

			const sel = componentManager.getComponent<SelectionComponent>(
				id,
				ComponentType.SELECTION,
			)
			expect(sel?.isSelected).toBe(false)
		})
	})

	describe('moveSelectedUnits', () => {
		it('should set movement target for selected units', () => {
			const id = factory.createUnit('marine', 'player1', 'team1', { x: 0, y: 0, z: 0 })
			useGameStore.getState().selectUnits([id])
			useGameStore.getState().moveSelectedUnits({ x: 10, y: 0, z: 10 })

			const movement = componentManager.getComponent<MovementComponent>(
				id,
				ComponentType.MOVEMENT,
			)
			expect(movement?.targetPosition).toBeDefined()
			expect(movement?.targetPosition?.x).toBeCloseTo(10, 0)
			expect(movement?.targetPosition?.z).toBeCloseTo(10, 0)
		})

		it('should spread multiple units in formation', () => {
			const ids = [
				factory.createUnit('marine', 'player1', 'team1', { x: 0, y: 0, z: 0 }),
				factory.createUnit('marine', 'player1', 'team1', { x: 1, y: 0, z: 0 }),
				factory.createUnit('marine', 'player1', 'team1', { x: 2, y: 0, z: 0 }),
			]
			useGameStore.getState().selectUnits(ids)
			useGameStore.getState().moveSelectedUnits({ x: 50, y: 0, z: 50 })

			const targets = ids.map(
				(id) =>
					componentManager.getComponent<MovementComponent>(id, ComponentType.MOVEMENT)
						?.targetPosition,
			)
			const unique = new Set(targets.map((t) => `${t?.x},${t?.z}`))
			expect(unique.size).toBeGreaterThan(1)
		})

		it('should not offset single unit target', () => {
			const id = factory.createUnit('marine', 'player1', 'team1', { x: 0, y: 0, z: 0 })
			useGameStore.getState().selectUnits([id])
			useGameStore.getState().moveSelectedUnits({ x: 20, y: 0, z: 30 })

			const movement = componentManager.getComponent<MovementComponent>(
				id,
				ComponentType.MOVEMENT,
			)
			expect(movement?.targetPosition?.x).toBe(20)
			expect(movement?.targetPosition?.z).toBe(30)
		})
	})

	describe('stopSelectedUnits', () => {
		it('should clear movement target and stop moving', () => {
			const id = factory.createUnit('marine', 'player1', 'team1', { x: 0, y: 0, z: 0 })
			componentManager.updateComponent(id, ComponentType.MOVEMENT, {
				targetPosition: { x: 10, y: 0, z: 10 },
				isMoving: true,
			})
			useGameStore.getState().selectUnits([id])
			useGameStore.getState().stopSelectedUnits()

			const movement = componentManager.getComponent<MovementComponent>(
				id,
				ComponentType.MOVEMENT,
			)
			expect(movement?.targetPosition).toBeNull()
			expect(movement?.isMoving).toBe(false)
		})

		it('should clear combat target', () => {
			const id = factory.createUnit('marine', 'player1', 'team1', { x: 0, y: 0, z: 0 })
			componentManager.updateComponent(id, ComponentType.COMBAT, {
				targetId: 'some-enemy',
			})
			useGameStore.getState().selectUnits([id])
			useGameStore.getState().stopSelectedUnits()

			const combat = componentManager.getComponent(id, ComponentType.COMBAT)
			expect((combat as { targetId: string | null }).targetId).toBeNull()
		})
	})

	describe('controlGroups', () => {
		it('should save and recall control groups', () => {
			const id = factory.createUnit('marine', 'player1', 'team1', { x: 0, y: 0, z: 0 })
			useGameStore.getState().selectUnits([id])
			useGameStore.getState().setControlGroup(1)

			useGameStore.getState().clearSelection()
			expect(useGameStore.getState().selectedUnits).toHaveLength(0)

			useGameStore.getState().recallControlGroup(1)
			expect(useGameStore.getState().selectedUnits).toContain(id)
		})

		it('should filter dead entities on recall', () => {
			const id = factory.createUnit('marine', 'player1', 'team1', { x: 0, y: 0, z: 0 })
			useGameStore.getState().selectUnits([id])
			useGameStore.getState().setControlGroup(1)

			useGameStore.getState().clearSelection()
			entityManager.destroyEntity(id)
			useGameStore.getState().recallControlGroup(1)

			// recallControlGroup returns early when all entities are dead
			// so selectedUnits remains empty from clearSelection
			expect(useGameStore.getState().selectedUnits).toHaveLength(0)
		})

		it('should not set control group when no units selected', () => {
			useGameStore.getState().setControlGroup(1)
			expect(useGameStore.getState().controlGroups.get(1)).toBeUndefined()
		})

		it('should overwrite existing control group', () => {
			const id1 = factory.createUnit('marine', 'player1', 'team1', { x: 0, y: 0, z: 0 })
			const id2 = factory.createUnit('marine', 'player1', 'team1', { x: 5, y: 0, z: 0 })

			useGameStore.getState().selectUnits([id1])
			useGameStore.getState().setControlGroup(1)

			useGameStore.getState().selectUnits([id2])
			useGameStore.getState().setControlGroup(1)

			useGameStore.getState().clearSelection()
			useGameStore.getState().recallControlGroup(1)
			expect(useGameStore.getState().selectedUnits).toEqual([id2])
		})

		it('should do nothing when recalling empty group', () => {
			useGameStore.getState().recallControlGroup(5)
			expect(useGameStore.getState().selectedUnits).toHaveLength(0)
		})
	})
})
