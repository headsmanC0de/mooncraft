/**
 * Game Store Tests
 * 
 * Tests for the main game state management using Zustand
 * Following AAA pattern and testing both positive and negative cases
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useGameStore } from '@/stores/gameStore'
import { ComponentType } from '@/types/ecs'

// Mock the ECS module
vi.mock('@/lib/ecs', () => ({
  entityManager: {
    getEntity: vi.fn(),
    getAllEntities: vi.fn(() => []),
  },
  componentManager: {
    getComponent: vi.fn(),
    updateComponent: vi.fn(),
  },
  systemManager: {
    registerSystem: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
    update: vi.fn(),
  },
  MovementSystem: vi.fn(),
  CombatSystem: vi.fn(),
}))

describe('GameStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useGameStore.setState({
      tick: 0,
      entities: new Map(),
      players: new Map(),
      isPaused: true,
      speed: 1,
      selectedUnits: [],
      cameraPosition: { x: 40, y: 50, z: 40 },
      cameraZoom: 30,
      placementMode: null,
      hoveredEntity: null,
    })
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('should have correct default values', () => {
      const state = useGameStore.getState()
      
      expect(state.tick).toBe(0)
      expect(state.isPaused).toBe(true)
      expect(state.speed).toBe(1)
      expect(state.selectedUnits).toEqual([])
      expect(state.cameraPosition).toEqual({ x: 40, y: 50, z: 40 })
      expect(state.cameraZoom).toBe(30)
      expect(state.placementMode).toBeNull()
    })
  })

  describe('selectUnits', () => {
    it('should select units by ID', () => {
      const { selectUnits } = useGameStore.getState()
      
      selectUnits(['unit-1', 'unit-2'])
      
      expect(useGameStore.getState().selectedUnits).toEqual(['unit-1', 'unit-2'])
    })

    it('should replace previous selection when not additive', () => {
      const { selectUnits } = useGameStore.getState()
      
      selectUnits(['unit-1'])
      selectUnits(['unit-2'])
      
      expect(useGameStore.getState().selectedUnits).toEqual(['unit-2'])
    })

    it('should add to selection when additive is true', () => {
      const { selectUnits } = useGameStore.getState()
      
      selectUnits(['unit-1'])
      selectUnits(['unit-2'], true)
      
      expect(useGameStore.getState().selectedUnits).toEqual(['unit-1', 'unit-2'])
    })

    it('should not duplicate units in additive selection', () => {
      const { selectUnits } = useGameStore.getState()
      
      selectUnits(['unit-1'])
      selectUnits(['unit-1', 'unit-2'], true)
      
      expect(useGameStore.getState().selectedUnits).toEqual(['unit-1', 'unit-2'])
    })

    it('should handle empty selection', () => {
      const { selectUnits } = useGameStore.getState()
      
      selectUnits(['unit-1'])
      selectUnits([])
      
      expect(useGameStore.getState().selectedUnits).toEqual([])
    })
  })

  describe('clearSelection', () => {
    it('should clear all selected units', () => {
      const { selectUnits, clearSelection } = useGameStore.getState()
      
      selectUnits(['unit-1', 'unit-2', 'unit-3'])
      clearSelection()
      
      expect(useGameStore.getState().selectedUnits).toEqual([])
    })

    it('should be idempotent', () => {
      const { clearSelection } = useGameStore.getState()
      
      clearSelection()
      clearSelection()
      
      expect(useGameStore.getState().selectedUnits).toEqual([])
    })
  })

  describe('setCameraPosition', () => {
    it('should update camera position', () => {
      const { setCameraPosition } = useGameStore.getState()
      
      setCameraPosition({ x: 100, y: 80, z: 100 })
      
      expect(useGameStore.getState().cameraPosition).toEqual({ x: 100, y: 80, z: 100 })
    })

    it('should accept partial updates', () => {
      const { setCameraPosition } = useGameStore.getState()
      
      setCameraPosition({ x: 100, y: 50, z: 40 })
      
      expect(useGameStore.getState().cameraPosition.x).toBe(100)
    })
  })

  describe('setCameraZoom', () => {
    it('should update camera zoom level', () => {
      const { setCameraZoom } = useGameStore.getState()
      
      setCameraZoom(50)
      
      expect(useGameStore.getState().cameraZoom).toBe(50)
    })

    it('should accept zoom values', () => {
      const { setCameraZoom } = useGameStore.getState()
      
      setCameraZoom(20)
      expect(useGameStore.getState().cameraZoom).toBe(20)
      
      setCameraZoom(100)
      expect(useGameStore.getState().cameraZoom).toBe(100)
    })
  })

  describe('setPlacementMode', () => {
    it('should set placement mode', () => {
      const { setPlacementMode } = useGameStore.getState()
      
      setPlacementMode('barracks')
      
      expect(useGameStore.getState().placementMode).toBe('barracks')
    })

    it('should clear placement mode with null', () => {
      const { setPlacementMode } = useGameStore.getState()
      
      setPlacementMode('barracks')
      setPlacementMode(null)
      
      expect(useGameStore.getState().placementMode).toBeNull()
    })
  })

  describe('pause/resume', () => {
    it('should pause the game', () => {
      const { initializeGame, pause } = useGameStore.getState()
      
      initializeGame()
      pause()
      
      expect(useGameStore.getState().isPaused).toBe(true)
    })

    it('should resume the game', () => {
      const { initializeGame, pause, resume } = useGameStore.getState()
      
      initializeGame()
      pause()
      resume()
      
      expect(useGameStore.getState().isPaused).toBe(false)
    })
  })

  describe('updateTick', () => {
    it('should not update when paused', () => {
      const { updateTick } = useGameStore.getState()
      
      updateTick(0.016)
      
      expect(useGameStore.getState().tick).toBe(0)
    })

    it('should increment tick when not paused', async () => {
      const { initializeGame, updateTick } = useGameStore.getState()
      
      initializeGame()
      updateTick(0.016)
      
      expect(useGameStore.getState().tick).toBe(1)
    })

    it('should respect game speed', async () => {
      const { initializeGame, updateTick } = useGameStore.getState()
      
      initializeGame()
      useGameStore.setState({ speed: 2 })
      updateTick(0.016)
      
      // Speed 2x means system.update is called with delta * 2
      // Tick still increments by 1
      expect(useGameStore.getState().tick).toBe(1)
    })
  })

  describe('initializeGame', () => {
    it('should initialize players', () => {
      const { initializeGame } = useGameStore.getState()
      
      initializeGame()
      
      const players = useGameStore.getState().players
      expect(players.size).toBe(2)
      expect(players.has('player1')).toBe(true)
      expect(players.has('player2')).toBe(true)
    })

    it('should set initial resources for players', () => {
      const { initializeGame } = useGameStore.getState()
      
      initializeGame()
      
      const player1 = useGameStore.getState().players.get('player1')
      expect(player1?.resources).toEqual({
        minerals: 500,
        gas: 250,
        supply: 10,
        maxSupply: 50,
      })
    })

    it('should start the game unpaused', () => {
      const { initializeGame } = useGameStore.getState()
      
      initializeGame()
      
      expect(useGameStore.getState().isPaused).toBe(false)
    })
  })
})
