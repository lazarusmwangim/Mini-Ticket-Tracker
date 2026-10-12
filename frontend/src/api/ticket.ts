import axios from 'axios';
import type { CreateTicketInput, GetTicketsParams, PaginatedTickets, Ticket, TicketStats, TicketStatus } from "../types/ticket";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

export async function getTickets(params: GetTicketsParams = {}): Promise<PaginatedTickets> {
    const { data } = await api.get<PaginatedTickets>('/tickets', {
        params: {
            page: params.page ?? 1,
            limit: params.limit ?? 10,
            ...(params.status ? { status: params.status } : {}),
        },
    });

    return data;
}

export async function getTicketStats(): Promise<TicketStats> {
    const { data } = await api.get<TicketStats>('/tickets/stats');

    return data;
}

export async function createTicket(input: CreateTicketInput): Promise<Ticket> {
    const { data } = await api.post<Ticket>('/tickets', input);

    return data;
}

export async function updateTicketStatus(id: number, status: TicketStatus): Promise<Ticket> {
    const { data } = await api.patch<Ticket>(`/tickets/${id}`, {
        status,
    });

    return data;
}

export default api;