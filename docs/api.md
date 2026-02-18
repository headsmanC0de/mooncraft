# MoonCraft API Documentation

## Base URL

```
Development: http://localhost:3000/api
Production: https://api.mooncraft.gg/api
```

## Authentication

All authenticated endpoints require Bearer token in Authorization header.

```
Authorization: Bearer <jwt_token>
```

---

## REST API

### Auth

#### POST /api/auth/register

Register new user account.

**Request Body:**
```json
{
  "email": "player@example.com",
  "username": "StarPlayer",
  "password": "securePassword123"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "player@example.com",
      "username": "StarPlayer",
      "createdAt": "2026-02-16T10:00:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Errors:**
- `400` - Invalid input data
- `409` - Email or username already exists

---

#### POST /api/auth/login

Authenticate user.

**Request Body:**
```json
{
  "email": "player@example.com",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "player@example.com",
      "username": "StarPlayer"
    },
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Errors:**
- `401` - Invalid credentials

---

#### POST /api/auth/refresh

Refresh access token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

---

### Players

#### GET /api/players/me

Get current player profile.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "userId": 1,
    "username": "StarPlayer",
    "mmr": 1250,
    "rank": "gold",
    "wins": 45,
    "losses": 30,
    "winRate": 0.6,
    "preferredRace": "terran",
    "stats": {
      "totalGames": 75,
      "averageApm": 120,
      "favoriteUnit": "marine",
      "gamesByRace": {
        "terran": 50,
        "protoss": 15,
        "zerg": 10
      }
    },
    "createdAt": "2026-01-01T00:00:00Z"
  }
}
```

---

#### PATCH /api/players/me

Update player profile.

**Request Body:**
```json
{
  "preferredRace": "protoss"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "preferredRace": "protoss"
  }
}
```

---

#### GET /api/players/:id

Get public player profile.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "StarPlayer",
    "mmr": 1250,
    "rank": "gold",
    "wins": 45,
    "losses": 30,
    "winRate": 0.6,
    "preferredRace": "terran"
  }
}
```

---

#### GET /api/leaderboard

Get ranked leaderboard.

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `rank` | string | - | Filter by rank |
| `limit` | number | 100 | Results per page |
| `offset` | number | 0 | Pagination offset |

**Response (200):**
```json
{
  "success": true,
  "data": {
    "players": [
      {
        "rank": 1,
        "playerId": 42,
        "username": "ProGamer",
        "mmr": 2800,
        "race": "protoss",
        "wins": 500,
        "losses": 100
      }
    ],
    "total": 15000,
    "offset": 0,
    "limit": 100
  }
}
```

---

### Matches

#### GET /api/matches

Get match history.

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `playerId` | number | - | Filter by player |
| `status` | string | - | Filter by status |
| `limit` | number | 20 | Results per page |
| `offset` | number | 0 | Pagination offset |

**Response (200):**
```json
{
  "success": true,
  "data": {
    "matches": [
      {
        "id": "match_abc123",
        "mapId": "lost_temple",
        "gameMode": "ranked_1v1",
        "status": "completed",
        "duration": 1234,
        "players": [
          {
            "playerId": 1,
            "username": "StarPlayer",
            "race": "terran",
            "team": 1,
            "result": "win",
            "mmrChange": 25
          },
          {
            "playerId": 2,
            "username": "Opponent",
            "race": "zerg",
            "team": 2,
            "result": "loss",
            "mmrChange": -25
          }
        ],
        "startedAt": "2026-02-16T10:00:00Z",
        "endedAt": "2026-02-16T10:20:34Z"
      }
    ],
    "total": 75,
    "offset": 0,
    "limit": 20
  }
}
```

---

#### GET /api/matches/:id

Get match details.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "match_abc123",
    "mapId": "lost_temple",
    "gameMode": "ranked_1v1",
    "status": "completed",
    "duration": 1234,
    "players": [...],
    "stats": {
      "totalUnits": 450,
      "totalBuildings": 32,
      "peakApm": [180, 165],
      "resourcesCollected": [
        { "playerId": 1, "minerals": 15000, "gas": 5000 },
        { "playerId": 2, "minerals": 12000, "gas": 4000 }
      ]
    },
    "hasReplay": true,
    "replayId": "replay_xyz789"
  }
}
```

---

### Replays

#### GET /api/replays

List available replays.

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `playerId` | number | - | Filter by player |
| `mapId` | string | - | Filter by map |
| `limit` | number | 20 | Results per page |

**Response (200):**
```json
{
  "success": true,
  "data": {
    "replays": [
      {
        "id": "replay_xyz789",
        "matchId": "match_abc123",
        "mapId": "lost_temple",
        "duration": 1234,
        "players": [
          { "playerId": 1, "username": "StarPlayer", "race": "terran" },
          { "playerId": 2, "username": "Opponent", "race": "zerg" }
        ],
        "fileSize": 524288,
        "version": "1.0.0",
        "createdAt": "2026-02-16T10:20:34Z"
      }
    ],
    "total": 50
  }
}
```

---

#### GET /api/replays/:id

Download replay file.

**Response (200):**
```
Content-Type: application/octet-stream
Content-Disposition: attachment; filename="replay_xyz789.mcr"

