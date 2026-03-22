# MVP "First Battle" Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Player can build a base, train an army, gather resources, and destroy an AI opponent in a stylized 3D browser RTS.

**Architecture:** Extend existing ECS with new systems (Resource, Building, AI, Vision, Render, Input). Game runs client-side only (no multiplayer). Three.js scene with React Three Fiber renders the world. Zustand store remains SSOT. Game config defines all units/buildings as data (not code). White-label: all branding pulled from config.

**Tech Stack:** Next.js 16, React 19, Three.js + R3F + Drei, Zustand, Vitest, Biome, Bun, TypeScript strict

**Conventions:**
- TDD: test first, then implement
- Files < 450 lines
- Conventional commits
- `bun run test` / `bun run typecheck` / `bun run lint` to verify
- All game data (unit stats, building defs) in `src/config/` — no magic numbers in systems

---

## Phase 1: Foundation & Config (Tasks 1-4)

### Task 1: Vitest Configuration & First Test

**Files:**
- Create: `vitest.config.ts`
- Create: `src/lib/ecs/__tests__/EntityManager.test.ts`

**Step 1: Create vitest config**

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import path from 'node:path'

export default defineConfig({
	test: {
		globals: true,
		environment: 'node',
	},
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src'),
		},
	},
})
```

**Step 2: Write the first test — EntityManager**

```typescript
// src/lib/ecs/__tests__/EntityManager.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { EntityManager } from '../EntityManager'
import { ComponentType } from '@/types/ecs'

describe('EntityManager', () => {
	let em: EntityManager

	beforeEach(() => {
		em = new EntityManager()
	})

	it('should create entity with unique id', () => {
		const id = em.createEntity()
		expect(id).toBeDefined()
		expect(typeof id).toBe('string')
		expect(em.hasEntity(id)).toBe(true)
	})

	it('should destroy entity', () => {
		const id = em.createEntity()
		expect(em.destroyEntity(id)).toBe(true)
		expect(em.hasEntity(id)).toBe(false)
	})

	it('should return false when destroying non-existent entity', () => {
		expect(em.destroyEntity('non-existent')).toBe(false)
	})

	it('should query entities by component type', () => {
		const id = em.createEntity()
		em._onComponentAdded(id, ComponentType.TRANSFORM)
		em._onComponentAdded(id, ComponentType.HEALTH)

		const result = em.queryEntities(ComponentType.TRANSFORM, ComponentType.HEALTH)
		expect(result).toHaveLength(1)
		expect(result[0].id).toBe(id)
	})

	it('should return empty for unmatched queries', () => {
		const id = em.createEntity()
		em._onComponentAdded(id, ComponentType.TRANSFORM)

		const result = em.queryEntities(ComponentType.TRANSFORM, ComponentType.HEALTH)
		expect(result).toHaveLength(0)
	})

	it('should track entity count', () => {
		em.createEntity()
		em.createEntity()
		expect(em.getEntityCount()).toBe(2)
	})
})
```

**Step 3: Run tests**

Run: `bun run test -- --run`
Expected: All 6 tests PASS

**Step 4: Commit**

```bash
git add vitest.config.ts src/lib/ecs/__tests__/EntityManager.test.ts
git commit -m "test: add vitest config and EntityManager tests"
```

---

### Task 2: Game Config — Unit & Building Definitions

**Files:**
- Create: `src/config/units.ts`
- Create: `src/config/buildings.ts`
- Create: `src/config/game.ts`
- Create: `src/config/index.ts`
- Create: `src/config/__tests__/config.test.ts`

**Step 1: Write config test**

```typescript
// src/config/__tests__/config.test.ts
import { describe, it, expect } from 'vitest'
import { UNIT_DEFINITIONS, getUnitDef } from '../units'
import { BUILDING_DEFINITIONS, getBuildingDef } from '../buildings'
import { GAME_CONFIG } from '../game'

describe('Unit Definitions', () => {
	it('should have worker unit', () => {
		const worker = getUnitDef('worker')
		expect(worker).toBeDefined()
		expect(worker.cost.minerals).toBeGreaterThan(0)
		expect(worker.canGather).toBe(true)
	})

	it('should have marine unit', () => {
		const marine = getUnitDef('marine')
		expect(marine).toBeDefined()
		expect(marine.combat).toBeDefined()
		expect(marine.combat!.damage).toBeGreaterThan(0)
	})

	it('should have siege_tank unit', () => {
		const tank = getUnitDef('siege_tank')
		expect(tank).toBeDefined()
		expect(tank.combat!.range).toBeGreaterThan(5)
	})

	it('should have medivac unit', () => {
		const medivac = getUnitDef('medivac')
		expect(medivac).toBeDefined()
		expect(medivac.isFlying).toBe(true)
	})

	it('all units should have valid cost', () => {
		for (const [id, def] of Object.entries(UNIT_DEFINITIONS)) {
			expect(def.cost.minerals, `${id} missing mineral cost`).toBeGreaterThanOrEqual(0)
			expect(def.cost.supply, `${id} missing supply cost`).toBeGreaterThanOrEqual(0)
			expect(def.stats.health, `${id} missing health`).toBeGreaterThan(0)
			expect(def.stats.speed, `${id} missing speed`).toBeGreaterThan(0)
		}
	})
})

describe('Building Definitions', () => {
	it('should have command_center', () => {
		const cc = getBuildingDef('command_center')
		expect(cc).toBeDefined()
		expect(cc.produces).toContain('worker')
	})

	it('should have barracks', () => {
		const barracks = getBuildingDef('barracks')
		expect(barracks).toBeDefined()
		expect(barracks.produces).toContain('marine')
	})

	it('should have supply_depot', () => {
		const depot = getBuildingDef('supply_depot')
		expect(depot).toBeDefined()
		expect(depot.supplyProvided).toBeGreaterThan(0)
	})

	it('all buildings should have valid cost', () => {
		for (const [id, def] of Object.entries(BUILDING_DEFINITIONS)) {
			expect(def.cost.minerals, `${id} missing mineral cost`).toBeGreaterThanOrEqual(0)
			expect(def.stats.health, `${id} missing health`).toBeGreaterThan(0)
			expect(def.buildTime, `${id} missing buildTime`).toBeGreaterThan(0)
		}
	})
})

describe('Game Config', () => {
	it('should have starting resources', () => {
		expect(GAME_CONFIG.startingResources.minerals).toBeGreaterThan(0)
	})

	it('should have map dimensions', () => {
		expect(GAME_CONFIG.map.width).toBeGreaterThan(0)
		expect(GAME_CONFIG.map.height).toBeGreaterThan(0)
	})
})
```

**Step 2: Run test to verify it fails**

Run: `bun run test -- --run`
Expected: FAIL — modules not found

**Step 3: Create unit definitions**

```typescript
// src/config/units.ts
export interface UnitDefinition {
	id: string
	name: string
	cost: { minerals: number; gas: number; supply: number }
	buildTime: number
	stats: {
		health: number
		armor: number
		speed: number
		sight: number
	}
	combat?: {
		damage: number
		range: number
		attackSpeed: number
		targetsAir: boolean
		targetsGround: boolean
	}
	canGather: boolean
	isFlying: boolean
	modelScale: number
	color: string
}

export const UNIT_DEFINITIONS: Record<string, UnitDefinition> = {
	worker: {
		id: 'worker',
		name: 'Worker',
		cost: { minerals: 50, gas: 0, supply: 1 },
		buildTime: 12,
		stats: { health: 45, armor: 0, speed: 3.5, sight: 8 },
		combat: {
			damage: 5,
			range: 1,
			attackSpeed: 1.5,
			targetsAir: false,
			targetsGround: true,
		},
		canGather: true,
		isFlying: false,
		modelScale: 0.8,
		color: '#88aacc',
	},
	marine: {
		id: 'marine',
		name: 'Marine',
		cost: { minerals: 50, gas: 0, supply: 1 },
		buildTime: 18,
		stats: { health: 40, armor: 0, speed: 4.13, sight: 9 },
		combat: {
			damage: 6,
			range: 4,
			attackSpeed: 0.86,
			targetsAir: true,
			targetsGround: true,
		},
		canGather: false,
		isFlying: false,
		modelScale: 0.9,
		color: '#5577cc',
	},
	siege_tank: {
		id: 'siege_tank',
		name: 'Siege Tank',
		cost: { minerals: 150, gas: 125, supply: 3 },
		buildTime: 32,
		stats: { health: 160, armor: 1, speed: 3.15, sight: 11 },
		combat: {
			damage: 15,
			range: 7,
			attackSpeed: 1.04,
			targetsAir: false,
			targetsGround: true,
		},
		canGather: false,
		isFlying: false,
		modelScale: 1.2,
		color: '#446699',
	},
	medivac: {
		id: 'medivac',
		name: 'Medivac',
		cost: { minerals: 100, gas: 100, supply: 2 },
		buildTime: 30,
		stats: { health: 150, armor: 1, speed: 4.25, sight: 11 },
		canGather: false,
		isFlying: true,
		modelScale: 1.4,
		color: '#aaccee',
	},
}

