# MoonCraft Testing Guide

Quick reference for running tests in the MoonCraft project.

## Unit Tests (Vitest)

```bash
# Run tests in watch mode
npm run test

# Run tests with coverage
npm run test:coverage

# Run specific test file
npx vitest run src/utils/__tests__/selectionUtils.test.ts
```

## E2E Tests (Playwright)

```bash
# Install Playwright browsers (first time only)
npx playwright install

# Run all E2E tests
npm run test:e2e

# Run with UI for debugging
npm run test:e2e:ui

# Run specific browser
npx playwright test --project=chromium

# Debug mode
npm run test:e2e:debug
```

## Test Structure

```
src/
├── __tests__/           # Unit tests next to source files
├── test/
│   ├── setup.ts         # Global test setup
│   ├── r3f-test-utils.ts    # Three.js/R3F helpers
│   └── ecs-test-utils.ts    # ECS testing helpers

e2e/
├── utils/
│   └── game-helpers.ts  # Playwright helpers
└── *.spec.ts            # E2E test files
```

## Writing Tests

### Unit Test Example

```typescript
import { describe, it, expect } from 'vitest'
import { createTestCamera, createMockCanvas } from '@/test/r3f-test-utils'

describe('MyComponent', () => {
  it('should do something', () => {
    // Arrange
    const camera = createTestCamera()
    const canvas = createMockCanvas()
    
    // Act
    const result = someFunction(camera, canvas)
    
    // Assert
    expect(result).toBe(expected)
  })
})
```

### E2E Test Example

```typescript
import { test, expect } from '@playwright/test'
import { setupGameTest, dragSelect } from './utils/game-helpers'

test('should select units', async ({ page }) => {
  await setupGameTest(page)
  
  await dragSelect(page, {
    start: { x: 100, y: 100 },
    end: { x: 300, y: 300 },
  })
  
  // Assert something
})
```

## Coverage Goals

| Layer | Target |
|-------|--------|
| Utilities | 100% |
| ECS Systems | 90%+ |
| Game Store | 90%+ |
| Hooks | 80%+ |
| Components | 70%+ |
