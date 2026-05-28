# Frontend Wiring - Implementation Plan

## Overview

Connect the React UI components to the existing REST API endpoints, replacing hardcoded shell data with live data from the database. Focus on basic data fetching and state management using standard React hooks.

## Current State

**Existing API Endpoints:**
- `GET /api/customers` - Returns all customers (with optional `?phone=` filter)
- `PUT /api/customers/[customerId]` - Update a customer
- `GET /api/customers/[customerId]/notes` - Returns notes for a specific customer
- `POST /api/customers/[customerId]/notes` - Create a note for a customer
- `GET /api/customers/[customerId]/tickets` - Returns tickets with status for a customer
- `POST /api/customers/[customerId]/tickets` - Create a ticket for a customer
- `GET /api/ticket-statuses` - Returns all ticket statuses

**Response Shape:**
All endpoints return `{ success: true, data: [...] }` or `{ success: false, error: "..." }`

**Current UI Components:**
- `app/page.tsx` - Uses `SHELL_CUSTOMERS` and `SHELL_NOTES` placeholder data
- `app/components/CustomerList.tsx` - Receives customers via props
- `app/components/NotesPane.tsx` - Receives notes via props, has add note form
- `app/components/TicketsPane.tsx` - Uses hardcoded `SHELL_TICKETS` array

## Architecture

```
┌─────────────────┐
│   page.tsx      │ ──┬──> GET /api/customers (on mount)
│   (container)   │   ├──> GET /api/customers/:id/notes (on customer select)
└────────┬────────┘   └──> GET /api/customers/:id/tickets (on customer select)
         │
         ├─> CustomerList (display customers)
         ├─> NotesPane (display notes, add note form)
         └─> TicketsPane (display tickets with status)
```

## Technical Decisions

- **Use `useState` + `useEffect`**: Standard React hooks for simplicity
- **Native `fetch` API**: No need for axios or SWR for this basic use case
- **Nested routes**: Use `/api/customers/:id/notes` and `/api/customers/:id/tickets` to match API structure
- **Response unwrapping**: Extract `data` field from `{ success, data }` response shape
- **Error handling**: Basic try-catch with console.error, no UI error states yet
- **Type safety**: Use existing `Customer`, `Note`, `Ticket` interfaces from `types.ts`

## Implementation Strategy

### Phase 1: Fetch Customers on Mount
1. Replace `SHELL_CUSTOMERS` with empty array `[]` as initial state
2. Add `useEffect` that fetches `/api/customers` on component mount
3. Extract `data` from response and update `customers` state
4. Verify UI renders real customer data (Sarah Chen, Marcus Rodriguez, Priya Patel)

### Phase 2: Fetch Notes on Customer Selection
1. Replace `SHELL_NOTES` with empty array `[]` as initial state
2. Update `useEffect` to fetch `/api/customers/${id}/notes` when customer is selected
3. Extract `data` from response and update `notes` state
4. Verify notes change when different customers are selected

### Phase 3: Wire Up Add Note Form
1. Implement `handleAddNote` to POST to `/api/customers/${id}/notes`
2. Send `{ text, author }` in request body (customerId comes from URL)
3. On success, re-fetch notes for the selected customer
4. Verify new note appears in the list after submission

### Phase 4: Fetch Tickets on Customer Selection
1. Remove `SHELL_TICKETS` constant from `TicketsPane.tsx`
2. Add `useState` for tickets with empty array
3. Add `useEffect` to fetch `/api/customers/${id}/tickets` when customer changes
4. Update ticket rendering to use API data
5. Map status color from nested status object
6. Verify tickets display with correct status badges

### Phase 5: Wire Up Add Ticket Form
1. Implement POST to `/api/customers/${id}/tickets`
2. Send `{ subject, description, statusId }` in request body
3. Fetch ticket statuses from `/api/ticket-statuses` for status dropdown
4. On success, re-fetch tickets for the selected customer
5. Verify new ticket appears in the list

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| API returns unexpected shape | Verify response structure matches types |
| Network errors | Add basic error handling with console.error |
| Race conditions (rapid customer switching) | Accept for now; can add abort controllers later |
| No loading states | Accept for now; UI will show empty state briefly |
| Ticket status mapping | Fetch statuses separately and use for dropdown |

## Success Criteria

- [ ] Customer list shows real data from database (3 customers)
- [ ] Selecting a customer loads their notes
- [ ] Selecting a customer loads their tickets
- [ ] Notes change when switching between customers
- [ ] Tickets change when switching between customers
- [ ] Add note form creates a new note and refreshes the list
- [ ] Add ticket form creates a new ticket and refreshes the list
- [ ] No shell/placeholder data visible anywhere
- [ ] Ticket status badges display with correct colors
