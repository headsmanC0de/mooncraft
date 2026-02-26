# MoonCraft Legacy Analysis Report

**Generated:** 2026-02-19
**Agent:** Legacy Hunter (Agent 4)
**Codebase:** sandbox/apps/games/mooncraft

---

## Executive Summary

| Metric | Value |
|--------|-------|
| **Total Files** | 17 source files |
| **Total LOC** | 1,498 lines |
| **Files >450 lines** | 0 |
| **Critical Issues** | 4 |
| **Warnings** | 8 |
| **Suggestions** | 5 |

**Overall Health:** 🟡 **Fair** - Early stage codebase with some technical debt

---

## Critical Issues

### 1. Missing Import - `useThree`
**File:** `src/components/3d/GameScene.tsx:68`
```
Cannot find name 'useThree'
```
**Fix:** Add `import { useThree } from '@react-three/fiber'`

### 2. Duplicate `'use client'` Directive
**File:** `src/components/3d/GameScene.tsx:1,3`
```typescript
'use client'

'use client'  // <-- Duplicate
```
**Fix:** Remove duplicate directive

### 3. Missing Page - `/docs`
**File:** `src/app/page.tsx:24`
- Links to `/docs` but page doesn't exist
**Fix:** Create `src/app/docs/page.tsx` or remove the link

### 4. Unused Import in CombatSystem
**File:** `src/lib/ecs/systems/CombatSystem.ts:7`
```typescript
import { componentManager, entityManager } from '../index'
// componentManager imported but never used
```
**Fix:** Remove unused import

---

## Warnings

### Code Duplication

| Location | Issue | Lines Duplicated |
|----------|-------|------------------|
| `SelectionBox.tsx:12-17` | `normalizeBox` logic reimplemented inline | ~6 lines |

**Existing utility:** `selectionUtils.ts:14-25` already exports `normalizeBox()`

**Recommendation:** Import from utils:
```typescript
// SelectionBox.tsx
import { normalizeBox } from '@/utils/selectionUtils'
```

### Unused Types

**File:** `src/types/ecs.ts`

| Type | Lines | Status |
|------|-------|--------|
| `SyncMessage` | 143-148 | Defined but never used |
| `EntityState` | 150-153 | Defined but never used |
| `ComponentSnapshot` | 155-166 | Defined but never used |
| `InputMessage` | 168-173 | Defined but never used |
| `PlayerAction` | 134-141 | Partially used (only types referenced) |

**Recommendation:** Either implement multiplayer or remove these types to reduce noise.

### Unused Component Types

Defined in `ecs.ts` but no systems implemented:

| Component | System Status |
|-----------|---------------|
| `AnimationComponent` | No AnimationSystem |
| `RenderComponent` | No RenderSystem |
| `ResourceComponent` | No ResourceSystem |
| `BuildingComponent` | No BuildingSystem |

**Recommendation:** Keep if planned for near future, otherwise remove.

---

## Suggestions

### 1. Extract `RTSCamera` to Separate File
**File:** `src/components/3d/GameScene.tsx:67-111`
- Camera logic is 45 lines embedded in GameScene
- Could be `src/components/3d/RTSCamera.tsx`

### 2. Extract `Terrain` to Separate File
**File:** `src/components/3d/GameScene.tsx:12-65`
- Terrain component is 54 lines
- Could be `src/components/3d/Terrain.tsx`

### 3. TODO Comment Needs Resolution
**File:** `src/stores/gameStore.ts:74`
```typescript
// TODO: Use proper factory pattern
```
**Status:** Open TODO from initial implementation

### 4. Consider Event System
**Current:** Systems don't communicate
**Suggestion:** Add EventBus for system-to-system events (death, damage, etc.)

### 5. Add Empty Directory Placeholders
Missing directories listed in PROJECT_STATUS.md:
- `src/components/ui/` - Empty
- `src/lib/game/` - Empty
- `src/lib/network/` - Empty
- `src/lib/utils/` - Empty
- `src/hooks/` - Only has useSelectionBox

---

## File Size Analysis

All files under 450 lines threshold:

| File | Lines | Status |
|------|-------|--------|
| `types/ecs.ts` | 195 | OK |
| `components/3d/GameScene.tsx` | 169 | OK |
| `stores/gameStore.ts` | 159 | OK |
| `components/3d/__tests__/SelectionBox.test.ts` | 155 | OK |
| `lib/ecs/EntityManager.ts` | 137 | OK |
| `lib/ecs/ComponentManager.ts` | 107 | OK |
| `lib/ecs/systems/CombatSystem.ts` | 94 | OK |
| `utils/selectionUtils.ts` | 93 | OK |
| `hooks/useSelectionBox.ts` | 92 | OK |
| `lib/ecs/SystemManager.ts` | 87 | OK |
| `app/page.tsx` | 62 | OK |
| `components/3d/SelectionBox.tsx` | 57 | OK |
| `lib/ecs/systems/MovementSystem.ts` | 54 | OK |
| `app/layout.tsx` | 19 | OK |
| `lib/ecs/index.ts` | 12 | OK |
| `app/game/page.tsx` | 5 | OK |
| `test/setup.ts` | 1 | OK |

---

## TypeScript Configuration Issues

```
tailwind.config.ts(1,29): error TS2307: Cannot find module 'tailwindcss'
```
**Fix:** Install types or update tsconfig to exclude config files from type checking.

---

## Quick Fixes Summary

```bash
# 1. Fix missing useThree import in GameScene.tsx
# Add: import { useThree } from '@react-three/fiber'

# 2. Remove duplicate 'use client' in GameScene.tsx

# 3. Remove unused import in CombatSystem.ts
# Remove: componentManager from imports

# 4. Either create /docs page or remove link from home page
```

---

## Action Items

| Priority | Task | Effort |
|----------|------|--------|
| P0 | Fix useThree import | 1 min |
| P0 | Remove duplicate directive | 1 min |
| P1 | Fix unused imports | 2 min |
| P1 | Create/remove /docs page | 15 min |
| P2 | Deduplicate normalizeBox logic | 5 min |
| P3 | Remove unused network types | 10 min |
| P3 | Resolve TODO comment | 30 min |

---

_Report generated by Legacy Hunter Agent_
