# MoonCraft - Game Design Document

## 1. Overview

### 1.1 Vision
MoonCraft is a competitive real-time strategy game that combines classic RTS mechanics with modern 3D graphics and seamless online multiplayer. Players command armies, manage economies, and outmaneuver opponents in fast-paced tactical battles.

### 1.2 Target Audience
- Strategy game enthusiasts (ages 13+)
- Competitive gamers seeking ranked play
- Fans of classic RTS games (StarCraft, WarCraft, Age of Empires)
- Esports viewers and participants

### 1.3 Platform
- Web browser (Chrome, Firefox, Safari, Edge)
- Desktop (future): Windows, macOS, Linux

### 1.4 Business Model
- Free-to-play
- Cosmetic microtransactions (skins, portraits, decals)
- Premium battle pass (seasonal)
- No pay-to-win elements

---

## 2. Core Gameplay

### 2.1 Game Loop

```
┌─────────────────────────────────────────────────────┐
│                   CORE GAME LOOP                     │
│                                                      │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐     │
│  │ GATHER   │───>│  BUILD   │───>│  EXPAND  │     │
│  │RESOURCES │    │   ARMY   │    │TERRITORY │     │
│  └──────────┘    └──────────┘    └──────────┘     │
│       │                               │             │
│       │         ┌──────────┐          │             │
│       └─────────│  ATTACK  │──────────┘             │
│                 │  ENEMY   │                        │
│                 └──────────┘                        │
│                                                      │
└─────────────────────────────────────────────────────┘
```

### 2.2 Victory Conditions

| Mode | Victory Condition |
|------|-------------------|
| Ranked 1v1 | Destroy all enemy structures |
| Ranked 2v2 | Destroy all enemy structures (team) |
| FFA | Last player standing |
| Custom | Configurable |

### 2.3 Game Phases

```
EARLY GAME (0:00 - 6:00)
├── Initial resource gathering
├── First structures
├── Early unit production
├── Scouting enemy position
└── Establishing economy

MID GAME (6:00 - 15:00)
├── Tech progression
├── Expansion bases
├── Army composition
├── First major engagements
└── Map control

LATE GAME (15:00+)
├── Tier 3 units
├── Hero/Ultimate abilities
├── Resource exhaustion
├── Decisive battles
└── Base trading scenarios
```

---

## 3. Factions

### 3.1 Terran (Human)

**Philosophy:** Versatile, mobile, adaptable

**Strengths:**
- Balanced unit roster
- Strong defensive capabilities
- Flexible building placement
- Excellent ranged units

**Weaknesses:**
- Units are individually weaker
- Requires good positioning
- Buildings can be destroyed when lifted

**Unique Mechanics:**
- Buildings can lift off and relocate
- Add-ons system for production structures
- Stim Pack ability (damage for speed)

#### Terran Units

| Unit | Tier | Cost | Role |
|------|------|------|------|
| SCV | 1 | 50m | Worker, repairs |
| Marine | 1 | 50m | Basic infantry |
| Marauder | 2 | 100m/25g | Anti-armor |
| Reaper | 2 | 50m/50g | Harassment |
| Siege Tank | 2 | 150m/125g | Artillery |
| Medivac | 2 | 100m/100g | Heal/Transport |
| Viking | 3 | 150m/75g | Air superiority |
| Battlecruiser | 3 | 400m/300g | Capital ship |

#### Terran Buildings

| Building | Cost | Purpose |
|----------|------|---------|
| Command Center | 400m | Main base, trains SCVs |
| Barracks | 150m | Infantry production |
| Factory | 150m/100g | Vehicle production |
| Starport | 150m/100g | Air unit production |
| Bunker | 100m | Defensive structure |
| Missile Turret | 75m | Anti-air defense |
| Engineering Bay | 125m | Infantry upgrades |
| Armory | 150m/100g | Vehicle/Ship upgrades |

---

### 3.2 Protoss (Advanced Aliens)

**Philosophy:** Powerful, expensive, technological

