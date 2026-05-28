# Frontend Wiring - Task Breakdown

## Overview

Replace hardcoded shell data in React components with live data fetched from existing API endpoints.

## Phase 1: Fetch Customers

### Task 1.1: Replace shell customers with API call

**File:** `app/page.tsx`

- [ ] Remove `SHELL_CUSTOMERS` constant
- [ ] Initialize `customers` state with empty array `[]`
- [ ] Add `useEffect` to fetch `/api/customers` on component mount
- [ ] Extract `data` field from response: `const { data } = await response.json()`
- [ ] Update `customers` state with extracted data
- [ ] Add basic error handling with console.error

### Task 1.2: Verify customer data renders

- [ ] Start dev server with `yarn start`
- [ ] Verify customer list shows: Sarah Chen, Marcus Rodriguez, Priya Patel
- [ ] Confirm no shell data (Jane Doe, Bob Smith, Alice Johnson) appears

## Phase 2: Fetch Notes on Customer Selection

### Task 2.1: Replace shell notes with API call

**File:** `app/page.tsx`

- [ ] Remove `SHELL_NOTES` constant
- [ ] Initialize `notes` state with empty array `[]`
- [ ] Update `useEffect` to fetch `/api/customers/${selectedCustomer.id}/notes`
- [ ] Extract `data` field from response
- [ ] Update `notes` state with extracted data
- [ ] Add basic error handling with console.error

### Task 2.2: Verify notes load per customer

- [ ] Select Sarah Chen (cust_001) - should show 2 notes
- [ ] Select Marcus Rodriguez (cust_002) - should show 1 note
- [ ] Select Priya Patel (cust_003) - should show 0 notes
- [ ] Verify notes change when switching customers

## Phase 3: Wire Up Add Note Form

### Task 3.1: Implement POST request

**File:** `app/page.tsx`

- [ ] Update `handleAddNote` function
- [ ] POST to `/api/customers/${selectedCustomer.id}/notes`
- [ ] Send body: `{ text, author }` (customerId comes from URL)
- [ ] Set `Content-Type: application/json` header
- [ ] Add error handling for failed requests

### Task 3.2: Refresh notes after adding

**File:** `app/page.tsx`

- [ ] After successful POST, re-fetch notes for selected customer
- [ ] Verify new note appears in the list
- [ ] Verify form clears after submission

## Phase 4: Fetch Tickets on Customer Selection

### Task 4.1: Replace shell tickets with API call

**File:** `app/components/TicketsPane.tsx`

- [ ] Remove `SHELL_TICKETS` constant
- [ ] Add `useState` for `tickets` initialized with empty array `[]`
- [ ] Add `useEffect` to fetch `/api/customers/${customer.id}/tickets`
- [ ] Extract `data` field from response
- [ ] Update `tickets` state with extracted data
- [ ] Add basic error handling with console.error

### Task 4.2: Update ticket rendering

**File:** `app/components/TicketsPane.tsx`

- [ ] Map over `tickets` instead of `SHELL_TICKETS`
- [ ] Use `ticket.subject` instead of `ticket.title`
- [ ] Use `ticket.status.name` for status text
- [ ] Use `ticket.status.color` for status badge color
- [ ] Verify tickets display with correct data

### Task 4.3: Verify tickets load per customer

- [ ] Select different customers
- [ ] Verify tickets change based on selected customer
- [ ] Verify status badges display with correct colors

## Phase 5: Wire Up Add Ticket Form

### Task 5.1: Fetch ticket statuses

**File:** `app/components/TicketsPane.tsx`

- [ ] Add `useState` for `statuses` initialized with empty array
- [ ] Add `useEffect` to fetch `/api/ticket-statuses` on component mount
- [ ] Extract `data` field from response
- [ ] Use statuses to populate status dropdown

### Task 5.2: Implement POST request

**File:** `app/components/TicketsPane.tsx`

- [ ] Create `handleAddTicket` function
- [ ] POST to `/api/customers/${customer.id}/tickets`
- [ ] Send body: `{ subject, description, statusId }`
- [ ] Set `Content-Type: application/json` header
- [ ] Add error handling for failed requests

### Task 5.3: Refresh tickets after adding

**File:** `app/components/TicketsPane.tsx`

- [ ] After successful POST, re-fetch tickets for selected customer
- [ ] Verify new ticket appears in the list
- [ ] Verify modal closes after submission

## Files to Modify

1. `app/page.tsx` - Replace shell data with API calls for customers and notes
2. `app/components/TicketsPane.tsx` - Replace shell tickets with API calls

## Files to Create

None - all components already exist.

## Success Criteria

- [ ] Customer list displays 3 real customers from database
- [ ] Selecting a customer loads their notes from API
- [ ] Selecting a customer loads their tickets from API
- [ ] Notes update when switching between customers
- [ ] Tickets update when switching between customers
- [ ] Add note form creates note via POST request
- [ ] Add ticket form creates ticket via POST request
- [ ] New note appears in list after creation
- [ ] New ticket appears in list after creation
- [ ] No shell/placeholder data visible anywhere
- [ ] Ticket status badges display with correct colors
- [ ] No TypeScript errors
- [ ] No console errors during normal usage

## Testing Checklist

- [ ] Start dev server: `yarn start`
- [ ] Open browser to `http://localhost:3000`
- [ ] Verify customer list shows real data
- [ ] Click each customer and verify notes load
- [ ] Click each customer and verify tickets load
- [ ] Add a new note and verify it appears
- [ ] Add a new ticket and verify it appears
- [ ] Switch customers and verify data changes
- [ ] Check browser console for errors
