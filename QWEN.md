# QWEN.md — Developer Test Exercise (Customer Notes CRM)

## Project Overview

This is a **developer assessment exercise** for Thrive Creative. It's a CRM-style "Customer Notes" web application built with Next.js 16 (App Router) and TypeScript, styled with Tailwind CSS v4.

The project ships as a **UI shell with hardcoded "shell data"** that the candidate is expected to wire up to a real MySQL database. The `data/` folder contains JSON seed data that matches the MySQL schema in `db/init.sql`. The task is to replace flat-file I/O with real database queries and connect the frontend components to live API endpoints.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, TypeScript) |
| UI | React 19, Tailwind CSS v4 |
| Database | MySQL 8.0 via Docker Compose |
| ORM / DB Driver | None installed yet — candidate chooses (`mysql2`, Prisma, Drizzle, etc.) |

## Directory Structure

```
├── app/
│   ├── api/
│   │   ├── customers/route.ts   # GET with ?phone= filter
│   │   ├── notes/route.ts       # GET with ?customerId=, POST to create
│   │   └── statuses/route.ts    # GET all ticket statuses
│   ├── components/
│   │   ├── CustomerList.tsx     # Sidebar, filter by phone
│   │   ├── EmptyState.tsx       # Empty selection placeholder
│   │   ├── Modal.tsx            # Generic modal wrapper
│   │   ├── NotesPane.tsx        # Notes display + add form
│   │   └── TicketsPane.tsx      # Tickets display
│   ├── layout.tsx
│   ├── page.tsx                 # Main page — shell data + TODOs
│   └── globals.css
├── data/                        # JSON seed data (flat-file fallback)
│   ├── customers.json
│   ├── ticket_status.json
│   └── cust_XXX/                # Per-customer notes & tickets
├── db/
│   └── init.sql                 # MySQL schema + seed data
├── lib/
│   └── db.ts                    # Flat-file read/write — needs DB replacement
├── types.ts                     # TypeScript interfaces (Customer, Note, Ticket, TicketStatus)
├── docker-compose.yml           # MySQL 8.0 container
├── next.config.ts
├── package.json
└── tsconfig.json
```

## Database Schema

Three tables:
- **customers** — `id`, `name`, `phone`, `email`, `company`, `status` (active/lead/inactive)
- **notes** — `id`, `customer_id` (FK), `text`, `author`, `created_at`
- **ticket_statuses** — `id`, `name`, `color`

Connection: `localhost:3306`, database `test`, user `test`, password `test`.

## Building and Running

```bash
# 1. Start the MySQL database
docker compose up -d

# 2. Install dependencies
yarn

# 3. Run in dev mode (listens on 0.0.0.0:3000)
yarn start
# or: yarn run dev  (localhost only)

# 4. Build for production
yarn build
```

If accessing from another host, add your IP to `allowedDevOrigins` in `next.config.ts`.

## What Needs to Be Built

Every task is marked with a `// TODO` comment in the codebase:

| File | Task |
|------|------|
| `lib/db.ts` | Replace `fs.readFile`/`fs.writeFile` with real MySQL query helpers |
| `app/api/customers/route.ts` | Query DB, add `?phone=` filter support |
| `app/api/notes/route.ts` | GET filtered by `?customerId=`, POST to create notes |
| `app/api/statuses/route.ts` | Query ticket statuses from DB |
| `app/page.tsx` | Uncomment API fetch calls, remove `SHELL_*` constants |
| `app/components/CustomerList.tsx` | Wire phone search to filter |
| `app/components/NotesPane.tsx` | Call `onAddNote(text)` and clear form on success |
| `app/components/TicketStatusPane.tsx` | Persist selected status to DB |

## Development Conventions

- **TypeScript strict mode** enabled (`strict: true` in tsconfig)
- **Path aliases** — `@/*` maps to project root
- **ES2017 target** — modern JS features available
- **Tailwind CSS v4** — uses `@tailwindcss/postcss` plugin
- **React 19** — server/client component boundaries matter (`page.tsx` is `"use client"`)
- **No ORM installed** — candidate has freedom to choose their approach

## Notes

- This is a test/assessment project, not a production codebase
- Shell data in `page.tsx` is intentionally different from DB seed data to verify correct wiring
- The `data/` folder serves as a reference for expected data structure and relationships
