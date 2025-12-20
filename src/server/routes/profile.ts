/**
 * Profile Routes
 *
 * User profile management for both users and admins.
 */

import { Router } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/database.js';
import { logger } from '../config/logger.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// GET /api/profile - Get current user profile
router.get('/', async (req, res) => {
    try {
        const userId = req.userId;

        if (!userId) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                accountStatus: true,
                avatar: true,
                bio: true,
                createdAt: true,
                _count: {
                    select: { companies: true, researchJobs: true, reports: true },
                },
            },
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ user });
    } catch (error) {
        logger.error({ error }, 'Failed to get profile');
        res.status(500).json({ error: 'Failed to get profile' });
    }
});

const updateProfileSchema = z.object({
    name: z.string().min(1).optional(),
    bio: z.string().optional(),
    avatar: z.string().url().optional().nullable(),
});

// PUT /api/profile - Update current user profile
router.put('/', async (req, res) => {
    try {
        const userId = req.userId;

        if (!userId) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        const data = updateProfileSchema.parse(req.body);

        const user = await prisma.user.update({
            where: { id: userId },
            data,
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                accountStatus: true,
                avatar: true,
                bio: true,
            },
        });

        logger.info({ userId }, 'Profile updated');
        res.json({ user });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: 'Invalid input', details: error.errors });
        }
        logger.error({ error }, 'Failed to update profile');
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

const changePasswordSchema = z.object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8),
});

// PUT /api/profile/password - Change password
router.put('/password', async (req, res) => {
    try {
        const userId = req.userId;

        if (!userId) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { password: true },
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Verify current password
        const isValid = await bcrypt.compare(currentPassword, user.password);
        if (!isValid) {
            return res.status(400).json({ error: 'Current password is incorrect' });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 12);

        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword },
        });

        logger.info({ userId }, 'Password changed');
        res.json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: 'Invalid input', details: error.errors });
        }
        logger.error({ error }, 'Failed to change password');
        res.status(500).json({ error: 'Failed to change password' });
    }
});

export default router;
