# MoonCraft - Технічне Завдання (ТЗ)

## 1. Загальна інформація

### 1.1 Назва проекту
**MoonCraft** - онлайн стратегія в реальному часі (RTS)

### 1.2 Мета проекту
Створення масштабованої багатокористувацької RTS гри з 3D графікою, системою матчмейкінгу та підтримкою реплеїв.

### 1.3 Аналоги
- StarCraft II (Blizzard)
- WarCraft III (Blizzard)
- Age of Empires IV (Microsoft)

## 2. Технічний стек

### 2.1 Frontend
| Технологія | Версія | Призначення |
|------------|--------|-------------|
| Next.js | 16.x | SSR/SSG фреймворк |
| React | 19.x | UI бібліотека |
| TypeScript | 5.9 | Типізація |
| Three.js | 0.170+ | 3D рендеринг |
| React Three Fiber | 8.x | React інтеграція Three.js |
| Zustand | 5.x | State management |

### 2.2 Backend
| Технологія | Версія | Призначення |
|------------|--------|-------------|
| Next.js API Routes | 16.x | REST API |
| WebSocket (ws) | 8.x | Real-time комунікація |
| PostgreSQL | 16+ | База даних |
| Drizzle ORM | 0.36+ | ORM |

## 3. Архітектура системи

### 3.1 ECS (Entity Component System)

```
┌─────────────────────────────────────────────┐
│                  WORLD                       │
│  ┌─────────────────────────────────────┐   │
│  │           ENTITIES                   │   │
│  │  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐   │   │
│  │  │ E1  │ │ E2  │ │ E3  │ │ E4  │   │   │
│  │  └─────┘ └─────┘ └─────┘ └─────┘   │   │
│  └─────────────────────────────────────┘   │
│  ┌─────────────────────────────────────┐   │
│  │          COMPONENTS                  │   │
│  │  Position | Health | Movement | AI  │   │
│  └─────────────────────────────────────┘   │
│  ┌─────────────────────────────────────┐   │
│  │            SYSTEMS                   │   │
│  │  Move | Combat | Render | Network   │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

### 3.2 Компоненти Entity

```typescript
interface Entity {
  id: EntityId;
  components: Map<ComponentType, Component>;
}

type ComponentType = 
  | 'transform'
  | 'health'
  | 'movement'
  | 'combat'
  | 'resource'
  | 'building'
  | 'owner'
  | 'selection'
  | 'animation';

interface TransformComponent {
  type: 'transform';
  position: Vector3;
  rotation: Quaternion;
  scale: Vector3;
}

interface HealthComponent {
  type: 'health';
  current: number;
  max: number;
  armor: number;
  shields?: number;
}

interface MovementComponent {
  type: 'movement';
  speed: number;
  targetPosition: Vector3 | null;
  path: Vector3[];
  isMoving: boolean;
}

interface CombatComponent {
  type: 'combat';
  attackDamage: number;
  attackRange: number;
  attackSpeed: number;
  attackCooldown: number;
  target: EntityId | null;
}

interface ResourceComponent {
  type: 'resource';
  resourceType: ResourceType;
  amount: number;
  maxCapacity: number;
}

interface OwnerComponent {
  type: 'owner';
  playerId: PlayerId;
  teamId: TeamId;
}

interface BuildingComponent {
  type: 'building';
  buildingType: BuildingType;
  buildProgress: number;
  queue: ProductionQueueItem[];
  rallyPoint: Vector3;
}
```

### 3.3 Системи

```typescript
abstract class System {
  abstract readonly requiredComponents: ComponentType[];
  abstract update(entities: Entity[], deltaTime: number): void;
}

class MovementSystem extends System {
  requiredComponents = ['transform', 'movement'];
  
  update(entities: Entity[], deltaTime: number): void {
    for (const entity of entities) {
      const transform = entity.get<TransformComponent>('transform');
      const movement = entity.get<MovementComponent>('movement');
      
      if (movement.targetPosition) {
        this.moveTowards(transform, movement, deltaTime);
      }
    }
  }
}

class CombatSystem extends System {
  requiredComponents = ['transform', 'combat', 'health'];
  