**Strengths:**
- Strong individual units
- Shields regenerate
- Warp-in mechanic
- Powerful spellcasters

**Weaknesses:**
- Expensive units
- Long build times
- Vulnerable to swarm tactics

**Unique Mechanics:**
- Plasma shields (regenerating HP)
- Warp-in units anywhere near Pylon
- Chrono Boost (production acceleration)

#### Protoss Units

| Unit | Tier | Cost | Role |
|------|------|------|------|
| Probe | 1 | 50m | Worker |
| Zealot | 1 | 100m | Melee warrior |
| Stalker | 2 | 125m/50g | Ranged support |
| Sentry | 2 | 50m/100g | Force fields |
| High Templar | 2 | 50m/150g | Spellcaster |
| Colossus | 3 | 300m/200g | Area damage |
| Void Ray | 3 | 250m/150g | Anti-armor air |
| Carrier | 3 | 350m/250g | Fleet carrier |

#### Protoss Buildings

| Building | Cost | Purpose |
|----------|------|---------|
| Nexus | 400m | Main base |
| Gateway | 150m | Basic unit production |
| Cybernetics Core | 150m | Air/Range upgrades |
| Robotics Facility | 200m/100g | Mechanical units |
| Stargate | 150m/150g | Air production |
| Forge | 150m | Ground upgrades |
| Twilight Council | 150m/100g | Advanced ground |
| Fleet Beacon | 300m/200g | Capital ships |

---

### 3.3 Zerg (Insectoid Swarm)

**Philosophy:** Numerous, fast, biological

**Strengths:**
- Rapid unit production
- Cheap units in bulk
- Map vision via creep
- Strong mid-game

**Weaknesses:**
- Fragile units
- Requires larva management
- Limited tech switching

**Unique Mechanics:**
- Creep spread (vision + speed bonus)
- Larva spawning (all units from larvae)
- Queen inject (production boost)

#### Zerg Units

| Unit | Tier | Cost | Role |
|------|------|------|------|
| Drone | 1 | 50m | Worker |
| Zergling | 1 | 50m (2) | Fast attacker |
| Roach | 2 | 75m/25g | Armored ground |
| Baneling | 2 | 50m/25g | Suicide bomber |
| Mutalisk | 2 | 100m/100g | Air harass |
| Infestor | 2 | 100m/150g | Spellcaster |
| Ultralisk | 3 | 300m/200g | Heavy ground |
| Brood Lord | 3 | 150m/150g | Siege air |

#### Zerg Buildings

| Building | Cost | Purpose |
|----------|------|---------|
| Hatchery | 300m | Main base |
| Spawning Pool | 200m | Zerglings |
| Roach Warren | 150m | Roaches |
| Baneling Nest | 100m/50g | Banelings |
| Hydralisk Den | 100m/100g | Hydralisks |
| Spire | 200m/200g | Air units |
| Infestation Pit | 100m/150g | Infestors |
| Hive | 150m/100g | Tier 3 unlock |

---

## 4. Resources

### 4.1 Resource Types

```
MINERALS (Primary)
├── Starting fields: 2 per base
├── Workers per patch: 2-3 optimal
├── Gather rate: 5 per trip
└── Used for: All units, basic buildings

VESPENE GAS (Secondary)
├── Starting geysers: 1 per base
├── Workers per geyser: 3 optimal
├── Gather rate: 4 per trip
└── Used for: Tech units, upgrades

SUPPLY (Population)
├── Starting supply: 0/10
├── Terran: Supply Depot (+8)
├── Protoss: Pylon (+8)
├── Zerg: Overlord (+8)
└── Max supply: 200
```

### 4.2 Economy Balance

```
Base Income Rates (saturated)
├── Minerals: ~900-1000/min
├── Gas: ~300-400/min
└── Ratio: 3:1 mineral to gas

Expansion Timing
├── Natural: 2:00-3:00
├── Third base: 6:00-8:00
└── Fourth+: 12:00+
```

---

