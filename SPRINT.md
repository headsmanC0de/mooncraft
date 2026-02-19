# MoonCraft - Scrum Sprint Dashboard

**Sprint:** #1 - Core Gameplay
**Duration:** 7 days (Feb 18-25, 2026)
**Team:** Mr.Robot + OpenCode Agents

---

## 🎯 Sprint Goal

**Deliver playable prototype** with unit selection, movement, and basic combat

---

## 📊 Sprint Backlog

### 🔥 In Progress

| # | Story | Points | Status | Assignee | Branch |
|---|-------|--------|--------|----------|--------|
| 1 | Selection Box System | 5 | 🟡 In Progress | OpenCode Agent | `feature/selection-box` |
| 2 | Unit Rendering | 8 | ⚪ Todo | - | - |
| 3 | Pathfinding (A*) | 13 | ⚪ Todo | - | - |
| 4 | Building Placement | 8 | ⚪ Todo | - | - |
| 5 | Resource Gathering | 5 | ⚪ Todo | - | - |

**Total Points:** 39
**Velocity:** TBD

---

## 📅 Daily Standup Notes

### Day 1 (Feb 18, 2026) - Planning & Setup

**What was done:**
- ✅ Project analysis completed (PROJECT_STATUS.md)
- ✅ Scrum methodology adopted
- ✅ OpenCode agent spawned for Story #1
- ✅ Testing strategy defined
- ✅ PR created for 3D scene feature

**What's in progress:**
- 🟡 Selection Box System (OpenCode agent working)
- 🟡 Code review of feature/3d-game-scene

**Blockers:**
- None

**Next actions:**
1. Complete Selection Box implementation
2. Merge 3D scene PR
3. Start Unit Rendering story

---

## 🧪 Testing Strategy

### Test Pyramid

```
        /\
       /  \    E2E Tests (5%)
      /----\   - User flows
     /      \  - Critical paths
    /--------\ Integration Tests (15%)
   /          \ - System integration
  /------------\ Unit Tests (80%)
 /              \ - Logic
/________________\ - Edge cases
```

### Coverage Requirements

| Type | Coverage | Tools |
|------|----------|-------|
| Unit | 80%+ | Vitest |
| Integration | 60%+ | Vitest + Testing Library |
| E2E | Critical paths | Playwright (planned) |

---

## 📋 Definition of Done (DoD)

### Code Quality
- [ ] TypeScript strict mode passes
- [ ] ESLint passes
- [ ] File size < 450 lines
- [ ] No over-engineering
- [ ] Follows KISS, DRY, SSOT principles

### Testing
- [ ] Unit tests written (TDD)
- [ ] Edge cases covered
- [ ] Error handling tested
- [ ] Integration tests (if needed)
- [ ] E2E tests for user flows

### Documentation
- [ ] Code comments for complex logic
- [ ] API documentation updated
- [ ] README updated (if needed)

### Review
- [ ] Self-review completed
- [ ] Code review by peer
- [ ] Tests reviewed
- [ ] No legacy code introduced

### Deployment
- [ ] Branch merged to develop
- [ ] CI/CD passes
- [ ] Deployed to staging
- [ ] Manual testing passed

---

## 🔄 Git Workflow

### Branch Strategy

```
main (protected)
├── develop
│   ├── feature/selection-box
│   ├── feature/unit-rendering
│   ├── feature/pathfinding
│   └── feature/building-placement
└── hotfix/*
```

### Commit Convention

```
feat: Add new feature
fix: Fix bug
refactor: Refactor code
test: Add/update tests
docs: Update documentation
chore: Maintenance tasks
```

### PR Process

1. Create feature branch from `develop`
2. Implement with tests (TDD)
3. Create PR to `develop`
4. Code review required
5. All tests must pass
6. Squash merge
7. Delete feature branch

---

## 🤖 Agent Assignments

| Agent | Role | Current Task |
|-------|------|--------------|
| **OpenCode (glm-5-free)** | Developer | Selection Box System |
| **Test Explorer** | QA | Testing best practices (pending spawn) |
| **Code Reviewer** | Senior Dev | Review PRs (pending spawn) |
| **Legacy Hunter** | Tech Lead | Find legacy/debt (pending spawn) |

---

## 📈 Velocity Tracking

| Sprint | Planned | Completed | Velocity |
|--------|---------|-----------|----------|
| Sprint 1 | 39 | ? | TBD |

---

## 🚧 Impediments

| # | Issue | Impact | Resolution | Status |
|---|-------|--------|------------|--------|
| 1 | No 3D models | Blocks polish | Use primitives | ✅ Resolved |
| 2 | No test infrastructure | Blocks TDD | Setup Vitest | 🔴 Open |

---

## 📝 Retrospective (End of Sprint)

### What went well
- TBD

### What could be improved
- TBD

### Action items for next sprint
- TBD

---

## 🔗 Links

- **GitHub:** https://github.com/headsmanC0de/mooncraft
- **Project Status:** PROJECT_STATUS.md
- **Tech Spec:** docs/tz.md
- **Architecture:** docs/architecture.md

---

_Updated: Feb 18, 2026 by Mr.Robot 🤖_
