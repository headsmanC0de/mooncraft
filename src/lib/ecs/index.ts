/**
 * ECS Index - Export all ECS components
 * SSOT: Single entry point for ECS imports
 */

export { EntityManager, entityManager } from './EntityManager'
export { ComponentManager, componentManager } from './ComponentManager'
export { SystemManager, systemManager, System } from './SystemManager'

// Systems
export { MovementSystem } from './systems/MovementSystem'
export { CombatSystem } from './systems/CombatSystem'