  update(entities: Entity[], deltaTime: number): void {
    for (const entity of entities) {
      const combat = entity.get<CombatComponent>('combat');
      combat.attackCooldown = Math.max(0, combat.attackCooldown - deltaTime);
      
      if (combat.target && combat.attackCooldown === 0) {
        this.performAttack(entity, combat.target);
      }
    }
  }
}
```

## 4. Клієнт-серверна синхронізація

### 4.1 Модель синхронізації

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Client A   │     │    Server    │     │   Client B   │
│  (Authoritative)    │ (Authoritative)   │  (Predictive) │
└──────────────┘     └──────────────┘     └──────────────┘
       │                    │                    │
       │  Input Command     │                    │
       │───────────────────>│                    │
       │                    │  Broadcast State   │
       │                    │───────────────────>│
       │  State Update      │                    │
       │<───────────────────│                    │
       │                    │                    │
```

### 4.2 Протокол синхронізації

```typescript
interface SyncMessage {
  type: 'sync';
  tick: number;
  timestamp: number;
  entities: EntityState[];
}

interface EntityState {
  id: EntityId;
  components: Partial<ComponentSnapshot>;
}

interface InputMessage {
  type: 'input';
  tick: number;
  playerId: PlayerId;
  actions: PlayerAction[];
}

type PlayerAction = 
  | { type: 'select'; entityIds: EntityId[] }
  | { type: 'move'; targetPosition: Vector3 }
  | { type: 'attack'; targetId: EntityId }
  | { type: 'build'; buildingType: BuildingType; position: Vector3 }
  | { type: 'train'; unitType: UnitType };
```

### 4.3 Client-side Prediction

```typescript
class PredictionManager {
  private pendingInputs: Map<number, InputMessage> = new Map();
  private lastAckedTick: number = 0;
  
  processInput(action: PlayerAction): void {
    const input: InputMessage = {
      type: 'input',
      tick: this.currentTick,
      playerId: this.localPlayerId,
      actions: [action]
    };
    
    this.pendingInputs.set(input.tick, input);
    this.network.send(input);
    this.applyLocally(action);
  }
  
  onServerState(state: SyncMessage): void {
    this.reconcile(state);
    this.lastAckedTick = state.tick;
    this.pendingInputs.delete(state.tick);
    this.reapplyPendingInputs();
  }
}
```

### 4.4 Lag Compensation

```typescript
class LagCompensator {
  private stateHistory: Map<number, WorldSnapshot> = new Map();
  private maxHistoryLength: number = 100;
  
  getHistoricalState(tick: number): WorldSnapshot | null {
    return this.stateHistory.get(tick) ?? null;
  }
  
  compensatePlayerShot(
    shooterId: PlayerId,
    targetId: EntityId,
    clientTick: number
  ): boolean {
    const historicalState = this.getHistoricalState(clientTick);
    if (!historicalState) return false;
    
    const shooter = historicalState.getEntity(shooterId);
    const target = historicalState.getEntity(targetId);
    
    return this.checkHit(shooter, target);
  }
}
```

## 5. Система юнітів та будівель

### 5.1 Ієрархія юнітів

```
Unit (Base)
├── WorkerUnit
│   ├── SCV
│   ├── Probe
│   └── Drone
├── CombatUnit
│   ├── GroundUnit
│   │   ├── Marine
│   │   ├── Zealot
│   │   └── Zergling
│   └── AirUnit
│       ├── Wraith
│       ├── Scout
│       └── Mutalisk
└── SupportUnit
    ├── Medic
    ├── HighTemplar
    └── Defiler
```

### 5.2 Визначення юнітів

```typescript
interface UnitDefinition {
  id: string;
  name: string;
  race: Race;
  tier: number;
  
  cost: ResourceCost;
  buildTime: number;
  supplyCost: number;
  
  stats: {
    health: number;
    shields?: number;
    armor: number;
    speed: number;
    sight: number;
  };
  
  combat?: {
    damage: number;
    damageType: DamageType;
    attacks: number;
    range: number;
    cooldown: number;
    targets: TargetType[];
  };
  
  abilities: AbilityDefinition[];
  requirements: string[];
}

type Race = 'terran' | 'protoss' | 'zerg';
type DamageType = 'normal' | 'explosive' | 'concussive' | 'plasma';
type TargetType = 'ground' | 'air' | 'both';

const UNIT_DEFINITIONS: Record<string, UnitDefinition> = {
  marine: {
    id: 'marine',
    name: 'Marine',
    race: 'terran',
    tier: 1,
    cost: { minerals: 50, gas: 0 },
    buildTime: 24,
    supplyCost: 1,
    stats: {
      health: 40,
      armor: 0,
      speed: 4.13,
      sight: 9
    },
    combat: {
      damage: 6,
      damageType: 'normal',
      attacks: 1,
      range: 4,
      cooldown: 15,
      targets: ['ground', 'air']
    },
    abilities: ['stimpack'],
    requirements: ['barracks']
  }
};
```

