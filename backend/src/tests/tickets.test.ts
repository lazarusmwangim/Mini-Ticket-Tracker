import { beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';

const mocks = vi.hoisted(() => ({
    findAll: vi.fn(),
    findOne: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    getStats: vi.fn(),
}));

vi.mock('../tickets/ticket.service', () => ({
    TicketService: vi.fn(function () {
        return mocks;
    }),
}));

import app from '../app';
import { TicketStatus } from '../tickets/ticket.entity';

describe('Tickets API', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('POST /api/tickets creates a ticket', async () => {
        const ticket = {
            id: 1,
            title: 'Test ticket',
            description: 'Test description',
            status: TicketStatus.OPEN,
            priority: 'high',
            created_at: new Date(),
        };

        mocks.create.mockResolvedValue(ticket);

        const response = await request(app)
            .post('/api/tickets')
            .send({
                title: 'Test ticket',
                description: 'Test description',
                priority: 'high',
            });

        expect(response.status).toBe(201);
        expect(mocks.create).toHaveBeenCalled();
        expect(response.body).toMatchObject({
            id: 1,
            title: 'Test ticket',
        });
    });

    it('GET /api/tickets returns paginated tickets', async () => {
        const tickets = [
            {
                id: 1,
                title: 'Test ticket',
                description: 'Test description',
                status: TicketStatus.OPEN,
                priority: 'high',
                created_at: new Date(),
            },
        ];

        mocks.findAll.mockResolvedValue({
            data: tickets,
            total: 1,
            page: 1,
            limit: 10,
        });

        const response = await request(app)
            .get('/api/tickets?page=1&limit=10');

        expect(response.status).toBe(200);
        expect(mocks.findAll).toHaveBeenCalled();
        expect(response.body).toMatchObject({
            data: [
                {
                    id: 1,
                    title: 'Test ticket',
                },
            ],
            total: 1,
            page: 1,
            limit: 10,
        });
    });

    it('GET /api/tickets/stats returns ticket counts', async () => {
        mocks.getStats.mockResolvedValue({
            [TicketStatus.OPEN]: 2,
            [TicketStatus.IN_PROGRESS]: 3,
            [TicketStatus.CLOSED]: 1,
        });

        const response = await request(app)
            .get('/api/tickets/stats');

        expect(response.status).toBe(200);
        expect(mocks.getStats).toHaveBeenCalled();
        expect(response.body).toMatchObject({
            [TicketStatus.OPEN]: 2,
            [TicketStatus.IN_PROGRESS]: 3,
            [TicketStatus.CLOSED]: 1,
        });
    });
});