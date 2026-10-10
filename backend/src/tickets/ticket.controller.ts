import { Request, Response, NextFunction } from 'express';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { TicketStatus } from './ticket.entity';
import { TicketService } from './ticket.service';
import { CreateTicketDto } from './create-ticket.dto';
import { UpdateTicketDto } from './update-ticket.dto';

const ticketService = new TicketService();

export class TicketController {
    constructor() {}
    
    async create(req: Request, res: Response, next: NextFunction): Promise<void | Response> {
        try {
            const dto = plainToInstance(CreateTicketDto, req.body);
            const errors = await validate(dto);

            if (errors.length > 0) {
                return res.status(400).json({
                    message: 'Validation failed',
                    errors: errors.map(error => ({
                        field: error.property,
                        constraints: error.constraints,
                    })),
                });
            }

            const ticket = await ticketService.create(dto);

            return res.status(201).json(ticket);
        } catch (error) {
            next(error);
        }
    }

    async findAll(req: Request, res: Response, next: NextFunction): Promise<void | Response> {
        try {
            const status = req.query.status;
            const page = Number(req.query.page ?? 1);
            const limit = Number(req.query.limit ?? 10);

            const validStatuses = Object.values(TicketStatus);

            if (
                status !== undefined &&
                (typeof status !== 'string' ||
                    !validStatuses.includes(status as TicketStatus))
            ) {
                return res.status(400).json({
                    message: 'Invalid status',
                    allowedValues: validStatuses,
                });
            }

            if (
                !Number.isSafeInteger(page) ||
                !Number.isSafeInteger(limit) ||
                page < 1 ||
                limit < 1 ||
                limit > 100
            ) {
                return res.status(400).json({
                    message:
                        'page must be at least 1 and limit must be between 1 and 100',
                });
            }

            const result = await ticketService.findAll(
                status as TicketStatus | undefined,
                page,
                limit,
            );

            return res.status(200).json({
                data: result.data,
                total: result.total,
                page: result.page,
                limit: result.limit,
                totalPages: Math.ceil(result.total / result.limit),
            });
        } catch (error) {
            next(error);
        }
    }

    async update(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void | Response> {
        try {
            const id = Number(req.params.id);

            if (!Number.isSafeInteger(id) || id < 1) {
                return res.status(400).json({
                    message: 'Invalid ticket ID',
                });
            }

            const dto = plainToInstance(UpdateTicketDto, req.body);
            const errors = await validate(dto);

            if (errors.length > 0) {
                return res.status(400).json({
                    message: 'Validation failed',
                    errors: errors.map(error => ({
                        field: error.property,
                        constraints: error.constraints,
                    })),
                });
            }

            if (dto.status === undefined && dto.priority === undefined) {
                return res.status(400).json({
                    message: 'Provide status or priority to update',
                });
            }

            const ticket = await ticketService.update(id, dto);

            if (!ticket) {
                return res.status(404).json({
                    message: 'Ticket not found',
                });
            }

            return res.status(200).json(ticket);
        } catch (error) {
            next(error);
        }
    }

    async getStats(_req: Request, res: Response, next: NextFunction): Promise<void | Response> {
        try {
            const stats = await ticketService.getStats();

            return res.status(200).json(stats);
        } catch (error) {
            next(error);
        }
    }
}