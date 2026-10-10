import { AppDataSource } from '../config/database';
import { Ticket, TicketStatus } from './ticket.entity';
import { CreateTicketDto } from './create-ticket.dto';
import { UpdateTicketDto } from './update-ticket.dto';

export class TicketService {
    private get ticketRepository() {
        return AppDataSource.getRepository(Ticket);
    }

    async findAll(
        status?: TicketStatus,
        page = 1,
        limit = 10,
    ): Promise<{ data: Ticket[]; total: number; page: number; limit: number }> {
        const [data, total] = await this.ticketRepository.findAndCount({
            where: status ? { status } : {},
            order: { created_at: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });

        return { data, total, page, limit };
    }

    async findOne(id: number): Promise<Ticket | null> {
        return this.ticketRepository.findOneBy({ id });
    }

    async create(data: CreateTicketDto): Promise<Ticket> {
        const ticket = this.ticketRepository.create(data);
        return this.ticketRepository.save(ticket);
    }

    async update(
        id: number,
        data: UpdateTicketDto,
    ): Promise<Ticket | null> {
        const ticket = await this.findOne(id);

        if (!ticket) return null;

        if (data.status !== undefined) ticket.status = data.status;
        if (data.priority !== undefined) ticket.priority = data.priority;

        return this.ticketRepository.save(ticket);
    }

    async getStats(): Promise<Record<TicketStatus, number>> {
        const rows = await this.ticketRepository
            .createQueryBuilder('ticket')
            .select([
                'ticket.status as status',
                'COUNT(*) as count'
            ])
            .groupBy('ticket.status')
            .getRawMany<{ status: TicketStatus; count: string }>();

        const stats: Record<TicketStatus, number> = {
            [TicketStatus.OPEN]: 0,
            [TicketStatus.IN_PROGRESS]: 0,
            [TicketStatus.CLOSED]: 0,
        };

        for (const row of rows) {
            stats[row.status] = Number(row.count);
        }

        return stats;
    }
}