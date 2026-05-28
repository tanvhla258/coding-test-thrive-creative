# Data Structure

This folder is the source of truth for what the application should serve.

## Layout

```
data/
├── customers.json          # All customers
├── ticket_status.json      # Reference list of ticket statuses
├── cust_001/
│   ├── notes.json          # Notes belonging to cust_001
│   └── tickets.json        # Tickets belonging to cust_001
├── cust_002/
│   ├── notes.json
│   └── tickets.json
└── cust_003/
    ├── notes.json
    └── tickets.json
```

## How relationships work

The folder name **is** the foreign key. A note inside `cust_002/notes.json` belongs
to customer `cust_002` — there is no `customerId` field in the note itself because
the folder communicates that relationship.

When you move this data into a relational database, the folder name becomes the
`customer_id` foreign key column on your `notes` and `tickets` tables.

## What to build

Your API endpoints should serve this data as if it came from a database:

| Endpoint | Returns |
|----------|---------|
| `GET /api/customers` | All customers from `customers.json` |
| `GET /api/statuses` | All statuses from `ticket_status.json` |
| `GET /api/notes?customerId=cust_001` | Notes from `cust_001/notes.json` |
| `GET /api/tickets?customerId=cust_001` | Tickets from `cust_001/tickets.json` |
| `POST /api/notes` | Append a new note to the correct customer folder |
| `POST /api/tickets` | Append a new ticket to the correct customer folder |
