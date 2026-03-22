/**
 * Vision System - Simple fog of war for hiding enemy entities outside sight range
 * KISS: Check distance from player1 entities to player2 entities
 */

import {
	ComponentType,
	type Entity,
	type OwnerComponent,
	type RenderComponent,
	type TransformComponent,
} from '@/types/ecs'
import { System } from '../SystemManager'

export class VisionSystem extends System {
	readonly requiredComponents = [
		ComponentType.TRANSFORM,
		ComponentType.OWNER,
		ComponentType.RENDER,
	] as ComponentType[]
	readonly priority = 45

	update(entities: Entity[], _deltaTime: number): void {
		// Collect all player1 entity positions and their sight ranges
		const visiblePositions: { x: number; z: number; range: number }[] = []

		for (const entity of entities) {
			const owner = entity.components.get(ComponentType.OWNER) as OwnerComponent
			const transform = entity.components.get(ComponentType.TRANSFORM) as TransformComponent
			if (owner?.playerId === 'player1') {
				visiblePositions.push({
					x: transform.position.x,
					z: transform.position.z,
					range: 12,
				})
			}
		}

		// For each player2 entity, check if it's within any player1 sight range
		for (const entity of entities) {
			const owner = entity.components.get(ComponentType.OWNER) as OwnerComponent
			const transform = entity.components.get(ComponentType.TRANSFORM) as TransformComponent
			const render = entity.components.get(ComponentType.RENDER) as RenderComponent
			if (!owner || !transform || !render) continue

			if (owner.playerId === 'player2') {
				const isVisible = visiblePositions.some((vp) => {
					const dx = vp.x - transform.position.x
					const dz = vp.z - transform.position.z
					return Math.sqrt(dx * dx + dz * dz) <= vp.range
				})
				render.visible = isVisible
			}
		}
	}
}
