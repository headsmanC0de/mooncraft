/**
 * ECS Test Utilities
 * 
 * Helper functions for testing Entity Component System
 * Provides factories for creating test entities and components
 */

import { vi } from 'vitest'
import type { 
  EntityId, 
  Entity, 
  Component, 
  ComponentType,
  TransformComponent,
  HealthComponent,
  MovementComponent,
  CombatComponent,
  SelectionComponent,
  Vector3,
} from '@/types/ecs'
import { ComponentType as CT } from '@/types/ecs'

// ============================================================================
// Entity Factory
// ============================================================================

let entityIdCounter = 0

/**
 * Generates a unique entity ID for testing
 */
export function generateEntityId(prefix = 'entity'): EntityId {
  return `${prefix}-${++entityIdCounter}`
}

/**
 * Resets the entity ID counter (call in beforeEach)
 */
export function resetEntityIdCounter(): void {
  entityIdCounter = 0
}

/**
 * Creates a test entity with specified components
 */
export function createTestEntity(
  components: Component[] = [],
  id?: EntityId
): Entity {
  const entity: Entity = {
    id: id ?? generateEntityId(),
    components: new Map(),
  }

  components.forEach(component => {
    entity.components.set(component.type, component)
  })

  return entity
}

// ============================================================================
// Component Factories
// ============================================================================

/**
 * Creates a transform component
 */
export function createTransformComponent(
  options: Partial<TransformComponent> = {}
): TransformComponent {
  return {
    type: CT.TRANSFORM,
    position: options.position ?? { x: 0, y: 0, z: 0 },
    rotation: options.rotation ?? 0,
    scale: options.scale ?? { x: 1, y: 1, z: 1 },
    ...options,
  }
}

/**
 * Creates a health component
 */
export function createHealthComponent(
  options: Partial<HealthComponent> = {}
): HealthComponent {
  return {
    type: CT.HEALTH,
    current: options.current ?? 100,
    max: options.max ?? 100,
    armor: options.armor ?? 0,
    shields: options.shields,
    ...options,
  }
}

/**
 * Creates a movement component
 */
export function createMovementComponent(
  options: Partial<MovementComponent> = {}
): MovementComponent {
  return {
    type: CT.MOVEMENT,
    speed: options.speed ?? 5,
    targetPosition: options.targetPosition ?? null,
    path: options.path ?? [],
    isMoving: options.isMoving ?? false,
    ...options,
  }
}

/**
 * Creates a combat component
 */
export function createCombatComponent(
  options: Partial<CombatComponent> = {}
): CombatComponent {
  return {
    type: CT.COMBAT,
    attackDamage: options.attackDamage ?? 10,
    attackRange: options.attackRange ?? 5,
    attackSpeed: options.attackSpeed ?? 1,
    attackCooldown: options.attackCooldown ?? 0,
    targetId: options.targetId ?? null,
    ...options,
  }
}

/**
 * Creates a selection component
 */
export function createSelectionComponent(
  options: Partial<SelectionComponent> = {}
): SelectionComponent {
  return {
    type: CT.SELECTION,
    isSelected: options.isSelected ?? false,
    ...options,
  }
}

// ============================================================================
// Entity Presets
// ============================================================================

/**
 * Creates a basic unit entity for testing
 */
export function createTestUnit(options: {
  id?: EntityId
  position?: Vector3
  health?: number
  speed?: number
  isSelected?: boolean
} = {}): Entity {
  return createTestEntity([
    createTransformComponent({ position: options.position }),
    createHealthComponent({ current: options.health, max: options.health ?? 100 }),
    createMovementComponent({ speed: options.speed }),
    createSelectionComponent({ isSelected: options.isSelected }),
  ], options.id)
}

/**
 * Creates a combat unit entity for testing
 */
export function createTestCombatUnit(options: {
  id?: EntityId
  position?: Vector3
  health?: number
  attackDamage?: number
  attackRange?: number
} = {}): Entity {
  return createTestEntity([
    createTransformComponent({ position: options.position }),
    createHealthComponent({ current: options.health, max: options.health ?? 100 }),
    createMovementComponent({ speed: 5 }),
    createCombatComponent({
      attackDamage: options.attackDamage,
      attackRange: options.attackRange,
    }),
    createSelectionComponent(),
  ], options.id)
}

/**
 * Creates multiple test units at grid positions
 */
