import { describe, expect, it } from 'vitest'
import type { Entity } from '@/types/ecs'
import { ComponentType } from '@/types/ecs'
import { canBuild } from '../techTree'

function makeEntity(id: string, components: Record<string, unknown>): Entity {
	const map = new Map<ComponentType, unknown>()
	for (const [key, value] of Object.entries(components)) {
		map.set(key as ComponentType, value)
	}
	return { id, components: map } as Entity
}

function makeBuilding(
	id: string,
	buildingType: string,
	playerId: string,
	buildProgress = 1,
): Entity {
	return makeEntity(id, {
		[ComponentType.OWNER]: {
			type: ComponentType.OWNER,
			playerId,
			teamId: 't1',
			faction: 'terran',
		},
		[ComponentType.BUILDING]: {
			type: ComponentType.BUILDING,
			buildingType,
			buildProgress,
			queue: [],
			rallyPoint: { x: 0, y: 0, z: 0 },
		},
	})
}

describe('canBuild', () => {
	it('should allow buildings with no requirements', () => {
		const result = canBuild('command_center', 'player1', [])
		expect(result).toBe(true)
	})

	it('should block buildings with unmet requirements', () => {
		const result = canBuild('barracks', 'player1', [])
		expect(result).toBe(false)
	})

	it('should allow buildings when requirements met', () => {
		const entities = [makeBuilding('b1', 'command_center', 'player1')]
		const result = canBuild('barracks', 'player1', entities)
		expect(result).toBe(true)
	})

	it('should not count incomplete buildings as meeting requirements', () => {
		const entities = [makeBuilding('b1', 'command_center', 'player1', 0.5)]
		const result = canBuild('barracks', 'player1', entities)
		expect(result).toBe(false)
	})

	it('should not count buildings owned by other players', () => {
		const entities = [makeBuilding('b1', 'command_center', 'player2')]
		const result = canBuild('barracks', 'player1', entities)
		expect(result).toBe(false)
	})

	it('should handle chained requirements (factory requires barracks)', () => {
		const entities = [
			makeBuilding('b1', 'command_center', 'player1'),
			makeBuilding('b2', 'barracks', 'player1'),
		]
		const result = canBuild('factory', 'player1', entities)
		expect(result).toBe(true)
	})

	it('should block factory when barracks is missing', () => {
		const entities = [makeBuilding('b1', 'command_center', 'player1')]
		const result = canBuild('factory', 'player1', entities)
		expect(result).toBe(false)
	})

	it('should allow supply_depot with no requirements', () => {
		const result = canBuild('supply_depot', 'player1', [])
		expect(result).toBe(true)
	})

	it('should handle protoss tech tree', () => {
		const entities = [makeBuilding('b1', 'nexus', 'player1')]
		expect(canBuild('gateway', 'player1', entities)).toBe(true)
		expect(canBuild('robotics_facility', 'player1', entities)).toBe(false)

		const withGateway = [...entities, makeBuilding('b2', 'gateway', 'player1')]
		expect(canBuild('robotics_facility', 'player1', withGateway)).toBe(true)
	})
})
