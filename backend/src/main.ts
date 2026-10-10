import express from 'express';
import dotenv from 'dotenv';
import { connectDatabase } from './config/database';
import ticketsRouter from './tickets/ticket.routes';

dotenv.config();

const app = express();

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