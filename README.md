# MoonCraft

Online RTS (Real-Time Strategy) game inspired by StarCraft/WarCraft.

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript 5.9
- **3D Engine**: Three.js + React Three Fiber
- **State Management**: Zustand
- **Database**: PostgreSQL + Drizzle ORM
- **Multiplayer**: WebSocket

## Features

- Real-time multiplayer battles
- 3D isometric graphics
- Unit & building systems
- Resource gathering (Minerals, Gas)
- Matchmaking & ranking
- Replay system

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Architecture

See [docs/architecture.md](docs/architecture.md) for system design.

## Documentation

- [Technical Specification (ТЗ)](docs/tz.md)
- [Architecture](docs/architecture.md)
- [API Reference](docs/api.md)
- [Game Design Document](docs/gdd.md)

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run lint` | ESLint check |
| `npm run typecheck` | TypeScript check |
| `npm run test` | Run tests |
| `npm run db:studio` | Drizzle Studio |

## License

MIT
