# TDD Setup Guide — Customer Notes CRM

## Phase 1: Install Test Infrastructure

```bash
# Core testing dependencies
yarn add -D jest @types/jest ts-jest

# MySQL client for integration tests
yarn add mysql2

# Optional: for testing Next.js request/response objects more easily
yarn add -D node-mocks-http
```

---

## Phase 2: Configuration Files

### Create `jest.config.js`

```js
/** @type {import('jest').Config} */
const config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>'],
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/__tests__/**/*.integration.test.ts'
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1'
  },
  collectCoverageFrom: [
    'lib/**/*.ts',
    'app/api/**/*.ts',
    '!**/*.d.ts',
    '!**/node_modules/**'
  ],
  coverageDirectory: 'coverage',
  verbose: true
};

module.exports = config;
```

### Create `jest.setup.js`

```js
// Global setup for Jest
beforeAll(() => {
  process.env.NODE_ENV = 'test';
});

afterAll(async () => {
  // Cleanup any open database connections
});
```

### Update `package.json` scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next dev --hostname 0.0.0.0",
    "test": "jest",
    "test:unit": "jest --testPathIgnorePatterns=integration",
    "test:integration": "jest --testPathPattern=integration",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

### Create `tsconfig.test.json`

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "module": "commonjs",
    "types": ["jest", "node"]
  },
  "include": [
    "**/*.ts",
    "**/*.test.ts"
  ]
}
```

---

## Phase 3: Database Test Utilities

### Create `lib/__tests__/helpers/test-db.ts`

```typescript
import mysql from 'mysql2/promise';

const TEST_DB_CONFIG = {
  host: 'localhost',
  port: 3306,
  user: 'test',
  password: 'test',
  database: 'test_crm_test',
  multipleStatements: true
};

export async function createTestDatabase() {
  const connection = await mysql.createConnection({
    host: TEST_DB_CONFIG.host,
    port: TEST_DB_CONFIG.port,
    user: TEST_DB_CONFIG.user,
    password: TEST_DB_CONFIG.password
  });

  await connection.query(`DROP DATABASE IF EXISTS ${TEST_DB_CONFIG.database}`);
  await connection.query(`CREATE DATABASE ${TEST_DB_CONFIG.database}`);
  await connection.end();

  const testConnection = await mysql.createConnection(TEST_DB_CONFIG);
  
  // Read and execute schema
  const fs = await import('fs/promises');
  const path = await import('path');
  const schemaPath = path.join(process.cwd(), 'db', 'init.sql');
  const schema = await fs.readFile(schemaPath, 'utf-8');
  
  await testConnection.query(schema);
  await testConnection.end();
}

export async function destroyTestDatabase() {
  const connection = await mysql.createConnection({
    host: TEST_DB_CONFIG.host,
    port: TEST_DB_CONFIG.port,
    user: TEST_DB_CONFIG.user,
    password: TEST_DB_CONFIG.password
  });

  await connection.query(`DROP DATABASE IF EXISTS ${TEST_DB_CONFIG.database}`);
  await connection.end();
}

export async function getTestConnection() {
  return await mysql.createConnection(TEST_DB_CONFIG);
}

export async function clearTestData() {
  const connection = await getTestConnection();
  await connection.query('DELETE FROM notes');
  await connection.query('DELETE FROM customers');
  await connection.query('DELETE FROM ticket_statuses');
  await connection.end();
}
```

---

## Phase 4: Unit Tests (Write First — They Should Fail)

### Create `lib/__tests__/db.test.ts`

```typescript
import { getCustomers, getNotes, createNote, getStatuses } from '@/lib/db';

// Mock mysql2
jest.mock('mysql2/promise', () => ({
  createPool: jest.fn(() => ({
    query: jest.fn(),
    end: jest.fn()
  }))
}));

