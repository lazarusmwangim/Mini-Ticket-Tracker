import express from 'express';
import dotenv from 'dotenv';
import { connectDatabase } from './config/database';
import ticketsRouter from './tickets/ticket.routes';
import cors from 'cors';

dotenv.config();

const app = express();

app.use(
    cors({
        origin: 'http://localhost:5173',
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

const PORT = Number(process.env.PORT || 3000);

async function bootstrap(): Promise<void> {
    try {
        await connectDatabase();

        app.listen(PORT, () => {
            console.log(`Server running at http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start application:', error);
        process.exit(1);
    }
}

void bootstrap();