### 5.3 Система будівель

```typescript
interface BuildingDefinition {
  id: string;
  name: string;
  race: Race;
  
  cost: ResourceCost;
  buildTime: number;
  
  size: { width: number; height: number };
  footprint: boolean[][];
  
  health: number;
  armor: number;
  sight: number;
  
  production?: {
    units: string[];
    research: string[];
  };
  
  addons?: string[];
  abilities: string[];
}

const BUILDING_DEFINITIONS: Record<string, BuildingDefinition> = {
  command_center: {
    id: 'command_center',
    name: 'Command Center',
    race: 'terran',
    cost: { minerals: 400, gas: 0 },
    buildTime: 180,
    size: { width: 4, height: 3 },
    footprint: [
      [true, true, true, true],
      [true, true, true, true],
      [true, true, true, true]
    ],
    health: 1500,
    armor: 1,
    sight: 11,
    production: {
      units: ['scv'],
      research: []
    },
    addons: ['comsat_station', 'nuclear_silo'],
    abilities: ['lift_off']
  }
};
```

## 6. Система ресурсів

### 6.1 Типи ресурсів

```typescript
enum ResourceType {
  MINERALS = 'minerals',
  GAS = 'gas',
  SUPPLY = 'supply'
}

interface PlayerResources {
  minerals: number;
  gas: number;
  supplyUsed: number;
  supplyMax: number;
}

interface ResourceNode {
  id: EntityId;
  type: ResourceType;
  position: Vector3;
  amount: number;
  maxAmount: number;
  gatherRate: number;
  lastGathered: number;
}
```

### 6.2 Логіка збору ресурсів

```typescript
class ResourceGatheringSystem extends System {
  requiredComponents = ['transform', 'movement', 'resource_carrier'];
  
  update(entities: Entity[], deltaTime: number): void {
    for (const worker of entities) {
      const carrier = worker.get<ResourceCarrierComponent>('resource_carrier');
      
      if (carrier.state === 'gathering') {
        this.processGathering(worker, carrier, deltaTime);
      } else if (carrier.state === 'returning') {
        this.processReturning(worker, carrier);
      } else if (carrier.state === 'idle') {
        this.assignNearestResource(worker, carrier);
      }
    }
  }
  
  private processGathering(
    worker: Entity, 
    carrier: ResourceCarrierComponent,
    deltaTime: number
  ): void {
    const resource = this.world.getEntity(carrier.targetResource);
    if (!resource) return;
    
    const gatherAmount = Math.min(
      carrier.gatherRate * deltaTime,
      resource.amount,
      carrier.maxCapacity - carrier.currentLoad
    );
    
    resource.amount -= gatherAmount;
    carrier.currentLoad += gatherAmount;
    
    if (carrier.currentLoad >= carrier.maxCapacity || resource.amount <= 0) {
      carrier.state = 'returning';
      this.setReturnPath(worker);
    }
  }
}
```

## 7. Система матчмейкінгу

### 7.1 Рейтингова система (ELO)

```typescript
interface PlayerRating {
  playerId: PlayerId;
  mmr: number;
  rank: Rank;
  wins: number;
  losses: number;
  streak: number;
}

type Rank = 
  | 'bronze'
  | 'silver'
  | 'gold'
  | 'platinum'
  | 'diamond'
  | 'master'
  | 'grandmaster';

function calculateNewRating(
  playerRating: number,
  opponentRating: number,
  score: number,
  kFactor: number = 32
): number {
  const expectedScore = 1 / (1 + Math.pow(10, (opponentRating - playerRating) / 400));
  return Math.round(playerRating + kFactor * (score - expectedScore));
}
```

### 7.2 Алгоритм матчмейкінгу

