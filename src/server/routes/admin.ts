/**
 * Admin Routes
 * 
 * User management, prompts, logs, and system administration.
 */

import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../config/database.js';
import { logger } from '../config/logger.js';
import { authMiddleware } from '../middleware/auth.js';
import { adminMiddleware } from '../middleware/admin.js';

const router = Router();

// All admin routes require authentication + admin role
router.use(authMiddleware);
router.use(adminMiddleware);

// ============================================================================
// USER MANAGEMENT
// ============================================================================

// GET /api/admin/users - List all users
router.get('/users', async (req, res) => {
    try {
        const { status, role, page = '1', limit = '20' } = req.query;

        const pageNum = parseInt(page as string, 10);
        const limitNum = Math.min(parseInt(limit as string, 10), 100);
        const skip = (pageNum - 1) * limitNum;

        const where: any = {};
        if (status) where.accountStatus = status;
        if (role) where.role = role;

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                skip,
                take: limitNum,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    accountStatus: true,
                    avatar: true,
                    createdAt: true,
                    _count: {
                        select: { companies: true, researchJobs: true, reports: true },
                    },
                },
            }),
            prisma.user.count({ where }),
        ]);

        res.json({
            users,
            pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
        });
    } catch (error) {
        logger.error({ error }, 'Failed to list users');
        res.status(500).json({ error: 'Failed to list users' });
    }
});

// GET /api/admin/users/pending - Get pending signups
router.get('/users/pending', async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            where: { accountStatus: 'PENDING' },
            orderBy: { createdAt: 'asc' },
            select: {
                id: true,
                email: true,
                name: true,
                createdAt: true,
            },
        });

        res.json({ users, count: users.length });
    } catch (error) {
        logger.error({ error }, 'Failed to get pending users');
        res.status(500).json({ error: 'Failed to get pending users' });
    }
});

// POST /api/admin/users/:id/approve - Approve user signup
router.post('/users/:id/approve', async (req, res) => {
    try {
        const { id } = req.params;

        const user = await prisma.user.update({
            where: { id },
            data: { accountStatus: 'APPROVED' },
            select: { id: true, email: true, name: true, accountStatus: true },
        });

        logger.info({ userId: id }, 'User approved');
        res.json({ success: true, user });
    } catch (error) {
        logger.error({ error }, 'Failed to approve user');
        res.status(500).json({ error: 'Failed to approve user' });
    }
});

// POST /api/admin/users/:id/reject - Reject user signup
router.post('/users/:id/reject', async (req, res) => {
    try {
        const { id } = req.params;

        const user = await prisma.user.update({
            where: { id },
            data: { accountStatus: 'REJECTED' },
            select: { id: true, email: true, name: true, accountStatus: true },
        });

        logger.info({ userId: id }, 'User rejected');
        res.json({ success: true, user });
    } catch (error) {
        logger.error({ error }, 'Failed to reject user');
        res.status(500).json({ error: 'Failed to reject user' });
    }
});

// POST /api/admin/users/:id/suspend - Suspend user
router.post('/users/:id/suspend', async (req, res) => {
    try {
        const { id } = req.params;

        const user = await prisma.user.update({
            where: { id },
            data: { accountStatus: 'SUSPENDED' },
            select: { id: true, email: true, name: true, accountStatus: true },
        });

        logger.info({ userId: id }, 'User suspended');
        res.json({ success: true, user });
    } catch (error) {
        logger.error({ error }, 'Failed to suspend user');
        res.status(500).json({ error: 'Failed to suspend user' });
    }
});

// PUT /api/admin/users/:id/role - Change user role
router.put('/users/:id/role', async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        if (!['ADMIN', 'USER'].includes(role)) {
            return res.status(400).json({ error: 'Invalid role' });
        }

        const user = await prisma.user.update({
            where: { id },
            data: { role },
            select: { id: true, email: true, name: true, role: true },
        });

        logger.info({ userId: id, role }, 'User role updated');
        res.json({ success: true, user });
    } catch (error) {
        logger.error({ error }, 'Failed to update user role');
        res.status(500).json({ error: 'Failed to update user role' });
    }
});

