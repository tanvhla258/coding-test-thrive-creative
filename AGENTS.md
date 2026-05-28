<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Developer Exercise — Customer Notes CRM

This is a **developer assessment exercise**, not production code. The task is to wire a UI shell to MySQL by replacing flat-file I/O with real database queries.

## Setup

```bash
docker compose up -d          # MySQL 8 on localhost:3306 (test/test/test)
yarn install
yarn start                     # dev mode on 0.0.0.0:3000
```

## Key Facts

- **All work is marked with `// TODO` comments** in the codebase
- **Shell data in `app/page.tsx` is intentionally different from DB seed data** to verify correct wiring
- **No ORM installed** — choose your own (`mysql2`, Prisma, Drizzle, etc.)
- **`lib/db.ts`** currently reads/writes JSON files from `data/` — replace with MySQL queries
- **`data/` folder** contains JSON seed data that matches the MySQL schema in `db/init.sql`

## Database

Three tables: `customers`, `notes`, `ticket_statuses`. Schema in `prisma/schema.prisma`, seed data in `db/init.sql`.

**Prisma is configured** — use these yarn scripts (do NOT run `npx prisma` directly):

| Command | Purpose |
|---------|---------|
| `yarn db:push` | Push schema to database |
| `yarn db:migrate` | Run migrations |
| `yarn db:seed` | Seed database |
| `yarn db:generate` | Regenerate Prisma client types |
| `yarn db:studio` | Open Prisma Studio |
| `yarn db:reset` | Reset and re-migrate |

## API Routes to Implement

| Route | Requirements |
|-------|-------------|
| `app/api/customers/route.ts` | GET with `?phone=` filter |
| `app/api/notes/route.ts` | GET filtered by `?customerId=`, POST to create |
| `app/api/statuses/route.ts` | GET all ticket statuses |

## Stack

Next.js 16 (App Router), React 19, TypeScript strict mode, Tailwind CSS v4. Path alias: `@/*` maps to project root.

## Development Notes

- **`yarn start` runs dev mode** (not production) — binds to `0.0.0.0:3000`
- **No test/lint/typecheck scripts** are configured in package.json
- **Verification**: Shell data in `app/page.tsx` differs from DB seed data to confirm correct wiring
- **TypeScript strict mode** is enabled — all types must be explicit