export function getUnitDef(id: string): UnitDefinition {
	const def = UNIT_DEFINITIONS[id]
	if (!def) throw new Error(`Unknown unit: ${id}`)
	return def
}
```

**Step 4: Create building definitions**

```typescript
// src/config/buildings.ts
export interface BuildingDefinition {
	id: string
	name: string
	cost: { minerals: number; gas: number }
	buildTime: number
	stats: { health: number; armor: number; sight: number }
	size: { width: number; height: number }
	produces: string[]
	supplyProvided: number
	requirements: string[]
	color: string
}

export const BUILDING_DEFINITIONS: Record<string, BuildingDefinition> = {
	command_center: {
		id: 'command_center',
		name: 'Command Center',
		cost: { minerals: 400, gas: 0 },
		buildTime: 60,
		stats: { health: 1500, armor: 1, sight: 11 },
		size: { width: 4, height: 3 },
		produces: ['worker'],
		supplyProvided: 10,
		requirements: [],
		color: '#667788',
	},
	barracks: {
		id: 'barracks',
		name: 'Barracks',
		cost: { minerals: 150, gas: 0 },
		buildTime: 40,
		stats: { health: 1000, armor: 1, sight: 9 },
		size: { width: 3, height: 3 },
		produces: ['marine'],
		supplyProvided: 0,
		requirements: ['command_center'],
		color: '#556677',
	},
	factory: {
		id: 'factory',
		name: 'Factory',
		cost: { minerals: 150, gas: 100 },
		buildTime: 45,
		stats: { health: 1250, armor: 1, sight: 9 },
		size: { width: 3, height: 3 },
		produces: ['siege_tank'],
		supplyProvided: 0,
		requirements: ['barracks'],
		color: '#445566',
	},
	supply_depot: {
		id: 'supply_depot',
		name: 'Supply Depot',
		cost: { minerals: 100, gas: 0 },
		buildTime: 20,
		stats: { health: 400, armor: 0, sight: 7 },
		size: { width: 2, height: 2 },
		produces: [],
		supplyProvided: 8,
		requirements: [],
		color: '#778899',
	},
}

export function getBuildingDef(id: string): BuildingDefinition {
	const def = BUILDING_DEFINITIONS[id]
	if (!def) throw new Error(`Unknown building: ${id}`)
	return def
}
```

**Step 5: Create game config**

```typescript
// src/config/game.ts
export const GAME_CONFIG = {
	/** White-label: change these to rebrand */
	branding: {
		name: 'MoonCraft',
		tagline: 'Online RTS game',
	},

	startingResources: {
		minerals: 500,
		gas: 0,
		supply: 0,
		maxSupply: 10,
	},

	map: {
		width: 128,
		height: 128,
		tileSize: 1,
	},

	mineralPatch: {
		amount: 1500,
		gatherRate: 5,
		gatherInterval: 2,
	},

	camera: {
		initialPosition: { x: 40, y: 50, z: 40 },
		initialZoom: 30,
		minZoom: 15,
		maxZoom: 80,
		panSpeed: 40,
		edgeScrollThreshold: 30,
	},

	tickRate: 60,
} as const
```

**Step 6: Create barrel export**

```typescript
// src/config/index.ts
export { BUILDING_DEFINITIONS, getBuildingDef } from './buildings'
export type { BuildingDefinition } from './buildings'
export { GAME_CONFIG } from './game'
export { UNIT_DEFINITIONS, getUnitDef } from './units'
export type { UnitDefinition } from './units'
```

**Step 7: Run tests**

Run: `bun run test -- --run`
Expected: All tests PASS

**Step 8: Commit**

```bash
git add src/config/ src/lib/ecs/__tests__/
git commit -m "feat: add game config with unit, building, and game definitions"
```

---

### Task 3: Entity Factory — Create Units & Buildings from Config

**Files:**
- Create: `src/lib/ecs/EntityFactory.ts`
- Create: `src/lib/ecs/__tests__/EntityFactory.test.ts`

**Step 1: Write test**

```typescript
// src/lib/ecs/__tests__/EntityFactory.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { EntityManager } from '../EntityManager'
import { ComponentManager } from '../ComponentManager'
import { EntityFactory } from '../EntityFactory'
import { ComponentType } from '@/types/ecs'

describe('EntityFactory', () => {
	let em: EntityManager
	let cm: ComponentManager
	let factory: EntityFactory

	beforeEach(() => {
		em = new EntityManager()
		cm = new ComponentManager(em)
		factory = new EntityFactory(em, cm)
	})

	describe('createUnit', () => {
		it('should create worker with correct components', () => {
			const id = factory.createUnit('worker', 'player1', 'team1', { x: 10, y: 0, z: 10 })
			expect(em.hasEntity(id)).toBe(true)
			expect(cm.hasComponent(id, ComponentType.TRANSFORM)).toBe(true)
			expect(cm.hasComponent(id, ComponentType.HEALTH)).toBe(true)
			expect(cm.hasComponent(id, ComponentType.MOVEMENT)).toBe(true)
			expect(cm.hasComponent(id, ComponentType.OWNER)).toBe(true)
			expect(cm.hasComponent(id, ComponentType.SELECTION)).toBe(true)
			expect(cm.hasComponent(id, ComponentType.RENDER)).toBe(true)
		})

		it('should create marine with combat component', () => {
			const id = factory.createUnit('marine', 'player1', 'team1', { x: 0, y: 0, z: 0 })
			expect(cm.hasComponent(id, ComponentType.COMBAT)).toBe(true)
		})

		it('should set correct health from config', () => {
			const id = factory.createUnit('marine', 'player1', 'team1', { x: 0, y: 0, z: 0 })
			const health = cm.getComponent(id, ComponentType.HEALTH)
			expect(health).toBeDefined()
			expect(health!.current).toBe(40)
			expect(health!.max).toBe(40)
		})

		it('should throw for unknown unit type', () => {
			expect(() => factory.createUnit('unknown', 'p', 't', { x: 0, y: 0, z: 0 })).toThrow()
		})
	})

	describe('createBuilding', () => {
		it('should create command_center with building component', () => {
			const id = factory.createBuilding('command_center', 'player1', 'team1', { x: 20, y: 0, z: 20 })
			expect(cm.hasComponent(id, ComponentType.BUILDING)).toBe(true)
			expect(cm.hasComponent(id, ComponentType.HEALTH)).toBe(true)
			expect(cm.hasComponent(id, ComponentType.TRANSFORM)).toBe(true)
		})

		it('should create building with 0 progress (under construction)', () => {
			const id = factory.createBuilding('barracks', 'player1', 'team1', { x: 0, y: 0, z: 0 })
			const building = cm.getComponent(id, ComponentType.BUILDING)
			expect(building!.buildProgress).toBe(0)
		})

		it('should throw for unknown building type', () => {
			expect(() => factory.createBuilding('unknown', 'p', 't', { x: 0, y: 0, z: 0 })).toThrow()
		})
	})

	describe('createMineralPatch', () => {
		it('should create mineral patch with resource component', () => {
			const id = factory.createMineralPatch({ x: 5, y: 0, z: 5 }, 1500)
			expect(cm.hasComponent(id, ComponentType.RESOURCE)).toBe(true)
			expect(cm.hasComponent(id, ComponentType.TRANSFORM)).toBe(true)
			const res = cm.getComponent(id, ComponentType.RESOURCE)
			expect(res!.amount).toBe(1500)
		})
	})
})
```

**Step 2: Run test to verify it fails**

Run: `bun run test -- --run`
Expected: FAIL — EntityFactory not found

**Step 3: Implement EntityFactory**

Note: ComponentManager currently takes entityManager from import. We need to refactor it to accept dependency injection so tests can use isolated instances. First update ComponentManager to accept an EntityManager parameter.

```typescript
// src/lib/ecs/EntityFactory.ts
import type { EntityId, Vector3 } from '@/types/ecs'
import { ComponentType } from '@/types/ecs'
import { getUnitDef } from '@/config/units'
import { getBuildingDef } from '@/config/buildings'
import { GAME_CONFIG } from '@/config/game'
import type { EntityManager } from './EntityManager'
import type { ComponentManager } from './ComponentManager'