// DELETE /api/admin/users/:id - Delete user
router.delete('/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const adminId = (req as any).userId;

        // Can't delete yourself
        if (id === adminId) {
            return res.status(400).json({ error: 'Cannot delete your own account' });
        }

        await prisma.user.delete({ where: { id } });

        logger.info({ userId: id }, 'User deleted');
        res.json({ success: true });
    } catch (error) {
        logger.error({ error }, 'Failed to delete user');
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

// ============================================================================
// PROMPT MANAGEMENT
// ============================================================================

// GET /api/admin/prompts - List all prompts
router.get('/prompts', async (req, res) => {
    try {
        const prompts = await prisma.promptConfig.findMany({
            orderBy: [{ category: 'asc' }, { name: 'asc' }],
        });

        res.json({ prompts });
    } catch (error) {
        logger.error({ error }, 'Failed to list prompts');
        res.status(500).json({ error: 'Failed to list prompts' });
    }
});

// GET /api/admin/prompts/:id - Get single prompt
router.get('/prompts/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const prompt = await prisma.promptConfig.findUnique({ where: { id } });

        if (!prompt) {
            return res.status(404).json({ error: 'Prompt not found' });
        }

        res.json({ prompt });
    } catch (error) {
        logger.error({ error }, 'Failed to get prompt');
        res.status(500).json({ error: 'Failed to get prompt' });
    }
});

const promptSchema = z.object({
    name: z.string().min(1),
    displayName: z.string().min(1),
    description: z.string().optional(),
    prompt: z.string().min(1),
    category: z.string().default('research'),
    isActive: z.boolean().default(true),
});

// POST /api/admin/prompts - Create new prompt
router.post('/prompts', async (req, res) => {
    try {
        const data = promptSchema.parse(req.body);

        const prompt = await prisma.promptConfig.create({ data });

        logger.info({ promptId: prompt.id }, 'Prompt created');
        res.status(201).json({ prompt });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: 'Invalid input', details: error.errors });
        }
        logger.error({ error }, 'Failed to create prompt');
        res.status(500).json({ error: 'Failed to create prompt' });
    }
});

// PUT /api/admin/prompts/:id - Update prompt
router.put('/prompts/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const data = promptSchema.partial().parse(req.body);

        const prompt = await prisma.promptConfig.update({
            where: { id },
            data,
        });

        logger.info({ promptId: id }, 'Prompt updated');
        res.json({ prompt });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: 'Invalid input', details: error.errors });
        }
        logger.error({ error }, 'Failed to update prompt');
        res.status(500).json({ error: 'Failed to update prompt' });
    }
});

// DELETE /api/admin/prompts/:id - Delete prompt
router.delete('/prompts/:id', async (req, res) => {
    try {
        const { id } = req.params;

        await prisma.promptConfig.delete({ where: { id } });

        logger.info({ promptId: id }, 'Prompt deleted');
        res.json({ success: true });
    } catch (error) {
        logger.error({ error }, 'Failed to delete prompt');
        res.status(500).json({ error: 'Failed to delete prompt' });
    }
});

// ============================================================================
// LOGS & STATS
// ============================================================================

// GET /api/admin/logs - Get evolution/system logs
router.get('/logs', async (req, res) => {
    try {
        const { type, limit = '100' } = req.query;
        const limitNum = Math.min(parseInt(limit as string, 10), 500);

        const where: any = {};
        if (type) where.eventType = type;

        const logs = await prisma.evolutionLog.findMany({
            where,
            orderBy: { timestamp: 'desc' },
            take: limitNum,
        });

        res.json({ logs, count: logs.length });
    } catch (error) {
        logger.error({ error }, 'Failed to get logs');
        res.status(500).json({ error: 'Failed to get logs' });
    }
});

// GET /api/admin/stats - Get system statistics
router.get('/stats', async (req, res) => {
    try {
        const [
            totalUsers,
            pendingUsers,
            approvedUsers,
            totalCompanies,
            totalResearchJobs,
            completedJobs,
            runningJobs,
            totalReports,
        ] = await Promise.all([
            prisma.user.count(),
            prisma.user.count({ where: { accountStatus: 'PENDING' } }),
            prisma.user.count({ where: { accountStatus: 'APPROVED' } }),
            prisma.company.count(),
            prisma.researchJob.count(),
            prisma.researchJob.count({ where: { status: 'COMPLETED' } }),
            prisma.researchJob.count({ where: { status: 'RUNNING' } }),
            prisma.report.count(),
        ]);

        res.json({
            users: { total: totalUsers, pending: pendingUsers, approved: approvedUsers },
            companies: totalCompanies,
            research: { total: totalResearchJobs, completed: completedJobs, running: runningJobs },
            reports: totalReports,
        });
    } catch (error) {
        logger.error({ error }, 'Failed to get stats');
        res.status(500).json({ error: 'Failed to get stats' });
    }
});

export default router;
