/**
 * Game Store - Main game state management
 * Using Zustand for SSOT game state
 */

import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { getBuildingDef } from '@/config/buildings'
import type { MapDefinition } from '@/config/maps'
import { getRandomMap } from '@/config/maps'
import { getUnitDef } from '@/config/units'
import { audioEngine } from '@/lib/audio'
import {
	AISystem,
	BuildingSystem,
	CombatSystem,
	componentManager,
	EntityFactory,
	entityManager,
	MovementSystem,
	ProductionSystem,
	ResourceSystem,
	ShieldSystem,
	systemManager,
	VisionSystem,
} from '@/lib/ecs'
import type { GameStatus } from '@/lib/game/GameManager'
import { calculateSupplyFromEntities } from '@/lib/game/supply'
import { canBuild } from '@/lib/game/techTree'
import type { BuildingComponent, EntityId, GameState, PlayerState, Vector3 } from '@/types/ecs'
import { ComponentType } from '@/types/ecs'

function spawnStartingBase(
	factory: EntityFactory,
	playerId: string,
	teamId: string,
	faction: 'terran' | 'protoss',
	basePosition: Vector3,
	mineralPositions: Vector3[],
	gasGeyserPosition: Vector3,
) {
	const mainBuilding = faction === 'terran' ? 'command_center' : 'nexus'
	const workerType = faction === 'terran' ? 'worker' : 'probe'

	factory.createBuilding(mainBuilding, playerId, teamId, basePosition, true, faction)

	// Create 4 workers around base
	const offsets = [
		{ x: -2, z: 2 },
		{ x: 2, z: 2 },
		{ x: -2, z: -2 },
		{ x: 2, z: -2 },
	]
	for (const offset of offsets) {
		factory.createUnit(
			workerType,
			playerId,
			teamId,
			{
				x: basePosition.x + offset.x,
				y: 0,
				z: basePosition.z + offset.z,
			},
			faction,
		)
	}

	// Create mineral patches
	for (const pos of mineralPositions) {
		factory.createMineralPatch(pos)
	}

	// Create gas geyser
	factory.createGasGeyser(gasGeyserPosition)
}

interface GameStore extends GameState {
	// Map
	currentMap: MapDefinition | null

	// Selection
	selectedUnits: EntityId[]

	// Camera
	cameraPosition: { x: number; y: number; z: number }
	cameraZoom: number

	// UI State
	placementMode: string | null
	hoveredEntity: EntityId | null
	showPauseMenu: boolean

	// Game status
	gameStatus: GameStatus

	// Player faction selection
	playerFaction: 'terran' | 'protoss'

	// Actions
	initializeGame: () => void
	selectUnits: (ids: EntityId[], additive?: boolean) => void
	clearSelection: () => void
	moveSelectedUnits: (target: Vector3) => void
	setPlacementMode: (mode: string | null) => void
	placeBuilding: (buildingType: string, position: Vector3) => void
	trainUnit: (buildingId: EntityId, unitType: string) => void
	setCameraPosition: (pos: { x: number; y: number; z: number }) => void
	setCameraZoom: (zoom: number) => void
	pause: () => void
	resume: () => void
	togglePauseMenu: () => void
	tick: (delta: number) => void
}

