# MoonCraft System Architecture

## Overview

MoonCraft follows a distributed client-server architecture with authoritative server model for competitive integrity.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                  │
│  │   Renderer   │  │    Input     │  │    Audio     │                  │
│  │  (R3F/Three) │  │   Handler    │  │   Engine     │                  │
│  └──────────────┘  └──────────────┘  └──────────────┘                  │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                      GAME STATE (Zustand)                         │  │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │  │
│  │  │ Entities│ │Players  │ │Resources│ │Selection│ │   UI    │   │  │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘   │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                    ECS LAYER (Client-Side)                        │  │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐               │  │
│  │  │ MoveSys │ │RenderSys│ │ AudioSys│ │EffectsSy│               │  │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘               │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                    NETWORK LAYER (WebSocket)                      │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │  │
│  │  │  Prediction │  │Interpolation│  │ Reconciliation│             │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘             │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                              WebSocket
                                    │
┌─────────────────────────────────────────────────────────────────────────┐
│                             SERVER LAYER                                 │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                    GAME SERVER (Node.js)                          │  │
│  │  ┌────────────────────────────────────────────────────────────┐ │  │
│  │  │                   ECS ENGINE (Authoritative)                │ │  │
│  │  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐     │ │  │
│  │  │  │ World    │ │  Entity  │ │Component │ │  System  │     │ │  │
│  │  │  │ Manager  │ │ Manager  │ │ Manager  │ │ Manager  │     │ │  │
│  │  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘     │ │  │
│  │  └────────────────────────────────────────────────────────────┘ │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │  │
│  │  │ Matchmaking  │  │  Game Logic  │  │   Replay     │         │  │
│  │  │   Service    │  │   Validator  │  │   Recorder   │         │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘         │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                    API LAYER (Next.js)                            │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │  │
│  │  │    Auth      │  │   Player     │  │   Replay     │         │  │
│  │  │   Routes     │  │   Routes     │  │   Routes     │         │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘         │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │
┌─────────────────────────────────────────────────────────────────────────┐
│                            DATA LAYER                                    │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐     │
│  │   PostgreSQL     │  │      Redis       │  │   File Storage   │     │
│  │  (Persistence)   │  │ (Cache/Queues)   │  │    (Replays)     │     │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘     │
└─────────────────────────────────────────────────────────────────────────┘
```

## Core Systems

### 1. ECS Engine

```
┌─────────────────────────────────────────────────────────────┐
│                        WORLD                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                  ENTITY MANAGER                       │   │
│  │  - createEntity(archetype)                           │   │
│  │  - destroyEntity(id)                                 │   │
│  │  - getEntity(id)                                     │   │
│  │  - queryEntities(...componentTypes)                  │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                COMPONENT MANAGER                      │   │
│  │  - addComponent(entityId, component)                 │   │
│  │  - removeComponent(entityId, type)                   │   │
│  │  - getComponent<T>(entityId, type): T                │   │
│  │  - hasComponent(entityId, type): boolean             │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                  SYSTEM MANAGER                       │   │
│  │  - registerSystem(system)                            │   │
│  │  - update(deltaTime)                                 │   │
│  │  - getSystem<T>(): T                                 │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                   EVENT BUS                           │   │
│  │  - emit<T>(event: T)                                 │   │
│  │  - on<T>(handler: EventHandler<T>)                   │   │
│  │  - off<T>(handler: EventHandler<T>)                  │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 2. Component Types

```
Components
├── Transform
│   ├── position: Vector3
│   ├── rotation: Quaternion
│   └── scale: Vector3
├── Health
│   ├── current: number
│   ├── max: number
│   ├── armor: number
│   └── shields?: number
├── Movement
│   ├── speed: number
│   ├── acceleration: number
│   ├── turnRate: number
│   ├── path: Vector3[]
│   └── targetPosition: Vector3 | null
├── Combat
│   ├── attackDamage: number
│   ├── attackRange: number
│   ├── attackSpeed: number
│   ├── cooldown: number
│   └── target: EntityId | null
├── ResourceCarrier
│   ├── resourceType: ResourceType
│   ├── currentLoad: number
│   ├── maxCapacity: number
│   ├── gatherRate: number
│   └── state: 'idle' | 'gathering' | 'returning'
├── Owner
│   ├── playerId: PlayerId
│   └── teamId: TeamId
├── Selection
│   ├── isSelected: boolean
│   └── selectionGroup: number | null
├── Unit
│   ├── unitType: UnitType
│   ├── tier: number
│   └── abilities: AbilityId[]
├── Building
│   ├── buildingType: BuildingType
│   ├── buildProgress: number
│   ├── isComplete: boolean
│   ├── productionQueue: ProductionItem[]
│   └── rallyPoint: Vector3
├── Resource
│   ├── resourceType: ResourceType
│   ├── amount: number
│   └── maxAmount: number
├── Renderer
│   ├── modelId: string
│   ├── animationState: AnimationState
│   ├── materialOverrides: MaterialConfig
│   └── effects: EffectInstance[]
└── Collider
    ├── type: 'box' | 'sphere' | 'mesh'
    ├── bounds: BoundingBox
    └── layer: CollisionLayer
```