## 5. Combat System

### 5.1 Damage Types

| Type | Bonus | Penalty |
|------|-------|---------|
| Normal | None | None |
| Explosive | +50% Large | -50% Small |
| Concussive | +50% Small | -50% Large |
| Plasma | +50% Shields | None |

### 5.2 Armor System

```
Damage = BaseDamage - (Armor × DamageReduction)

Light Armor (0 base): Marines, Zerglings
Medium Armor (1 base): Stalkers, Roaches
Heavy Armor (2+ base): Siege Tanks, Ultralisks

Armor Upgrades: +1 per level
Damage Reduction: 0.5 per armor point
```

### 5.3 Unit Classifications

```
BIOLOGICAL
├── Affected by: Heal, Psi Storm, Fungal
└── Examples: Marines, Zealots, Zerglings

MECHANICAL
├── Affected by: Repair, EMP
└── Examples: Tanks, Stalkers, Roaches

PSIONIC
├── Affected by: Feedback, Mind Control
└── Examples: Ghosts, High Templars

MASSIVE
├── Affected by: Neural Parasite
└── Examples: Battlecruisers, Carriers, Ultralisks
```

### 5.4 Combat Formations

```
CONCAVE FORMATION
├── Best for: Ranged vs Melee
├── Spreads units in arc
└── Maximizes DPS exposure

BALL FORMATION
├── Best for: Moving armies
├── Compressed unit group
└── Vulnerable to splash

LINE FORMATION
├── Best for: Choke points
├── Units in single line
└── Good for defense
```

---

## 6. Maps

### 6.1 Map Structure

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│   ┌───┐                           ┌───┐               │
│   │ P1│                           │ P2│               │
│   └───┘                           └───┘               │
│     │                               │                 │
│     ▼                               ▼                 │
│  ═══════                       ═══════                │
│  │Main │                       │Main │                │
│  ═══════                       ═══════                │
│     │                               │                 │
│     ▼                               ▼                 │
│  ┌─────┐     X           X     ┌─────┐              │
│  │ Nat │     X           X     │ Nat │              │
│  └─────┘     X    R1    X     └─────┘              │
│              X           X                          │
│         ┌─────────────────────┐                     │
│         │                     │                     │
│         │        R2           │                     │
│         │                     │                     │
│         └─────────────────────┘                     │
│                                                         │
│   X = Expansion    R = Ramp/Choke                      │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 6.2 Map Pool (Ranked)

| Map | Size | Players | Features |
|-----|------|---------|----------|
| Lost Temple | 128x128 | 2 | Classic, balanced |
| Fighting Spirit | 128x128 | 2 | Open center |
| Python | 128x128 | 2 | Island expansions |
| Circuit Breakers | 144x144 | 2 | Multiple attack paths |
| Heartbreak Ridge | 128x128 | 2 | Defensive nat |
| Tau Cross | 160x160 | 3 | FFA / 3-player |

### 6.3 Map Elements

```
├── STARTING LOCATIONS
│   ├── Command Center / Nexus / Hatchery
│   ├── 8-10 Mineral patches
│   └── 1 Vespene Geyser
│
├── EXPANSIONS
│   ├── 6-8 Mineral patches
│   └── 1 Vespene Geyser
│
├── GOLD EXPANSIONS
│   ├── 6 Rich Mineral patches (2x)
│   └── Higher risk location
│
├── XEL'NAGA TOWERS
│   └── Vision when unit nearby
│
├── RUSH DISTANCES
│   ├── Short: 30-45 seconds
│   ├── Medium: 45-60 seconds
│   └── Long: 60+ seconds
│
└── CHOKE POINTS
    ├── Narrow (1-2 units wide)
    ├── Medium (4-6 units wide)
    └── Wide (8+ units wide)
```

---

## 7. Progression Systems

### 7.1 Ranked Ladder

