/**
 * Game Store - Main game state management
 * Using Zustand for SSOT game state
 */

import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import type { EntityId, Vector3, PlayerState, GameState } from '@/types/ecs'
import { ComponentType } from '@/types/ecs'
import { entityManager, componentManager, systemManager, MovementSystem, CombatSystem } from '@/lib/ecs'

interface GameStore extends GameState {
  // Selection
  selectedUnits: EntityId[]
  
  // Camera
  cameraPosition: { x: number; y: number; z: number }
  cameraZoom: number
  
  // UI State
  placementMode: string | null
  hoveredEntity: EntityId | null
  
  // Actions
  initializeGame: () => void
  selectUnits: (ids: EntityId[], additive?: boolean) => void
  clearSelection: () => void
  moveSelectedUnits: (target: Vector3) => void
  setPlacementMode: (mode: string | null) => void
  setCameraPosition: (pos: { x: number; y: number; z: number }) => void
  setCameraZoom: (zoom: number) => void
  pause: () => void
  resume: () => void
  tick: (delta: number) => void
}

export const useGameStore = create<GameStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
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

    initializeGame: () => {
      // Register systems
      systemManager.registerSystem(new MovementSystem())
      systemManager.registerSystem(new CombatSystem())

      // Initialize players
      const players = new Map<string, PlayerState>()
      players.set('player1', {
        id: 'player1',
        name: 'Player 1',
        teamId: 'team1',
        resources: { minerals: 500, gas: 250, supply: 10, maxSupply: 50 },
        isAlive: true,
      })
      players.set('player2', {
        id: 'player2',
        name: 'Player 2',
        teamId: 'team2',
        resources: { minerals: 500, gas: 250, supply: 10, maxSupply: 50 },
        isAlive: true,
      })

      // Create starting units (simplified for now)
      // TODO: Use proper factory pattern

      set({ players, isPaused: false })
      systemManager.start()
    },

    selectUnits: (ids, additive = false) => set(state => {
      // Clear previous selection
      state.selectedUnits.forEach(id => {
        const entity = entityManager.getEntity(id)
        if (entity) {
          componentManager.updateComponent(id, ComponentType.SELECTION, { isSelected: false })
        }
      })

      // Select new units
      ids.forEach(id => {
        componentManager.updateComponent(id, ComponentType.SELECTION, { isSelected: true })
      })

      return {
        selectedUnits: additive ? [...new Set([...state.selectedUnits, ...ids])] : ids
      }
    }),

    clearSelection: () => set(state => {
      state.selectedUnits.forEach(id => {
        componentManager.updateComponent(id, ComponentType.SELECTION, { isSelected: false })
      })
      return { selectedUnits: [] }
    }),

    moveSelectedUnits: (target) => {
      const { selectedUnits } = get()
      
      // Formation offsets (simple grid)
      const offsets = [
        { x: 0, z: 0 },
        { x: 2, z: 0 },
        { x: -2, z: 0 },
        { x: 0, z: 2 },
        { x: 0, z: -2 },
        { x: 2, z: 2 },
        { x: -2, z: 2 },
        { x: 2, z: -2 },
        { x: -2, z: -2 },
      ]

      selectedUnits.forEach((id, index) => {
        const offset = selectedUnits.length > 1 ? offsets[index % offsets.length] : { x: 0, z: 0 }
        
        componentManager.updateComponent(id, ComponentType.MOVEMENT, {
          targetPosition: {
            x: target.x + offset.x,
            y: 0,
            z: target.z + offset.z,
          },
        })
      })
    },

    setPlacementMode: (mode) => set({ placementMode: mode }),
    
    setCameraPosition: (pos) => set({ cameraPosition: pos }),
    
    setCameraZoom: (zoom) => set({ cameraZoom: zoom }),

    pause: () => {
      systemManager.stop()
      set({ isPaused: true })
    },

    resume: () => {
      systemManager.start()
      set({ isPaused: false })
    },

    tick: (delta) => {
      const { isPaused, speed } = get()
      if (isPaused) return

      systemManager.update(delta * speed)
      set(state => ({ tick: state.tick + 1 }))
    },
  }))
)
