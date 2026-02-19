/**
 * ECS Systems Tests
 * 
 * Tests for Entity Component System core functionality
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { 
  createTestEntity, 
  createTestUnit,
  createTestCombatUnit,
  createTestUnits,
  createTransformComponent,
  createHealthComponent,
  createMovementComponent,
  createCombatComponent,
  resetEntityIdCounter,
  expectEntityHasComponents,
  expectEntityAtPosition,
} from '@/test/ecs-test-utils'
import { ComponentType } from '@/types/ecs'

describe('Entity Factory', () => {
  beforeEach(() => {
    resetEntityIdCounter()
  })

  describe('createTestEntity', () => {
    it('should create entity with unique ID', () => {
      const entity = createTestEntity()
      
      expect(entity.id).toBeDefined()
      expect(entity.id).toMatch(/^entity-\d+$/)
    })

    it('should create entity with custom ID', () => {
      const entity = createTestEntity([], 'custom-id')
      
      expect(entity.id).toBe('custom-id')
    })

    it('should create entity with components', () => {
      const entity = createTestEntity([
        createTransformComponent(),
        createHealthComponent(),
      ])
      
      expect(entity.components.size).toBe(2)
      expect(entity.components.has(ComponentType.TRANSFORM)).toBe(true)
      expect(entity.components.has(ComponentType.HEALTH)).toBe(true)
    })
  })

  describe('createTestUnit', () => {
    it('should create unit with required components', () => {
      const unit = createTestUnit()
      
      expectEntityHasComponents(unit, [
        ComponentType.TRANSFORM,
        ComponentType.HEALTH,
        ComponentType.MOVEMENT,
        ComponentType.SELECTION,
      ])
    })

    it('should create unit at specified position', () => {
      const unit = createTestUnit({
        position: { x: 10, y: 0, z: 20 },
      })
      
      expectEntityAtPosition(unit, { x: 10, y: 0, z: 20 })
    })

    it('should create unit with specified health', () => {
      const unit = createTestUnit({ health: 200 })
      
      const health = unit.components.get(ComponentType.HEALTH)
      expect(health?.current).toBe(200)
      expect(health?.max).toBe(200)
    })

    it('should create unit with selection state', () => {
      const selectedUnit = createTestUnit({ isSelected: true })
      const unselectedUnit = createTestUnit({ isSelected: false })
      
      const selected = selectedUnit.components.get(ComponentType.SELECTION)
      const unselected = unselectedUnit.components.get(ComponentType.SELECTION)
      
      expect(selected?.isSelected).toBe(true)
      expect(unselected?.isSelected).toBe(false)
    })
  })

  describe('createTestCombatUnit', () => {
    it('should create combat unit with combat component', () => {
      const unit = createTestCombatUnit()
      
      expectEntityHasComponents(unit, [ComponentType.COMBAT])
    })

    it('should create unit with specified attack damage', () => {
      const unit = createTestCombatUnit({ attackDamage: 25 })
      
      const combat = unit.components.get(ComponentType.COMBAT)
      expect(combat?.attackDamage).toBe(25)
    })

    it('should create unit with specified attack range', () => {
      const unit = createTestCombatUnit({ attackRange: 10 })
      
      const combat = unit.components.get(ComponentType.COMBAT)
      expect(combat?.attackRange).toBe(10)
    })
  })

  describe('createTestUnits', () => {
    it('should create multiple units', () => {
      const units = createTestUnits(5)
      
      expect(units).toHaveLength(5)
    })

    it('should position units in grid pattern', () => {
      const units = createTestUnits(4, {
        startPosition: { x: 0, y: 0, z: 0 },
        spacing: 2,
      })
      
      // Grid should be 2x2
      expectEntityAtPosition(units[0], { x: 0, y: 0, z: 0 })
      expectEntityAtPosition(units[1], { x: 2, y: 0, z: 0 })
      expectEntityAtPosition(units[2], { x: 0, y: 0, z: 2 })
      expectEntityAtPosition(units[3], { x: 2, y: 0, z: 2 })
    })

    it('should create units with unique IDs', () => {
      const units = createTestUnits(10)
      const ids = units.map(u => u.id)
      const uniqueIds = new Set(ids)
      
      expect(uniqueIds.size).toBe(10)
    })
  })
})

describe('Component Factories', () => {
  describe('createTransformComponent', () => {
    it('should create transform with default values', () => {
      const transform = createTransformComponent()
      
      expect(transform.type).toBe(ComponentType.TRANSFORM)
      expect(transform.position).toEqual({ x: 0, y: 0, z: 0 })
      expect(transform.rotation).toBe(0)
      expect(transform.scale).toEqual({ x: 1, y: 1, z: 1 })
    })

    it('should create transform with custom position', () => {
      const transform = createTransformComponent({
        position: { x: 50, y: 10, z: 50 },
      })
      
      expect(transform.position).toEqual({ x: 50, y: 10, z: 50 })
    })
  })

  describe('createHealthComponent', () => {
    it('should create health with default values', () => {
      const health = createHealthComponent()
      
      expect(health.type).toBe(ComponentType.HEALTH)
      expect(health.current).toBe(100)
      expect(health.max).toBe(100)
      expect(health.armor).toBe(0)
    })

    it('should create health with custom values', () => {
      const health = createHealthComponent({
        current: 80,
        max: 150,
        armor: 5,
        shields: 50,
      })
      
      expect(health.current).toBe(80)
      expect(health.max).toBe(150)
      expect(health.armor).toBe(5)
      expect(health.shields).toBe(50)
    })
  })

  describe('createMovementComponent', () => {
    it('should create movement with default values', () => {
      const movement = createMovementComponent()
      
      expect(movement.type).toBe(ComponentType.MOVEMENT)
      expect(movement.speed).toBe(5)
      expect(movement.targetPosition).toBeNull()
      expect(movement.isMoving).toBe(false)
    })

    it('should create movement with target', () => {
      const movement = createMovementComponent({
        targetPosition: { x: 10, y: 0, z: 10 },
        isMoving: true,
      })
      
      expect(movement.targetPosition).toEqual({ x: 10, y: 0, z: 10 })
      expect(movement.isMoving).toBe(true)
    })
  })

  describe('createCombatComponent', () => {
    it('should create combat with default values', () => {
      const combat = createCombatComponent()
      
      expect(combat.type).toBe(ComponentType.COMBAT)
      expect(combat.attackDamage).toBe(10)
      expect(combat.attackRange).toBe(5)
      expect(combat.attackSpeed).toBe(1)
      expect(combat.targetId).toBeNull()
    })

    it('should create combat with target', () => {
      const combat = createCombatComponent({
        targetId: 'enemy-1',
        attackCooldown: 0.5,
      })
      
      expect(combat.targetId).toBe('enemy-1')
      expect(combat.attackCooldown).toBe(0.5)
    })
  })
})

describe('Assertion Helpers', () => {
  describe('expectEntityHasComponents', () => {
    it('should pass when entity has all components', () => {
      const entity = createTestEntity([
        createTransformComponent(),
        createHealthComponent(),
      ])
      
      expect(() => 
        expectEntityHasComponents(entity, [ComponentType.TRANSFORM, ComponentType.HEALTH])
      ).not.toThrow()
    })

    it('should throw when entity is missing component', () => {
      const entity = createTestEntity([createTransformComponent()])
      
      expect(() => 
        expectEntityHasComponents(entity, [ComponentType.COMBAT])
      ).toThrow('missing component')
    })
  })

  describe('expectEntityAtPosition', () => {
    it('should pass when entity is at position', () => {
      const entity = createTestUnit({ position: { x: 10, y: 0, z: 20 } })
      
      expect(() => 
        expectEntityAtPosition(entity, { x: 10, y: 0, z: 20 })
      ).not.toThrow()
    })

    it('should throw when entity is at wrong position', () => {
      const entity = createTestUnit({ position: { x: 10, y: 0, z: 20 } })
      
      expect(() => 
        expectEntityAtPosition(entity, { x: 5, y: 0, z: 5 })
      ).toThrow('expected at')
    })

    it('should respect tolerance', () => {
      const entity = createTestUnit({ position: { x: 10, y: 0, z: 20 } })
      
      expect(() => 
        expectEntityAtPosition(entity, { x: 10.005, y: 0, z: 20.005 }, 0.01)
      ).not.toThrow()
    })
  })
})
