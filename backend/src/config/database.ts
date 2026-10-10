import 'reflect-metadata';
import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import { Ticket } from '../tickets/ticket.entity';

dotenv.config();

export const AppDataSource = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [Ticket],
    synchronize: false,
    logging: false,
});

export async function connectDatabase(): Promise<void> {
    await AppDataSource.initialize();
    console.log('DB connected successfully!');
}