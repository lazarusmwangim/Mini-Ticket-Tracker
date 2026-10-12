import express from 'express';
import dotenv from 'dotenv';
import ticketsRouter from './tickets/ticket.routes';
import cors from 'cors';

dotenv.config();

const app = express();

app.use(
    cors({
        origin: '*',
        methods: ['GET', 'POST', 'PATCH'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    }),
);

app.use(express.json());

app.get('/api/health', (_req, res) => {
    res.json({ status: 'OK' });
});

app.use('/api/tickets', ticketsRouter);

app.use((_req, res) => {
    res.status(404).json({
        status: 'Error',
        message: 'Not found',
    });
});

export default app;
