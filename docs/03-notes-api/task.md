# Notes API - Task Breakdown

## Overview

Replace flat-file JSON operations in the notes API with Prisma MySQL queries. Implement customer filtering, note creation with validation, and integrate centralized error handling. This is the most complex API route as it handles both GET and POST operations.

## Phase 1: GET Implementation - Database Query

### 1.1 Replace readData with Prisma Query

**File:** `app/api/notes/route.ts`

- [ ] Remove import of `readData` from `@/lib/db`
- [ ] Import `prisma` from `@/lib/db`
- [ ] Import `handleApiError` from `@/lib/api/error-handler`
- [ ] Import `validateRequest` from `@/lib/api/validate`
- [ ] Import `CustomerIdFilterSchema` from `@/lib/api/validators`
- [ ] Replace `readData<Note[]>("notes.json")` with `prisma.note.findMany()`
- [ ] Verify query returns all notes when no filter is applied
- [ ] Test endpoint returns 200 OK with notes array

### 1.2 Implement Customer ID Filtering

**File:** `app/api/notes/route.ts`

- [ ] Extract customerId query parameter from URL search params
- [ ] Validate customerId parameter using `CustomerIdFilterSchema` (optional string)
- [ ] Add Prisma `where` clause when customerId parameter is provided
- [ ] Use exact match for customerId (not partial match)
- [ ] Test filtering with valid customerId (e.g., `?customerId=cust_001`)
- [ ] Test filtering with non-existent customerId returns empty array
- [ ] Verify response includes correct note object structure

## Phase 2: POST Implementation - Note Creation

### 2.1 Implement Request Validation

**File:** `app/api/notes/route.ts`

- [ ] Import `CreateNoteSchema` from `@/lib/api/validators`
- [ ] Parse request body with `request.json()`
- [ ] Validate body against `CreateNoteSchema` using `validateRequest()`
- [ ] Ensure validation checks for required fields: customerId, text, author
- [ ] Test validation rejects missing customerId
- [ ] Test validation rejects missing text
- [ ] Test validation rejects missing author
- [ ] Test validation rejects empty strings

### 2.2 Implement Note Creation

**File:** `app/api/notes/route.ts`

- [ ] Generate unique ID using `note_${Date.now()}` pattern
- [ ] Set createdAt to current ISO timestamp
- [ ] Use `prisma.note.create()` to insert new note
- [ ] Include all fields: id, customerId, text, author, createdAt
- [ ] Return created note with 201 Created status
- [ ] Verify note is persisted in database

### 2.3 Add Foreign Key Validation

**File:** `app/api/notes/route.ts`

- [ ] Check if customerId exists in customers table before creating note
- [ ] Return 400 Bad Request if customerId doesn't exist
- [ ] Test creation fails gracefully for non-existent customer
- [ ] Verify error message clearly indicates invalid customerId

## Phase 3: Error Handling Integration

### 3.1 Add Error Handling to GET

**File:** `app/api/notes/route.ts`

- [ ] Wrap GET handler in try-catch block
- [ ] Use `handleApiError()` in catch block
- [ ] Test error handling with database connection failure
- [ ] Test error handling with invalid query parameters
- [ ] Verify 500 errors include proper error message structure

### 3.2 Add Error Handling to POST

**File:** `app/api/notes/route.ts`

- [ ] Wrap POST handler in try-catch block
- [ ] Use `handleApiError()` in catch block
- [ ] Test error handling with validation failures (400)
- [ ] Test error handling with database errors (500)
- [ ] Test error handling with foreign key violations
- [ ] Verify error responses follow REST conventions

## Phase 4: Response Formatting

### 4.1 Standardize GET Response

**File:** `app/api/notes/route.ts`

- [ ] Return notes array directly (not wrapped in envelope)
- [ ] Ensure response includes all note fields: id, customerId, text, createdAt, author
- [ ] Verify TypeScript types match `Note` interface from `@/types`
- [ ] Select only fields defined in TypeScript interface

### 4.2 Standardize POST Response

**File:** `app/api/notes/route.ts`

- [ ] Return created note with 201 status code
- [ ] Include full note object in response (including generated id and createdAt)
- [ ] Verify response matches `Note` interface
- [ ] Remove any console.log statements used for debugging

## Phase 5: Testing

### 5.1 Manual Integration Testing - GET

**File:** N/A (manual testing)

- [ ] Test GET `/api/notes` returns all notes from database
- [ ] Test GET `/api/notes?customerId=cust_001` returns notes for customer 001
- [ ] Test GET `/api/notes?customerId=cust_999` returns empty array
- [ ] Verify response data matches database seed data
- [ ] Test invalid query parameter returns 400 error
- [ ] Test database error returns 500 error

### 5.2 Manual Integration Testing - POST

**File:** N/A (manual testing)

- [ ] Test POST `/api/notes` with valid payload creates note
- [ ] Test POST with missing customerId returns 400
- [ ] Test POST with missing text returns 400
- [ ] Test POST with missing author returns 400
- [ ] Test POST with empty strings returns 400
- [ ] Test POST with non-existent customerId returns 400
- [ ] Verify created note has generated id and createdAt
- [ ] Verify created note is retrievable via GET endpoint
- [ ] Test database error returns 500 error

### 5.3 Automated Integration Test (Optional)

**File:** `__tests__/api/notes.test.ts` (if test framework is set up)

- [ ] Write test for GET all notes
- [ ] Write test for GET with customerId filter
- [ ] Write test for GET with invalid customerId
- [ ] Write test for POST with valid payload
- [ ] Write test for POST with missing fields
- [ ] Write test for POST with non-existent customerId
- [ ] Write test for database error handling
- [ ] Ensure tests clean up created notes after execution
- [ ] Ensure tests close Prisma connection after execution

## Files to Modify

1. `app/api/notes/route.ts`

## Files to Create (Optional)

1. `__tests__/api/notes.test.ts` (if implementing automated tests)

## Success Criteria

- [ ] GET `/api/notes` returns all notes from MySQL database
- [ ] GET `/api/notes?customerId=<id>` filters notes by customer ID (exact match)
- [ ] POST `/api/notes` creates new note with valid payload and returns 201 Created
- [ ] POST validates required fields: customerId, text, author
- [ ] POST rejects requests with missing or empty fields (400 Bad Request)
- [ ] POST validates customerId exists in customers table (400 if not)
- [ ] Created note includes generated id and createdAt timestamp
- [ ] Invalid query parameters return 400 Bad Request with error details
- [ ] Database errors return 500 Internal Server Error with structured error message
- [ ] TypeScript compilation passes with no errors
- [ ] Response data matches database seed data (verifies correct wiring)
- [ ] No flat-file JSON operations remain in the route
- [ ] Error responses follow REST conventions
- [ ] Foreign key constraint is enforced (cannot create note for non-existent customer)