export class EntityFactory {
	constructor(
		private entities: EntityManager,
		private components: ComponentManager,
	) {}

	createUnit(unitType: string, playerId: string, teamId: string, position: Vector3): EntityId {
		const def = getUnitDef(unitType)
		const id = this.entities.createEntity()

		this.components.addComponent(id, {
			type: ComponentType.TRANSFORM,
			position: { ...position },
			rotation: 0,
			scale: { x: def.modelScale, y: def.modelScale, z: def.modelScale },
		})

		this.components.addComponent(id, {
			type: ComponentType.HEALTH,
			current: def.stats.health,
			max: def.stats.health,
			armor: def.stats.armor,
		})

		this.components.addComponent(id, {
			type: ComponentType.MOVEMENT,
			speed: def.stats.speed,
			targetPosition: null,
			path: [],
			isMoving: false,
		})

		this.components.addComponent(id, {
			type: ComponentType.OWNER,
			playerId,
			teamId,
		})

		this.components.addComponent(id, {
			type: ComponentType.SELECTION,
			isSelected: false,
		})

		this.components.addComponent(id, {
			type: ComponentType.RENDER,
			color: def.color,
			visible: true,
		})

		if (def.combat) {
			this.components.addComponent(id, {
				type: ComponentType.COMBAT,
				attackDamage: def.combat.damage,
				attackRange: def.combat.range,
				attackSpeed: def.combat.attackSpeed,
				attackCooldown: 0,
				targetId: null,
			})
		}

		return id
	}

	createBuilding(
		buildingType: string,
		playerId: string,
		teamId: string,
		position: Vector3,
		preBuilt = false,
	): EntityId {
		const def = getBuildingDef(buildingType)
		const id = this.entities.createEntity()

		this.components.addComponent(id, {
			type: ComponentType.TRANSFORM,
			position: { ...position },
			rotation: 0,
			scale: { x: def.size.width, y: 1, z: def.size.height },
		})

		this.components.addComponent(id, {
			type: ComponentType.HEALTH,
			current: preBuilt ? def.stats.health : 1,
			max: def.stats.health,
			armor: def.stats.armor,
		})

		this.components.addComponent(id, {
			type: ComponentType.BUILDING,
			buildingType: def.id,
			buildProgress: preBuilt ? 1 : 0,
			queue: [],
			rallyPoint: { x: position.x, y: 0, z: position.z + def.size.height + 1 },
		})

		this.components.addComponent(id, {
			type: ComponentType.OWNER,
			playerId,
			teamId,
		})

		this.components.addComponent(id, {
			type: ComponentType.SELECTION,
			isSelected: false,
		})

		this.components.addComponent(id, {
			type: ComponentType.RENDER,
			color: def.color,
			visible: true,
		})

		return id
	}

	createMineralPatch(position: Vector3, amount?: number): EntityId {
		const id = this.entities.createEntity()

		this.components.addComponent(id, {
			type: ComponentType.TRANSFORM,
			position: { ...position },
			rotation: 0,
			scale: { x: 1, y: 1, z: 1 },
		})

		this.components.addComponent(id, {
			type: ComponentType.RESOURCE,
			resourceType: 'mineral',
			amount: amount ?? GAME_CONFIG.mineralPatch.amount,
			maxCapacity: amount ?? GAME_CONFIG.mineralPatch.amount,
		})

		this.components.addComponent(id, {
			type: ComponentType.RENDER,
			color: '#44aaff',
			visible: true,
		})

		return id
	}
}
```

**Step 4: Refactor ComponentManager for dependency injection**

Update `ComponentManager` constructor to accept an `EntityManager` parameter instead of importing the singleton. Keep the singleton `componentManager` instance using the singleton `entityManager`.

In `src/lib/ecs/ComponentManager.ts`, change:
- Constructor: `constructor(private entityManager: EntityManager)`
- Remove direct import usage, use `this.entityManager` everywhere
- Singleton: `export const componentManager = new ComponentManager(entityManager)`

**Step 5: Update barrel export**

Add to `src/lib/ecs/index.ts`:
```typescript
export { EntityFactory } from './EntityFactory'
```

**Step 6: Run tests**

Run: `bun run test -- --run`
Expected: All tests PASS

**Step 7: Run typecheck + lint**

Run: `bun run typecheck && bun run lint`
Expected: PASS

**Step 8: Commit**

```bash
git add src/lib/ecs/EntityFactory.ts src/lib/ecs/__tests__/EntityFactory.test.ts src/lib/ecs/ComponentManager.ts src/lib/ecs/index.ts
git commit -m "feat: add EntityFactory for creating units, buildings, and mineral patches"
```

---

### Task 4: ComponentManager & SystemManager Tests

**Files:**
- Create: `src/lib/ecs/__tests__/ComponentManager.test.ts`
- Create: `src/lib/ecs/__tests__/SystemManager.test.ts`
- Create: `src/lib/ecs/__tests__/MovementSystem.test.ts`
- Create: `src/lib/ecs/__tests__/CombatSystem.test.ts`

**Step 1: Write ComponentManager tests**

```typescript
// src/lib/ecs/__tests__/ComponentManager.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { EntityManager } from '../EntityManager'
import { ComponentManager } from '../ComponentManager'
import { ComponentType } from '@/types/ecs'
import type { TransformComponent, HealthComponent } from '@/types/ecs'

describe('ComponentManager', () => {
	let em: EntityManager
	let cm: ComponentManager

	beforeEach(() => {
		em = new EntityManager()
		cm = new ComponentManager(em)
	})

	it('should add and retrieve component', () => {
		const id = em.createEntity()
		const transform: TransformComponent = {
			type: ComponentType.TRANSFORM,
			position: { x: 1, y: 2, z: 3 },
			rotation: 0,
			scale: { x: 1, y: 1, z: 1 },
		}
		cm.addComponent(id, transform)
		const result = cm.getComponent<TransformComponent>(id, ComponentType.TRANSFORM)
		expect(result?.position.x).toBe(1)
	})

	it('should update component partially', () => {
		const id = em.createEntity()
		cm.addComponent(id, {
			type: ComponentType.HEALTH,
			current: 100,
			max: 100,
			armor: 2,
		})
		cm.updateComponent<HealthComponent>(id, ComponentType.HEALTH, { current: 50 })
		const health = cm.getComponent<HealthComponent>(id, ComponentType.HEALTH)
		expect(health!.current).toBe(50)
		expect(health!.max).toBe(100)
	})

	it('should remove component', () => {
		const id = em.createEntity()
		cm.addComponent(id, {
			type: ComponentType.SELECTION,
			isSelected: false,
		})
		expect(cm.removeComponent(id, ComponentType.SELECTION)).toBe(true)
		expect(cm.hasComponent(id, ComponentType.SELECTION)).toBe(false)
	})
})
```

**Step 2: Write MovementSystem test**

```typescript
// src/lib/ecs/__tests__/MovementSystem.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { EntityManager } from '../EntityManager'
import { ComponentManager } from '../ComponentManager'
import { EntityFactory } from '../EntityFactory'
import { MovementSystem } from '../systems/MovementSystem'
import { ComponentType } from '@/types/ecs'
import type { TransformComponent, MovementComponent } from '@/types/ecs'

