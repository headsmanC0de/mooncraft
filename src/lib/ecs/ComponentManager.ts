/**
 * Component Manager - Manages component operations
 * DRY: All component operations centralized here
 */

import type { Entity, EntityId, Component, ComponentType } from '@/types/ecs'
import { entityManager } from './EntityManager'

export class ComponentManager {
  /**
   * Add component to entity
   */
  addComponent(entityId: EntityId, component: Component): boolean {
    const entity = entityManager.getEntity(entityId)
    if (!entity) return false

    entity.components.set(component.type, component)
    entityManager._onComponentAdded(entityId, component.type)
    
    return true
  }

  /**
   * Remove component from entity
   */
  removeComponent(entityId: EntityId, type: ComponentType): boolean {
    const entity = entityManager.getEntity(entityId)
    if (!entity) return false

    const removed = entity.components.delete(type)
    if (removed) {
      entityManager._onComponentRemoved(entityId, type)
    }
    
    return removed
  }

  /**
   * Get component from entity with type safety
   */
  getComponent<T extends Component>(
    entityId: EntityId,
    type: ComponentType
  ): T | undefined {
    const entity = entityManager.getEntity(entityId)
    if (!entity) return undefined

    return entity.components.get(type) as T | undefined
  }

  /**
   * Check if entity has component
   */
  hasComponent(entityId: EntityId, type: ComponentType): boolean {
    const entity = entityManager.getEntity(entityId)
    if (!entity) return false

    return entity.components.has(type)
  }

  /**
   * Update component (partial update)
   */
  updateComponent<T extends Component>(
    entityId: EntityId,
    type: ComponentType,
    updates: Partial<Omit<T, 'type'>>
  ): boolean {
    const entity = entityManager.getEntity(entityId)
    if (!entity) return false

    const component = entity.components.get(type) as T | undefined
    if (!component) return false

    Object.assign(component, updates)
    return true
  }

  /**
   * Get all components of an entity
   */
  getAllComponents(entityId: EntityId): Component[] {
    const entity = entityManager.getEntity(entityId)
    if (!entity) return []

    return Array.from(entity.components.values())
  }

  /**
   * Clone component from one entity to another
   */
  cloneComponent(
    fromEntityId: EntityId,
    toEntityId: EntityId,
    type: ComponentType
  ): boolean {
    const component = this.getComponent(fromEntityId, type)
    if (!component) return false

    // Deep clone the component
    const cloned = JSON.parse(JSON.stringify(component))
    return this.addComponent(toEntityId, cloned)
  }
}

// Singleton instance
export const componentManager = new ComponentManager()
