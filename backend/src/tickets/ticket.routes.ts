import { Router } from 'express';
import { TicketController } from './ticket.controller';

const ticketsRouter = Router();
const controller = new TicketController();

ticketsRouter.post('/', controller.create);
ticketsRouter.get('/', controller.findAll);
ticketsRouter.get('/stats', controller.getStats);
ticketsRouter.patch('/:id', controller.update);

export default ticketsRouter;