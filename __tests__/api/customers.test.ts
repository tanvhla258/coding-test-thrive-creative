import { apiGet, apiPost, apiPut } from '../utils/test-client';
import { cleanupTestData } from '../utils/test-db';

describe('Customers API', () => {
  afterEach(async () => {
    await cleanupTestData();
  });

  describe('GET /api/customers', () => {
    it('returns 200 with paginated customers', async () => {
      const { status, data } = await apiGet<any>('/api/customers');

      expect(status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.data.length).toBeGreaterThan(0);
      expect(data.pagination).toBeDefined();
      expect(data.pagination.page).toBe(1);
      expect(data.pagination.limit).toBe(10);
    });

    it('returns customers with correct fields', async () => {
      const { data } = await apiGet<any>('/api/customers');

      const customer = data.data[0];
      expect(customer).toHaveProperty('id');
      expect(customer).toHaveProperty('name');
      expect(customer).toHaveProperty('phone');
      expect(customer).toHaveProperty('email');
      expect(customer).toHaveProperty('company');
      expect(customer).toHaveProperty('status');
    });

    it('filters by phone search', async () => {
      const { status, data } = await apiGet<any>('/api/customers?search=415');

      expect(status).toBe(200);
      expect(data.data.length).toBeGreaterThan(0);
      data.data.forEach((customer: any) => {
        expect(customer.phone).toContain('415');
      });
    });

    it('supports pagination', async () => {
      const { status, data } = await apiGet<any>('/api/customers?page=1&limit=2');

      expect(status).toBe(200);
      expect(data.data.length).toBeLessThanOrEqual(2);
      expect(data.pagination.page).toBe(1);
      expect(data.pagination.limit).toBe(2);
    });

    it('returns database seed data', async () => {
      const { data } = await apiGet<any>('/api/customers');

      const sarah = data.data.find((c: any) => c.id === 'cust_001');
      expect(sarah).toBeDefined();
      expect(sarah.name).toBe('Sarah Chen');
      expect(sarah.phone).toBe('415-555-0123');
    });
  });

  describe('POST /api/customers', () => {
    it('creates a new customer with valid data', async () => {
      const { status, data } = await apiPost<any>('/api/customers', {
        name: 'Test Customer',
        phone: '555-1234',
        email: 'test@example.com',
        company: 'Test Corp',
        status: 'active',
      });

      expect(status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('id');
      expect(data.data.name).toBe('Test Customer');
      expect(data.data.phone).toBe('555-1234');
      expect(data.data.email).toBe('test@example.com');
    });

    it('returns 400 for missing required fields', async () => {
      const { status, data } = await apiPost<any>('/api/customers', {
        name: 'Test Customer',
      });

      expect(status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('returns 400 for invalid email', async () => {
      const { status, data } = await apiPost<any>('/api/customers', {
        name: 'Test Customer',
        phone: '555-1234',
        email: 'invalid-email',
        company: 'Test Corp',
      });

      expect(status).toBe(400);
      expect(data.success).toBe(false);
    });
  });

  describe('PUT /api/customers/[id]', () => {
    it('updates an existing customer', async () => {
      const { status, data } = await apiPut<any>('/api/customers/cust_001', {
        name: 'Updated Name',
        phone: '555-9999',
      });

      expect(status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.name).toBe('Updated Name');
      expect(data.data.phone).toBe('555-9999');
    });

    it('returns 404 for non-existent customer', async () => {
      const { status, data } = await apiPut<any>('/api/customers/cust_999', {
        name: 'Updated Name',
      });

      expect(status).toBe(404);
      expect(data.success).toBe(false);
    });
  });
});