```
RANK TIERS
├── Bronze (0-1499 MMR)
│   └── Divisions: 3, 2, 1
├── Silver (1500-1999 MMR)
│   └── Divisions: 3, 2, 1
├── Gold (2000-2499 MMR)
│   └── Divisions: 3, 2, 1
├── Platinum (2500-2999 MMR)
│   └── Divisions: 3, 2, 1
├── Diamond (3000-3999 MMR)
│   └── Divisions: 3, 2, 1
├── Master (4000+ MMR)
│   └── Top 2% of players
└── Grandmaster
    └── Top 200 players

MMR CALCULATION
├── Base: 1000
├── Win bonus: +10 to +30
├── Loss penalty: -10 to -30
├── Streak bonus: ×1.5 after 3 wins
└── Bonus pool: +2 per day
```

### 7.2 Season Structure

```
SEASON DURATION: 3 months

MONTH 1
├── Season start
├── MMR soft reset (-20%)
└── New map pool

MONTH 2
├── Balance patch
├── Mid-season rewards
└── Featured replays

MONTH 3
├── Final push
├── Season finals qualification
└── Rewards distribution

SEASON REWARDS
├── Portrait frame (by rank)
├── Unit skins (by wins)
├── Decals (by race played)
└── Currency (by final rank)
```

### 7.3 Achievements

```
GAMEPLAY
├── First Victory - Win your first match
├── Veteran - Play 100 matches
├── Commander - Play 1000 matches
└── Warlord - Win 500 ranked matches

RACE-SPECIFIC
├── Terran Mastery - Win 100 games as Terran
├── Protoss Mastery - Win 100 games as Protoss
└── Zerg Mastery - Win 100 games as Zerg

COMBAT
├── Annihilator - Kill 10,000 units
├── Demolition - Destroy 1,000 buildings
└── No Casualties - Win without losing a unit

SPECIAL
├── Speed Demon - Win in under 5 minutes
├── Comeback King - Win after losing main
└── Perfect Game - Win without losing structures
```

---

## 8. User Interface

### 8.1 HUD Layout

```
┌─────────────────────────────────────────────────────────────┐
│  [Resources]                    [Supply]         [Time]     │
│  Minerals: 2450  Gas: 890       84/100           12:45     │
├─────────────────────────────────────────────────────────────┤
│                                                     ┌─────┐│
│                                                     │Mini ││
│                                                     │ Map ││
│                                                     │     ││
│                                                     └─────┘│
│                                                             │
│                    [GAME VIEWPORT]                          │
│                                                             │
│                                                             │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ [Unit Info]              [Selection]          [Commands]   │
│ Marine x12               [Portrait]           [Move][Attack]│
│ HP: 40/40                Selected: 12         [Stop][Hold] │
│ Attack: 6                                      [Ability]   │
└─────────────────────────────────────────────────────────────┘
```

### 8.2 Controls

```
CAMERA
├── Move: WASD / Arrow keys / Edge scroll
├── Zoom: Mouse wheel
├── Rotate: Middle mouse + drag
└── Follow unit: F1

SELECTION
├── Left click: Select
├── Left drag: Box select
├── Shift + click: Add to selection
├── Ctrl + click: Select all of type
├── Ctrl + 1-9: Create control group
└── 1-9: Select control group

COMMANDS
├── Right click: Move/Attack/Context
├── A + click: Attack move
├── S + click: Patrol
├── H: Hold position
├── Shift + command: Queue command
└── Ctrl + command: Repeating command

BUILDINGS
├── B: Open build menu
├── B + key: Build specific
└── Shift + build: Build multiple
```

### 8.3 Visual Feedback

```
SELECTION
├── Friendly: Green circle
├── Enemy: Red glow (when selected)
└── Neutral: Yellow circle

HEALTH BARS
├── Full: Green
├── Damaged: Yellow (< 50%)
├── Critical: Red (< 25%)
└── Shield: Blue overlay

ATTACK INDICATORS
├── Attack line: Red
├── Attack range: Red circle
└── Target reticle: Red X

RESOURCE INDICATORS
├── Mineral patch: Blue crystal
├── Gas geyser: Green vapor
└── Depleted: Gray
```