describe('Database Layer', () => {
  describe('getCustomers', () => {
    it('should return all customers when no phone filter provided', async () => {
      const customers = await getCustomers();
      
      expect(Array.isArray(customers)).toBe(true);
      expect(customers.length).toBeGreaterThan(0);
      expect(customers[0]).toHaveProperty('id');
      expect(customers[0]).toHaveProperty('name');
      expect(customers[0]).toHaveProperty('phone');
      expect(customers[0]).toHaveProperty('email');
      expect(customers[0]).toHaveProperty('company');
      expect(customers[0]).toHaveProperty('status');
    });

    it('should filter customers by phone when phone parameter provided', async () => {
      const customers = await getCustomers('415-555-0123');
      
      expect(Array.isArray(customers)).toBe(true);
      expect(customers.length).toBe(1);
      expect(customers[0].phone).toBe('415-555-0123');
    });

    it('should return empty array when phone does not match', async () => {
      const customers = await getCustomers('999-999-9999');
      
      expect(Array.isArray(customers)).toBe(true);
      expect(customers.length).toBe(0);
    });
  });

  describe('getNotes', () => {
    it('should return all notes when no customerId filter provided', async () => {
      const notes = await getNotes();
      
      expect(Array.isArray(notes)).toBe(true);
      expect(notes.length).toBeGreaterThan(0);
      expect(notes[0]).toHaveProperty('id');
      expect(notes[0]).toHaveProperty('customerId');
      expect(notes[0]).toHaveProperty('text');
      expect(notes[0]).toHaveProperty('author');
      expect(notes[0]).toHaveProperty('createdAt');
    });

    it('should filter notes by customerId when parameter provided', async () => {
      const notes = await getNotes('cust_001');
      
      expect(Array.isArray(notes)).toBe(true);
      expect(notes.length).toBeGreaterThan(0);
      notes.forEach(note => {
        expect(note.customerId).toBe('cust_001');
      });
    });

    it('should return empty array when customerId does not exist', async () => {
      const notes = await getNotes('cust_999');
      
      expect(Array.isArray(notes)).toBe(true);
      expect(notes.length).toBe(0);
    });
  });

  describe('createNote', () => {
    it('should create a new note and return it with generated id', async () => {
      const noteData = {
        customerId: 'cust_001',
        text: 'Test note content',
        author: 'Test Author'
      };

      const createdNote = await createNote(noteData);

      expect(createdNote).toHaveProperty('id');
      expect(createdNote.id).toMatch(/^note_/);
      expect(createdNote.customerId).toBe(noteData.customerId);
      expect(createdNote.text).toBe(noteData.text);
      expect(createdNote.author).toBe(noteData.author);
      expect(createdNote).toHaveProperty('createdAt');
    });

    it('should throw error when customerId does not exist', async () => {
      const noteData = {
        customerId: 'cust_999',
        text: 'Test note',
        author: 'Test Author'
      };

      await expect(createNote(noteData)).rejects.toThrow();
    });
  });

  describe('getStatuses', () => {
    it('should return all ticket statuses', async () => {
      const statuses = await getStatuses();
      
      expect(Array.isArray(statuses)).toBe(true);
      expect(statuses.length).toBeGreaterThan(0);
      expect(statuses[0]).toHaveProperty('id');
      expect(statuses[0]).toHaveProperty('name');
      expect(statuses[0]).toHaveProperty('color');
    });
  });
});
```

### Create `app/api/__tests__/customers.test.ts`

```typescript
import { GET } from '@/app/api/customers/route';
import { NextRequest } from 'next/server';

// Mock the db module
jest.mock('@/lib/db', () => ({
  getCustomers: jest.fn()
}));

import { getCustomers } from '@/lib/db';

const mockGetCustomers = getCustomers as jest.MockedFunction<typeof getCustomers>;

