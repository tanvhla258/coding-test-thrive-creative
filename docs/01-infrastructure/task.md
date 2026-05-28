# Infrastructure - Centralized Error Handling & Validation

## Overview

Establish foundational utilities for centralized error handling, request validation, and ensure Prisma client is properly configured for all API routes. This phase creates the shared infrastructure that all subsequent API implementations will depend on.

## Phase 1: Error Handling Utilities

### 1.1 Create Error Handler Module

**File:** `lib/api/error-handler.ts`

- [ ] Create centralized error handler function that catches exceptions and returns structured error responses
- [ ] Implement error classification (validation errors, not found errors, database errors, unknown errors)
- [ ] Return appropriate HTTP status codes (400, 404, 500) with consistent error payload structure
- [ ] Add logging for debugging (console.error with error context)
- [ ] Export error handler for use in API routes

### 1.2 Define Error Response Types

**File:** `lib/api/types.ts`

- [ ] Define `ApiErrorResponse` interface with fields: `success: false`, `error: string`, `details?: any`
- [ ] Define `ApiSuccessResponse<T>` generic interface with fields: `success: true`, `data: T`
- [ ] Export types for use across API routes

## Phase 2: Validation Utilities

### 2.1 Install Validation Library

**File:** `package.json`

- [ ] Install Zod: `yarn add zod`
- [ ] Verify installation in dependencies

### 2.2 Create Validation Schemas

**File:** `lib/api/validators.ts`

- [ ] Create `CreateNoteSchema` with fields: `customerId` (string), `text` (string, min 1 char), `author` (string, min 1 char)
- [ ] Create `PhoneFilterSchema` for optional phone query parameter
- [ ] Create `CustomerIdFilterSchema` for optional customerId query parameter
- [ ] Export all validation schemas

### 2.3 Create Validation Helper

**File:** `lib/api/validate.ts`

- [ ] Create `validateRequest<T>(schema, data)` function that validates and returns typed result
- [ ] Return validation errors in structured format (400 Bad Request)
- [ ] Handle Zod validation errors and format them for API responses

## Phase 3: Prisma Client Verification

### 3.1 Verify Prisma Setup

**File:** `lib/db.ts`

- [ ] Confirm Prisma client is properly instantiated with connection pooling
- [ ] Verify DATABASE_URL environment variable is set in `.env`
- [ ] Test database connection with `prisma.$connect()`
- [ ] Ensure global singleton pattern prevents multiple instances in development

### 3.2 Generated Types Check

**File:** `lib/generated/prisma/`

- [ ] Verify Prisma client types are generated for Customer, Note, TicketStatus models
- [ ] Confirm TypeScript types match the schema in `prisma/schema.prisma`

## Files to Create

1. `lib/api/error-handler.ts`
2. `lib/api/types.ts`
3. `lib/api/validators.ts`
4. `lib/api/validate.ts`

## Files to Modify

1. `package.json` (add Zod dependency)
2. `lib/db.ts` (verify and document Prisma setup)

## Success Criteria

- [ ] Centralized error handler returns consistent error responses for all error types
- [ ] Validation schemas are defined for all request payloads and query parameters
- [ ] Validation helper properly rejects invalid requests with 400 status
- [ ] Prisma client connects to MySQL database successfully
- [ ] TypeScript types are properly exported and available for import
- [ ] All utilities follow TypeScript strict mode (no implicit any)
- [ ] Error responses follow REST conventions with semantic HTTP status codes
