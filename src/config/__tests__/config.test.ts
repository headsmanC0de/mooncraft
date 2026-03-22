import { describe, expect, it } from 'vitest'
import {
	BUILDING_DEFINITIONS,
	GAME_CONFIG,
	UNIT_DEFINITIONS,
	getBuildingDef,
	getUnitDef,
} from '@/config'

describe('Unit Definitions', () => {
	it('worker exists with correct cost and canGather=true', () => {
		const worker = getUnitDef('worker')
		expect(worker.cost).toEqual({ minerals: 50, gas: 0, supply: 1 })
		expect(worker.canGather).toBe(true)
	})

	it('marine exists with combat defined', () => {
		const marine = getUnitDef('marine')
		expect(marine.combat).toBeDefined()
		expect(marine.combat!.targetsAir).toBe(true)
		expect(marine.combat!.targetsGround).toBe(true)
	})

	it('siege_tank has range > 5', () => {
		const tank = getUnitDef('siege_tank')
		expect(tank.combat!.range).toBeGreaterThan(5)
	})

	it('medivac is flying', () => {
		const medivac = getUnitDef('medivac')
		expect(medivac.isFlying).toBe(true)
	})

	it('all units have valid cost, health, and speed', () => {
		for (const unit of Object.values(UNIT_DEFINITIONS)) {
			expect(unit.cost.minerals).toBeGreaterThanOrEqual(0)
			expect(unit.cost.supply).toBeGreaterThanOrEqual(0)
			expect(unit.stats.health).toBeGreaterThan(0)
			expect(unit.stats.speed).toBeGreaterThan(0)
		}
	})

	it('throws for unknown unit', () => {
		expect(() => getUnitDef('nonexistent')).toThrow('Unknown unit definition')
	})
})

describe('Building Definitions', () => {
	it('command_center produces worker', () => {
		const cc = getBuildingDef('command_center')
		expect(cc.produces).toContain('worker')
	})

	it('barracks produces marine', () => {
		const barracks = getBuildingDef('barracks')
		expect(barracks.produces).toContain('marine')
	})

	it('supply_depot has supplyProvided > 0', () => {
		const depot = getBuildingDef('supply_depot')
		expect(depot.supplyProvided).toBeGreaterThan(0)
	})

	it('all buildings have valid cost and health', () => {
		for (const building of Object.values(BUILDING_DEFINITIONS)) {
			expect(building.cost.minerals).toBeGreaterThanOrEqual(0)
			expect(building.cost.gas).toBeGreaterThanOrEqual(0)
			expect(building.stats.health).toBeGreaterThan(0)
		}
	})

	it('throws for unknown building', () => {
		expect(() => getBuildingDef('nonexistent')).toThrow('Unknown building definition')
	})
})

describe('Game Config', () => {
	it('has starting resources and map dimensions', () => {
		expect(GAME_CONFIG.startingResources.minerals).toBe(500)
		expect(GAME_CONFIG.startingResources.gas).toBe(0)
		expect(GAME_CONFIG.startingResources.maxSupply).toBe(10)
		expect(GAME_CONFIG.map.width).toBe(128)
		expect(GAME_CONFIG.map.height).toBe(128)
	})
})