### 3. System Types

```
Systems
├── Core Systems
│   ├── TransformSystem - Position interpolation
│   ├── HierarchySystem - Parent-child relationships
│   └── LifecycleSystem - Entity creation/destruction
├── Game Systems
│   ├── MovementSystem - Pathfinding & movement
│   ├── CombatSystem - Attack & damage
│   ├── ResourceSystem - Gathering & economy
│   ├── BuildingSystem - Construction & production
│   ├── AbilitySystem - Special abilities
│   ├── VisionSystem - Fog of war
│   └── AISystem - Computer opponents
├── Network Systems
│   ├── ReplicationSystem - State sync
│   ├── InputSystem - Command processing
│   └── LagCompensationSystem - Hit detection
└── Render Systems
    ├── MeshSystem - 3D model rendering
    ├── AnimationSystem - Skeletal animation
    ├── ParticleSystem - Visual effects
    └── UISystem - HUD & overlays
```

### 4. Network Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                     NETWORK FLOW                              │
│                                                               │
│  CLIENT                        SERVER                         │
│  ┌─────────┐                  ┌─────────┐                    │
│  │  Input  │ ────Command────> │ Validate│                    │
│  │ Handler │                  │ & Apply │                    │
│  └─────────┘                  └────┬────┘                    │
│      │                             │                         │
│      v                             v                         │
│  ┌─────────┐                  ┌─────────┐                    │
│  │Predict  │                  │ Update  │                    │
│  │ Locally │                  │  State  │                    │
│  └─────────┘                  └────┬────┘                    │
│      │                             │                         │
│      │         ┌───────────────────┘                         │
│      │         │                                               │
│      v         v                                               │
│  ┌─────────────────┐                                          │
│  │  Reconciliate   │ <──── State Update ────                  │
│  │  & Interpolate  │                                          │
│  └─────────────────┘                                          │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

### 5. State Management (Zustand)

```typescript
// Store Structure
interface GameStore {
  // Entity State
  entities: Map<EntityId, Entity>;
  selectedEntities: Set<EntityId>;
  hoveredEntity: EntityId | null;
  
  // Player State
  localPlayer: PlayerState;
  players: Map<PlayerId, PlayerState>;
  
  // Resources
  resources: PlayerResources;
  
  // Game State
  gamePhase: 'loading' | 'playing' | 'paused' | 'ended';
  matchInfo: MatchInfo;
  tick: number;
  
  // UI State
  ui: UIState;
  
  // Actions
  actions: {
    selectEntities: (ids: EntityId[], additive: boolean) => void;
    issueCommand: (command: Command) => void;
    setGamePhase: (phase: GamePhase) => void;
    updateEntity: (id: EntityId, updates: Partial<Entity>) => void;
  };
}

// Store Slices (SSOT)
const useEntityStore = create<EntitySlice>((set, get) => ({
  entities: new Map(),
  // ...
}));

const usePlayerStore = create<PlayerSlice>((set, get) => ({
  localPlayer: null,
  players: new Map(),
  resources: { minerals: 0, gas: 0, supplyUsed: 0, supplyMax: 0 },
  // ...
}));

const useUIStore = create<UISlice>((set, get) => ({
  selectionBox: null,
  commandCard: null,
  minimap: null,
  // ...
}));
```

## Directory Structure

```
mooncraft/
├── app/                          # Next.js App Router
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── (game)/
│   │   ├── lobby/
│   │   ├── match/[id]/
│   │   └── replay/[id]/
│   ├── api/
│   │   ├── auth/
│   │   ├── players/
│   │   ├── matches/
│   │   └── replays/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── game/
│   │   ├── GameCanvas.tsx
│   │   ├── GameUI.tsx
│   │   ├── Minimap.tsx
│   │   ├── CommandCard.tsx
│   │   └── ResourceBar.tsx
│   ├── ui/                       # Generic UI components
│   └── three/
│       ├── Unit.tsx
│       ├── Building.tsx
│       ├── Terrain.tsx
│       └── Effects.tsx
├── ecs/
│   ├── core/
│   │   ├── World.ts
│   │   ├── Entity.ts
│   │   ├── Component.ts
│   │   └── System.ts
│   ├── components/
│   │   ├── Transform.ts
│   │   ├── Health.ts
│   │   ├── Movement.ts
│   │   └── ...
│   └── systems/
│       ├── MovementSystem.ts
│       ├── CombatSystem.ts
│       └── ...
├── game/
│   ├── definitions/
│   │   ├── units.ts
│   │   ├── buildings.ts
│   │   ├── abilities.ts
│   │   └── maps.ts
│   ├── logic/
│   │   ├── combat.ts
│   │   ├── economy.ts
│   │   ├── pathfinding.ts
│   │   └── vision.ts
│   └── match/
│       ├── MatchManager.ts
│       └── GameLoop.ts
├── network/
│   ├── server/
│   │   ├── GameServer.ts
│   │   ├── Matchmaker.ts
│   │   └── RoomManager.ts
│   ├── client/
│   │   ├── GameClient.ts
│   │   ├── Prediction.ts
│   │   └── Interpolation.ts
│   └── protocol/
│       ├── messages.ts
│       └── serialization.ts
├── stores/
│   ├── gameStore.ts
│   ├── playerStore.ts
│   ├── uiStore.ts
│   └── networkStore.ts
├── db/
│   ├── schema/
│   │   ├── users.ts
│   │   ├── players.ts
│   │   ├── matches.ts
│   │   └── replays.ts
│   ├── migrations/
│   └── index.ts
├── lib/
│   ├── auth.ts
│   ├── constants.ts
│   └── utils.ts
├── hooks/
│   ├── useGame.ts
│   ├── useSelection.ts
│   └── useNetwork.ts
├── types/
│   ├── game.ts
│   ├── network.ts
│   └── api.ts
└── tests/
    ├── unit/
    ├── integration/
    └── e2e/
```

