# Statuses API & Integration Testing - Implementation Plan

## Overview

This phase completes the API migration by implementing the statuses endpoint and establishing comprehensive integration testing for all three API routes. The statuses API is the simplest (read-only, no filtering), but critical for the CRM's ticket management system. The integration tests ensure all endpoints work correctly with the database and provide automated regression protection.

**Why this matters:** Without integration tests, we'd have no automated way to verify that:
1. The database wiring is correct (shell data vs seed data)
2. Validation is enforced consistently
3. Error handling works as expected
4. Future changes don't break existing functionality

Integration tests also serve as living documentation of the API contract, making it easier for frontend developers to understand expected behavior.

## Architecture

### Statuses API Flow

```
GET /api/statuses
  ↓
prisma.ticketStatus.findMany()
  ↓
Return all statuses
```

### Test Architecture

```
__tests__/
├── utils/
│   ├── test-client.ts          # HTTP request helpers
│   └── test-db.ts              # Database cleanup utilities
└── api/
    ├── customers.test.ts       # Customers API tests
    ├── notes.test.ts           # Notes API tests
    └── statuses.test.ts        # Statuses API tests
```

### Test Lifecycle

```
beforeAll()
  ↓
Initialize database connection
  ↓
beforeEach() (optional)
  ↓
Set up test data
  ↓
Test execution
  ↓
afterEach()
  ↓
Clean up test data
  ↓
afterAll()
  ↓
Close database connection
```

### Data Model

**Prisma Schema (TicketStatus):**
```prisma
model TicketStatus {
  id    String @id @db.VarChar(50)
  name  String @db.VarChar(100)
  color String @db.VarChar(50)

  @@map("ticket_statuses")
}
```

**TypeScript Type (TicketStatus):**
```typescript
export interface TicketStatus {
  id: string;
  name: string;
  color: "blue" | "yellow" | "orange" | "green" | "gray";
}
```

**Note:** Prisma schema has color as String, TypeScript has union type. We'll need to ensure type compatibility.

## Technical Decisions

### 1. Testing Framework: Jest vs Vitest

**Decision:** Use Jest for testing framework.

**Rationale:**
- Most widely adopted testing framework in JavaScript/TypeScript ecosystem
- Excellent TypeScript support via ts-jest
- Rich ecosystem of matchers and utilities
- Well-documented with extensive community support
- Familiar to most developers

**Alternative considered:** Vitest (faster, native ESM support). Rejected because:
- Jest is more mature and battle-tested
- Better integration with Next.js ecosystem
- More examples and documentation available

### 2. HTTP Testing: Supertest vs Direct Function Calls

**Decision:** Use Supertest for HTTP integration testing.

**Rationale:**
- Tests actual HTTP lifecycle (request/response)
- Validates status codes, headers, and response format
- Closer to real-world usage than direct function calls
- Can test middleware and error handling
- Industry standard for API testing

**Alternative considered:** Direct function calls to route handlers. Rejected because:
- Doesn't test HTTP layer (status codes, headers)
- Misses middleware and error handling
- Less realistic than actual HTTP requests

### 3. Test Database Strategy

**Decision:** Use the same MySQL database with test-specific cleanup, not separate test database.

**Rationale:**
- Simpler setup (no need for separate database)
- Tests run against real database (production-like)
- Cleanup functions ensure test isolation
- Acceptable for development exercise

**Trade-off:** Tests might interfere if run in parallel. Mitigated by:
- Running tests sequentially (Jest default)
- Aggressive cleanup in afterEach hooks
- Unique test data identifiers

**Alternative considered:** Separate test database. Rejected because:
- More complex setup
- Overkill for development exercise
- Requires additional configuration

### 4. Test Data Strategy

**Decision:** Use existing seed data for read tests, create test data for write tests.

**Rationale:**
- Read tests verify correct wiring to seed data
- Write tests need isolated data to avoid conflicts
- Cleanup removes test-created data after each test
- Matches testing best practices

**Implementation:**
```typescript
// Read test - use seed data
const response = await testClient.get('/api/customers');
expect(response.body).toHaveLength(3); // seed data has 3 customers

// Write test - create test data
const response = await testClient.post('/api/notes').send({
  customerId: 'cust_001',
  text: 'Test note',
  author: 'Test Author'
});
// Cleanup in afterEach
```

### 5. Test File Organization

**Decision:** One test file per API route, organized in `__tests__/api/` directory.

**Rationale:**
- Clear separation of concerns
- Easy to locate tests for specific routes
- Matches Next.js App Router structure
- Scalable as more routes are added

**Structure:**
```
__tests__/
├── api/
│   ├── customers.test.ts
│   ├── notes.test.ts
│   └── statuses.test.ts
```

### 6. Test Naming Convention

