# MoonCraft Testing Research & Strategy

> **Research Date:** February 2026  
> **Project:** MoonCraft RTS Game (React Three Fiber + Three.js)  
> **Current Framework:** Vitest

---

## Executive Summary

This document outlines the testing strategy for MoonCraft, an RTS game built with React Three Fiber (R3F) and Three.js. The testing approach combines:

1. **Unit Testing** (Vitest) - For pure logic, utilities, and game state
2. **Component Testing** (Vitest + @react-three/test-renderer) - For R3F components
3. **E2E Testing** (Playwright) - For full game flows and 3D interactions

---

## Research Findings

### 1. React Three Fiber Testing Approaches

#### @react-three/test-renderer (RTTR)

**Official testing library from PMNDRS**

```bash
npm install -D @react-three/test-renderer
```

**Pros:**
- Official R3F testing solution
- Works without WebGL/browser
- Testing library agnostic (works with Vitest, Jest)
- Can inspect scene graph directly

**Cons:**
- Experimental status
- Limited interaction testing
- No visual validation

**Best For:** Unit testing R3F component structure and scene graph

**Example:**
```typescript
import { create } from '@react-three/test-renderer'
import { expect, test } from 'vitest'

test('mesh renders with correct geometry', async () => {
  const renderer = await create(<MyComponent />)
  
  // Access scene graph
  const mesh = renderer.scene.children[0]
  expect(mesh.type).toBe('Mesh')
})
```

#### Direct Three.js Object Testing (Current Approach)

**What we're already using:**
- Create real Three.js objects (cameras, vectors)
- Test utility functions with real objects
- No mocking of Three.js internals

**Pros:**
- Fast execution
- No WebGL required
- Tests real behavior
- Easy to debug

**Cons:**
- Limited to pure functions
- Can't test rendering
- Can't test interactions directly

**Recommendation:** Continue this approach for utility functions (selectionUtils, coordinate math, etc.)

---

### 2. E2E Testing for 3D Applications

#### Playwright vs Cypress

| Feature | Playwright | Cypress |
|---------|-----------|---------|
| WebGL Support | ✅ Good | ⚠️ Limited |
| Multi-browser | ✅ Chromium, Firefox, WebKit | ⚠️ Chromium-based |
| GPU in CI | ✅ Possible with config | ❌ Difficult |
| Canvas Interactions | ✅ Coordinate-based | ⚠️ Limited |
| Speed | ✅ Fast | ⚠️ Slower |
| Debugging | ✅ Trace viewer | ✅ Time travel |

**Winner: Playwright**

**Key findings from research:**

1. **WebKit requires headed mode for GPU** - Headless WebKit doesn't support hardware acceleration
2. **Chrome flags for WebGL** - Use `--use-gl=egl` and `--ignore-gpu-blocklist`
3. **Canvas interactions** - Use coordinate-based mouse operations
4. **3D object selection** - Expose game state to window for E2E access

---

### 3. Performance Testing

#### Tools Available:

1. **Browser DevTools Performance API** - Built-in, accurate
2. **Spector.js** - WebGL debugging
3. **stats-gl** - Real-time WebGL monitoring
4. **Custom FPS measurement** - Via `requestAnimationFrame`

**Recommended Approach:**
```typescript
// Measure FPS in E2E tests
const fps = await page.evaluate(() => {
  return new Promise(resolve => {
    const frames = []
    let lastTime = performance.now()
    
    function measure() {
      const now = performance.now()
      frames.push(1000 / (now - lastTime))
      lastTime = now
      
      if (frames.length < 60) {
        requestAnimationFrame(measure)
      } else {
        resolve({
          avg: frames.reduce((a, b) => a + b) / frames.length,
          min: Math.min(...frames),
          max: Math.max(...frames),
        })
      }
    }
    requestAnimationFrame(measure)
  })
})
```

---

## Recommended Test Stack

