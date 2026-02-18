/**
 * Entity Manager - Handles entity creation, destruction, and queries
 * SSOT: All entity operations go through this manager
 */

import type { Entity, EntityId, ComponentType, Component } from '@/types/ecs'
import { v4 as uuid } from 'uuid'

export class EntityManager {
  private entities: Map<EntityId, Entity> = new Map()
  private componentIndex: Map<ComponentType, Set<EntityId>> = new Map()

  /**
   * Create a new entity
   */
  createEntity(): EntityId {
    const id = uuid()
    const entity: Entity = {
      id,
      components: new Map(),
    }
    
    this.entities.set(id, entity)
    return id
  }

  /**
   * Destroy an entity and clean up indexes
   */
  destroyEntity(id: EntityId): boolean {
    const entity = this.entities.get(id)
    if (!entity) return false

    // Clean up component indexes
    entity.components.forEach((_, type) => {
      this.componentIndex.get(type)?.delete(id)
    })

    this.entities.delete(id)
    return true
  }

  /**
   * Get entity by ID
   */
  getEntity(id: EntityId): Entity | undefined {
    return this.entities.get(id)
  }

  /**
   * Check if entity exists
   */
  hasEntity(id: EntityId): boolean {
    return this.entities.has(id)
  }

  /**
   * Get all entities
   */
  getAllEntities(): Entity[] {
    return Array.from(this.entities.values())
  }

  /**
   * Query entities by component types (AND condition)
   * KISS: Simple query, efficient for common cases
   */
  queryEntities(...componentTypes: ComponentType[]): Entity[] {
    if (componentTypes.length === 0) {
      return this.getAllEntities()
    }

    // Start with smallest set
    const smallestSet = this.findSmallestComponentSet(componentTypes)
    if (!smallestSet) return []

    // Filter by remaining components
    return Array.from(smallestSet)
      .map(id => this.entities.get(id)!)
      .filter(entity =>
        componentTypes.every(type => entity.components.has(type))
      )
  }

  /**
   * Query entities by single component type (optimized)
   */
  queryEntitiesByComponent(type: ComponentType): Entity[] {
    const ids = this.componentIndex.get(type)
    if (!ids) return []
    
    return Array.from(ids)
      .map(id => this.entities.get(id)!)
      .filter(Boolean)
  }

  /**
   * Get entity count
   */
  getEntityCount(): number {
    return this.entities.size
  }

  // Private helpers

  private findSmallestComponentSet(types: ComponentType[]): Set<EntityId> | null {
    let smallest: Set<EntityId> | null = null
    let smallestSize = Infinity

    for (const type of types) {
      const set = this.componentIndex.get(type)
      if (!set || set.size === 0) return null
      
      if (set.size < smallestSize) {
        smallest = set
        smallestSize = set.size
      }
    }

    return smallest
  }

  // Called by ComponentManager when components are added/removed
  _onComponentAdded(entityId: EntityId, type: ComponentType): void {
    if (!this.componentIndex.has(type)) {
      this.componentIndex.set(type, new Set())
    }
    this.componentIndex.get(type)!.add(entityId)
  }

  _onComponentRemoved(entityId: EntityId, type: ComponentType): void {
    this.componentIndex.get(type)?.delete(entityId)
  }
}

// Singleton instance
export const entityManager = new EntityManager()
