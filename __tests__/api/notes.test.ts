import { apiGet, apiPost, apiPut } from '../utils/test-client';
import { cleanupTestData } from '../utils/test-db';

describe('Notes API', () => {
  afterEach(async () => {
    await cleanupTestData();
  });

  describe('GET /api/customers/[customerId]/notes', () => {
    it('returns 200 with all notes for a customer', async () => {
      const { status, data } = await apiGet<any>('/api/customers/cust_001/notes');

      expect(status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.data.length).toBeGreaterThan(0);
    });

    it('returns notes with correct fields', async () => {
      const { data } = await apiGet<any>('/api/customers/cust_001/notes');

      const note = data.data[0];
      expect(note).toHaveProperty('id');
      expect(note).toHaveProperty('customerId');
      expect(note).toHaveProperty('text');
      expect(note).toHaveProperty('createdAt');
      expect(note).toHaveProperty('author');
    });

    it('returns 404 for non-existent customer', async () => {
      const { status, data } = await apiGet<any>('/api/customers/cust_999/notes');

      expect(status).toBe(404);
      expect(data.success).toBe(false);
    });

    it('returns empty array for customer with no notes', async () => {
      const { status, data } = await apiGet<any>('/api/customers/cust_003/notes');

      expect(status).toBe(200);
      expect(data.data.length).toBe(0);
    });
  });

  describe('POST /api/customers/[customerId]/notes', () => {
    it('creates a new note with valid data', async () => {
      const { status, data } = await apiPost<any>('/api/customers/cust_001/notes', {
        text: 'Test note',
        author: 'Test Author',
      });

      expect(status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('id');
      expect(data.data.customerId).toBe('cust_001');
      expect(data.data.text).toBe('Test note');
      expect(data.data.author).toBe('Test Author');
    });

    it('returns 400 for missing text', async () => {
      const { status, data } = await apiPost<any>('/api/customers/cust_001/notes', {
        author: 'Test Author',
      });

      expect(status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('returns 400 for empty text', async () => {
      const { status, data } = await apiPost<any>('/api/customers/cust_001/notes', {
        text: '',
        author: 'Test Author',
      });

      expect(status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('returns 404 for non-existent customer', async () => {
      const { status, data } = await apiPost<any>('/api/customers/cust_999/notes', {
        text: 'Test note',
        author: 'Test Author',
      });

      expect(status).toBe(404);
      expect(data.success).toBe(false);
    });
  });

  describe('PUT /api/customers/[customerId]/notes/[noteId]', () => {
    it('updates an existing note', async () => {
      const { status, data } = await apiPut<any>('/api/customers/cust_001/notes/note_001', {
        text: 'Updated note text',
      });

      expect(status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.text).toBe('Updated note text');
    });

    it('returns 404 for non-existent note', async () => {
      const { status, data } = await apiPut<any>('/api/customers/cust_001/notes/note_999', {
        text: 'Updated text',
      });

      expect(status).toBe(404);
      expect(data.success).toBe(false);
    });

    it('returns 404 for note not belonging to customer', async () => {
      const { status, data } = await apiPut<any>('/api/customers/cust_002/notes/note_001', {
        text: 'Updated text',
      });

      expect(status).toBe(404);
      expect(data.success).toBe(false);
    });
  });
});