```typescript
interface MatchRequest {
  playerId: PlayerId;
  rating: number;
  preferredRace: Race | null;
  preferredMap: string | null;
  maxPing: number;
  timestamp: number;
}

interface MatchConfig {
  minPlayers: number;
  maxPlayers: number;
  ratingRange: number;
  maxWaitTime: number;
  ratingExpansionRate: number;
}

class MatchmakingQueue {
  private queue: MatchRequest[] = [];
  private config: MatchConfig;
  
  addPlayer(request: MatchRequest): void {
    this.queue.push(request);
  }
  
  findMatches(): MatchFound[] {
    const matches: MatchFound[] = [];
    const processed = new Set<PlayerId>();
    
    for (const player of this.queue) {
      if (processed.has(player.playerId)) continue;
      
      const waitTime = Date.now() - player.timestamp;
      const effectiveRatingRange = this.config.ratingRange + 
        (waitTime / 1000) * this.config.ratingExpansionRate;
      
      const opponents = this.queue.filter(p => 
        p.playerId !== player.playerId &&
        !processed.has(p.playerId) &&
        Math.abs(p.rating - player.rating) <= effectiveRatingRange
      );
      
      if (opponents.length >= this.config.minPlayers - 1) {
        const matchPlayers = [player, ...opponents.slice(0, this.config.maxPlayers - 1)];
        matches.push(this.createMatch(matchPlayers));
        matchPlayers.forEach(p => processed.add(p.playerId));
      }
    }
    
    this.queue = this.queue.filter(p => !processed.has(p.playerId));
    return matches;
  }
}
```

## 8. Система реплеїв

### 8.1 Структура реплею

```typescript
interface ReplayHeader {
  version: string;
  gameMode: GameMode;
  mapId: string;
  players: ReplayPlayer[];
  duration: number;
  timestamp: number;
  engineVersion: string;
}

interface ReplayPlayer {
  playerId: PlayerId;
  name: string;
  race: Race;
  team: number;
  result: 'win' | 'loss' | 'draw' | 'unknown';
  rating: number;
}

interface ReplayBody {
  initialState: WorldSnapshot;
  inputs: ReplayInput[];
}

interface ReplayInput {
  tick: number;
  playerId: PlayerId;
  actions: PlayerAction[];
}
```

### 8.2 Запис реплею

```typescript
class ReplayRecorder {
  private inputs: ReplayInput[] = [];
  private startTime: number = 0;
  
  constructor(private header: ReplayHeader) {}
  
  recordInput(playerId: PlayerId, action: PlayerAction): void {
    const tick = this.currentTick;
    const lastInput = this.inputs[this.inputs.length - 1];
    
    if (lastInput && lastInput.tick === tick && lastInput.playerId === playerId) {
      lastInput.actions.push(action);
    } else {
      this.inputs.push({
        tick,
        playerId,
        actions: [action]
      });
    }
  }
  
  save(): ReplayFile {
    return {
      header: {
        ...this.header,
        duration: Date.now() - this.startTime
      },
      body: {
        initialState: this.initialState,
        inputs: this.inputs
      }
    };
  }
}
```

### 8.3 Відтворення реплею

```typescript
class ReplayPlayer {
  private currentTick: number = 0;
  private playbackSpeed: number = 1;
  private isPaused: boolean = false;
  
  constructor(
    private replay: ReplayFile,
    private world: World
  ) {}
  
  tick(deltaTime: number): void {
    if (this.isPaused) return;
    
    const adjustedDelta = deltaTime * this.playbackSpeed;
    this.currentTick += adjustedDelta;
    
    this.applyInputsForTick(Math.floor(this.currentTick));
    this.world.update(adjustedDelta);
  }
  
  private applyInputsForTick(tick: number): void {
    const inputs = this.replay.body.inputs.filter(i => i.tick === tick);
    
    for (const input of inputs) {
      for (const action of input.actions) {
        this.world.applyAction(input.playerId, action);
      }
    }
  }
  
  setSpeed(speed: number): void {
    this.playbackSpeed = Math.max(0.25, Math.min(8, speed));
  }
  
  seekTo(tick: number): void {
    if (tick < this.currentTick) {
      this.world.loadSnapshot(this.replay.body.initialState);
      this.currentTick = 0;
    }
    
    while (this.currentTick < tick) {
      this.tick(1);
    }
  }
}
```

