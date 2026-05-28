# Customers API - Implementation Plan

## Overview

This phase migrates the customers API from flat-file JSON storage to MySQL database queries using Prisma. The route currently reads from `data/customers.json` and returns all customers. We need to:

1. Replace `readData()` with Prisma queries
2. Implement phone filtering via query parameters
3. Integrate centralized error handling and validation from Phase 1
4. Ensure response data matches database seed data (not shell data)

**Why this matters:** The customers API is the primary entry point for the CRM system. The shell data in `app/page.tsx` is intentionally different from database seed data to verify correct wiring. This implementation proves the database connection works and establishes the pattern for other API routes.

## Architecture

### Current Flow (Flat-File)

```
GET /api/customers
  ↓
readData<Customer[]>("customers.json")
  ↓
Return all customers (no filtering)
```

### Target Flow (Database)

```
GET /api/customers?phone=512-555-0187
  ↓
Validate query params (PhoneFilterSchema)
  ↓
prisma.customer.findMany({ where: { phone: { contains: phone } } })
  ↓
Return filtered customers
```

### Data Model

**Prisma Schema (Customer):**
```prisma
model Customer {
  id        String         @id @db.VarChar(50)
  name      String         @db.VarChar(255)
  phone     String         @db.VarChar(50)
  email     String         @db.VarChar(255)
  company   String         @db.VarChar(255)
  status    CustomerStatus @default(active)
  createdAt DateTime       @default(now()) @map("created_at")
  notes     Note[]
  @@map("customers")
}
```

**TypeScript Type (Customer):**
```typescript
export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  company: string;
  status: "active" | "lead" | "inactive";
}
```

**Note:** Prisma includes `createdAt` but TypeScript interface doesn't. We'll need to handle this mapping or update the type.

## Technical Decisions

### 1. Partial Phone Matching vs Exact Match

**Decision:** Use Prisma `contains` operator for phone filtering (partial match).

**Rationale:**
- Users might search with partial phone numbers (e.g., area code only)
- More flexible for CRM search use cases
- Matches typical user expectations for search functionality

**Alternative considered:** Exact match with `equals` operator. Rejected because it's too restrictive for a search filter.

**Implementation:**
```typescript
const where = phone ? { phone: { contains: phone } } : {};
const customers = await prisma.customer.findMany({ where });
```

### 2. Query Parameter Validation Strategy

**Decision:** Validate phone parameter as optional string, reject if it's not a string.

**Rationale:**
- Phone is optional (no filter = return all)
- Must be string type (prevent injection or type coercion issues)
- Keep validation simple; don't enforce phone format (too restrictive)

**Implementation:**
```typescript
const { phone } = validateRequest(PhoneFilterSchema, {
  phone: searchParams.get("phone")
});
```

### 3. Response Format: Direct Array vs Envelope

**Decision:** Return customers directly as array (current behavior) rather than wrapping in `{ success: true, data: customers }`.

**Rationale:**
- Maintains backward compatibility with existing frontend code
- Simpler response structure for list endpoints
- Frontend likely expects array directly

**Trade-off:** Inconsistent with error response format (which uses envelope). But this is acceptable for success responses.

### 4. Error Handling Granularity

**Decision:** Catch all errors at route level, delegate to centralized error handler.

**Rationale:**
- Keeps route handler clean and focused on business logic
- Centralized error handler knows how to classify different error types
- Easier to add logging or monitoring later

**Implementation:**
```typescript
export async function GET(request: Request) {
  try {
    // ... validation and query
    return NextResponse.json(customers);
  } catch (error) {
    return handleApiError(error);
  }
}
```

### 5. Database Field Mapping

**Decision:** Select only fields defined in TypeScript `Customer` interface, exclude `createdAt`.

**Rationale:**
- TypeScript interface doesn't include `createdAt`
- Frontend might not expect this field
- Reduces payload size
- Maintains type safety

**Implementation:**
```typescript
const customers = await prisma.customer.findMany({
  where,
  select: {
    id: true,
    name: true,
    phone: true,
    email: true,
    company: true,
    status: true
  }
});
```