describe('GET /api/customers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return all customers when no phone filter', async () => {
    const mockCustomers = [
      {
        id: 'cust_001',
        name: 'Sarah Chen',
        phone: '415-555-0123',
        email: 'sarah@acme.com',
        company: 'Acme Corp',
        status: 'active' as const
      }
    ];

    mockGetCustomers.mockResolvedValue(mockCustomers);

    const request = new NextRequest('http://localhost:3000/api/customers');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(mockCustomers);
    expect(mockGetCustomers).toHaveBeenCalledWith(undefined);
  });

  it('should filter customers by phone when query param provided', async () => {
    const mockCustomers = [
      {
        id: 'cust_001',
        name: 'Sarah Chen',
        phone: '415-555-0123',
        email: 'sarah@acme.com',
        company: 'Acme Corp',
        status: 'active' as const
      }
    ];

    mockGetCustomers.mockResolvedValue(mockCustomers);

    const request = new NextRequest('http://localhost:3000/api/customers?phone=415-555-0123');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(mockCustomers);
    expect(mockGetCustomers).toHaveBeenCalledWith('415-555-0123');
  });

  it('should return empty array when no customers match', async () => {
    mockGetCustomers.mockResolvedValue([]);

    const request = new NextRequest('http://localhost:3000/api/customers?phone=999-999-9999');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual([]);
  });

  it('should handle database errors gracefully', async () => {
    mockGetCustomers.mockRejectedValue(new Error('Database connection failed'));

    const request = new NextRequest('http://localhost:3000/api/customers');
    
    await expect(GET(request)).rejects.toThrow('Database connection failed');
  });
});
```

### Create `app/api/__tests__/notes.test.ts`

```typescript
import { GET, POST } from '@/app/api/notes/route';
import { NextRequest } from 'next/server';

// Mock the db module
jest.mock('@/lib/db', () => ({
  getNotes: jest.fn(),
  createNote: jest.fn()
}));

import { getNotes, createNote } from '@/lib/db';

const mockGetNotes = getNotes as jest.MockedFunction<typeof getNotes>;
const mockCreateNote = createNote as jest.MockedFunction<typeof createNote>;

describe('GET /api/notes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return all notes when no customerId filter', async () => {
    const mockNotes = [
      {
        id: 'note_001',
        customerId: 'cust_001',
        text: 'Test note',
        author: 'Alex Rivera',
        createdAt: '2025-05-15T10:30:00.000Z'
      }
    ];

    mockGetNotes.mockResolvedValue(mockNotes);

    const request = new NextRequest('http://localhost:3000/api/notes');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(mockNotes);
    expect(mockGetNotes).toHaveBeenCalledWith(undefined);
  });

  it('should filter notes by customerId when query param provided', async () => {
    const mockNotes = [
      {
        id: 'note_001',
        customerId: 'cust_001',
        text: 'Test note',
        author: 'Alex Rivera',
        createdAt: '2025-05-15T10:30:00.000Z'
      }
    ];

    mockGetNotes.mockResolvedValue(mockNotes);

    const request = new NextRequest('http://localhost:3000/api/notes?customerId=cust_001');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(mockNotes);
    expect(mockGetNotes).toHaveBeenCalledWith('cust_001');
  });
});

