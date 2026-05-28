import { apiGet } from '../utils/test-client';

describe('Customers API', () => {
  describe('GET /api/customers', () => {
    it('returns 200 with all customers', async () => {
      const { status, data } = await apiGet<any>('/api/customers');

      expect(status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.data.length).toBeGreaterThan(0);
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

    it('returns database seed data, not shell data', async () => {
      const { data } = await apiGet<any>('/api/customers');

      const sarah = data.data.find((c: any) => c.id === 'cust_001');
      expect(sarah).toBeDefined();
      expect(sarah.name).toBe('Sarah Chen');
      expect(sarah.phone).toBe('415-555-0123');
      expect(sarah.email).toBe('sarah@acme.com');
    });
  });

  describe('GET /api/customers with phone filter', () => {
    it('filters by exact phone number', async () => {
      const { status, data } = await apiGet<any>('/api/customers?phone=415-555-0123');

      expect(status).toBe(200);
      expect(data.data.length).toBe(1);
      expect(data.data[0].phone).toBe('415-555-0123');
    });

    it('filters by partial phone number', async () => {
      const { status, data } = await apiGet<any>('/api/customers?phone=415');

      expect(status).toBe(200);
      expect(data.data.length).toBeGreaterThan(0);
      data.data.forEach((customer: any) => {
        expect(customer.phone).toContain('415');
      });
    });

    it('returns empty array for non-matching phone', async () => {
      const { status, data } = await apiGet<any>('/api/customers?phone=999-999-9999');

      expect(status).toBe(200);
      expect(data.data.length).toBe(0);
    });
  });
});
