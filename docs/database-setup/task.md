# Database Setup - Task Breakdown

## Overview

Set up Prisma ORM with MySQL, create migrations, generate seed data, and add database interaction scripts to package.json.

## Phase 1: Prisma Installation & Configuration

### 1.1 Install Prisma Dependencies

**File:** `package.json`

- [x] Run `yarn add -D prisma` and `yarn add @prisma/client`
- [x] Verify installation in `package.json`

### 1.2 Initialize Prisma

**File:** `prisma/schema.prisma`

- [x] Run `npx prisma init --datasource-provider mysql`
- [x] Verify `prisma/` directory created
- [x] Verify `.env` file created with `DATABASE_URL`

### 1.3 Configure Environment

**File:** `.env`

- [x] Set `DATABASE_URL="mysql://test:test@localhost:3306/test"`
- [x] Add `.env` to `.gitignore` (if not already present)

## Phase 2: Schema Definition

### 2.1 Define Customer Model

**File:** `prisma/schema.prisma`

- [x] Add `Customer` model with fields: id, name, phone, email, company, status, createdAt
- [x] Define status as enum: `active`, `lead`, `inactive`
- [x] Add relation to `Note` model (one-to-many)

### 2.2 Define Note Model

**File:** `prisma/schema.prisma`

- [x] Add `Note` model with fields: id, customerId, text, author, createdAt
- [x] Add foreign key relation to `Customer` with `onDelete: Cascade`

### 2.3 Define TicketStatus Model

**File:** `prisma/schema.prisma`

- [x] Add `TicketStatus` model with fields: id, name, color

## Phase 3: Migration Creation

### 3.1 Generate Initial Migration

**Command:** `npx prisma migrate dev --name init`

- [x] Ensure Docker MySQL is running: `docker compose up -d`
- [x] Wait for MySQL healthcheck to pass
- [x] Run migration command
- [x] Verify `prisma/migrations/` directory created
- [x] Verify `prisma/migrations/migration_lock.toml` exists

### 3.2 Verify Migration Applied

**Command:** `npx prisma migrate status`

- [x] Confirm migration is in sync with database
- [x] No pending migrations

## Phase 4: Seed File Creation

### 4.1 Create Seed Script

**File:** `prisma/seed.ts`

- [x] Import `PrismaClient`
- [x] Instantiate client
- [x] Seed 3 customers (Sarah Chen, Marcus Rodriguez, Priya Patel)
- [x] Seed 3 notes (2 for Sarah, 1 for Marcus)
- [x] Seed 5 ticket statuses (Open, In Progress, Waiting on Customer, Resolved, Closed)
- [x] Add error handling and cleanup (disconnect)

### 4.2 Configure Seed in package.json

**File:** `package.json`

- [x] Add `"prisma": { "seed": "node --import tsx prisma/seed.ts" }`
- [x] Add `tsx` to devDependencies: `yarn add -D tsx`

### 4.3 Run Seed

**Command:** `npx prisma db seed`

- [x] Verify seed executes successfully
- [x] Query database to confirm data inserted

## Phase 5: Update lib/db.ts

### 5.1 Replace Flat-File I/O

**File:** `lib/db.ts`

- [x] Import `PrismaClient`
- [x] Create singleton instance (globalThis pattern for dev hot-reload)
- [x] Export `prisma` client
- [x] Remove or comment out old JSON file read/write logic

## Phase 6: Add package.json Scripts

### 6.1 Database Scripts

**File:** `package.json`

- [x] Add `"db:migrate": "prisma migrate dev"`
- [x] Add `"db:seed": "prisma db seed"`
- [x] Add `"db:studio": "prisma studio"`
- [x] Add `"db:push": "prisma db push"`
- [x] Add `"db:generate": "prisma generate"`
- [x] Add `"db:reset": "prisma migrate reset"`
- [x] Add `"postinstall": "prisma generate"`

## Phase 7: Clean Up Docker Init

### 7.1 Update docker-compose.yml (Optional)

**File:** `docker-compose.yml`

- [x] Remove or comment out `./db/init.sql` volume mount
- [x] Keep `db_data` volume for persistence
- [x] Document that Prisma migrations are now the source of truth

## Files Created

1. `prisma/schema.prisma`
2. `prisma/seed.ts`
3. `prisma/migrations/20260528033008_init/migration.sql`
4. `prisma/migrations/migration_lock.toml`
5. `.env`

## Files Modified

1. `package.json` (dependencies + scripts)
2. `lib/db.ts` (replaced with Prisma client)
3. `docker-compose.yml` (removed init.sql mount)
4. `.gitignore` (`.env` already ignored)
5. `prisma.config.ts` (fixed dotenv import)

## Success Criteria

- [x] `yarn install` installs Prisma and generates client automatically
- [x] `docker compose up -d` starts MySQL successfully
- [x] `yarn db:migrate` creates and applies migrations
- [x] `yarn db:seed` populates database with test data
- [x] `yarn db:studio` opens Prisma Studio in browser
- [x] `lib/db.ts` exports working Prisma client
- [x] Database contains 3 customers, 3 notes, 5 ticket statuses after seeding
- [x] No TypeScript errors in seed file or db.ts
- [x] `.env` is not committed to git
