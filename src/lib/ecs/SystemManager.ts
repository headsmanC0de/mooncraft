/**
 * System Manager - Manages ECS systems
 * KISS: Simple update loop with priority ordering
 */

import type { Entity, ComponentType } from '@/types/ecs'
import { entityManager } from './EntityManager'

export abstract class System {
  abstract readonly requiredComponents: ComponentType[]
  abstract readonly priority: number // Lower = runs first
  
  abstract update(entities: Entity[], deltaTime: number): void
}

export class SystemManager {
  private systems: System[] = []
  private isRunning = false

  /**
   * Register a system
   */
  registerSystem(system: System): void {
    this.systems.push(system)
    this.systems.sort((a, b) => a.priority - b.priority)
  }

  /**
   * Remove a system
   */
  removeSystem(system: System): boolean {
    const index = this.systems.indexOf(system)
    if (index !== -1) {
      this.systems.splice(index, 1)
      return true
    }
    return false
  }

  /**
   * Update all systems
   * DRY: Common query logic handled here
   */
  update(deltaTime: number): void {
    if (!this.isRunning) return

    for (const system of this.systems) {
      const entities = entityManager.queryEntities(...system.requiredComponents)
      system.update(entities, deltaTime)
    }
  }

  /**
   * Start/stop the system loop
   */
  start(): void {
    this.isRunning = true
  }

  stop(): void {
    this.isRunning = false
  }

  /**
   * Get system by type
   */
  getSystem<T extends System>(systemClass: new (...args: any[]) => T): T | undefined {
    return this.systems.find(s => s instanceof systemClass) as T | undefined
  }

  /**
   * Get all systems
   */
  getAllSystems(): System[] {
    return [...this.systems]
  }

  /**
   * Clear all systems
   */
  clear(): void {
    this.systems = []
  }
}

// Singleton instance
export const systemManager = new SystemManager()
