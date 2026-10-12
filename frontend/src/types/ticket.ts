export type TicketStatus = 'open' | 'in_progress' | 'closed';

export type TicketPriority = 'low' | 'medium' | 'high';

export interface Ticket {
    id: number;
    title: string;
    description: string | null;
    status: TicketStatus;
    priority: TicketPriority;
    created_at: string;
}

export interface TicketStats {
    open: number;
    in_progress: number;
    closed: number;
}

export interface CreateTicketInput {
    title: string;
    description?: string;
    status?: TicketStatus;
    priority: TicketPriority;
}

export interface GetTicketsParams {
    page?: number;
    limit?: number;
    status?: TicketStatus;
}

export interface PaginatedTickets {
    data: Ticket[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}