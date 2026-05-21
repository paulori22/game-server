# game-server

Backend API for managing per-game leaderboards. Each game defines its own score fields (for example `score`, `wave`, `timeMs`), and clients submit and query ranked entries by slug. Built with [NestJS](https://nestjs.com), PostgreSQL, and TypeORM.

## Features

- **Multi-game registry** — Register games with a unique slug, display name, and a JSON field schema (`number` or `string` columns).
- **Configurable sorting** — Each game has a default sort field and order; leaderboard queries can override `sortBy`, `order`, `limit`, and `offset`.
- **Leaderboard entries** — One entry per player per game; submission validates payload fields against that game's schema.
- **API key auth** — All routes except `GET /health` require an `X-API-KEY` header matching a key in `AUTHORIZED_API_KEYS`.
- **PostgreSQL** — JSONB storage for flexible per-game fields; schema sync in development only.

## API overview

| Method  | Path                                   | Description                                                      |
| ------- | -------------------------------------- | ---------------------------------------------------------------- |
| `GET`   | `/health`                              | Health check (no API key)                                        |
| `POST`  | `/games`                               | Create a game                                                    |
| `GET`   | `/games`                               | List all games                                                   |
| `GET`   | `/games/:slug`                         | Get a game by slug                                               |
| `PATCH` | `/games/:slug`                         | Update a game                                                    |
| `POST`  | `/games/:slug/leaderboard`             | Submit a leaderboard entry                                       |
| `GET`   | `/games/:slug/leaderboard`             | Ranked leaderboard (query: `sortBy`, `order`, `limit`, `offset`) |
| `GET`   | `/games/:slug/leaderboard/:playerName` | Lookup one player's entry                                        |

Send the API key on every protected request:

```http
X-API-KEY: your-api-key
```

### Example: create a game

```bash
curl -X POST http://localhost:3000/games \
  -H "Content-Type: application/json" \
  -H "X-API-KEY: apikeypass" \
  -d '{
    "slug": "laser-defender",
    "name": "Laser Defender",
    "fieldsSchema": [
      { "name": "score", "type": "number" },
      { "name": "wave", "type": "number" }
    ],
    "defaultSortField": "score",
    "defaultSortOrder": "DESC"
  }'
```

### Example: submit a score

```bash
curl -X POST http://localhost:3000/games/laser-defender/leaderboard \
  -H "Content-Type: application/json" \
  -H "X-API-KEY: apikeypass" \
  -d '{
    "playerName": "alice",
    "data": { "score": 12500, "wave": 7 }
  }'
```

## Prerequisites

- Node.js 20+
- PostgreSQL 16 (or use Docker Compose below)

## Configuration

Copy `.env.example` to `.env` and adjust values:

| Variable                                                          | Description                                          |
| ----------------------------------------------------------------- | ---------------------------------------------------- |
| `APP_PORT`                                                        | HTTP port (default `3000`)                           |
| `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD` | PostgreSQL connection                                |
| `DB_SSL`                                                          | Set `true` for SSL connections                       |
| `AUTHORIZED_API_KEYS`                                             | Comma-separated list of valid API keys               |
| `HOST_UID`, `HOST_GID`                                            | Linux only: match bind-mount ownership in Docker dev |

## Running locally

```bash
npm install
npm run start:dev
```

The app listens on `APP_PORT` (default `3000`). In development, TypeORM `synchronize` is enabled so tables are created/updated automatically.

## Docker

**Development** (app + Postgres, hot reload):

```bash
docker compose up --build
```

The app service sets `DB_HOST=db` on the Compose network. Postgres data is stored in `.docker/dbdata`. If you change `DB_*` credentials, delete that folder so Postgres re-initializes.

**Production**:

```bash
docker compose -f docker-compose-prod.yaml up --build
```

Production uses `.docker/dbdata-prod` for Postgres data. Set a strong `AUTHORIZED_API_KEYS` value before deploying.

On Linux, set `HOST_UID` and `HOST_GID` in `.env` to your user id (`id -u` / `id -g`) so the dev container can write to the bind-mounted checkout.

## Scripts

| Command                                             | Description                                                   |
| --------------------------------------------------- | ------------------------------------------------------------- |
| `npm run start`                                     | Start once                                                    |
| `npm run start:dev`                                 | Start with watch mode (`NODE_ENV=development`)                |
| `npm run start:prod`                                | Run compiled `dist/main` (`NODE_ENV=production`)              |
| `npm run build`                                     | Compile TypeScript                                            |
| `npm run test`                                      | Unit tests                                                    |
| `npm run test:e2e`                                  | End-to-end tests                                              |
| `npm run lint`                                      | ESLint with auto-fix                                          |
| `npm run migration:generate -- src/migrations/Name` | Generate a migration from entity changes (requires DB access) |
| `npm run migration:run`                             | Apply pending migrations (uses `.env` / `DB_*`)               |
| `npm run migration:run:prod`                        | Build, then run migrations from compiled `dist/`              |
| `npm run migration:show`                            | List migration status                                         |
| `npm run migration:revert`                          | Revert the last migration                                     |

## Database migrations

Schema auto-sync runs only in development. Production uses TypeORM migrations.

**Apply migrations locally** (uses `.env`):

```bash
npm run migration:run
```

**Apply migrations to production** (load prod DB credentials first):

```bash
DOTENV_CONFIG_PATH=.env.production.local npm run migration:run:prod
```

Or without building, if you already have dev dependencies installed:

```bash
DOTENV_CONFIG_PATH=.env.production.local npm run migration:run
```

Ensure `DB_SSL=true` for managed Postgres (e.g. Neon). Check status with:

```bash
DOTENV_CONFIG_PATH=.env.production.local npm run migration:show
```

**Generate a new migration** after changing entities (point at a DB that reflects the current schema, or an empty DB):

```bash
npm run migration:generate -- src/migrations/DescribeYourChange
```

If production already has the tables (e.g. from an earlier deploy) but no migration history, insert a row into `typeorm_migrations` for `InitialSchema1779326692838` instead of running `migration:run`, so later migrations apply cleanly.

## Project layout

```
src/
  games/          Game registry (slug, field schema, defaults)
  leaderboard/    Entries and ranking per game slug
  auth/           API key validation (Passport header strategy)
  config/         Database and TypeORM configuration
  middleware/     Global API key middleware
```
