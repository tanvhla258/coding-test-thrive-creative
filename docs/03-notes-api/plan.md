# Notes API - Implementation Plan

## Overview

This phase migrates the notes API from flat-file JSON storage to MySQL database queries using Prisma. The route currently reads from `data/notes.json` and has an unimplemented POST handler. We need to:

1. Replace `readData()` with Prisma queries for GET
2. Implement customer ID filtering via query parameters
3. Implement POST handler with validation and note creation
4. Add foreign key validation (customerId must exist)
5. Integrate centralized error handling and validation from Phase 1

**Why this matters:** The notes API is the most complex route, handling both read and write operations. It demonstrates the full CRUD pattern and establishes best practices for data creation with validation. This is also where we'll see the most significant improvement in data integrity through database constraints.

## Architecture

### Current Flow (Flat-File)

**GET:**
```
GET /api/notes
  ↓
readData<Note[]>("notes.json")
  ↓
Return all notes (no filtering)
```

**POST:**
```
POST /api/notes
  ↓
Not implemented (returns 501)
```

### Target Flow (Database)

**GET:**
```
GET /api/notes?customerId=cust_001
  ↓
Validate query params (CustomerIdFilterSchema)
  ↓
prisma.note.findMany({ where: { customerId } })
  ↓
Return filtered notes
```

**POST:**
```
POST /api/notes
  Body: { customerId, text, author }
  ↓
Validate body (CreateNoteSchema)
  ↓
Check customerId exists in customers table
  ↓
Generate id: note_${Date.now()}
  ↓
prisma.note.create({ data: { ... } })
  ↓
Return created note (201 Created)
```

### Data Model

**Prisma Schema (Note):**
```prisma
model Note {
  id         String   @id @db.VarChar(50)
  customerId String   @map("customer_id") @db.VarChar(50)
  text       String   @db.Text
  author     String   @db.VarChar(255)
  createdAt  DateTime @default(now()) @map("created_at")
  customer   Customer @relation(fields: [customerId], references: [id], onDelete: Cascade)

  @@map("notes")
}
```

**TypeScript Type (Note):**
```typescript
export interface Note {
  id: string;
  customerId: string;
  text: string;
  createdAt: string;
  author: string;
}
```

**Note:** Prisma `createdAt` is DateTime, TypeScript expects string. We'll convert to ISO string on creation.

**Foreign Key Relationship:**
- Note has required relation to Customer
- `onDelete: Cascade` means deleting a customer deletes all their notes
- Database enforces referential integrity

## Technical Decisions

### 1. Exact Match vs Partial Match for Customer ID Filter

**Decision:** Use exact match (`equals`) for customerId filtering, not partial match.

**Rationale:**
- Customer ID is a specific identifier, not a search term
- Exact match is more predictable and efficient
- Prevents accidental matches (e.g., "cust_00" matching "cust_001" and "cust_002")
- Aligns with REST conventions for resource filtering

**Implementation:**
```typescript
const where = customerId ? { customerId } : {};
const notes = await prisma.note.findMany({ where });
```

### 2. Note ID Generation Strategy

**Decision:** Use `note_${Date.now()}` pattern for ID generation.

**Rationale:**
- Matches the TODO comment specification
- Simple and human-readable
- Sufficient for small-scale CRM (not high-throughput)
- Timestamp provides rough ordering

**Trade-off:** Not collision-proof if two notes created in same millisecond. Acceptable for this use case.

**Alternative considered:** UUID. Rejected because TODO specifies Date.now() pattern.

**Implementation:**
```typescript
const id = `note_${Date.now()}`;
```

### 3. Foreign Key Validation Strategy

**Decision:** Explicitly check if customerId exists before creating note, rather than relying on database constraint.

**Rationale:**
- Provides clearer error message ("Customer not found" vs database constraint error)
- Catches error before database operation
- Easier to test and debug
- Follows "fail fast" principle

**Trade-off:** Extra database query. Acceptable for data integrity.

**Implementation:**
```typescript
const customer = await prisma.customer.findUnique({ where: { id: customerId } });
if (!customer) {
  return NextResponse.json(
    { success: false, error: "Customer not found" },
    { status: 400 }
  );
}
```

### 4. Timestamp Format

**Decision:** Convert Prisma DateTime to ISO string for response.

**Rationale:**
- TypeScript `Note` interface expects string type
- ISO 8601 format is standard for APIs
- Easy to parse on frontend
- Prisma returns Date object, needs conversion

**Implementation:**
```typescript
const createdAt = new Date().toISOString();
```

### 5. Response Format for POST

**Decision:** Return created note directly with 201 status (not wrapped in envelope).

**Rationale:**
- REST convention: POST returns created resource
- 201 Created is semantic status code
- Direct return matches GET pattern
- Frontend can immediately use the response

**Implementation:**
```typescript
return NextResponse.json(createdNote, { status: 201 });
```

### 6. Validation Error Granularity

**Decision:** Return all validation errors in details array, not just first error.

**Rationale:**
- Helps frontend display all issues at once
- Better user experience (fix all errors, not one at a time)
- Zod provides structured error array
- Matches modern API best practices

**Implementation:**
```typescript
// In error handler
if (error instanceof z.ZodError) {
  return NextResponse.json(
    { 
      success: false, 
      error: "Validation failed", 
      details: error.errors 
    },
    { status: 400 }
  );
}
```

### 7. Field Selection in Queries

**Decision:** Use `select` clause to explicitly choose fields, exclude Prisma-specific fields.

**Rationale:**
- TypeScript interface doesn't include all Prisma fields
- Reduces payload size
- Prevents accidental exposure of internal fields
- Maintains type safety

