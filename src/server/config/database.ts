import { PrismaClient } from '@prisma/client';
import { logger } from './logger.js';

// Create Prisma client with logging
export const prisma = new PrismaClient({
    log: [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'error' },
        { emit: 'event', level: 'warn' },
    ],
});

// Log queries in development
prisma.$on('query', (e) => {
    logger.debug({ query: e.query, duration: e.duration }, 'Database query');
});

prisma.$on('error', (e) => {
    logger.error({ error: e.message }, 'Database error');
});

prisma.$on('warn', (e) => {
    logger.warn({ warning: e.message }, 'Database warning');
});

export default prisma;
