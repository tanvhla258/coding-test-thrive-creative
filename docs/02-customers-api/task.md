# Customers API - Task Breakdown

## Overview

Replace flat-file JSON operations in the customers API with Prisma MySQL queries. Implement phone filtering functionality and integrate centralized error handling and validation utilities from Phase 1.

## Phase 1: Database Query Implementation

### 1.1 Replace readData with Prisma Query

**File:** `app/api/customers/route.ts`

- [ ] Remove import of `readData` from `@/lib/db`
- [ ] Import `prisma` from `@/lib/db`
- [ ] Import `handleApiError` from `@/lib/api/error-handler`
- [ ] Import `validateRequest` from `@/lib/api/validate`
- [ ] Import `PhoneFilterSchema` from `@/lib/api/validators`
- [ ] Replace `readData<Customer[]>("customers.json")` with `prisma.customer.findMany()`
- [ ] Verify query returns all customers when no filter is applied
- [ ] Test endpoint returns 200 OK with customer array

### 1.2 Implement Phone Filtering

**File:** `app/api/customers/route.ts`

- [ ] Extract phone query parameter from URL search params
- [ ] Validate phone parameter using `PhoneFilterSchema` (optional string)
- [ ] Add Prisma `where` clause when phone parameter is provided
- [ ] Use Prisma `contains` operator for partial phone matching
- [ ] Test filtering with exact phone match (e.g., `?phone=512-555-0187`)
- [ ] Test filtering with partial phone match (e.g., `?phone=512`)
- [ ] Test filtering with non-existent phone returns empty array
- [ ] Verify response includes correct customer object structure

## Phase 2: Error Handling Integration

### 2.1 Add Error Handling

**File:** `app/api/customers/route.ts`

- [ ] Wrap GET handler in try-catch block
- [ ] Use `handleApiError()` in catch block to return structured error response
- [ ] Test error handling with database connection failure
- [ ] Test error handling with invalid query parameters
- [ ] Verify 500 errors include proper error message structure

### 2.2 Add Validation

**File:** `app/api/customers/route.ts`

- [ ] Validate phone query parameter before database query
- [ ] Return 400 Bad Request for invalid phone format
- [ ] Test validation rejects malformed phone parameters

## Phase 3: Response Formatting

### 3.1 Standardize Response Format

**File:** `app/api/customers/route.ts`

- [ ] Return success response with `success: true` and `data: customers[]`
- [ ] Ensure response includes all customer fields: id, name, phone, email, company, status
- [ ] Verify TypeScript types match `Customer` interface from `@/types`
- [ ] Remove any console.log statements used for debugging

## Phase 4: Testing

### 4.1 Manual Integration Testing

**File:** N/A (manual testing)

- [ ] Test GET `/api/customers` returns all customers from database
- [ ] Test GET `/api/customers?phone=512-555-0187` returns matching customer
- [ ] Test GET `/api/customers?phone=999` returns empty array
- [ ] Verify response data matches database seed data (not shell data from `app/page.tsx`)
- [ ] Test invalid query parameter returns 400 error
- [ ] Test database error returns 500 error with proper message

### 4.2 Automated Integration Test (Optional)

**File:** `__tests__/api/customers.test.ts` (if test framework is set up)

- [ ] Write test for GET all customers
- [ ] Write test for GET with phone filter
- [ ] Write test for GET with invalid phone parameter
- [ ] Write test for database error handling
- [ ] Ensure tests clean up after execution (close Prisma connection)

## Files to Modify

1. `app/api/customers/route.ts`

## Files to Create (Optional)

1. `__tests__/api/customers.test.ts` (if implementing automated tests)

## Success Criteria

- [ ] GET `/api/customers` returns all customers from MySQL database
- [ ] GET `/api/customers?phone=<value>` filters customers by phone (partial match supported)
- [ ] Response follows standardized format: `{ success: true, data: Customer[] }`
- [ ] Invalid query parameters return 400 Bad Request with error details
- [ ] Database errors return 500 Internal Server Error with structured error message
- [ ] TypeScript compilation passes with no errors
- [ ] Response data matches database seed data (verifies correct wiring)
- [ ] No flat-file JSON operations remain in the route
- [ ] Error responses follow REST conventions