**Decision:** Use descriptive test names following "should [expected behavior] when [condition]" pattern.

**Rationale:**
- Clear test intent
- Easy to understand failures
- Serves as documentation
- Matches testing best practices

**Examples:**
```typescript
it('should return all customers when no filter is applied', () => { ... });
it('should return 400 when customerId is missing', () => { ... });
it('should create note with 201 status when payload is valid', () => { ... });
```

### 7. Database Connection Management

**Decision:** Create singleton Prisma client for tests, close connection in afterAll.

**Rationale:**
- Prevents connection pool exhaustion
- Ensures clean shutdown
- Matches production pattern
- Avoids hanging test processes

**Implementation:**
```typescript
let prisma: PrismaClient;

beforeAll(() => {
  prisma = new PrismaClient();
});

afterAll(async () => {
  await prisma.$disconnect();
});
```

### 8. Test Cleanup Strategy

**Decision:** Use afterEach hooks to clean up test-created data.

**Rationale:**
- Ensures test isolation
- Prevents data accumulation
- Keeps database clean
- Tests can run multiple times

**Implementation:**
```typescript
const createdNoteIds: string[] = [];

afterEach(async () => {
  // Clean up created notes
  for (const id of createdNoteIds) {
    await prisma.note.delete({ where: { id } });
  }
  createdNoteIds.length = 0;
});
```

### 9. Error Handling in Tests

**Decision:** Test both success and error cases for each endpoint.

**Rationale:**
- Verifies error handling works correctly
- Ensures proper status codes are returned
- Validates error response structure
- Catches regressions in error logic

**Coverage:**
- Success cases (200, 201)
- Validation errors (400)
- Not found errors (404) - if applicable
- Database errors (500) - mock if needed

### 10. Test Coverage Goals

**Decision:** Aim for 80%+ coverage of API routes, focus on critical paths.

**Rationale:**
- High coverage ensures most code is tested
- Critical paths (validation, error handling) must be covered
- 100% coverage is often not worth the effort
- Balance between thoroughness and maintainability

**Priority:**
1. Validation logic (must be 100%)
2. Error handling (must be 100%)
3. Success paths (must be 100%)
4. Edge cases (aim for 80%+)

## Implementation Strategy

### Step 1: Implement Statuses API (15 minutes)

**File:** `app/api/statuses/route.ts`

Update imports:
```typescript
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { handleApiError } from "@/lib/api/error-handler";
```

Implement GET handler:
```typescript
export async function GET() {
  try {
    const statuses = await prisma.ticketStatus.findMany({
      select: {
        id: true,
        name: true,
        color: true
      }
    });
    
    return NextResponse.json(statuses);
  } catch (error) {
    return handleApiError(error);
  }
}
```

### Step 2: Manual Testing - Statuses API (10 minutes)

Test scenarios:
1. GET `/api/statuses` returns all statuses
2. Verify response matches seed data
3. Verify color values are valid
4. Test database error handling

### Step 3: Install Testing Dependencies (5 minutes)

```bash
yarn add -D jest @types/jest ts-jest supertest @types/supertest jest-environment-node
```

### Step 4: Configure Jest (10 minutes)

