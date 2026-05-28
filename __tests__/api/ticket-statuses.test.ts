import { apiGet } from '../utils/test-client';

describe('Ticket Statuses API', () => {
  describe('GET /api/ticket-statuses', () => {
    it('returns 200 with all ticket statuses', async () => {
      const { status, data } = await apiGet<any>('/api/ticket-statuses');

      expect(status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.data.length).toBe(5);
    });

    it('returns statuses with correct fields', async () => {
      const { data } = await apiGet<any>('/api/ticket-statuses');

      const status = data.data[0];
      expect(status).toHaveProperty('id');
      expect(status).toHaveProperty('name');
      expect(status).toHaveProperty('color');
    });

    it('returns seed data', async () => {
      const { data } = await apiGet<any>('/api/ticket-statuses');

      const openStatus = data.data.find((s: any) => s.id === 'status_1');
      expect(openStatus).toBeDefined();
      expect(openStatus.name).toBe('Open');
      expect(openStatus.color).toBe('blue');
    });
  });
});
