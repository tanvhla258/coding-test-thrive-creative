import { apiGet, apiPost } from '../utils/test-client';
import { cleanupTestData } from '../utils/test-db';

describe('Notes API', () => {
  afterEach(async () => {
    await cleanupTestData();
  });

  describe('GET /api/notes', () => {
    it('returns 200 with all notes', async () => {
      const { status, data } = await apiGet<any>('/api/notes');

      expect(status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);
    });

    it('returns notes with correct fields', async () => {
      const { data } = await apiGet<any>('/api/notes');

      const note = data[0];
      expect(note).toHaveProperty('id');
      expect(note).toHaveProperty('customerId');
      expect(note).toHaveProperty('text');
      expect(note).toHaveProperty('createdAt');
      expect(note).toHaveProperty('author');
    });
  });

  describe('GET /api/notes with customerId filter', () => {
    it('filters by customerId', async () => {
      const { status, data } = await apiGet<any>('/api/notes?customerId=cust_001');

      expect(status).toBe(200);
      expect(data.length).toBeGreaterThan(0);
      data.forEach((note: any) => {
        expect(note.customerId).toBe('cust_001');
      });
    });

    it('returns empty array for non-existent customerId', async () => {
      const { status, data } = await apiGet<any>('/api/notes?customerId=cust_999');

      expect(status).toBe(200);
      expect(data.length).toBe(0);
    });
  });

  describe('POST /api/notes', () => {
    it('creates a new note with valid data', async () => {
      const { status, data } = await apiPost<any>('/api/notes', {
        customerId: 'cust_001',
        text: 'Test note',
        author: 'Test Author',
      });

      expect(status).toBe(201);
      expect(data).toHaveProperty('id');
      expect(data.customerId).toBe('cust_001');
      expect(data.text).toBe('Test note');
      expect(data.author).toBe('Test Author');
      expect(data).toHaveProperty('createdAt');
    });

    it('returns 400 for missing customerId', async () => {
      const { status, data } = await apiPost<any>('/api/notes', {
        text: 'Test note',
        author: 'Test Author',
      });

      expect(status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Validation failed');
    });

    it('returns 400 for missing text', async () => {
      const { status, data } = await apiPost<any>('/api/notes', {
        customerId: 'cust_001',
        author: 'Test Author',
      });

      expect(status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('returns 400 for empty text', async () => {
      const { status, data } = await apiPost<any>('/api/notes', {
        customerId: 'cust_001',
        text: '',
        author: 'Test Author',
      });

      expect(status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('returns 400 for non-existent customerId', async () => {
      const { status, data } = await apiPost<any>('/api/notes', {
        customerId: 'cust_999',
        text: 'Test note',
        author: 'Test Author',
      });

      expect(status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Customer with id cust_999 not found');
    });

    it('persists created note', async () => {
      const { data: created } = await apiPost<any>('/api/notes', {
        customerId: 'cust_001',
        text: 'Persistent test note',
        author: 'Test Author',
      });

      const { data: allNotes } = await apiGet<any>('/api/notes');
      const found = allNotes.find((n: any) => n.id === created.id);

      expect(found).toBeDefined();
      expect(found.text).toBe('Persistent test note');
    });
  });
});