describe('POST /api/notes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a new note with valid data', async () => {
    const noteData = {
      customerId: 'cust_001',
      text: 'New test note',
      author: 'Test Author'
    };

    const createdNote = {
      id: 'note_1234567890',
      ...noteData,
      createdAt: new Date().toISOString()
    };

    mockCreateNote.mockResolvedValue(createdNote);

    const request = new NextRequest('http://localhost:3000/api/notes', {
      method: 'POST',
      body: JSON.stringify(noteData)
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data).toEqual(createdNote);
    expect(mockCreateNote).toHaveBeenCalledWith(noteData);
  });

  it('should return 400 when customerId is missing', async () => {
    const noteData = {
      text: 'Test note',
      author: 'Test Author'
    };

    const request = new NextRequest('http://localhost:3000/api/notes', {
      method: 'POST',
      body: JSON.stringify(noteData)
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
  });

  it('should return 400 when text is missing', async () => {
    const noteData = {
      customerId: 'cust_001',
      author: 'Test Author'
    };

    const request = new NextRequest('http://localhost:3000/api/notes', {
      method: 'POST',
      body: JSON.stringify(noteData)
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
  });

  it('should return 400 when author is missing', async () => {
    const noteData = {
      customerId: 'cust_001',
      text: 'Test note'
    };

    const request = new NextRequest('http://localhost:3000/api/notes', {
      method: 'POST',
      body: JSON.stringify(noteData)
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
  });

  it('should handle database errors', async () => {
    const noteData = {
      customerId: 'cust_001',
      text: 'Test note',
      author: 'Test Author'
    };

    mockCreateNote.mockRejectedValue(new Error('Foreign key constraint failed'));

    const request = new NextRequest('http://localhost:3000/api/notes', {
      method: 'POST',
      body: JSON.stringify(noteData)
    });

    await expect(POST(request)).rejects.toThrow();
  });
});
```

### Create `app/api/__tests__/statuses.test.ts`

```typescript
import { GET } from '@/app/api/statuses/route';

// Mock the db module
jest.mock('@/lib/db', () => ({
  getStatuses: jest.fn()
}));

import { getStatuses } from '@/lib/db';

const mockGetStatuses = getStatuses as jest.MockedFunction<typeof getStatuses>;

describe('GET /api/statuses', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return all ticket statuses', async () => {
    const mockStatuses = [
      { id: 'status_1', name: 'Open', color: 'blue' as const },
      { id: 'status_2', name: 'In Progress', color: 'yellow' as const },
      { id: 'status_3', name: 'Waiting on Customer', color: 'orange' as const }
    ];

    mockGetStatuses.mockResolvedValue(mockStatuses);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(mockStatuses);
    expect(mockGetStatuses).toHaveBeenCalled();
  });

  it('should return empty array when no statuses exist', async () => {
    mockGetStatuses.mockResolvedValue([]);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual([]);
  });
});
```

---

## Phase 5: Integration Tests (Write After Unit Tests Pass)

### Create `lib/__tests__/db.integration.test.ts`

```typescript
import { 
  createTestDatabase, 
  destroyTestDatabase, 
  clearTestData 
} from './helpers/test-db';
import { getCustomers, getNotes, createNote, getStatuses } from '@/lib/db';

describe('Database Integration Tests', () => {
  beforeAll(async () => {
    await createTestDatabase();
  });

  afterAll(async () => {
    await destroyTestDatabase();
  });

  beforeEach(async () => {
    await clearTestData();
  });

  describe('getCustomers', () => {
    it('should return customers from database', async () => {
      const customers = await getCustomers();
      
      expect(customers.length).toBe(3);
      expect(customers[0].name).toBe('Sarah Chen');
    });

    it('should filter by phone correctly', async () => {
      const customers = await getCustomers('415-555-0123');
      
      expect(customers.length).toBe(1);
      expect(customers[0].name).toBe('Sarah Chen');
    });
  });

  describe('getNotes', () => {
    it('should return notes from database', async () => {
      const notes = await getNotes();
      
      expect(notes.length).toBe(3);
    });

    it('should filter by customerId', async () => {
      const notes = await getNotes('cust_001');
      
      expect(notes.length).toBe(2);
      notes.forEach(note => {
        expect(note.customerId).toBe('cust_001');
      });
    });
  });

  describe('createNote', () => {
    it('should persist note to database', async () => {
      const noteData = {
        customerId: 'cust_001',
        text: 'Integration test note',
        author: 'Test Runner'
      };

      const created = await createNote(noteData);
      
      expect(created.id).toMatch(/^note_/);
      
      // Verify it was actually saved
      const allNotes = await getNotes('cust_001');
      expect(allNotes.length).toBe(3); // 2 seeded + 1 new
    });

    it('should enforce foreign key constraint', async () => {
      const noteData = {
        customerId: 'cust_999', // doesn't exist
        text: 'Should fail',
        author: 'Test Runner'
      };

      await expect(createNote(noteData)).rejects.toThrow();
    });
  });

  describe('getStatuses', () => {
    it('should return all ticket statuses', async () => {
      const statuses = await getStatuses();
      
      expect(statuses.length).toBe(5);
      expect(statuses[0].name).toBe('Open');
    });
  });
});
```

### Create `app/api/__tests__/customers.integration.test.ts`

```typescript
import { GET } from '@/app/api/customers/route';
import { NextRequest } from 'next/server';
import { 
  createTestDatabase, 
  destroyTestDatabase, 
  clearTestData 
} from '@/lib/__tests__/helpers/test-db';

describe('GET /api/customers Integration', () => {
  beforeAll(async () => {
    await createTestDatabase();
  });

  afterAll(async () => {
    await destroyTestDatabase();
  });

  beforeEach(async () => {
    await clearTestData();
  });

  it('should return real customer data from database', async () => {
    const request = new NextRequest('http://localhost:3000/api/customers');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.length).toBe(3);
    expect(data[0]).toHaveProperty('id');
    expect(data[0]).toHaveProperty('name');
  });

  it('should filter by phone from real database', async () => {
    const request = new NextRequest('http://localhost:3000/api/customers?phone=415-555-0123');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.length).toBe(1);
    expect(data[0].phone).toBe('415-555-0123');
  });
});
```

### Create `app/api/__tests__/notes.integration.test.ts`

```typescript
import { GET, POST } from '@/app/api/notes/route';
import { NextRequest } from 'next/server';
import { 
  createTestDatabase, 
  destroyTestDatabase, 
  clearTestData 
} from '@/lib/__tests__/helpers/test-db';