export const useGameStore = create<GameStore>()(
	subscribeWithSelector((set, get) => ({
		// Initial state
		currentTick: 0,
		entities: new Map(),
		players: new Map(),
		isPaused: true,
		speed: 1,
		currentMap: null,
		selectedUnits: [],
		cameraPosition: { x: 40, y: 50, z: 40 },
		cameraZoom: 30,
		placementMode: null,
		hoveredEntity: null,
		showPauseMenu: false,
		gameStatus: 'playing' as GameStatus,
		playerFaction: 'terran' as 'terran' | 'protoss',

		initializeGame: () => {
			// Register systems
			systemManager.registerSystem(new MovementSystem())
			systemManager.registerSystem(new BuildingSystem())
			systemManager.registerSystem(new ShieldSystem())
			systemManager.registerSystem(new CombatSystem())
			systemManager.registerSystem(new ProductionSystem())
			const resourceSystem = new ResourceSystem()
			resourceSystem.setDepositCallback((playerId, amount, resourceType) => {
				const state = useGameStore.getState()
				const player = state.players.get(playerId)
				if (player) {
					const players = new Map(state.players)
					const resources = { ...player.resources }
					if (resourceType === 'gas') {
						resources.gas += amount
					} else {
						resources.minerals += amount
					}
					players.set(playerId, { ...player, resources })
					useGameStore.setState({ players })
				}
			})
			systemManager.registerSystem(resourceSystem)
			systemManager.registerSystem(new AISystem())
			systemManager.registerSystem(new VisionSystem())

			// Determine factions based on player selection
			const playerFaction = get().playerFaction
			const aiFaction: 'terran' | 'protoss' = playerFaction === 'terran' ? 'protoss' : 'terran'

			// Initialize players
			const players = new Map<string, PlayerState>()
			players.set('player1', {
				id: 'player1',
				name: 'Player 1',
				teamId: 'team1',
				faction: playerFaction,
				resources: { minerals: 500, gas: 250, supply: 10, maxSupply: 50 },
				isAlive: true,
			})
			players.set('player2', {
				id: 'player2',
				name: 'Player 2',
				teamId: 'team2',
				faction: aiFaction,
				resources: { minerals: 500, gas: 250, supply: 10, maxSupply: 50 },
				isAlive: true,
			})

			// Pick a random map
			const map = getRandomMap()

			// Spawn starting entities
			const factory = new EntityFactory(entityManager, componentManager)

			// Player 1 starting base
			spawnStartingBase(
				factory, 'player1', 'team1', playerFaction,
				map.player1.base, map.player1.minerals, map.player1.gasGeyser,
			)

			// Player 2 (AI) starting base
			spawnStartingBase(
				factory, 'player2', 'team2', aiFaction,
				map.player2.base, map.player2.minerals, map.player2.gasGeyser,
			)

			// Set camera to player 1's base
			set({
				players,
				isPaused: false,
				currentMap: map,
				cameraPosition: {
					x: map.player1.base.x,
					y: 25,
					z: map.player1.base.z,
				},
			})
			systemManager.start()
		},

		selectUnits: (ids, additive = false) =>
			set((state) => {
				state.selectedUnits.forEach((id) => {
					const entity = entityManager.getEntity(id)
					if (entity) {
						componentManager.updateComponent(id, ComponentType.SELECTION, { isSelected: false })
					}
				})

				ids.forEach((id) => {
					componentManager.updateComponent(id, ComponentType.SELECTION, { isSelected: true })
				})

				if (ids.length > 0) {
					audioEngine.playSelect()
				}

				return {
					selectedUnits: additive ? [...new Set([...state.selectedUnits, ...ids])] : ids,
				}
			}),

		clearSelection: () =>
			set((state) => {
				state.selectedUnits.forEach((id) => {
					componentManager.updateComponent(id, ComponentType.SELECTION, { isSelected: false })
				})
				return { selectedUnits: [] }
			}),

		moveSelectedUnits: (target) => {
			const { selectedUnits } = get()
			if (selectedUnits.length > 0) {
				audioEngine.playMove()
			}

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

		placeBuilding: (buildingType, position) => {
			const state = get()
			const player = state.players.get('player1')
			if (!player) return

			// Check tech tree requirements
			if (!canBuild(buildingType, 'player1')) {
				audioEngine.playError()
				return
			}

			const def = getBuildingDef(buildingType)

			// Check resources
			if (player.resources.minerals < def.cost.minerals || player.resources.gas < def.cost.gas) {
				audioEngine.playError()
				return // Not enough resources
			}

			// Deduct resources
			const updatedPlayers = new Map(state.players)
			const updatedPlayer = {
				...player,
				resources: {
					...player.resources,
					minerals: player.resources.minerals - def.cost.minerals,
					gas: player.resources.gas - def.cost.gas,
				},
			}
			updatedPlayers.set('player1', updatedPlayer)

			// Create building entity
			const factory = new EntityFactory(entityManager, componentManager)
			const player1 = state.players.get('player1')
			factory.createBuilding(buildingType, 'player1', 'team1', position, false, player1?.faction)

			audioEngine.playBuild()
			set({ players: updatedPlayers, placementMode: null })
		},

		trainUnit: (buildingId, unitType) => {
			const state = get()
			const player = state.players.get('player1')
			if (!player) return

			const unitDef = getUnitDef(unitType)
			const building = componentManager.getComponent<BuildingComponent>(
				buildingId,
				ComponentType.BUILDING,
			)
			if (!building || building.buildProgress < 1) return

			// Check resources
			if (
				player.resources.minerals < unitDef.cost.minerals ||
				player.resources.gas < unitDef.cost.gas
			) {
				audioEngine.playError()
				return
			}

			// Check supply
			const allEntities = entityManager.getAllEntities()
			const { used: supplyUsed, max: supplyMax } = calculateSupplyFromEntities(
				allEntities,
				'player1',
			)

			if (supplyUsed + unitDef.cost.supply > supplyMax) {
				audioEngine.playError()
				return
			}

			// Deduct resources
			const updatedPlayers = new Map(state.players)
			updatedPlayers.set('player1', {
				...player,
				resources: {
					...player.resources,
					minerals: player.resources.minerals - unitDef.cost.minerals,
					gas: player.resources.gas - unitDef.cost.gas,
				},
			})

			// Add to building queue
			building.queue.push({
				type: unitType,
				progress: 0,
				duration: unitDef.buildTime,
			})

			audioEngine.playTrain()
			set({ players: updatedPlayers })
		},

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

		togglePauseMenu: () => {
			const { showPauseMenu } = get()
			if (showPauseMenu) {
				systemManager.start()
				set({ showPauseMenu: false, isPaused: false })
			} else {
				systemManager.stop()
				set({ showPauseMenu: true, isPaused: true })
			}
		},

		tick: (delta) => {
			const { isPaused, speed } = get()
			if (isPaused) return

			systemManager.update(delta * speed)
			set((state) => ({ currentTick: state.currentTick + 1 }))
		},
	})),
)