## 9. База даних

### 9.1 Схема (Drizzle ORM)

```typescript
import { pgTable, serial, varchar, integer, timestamp, boolean, jsonb } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  username: varchar('username', { length: 50 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  lastLogin: timestamp('last_login')
});

export const players = pgTable('players', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  mmr: integer('mmr').default(1000),
  rank: varchar('rank', { length: 20 }).default('bronze'),
  wins: integer('wins').default(0),
  losses: integer('losses').default(0),
  preferredRace: varchar('preferred_race', { length: 20 }),
  stats: jsonb('stats').$type<PlayerStats>()
});

export const matches = pgTable('matches', {
  id: serial('id').primaryKey(),
  mapId: varchar('map_id', { length: 50 }).notNull(),
  gameMode: varchar('game_mode', { length: 30 }).notNull(),
  status: varchar('status', { length: 20 }).notNull(),
  startedAt: timestamp('started_at'),
  endedAt: timestamp('ended_at'),
  duration: integer('duration')
});

export const matchPlayers = pgTable('match_players', {
  id: serial('id').primaryKey(),
  matchId: integer('match_id').references(() => matches.id).notNull(),
  playerId: integer('player_id').references(() => players.id).notNull(),
  team: integer('team').notNull(),
  race: varchar('race', { length: 20 }).notNull(),
  result: varchar('result', { length: 20 }),
  mmrChange: integer('mmr_change')
});

export const replays = pgTable('replays', {
  id: serial('id').primaryKey(),
  matchId: integer('match_id').references(() => matches.id).notNull(),
  filePath: varchar('file_path', { length: 500 }).notNull(),
  fileSize: integer('file_size'),
  version: varchar('version', { length: 20 }).notNull()
});
```

## 10. WebSocket протокол

### 10.1 Типи повідомлень

```typescript
type ServerMessage = 
  | { type: 'connected'; playerId: PlayerId }
  | { type: 'match_found'; matchId: string; players: MatchPlayer[] }
  | { type: 'game_start'; initialState: WorldSnapshot; config: GameConfig }
  | { type: 'sync'; tick: number; state: EntityState[] }
  | { type: 'player_joined'; player: PlayerInfo }
  | { type: 'player_left'; playerId: PlayerId }
  | { type: 'game_over'; results: GameResult[] }
  | { type: 'error'; code: ErrorCode; message: string };

type ClientMessage = 
  | { type: 'authenticate'; token: string }
  | { type: 'queue_join'; preferences: MatchPreferences }
  | { type: 'queue_leave' }
  | { type: 'input'; tick: number; actions: PlayerAction[] }
  | { type: 'ready' }
  | { type: 'chat'; message: string; channel: ChatChannel };
```

### 10.2 Стан з'єднання

```
┌─────────┐     ┌──────────┐     ┌─────────┐     ┌──────────┐     ┌──────────┐
│ CONNECT │────>│AUTHENTICATE│────>│ IN_LOBBY │────>│IN_QUEUE │────>│IN_MATCH  │
└─────────┘     └──────────┘     └─────────┘     └──────────┘     └──────────┘
                     │                │               │                │
                     v                v               v                v
               ┌──────────┐     ┌──────────┐   ┌──────────┐     ┌──────────┐
               │DISCONNECTED│    │DISCONNECTED│  │DISCONNECTED│   │DISCONNECTED│
               └──────────┘     └──────────┘   └──────────┘     └──────────┘
```

## 11. Продуктивність

### 11.1 Цільові метрики

| Метрика | Значення |
|---------|----------|
| Tick rate | 60 Hz (16.67ms) |
| Latency (client-server) | < 50ms |
| Bandwidth per client | < 100 KB/s |
| Max players per match | 8 |
| Max units per player | 200 |
| Map size | 256x256 tiles |

### 11.2 Оптимізації