describe('Notes API Integration', () => {
  beforeAll(async () => {
    await createTestDatabase();
  });

  afterAll(async () => {
    await destroyTestDatabase();
  });

  beforeEach(async () => {
    await clearTestData();
  });

  describe('GET /api/notes', () => {
    it('should return notes from database', async () => {
      const request = new NextRequest('http://localhost:3000/api/notes');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.length).toBe(3);
    });

    it('should filter notes by customerId', async () => {
      const request = new NextRequest('http://localhost:3000/api/notes?customerId=cust_001');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.length).toBe(2);
    });
  });

  describe('POST /api/notes', () => {
    it('should create and persist note to database', async () => {
      const noteData = {
        customerId: 'cust_002',
        text: 'Integration test note',
        author: 'Test Runner'
      };

      const request = new NextRequest('http://localhost:3000/api/notes', {
        method: 'POST',
        body: JSON.stringify(noteData)
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.id).toMatch(/^note_/);

      // Verify persistence
      const getResponse = await GET(
        new NextRequest('http://localhost:3000/api/notes?customerId=cust_002')
      );
      const notes = await getResponse.json();
      expect(notes.length).toBe(2); // 1 seeded + 1 new
    });
  });
});
```

---

## Phase 6: Implementation Guide

### Step 1: Update `lib/db.ts`

Replace the current JSON file I/O with MySQL queries:

```typescript
import mysql from 'mysql2/promise';
import type { Customer, Note, TicketStatus } from '@/types';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'test',
  password: process.env.DB_PASSWORD || 'test',
  database: process.env.DB_NAME || 'test',
  waitForConnections: true,
  connectionLimit: 10
});

// Helper to convert snake_case to camelCase
function toCamelCase<T>(obj: any): T {
  const newObj: any = {};
  for (const key in obj) {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    newObj[camelKey] = obj[key];
  }
  return newObj as T;
}

export async function getCustomers(phone?: string): Promise<Customer[]> {
  let query = 'SELECT * FROM customers';
  const params: any[] = [];

  if (phone) {
    query += ' WHERE phone = ?';
    params.push(phone);
  }

  const [rows] = await pool.query(query, params);
  return (rows as any[]).map(row => toCamelCase<Customer>(row));
}