describe('MovementSystem', () => {
	let em: EntityManager
	let cm: ComponentManager
	let factory: EntityFactory
	let system: MovementSystem

	beforeEach(() => {
		em = new EntityManager()
		cm = new ComponentManager(em)
		factory = new EntityFactory(em, cm)
		system = new MovementSystem()
	})

	it('should move entity toward target', () => {
		const id = factory.createUnit('marine', 'p1', 't1', { x: 0, y: 0, z: 0 })
		cm.updateComponent(id, ComponentType.MOVEMENT, {
			targetPosition: { x: 10, y: 0, z: 0 },
		})

		const entities = em.queryEntities(ComponentType.TRANSFORM, ComponentType.MOVEMENT)
		system.update(entities, 1)

		const transform = cm.getComponent<TransformComponent>(id, ComponentType.TRANSFORM)
		expect(transform!.position.x).toBeGreaterThan(0)
	})

	it('should stop when arriving at target', () => {
		const id = factory.createUnit('marine', 'p1', 't1', { x: 0, y: 0, z: 0 })
		cm.updateComponent(id, ComponentType.MOVEMENT, {
			targetPosition: { x: 0.05, y: 0, z: 0 },
		})

		const entities = em.queryEntities(ComponentType.TRANSFORM, ComponentType.MOVEMENT)
		system.update(entities, 1)

		const movement = cm.getComponent<MovementComponent>(id, ComponentType.MOVEMENT)
		expect(movement!.isMoving).toBe(false)
		expect(movement!.targetPosition).toBeNull()
	})
})
```

**Step 3: Write CombatSystem test**

```typescript
// src/lib/ecs/__tests__/CombatSystem.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { EntityManager } from '../EntityManager'
import { ComponentManager } from '../ComponentManager'
import { EntityFactory } from '../EntityFactory'
import { CombatSystem } from '../systems/CombatSystem'
import { ComponentType } from '@/types/ecs'
import type { HealthComponent, CombatComponent } from '@/types/ecs'

describe('CombatSystem', () => {
	let em: EntityManager
	let cm: ComponentManager
	let factory: EntityFactory
	let system: CombatSystem

	beforeEach(() => {
		em = new EntityManager()
		cm = new ComponentManager(em)
		factory = new EntityFactory(em, cm)
		system = new CombatSystem()
	})

	it('should deal damage when target in range', () => {
		const attacker = factory.createUnit('marine', 'p1', 't1', { x: 0, y: 0, z: 0 })
		const target = factory.createUnit('marine', 'p2', 't2', { x: 2, y: 0, z: 0 })

		cm.updateComponent<CombatComponent>(attacker, ComponentType.COMBAT, {
			targetId: target,
		})

		const entities = em.queryEntities(ComponentType.TRANSFORM, ComponentType.COMBAT, ComponentType.HEALTH)
		system.update(entities, 1)

		const health = cm.getComponent<HealthComponent>(target, ComponentType.HEALTH)
		expect(health!.current).toBeLessThan(health!.max)
	})

	it('should not attack when out of range', () => {
		const attacker = factory.createUnit('marine', 'p1', 't1', { x: 0, y: 0, z: 0 })
		const target = factory.createUnit('marine', 'p2', 't2', { x: 100, y: 0, z: 0 })

		cm.updateComponent<CombatComponent>(attacker, ComponentType.COMBAT, {
			targetId: target,
		})

		const entities = em.queryEntities(ComponentType.TRANSFORM, ComponentType.COMBAT, ComponentType.HEALTH)
		system.update(entities, 1)

		const health = cm.getComponent<HealthComponent>(target, ComponentType.HEALTH)
		expect(health!.current).toBe(health!.max)
	})

	it('should respect attack cooldown', () => {
		const attacker = factory.createUnit('marine', 'p1', 't1', { x: 0, y: 0, z: 0 })
		const target = factory.createUnit('marine', 'p2', 't2', { x: 2, y: 0, z: 0 })

		cm.updateComponent<CombatComponent>(attacker, ComponentType.COMBAT, {
			targetId: target,
			attackCooldown: 5,
		})

		const entities = em.queryEntities(ComponentType.TRANSFORM, ComponentType.COMBAT, ComponentType.HEALTH)
		system.update(entities, 0.5)

		const health = cm.getComponent<HealthComponent>(target, ComponentType.HEALTH)
		expect(health!.current).toBe(health!.max)
	})
})
```

**Step 4: Run tests**

Run: `bun run test -- --run`
Expected: All tests PASS

Note: CombatSystem currently imports `entityManager` singleton directly. It needs refactoring similar to ComponentManager to use DI for testability. The system's `tryAttack` method calls `entityManager.getEntity()` — this must work with the test's local EntityManager. Either refactor CombatSystem or make it receive entityManager via constructor/update params.

**Step 5: Commit**

```bash
git add src/lib/ecs/__tests__/
git commit -m "test: add ComponentManager, MovementSystem, and CombatSystem tests"
```

---

## Phase 2: 3D Rendering & Game Scene (Tasks 5-8)

### Task 5: Terrain & 3D Scene Setup

**Files:**
- Create: `src/components/game/GameCanvas.tsx`
- Create: `src/components/game/Terrain.tsx`
- Create: `src/components/game/GameCamera.tsx`
- Create: `src/app/game/page.tsx`

**Step 1: Create GameCanvas — root Three.js scene**

```typescript
// src/components/game/GameCanvas.tsx
'use client'

import { Canvas } from '@react-three/fiber'
import { Terrain } from './Terrain'
import { GameCamera } from './GameCamera'
import { GAME_CONFIG } from '@/config'

export function GameCanvas() {
	return (
		<Canvas
			shadows
			gl={{ antialias: true, alpha: false }}
			style={{ width: '100vw', height: '100vh', background: '#0a0a0f' }}
		>
			<ambientLight intensity={0.4} />
			<directionalLight
				position={[50, 80, 50]}
				intensity={1.2}
				castShadow
				shadow-mapSize-width={2048}
				shadow-mapSize-height={2048}
				shadow-camera-far={200}
				shadow-camera-left={-100}
				shadow-camera-right={100}
				shadow-camera-top={100}
				shadow-camera-bottom={-100}
			/>
			<hemisphereLight args={['#b1e1ff', '#444444', 0.6]} />
			<fog attach="fog" args={['#0a0a0f', 80, 150]} />
			<GameCamera />
			<Terrain />
		</Canvas>
	)
}
```

**Step 2: Create Terrain — ground plane with grid**

```typescript
// src/components/game/Terrain.tsx
'use client'

import { useMemo } from 'react'
import { GAME_CONFIG } from '@/config'
import * as THREE from 'three'

export function Terrain() {
	const { width, height } = GAME_CONFIG.map

	const gridHelper = useMemo(() => {
		const grid = new THREE.GridHelper(width, width, '#1a2a1a', '#0d1a0d')
		grid.position.set(width / 2, 0, height / 2)
		return grid
	}, [width, height])

	return (
		<group>
			{/* Ground plane */}
			<mesh rotation={[-Math.PI / 2, 0, 0]} position={[width / 2, -0.01, height / 2]} receiveShadow>
				<planeGeometry args={[width, height]} />
				<meshStandardMaterial color="#1a2a1a" roughness={0.9} metalness={0.1} />
			</mesh>
			<primitive object={gridHelper} />
		</group>
	)
}
```

**Step 3: Create GameCamera — RTS-style isometric camera with pan/zoom**

```typescript
// src/components/game/GameCamera.tsx
'use client'

import { useRef, useEffect } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { useGameStore } from '@/stores/gameStore'
import { GAME_CONFIG } from '@/config'
import * as THREE from 'three'

const keys = new Set<string>()