---

## 9. Audio Design

### 9.1 Music

```
MENU MUSIC
├── Ambient, atmospheric
├── Race selection themes
└── Volume: 30%

GAME MUSIC
├── Dynamic intensity
├── Early game: Calm, building
├── Combat: Intense, fast
└── Victory/Defeat stingers

RACE THEMES
├── Terran: Rock/Synth, military
├── Protoss: Orchestral, ethereal
└── Zerg: Organic, menacing
```

### 9.2 Sound Effects

```
UI SOUNDS
├── Click: Soft beep
├── Error: Low buzz
├── Notification: Ping
└── Message: Chime

UNIT SOUNDS
├── Selection: Unit response
├── Move: Acknowledgment
├── Attack: Battle cry
├── Death: Unit-specific
└── Ability: Unique effect

GAME SOUNDS
├── Construction: Building sounds
├── Attack: Weapon sounds
├── Explosion: Destruction
├── Alert: Warning siren
└── Victory/Defeat: Announcement
```

### 9.3 Voice Lines

```
UNIT RESPONSES (per unit)
├── Selection: 3-5 variants
├── Move: 3-5 variants
├── Attack: 2-3 variants
├── Annoyed (spam click): 3-5 easter eggs
└── Death: 1 variant

ANNOUNCER
├── Game start
├── Player defeated
├── Victory
├── Defeat
└── Nuclear launch detected
```

---

## 10. Monetization

### 10.1 Shop Categories

```
SKINS
├── Unit skins (per unit)
├── Building skins (per building)
├── Army skins (full faction)
└── Price: 500-1500 coins

PORTRAITS
├── Commander portraits
├── Achievement portraits
└── Price: 200-500 coins

SPRAYS/DECALS
├── For buildings
├── For units
└── Price: 100-200 coins

EMOTES
├── In-game chat
├── Victory screen
└── Price: 100-300 coins
```

### 10.2 Battle Pass

```
FREE TIER
├── Basic rewards
├── 10 levels
└── Limited cosmetics

PREMIUM TIER (1000 coins)
├── All free rewards
├── 100 levels
├── Exclusive skins
├── Bonus coins
└── Exclusive portrait

REWARDS PER LEVEL
├── 10 levels: Portrait/spray
├── 25 levels: Small skin
├── 50 levels: Medium skin
├── 75 levels: Large skin
└── 100 levels: Legendary skin
```

---

## 11. Technical Requirements

### 11.1 Performance Targets

| Metric | Minimum | Recommended |
|--------|---------|-------------|
| Frame Rate | 30 FPS | 60 FPS |
| Latency | < 100ms | < 50ms |
| Memory | 2 GB | 4 GB |
| GPU | WebGL 1.0 | WebGL 2.0 |
| Bandwidth | 1 Mbps | 5 Mbps |

### 11.2 Platform Support

| Browser | Version | Status |
|---------|---------|--------|
| Chrome | 90+ | Full support |
| Firefox | 88+ | Full support |
| Safari | 14+ | Full support |
| Edge | 90+ | Full support |
| Mobile | - | Not supported |

---

## 12. Future Content

### 12.1 Post-Launch Features

```
PHASE 2 (3-6 months)
├── Ranked 2v2
├── Observer mode
├── Tournament system
└── Clan support

PHASE 3 (6-12 months)
├── Campaign mode
├── Co-op missions
├── Map editor
└── Custom games browser

PHASE 4 (12+ months)
├── New race
├── New game modes
├── Esports integration
└── Mobile companion app
```

### 12.2 Content Pipeline

```
MONTHLY
├── Balance updates
├── Bug fixes
├── New portraits
└── Featured replays

QUARTERLY
├── New season
├── Map pool rotation
├── Balance patch
└── New skins

ANNUALLY
├── Major content drop
├── New units/abilities
├── Engine updates
└── Anniversary events
```

---

*Document Version: 1.0*
*Last Updated: 2026*
