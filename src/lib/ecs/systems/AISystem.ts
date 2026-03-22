/**
 * AI System - Simple state machine AI for player2
 * Phases: BUILD, EXPAND, ATTACK (boundaries set by difficulty)
 */

import { GAME_CONFIG } from '@/config/game'
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

export type AIDifficulty = 'easy' | 'normal' | 'hard'

export class AISystem extends System {
	readonly requiredComponents = [ComponentType.OWNER]
	readonly priority = 50
	private timer = 0
	private decisionInterval: number
	private buildPhaseEnd: number
	private expandPhaseEnd: number
	private gameTime = 0
	private factory: EntityFactory
	private em: EntityManager

	constructor(em?: EntityManager, cm?: ComponentManager, difficulty: AIDifficulty = 'normal') {
		super()
		this.em = em ?? defaultEM
		const cm_ = cm ?? defaultCM
		this.factory = new EntityFactory(this.em, cm_)

		const config = GAME_CONFIG.aiDifficulty[difficulty]
		this.decisionInterval = config.decisionInterval
		this.buildPhaseEnd = config.buildPhaseEnd
		this.expandPhaseEnd = config.expandPhaseEnd
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

		const firstAI = aiEntities[0]
		const firstOwner = firstAI?.components.get(ComponentType.OWNER) as OwnerComponent | undefined
		const faction = firstOwner?.faction ?? 'terran'

		if (this.gameTime < this.buildPhaseEnd) {
			executeBuildPhase(aiEntities, this.factory, this.em, faction)
		} else if (this.gameTime < this.expandPhaseEnd) {
			executeExpandPhase(aiEntities, this.factory, this.em, faction)
		} else {
			executeAttackPhase(aiEntities, this.factory, this.em, faction)
		}
	}
}