export function GameCamera() {
	const { camera } = useThree()
	const target = useRef(new THREE.Vector3(64, 0, 64))

	useEffect(() => {
		const cam = GAME_CONFIG.camera
		camera.position.set(cam.initialPosition.x, cam.initialPosition.y, cam.initialPosition.z)
		camera.lookAt(target.current)

		const onKeyDown = (e: KeyboardEvent) => keys.add(e.key.toLowerCase())
		const onKeyUp = (e: KeyboardEvent) => keys.delete(e.key.toLowerCase())
		const onWheel = (e: WheelEvent) => {
			const cam = GAME_CONFIG.camera
			const zoom = useGameStore.getState().cameraZoom
			const newZoom = THREE.MathUtils.clamp(
				zoom + e.deltaY * 0.05,
				cam.minZoom,
				cam.maxZoom,
			)
			useGameStore.getState().setCameraZoom(newZoom)
		}

		window.addEventListener('keydown', onKeyDown)
		window.addEventListener('keyup', onKeyUp)
		window.addEventListener('wheel', onWheel, { passive: true })
		return () => {
			window.removeEventListener('keydown', onKeyDown)
			window.removeEventListener('keyup', onKeyUp)
			window.removeEventListener('wheel', onWheel)
		}
	}, [camera])

	useFrame((_, delta) => {
		const speed = GAME_CONFIG.camera.panSpeed * delta
		const zoom = useGameStore.getState().cameraZoom

		if (keys.has('w') || keys.has('arrowup')) target.current.z -= speed
		if (keys.has('s') || keys.has('arrowdown')) target.current.z += speed
		if (keys.has('a') || keys.has('arrowleft')) target.current.x -= speed
		if (keys.has('d') || keys.has('arrowright')) target.current.x += speed

		// Clamp to map bounds
		const { width, height } = GAME_CONFIG.map
		target.current.x = THREE.MathUtils.clamp(target.current.x, 0, width)
		target.current.z = THREE.MathUtils.clamp(target.current.z, 0, height)

		// Position camera relative to target (isometric-ish angle)
		camera.position.set(
			target.current.x + zoom * 0.7,
			zoom,
			target.current.z + zoom * 0.7,
		)
		camera.lookAt(target.current)

		useGameStore.getState().setCameraPosition({
			x: target.current.x,
			y: 0,
			z: target.current.z,
		})
	})

	return null
}
```

**Step 4: Create game page**

```typescript
// src/app/game/page.tsx
import { GameCanvas } from '@/components/game/GameCanvas'

export default function GamePage() {
	return <GameCanvas />
}
```

**Step 5: Run typecheck + build**

Run: `bun run typecheck && bun run build`
Expected: PASS (page should compile and render)

**Step 6: Commit**

```bash
git add src/components/game/ src/app/game/
git commit -m "feat: add 3D game scene with terrain, camera controls, and game page"
```

---

### Task 6: Entity Renderers — Units & Buildings in 3D

**Files:**
- Create: `src/components/game/EntityRenderer.tsx`
- Create: `src/components/game/UnitMesh.tsx`
- Create: `src/components/game/BuildingMesh.tsx`
- Create: `src/components/game/MineralMesh.tsx`
- Modify: `src/components/game/GameCanvas.tsx` — add EntityRenderer

**Step 1: Create UnitMesh — stylized unit placeholder**

```typescript
// src/components/game/UnitMesh.tsx
'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type * as THREE from 'three'
import type { TransformComponent, HealthComponent, SelectionComponent, RenderComponent } from '@/types/ecs'

interface UnitMeshProps {
	transform: TransformComponent
	health: HealthComponent
	selection: SelectionComponent
	render: RenderComponent
}

export function UnitMesh({ transform, health, selection, render: renderComp }: UnitMeshProps) {
	const ref = useRef<THREE.Group>(null)

	useFrame(() => {
		if (!ref.current) return
		ref.current.position.set(transform.position.x, transform.position.y + 0.5, transform.position.z)
		ref.current.rotation.y = transform.rotation
	})

	if (!renderComp.visible) return null

	const healthPercent = health.current / health.max
	const healthColor = healthPercent > 0.5 ? '#44ff44' : healthPercent > 0.25 ? '#ffff44' : '#ff4444'

	return (
		<group ref={ref}>
			{/* Body */}
			<mesh castShadow>
				<capsuleGeometry args={[0.3, 0.6, 4, 8]} />
				<meshStandardMaterial color={renderComp.color ?? '#5577cc'} roughness={0.6} metalness={0.3} />
			</mesh>

			{/* Selection ring */}
			{selection.isSelected && (
				<mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.4, 0]}>
					<ringGeometry args={[0.5, 0.6, 32]} />
					<meshBasicMaterial color="#00ff88" transparent opacity={0.8} />
				</mesh>
			)}

			{/* Health bar */}
			<group position={[0, 1.2, 0]}>
				{/* Background */}
				<mesh>
					<planeGeometry args={[1, 0.1]} />
					<meshBasicMaterial color="#333333" />
				</mesh>
				{/* Health fill */}
				<mesh position={[(healthPercent - 1) * 0.5, 0, 0.01]}>
					<planeGeometry args={[healthPercent, 0.08]} />
					<meshBasicMaterial color={healthColor} />
				</mesh>
			</group>
		</group>
	)
}
```

**Step 2: Create BuildingMesh — box-based building**

```typescript
// src/components/game/BuildingMesh.tsx
'use client'

import { useRef } from 'react'
import type * as THREE from 'three'
import type {
	TransformComponent,
	HealthComponent,
	BuildingComponent,
	SelectionComponent,
	RenderComponent,
} from '@/types/ecs'

interface BuildingMeshProps {
	transform: TransformComponent
	health: HealthComponent
	building: BuildingComponent
	selection: SelectionComponent
	render: RenderComponent
}

export function BuildingMesh({
	transform,
	health,
	building,
	selection,
	render: renderComp,
}: BuildingMeshProps) {
	const ref = useRef<THREE.Group>(null)
	const progress = building.buildProgress
	const height = 2 * progress

	if (!renderComp.visible) return null

	return (
		<group
			ref={ref}
			position={[transform.position.x, 0, transform.position.z]}
		>
			{/* Building body */}
			<mesh position={[0, height / 2, 0]} castShadow>
				<boxGeometry args={[transform.scale.x, height || 0.1, transform.scale.z]} />
				<meshStandardMaterial
					color={renderComp.color ?? '#556677'}
					roughness={0.7}
					metalness={0.2}
					transparent={progress < 1}
					opacity={progress < 1 ? 0.5 + progress * 0.5 : 1}
				/>
			</mesh>

			{/* Selection ring */}
			{selection.isSelected && (
				<mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
					<ringGeometry args={[Math.max(transform.scale.x, transform.scale.z) * 0.6, Math.max(transform.scale.x, transform.scale.z) * 0.7, 32]} />
					<meshBasicMaterial color="#00ff88" transparent opacity={0.8} />
				</mesh>
			)}

			{/* Build progress bar (only when under construction) */}
			{progress < 1 && (
				<group position={[0, height + 0.5, 0]}>
					<mesh>
						<planeGeometry args={[transform.scale.x, 0.15]} />
						<meshBasicMaterial color="#333333" />
					</mesh>
					<mesh position={[(progress - 1) * transform.scale.x * 0.5, 0, 0.01]}>
						<planeGeometry args={[progress * transform.scale.x, 0.12]} />
						<meshBasicMaterial color="#ffaa00" />
					</mesh>
				</group>
			)}
		</group>
	)
}
```

**Step 3: Create MineralMesh — crystal-like resource node**

```typescript
// src/components/game/MineralMesh.tsx
'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type * as THREE from 'three'
import type { TransformComponent, ResourceComponent } from '@/types/ecs'

interface MineralMeshProps {
	transform: TransformComponent
	resource: ResourceComponent
}

export function MineralMesh({ transform, resource }: MineralMeshProps) {
	const ref = useRef<THREE.Mesh>(null)
	const depleted = resource.amount <= 0
	const scale = 0.3 + (resource.amount / resource.maxCapacity) * 0.7

	useFrame((_, delta) => {
		if (ref.current && !depleted) {
			ref.current.rotation.y += delta * 0.5
		}
	})

	return (
		<group position={[transform.position.x, 0.5, transform.position.z]}>
			<mesh ref={ref} castShadow scale={[scale, scale, scale]}>
				<octahedronGeometry args={[0.6, 0]} />
				<meshStandardMaterial
					color={depleted ? '#444444' : '#44aaff'}
					roughness={0.3}
					metalness={0.7}
					emissive={depleted ? '#000000' : '#2266aa'}
					emissiveIntensity={0.3}
				/>
			</mesh>
		</group>
	)
}
```

**Step 4: Create EntityRenderer — reads ECS state, renders all entities**

```typescript
// src/components/game/EntityRenderer.tsx
'use client'

import { useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { entityManager, componentManager } from '@/lib/ecs'
import { ComponentType } from '@/types/ecs'
import type {
	TransformComponent,
	HealthComponent,
	SelectionComponent,
	RenderComponent,
	BuildingComponent,
	ResourceComponent,
	MovementComponent,
} from '@/types/ecs'
import { UnitMesh } from './UnitMesh'
import { BuildingMesh } from './BuildingMesh'
import { MineralMesh } from './MineralMesh'
import { useState } from 'react'

interface EntitySnapshot {
	id: string
	type: 'unit' | 'building' | 'resource'
	transform: TransformComponent
	health?: HealthComponent
	selection?: SelectionComponent
	render?: RenderComponent
	building?: BuildingComponent
	resource?: ResourceComponent
}

export function EntityRenderer() {
	const [entities, setEntities] = useState<EntitySnapshot[]>([])

	useFrame(() => {
		const all = entityManager.getAllEntities()
		const snapshots: EntitySnapshot[] = []

		for (const entity of all) {
			const transform = componentManager.getComponent<TransformComponent>(entity.id, ComponentType.TRANSFORM)
			if (!transform) continue

			const render = componentManager.getComponent<RenderComponent>(entity.id, ComponentType.RENDER)
			const building = componentManager.getComponent<BuildingComponent>(entity.id, ComponentType.BUILDING)
			const resource = componentManager.getComponent<ResourceComponent>(entity.id, ComponentType.RESOURCE)
			const health = componentManager.getComponent<HealthComponent>(entity.id, ComponentType.HEALTH)
			const selection = componentManager.getComponent<SelectionComponent>(entity.id, ComponentType.SELECTION)

			if (resource) {
				snapshots.push({ id: entity.id, type: 'resource', transform, resource, render })
			} else if (building) {
				snapshots.push({ id: entity.id, type: 'building', transform, health, building, selection, render })
			} else if (health) {
				snapshots.push({ id: entity.id, type: 'unit', transform, health, selection, render })
			}
		}

		setEntities(snapshots)
	})

	return (
		<>
			{entities.map((e) => {
				if (e.type === 'resource' && e.resource) {
					return <MineralMesh key={e.id} transform={e.transform} resource={e.resource} />
				}
				if (e.type === 'building' && e.health && e.building && e.selection && e.render) {
					return (
						<BuildingMesh
							key={e.id}
							transform={e.transform}
							health={e.health}
							building={e.building}
							selection={e.selection}
							render={e.render}
						/>
					)
				}
				if (e.type === 'unit' && e.health && e.selection && e.render) {
					return (
						<UnitMesh
							key={e.id}
							transform={e.transform}
							health={e.health}
							selection={e.selection}
							render={e.render}
						/>
					)
				}
				return null
			})}
		</>
	)
}
```

**Step 5: Add EntityRenderer to GameCanvas**

Add `<EntityRenderer />` inside Canvas after `<Terrain />`.

**Step 6: Run typecheck + build**

Run: `bun run typecheck && bun run build`
Expected: PASS

**Step 7: Commit**

```bash
git add src/components/game/
git commit -m "feat: add 3D entity renderers for units, buildings, and minerals"
```

---

### Task 7: Game Loop — Initialize World & Tick

**Files:**
- Create: `src/components/game/GameLoop.tsx`
- Create: `src/lib/ecs/systems/BuildingSystem.ts`
- Create: `src/lib/ecs/__tests__/BuildingSystem.test.ts`
- Modify: `src/stores/gameStore.ts` — add world initialization with factory
- Modify: `src/components/game/GameCanvas.tsx` — add GameLoop

**Step 1: Write BuildingSystem test**

```typescript
// src/lib/ecs/__tests__/BuildingSystem.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { EntityManager } from '../EntityManager'
import { ComponentManager } from '../ComponentManager'
import { EntityFactory } from '../EntityFactory'
import { BuildingSystem } from '../systems/BuildingSystem'
import { ComponentType } from '@/types/ecs'
import type { BuildingComponent, HealthComponent } from '@/types/ecs'

describe('BuildingSystem', () => {
	let em: EntityManager
	let cm: ComponentManager
	let factory: EntityFactory
	let system: BuildingSystem

	beforeEach(() => {
		em = new EntityManager()
		cm = new ComponentManager(em)
		factory = new EntityFactory(em, cm)
		system = new BuildingSystem()
	})

	it('should advance build progress over time', () => {
		const id = factory.createBuilding('barracks', 'p1', 't1', { x: 0, y: 0, z: 0 })
		const entities = em.queryEntities(ComponentType.BUILDING, ComponentType.HEALTH)
		system.update(entities, 10)

		const building = cm.getComponent<BuildingComponent>(id, ComponentType.BUILDING)
		expect(building!.buildProgress).toBeGreaterThan(0)
		expect(building!.buildProgress).toBeLessThanOrEqual(1)
	})

	it('should increase health as building progresses', () => {
		const id = factory.createBuilding('barracks', 'p1', 't1', { x: 0, y: 0, z: 0 })
		const entities = em.queryEntities(ComponentType.BUILDING, ComponentType.HEALTH)
		system.update(entities, 20)

		const health = cm.getComponent<HealthComponent>(id, ComponentType.HEALTH)
		expect(health!.current).toBeGreaterThan(1)
	})

	it('should cap progress at 1', () => {
		const id = factory.createBuilding('supply_depot', 'p1', 't1', { x: 0, y: 0, z: 0 })
		const entities = em.queryEntities(ComponentType.BUILDING, ComponentType.HEALTH)
		system.update(entities, 1000)

		const building = cm.getComponent<BuildingComponent>(id, ComponentType.BUILDING)
		expect(building!.buildProgress).toBe(1)
	})
})
```

**Step 2: Run test to verify it fails**

Run: `bun run test -- --run`
Expected: FAIL — BuildingSystem not found

**Step 3: Implement BuildingSystem**

```typescript
// src/lib/ecs/systems/BuildingSystem.ts
import { ComponentType } from '@/types/ecs'
import type { Entity, BuildingComponent, HealthComponent } from '@/types/ecs'
import { getBuildingDef } from '@/config/buildings'
import { System } from '../SystemManager'

export class BuildingSystem extends System {
	readonly requiredComponents = [ComponentType.BUILDING, ComponentType.HEALTH]
	readonly priority = 5

	update(entities: Entity[], deltaTime: number): void {
		for (const entity of entities) {
			const building = entity.components.get(ComponentType.BUILDING) as BuildingComponent | undefined
			const health = entity.components.get(ComponentType.HEALTH) as HealthComponent | undefined
			if (!building || !health) continue

			if (building.buildProgress >= 1) continue

			const def = getBuildingDef(building.buildingType)
			const progressPerSecond = 1 / def.buildTime
			const newProgress = Math.min(1, building.buildProgress + progressPerSecond * deltaTime)

			building.buildProgress = newProgress
			health.current = Math.floor(newProgress * health.max)
		}
	}
}
```

**Step 4: Run tests**

Run: `bun run test -- --run`
Expected: All tests PASS

**Step 5: Create GameLoop component**

```typescript
// src/components/game/GameLoop.tsx
'use client'

import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGameStore } from '@/stores/gameStore'