export function createTestUnits(
  count: number,
  options: {
    startPosition?: Vector3
    spacing?: number
  } = {}
): Entity[] {
  const { startPosition = { x: 0, y: 0, z: 0 }, spacing = 2 } = options
  
  const units: Entity[] = []
  const gridSize = Math.ceil(Math.sqrt(count))
  
  for (let i = 0; i < count; i++) {
    const row = Math.floor(i / gridSize)
    const col = i % gridSize
    
    units.push(createTestUnit({
      position: {
        x: startPosition.x + col * spacing,
        y: startPosition.y,
        z: startPosition.z + row * spacing,
      },
    }))
  }
  
  return units
}

// ============================================================================
// Mock ECS Managers
// ============================================================================

/**
 * Creates a mock entity manager for testing
 */
export function createMockEntityManager() {
  const entities = new Map<EntityId, Entity>()
  
  return {
    entities,
    createEntity: vi.fn((components?: Component[]) => {
      const entity = createTestEntity(components)
      entities.set(entity.id, entity)
      return entity
    }),
    getEntity: vi.fn((id: EntityId) => entities.get(id)),
    removeEntity: vi.fn((id: EntityId) => entities.delete(id)),
    getAllEntities: vi.fn(() => Array.from(entities.values())),
    hasEntity: vi.fn((id: EntityId) => entities.has(id)),
    clear: () => entities.clear(),
  }
}

/**
 * Creates a mock component manager for testing
 */
export function createMockComponentManager() {
  const components = new Map<EntityId, Map<ComponentType, Component>>()
  
  return {
    components,
    addComponent: vi.fn((entityId: EntityId, component: Component) => {
      if (!components.has(entityId)) {
        components.set(entityId, new Map())
      }
      components.get(entityId)!.set(component.type, component)
    }),
    getComponent: vi.fn(<T extends Component>(entityId: EntityId, type: ComponentType): T | undefined => {
      return components.get(entityId)?.get(type) as T | undefined
    }),
    removeComponent: vi.fn((entityId: EntityId, type: ComponentType) => {
      components.get(entityId)?.delete(type)
    }),
    hasComponent: vi.fn((entityId: EntityId, type: ComponentType) => {
      return components.get(entityId)?.has(type) ?? false
    }),
    updateComponent: vi.fn((entityId: EntityId, type: ComponentType, updates: Partial<Component>) => {
      const component = components.get(entityId)?.get(type)
      if (component) {
        Object.assign(component, updates)
      }
    }),
    clear: () => components.clear(),
  }
}

// ============================================================================
// Game State Helpers
// ============================================================================

/**
 * Creates a minimal game state for testing
 */
export function createTestGameState(options: {
  entities?: Entity[]
  isPaused?: boolean
  tick?: number
} = {}) {
  const entityMap = new Map<EntityId, Entity>()
  options.entities?.forEach(entity => entityMap.set(entity.id, entity))
  
  return {
    tick: options.tick ?? 0,
    entities: entityMap,
    players: new Map(),
    isPaused: options.isPaused ?? false,
    speed: 1,
    selectedUnits: [],
  }
}

// ============================================================================
// Assertion Helpers
// ============================================================================

/**
 * Asserts that an entity has specific components
 */
export function expectEntityHasComponents(
  entity: Entity,
  componentTypes: ComponentType[]
): void {
  componentTypes.forEach(type => {
    if (!entity.components.has(type)) {
      throw new Error(`Entity ${entity.id} is missing component: ${type}`)
    }
  })
}

/**
 * Asserts that an entity is at a specific position
 */
export function expectEntityAtPosition(
  entity: Entity,
  expected: Vector3,
  tolerance = 0.01
): void {
  const transform = entity.components.get(CT.TRANSFORM) as TransformComponent | undefined
  if (!transform) {
    throw new Error(`Entity ${entity.id} has no transform component`)
  }
  
  const diff = 
    Math.abs(transform.position.x - expected.x) +
    Math.abs(transform.position.y - expected.y) +
    Math.abs(transform.position.z - expected.z)
  
  if (diff > tolerance * 3) {
    throw new Error(
      `Entity ${entity.id} at (${transform.position.x}, ${transform.position.y}, ${transform.position.z}) ` +
      `expected at (${expected.x}, ${expected.y}, ${expected.z})`
    )
  }
}