## Implementation Strategy

### Step 1: Update Imports (5 minutes)

**File:** `app/api/customers/route.ts`

Remove old imports:
```typescript
import { readData } from "@/lib/db";
```

Add new imports:
```typescript
import { prisma } from "@/lib/db";
import { handleApiError } from "@/lib/api/error-handler";
import { validateRequest } from "@/lib/api/validate";
import { PhoneFilterSchema } from "@/lib/api/validators";
```

### Step 2: Implement Validation (10 minutes)

Extract and validate query parameters:
```typescript
const { searchParams } = new URL(request.url);
const { phone } = validateRequest(PhoneFilterSchema, {
  phone: searchParams.get("phone")
});
```

This will throw ZodError if validation fails, caught by error handler.

### Step 3: Replace Database Query (10 minutes)

Replace flat-file read with Prisma query:
```typescript
const where = phone ? { phone: { contains: phone } } : {};
const customers = await prisma.customer.findMany({
  where,
  select: {
    id: true,
    name: true,
    phone: true,
    email: true,
    company: true,
    status: true
  }
});
```

### Step 4: Add Error Handling (5 minutes)

Wrap entire handler in try-catch:
```typescript
export async function GET(request: Request) {
  try {
    // ... validation and query
    return NextResponse.json(customers);
  } catch (error) {
    return handleApiError(error);
  }
}
```

### Step 5: Manual Testing (15 minutes)

Test all scenarios:
1. GET all customers (no filter)
2. GET with exact phone match
3. GET with partial phone match
4. GET with non-existent phone
5. GET with invalid parameter type
6. Verify response matches database seed data

### Step 6: Verify Data Correctness (5 minutes)

**Critical check:** Compare response data with `data/customers.json` seed data, NOT with shell data in `app/page.tsx`. The shell data is intentionally different to verify correct wiring.

Expected database customers:
- cust_001: Tom Bradley (512-555-0187)
- cust_002: Emma Walsh (213-555-0342)
- cust_003: James Okonkwo (718-555-0091)

## Risks & Mitigations

### Risk 1: Prisma Client Not Connected

**Issue:** `prisma.customer.findMany()` might fail with connection error.

**Mitigation:**
- Verify database is running: `docker compose ps`
- Check DATABASE_URL in `.env` file
- Test connection: `npx prisma db pull`
- Error handler will catch and return 500 with clear message

### Risk 2: Type Mismatch Between Prisma and TypeScript

**Issue:** Prisma returns `createdAt` field but TypeScript `Customer` interface doesn't include it.

**Mitigation:**
- Use `select` clause to explicitly choose fields
- Only select fields defined in TypeScript interface
- Run `yarn typecheck` to verify type compatibility

### Risk 3: Phone Filter SQL Injection

**Issue:** User might try to inject SQL via phone parameter.

**Mitigation:**
- Prisma uses parameterized queries (safe from SQL injection)
- Validation ensures phone is string type
- No raw SQL queries used

### Risk 4: Empty Result Set Handling

**Issue:** Frontend might not handle empty array correctly.

**Mitigation:**
- Return empty array `[]` (not null or error) when no matches found
- Document this behavior
- Test frontend handles empty results gracefully

### Risk 5: Performance with Large Dataset

**Issue:** `findMany()` without limit might return too many records.

**Mitigation:**
- Current dataset is small (3 customers)
- Add pagination in future if dataset grows
- Document current behavior

### Risk 6: Case Sensitivity in Phone Search

**Issue:** MySQL `contains` might be case-sensitive depending on collation.

**Mitigation:**
- Phone numbers are typically numeric (no case issue)
- If needed, use `LOWER()` function or case-insensitive collation
- Test with various phone formats

## Dependencies

**Requires completion of:**
- Phase 1: Infrastructure (error handler, validation, Prisma setup)

**Blocks:**
- None (customers API is independent of notes and statuses APIs)

**Can run in parallel with:**
- Phase 3: Notes API implementation
- Phase 4: Statuses API implementation
