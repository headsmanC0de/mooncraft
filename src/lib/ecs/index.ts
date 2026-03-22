/**
 * ECS Index - Export all ECS components
 * SSOT: Single entry point for ECS imports
 */

export { ComponentManager, componentManager } from './ComponentManager'
export { EntityFactory } from './EntityFactory'
export { EntityManager, entityManager } from './EntityManager'
export { System, SystemManager, systemManager } from './SystemManager'
export { AISystem } from './systems/AISystem'
export { BuildingSystem } from './systems/BuildingSystem'
export { CombatSystem } from './systems/CombatSystem'
export { DeathSystem } from './systems/DeathSystem'
// Systems
export { MovementSystem } from './systems/MovementSystem'
export { ProductionSystem } from './systems/ProductionSystem'
export { ResourceSystem } from './systems/ResourceSystem'
export { ShieldSystem } from './systems/ShieldSystem'
export { VisionSystem } from './systems/VisionSystem'