export function GameLoop() {
	const initialized = useRef(false)

	useEffect(() => {
		if (!initialized.current) {
			initialized.current = true
			useGameStore.getState().initializeGame()
		}
	}, [])

	useFrame((_, delta) => {
		useGameStore.getState().tick(delta)
	})

	return null
}
```

**Step 6: Update gameStore.initializeGame() to spawn starting entities**

Modify `src/stores/gameStore.ts`:
- Import `EntityFactory` and create an instance
- In `initializeGame()`:
  - Register BuildingSystem
  - Create command center (pre-built) at player start position
  - Create 4 workers near command center
  - Create 8 mineral patches near base
  - Do the same for AI player on the opposite side of the map

**Step 7: Add GameLoop and BuildingSystem exports**

Update `src/lib/ecs/index.ts` to export `BuildingSystem`.
Add `<GameLoop />` to `GameCanvas.tsx` inside Canvas.

**Step 8: Run typecheck + build + tests**

Run: `bun run test -- --run && bun run typecheck && bun run build`
Expected: All PASS

**Step 9: Commit**

```bash
git add src/lib/ecs/systems/BuildingSystem.ts src/lib/ecs/__tests__/BuildingSystem.test.ts src/components/game/GameLoop.tsx src/stores/gameStore.ts src/lib/ecs/index.ts src/components/game/GameCanvas.tsx
git commit -m "feat: add BuildingSystem, GameLoop, and world initialization with starting entities"
```

---

### Task 8: Resource Gathering System

**Files:**
- Modify: `src/types/ecs.ts` — add `ResourceCarrierComponent`
- Create: `src/lib/ecs/systems/ResourceSystem.ts`
- Create: `src/lib/ecs/__tests__/ResourceSystem.test.ts`

**Step 1: Add ResourceCarrierComponent to types**

Add to `ComponentType` enum: `RESOURCE_CARRIER = 'resource_carrier'`

Add interface:
```typescript
export interface ResourceCarrierComponent {
	type: ComponentType.RESOURCE_CARRIER
	state: 'idle' | 'moving_to_resource' | 'gathering' | 'returning'
	targetResourceId: EntityId | null
	returnBuildingId: EntityId | null
	currentLoad: number
	maxCapacity: number
	gatherRate: number
	gatherTimer: number
}
```

Add to `Component` union type.

**Step 2: Write ResourceSystem test**

```typescript
// src/lib/ecs/__tests__/ResourceSystem.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { EntityManager } from '../EntityManager'
import { ComponentManager } from '../ComponentManager'
import { EntityFactory } from '../EntityFactory'
import { ResourceSystem } from '../systems/ResourceSystem'
import { ComponentType } from '@/types/ecs'
import type { ResourceCarrierComponent, ResourceComponent } from '@/types/ecs'

describe('ResourceSystem', () => {
	let em: EntityManager
	let cm: ComponentManager
	let factory: EntityFactory
	let system: ResourceSystem

	beforeEach(() => {
		em = new EntityManager()
		cm = new ComponentManager(em)
		factory = new EntityFactory(em, cm)
		system = new ResourceSystem()
	})

	it('should gather resources when worker is at mineral patch', () => {
		const mineralId = factory.createMineralPatch({ x: 5, y: 0, z: 5 }, 1000)
		const workerId = factory.createUnit('worker', 'p1', 't1', { x: 5, y: 0, z: 5 })

		cm.addComponent(workerId, {
			type: ComponentType.RESOURCE_CARRIER,
			state: 'gathering',
			targetResourceId: mineralId,
			returnBuildingId: null,
			currentLoad: 0,
			maxCapacity: 5,
			gatherRate: 5,
			gatherTimer: 0,
		})

		const entities = em.queryEntities(ComponentType.RESOURCE_CARRIER, ComponentType.TRANSFORM)
		system.update(entities, 2.5)

		const carrier = cm.getComponent<ResourceCarrierComponent>(workerId, ComponentType.RESOURCE_CARRIER)
		expect(carrier!.currentLoad).toBeGreaterThan(0)
	})

	it('should deplete mineral patch', () => {
		const mineralId = factory.createMineralPatch({ x: 5, y: 0, z: 5 }, 3)
		const workerId = factory.createUnit('worker', 'p1', 't1', { x: 5, y: 0, z: 5 })

		cm.addComponent(workerId, {
			type: ComponentType.RESOURCE_CARRIER,
			state: 'gathering',
			targetResourceId: mineralId,
			returnBuildingId: null,
			currentLoad: 0,
			maxCapacity: 5,
			gatherRate: 5,
			gatherTimer: 0,
		})

		const entities = em.queryEntities(ComponentType.RESOURCE_CARRIER, ComponentType.TRANSFORM)
		system.update(entities, 2.5)

		const resource = cm.getComponent<ResourceComponent>(mineralId, ComponentType.RESOURCE)
		expect(resource!.amount).toBeLessThan(3)
	})
})
```

**Step 3: Implement ResourceSystem**

```typescript
// src/lib/ecs/systems/ResourceSystem.ts
import { ComponentType } from '@/types/ecs'
import type {
	Entity,
	ResourceCarrierComponent,
	ResourceComponent,
	TransformComponent,
} from '@/types/ecs'
import { GAME_CONFIG } from '@/config'
import { System } from '../SystemManager'
import { entityManager } from '../EntityManager'
import { componentManager } from '../ComponentManager'

export class ResourceSystem extends System {
	readonly requiredComponents = [ComponentType.RESOURCE_CARRIER, ComponentType.TRANSFORM]
	readonly priority = 8

	update(entities: Entity[], deltaTime: number): void {
		for (const entity of entities) {
			const carrier = entity.components.get(
				ComponentType.RESOURCE_CARRIER,
			) as ResourceCarrierComponent | undefined
			const transform = entity.components.get(ComponentType.TRANSFORM) as TransformComponent | undefined
			if (!carrier || !transform) continue

			switch (carrier.state) {
				case 'gathering':
					this.processGathering(entity, carrier, deltaTime)
					break
				case 'returning':
					this.processReturning(entity, carrier)
					break
				case 'idle':
					break
				case 'moving_to_resource':
					this.checkArrivalAtResource(entity, carrier, transform)
					break
			}
		}
	}

	private processGathering(
		_entity: Entity,
		carrier: ResourceCarrierComponent,
		deltaTime: number,
	): void {
		if (!carrier.targetResourceId) {
			carrier.state = 'idle'
			return
		}

		const resource = componentManager.getComponent<ResourceComponent>(
			carrier.targetResourceId,
			ComponentType.RESOURCE,
		)
		if (!resource || resource.amount <= 0) {
			carrier.state = 'idle'
			carrier.targetResourceId = null
			return
		}

		carrier.gatherTimer += deltaTime
		const interval = GAME_CONFIG.mineralPatch.gatherInterval

		if (carrier.gatherTimer >= interval) {
			carrier.gatherTimer -= interval
			const gatherAmount = Math.min(carrier.gatherRate, resource.amount, carrier.maxCapacity - carrier.currentLoad)
			resource.amount -= gatherAmount
			carrier.currentLoad += gatherAmount

			if (carrier.currentLoad >= carrier.maxCapacity) {
				carrier.state = 'returning'
			}
		}
	}

	private processReturning(_entity: Entity, carrier: ResourceCarrierComponent): void {
		// Simplified: instant return for MVP
		// In full version, worker walks back to command center
		carrier.currentLoad = 0
		carrier.state = carrier.targetResourceId ? 'gathering' : 'idle'
	}