**File:** `jest.config.js`

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1'
  },
  testMatch: ['**/__tests__/**/*.test.ts'],
  collectCoverageFrom: [
    'app/api/**/*.ts',
    '!app/api/**/*.d.ts'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

### Step 5: Add Test Scripts (5 minutes)

**File:** `package.json`

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

### Step 6: Create Test Utilities (20 minutes)

**File:** `__tests__/utils/test-client.ts`

```typescript
import { NextResponse } from 'next/server';

export const testClient = {
  async get(path: string) {
    const request = new Request(`http://localhost:3000${path}`, {
      method: 'GET'
    });
    // Import and call route handler directly
    // Return response object
  },
  
  async post(path: string, body?: any) {
    const request = new Request(`http://localhost:3000${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined
    });
    // Import and call route handler directly
    // Return response object
  }
};
```

**File:** `__tests__/utils/test-db.ts`

```typescript
import { PrismaClient } from '@/lib/generated/prisma/client';

export const testPrisma = new PrismaClient();

export async function cleanupNotes(ids: string[]) {
  for (const id of ids) {
    try {
      await testPrisma.note.delete({ where: { id } });
    } catch (error) {
      // Ignore if already deleted
    }
  }
}

export async function disconnectDb() {
  await testPrisma.$disconnect();
}
```

### Step 7: Write Customers API Tests (30 minutes)

**File:** `__tests__/api/customers.test.ts`

Test cases:
1. GET all customers (success)
2. GET with phone filter (success)
3. GET with partial phone match (success)
4. GET with non-existent phone (empty array)
5. GET with invalid parameter (400 error)
6. Database error handling (500 error)

### Step 8: Write Notes API Tests (45 minutes)

**File:** `__tests__/api/notes.test.ts`

Test cases:
1. GET all notes (success)
2. GET with customerId filter (success)
3. GET with non-existent customerId (empty array)
4. POST with valid payload (201 created)
5. POST with missing fields (400 error)
6. POST with empty strings (400 error)
7. POST with non-existent customerId (400 error)
8. Database error handling (500 error)

### Step 9: Write Statuses API Tests (15 minutes)

**File:** `__tests__/api/statuses.test.ts`

Test cases:
1. GET all statuses (success)
2. Verify response structure
3. Verify color values are valid
4. Database error handling (500 error)

### Step 10: Run Tests and Fix Issues (30 minutes)

```bash
yarn test
```

Debug and fix any failing tests:
- Check test expectations
- Verify database queries
- Fix type errors
- Update test utilities if needed

### Step 11: Generate Coverage Report (5 minutes)

```bash
yarn test:coverage
```

Review coverage:
- Identify untested code paths
- Add tests for critical uncovered code
- Document coverage results

### Step 12: Document Test Results (10 minutes)

**File:** `docs/04-statuses-api-and-testing/TEST_RESULTS.md`

Document:
- Test execution summary
- Number of tests passed/failed
- Coverage statistics
- Known issues or limitations
- Instructions for running tests

## Risks & Mitigations

### Risk 1: Test Database Pollution

**Issue:** Tests might leave data in database, affecting subsequent test runs.

**Mitigation:**
- Aggressive cleanup in afterEach hooks
- Track created resource IDs
- Delete test data after each test
- Use unique identifiers for test data

### Risk 2: Test Flakiness Due to Timing

**Issue:** Tests might fail intermittently due to timing issues (e.g., Date.now()).

**Mitigation:**
- Use flexible assertions for timestamps
- Don't rely on exact millisecond precision
- Mock time-sensitive operations if needed
- Run tests multiple times to verify stability

### Risk 3: Parallel Test Execution Conflicts

**Issue:** Jest might run tests in parallel, causing database conflicts.

**Mitigation:**
- Configure Jest to run tests sequentially (default)
- Use unique test data identifiers
- Avoid shared state between tests
- Clean up after each test

### Risk 4: Database Connection Leaks

**Issue:** Tests might not close database connections, causing pool exhaustion.

**Mitigation:**
- Always close connections in afterAll hooks
- Use singleton pattern for test Prisma client
- Monitor connection count during test runs
- Add connection timeout configuration

### Risk 5: Test Environment Configuration

**Issue:** Tests might use wrong environment variables or database URL.

**Mitigation:**
- Create `.env.test` file for test environment
- Verify DATABASE_URL points to correct database
- Document test environment setup
- Use dotenv to load test environment

### Risk 6: Supertest Integration with Next.js App Router

**Issue:** Supertest is designed for Express, might not work directly with Next.js App Router.

**Mitigation:**
- Call route handlers directly instead of using Supertest
- Create test client that invokes route functions
- Test response objects returned by handlers
- Document approach in test utilities

### Risk 7: Mocking Database Errors

**Issue:** Difficult to simulate database errors in integration tests.

**Mitigation:**
- Use Prisma's error throwing capabilities
- Mock Prisma client methods if needed
- Focus on validation and success cases
- Document limitation in test results

### Risk 8: Test Maintenance Burden

**Issue:** Tests might become difficult to maintain as API evolves.

**Mitigation:**
- Write clear, descriptive test names
- Keep tests simple and focused
- Use test utilities to reduce duplication
- Document test patterns and conventions
- Review tests during code reviews

### Risk 9: TypeScript Type Errors in Tests

**Issue:** Tests might have TypeScript errors due to missing types or incorrect assertions.

**Mitigation:**
- Use strict TypeScript configuration
- Import types from source code
- Use type-safe matchers
- Run typecheck before running tests

### Risk 10: Test Execution Time

**Issue:** Integration tests might be slow due to database operations.

**Mitigation:**
- Run tests in parallel where safe
- Use database transactions for faster cleanup
- Mock slow operations if needed
- Set reasonable test timeouts
- Document expected test duration

## Dependencies

**Requires completion of:**
- Phase 1: Infrastructure (error handler, validation, Prisma setup)
- Phase 2: Customers API implementation
- Phase 3: Notes API implementation

**Blocks:**
- None (this is the final phase)

**Integration points:**
- All three API routes must be implemented before testing
- Test utilities depend on Prisma client
- Test data depends on database seed data

## Success Metrics

- All API routes return correct responses
- All tests pass (100% pass rate)
- Test coverage exceeds 80%
- Tests run in under 30 seconds
- No test flakiness (tests pass consistently)
- Test results are documented
- Developer can run tests with single command (`yarn test`)
