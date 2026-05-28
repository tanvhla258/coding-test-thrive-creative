# Statuses API & Integration Testing - Task Breakdown

## Overview

Complete the API migration by replacing the statuses API with Prisma queries and implementing comprehensive integration tests for all three API routes. This phase ensures all endpoints work correctly with the database and provides automated test coverage for regression prevention.

## Phase 1: Statuses API Implementation

### 1.1 Replace readData with Prisma Query

**File:** `app/api/statuses/route.ts`

- [ ] Remove import of `readData` from `@/lib/db`
- [ ] Import `prisma` from `@/lib/db`
- [ ] Import `handleApiError` from `@/lib/api/error-handler`
- [ ] Replace `readData<TicketStatus[]>("ticket_status.json")` with `prisma.ticketStatus.findMany()`
- [ ] Verify query returns all ticket statuses
- [ ] Test endpoint returns 200 OK with statuses array

### 1.2 Add Error Handling

**File:** `app/api/statuses/route.ts`

- [ ] Wrap GET handler in try-catch block
- [ ] Use `handleApiError()` in catch block
- [ ] Test error handling with database connection failure
- [ ] Verify 500 errors include proper error message structure

### 1.3 Standardize Response Format

**File:** `app/api/statuses/route.ts`

- [ ] Return statuses array directly (not wrapped in envelope)
- [ ] Ensure response includes all status fields: id, name, color
- [ ] Verify TypeScript types match `TicketStatus` interface from `@/types`
- [ ] Select only fields defined in TypeScript interface
- [ ] Remove any console.log statements

### 1.4 Manual Testing

**File:** N/A (manual testing)

- [ ] Test GET `/api/statuses` returns all statuses from database
- [ ] Verify response data matches database seed data
- [ ] Test database error returns 500 error
- [ ] Verify color field matches expected values: blue, yellow, orange, green, gray

## Phase 2: Test Framework Setup

### 2.1 Install Testing Dependencies

**File:** `package.json`

- [ ] Install Jest: `yarn add -D jest @types/jest ts-jest`
- [ ] Install Supertest: `yarn add -D supertest @types/supertest`
- [ ] Install test environment: `yarn add -D jest-environment-node`
- [ ] Verify installation in devDependencies

### 2.2 Configure Jest

**File:** `jest.config.js`

- [ ] Create Jest configuration file
- [ ] Set preset to `ts-jest` for TypeScript support
- [ ] Set test environment to `node`
- [ ] Configure module name mapper for `@/*` path alias
- [ ] Set test match pattern to `__tests__/**/*.test.ts`
- [ ] Configure setup and teardown hooks

### 2.3 Add Test Scripts

**File:** `package.json`

- [ ] Add `"test": "jest"` script
- [ ] Add `"test:watch": "jest --watch"` script
- [ ] Add `"test:coverage": "jest --coverage"` script
- [ ] Verify scripts run successfully

### 2.4 Create Test Utilities

**File:** `__tests__/utils/test-client.ts`

- [ ] Create test client that makes HTTP requests to API routes
- [ ] Implement helper functions for GET and POST requests
- [ ] Add request/response type definitions
- [ ] Export utilities for use in test files

### 2.5 Create Database Test Utilities

**File:** `__tests__/utils/test-db.ts`

- [ ] Create database cleanup function to reset test data
- [ ] Implement Prisma client singleton for tests
- [ ] Add connection setup and teardown functions
- [ ] Ensure proper cleanup after each test suite

## Phase 3: Customers API Integration Tests

### 3.1 Create Test File

**File:** `__tests__/api/customers.test.ts`

- [ ] Create test suite for customers API
- [ ] Import test utilities and database helpers
- [ ] Set up beforeAll hook to initialize database connection
- [ ] Set up afterAll hook to close database connection
- [ ] Set up afterEach hook to clean up test data

### 3.2 Test GET All Customers

**File:** `__tests__/api/customers.test.ts`

- [ ] Write test: GET `/api/customers` returns 200 status
- [ ] Verify response is array of customers
- [ ] Verify response includes all customer fields
- [ ] Verify response matches database seed data
- [ ] Verify response does NOT match shell data from `app/page.tsx`

### 3.3 Test GET with Phone Filter

**File:** `__tests__/api/customers.test.ts`

- [ ] Write test: GET `/api/customers?phone=512-555-0187` returns matching customer
- [ ] Write test: GET `/api/customers?phone=512` returns partial matches
- [ ] Write test: GET `/api/customers?phone=999-999-9999` returns empty array
- [ ] Verify filtered results are correct

### 3.4 Test Error Handling

**File:** `__tests__/api/customers.test.ts`

- [ ] Write test: Invalid query parameter returns 400 error
- [ ] Verify error response has correct structure
- [ ] Write test: Database error returns 500 error (mock if needed)

## Phase 4: Notes API Integration Tests

### 4.1 Create Test File

**File:** `__tests__/api/notes.test.ts`