```typescript
class SpatialHashGrid {
  private cells: Map<string, Entity[]> = new Map();
  private cellSize: number = 64;
  
  insert(entity: Entity): void {
    const pos = entity.get<TransformComponent>('transform').position;
    const key = this.getCellKey(pos.x, pos.z);
    
    if (!this.cells.has(key)) {
      this.cells.set(key, []);
    }
    this.cells.get(key)!.push(entity);
  }
  
  queryArea(center: Vector3, radius: number): Entity[] {
    const results: Entity[] = [];
    const cells = this.getCellsInArea(center, radius);
    
    for (const key of cells) {
      const cellEntities = this.cells.get(key) || [];
      results.push(...cellEntities.filter(e => 
        this.distance(center, e.get<TransformComponent>('transform').position) <= radius
      ));
    }
    
    return results;
  }
}
```

## 12. Безпека

### 12.1 Валідація дій

```typescript
class ActionValidator {
  validate(playerId: PlayerId, action: PlayerAction, state: WorldState): ValidationResult {
    switch (action.type) {
      case 'move':
        return this.validateMove(playerId, action, state);
      case 'attack':
        return this.validateAttack(playerId, action, state);
      case 'build':
        return this.validateBuild(playerId, action, state);
      default:
        return { valid: false, reason: 'Unknown action type' };
    }
  }
  
  private validateBuild(
    playerId: PlayerId,
    action: BuildAction,
    state: WorldState
  ): ValidationResult {
    const player = state.players.get(playerId);
    const buildingDef = BUILDING_DEFINITIONS[action.buildingType];
    
    if (!player || !buildingDef) {
      return { valid: false, reason: 'Invalid player or building' };
    }
    
    if (player.resources.minerals < buildingDef.cost.minerals ||
        player.resources.gas < buildingDef.cost.gas) {
      return { valid: false, reason: 'Insufficient resources' };
    }
    
    if (!this.canPlaceBuilding(action.position, buildingDef, state)) {
      return { valid: false, reason: 'Cannot place building here' };
    }
    
    return { valid: true };
  }
}
```

## 13. Тестування

### 13.1 Одиничні тести

```typescript
describe('CombatSystem', () => {
  it('should deal damage to target', () => {
    const attacker = createTestUnit({ attackDamage: 10 });
    const target = createTestUnit({ health: 100 });
    
    combatSystem.performAttack(attacker, target.id);
    
    expect(target.get<HealthComponent>('health').current).toBe(90);
  });
  
  it('should respect attack cooldown', () => {
    const attacker = createTestUnit({ attackSpeed: 1 });
    const target = createTestUnit({ health: 100 });
    
    combatSystem.update([attacker], 0.5);
    combatSystem.update([attacker], 0.5);
    
    expect(target.get<HealthComponent>('health').current).toBe(90);
  });
});
```

### 13.2 Інтеграційні тести

```typescript
describe('MatchFlow', () => {
  it('should complete a full match', async () => {
    const players = await createTestPlayers(2);
    const match = await matchmaking.createMatch(players);
    
    await match.start();
    
    players[0].sendAction({ type: 'build', buildingType: 'barracks', position: { x: 10, z: 10 } });
    
    await waitForCondition(() => match.isComplete, 30000);
    
    expect(match.winner).toBeDefined();
  });
});
```

## 14. Розгортання

### 14.1 Вимоги до середовища

- Node.js 20+
- PostgreSQL 16+
- Redis 7+ (для черг)
- 4 CPU cores, 8GB RAM (мінімум)

### 14.2 Змінні середовища

```env
DATABASE_URL=postgresql://user:pass@host:5432/mooncraft
REDIS_URL=redis://host:6379
JWT_SECRET=your-secret-key
WS_PORT=8080
NODE_ENV=production
```

## 15. Етапи розробки

### Phase 1: Foundation (4 тижні)
- [x] Налаштування проекту
- [ ] Базова ECS система
- [ ] 3D рендеринг (isometric)
- [ ] Камера та контролі

### Phase 2: Core Gameplay (6 тижнів)
- [ ] Система юнітів
- [ ] Система будівель
- [ ] Ресурси та економіка
- [ ] Бойова система

### Phase 3: Multiplayer (4 тижні)
- [ ] WebSocket сервер
- [ ] Клієнт-серверна синхронізація
- [ ] Matchmaking
- [ ] Латентність та prediction

### Phase 4: Polish (4 тижні)
- [ ] UI/UX
- [ ] Реплеї
- [ ] Рейтингова система
- [ ] Тестування та оптимізація

---

*Документ версії 1.0*
*Останнє оновлення: 2026*
