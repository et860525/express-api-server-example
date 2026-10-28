# CLAUDE.md

Project guidelines for Claude Code. Follow these rules when modifying this repository.

## Stack

Bun + Express 5 + TypeScript + Prisma + MariaDB/MySQL + Zod + Biome + Winston.

## Commands

```bash
bun install
bun dev
bun run typecheck
bun run check
bun run ci

bunx prisma generate
bun prisma migrate dev --name <desc>
bun run db:deploy

bun run docker:up
bun run docker:down
```

- No test suite currently exists. Do not run or invent `bun test`.
- `src/generated/prisma/` is gitignored. Run `bunx prisma generate` after cloning or changing Prisma schemas.

## Architecture

Every feature module follows:

```text
Routes → Controller → Logic → Service
```

- `*.routes.ts`: routes + `@openapi` JSDoc only.
- `*.controller.ts`: thin HTTP adapter. Never access Prisma directly.
- `*.logic.ts`: Zod validation + business rules. Return expected errors as `ApiResponse`; only unexpected errors should throw.
- `*.service.ts`: only layer allowed to access Prisma. Support `tx?: PrismaExecutor` where appropriate.

Reference: `src/api/auth/`.

## Express 5

Rejected async handlers automatically reach the global error handler.

Do not add unnecessary `try/catch`, `next(error)`, or async wrapper utilities only for error forwarding.

## Prisma

Models are split by domain, e.g. `prisma/user.prisma`.

Do not add application models to `prisma/schema.prisma`; it is reserved for generator/datasource config.

After schema changes:

```bash
bunx prisma generate
```

## Environment

`src/env.ts` validates environment variables.

In `app.ts`, this must remain the first import:

```ts
import env from "./env.ts";
```

Do not move it below other imports.

## Dev / Production

Preserve these differences:

| Feature | Dev | Production |
|---|---|---|
| Logging | `morgan("dev")` | Winston request logger |
| Winston level | `debug` | `info` |
| CORS | Allow all | Require `CORS_ORIGIN` |
| `/api-docs` | Enabled | Disabled |

Do not change production Winston level to `warn`.

## Error Handling / Shutdown

- Global error handler: `src/middleware/error_handler.ts`
- Keep it mounted last.
- Production responses must not expose internal error details.
- Preserve SIGTERM/SIGINT graceful shutdown:
  - stop new connections
  - drain requests
  - `prisma.$disconnect()`
  - 10s forced-exit fallback

## Health Checks

Keep these separate:

- `/` = app liveness
- `/health` = DB health via `SELECT 1`, returns `503` if DB is unavailable

## Docker

Both:

```text
db/docker-compose.yaml
docker-compose.yaml
```

must use the same project/network names:

```text
express-api-server
express-api-server-network
```

If renaming, use:

```bash
./scripts/rename-project.sh <new-name>
```

Do not rename one side independently.

## Backups

Backup cron jobs are in:

```text
db/backup/
backup-uploads/
```

Cron files must contain:

```text
TZ=Asia/Taipei
```

See `DB_RESTORE.md` and `LOGGING.md` for operational details.

## Language

AI 回覆完成後，盡量使用繁體中文。

## Style

Use Biome as the formatter/linter source of truth.

Prefer existing project patterns over introducing new abstractions.

Before finishing changes, run:

```bash
bun run typecheck
bun run ci
```