- [ ] Create test suite for notes API
- [ ] Import test utilities and database helpers
- [ ] Set up beforeAll hook to initialize database connection
- [ ] Set up afterAll hook to close database connection
- [ ] Set up afterEach hook to clean up created notes

### 4.2 Test GET All Notes

**File:** `__tests__/api/notes.test.ts`

- [ ] Write test: GET `/api/notes` returns 200 status
- [ ] Verify response is array of notes
- [ ] Verify response includes all note fields
- [ ] Verify response matches database seed data

### 4.3 Test GET with Customer Filter

**File:** `__tests__/api/notes.test.ts`

- [ ] Write test: GET `/api/notes?customerId=cust_001` returns notes for customer
- [ ] Write test: GET `/api/notes?customerId=cust_999` returns empty array
- [ ] Verify filtered results are correct

### 4.4 Test POST Create Note - Success Cases

**File:** `__tests__/api/notes.test.ts`

- [ ] Write test: POST `/api/notes` with valid payload returns 201 status
- [ ] Verify created note has generated id
- [ ] Verify created note has createdAt timestamp
- [ ] Verify created note is persisted in database
- [ ] Verify created note is retrievable via GET endpoint

### 4.5 Test POST Create Note - Validation Errors

**File:** `__tests__/api/notes.test.ts`

- [ ] Write test: POST with missing customerId returns 400
- [ ] Write test: POST with missing text returns 400
- [ ] Write test: POST with missing author returns 400
- [ ] Write test: POST with empty strings returns 400
- [ ] Verify error responses have correct structure

### 4.6 Test POST Create Note - Foreign Key Validation

**File:** `__tests__/api/notes.test.ts`

- [ ] Write test: POST with non-existent customerId returns 400
- [ ] Verify error message indicates customer not found

### 4.7 Test Error Handling

**File:** `__tests__/api/notes.test.ts`

- [ ] Write test: Invalid query parameter returns 400 error
- [ ] Verify error response has correct structure
- [ ] Write test: Database error returns 500 error (mock if needed)

## Phase 5: Statuses API Integration Tests

### 5.1 Create Test File

**File:** `__tests__/api/statuses.test.ts`

- [ ] Create test suite for statuses API
- [ ] Import test utilities and database helpers
- [ ] Set up beforeAll hook to initialize database connection
- [ ] Set up afterAll hook to close database connection

### 5.2 Test GET All Statuses

**File:** `__tests__/api/statuses.test.ts`

- [ ] Write test: GET `/api/statuses` returns 200 status
- [ ] Verify response is array of statuses
- [ ] Verify response includes all status fields: id, name, color
- [ ] Verify response matches database seed data
- [ ] Verify color values are valid: blue, yellow, orange, green, gray

### 5.3 Test Error Handling

**File:** `__tests__/api/statuses.test.ts`

- [ ] Write test: Database error returns 500 error (mock if needed)
- [ ] Verify error response has correct structure

## Phase 6: Test Execution & Verification

### 6.1 Run All Tests

**File:** N/A (test execution)

- [ ] Run `yarn test` to execute all test suites
- [ ] Verify all tests pass
- [ ] Check test coverage report
- [ ] Identify any failing tests

### 6.2 Fix Failing Tests

**File:** Various test files

- [ ] Debug and fix any failing tests
- [ ] Update test expectations if needed
- [ ] Verify fixes don't break other tests
- [ ] Re-run tests to confirm all pass

### 6.3 Document Test Results

**File:** `docs/04-statuses-api-and-testing/TEST_RESULTS.md`

- [ ] Document test execution results
- [ ] List all test cases and their status
- [ ] Note any known issues or limitations
- [ ] Provide instructions for running tests

## Files to Create

1. `__tests__/utils/test-client.ts`
2. `__tests__/utils/test-db.ts`
3. `__tests__/api/customers.test.ts`
4. `__tests__/api/notes.test.ts`
5. `__tests__/api/statuses.test.ts`
6. `jest.config.js`
7. `docs/04-statuses-api-and-testing/TEST_RESULTS.md`

## Files to Modify

1. `app/api/statuses/route.ts`
2. `package.json` (add test scripts and dependencies)

## Success Criteria

- [ ] GET `/api/statuses` returns all ticket statuses from MySQL database
- [ ] Response includes all status fields: id, name, color
- [ ] Response data matches database seed data (verifies correct wiring)
- [ ] Database errors return 500 Internal Server Error with structured error message
- [ ] TypeScript compilation passes with no errors
- [ ] No flat-file JSON operations remain in the route
- [ ] Jest test framework is properly configured
- [ ] All test scripts run successfully (`yarn test`)
- [ ] Integration tests cover all three API routes
- [ ] Tests verify correct database wiring (not shell data)
- [ ] Tests cover success cases, validation errors, and database errors
- [ ] Tests clean up after execution (no leftover test data)
- [ ] Tests close database connections after execution
- [ ] Test coverage is reasonable (core functionality covered)
- [ ] Test results are documented
- [ ] All API routes work correctly with MySQL database
- [ ] Error handling is consistent across all routes
- [ ] Validation is enforced for all request payloads
