import { beforeEach, describe, expect, it } from 'vitest'
import type {
	BuildingComponent,
	HealthComponent,
	OwnerComponent,
	RenderComponent,
	ResourceComponent,
	TransformComponent,
} from '@/types/ecs'
import { ComponentType } from '@/types/ecs'
import { ComponentManager } from '../ComponentManager'
import { EntityFactory } from '../EntityFactory'
import { EntityManager } from '../EntityManager'

describe('EntityFactory', () => {
	let em: EntityManager
	let cm: ComponentManager
	let factory: EntityFactory

	beforeEach(() => {
		em = new EntityManager()
		cm = new ComponentManager(em)
		factory = new EntityFactory(em, cm)
	})

	describe('createUnit', () => {
		it('should create worker with correct components', () => {
			const id = factory.createUnit('worker', 'player1', 'team1', { x: 10, y: 0, z: 10 })
			expect(em.hasEntity(id)).toBe(true)
			expect(cm.hasComponent(id, ComponentType.TRANSFORM)).toBe(true)
			expect(cm.hasComponent(id, ComponentType.HEALTH)).toBe(true)
			expect(cm.hasComponent(id, ComponentType.MOVEMENT)).toBe(true)
			expect(cm.hasComponent(id, ComponentType.OWNER)).toBe(true)
			expect(cm.hasComponent(id, ComponentType.SELECTION)).toBe(true)
			expect(cm.hasComponent(id, ComponentType.RENDER)).toBe(true)
		})

		it('should create marine with combat component', () => {
			const id = factory.createUnit('marine', 'player1', 'team1', { x: 0, y: 0, z: 0 })
			expect(cm.hasComponent(id, ComponentType.COMBAT)).toBe(true)
		})

		it('should set correct health from config', () => {
			const id = factory.createUnit('marine', 'player1', 'team1', { x: 0, y: 0, z: 0 })
			const health = cm.getComponent<HealthComponent>(id, ComponentType.HEALTH)
			expect(health).toBeDefined()
			expect(health!.current).toBe(40)
			expect(health!.max).toBe(40)
		})

		it('should set correct position from input', () => {
			const id = factory.createUnit('worker', 'player1', 'team1', { x: 10, y: 5, z: 20 })
			const transform = cm.getComponent<TransformComponent>(id, ComponentType.TRANSFORM)
			expect(transform).toBeDefined()
			expect(transform!.position).toEqual({ x: 10, y: 5, z: 20 })
		})

		it('should set owner component correctly', () => {
			const id = factory.createUnit('worker', 'player1', 'team1', { x: 0, y: 0, z: 0 })
			const owner = cm.getComponent<OwnerComponent>(id, ComponentType.OWNER)
			expect(owner).toBeDefined()
			expect(owner!.playerId).toBe('player1')
			expect(owner!.teamId).toBe('team1')
		})

		it('should create unit without combat when def has no combat', () => {
			const id = factory.createUnit('medivac', 'player1', 'team1', { x: 0, y: 0, z: 0 })
			expect(cm.hasComponent(id, ComponentType.COMBAT)).toBe(false)
		})

		it('should throw for unknown unit type', () => {
			expect(() => factory.createUnit('unknown', 'p', 't', { x: 0, y: 0, z: 0 })).toThrow()
		})
	})

	describe('createBuilding', () => {
		it('should create command_center with building component', () => {
			const id = factory.createBuilding('command_center', 'player1', 'team1', {
				x: 20,
				y: 0,
				z: 20,
			})
			expect(cm.hasComponent(id, ComponentType.BUILDING)).toBe(true)
			expect(cm.hasComponent(id, ComponentType.HEALTH)).toBe(true)
			expect(cm.hasComponent(id, ComponentType.TRANSFORM)).toBe(true)
		})

		it('should create building with 0 progress (under construction)', () => {
			const id = factory.createBuilding('barracks', 'player1', 'team1', { x: 0, y: 0, z: 0 })
			const building = cm.getComponent<BuildingComponent>(id, ComponentType.BUILDING)
			expect(building!.buildProgress).toBe(0)
		})

		it('should create building with 1 health when under construction', () => {
			const id = factory.createBuilding('barracks', 'player1', 'team1', { x: 0, y: 0, z: 0 })
			const health = cm.getComponent<HealthComponent>(id, ComponentType.HEALTH)
			expect(health!.current).toBe(1)
		})

		it('should create pre-built building with full progress', () => {
			const id = factory.createBuilding('command_center', 'p1', 't1', { x: 0, y: 0, z: 0 }, true)
			const building = cm.getComponent<BuildingComponent>(id, ComponentType.BUILDING)
			expect(building!.buildProgress).toBe(1)
			const health = cm.getComponent<HealthComponent>(id, ComponentType.HEALTH)
			expect(health!.current).toBe(health!.max)
		})

		it('should set scale from building size definition', () => {
			const id = factory.createBuilding('command_center', 'p1', 't1', { x: 0, y: 0, z: 0 })
			const transform = cm.getComponent<TransformComponent>(id, ComponentType.TRANSFORM)
			// command_center size: width=4, height=3
			expect(transform!.scale).toEqual({ x: 4, y: 1, z: 3 })
		})

		it('should set rally point relative to building position', () => {
			const id = factory.createBuilding('command_center', 'p1', 't1', { x: 10, y: 0, z: 20 })
			const building = cm.getComponent<BuildingComponent>(id, ComponentType.BUILDING)
			// rally point z = position.z + size.height + 1 = 20 + 3 + 1 = 24
			expect(building!.rallyPoint.x).toBe(10)
			expect(building!.rallyPoint.z).toBe(24)
		})

		it('should throw for unknown building type', () => {
			expect(() => factory.createBuilding('unknown', 'p', 't', { x: 0, y: 0, z: 0 })).toThrow()
		})
	})

	describe('createMineralPatch', () => {
		it('should create mineral patch with resource component', () => {
			const id = factory.createMineralPatch({ x: 5, y: 0, z: 5 }, 1500)
			expect(cm.hasComponent(id, ComponentType.RESOURCE)).toBe(true)
			expect(cm.hasComponent(id, ComponentType.TRANSFORM)).toBe(true)
			const res = cm.getComponent<ResourceComponent>(id, ComponentType.RESOURCE)
			expect(res!.amount).toBe(1500)
		})

		it('should use default amount from config when not specified', () => {
			const id = factory.createMineralPatch({ x: 5, y: 0, z: 5 })
			const res = cm.getComponent<ResourceComponent>(id, ComponentType.RESOURCE)
			expect(res!.amount).toBe(1500) // GAME_CONFIG.mineralPatch.amount
		})

		it('should set custom amount when specified', () => {
			const id = factory.createMineralPatch({ x: 5, y: 0, z: 5 }, 800)
			const res = cm.getComponent<ResourceComponent>(id, ComponentType.RESOURCE)
			expect(res!.amount).toBe(800)
			expect(res!.maxCapacity).toBe(800)
		})

		it('should have render component with blue color', () => {
			const id = factory.createMineralPatch({ x: 0, y: 0, z: 0 })
			const render = cm.getComponent<RenderComponent>(id, ComponentType.RENDER)
			expect(render!.color).toBe('#44aaff')
			expect(render!.visible).toBe(true)
		})

		it('should not have owner component', () => {
			const id = factory.createMineralPatch({ x: 0, y: 0, z: 0 })
			expect(cm.hasComponent(id, ComponentType.OWNER)).toBe(false)
		})
	})
})
