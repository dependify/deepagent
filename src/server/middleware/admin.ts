/**
 * Admin Middleware
 *
 * Checks if the authenticated user has admin role.
 */

import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database.js';
import { logger } from '../config/logger.js';

export async function adminMiddleware(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.userId;

        if (!userId) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { role: true, accountStatus: true },
        });

        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }

        if (user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Admin access required' });
        }

        next();
    } catch (error) {
        logger.error({ error }, 'Admin middleware error');
        res.status(500).json({ error: 'Authorization failed' });
    }
}

/**
 * Approved user middleware
 *
 * Checks if the user's account has been approved.
 */
export async function approvedMiddleware(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.userId;

        if (!userId) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { accountStatus: true, role: true },
        });

        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }

        // Admins always have access
        if (user.role === 'ADMIN') {
            return next();
        }

        if (user.accountStatus !== 'APPROVED') {
            return res.status(403).json({
                error: 'Account not approved',
                status: user.accountStatus,
            });
        }

        next();
    } catch (error) {
        logger.error({ error }, 'Approved middleware error');
        res.status(500).json({ error: 'Authorization failed' });
    }
}

export default { adminMiddleware, approvedMiddleware };
