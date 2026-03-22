import { describe, expect, it } from 'vitest'
import type { Entity } from '@/types/ecs'
import { ComponentType } from '@/types/ecs'
import { calculateSupplyFromEntities } from '../supply'

function makeEntity(id: string, components: Record<string, unknown>): Entity {
	const map = new Map<ComponentType, unknown>()
	for (const [key, value] of Object.entries(components)) {
		map.set(key as ComponentType, value)
	}
	return { id, components: map } as Entity
}

describe('calculateSupplyFromEntities', () => {
	it('should return zero supply when no entities', () => {
		const result = calculateSupplyFromEntities([], 'player1')
		expect(result).toEqual({ used: 0, max: 0 })
	})

	it('should count supply provided by completed buildings', () => {
		const entities = [
			makeEntity('b1', {
				[ComponentType.OWNER]: {
					type: ComponentType.OWNER,
					playerId: 'player1',
					teamId: 't1',
					faction: 'terran',
				},
				[ComponentType.BUILDING]: {
					type: ComponentType.BUILDING,
					buildingType: 'command_center',
					buildProgress: 1,
					queue: [],
					rallyPoint: { x: 0, y: 0, z: 0 },
				},
			}),
		]
		const result = calculateSupplyFromEntities(entities, 'player1')
		expect(result.max).toBe(10) // command_center provides 10
		expect(result.used).toBe(0)
	})

	it('should not count supply from incomplete buildings', () => {
		const entities = [
			makeEntity('b1', {
				[ComponentType.OWNER]: {
					type: ComponentType.OWNER,
					playerId: 'player1',
					teamId: 't1',
					faction: 'terran',
				},
				[ComponentType.BUILDING]: {
					type: ComponentType.BUILDING,
					buildingType: 'command_center',
					buildProgress: 0.5,
					queue: [],
					rallyPoint: { x: 0, y: 0, z: 0 },
				},
			}),
		]
		const result = calculateSupplyFromEntities(entities, 'player1')
		expect(result.max).toBe(0)
	})

	it('should count workers as 1 supply used', () => {
		const entities = [
			makeEntity('u1', {
				[ComponentType.OWNER]: {
					type: ComponentType.OWNER,
					playerId: 'player1',
					teamId: 't1',
					faction: 'terran',
				},
				[ComponentType.MOVEMENT]: { type: ComponentType.MOVEMENT, speed: 5 },
				[ComponentType.HEALTH]: { type: ComponentType.HEALTH, current: 40, max: 40, armor: 0 },
			}),
		]
		const result = calculateSupplyFromEntities(entities, 'player1')
		expect(result.used).toBe(1)
	})

	it('should count siege tanks as 3 supply used', () => {
		const entities = [
			makeEntity('u1', {
				[ComponentType.OWNER]: {
					type: ComponentType.OWNER,
					playerId: 'player1',
					teamId: 't1',
					faction: 'terran',
				},
				[ComponentType.MOVEMENT]: { type: ComponentType.MOVEMENT, speed: 3 },
				[ComponentType.HEALTH]: { type: ComponentType.HEALTH, current: 160, max: 160, armor: 1 },
			}),
		]
		const result = calculateSupplyFromEntities(entities, 'player1')
		expect(result.used).toBe(3)
	})

	it('should count medivacs as 2 supply used', () => {
		const entities = [
			makeEntity('u1', {
				[ComponentType.OWNER]: {
					type: ComponentType.OWNER,
					playerId: 'player1',
					teamId: 't1',
					faction: 'terran',
				},
				[ComponentType.MOVEMENT]: { type: ComponentType.MOVEMENT, speed: 4 },
				[ComponentType.HEALTH]: { type: ComponentType.HEALTH, current: 150, max: 150, armor: 1 },
			}),
		]
		const result = calculateSupplyFromEntities(entities, 'player1')
		expect(result.used).toBe(2)
	})

	it('should ignore entities belonging to other players', () => {
		const entities = [
			makeEntity('u1', {
				[ComponentType.OWNER]: {
					type: ComponentType.OWNER,
					playerId: 'player2',
					teamId: 't2',
					faction: 'terran',
				},
				[ComponentType.MOVEMENT]: { type: ComponentType.MOVEMENT, speed: 5 },
				[ComponentType.HEALTH]: { type: ComponentType.HEALTH, current: 40, max: 40, armor: 0 },
			}),
		]
		const result = calculateSupplyFromEntities(entities, 'player1')
		expect(result.used).toBe(0)
		expect(result.max).toBe(0)
	})

	it('should calculate both used and max together', () => {
		const entities = [
			makeEntity('b1', {
				[ComponentType.OWNER]: {
					type: ComponentType.OWNER,
					playerId: 'player1',
					teamId: 't1',
					faction: 'terran',
				},
				[ComponentType.BUILDING]: {
					type: ComponentType.BUILDING,
					buildingType: 'command_center',
					buildProgress: 1,
					queue: [],
					rallyPoint: { x: 0, y: 0, z: 0 },
				},
			}),
			makeEntity('u1', {
				[ComponentType.OWNER]: {
					type: ComponentType.OWNER,
					playerId: 'player1',
					teamId: 't1',
					faction: 'terran',
				},
				[ComponentType.MOVEMENT]: { type: ComponentType.MOVEMENT, speed: 5 },
				[ComponentType.HEALTH]: { type: ComponentType.HEALTH, current: 40, max: 40, armor: 0 },
			}),
			makeEntity('u2', {
				[ComponentType.OWNER]: {
					type: ComponentType.OWNER,
					playerId: 'player1',
					teamId: 't1',
					faction: 'terran',
				},
				[ComponentType.MOVEMENT]: { type: ComponentType.MOVEMENT, speed: 5 },
				[ComponentType.HEALTH]: { type: ComponentType.HEALTH, current: 40, max: 40, armor: 0 },
			}),
		]
		const result = calculateSupplyFromEntities(entities, 'player1')
		expect(result.max).toBe(10)
		expect(result.used).toBe(2)
	})

	it('should ignore entities without owner component', () => {
		const entities = [
			makeEntity('r1', {
				[ComponentType.RESOURCE]: {
					type: ComponentType.RESOURCE,
					resourceType: 'mineral',
					amount: 1000,
				},
			}),
		]
		const result = calculateSupplyFromEntities(entities, 'player1')
		expect(result).toEqual({ used: 0, max: 0 })
	})
})