```
┌─────────────────────────────────────────────────────────────┐
│                    TESTING PYRAMID                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                      E2E Tests                              │
│                    (Playwright)                             │
│              - Full game flows                              │
│              - Visual regression                            │
│              - Performance benchmarks                       │
│                                                             │
│                 Component Tests                             │
│         (Vitest + @react-three/test-renderer)              │
│              - R3F component structure                      │
│              - Scene graph validation                       │
│              - Hook behavior                                │
│                                                             │
│                    Unit Tests                               │
│                     (Vitest)                                │
│              - Utility functions                            │
│              - Game logic                                   │
│              - ECS systems                                  │
│              - State management                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Dependencies

```json
{
  "devDependencies": {
    // Unit & Component Testing
    "vitest": "^4.0.18",
    "@testing-library/jest-dom": "^6.9.1",
    "@testing-library/react": "^16.3.2",
    "@react-three/test-renderer": "^9.1.0",
    "jsdom": "^28.1.0",
    
    // E2E Testing
    "@playwright/test": "^1.50.0"
  }
}
```

---

## Coverage Strategy

### What to Test

| Layer | Coverage Target | Focus Areas |
|-------|-----------------|-------------|
| **Utilities** | 100% | selectionUtils, coordinate math, formatters |
| **ECS Systems** | 90%+ | Movement, Combat, Resource gathering |
| **Game Store** | 90%+ | State transitions, actions, selectors |
| **Hooks** | 80%+ | useSelectionBox, useGameLoop |
| **Components** | 70%+ | Key interactions, not visual details |
| **E2E** | Critical paths | Game load, selection, movement |

### What NOT to Test

- ❌ Three.js internals (trusted library)
- ❌ R3F rendering (visual = E2E/screenshot)
- ❌ Drei components (trusted library)
- ❌ Simple getters/setters

---

## Test Structure

```
mooncraft/
├── src/
│   ├── test/
│   │   ├── setup.ts              # Global test setup
│   │   ├── r3f-test-utils.ts     # R3F/Three.js helpers
│   │   └── ecs-test-utils.ts     # ECS testing helpers
│   │
│   ├── utils/
│   │   └── __tests__/
│   │       └── selectionUtils.test.ts
│   │
│   ├── stores/
│   │   └── __tests__/
│   │       └── gameStore.test.ts
│   │
│   ├── hooks/
│   │   └── __tests__/
│   │       └── useSelectionBox.test.ts
│   │
│   └── lib/ecs/
│       └── __tests__/
│           ├── EntityManager.test.ts
│           ├── MovementSystem.test.ts
│           └── CombatSystem.test.ts
│
├── e2e/
│   ├── utils/
│   │   └── game-helpers.ts       # Playwright helpers
│   ├── game-scene.spec.ts        # Core game tests
│   └── selection-box.spec.ts     # Selection tests
│
├── vitest.config.ts
└── playwright.config.ts
```

---

## Performance Testing Approach

### 1. FPS Benchmarks

```typescript
test('should maintain 60 FPS with 100 units', async ({ page }) => {
  await setupGameTest(page)
  await spawnUnits(page, 100)
  
  const fps = await measureFPS(page, 5000)
  
  expect(fps.avg).toBeGreaterThan(55)
  expect(fps.min).toBeGreaterThan(30)
})
```

### 2. Load Time Benchmarks

```typescript
test('should load game within 3 seconds', async ({ page }) => {
  const start = Date.now()
  await page.goto('/game')
  await waitForGameReady(page)
  
  expect(Date.now() - start).toBeLessThan(3000)
})
```

### 3. Memory Leak Detection

```typescript
test('should not leak memory during gameplay', async ({ page }) => {
  await setupGameTest(page)
  
  const initialMemory = await getMemoryUsage(page)
  
  // Play for 1 minute
  await simulateGameplay(page, 60000)
  
  const finalMemory = await getMemoryUsage(page)
  
  // Memory should not grow more than 50%
  expect(finalMemory).toBeLessThan(initialMemory * 1.5)
})
```

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v4

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run build
      - run: npx playwright test
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

---

## Key Takeaways

### Do's ✅

1. **Test logic, not rendering** - Extract pure functions for unit tests
2. **Use real Three.js objects** - Don't mock what you don't need to
3. **Expose game state for E2E** - `window.__MOONCRAFT_STORE__`
4. **Coordinate-based canvas interactions** - Playwright clicks by position
5. **Separate concerns** - Unit tests for logic, E2E for flows

### Don'ts ❌

1. **Don't mock Three.js** - Use real objects, they work in Node
2. **Don't test visual output in unit tests** - Use E2E screenshots
3. **Don't skip GPU setup in CI** - WebGL needs hardware acceleration
4. **Don't test R3F internals** - Trust the library
5. **Don't forget WebKit headed mode** - Required for GPU

---

## Next Steps

1. **Install Playwright:**
   ```bash
   npm install -D @playwright/test
   npx playwright install
   ```

2. **Install R3F Test Renderer:**
   ```bash
   npm install -D @react-three/test-renderer
   ```

3. **Add test scripts to package.json:**
   ```json
   {
     "scripts": {
       "test": "vitest",
       "test:coverage": "vitest --coverage",
       "test:e2e": "playwright test",
       "test:e2e:ui": "playwright test --ui"
     }
   }
   ```

4. **Create missing test files:**
   - `src/stores/__tests__/gameStore.test.ts`
   - `src/hooks/__tests__/useSelectionBox.test.ts`
   - `src/lib/ecs/__tests__/` (all systems)

5. **Expose store for E2E testing:**
   Add to `gameStore.ts`:
   ```typescript
   if (typeof window !== 'undefined') {
     (window as any).__MOONCRAFT_STORE__ = useGameStore
   }
   ```

---

## References

- [React Three Fiber Testing Docs](https://r3f.docs.pmnd.rs/api/testing)
- [@react-three/test-renderer](https://www.npmjs.com/package/@react-three/test-renderer)
- [Testing 3D Applications with Playwright on GPU](https://blog.promaton.com/testing-3d-applications-with-playwright-on-gpu-1e9cfc8b54a9)
- [Vitest Browser Mode](https://vitest.dev/guide/browser/)
- [Playwright Canvas Testing](https://github.com/satelllte/playwright-canvas)
- [100 Three.js Performance Tips](https://www.utsubo.com/blog/threejs-best-practices-100-tips)