	private checkArrivalAtResource(
		_entity: Entity,
		carrier: ResourceCarrierComponent,
		transform: TransformComponent,
	): void {
		if (!carrier.targetResourceId) {
			carrier.state = 'idle'
			return
		}

		const resourceTransform = componentManager.getComponent<TransformComponent>(
			carrier.targetResourceId,
			ComponentType.TRANSFORM,
		)
		if (!resourceTransform) {
			carrier.state = 'idle'
			return
		}

		const dx = resourceTransform.position.x - transform.position.x
		const dz = resourceTransform.position.z - transform.position.z
		const distance = Math.sqrt(dx * dx + dz * dz)

		if (distance < 1.5) {
			carrier.state = 'gathering'
			carrier.gatherTimer = 0
		}
	}
}
```

**Step 4: Update EntityFactory to add ResourceCarrier to workers**

In `EntityFactory.createUnit`, after creating components, add:
```typescript
if (def.canGather) {
	this.components.addComponent(id, {
		type: ComponentType.RESOURCE_CARRIER,
		state: 'idle',
		targetResourceId: null,
		returnBuildingId: null,
		currentLoad: 0,
		maxCapacity: GAME_CONFIG.mineralPatch.gatherRate,
		gatherRate: GAME_CONFIG.mineralPatch.gatherRate,
		gatherTimer: 0,
	})
}
```

**Step 5: Export ResourceSystem from index, register in gameStore**

**Step 6: Run tests**

Run: `bun run test -- --run && bun run typecheck`
Expected: All PASS

**Step 7: Commit**

```bash
git add src/types/ecs.ts src/lib/ecs/systems/ResourceSystem.ts src/lib/ecs/__tests__/ResourceSystem.test.ts src/lib/ecs/EntityFactory.ts src/lib/ecs/index.ts src/stores/gameStore.ts
git commit -m "feat: add ResourceSystem for mineral gathering"
```

---

## Phase 3: Input & HUD (Tasks 9-11)

### Task 9: Mouse Input — Selection & Commands

**Files:**
- Create: `src/components/game/InputHandler.tsx`
- Modify: `src/components/game/GameCanvas.tsx` — add InputHandler

InputHandler handles:
- Left click → select unit/building under cursor (raycast)
- Left drag → box select multiple units
- Right click → move selected units to ground position / attack-move if on enemy
- Raycast from camera through mouse position to ground plane

Implementation: use R3F's `useThree` for raycaster, register mouse event listeners, update gameStore selection/movement.

**Commit message:** `feat: add mouse input handler with click select and right-click move`

---

### Task 10: HUD — Resource Bar, Selection Panel, Command Panel

**Files:**
- Create: `src/components/hud/HUD.tsx`
- Create: `src/components/hud/ResourceBar.tsx`
- Create: `src/components/hud/SelectionPanel.tsx`
- Create: `src/components/hud/CommandPanel.tsx`
- Create: `src/components/hud/Minimap.tsx`
- Modify: `src/app/game/page.tsx` — layer HUD over Canvas

HUD is HTML/CSS overlay (not 3D). Uses Zustand to read game state. Renders:
- Top bar: minerals, gas, supply (current/max), game time
- Bottom left: selected unit info (portrait placeholder, name, HP bar)
- Bottom right: command buttons (move, stop, attack, build menu)
- Bottom center: minimap (simple 2D canvas with dots for entities)

**Commit message:** `feat: add HUD with resource bar, selection panel, commands, and minimap`

---

### Task 11: Building Placement Mode

**Files:**
- Create: `src/components/game/BuildingPlacer.tsx`
- Modify: `src/components/hud/CommandPanel.tsx` — add build buttons

When player clicks "Build" in command panel:
1. Enter placement mode (ghost building follows cursor)
2. Left click to place (if valid position)
3. Deduct resources, create building entity via EntityFactory
4. Worker walks to building site (movement command)
5. Right click or ESC to cancel

**Commit message:** `feat: add building placement mode with ghost preview and validation`

---

## Phase 4: Production & Economy (Tasks 12-13)

### Task 12: Production Queue System

**Files:**
- Create: `src/lib/ecs/systems/ProductionSystem.ts`
- Create: `src/lib/ecs/__tests__/ProductionSystem.test.ts`
- Modify: `src/components/hud/CommandPanel.tsx` — add train buttons for selected buildings

When a completed building is selected and player clicks "Train Worker/Marine/etc":
1. Check resources sufficient
2. Deduct resources
3. Add to building's production queue
4. ProductionSystem processes queue each tick
5. When complete, spawn unit at rally point via EntityFactory

**Commit message:** `feat: add ProductionSystem for training units from buildings`

---

### Task 13: Player Resources Integration

**Files:**
- Modify: `src/stores/gameStore.ts` — track player resources in store
- Modify: `src/lib/ecs/systems/ResourceSystem.ts` — deposit minerals to player on return

When worker returns with minerals:
1. Add minerals to player's resource pool in gameStore
2. Worker automatically goes back to gather more

Supply tracking:
- Each unit costs supply (from config)
- Supply depots and command centers provide supply
- Cannot train units if supply capped

**Commit message:** `feat: integrate resource gathering with player economy and supply tracking`

---

## Phase 5: AI Opponent (Tasks 14-15)

### Task 14: Basic AI System

**Files:**
- Create: `src/lib/ecs/systems/AISystem.ts`
- Create: `src/lib/ecs/__tests__/AISystem.test.ts`

Simple state machine AI:
1. **Build phase** (0-120s): Train workers, build barracks, gather resources
2. **Expand phase** (120-300s): Build supply, factory, more units
3. **Attack phase** (300s+): Send army to player base

AI decisions run every 2-3 seconds (not every tick). AI uses same EntityFactory and gameStore as player — no cheating.

**Commit message:** `feat: add basic AI opponent with build-expand-attack state machine`

---

### Task 15: Win/Lose Conditions

**Files:**
- Create: `src/lib/game/GameManager.ts`
- Create: `src/components/hud/GameOverScreen.tsx`

Check each tick:
- If all player buildings destroyed → DEFEAT
- If all AI buildings destroyed → VICTORY
- Show overlay with result and "Play Again" button

**Commit message:** `feat: add win/lose detection and game over screen`

---

## Phase 6: Polish & Testing Matrix (Tasks 16-18)

### Task 16: Fog of War (Basic)

**Files:**
- Create: `src/lib/ecs/systems/VisionSystem.ts`
- Modify: `src/components/game/EntityRenderer.tsx` — hide entities outside vision

Each unit/building has sight range (from config). Entities outside all friendly sight ranges are hidden. Terrain remains visible (no "explored" state in MVP).

**Commit message:** `feat: add basic fog of war vision system`

---

### Task 17: Visual Polish

- Particle effects for attacks (simple Three.js points)
- Sound effects (placeholder beeps using Web Audio API)
- Death animations (scale to 0 + fade)
- Attack projectiles (simple sphere flying to target)
- Improve terrain with noise-based height variation

**Commit message:** `feat: add visual polish — particles, death animations, terrain variation`

---

### Task 18: Testing Matrix & Final Verification

**Testing Matrix:**

| Category | Test Type | Tool | What to Verify |
|---|---|---|---|
| **ECS Core** | Unit | Vitest | EntityManager CRUD, queries, component indexing |
| **Components** | Unit | Vitest | Add/remove/update/clone, type safety |
| **MovementSystem** | Unit | Vitest | Move toward target, arrival detection, rotation |
| **CombatSystem** | Unit | Vitest | Damage calc, armor, shields, cooldown, range |
| **BuildingSystem** | Unit | Vitest | Progress over time, health scaling, completion |
| **ResourceSystem** | Unit | Vitest | Gather rate, depletion, load/return cycle |
| **ProductionSystem** | Unit | Vitest | Queue processing, unit spawning, resource check |
| **AISystem** | Unit | Vitest | Phase transitions, build orders, attack timing |
| **EntityFactory** | Unit | Vitest | Create unit/building/mineral with correct components |
| **Game Config** | Unit | Vitest | All definitions valid, no missing fields |
| **Win/Lose** | Integration | Vitest | Destroy all buildings → correct result |
| **Game Loop** | Integration | Vitest | Init → tick → state changes correctly |
| **Resource Flow** | Integration | Vitest | Gather → deposit → build → train full cycle |
| **TypeScript** | Static | `tsc --noEmit` | Zero type errors |
| **Lint/Format** | Static | `biome check .` | Zero errors/warnings |
| **Build** | Build | `next build` | Compiles, no SSR errors |
| **Visual** | Manual | Browser | Camera, selection, HUD, entities render correctly |
| **Gameplay** | Manual | Browser | Can complete a full game (build → army → destroy AI) |
| **Performance** | Manual | Browser DevTools | 60fps with 200 units, no memory leaks |

**Final verification commands:**
```bash
bun run test -- --run          # All unit + integration tests
bun run typecheck              # TypeScript
bun run lint                   # Biome
bun run build                  # Next.js production build
bun run test:coverage          # Coverage report (target: >80%)
```

**Commit message:** `test: add integration tests and verify full testing matrix`

---

## Summary

| Phase | Tasks | Scope |
|---|---|---|
| 1. Foundation | 1-4 | Vitest, config, EntityFactory, ECS tests |
| 2. 3D Rendering | 5-8 | Scene, camera, entity meshes, game loop, resources |
| 3. Input & HUD | 9-11 | Mouse selection, HUD overlay, building placement |
| 4. Production | 12-13 | Training units, economy integration |
| 5. AI | 14-15 | Basic opponent, win/lose |
| 6. Polish | 16-18 | Fog of war, VFX, testing matrix |

**Total: 18 tasks across 6 phases**

Each task produces a working, testable increment. Game becomes playable after Phase 4 (Task 13). AI and polish (Phases 5-6) make it a complete MVP.
