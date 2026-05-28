# Thrive Creative — Developer Onsite Exercise

## Getting started

### 1. Start the database

```bash
docker compose up -d
```

MySQL on `localhost:3306`, schema and seed data applied automatically from `db/init.sql`.

| | |
|---|---|
| Database | `test` |
| User | `test` |
| Password | `test` |

### 2. Install and run

```bash
npm install
npm start        # dev mode, hot reload, http://localhost:3000
```

> If accessing from another host on the network, add your IP to `allowedDevOrigins` in `next.config.ts`.

---

## Your task

Wire this UI shell up so it reads and writes real data from MySQL instead of the hardcoded shell data in `app/page.tsx`.

The `data/` folder contains the records you are expected to serve — the database schema in `db/init.sql` matches exactly.

### What to build

| File | What to do |
|------|------------|
| `app/api/customers/route.ts` | Read customers from DB, support `?phone=` filter |
| `app/api/notes/route.ts` | GET filtered by `?customerId=`, POST to create a new note |
| `app/api/statuses/route.ts` | Read ticket statuses from DB |
| `lib/db.ts` | Replace flat-file helpers with real DB queries |
| `app/page.tsx` | Uncomment the API fetch calls, remove the `SHELL_*` constants |
| `app/components/NotesPane.tsx` | Call `onAddNote(text)` and clear the form on success |
| `app/components/CustomerList.tsx` | Filter the customer list by phone number |
| `app/components/TicketStatusPane.tsx` | Persist the selected status to the DB |

Every spot that needs work has a `// TODO` comment.

## Stack

- **Next.js 16** — App Router, TypeScript
- **Tailwind CSS**
- **MySQL 8** via Docker Compose

You can install any additional packages you need (`mysql2`, `prisma`, `drizzle-orm`, etc.).
