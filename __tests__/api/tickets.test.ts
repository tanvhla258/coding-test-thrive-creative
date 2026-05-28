import { apiGet, apiPost, apiPut } from '../utils/test-client';
import { cleanupTestData } from '../utils/test-db';

describe('Tickets API', () => {
  afterEach(async () => {
    await cleanupTestData();
  });

  describe('GET /api/customers/[customerId]/tickets', () => {
    it('returns 200 with all tickets for a customer', async () => {
      const { status, data } = await apiGet<any>('/api/customers/cust_001/tickets');

      expect(status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.data.length).toBeGreaterThan(0);
    });

    it('returns tickets with correct fields including nested status', async () => {
      const { data } = await apiGet<any>('/api/customers/cust_001/tickets');

      const ticket = data.data[0];
      expect(ticket).toHaveProperty('id');
      expect(ticket).toHaveProperty('customerId');
      expect(ticket).toHaveProperty('subject');
      expect(ticket).toHaveProperty('description');
      expect(ticket).toHaveProperty('statusId');
      expect(ticket).toHaveProperty('status');
      expect(ticket.status).toHaveProperty('id');
      expect(ticket.status).toHaveProperty('name');
      expect(ticket.status).toHaveProperty('color');
    });

    it('returns 404 for non-existent customer', async () => {
      const { status, data } = await apiGet<any>('/api/customers/cust_999/tickets');

      expect(status).toBe(404);
      expect(data.success).toBe(false);
    });

    it('returns empty array for customer with no tickets', async () => {
      const { status, data } = await apiGet<any>('/api/customers/cust_003/tickets');

      expect(status).toBe(200);
      expect(data.data.length).toBe(0);
    });
  });

  describe('POST /api/customers/[customerId]/tickets', () => {
    it('creates a new ticket with valid data', async () => {
      const { status, data } = await apiPost<any>('/api/customers/cust_001/tickets', {
        subject: 'New support ticket',
        description: 'Something is broken',
        statusId: 'status_1',
      });

      expect(status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('id');
      expect(data.data.customerId).toBe('cust_001');
      expect(data.data.subject).toBe('New support ticket');
      expect(data.data.statusId).toBe('status_1');
      expect(data.data.status.name).toBe('Open');
    });

    it('returns 400 for missing subject', async () => {
      const { status, data } = await apiPost<any>('/api/customers/cust_001/tickets', {
        statusId: 'status_1',
      });

      expect(status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('returns 400 for missing statusId', async () => {
      const { status, data } = await apiPost<any>('/api/customers/cust_001/tickets', {
        subject: 'Test ticket',
      });

      expect(status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('returns 400 for non-existent statusId', async () => {
      const { status, data } = await apiPost<any>('/api/customers/cust_001/tickets', {
        subject: 'Test ticket',
        statusId: 'status_999',
      });

      expect(status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('returns 404 for non-existent customer', async () => {
      const { status, data } = await apiPost<any>('/api/customers/cust_999/tickets', {
        subject: 'Test ticket',
        statusId: 'status_1',
      });

      expect(status).toBe(404);
      expect(data.success).toBe(false);
    });
  });

  describe('PUT /api/customers/[customerId]/tickets/[ticketId]', () => {
    it('updates an existing ticket', async () => {
      const { status, data } = await apiPut<any>('/api/customers/cust_001/tickets/ticket_001', {
        subject: 'Updated subject',
        statusId: 'status_2',
      });

      expect(status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.subject).toBe('Updated subject');
      expect(data.data.statusId).toBe('status_2');
      expect(data.data.status.name).toBe('In Progress');
    });

    it('updates only the status', async () => {
      const { status, data } = await apiPut<any>('/api/customers/cust_001/tickets/ticket_001', {
        statusId: 'status_4',
      });

      expect(status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.statusId).toBe('status_4');
      expect(data.data.status.name).toBe('Resolved');
    });

    it('returns 404 for non-existent ticket', async () => {
      const { status, data } = await apiPut<any>('/api/customers/cust_001/tickets/ticket_999', {
        subject: 'Updated',
      });

      expect(status).toBe(404);
      expect(data.success).toBe(false);
    });

    it('returns 404 for ticket not belonging to customer', async () => {
      const { status, data } = await apiPut<any>('/api/customers/cust_002/tickets/ticket_001', {
        subject: 'Updated',
      });

      expect(status).toBe(404);
      expect(data.success).toBe(false);
    });

    it('returns 400 for invalid statusId', async () => {
      const { status, data } = await apiPut<any>('/api/customers/cust_001/tickets/ticket_001', {
        statusId: 'status_999',
      });

      expect(status).toBe(400);
      expect(data.success).toBe(false);
    });
  });
});