**Implementation:**
```typescript
const notes = await prisma.note.findMany({
  where,
  select: {
    id: true,
    customerId: true,
    text: true,
    createdAt: true,
    author: true
  }
});
```

## Implementation Strategy

### Step 1: Update Imports (5 minutes)

**File:** `app/api/notes/route.ts`

Remove old imports:
```typescript
import { readData } from "@/lib/db";
```

Add new imports:
```typescript
import { prisma } from "@/lib/db";
import { handleApiError } from "@/lib/api/error-handler";
import { validateRequest } from "@/lib/api/validate";
import { CustomerIdFilterSchema, CreateNoteSchema } from "@/lib/api/validators";
```

### Step 2: Implement GET Validation (10 minutes)

Extract and validate query parameters:
```typescript
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const { customerId } = validateRequest(CustomerIdFilterSchema, {
      customerId: searchParams.get("customerId")
    });
    
    // ... query implementation
  } catch (error) {
    return handleApiError(error);
  }
}
```

### Step 3: Implement GET Query (10 minutes)

Replace flat-file read with Prisma query:
```typescript
const where = customerId ? { customerId } : {};
const notes = await prisma.note.findMany({
  where,
  select: {
    id: true,
    customerId: true,
    text: true,
    createdAt: true,
    author: true
  }
});

return NextResponse.json(notes);
```

### Step 4: Implement POST Validation (15 minutes)

Parse and validate request body:
```typescript
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customerId, text, author } = validateRequest(CreateNoteSchema, body);
    
    // ... creation implementation
  } catch (error) {
    return handleApiError(error);
  }
}
```

### Step 5: Implement Foreign Key Check (10 minutes)

Verify customer exists:
```typescript
const customer = await prisma.customer.findUnique({ 
  where: { id: customerId } 
});

if (!customer) {
  return NextResponse.json(
    { success: false, error: "Customer not found" },
    { status: 400 }
  );
}
```

### Step 6: Implement Note Creation (15 minutes)

Generate ID and create note:
```typescript
const id = `note_${Date.now()}`;
const createdAt = new Date().toISOString();

const createdNote = await prisma.note.create({
  data: {
    id,
    customerId,
    text,
    author,
    createdAt: new Date(createdAt)
  },
  select: {
    id: true,
    customerId: true,
    text: true,
    createdAt: true,
    author: true
  }
});

return NextResponse.json(createdNote, { status: 201 });
```

### Step 7: Manual Testing - GET (15 minutes)

Test all GET scenarios:
1. GET all notes (no filter)
2. GET with valid customerId
3. GET with non-existent customerId
4. GET with invalid parameter type
5. Verify response matches database seed data

### Step 8: Manual Testing - POST (20 minutes)

Test all POST scenarios:
1. POST with valid payload
2. POST with missing customerId
3. POST with missing text
4. POST with missing author
5. POST with empty strings
6. POST with non-existent customerId
7. Verify created note is retrievable via GET

### Step 9: Verify Data Correctness (5 minutes)

**Critical check:** Compare response data with database seed data, NOT with shell data.

Expected notes structure:
- Notes linked to customers via customerId
- Each note has: id, customerId, text, author, createdAt
- createdAt is ISO string format

## Risks & Mitigations

### Risk 1: ID Collision on Rapid Creation

**Issue:** Two notes created in same millisecond get same ID.

**Mitigation:**
- Acceptable for small-scale CRM (low probability)
- Database will reject duplicate ID (primary key constraint)
- Error handler will return 500 with clear message
- Future enhancement: Add random suffix or use UUID

### Risk 2: Foreign Key Constraint Violation

**Issue:** Prisma might throw constraint error if customerId doesn't exist.

**Mitigation:**
- Explicit check before creation (catches error early)
- Clear error message: "Customer not found"
- Returns 400 Bad Request (not 500)
- Database constraint is backup safety net

### Risk 3: Timestamp Precision Mismatch

**Issue:** Prisma DateTime has millisecond precision, ISO string might differ.

**Mitigation:**
- Use `new Date().toISOString()` for consistency
- Prisma accepts Date object, converts internally
- Test that createdAt in response matches created note

### Risk 4: Large Text Payload

**Issue:** Note text field might receive very large strings.

**Mitigation:**
- Prisma schema uses `@db.Text` (supports large text)
- Validation schema can add max length if needed
- Monitor for abuse in production

### Risk 5: Concurrent POST Requests

**Issue:** Multiple simultaneous POST requests might cause issues.

**Mitigation:**
- Database handles concurrency (primary key constraint)
- Each request gets unique timestamp
- Error handler catches constraint violations

### Risk 6: Invalid Date Format in Response

**Issue:** Prisma DateTime might not convert to ISO string correctly.

**Mitigation:**
- Explicitly convert: `new Date().toISOString()`
- Test response format matches TypeScript interface
- Verify frontend can parse ISO format

### Risk 7: Missing Validation for Empty Strings

**Issue:** Zod schema might allow empty strings.

**Mitigation:**
- Use `.min(1)` in Zod schema for text and author
- Test validation rejects empty strings
- Error message indicates field cannot be empty

### Risk 8: Database Connection Pool Exhaustion

**Issue:** Multiple concurrent requests might exhaust connection pool.

**Mitigation:**
- Prisma manages connection pool automatically
- Global singleton pattern prevents multiple instances
- Monitor connection usage in production

## Dependencies

**Requires completion of:**
- Phase 1: Infrastructure (error handler, validation, Prisma setup)

**Blocks:**
- None (notes API is independent of statuses API)

**Can run in parallel with:**
- Phase 2: Customers API implementation
- Phase 4: Statuses API implementation

**Integration points:**
- Foreign key validation queries customers table
- Created notes should be retrievable via GET endpoint
- Customer deletion cascades to notes (database level)
