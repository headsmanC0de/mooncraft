/**
 * AI System - Simple state machine AI for player2
 * Phases: BUILD (0-120s), EXPAND (120-300s), ATTACK (300s+)
 */

import type { Entity, OwnerComponent } from '@/types/ecs'
import { ComponentType } from '@/types/ecs'
import type { ComponentManager } from '../ComponentManager'
import { componentManager as defaultCM } from '../ComponentManager'
import { EntityFactory } from '../EntityFactory'
import type { EntityManager } from '../EntityManager'
import { entityManager as defaultEM } from '../EntityManager'
import { System } from '../SystemManager'
import { executeAttackPhase } from './ai/AIAttackPhase'
import { executeBuildPhase } from './ai/AIBuildPhase'
import { executeExpandPhase } from './ai/AIExpandPhase'

export class AISystem extends System {
	readonly requiredComponents = [ComponentType.OWNER]
	readonly priority = 50
	private timer = 0
	private decisionInterval = 3 // seconds
	private gameTime = 0
	private factory: EntityFactory
	private em: EntityManager

	constructor(em?: EntityManager, cm?: ComponentManager) {
		super()
		this.em = em ?? defaultEM
		const cm_ = cm ?? defaultCM
		this.factory = new EntityFactory(this.em, cm_)
	}

	update(entities: Entity[], deltaTime: number): void {
		this.timer += deltaTime
		this.gameTime += deltaTime
		if (this.timer < this.decisionInterval) return
		this.timer = 0

		const aiEntities = entities.filter((e) => {
			const owner = e.components.get(ComponentType.OWNER) as OwnerComponent
			return owner?.playerId === 'player2'
		})

		if (this.gameTime < 120) {
			executeBuildPhase(aiEntities, this.factory, this.em)
		} else if (this.gameTime < 300) {
			executeExpandPhase(aiEntities, this.factory, this.em)
		} else {
			executeAttackPhase(aiEntities, this.factory, this.em)
		}
	}
}
