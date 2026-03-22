import { beforeEach, describe, expect, it } from 'vitest'
import type { RenderComponent } from '@/types/ecs'
import { ComponentType } from '@/types/ecs'
import { ComponentManager } from '../ComponentManager'
import { EntityFactory } from '../EntityFactory'
import { EntityManager } from '../EntityManager'
import { VisionSystem } from '../systems/VisionSystem'

describe('VisionSystem', () => {
	let em: EntityManager
	let cm: ComponentManager
	let factory: EntityFactory
	let system: VisionSystem

	beforeEach(() => {
		em = new EntityManager()
		cm = new ComponentManager(em)
		factory = new EntityFactory(em, cm)
		system = new VisionSystem()
	})

	it('should hide enemy entities outside player sight range', () => {
		factory.createUnit('marine', 'player1', 'team1', { x: 10, y: 0, z: 10 })
		const enemyId = factory.createUnit('marine', 'player2', 'team2', {
			x: 100,
			y: 0,
			z: 100,
		})

		const entities = em.queryEntities(
			ComponentType.TRANSFORM,
			ComponentType.OWNER,
			ComponentType.RENDER,
		)
		system.update(entities, 0)

		const render = cm.getComponent<RenderComponent>(enemyId, ComponentType.RENDER)
		expect(render!.visible).toBe(false)
	})

	it('should show enemy entities within player sight range', () => {
		factory.createUnit('marine', 'player1', 'team1', { x: 10, y: 0, z: 10 })
		const enemyId = factory.createUnit('marine', 'player2', 'team2', {
			x: 15,
			y: 0,
			z: 10,
		})

		const entities = em.queryEntities(
			ComponentType.TRANSFORM,
			ComponentType.OWNER,
			ComponentType.RENDER,
		)
		system.update(entities, 0)

		const render = cm.getComponent<RenderComponent>(enemyId, ComponentType.RENDER)
		expect(render!.visible).toBe(true)
	})

	it('should always keep player1 entities visible', () => {
		const playerId = factory.createUnit('marine', 'player1', 'team1', {
			x: 10,
			y: 0,
			z: 10,
		})

		const entities = em.queryEntities(
			ComponentType.TRANSFORM,
			ComponentType.OWNER,
			ComponentType.RENDER,
		)
		system.update(entities, 0)

		const render = cm.getComponent<RenderComponent>(playerId, ComponentType.RENDER)
		expect(render!.visible).toBe(true)
	})

	it('should handle no player1 entities (all enemies hidden)', () => {
		const enemy1 = factory.createUnit('marine', 'player2', 'team2', { x: 10, y: 0, z: 10 })
		const enemy2 = factory.createUnit('marine', 'player2', 'team2', { x: 20, y: 0, z: 20 })

		const entities = em.queryEntities(
			ComponentType.TRANSFORM,
			ComponentType.OWNER,
			ComponentType.RENDER,
		)
		system.update(entities, 0)

		const render1 = cm.getComponent<RenderComponent>(enemy1, ComponentType.RENDER)
		const render2 = cm.getComponent<RenderComponent>(enemy2, ComponentType.RENDER)
		expect(render1!.visible).toBe(false)
		expect(render2!.visible).toBe(false)
	})

	it('should show enemy at exact sight range boundary', () => {
		factory.createUnit('marine', 'player1', 'team1', { x: 0, y: 0, z: 0 })
		const enemyId = factory.createUnit('marine', 'player2', 'team2', {
			x: 12,
			y: 0,
			z: 0,
		})

		const entities = em.queryEntities(
			ComponentType.TRANSFORM,
			ComponentType.OWNER,
			ComponentType.RENDER,
		)
		system.update(entities, 0)

		const render = cm.getComponent<RenderComponent>(enemyId, ComponentType.RENDER)
		expect(render!.visible).toBe(true)
	})

	it('should hide enemy just outside sight range', () => {
		factory.createUnit('marine', 'player1', 'team1', { x: 0, y: 0, z: 0 })
		const enemyId = factory.createUnit('marine', 'player2', 'team2', {
			x: 12.1,
			y: 0,
			z: 0,
		})

		const entities = em.queryEntities(
			ComponentType.TRANSFORM,
			ComponentType.OWNER,
			ComponentType.RENDER,
		)
		system.update(entities, 0)

		const render = cm.getComponent<RenderComponent>(enemyId, ComponentType.RENDER)
		expect(render!.visible).toBe(false)
	})
})
