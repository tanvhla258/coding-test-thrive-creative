import { apiGet } from '../utils/test-client';

describe('Statuses API', () => {
  describe('GET /api/statuses', () => {
    it('returns 200 with all statuses', async () => {
      const { status, data } = await apiGet<any>('/api/statuses');

      expect(status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBe(5);
    });

    it('returns statuses with correct fields', async () => {
      const { data } = await apiGet<any>('/api/statuses');

      const status = data[0];
      expect(status).toHaveProperty('id');
      expect(status).toHaveProperty('name');
      expect(status).toHaveProperty('color');
    });

    it('returns correct status data', async () => {
      const { data } = await apiGet<any>('/api/statuses');

      const open = data.find((s: any) => s.id === 'status_1');
      expect(open).toEqual({
        id: 'status_1',
        name: 'Open',
        color: 'blue',
      });

      const inProgress = data.find((s: any) => s.id === 'status_2');
      expect(inProgress).toEqual({
        id: 'status_2',
        name: 'In Progress',
        color: 'yellow',
      });
    });

    it('returns valid color values', async () => {
      const { data } = await apiGet<any>('/api/statuses');
      const validColors = ['blue', 'yellow', 'orange', 'green', 'gray'];

      data.forEach((status: any) => {
        expect(validColors).toContain(status.color);
      });
    });
  });
});