[binary replay data]
```

---

#### GET /api/replays/:id/metadata

Get replay metadata without downloading.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "replay_xyz789",
    "matchId": "match_abc123",
    "header": {
      "version": "1.0.0",
      "gameMode": "ranked_1v1",
      "mapId": "lost_temple",
      "players": [...],
      "duration": 1234,
      "timestamp": "2026-02-16T10:00:00Z"
    },
    "stats": {
      "totalCommands": 4500,
      "keyMoments": [
        { "tick": 500, "type": "first_blood", "description": "First unit kill" },
        { "tick": 2500, "type": "expansion", "playerId": 1 }
      ]
    }
  }
}
```

---

### Maps

#### GET /api/maps

List available maps.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "maps": [
      {
        "id": "lost_temple",
        "name": "Lost Temple",
        "description": "Classic balanced map",
        "size": { "width": 128, "height": 128 },
        "players": 2,
        "type": "melee",
        "resources": {
          "startingMinerals": 2,
          "startingGas": 1,
          "expansions": 6
        },
        "thumbnail": "/maps/lost_temple_thumb.png"
      }
    ]
  }
}
```

---

## WebSocket API

### Connection

```
wss://ws.mooncraft.gg
```

#### Authentication

Send after connection:

```json
{
  "type": "authenticate",
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response:**
```json
{
  "type": "authenticated",
  "playerId": 1
}
```

---

### Matchmaking

#### Join Queue

```json
{
  "type": "queue_join",
  "preferences": {
    "gameMode": "ranked_1v1",
    "preferredRace": "terran",
    "preferredMaps": ["lost_temple", "fighting_spirit"]
  }
}
```

**Response:**
```json
{
  "type": "queue_joined",
  "queueId": "queue_abc123",
  "estimatedWait": 45
}
```

---

#### Leave Queue

```json
{
  "type": "queue_leave"
}
```

**Response:**
```json
{
  "type": "queue_left"
}
```

---

#### Match Found

Server notification:

```json
{
  "type": "match_found",
  "matchId": "match_xyz789",
  "mapId": "lost_temple",
  "players": [
    {
      "playerId": 1,
      "username": "StarPlayer",
      "mmr": 1250,
      "team": 1,
      "spawnPosition": { "x": 20, "z": 20 }
    },
    {
      "playerId": 2,
      "username": "Opponent",
      "mmr": 1245,
      "team": 2,
      "spawnPosition": { "x": 108, "z": 108 }
    }
  ],
  "serverUrl": "wss://game1.mooncraft.gg"
}
```

---

### Game Communication

#### Game Start

Server sends after all players ready:

```json
{
  "type": "game_start",
  "matchId": "match_xyz789",
  "initialState": {
    "tick": 0,
    "entities": [
      {
        "id": "entity_1",
        "type": "command_center",
        "position": { "x": 20, "y": 0, "z": 20 },
        "owner": 1,
        "health": 1500
      }
    ],
    "resources": {
      "1": { "minerals": 50, "gas": 0, "supplyUsed": 0, "supplyMax": 10 },
      "2": { "minerals": 50, "gas": 0, "supplyUsed": 0, "supplyMax": 10 }
    }
  },
  "config": {
    "tickRate": 60,
    "mapId": "lost_temple"
  }
}
```

---

#### Player Ready

```json
{
  "type": "ready"
}
```

---

#### Input Commands

Send player actions:

```json
{
  "type": "input",
  "tick": 1500,
  "actions": [
    {
      "type": "select",
      "entityIds": ["entity_5", "entity_6", "entity_7"]
    },
    {
      "type": "move",
      "targetPosition": { "x": 45.5, "y": 0, "z": 32.1 }
    }
  ]
}
```

**Action Types:**

| Type | Fields | Description |
|------|--------|-------------|
| `select` | `entityIds: string[]`, `additive?: boolean` | Select units |
| `deselect` | `entityIds?: string[]` | Deselect units |
| `move` | `targetPosition: Vector3`, `queue?: boolean` | Move command |
| `attack_move` | `targetPosition: Vector3` | Attack move |
| `attack` | `targetId: string` | Attack target |
| `stop` | - | Stop current action |
| `hold` | - | Hold position |
| `patrol` | `points: Vector3[]` | Patrol between points |
| `build` | `buildingType: string`, `position: Vector3` | Build structure |
| `train` | `unitType: string` | Train unit |
| `research` | `upgradeId: string` | Research upgrade |
| `ability` | `abilityId: string`, `target?: Vector3 \| string` | Use ability |

---

#### State Sync

Server broadcasts:

```json
{
  "type": "sync",
  "tick": 1520,
  "timestamp": 1708083600000,
  "entities": [
    {
      "id": "entity_5",
      "components": {
        "transform": { "position": { "x": 42.1, "y": 0, "z": 30.5 } },
        "health": { "current": 40, "max": 40 }
      }
    }
  ],
  "acknowledgedInputs": {
    "1": 1500,
    "2": 1498
  }
}
```

---

#### Game Events

Server broadcasts game events:

```json
{
  "type": "game_event",
  "tick": 2500,
  "event": {
    "type": "unit_killed",
    "attackerId": "entity_5",
    "victimId": "entity_20",
    "victimType": "zergling"
  }
}
```

**Event Types:**

| Type | Fields |
|------|--------|
| `unit_killed` | `attackerId`, `victimId`, `victimType` |
| `building_destroyed` | `attackerId`, `buildingId`, `buildingType` |
| `building_completed` | `buildingId`, `buildingType`, `ownerId` |
| `unit_trained` | `unitId`, `unitType`, `ownerId` |
| `upgrade_complete` | `upgradeId`, `ownerId` |
| `resource_depleted` | `resourceId`, `resourceType` |
| `player_defeated` | `playerId` |
| `player_victory` | `playerId` |

---

#### Game Over

```json
{
  "type": "game_over",
  "matchId": "match_xyz789",
  "results": [
    { "playerId": 1, "result": "win", "mmrChange": 25 },
    { "playerId": 2, "result": "loss", "mmrChange": -25 }
  ],
  "stats": {
    "duration": 1234,
    "replayId": "replay_abc123"
  }
}
```

---

### Chat

#### Send Message

```json
{
  "type": "chat",
  "channel": "match",
  "message": "gg wp"
}
```

**Channels:**
- `match` - All players in current match
- `team` - Team members only
- `spectator` - Spectators only
- `global` - Global lobby chat

---

#### Receive Message

```json
{
  "type": "chat_message",
  "channel": "match",
  "senderId": 2,
  "senderName": "Opponent",
  "message": "gg wp",
  "timestamp": 1708083700000
}
```

---

## Error Codes

| Code | Message |
|------|---------|
| `AUTH_REQUIRED` | Authentication required |
| `INVALID_TOKEN` | Invalid or expired token |
| `PLAYER_NOT_FOUND` | Player does not exist |
| `MATCH_NOT_FOUND` | Match does not exist |
| `REPLAY_NOT_FOUND` | Replay does not exist |
| `ALREADY_IN_QUEUE` | Player already in matchmaking queue |
| `NOT_IN_MATCH` | Player not in active match |
| `INVALID_ACTION` | Action validation failed |
| `RATE_LIMITED` | Too many requests |
| `SERVER_ERROR` | Internal server error |

---

## Rate Limits

| Endpoint | Limit |
|----------|-------|
| `/api/auth/*` | 10 req/min |
| `/api/players/*` | 60 req/min |
| `/api/matches/*` | 60 req/min |
| `/api/replays/*` | 30 req/min |
| WebSocket messages | 100 msg/sec |

---

## TypeScript Types

```typescript
interface Vector3 {
  x: number;
  y: number;
  z: number;
}

interface PlayerResources {
  minerals: number;
  gas: number;
  supplyUsed: number;
  supplyMax: number;
}

interface EntitySnapshot {
  id: string;
  components: Record<string, unknown>;
}

interface PlayerAction {
  type: ActionType;
  [key: string]: unknown;
}

type ActionType = 
  | 'select'
  | 'deselect'
  | 'move'
  | 'attack_move'
  | 'attack'
  | 'stop'
  | 'hold'
  | 'patrol'
  | 'build'
  | 'train'
  | 'research'
  | 'ability';

interface GameState {
  tick: number;
  entities: EntitySnapshot[];
  resources: Record<PlayerId, PlayerResources>;
}

interface MatchPreferences {
  gameMode: GameMode;
  preferredRace?: Race;
  preferredMaps?: string[];
  maxPing?: number;
}

type GameMode = 
  | 'ranked_1v1'
  | 'ranked_2v2'
  | 'casual_1v1'
  | 'casual_ffa'
  | 'custom';

type Race = 'terran' | 'protoss' | 'zerg';
```
