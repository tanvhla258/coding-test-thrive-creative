# Infrastructure - Implementation Plan

## Overview

This phase establishes the foundational infrastructure for the CRM API upgrade. We're building centralized error handling, request validation, and ensuring the Prisma ORM is properly configured to replace flat-file JSON operations. This infrastructure will be reused across all three API route implementations (customers, notes, statuses).

**Why this matters:** Without centralized error handling and validation, each API route would need to implement its own error logic, leading to inconsistency, code duplication, and maintenance burden. By establishing these utilities first, we ensure all subsequent API implementations follow the same patterns and REST conventions.

## Architecture

### Component Structure

```
lib/
├── db.ts                          # Prisma client (existing, verify)
├── api/
│   ├── error-handler.ts          # Centralized error catching & response formatting
│   ├── types.ts                  # Shared API response types
│   ├── validators.ts             # Zod schemas for request validation
│   └── validate.ts               # Validation helper function
└── generated/prisma/             # Auto-generated Prisma types (existing)
```

### Data Flow

1. **Request arrives** → API route handler
2. **Validation** → `validateRequest()` checks payload/query params against Zod schema
3. **If invalid** → Return 400 with structured error response
4. **If valid** → Execute Prisma query
5. **If error** → `handleApiError()` catches exception, logs it, returns appropriate status code
6. **If success** → Return 200/201 with data payload

### Error Response Structure

```typescript
// Error response (400, 404, 500)
{
  "success": false,
  "error": "Human-readable error message",
  "details": { /* optional context */ }
}

// Success response (200, 201)
{
  "success": true,
  "data": { /* response payload */ }
}
```

## Technical Decisions

### 1. Zod for Validation

**Decision:** Use Zod for request validation instead of manual checks or other libraries.

**Rationale:**
- Runtime type checking with TypeScript inference (compile-time + runtime safety)
- Composable schemas for complex validation rules
- Excellent error messages out of the box
- Small bundle size, no external dependencies
- Already widely adopted in the Next.js ecosystem

**Alternative considered:** Manual validation with if-statements. Rejected because it's error-prone, verbose, and doesn't provide TypeScript inference.

### 2. Centralized Error Handler Pattern

**Decision:** Create a single `handleApiError()` function that all routes use, rather than try-catch blocks in each route.

**Rationale:**
- Consistent error response format across all endpoints
- Single place to update error handling logic
- Automatic error classification (validation vs database vs unknown)
- Easier to add logging, monitoring, or error tracking later

**Implementation:**
```typescript
export function handleApiError(error: unknown): NextResponse<ApiErrorResponse> {
  if (error instanceof z.ZodError) {
    return NextResponse.json(
      { success: false, error: "Validation failed", details: error.errors },
      { status: 400 }
    );
  }
  // ... other error types
}
```

### 3. Prisma Client Singleton Pattern

**Decision:** Use global singleton pattern for Prisma client in development.

**Rationale:**
- Prevents connection pool exhaustion during hot reloading
- Next.js development server reloads frequently, creating new Prisma instances
- Production uses single instance naturally (no hot reload)

**Current implementation** (verify it's correct):
```typescript
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };
export const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

### 4. Separate API Utilities Directory

**Decision:** Create `lib/api/` directory for API-specific utilities, separate from `lib/db.ts`.

**Rationale:**
- Clear separation of concerns: database access vs API utilities
- Easier to locate and maintain API-specific code
- Prevents `lib/db.ts` from becoming a catch-all module

## Implementation Strategy

### Step 1: Install Dependencies (5 minutes)

```bash
yarn add zod
```

Verify installation in `package.json`.

### Step 2: Create Type Definitions (10 minutes)

**File:** `lib/api/types.ts`

Define the response envelope types that all routes will use. This establishes the contract between API and clients.

### Step 3: Create Validation Schemas (15 minutes)

**File:** `lib/api/validators.ts`

Define Zod schemas for:
- `CreateNoteSchema`: customerId, text, author (all required strings)
- `PhoneFilterSchema`: optional phone query param
- `CustomerIdFilterSchema`: optional customerId query param

These schemas will be used by the validation helper and individual routes.

### Step 4: Create Validation Helper (15 minutes)

**File:** `lib/api/validate.ts`

Implement `validateRequest<T>(schema, data)` that:
- Validates data against schema
- Returns typed result on success
- Throws ZodError on failure (caught by error handler)

### Step 5: Create Error Handler (20 minutes)

**File:** `lib/api/error-handler.ts`

Implement `handleApiError(error)` that:
- Detects error type (ZodError, PrismaClientKnownRequestError, etc.)
- Returns appropriate HTTP status code
- Logs error for debugging
- Returns structured error response

### Step 6: Verify Prisma Setup (10 minutes)

**File:** `lib/db.ts`

- Test database connection
- Verify generated types exist
- Document any configuration needed

### Step 7: Integration Test (15 minutes)

Create a simple test route that uses all utilities to verify they work together:
- Validates a request
- Queries database
- Handles errors
- Returns proper response

## Risks & Mitigations

### Risk 1: Prisma Client Not Generated

**Issue:** `lib/generated/prisma/` might not exist or be outdated.

**Mitigation:**
- Run `npx prisma generate` if types are missing
- Add to setup documentation
- Verify in Phase 3 of task.md

### Risk 2: Database Connection Failures

**Issue:** Prisma client might fail to connect to MySQL.

**Mitigation:**
- Verify `.env` has correct DATABASE_URL
- Check Docker container is running: `docker compose ps`
- Test connection with `npx prisma db pull`

### Risk 3: Validation Schema Mismatch

**Issue:** Zod schemas might not match actual request data structure.

**Mitigation:**
- Review existing API routes to understand current data shapes
- Test validation with sample requests
- Keep schemas simple and explicit

### Risk 4: Error Handler Doesn't Catch All Error Types

**Issue:** Unknown error types might slip through.

**Mitigation:**
- Add catch-all for unknown errors (500 Internal Server Error)
- Log full error object for debugging
- Document error types as they're discovered

### Risk 5: TypeScript Strict Mode Violations

**Issue:** New utilities might violate strict mode (implicit any, missing types).

**Mitigation:**
- Write types first, implementation second
- Use explicit return types on all functions
- Run `yarn typecheck` after each file

## Dependencies

This infrastructure phase must be completed before:
- Phase 2: Customers API implementation
- Phase 3: Notes API implementation
- Phase 4: Statuses API implementation

All three API phases depend on the error handler, validation utilities, and Prisma client being properly configured.
