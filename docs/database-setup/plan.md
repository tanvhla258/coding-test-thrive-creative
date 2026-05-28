# Database Setup - Implementation Plan

## Overview

Set up Prisma ORM with MySQL for the Customer Notes CRM exercise. Replace the current flat-file JSON I/O in `lib/db.ts` with a proper Prisma layer, create migrations from the existing `db/init.sql` schema, generate a seed file, and add convenience npm scripts for database interaction.

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌──────────┐
│  Next.js App │────▶│ Prisma Client│────▶│  MySQL 8 │
│  API Routes  │     │  (lib/db.ts) │     │ (Docker) │
└─────────────┘     └──────────────┘     └──────────┘
                           │
                    ┌──────┴──────┐
                    │ prisma/     │
                    │  schema.prisma
                    │  migrations/
                    │  seed.ts    │
                    └─────────────┘
```

- **Prisma schema** mirrors the 3 tables: `customers`, `notes`, `ticket_statuses`
- **Migrations** are generated from the schema and applied via `prisma migrate`
- **Seed file** populates the same data currently in `db/init.sql`
- **`lib/db.ts`** exports a singleton `PrismaClient` instance

## Technical Decisions

- **Prisma over Drizzle/Kysely**: User preference; excellent DX, type-safe client, built-in migrations, and seeding
- **Keep `db/init.sql`**: Retain for Docker-based direct MySQL initialization as a fallback; Prisma migrations are the primary schema source going forward
- **Seed in TypeScript**: Prisma supports TS seed files natively via `ts-node`/`tsx`
- **Singleton client pattern**: Prevent multiple `PrismaClient` instances in dev (hot-reload safe)

## Implementation Strategy

1. Install `prisma` (dev) and `@prisma/client` (prod)
2. Initialize Prisma with `npx prisma init --datasource-provider mysql`
3. Write `prisma/schema.prisma` matching the 3 tables from `db/init.sql`
4. Create `.env` with `DATABASE_URL=mysql://test:test@localhost:3306/test`
5. Generate initial migration: `npx prisma migrate dev --name init`
6. Write `prisma/seed.ts` with the same seed data from `db/init.sql`
7. Update `lib/db.ts` to export a singleton `PrismaClient`
8. Add scripts to `package.json`: `db:migrate`, `db:seed`, `db:studio`, `db:push`, `db:generate`, `db:reset`
9. Add `prisma.seed` config to `package.json`

## Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Docker MySQL not running when migrations execute | Document `docker compose up -d` as prerequisite; add healthcheck wait |
| `db/init.sql` conflicts with Prisma migrations on fresh Docker volume | Remove `init.sql` volume mount from docker-compose after Prisma is the source of truth, or keep both and ensure idempotency |
| Prisma Client not generated after `yarn install` | Add `postinstall` script: `prisma generate` |
| ENUM type differences between MySQL and Prisma | Prisma supports MySQL enums natively — no issue |
