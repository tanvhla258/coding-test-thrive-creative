---
name: rest-api-builder
description: Handles the core design, architectural styling, and technical execution of robust REST APIs coupled with pragmatic integration testing.
---

When designing or upgrading a REST API, always:

1. **Strictly adhere to RESTful conventions**: Use appropriate HTTP Verbs (`GET`, `POST`, `PUT`, `DELETE`), resource-based paths, and accurate HTTP Status Codes (`200 OK`, `201 Created`, `400 Bad Request`, `404 Not Found`).
2. **Apply Pragmatic Testing**: Write integration tests immediately after completing an endpoint (ensuring stability at every step) to serve as a safety net before developing the UI.
3. **Handle Edge Cases Gracefully**: Ensure proper query parameter parsing for pagination/search, validate request payloads, and implement centralized error boundaries to prevent route crashes.

## Architectural Conventions

### 1. Hierarchical Resource Paths
Naturally map data dependencies and maintain clean REST structures for nested entities using resource-based URLs rather than functional actions:
*   Good: `GET /api/customers/:customerId/notes`
*   Bad: `POST /api/get-customer-notes`

### 2. Standardized HTTP Methods
*   `GET`: Retrieve resources (Idempotent). Must handle filtering, sorting, and pagination parameters cleanly.
*   `POST`: Create new resources. Must return `201 Created` along with the newly generated record payload.
*   `PUT`/`PATCH`: Update existing resources. Must return the updated entity or a `200 OK` status.
*   `DELETE`: Remove resources. Must return a proper success status (`200 OK` or `204 No Content`).

### 3. Predictable Error Responses
Never allow unhandled exceptions to bubble up as raw system crashes (`500 Internal Server Error`). Catch errors early and return semantic payloads:
*   `400 Bad Request`: For missing payload fields or malformed data types.
*   `404 Not Found`: For resource IDs that do not exist in the database.

## Technical Rationale

* **ORM for Data Fetching:** Standardizes data access, minimizes boilerplate raw SQL code, and leverages robust compile-time type-safety to eliminate runtime bugs.
* **HTTP Integration Testing:** Tests the actual lifecycle of HTTP requests hitting the database directly without relying on UI interactions, providing rapid feedback loops and regression tracking.
* **Database Teardown:** Mandate database connection cleanup blocks (e.g., closing client pools) within the test lifecycle hooks to prevent connection pool exhaustion during test execution runner cycles.