export async function getNotes(customerId?: string): Promise<Note[]> {
  let query = 'SELECT * FROM notes';
  const params: any[] = [];

  if (customerId) {
    query += ' WHERE customer_id = ?';
    params.push(customerId);
  }

  query += ' ORDER BY created_at DESC';

  const [rows] = await pool.query(query, params);
  return (rows as any[]).map(row => toCamelCase<Note>(row));
}

export async function createNote(data: {
  customerId: string;
  text: string;
  author: string;
}): Promise<Note> {
  const id = `note_${Date.now()}`;
  const createdAt = new Date();

  await pool.query(
    'INSERT INTO notes (id, customer_id, text, author, created_at) VALUES (?, ?, ?, ?, ?)',
    [id, data.customerId, data.text, data.author, createdAt]
  );

  return {
    id,
    customerId: data.customerId,
    text: data.text,
    author: data.author,
    createdAt: createdAt.toISOString()
  };
}

export async function getStatuses(): Promise<TicketStatus[]> {
  const [rows] = await pool.query('SELECT * FROM ticket_statuses');
  return (rows as any[]).map(row => toCamelCase<TicketStatus>(row));
}
```

### Step 2: Update API Routes

**`app/api/customers/route.ts`:**

```typescript
import { NextResponse } from 'next/server';
import { getCustomers } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const phone = searchParams.get('phone') || undefined;

  const customers = await getCustomers(phone);
  return NextResponse.json(customers);
}
```

**`app/api/notes/route.ts`:**

```typescript
import { NextResponse } from 'next/server';
import { getNotes, createNote } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const customerId = searchParams.get('customerId') || undefined;

  const notes = await getNotes(customerId);
  return NextResponse.json(notes);
}

export async function POST(request: Request) {
  const body = await request.json();

  if (!body.customerId || !body.text || !body.author) {
    return NextResponse.json(
      { error: 'Missing required fields: customerId, text, author' },
      { status: 400 }
    );
  }

  const note = await createNote({
    customerId: body.customerId,
    text: body.text,
    author: body.author
  });

  return NextResponse.json(note, { status: 201 });
}
```

**`app/api/statuses/route.ts`:**

```typescript
import { NextResponse } from 'next/server';
import { getStatuses } from '@/lib/db';

export async function GET() {
  const statuses = await getStatuses();
  return NextResponse.json(statuses);
}
```

---

## Execution Order (Red-Green-Refactor)

1. **Install dependencies** — Run the yarn commands in Phase 1
2. **Create config files** — Set up Jest configuration (Phase 2)
3. **Write unit tests** — Create all test files in Phase 4 (they will fail)
4. **Run tests** — `yarn test` — verify they fail (RED)
5. **Implement DB layer** — Update `lib/db.ts` with MySQL queries
6. **Run unit tests** — `yarn test:unit` — verify they pass (GREEN)
7. **Implement API routes** — Update the three route files
8. **Run unit tests again** — Verify still passing
9. **Write integration tests** — Create integration test files (Phase 5)
10. **Run all tests** — `yarn test` — verify everything passes
11. **Refactor** — Clean up code, ensure tests still pass

---

## Environment Variables

Create `.env.test`:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=test
DB_PASSWORD=test
DB_NAME=test_crm_test
```

---

## Running Tests

```bash
# Run all tests
yarn test

# Run only unit tests (fast, mocked)
yarn test:unit

# Run only integration tests (requires MySQL)
yarn test:integration

# Watch mode during development
yarn test:watch

# Generate coverage report
yarn test:coverage
```

---

## Notes

- **Unit tests** use mocks and run fast — use during active development
- **Integration tests** require MySQL running — use before committing
- **Test database** (`test_crm_test`) is separate from dev database (`test`)
- **Foreign key constraints** are tested to ensure data integrity
- **Data transformation** (snake_case → camelCase) is tested in integration tests