## Data Flow

### Input Processing

```
User Input
    │
    v
┌─────────────┐
│ InputHandler│
└──────┬──────┘
       │
       v
┌─────────────┐     ┌─────────────┐
│  Command    │────>│   Network   │
│  Builder    │     │   Client    │
└─────────────┘     └──────┬──────┘
                           │
                    WebSocket│
                           │
                           v
                    ┌─────────────┐
                    │ Game Server │
                    │ (Validate)  │
                    └──────┬──────┘
                           │
                           v
                    ┌─────────────┐
                    │   ECS       │
                    │  Execution  │
                    └──────┬──────┘
                           │
                           v
                    ┌─────────────┐
                    │   State     │
                    │  Broadcast  │
                    └─────────────┘
```

### Render Pipeline

```
┌────────────────────────────────────────────────────────┐
│                    RENDER PIPELINE                      │
│                                                         │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐         │
│  │  Scene   │───>│  Camera  │───>│ Culling  │         │
│  │  Graph   │    │  Setup   │    │  Pass    │         │
│  └──────────┘    └──────────┘    └──────────┘         │
│                                         │              │
│                                         v              │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐         │
│  │  Post    │<───│  Shadow  │<───│ Opaque   │         │
│  │Processing│    │   Map    │    │ Geometry │         │
│  └──────────┘    └──────────┘    └──────────┘         │
│       │                                                │
│       v                                                │
│  ┌──────────┐                                         │
│  │    UI    │                                         │
│  │  Overlay │                                         │
│  └──────────┘                                         │
│                                                         │
└────────────────────────────────────────────────────────┘
```

## Scalability

### Horizontal Scaling

```
┌──────────────────────────────────────────────────────────────┐
│                       LOAD BALANCER                           │
└──────────────────────────────────────────────────────────────┘
              │                    │                    │
              v                    v                    v
       ┌────────────┐       ┌────────────┐       ┌────────────┐
       │  Game      │       │  Game      │       │  Game      │
       │  Server 1  │       │  Server 2  │       │  Server N  │
       └────────────┘       └────────────┘       └────────────┘
              │                    │                    │
              └────────────────────┼────────────────────┘
                                   │
                                   v
                    ┌─────────────────────────────┐
                    │       Redis (Pub/Sub)        │
                    │   - Match queues             │
                    │   - Cross-server messaging   │
                    └─────────────────────────────┘
                                   │
                                   v
                    ┌─────────────────────────────┐
                    │       PostgreSQL             │
                    │   - Persistent data          │
                    │   - Analytics                │
                    └─────────────────────────────┘
```

### Match Server Isolation

```
┌─────────────────────────────────────────────────────────┐
│                    GAME SERVER                           │
│  ┌─────────────────────────────────────────────────┐   │
│  │               MATCH ORCHESTRATOR                 │   │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐        │   │
│  │  │ Match 1 │  │ Match 2 │  │ Match N │        │   │
│  │  │ Room    │  │ Room    │  │ Room    │        │   │
│  │  └─────────┘  └─────────┘  └─────────┘        │   │
│  │       │            │            │              │   │
│  │       v            v            v              │   │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐        │   │
│  │  │ Game    │  │ Game    │  │ Game    │        │   │
│  │  │ Loop 1  │  │ Loop 2  │  │ Loop N  │        │   │
│  │  └─────────┘  └─────────┘  └─────────┘        │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

## Security Model

```
┌─────────────────────────────────────────────────────────────┐
│                      SECURITY LAYERS                         │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  L1: Transport (WSS/HTTPS)                          │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  L2: Authentication (JWT)                           │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  L3: Authorization (RBAC)                           │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  L4: Input Validation                               │   │
│  │  - Command validation                               │   │
│  │  - Rate limiting                                    │   │
│  │  - Anti-cheat checks                                │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  L5: State Integrity                                │   │
│  │  - Server-authoritative                             │   │
│  │  - Deterministic simulation                         │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```
