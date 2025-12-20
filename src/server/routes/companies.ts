import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../config/database.js';
import { logger } from '../config/logger.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// GET /api/companies - List all companies for user
router.get('/', authMiddleware, async (req, res) => {
    try {
        const userId = req.userId;
        const { page = '1', limit = '20', status, search } = req.query;

        const pageNum = parseInt(page as string, 10);
        const limitNum = Math.min(parseInt(limit as string, 10), 100);
        const skip = (pageNum - 1) * limitNum;

        const where: any = { userId };

        if (status) {
            where.status = status;
        }

        if (search) {
            where.OR = [
                { companyName: { contains: search as string, mode: 'insensitive' } },
                { category: { contains: search as string, mode: 'insensitive' } },
                { address: { contains: search as string, mode: 'insensitive' } },
            ];
        }

        const [companies, total] = await Promise.all([
            prisma.company.findMany({
                where,
                skip,
                take: limitNum,
                orderBy: { createdAt: 'desc' },
                include: {
                    researchJobs: {
                        orderBy: { createdAt: 'desc' },
                        take: 1,
                    },
                    reports: {
                        orderBy: { createdAt: 'desc' },
                        take: 1,
                        select: { id: true, generatedAt: true },
                    },
                },
            }),
            prisma.company.count({ where }),
        ]);

        res.json({
            companies,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum),
            },
        });
    } catch (error) {
        logger.error({ error }, 'Failed to get companies');
        res.status(500).json({ error: 'Failed to get companies' });
    }
});

// GET /api/companies/:id - Get single company with details
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const userId = req.userId;
        const { id } = req.params;

        const company = await prisma.company.findFirst({
            where: { id, userId },
            include: {
                researchJobs: {
                    orderBy: { createdAt: 'desc' },
                },
                researchResult: true,
                reports: {
                    orderBy: { createdAt: 'desc' },
                },
            },
        });

        if (!company) {
            return res.status(404).json({ error: 'Company not found' });
        }

        res.json({ company });
    } catch (error) {
        logger.error({ error }, 'Failed to get company');
        res.status(500).json({ error: 'Failed to get company' });
    }
});

// PUT /api/companies/:id - Update company
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const userId = req.userId;
        const { id } = req.params;

        const updateSchema = z.object({
            companyName: z.string().min(1).optional(),
            address: z.string().optional(),
            phone: z.string().optional(),
            website: z.string().optional(),
            category: z.string().optional(),
        });

        const data = updateSchema.parse(req.body);

        const company = await prisma.company.updateMany({
            where: { id, userId },
            data,
        });

        if (company.count === 0) {
            return res.status(404).json({ error: 'Company not found' });
        }

        const updated = await prisma.company.findUnique({ where: { id } });
        res.json({ company: updated });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: 'Invalid input', details: error.errors });
        }
        logger.error({ error }, 'Failed to update company');
        res.status(500).json({ error: 'Failed to update company' });
    }
});

// DELETE /api/companies/:id - Delete company
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const userId = req.userId;
        const { id } = req.params;

        const result = await prisma.company.deleteMany({
            where: { id, userId },
        });

        if (result.count === 0) {
            return res.status(404).json({ error: 'Company not found' });
        }

        res.json({ success: true });
    } catch (error) {
        logger.error({ error }, 'Failed to delete company');
        res.status(500).json({ error: 'Failed to delete company' });
    }
});

// POST /api/companies/bulk-delete - Delete multiple companies
router.post('/bulk-delete', authMiddleware, async (req, res) => {
    try {
        const userId = req.userId;
        const { ids } = z.object({ ids: z.array(z.string()) }).parse(req.body);

        const result = await prisma.company.deleteMany({
            where: {
                id: { in: ids },
                userId,
            },
        });

        res.json({ success: true, deleted: result.count });
    } catch (error) {
        logger.error({ error }, 'Failed to bulk delete companies');
        res.status(500).json({ error: 'Failed to delete companies' });
    }
});

// GET /api/companies/stats - Get company statistics
router.get('/stats/summary', authMiddleware, async (req, res) => {
    try {
        const userId = req.userId;

        const [total, pending, researching, completed, failed] = await Promise.all([
            prisma.company.count({ where: { userId } }),
            prisma.company.count({ where: { userId, status: 'PENDING' } }),
            prisma.company.count({ where: { userId, status: 'RESEARCHING' } }),
            prisma.company.count({ where: { userId, status: 'COMPLETED' } }),
            prisma.company.count({ where: { userId, status: 'FAILED' } }),
        ]);

        res.json({
            stats: {
                total,
                pending,
                researching,
                completed,
                failed,
            },
        });
    } catch (error) {
        logger.error({ error }, 'Failed to get stats');
        res.status(500).json({ error: 'Failed to get statistics' });
    }
});

export default router;
