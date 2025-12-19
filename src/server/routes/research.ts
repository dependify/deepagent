import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../config/database.js';
import { logger } from '../config/logger.js';
import { authMiddleware } from '../middleware/auth.js';
import { executeResearch } from '../orchestrator/index.js';

const router = Router();

// POST /api/research/start - Start research for a company
router.post('/start', authMiddleware, async (req, res) => {
    try {
        const userId = (req as any).userId;
        const { companyId, priority = 0 } = z.object({
            companyId: z.string(),
            priority: z.number().min(0).max(10).optional(),
        }).parse(req.body);

        // Verify company belongs to user
        const company = await prisma.company.findFirst({
            where: { id: companyId, userId },
        });

        if (!company) {
            return res.status(404).json({ error: 'Company not found' });
        }

        // Check if research job already exists
        const existingJob = await prisma.researchJob.findFirst({
            where: {
                companyId,
                status: { in: ['PENDING', 'QUEUED', 'RUNNING'] },
            },
        });

        if (existingJob) {
            return res.status(400).json({ error: 'Research job already in progress', jobId: existingJob.id });
        }

        // Create research job
        const job = await prisma.researchJob.create({
            data: {
                companyId,
                userId,
                priority: priority || 0,
                status: 'QUEUED',
            },
        });

        // Update company status
        await prisma.company.update({
            where: { id: companyId },
            data: { status: 'QUEUED' },
        });

        // Execute research asynchronously (fire and forget)
        executeResearch(job.id).catch((err) => {
            logger.error({ jobId: job.id, error: err }, 'Background research failed');
        });

        logger.info({ jobId: job.id, companyId }, 'Research job created');

        res.status(201).json({ job });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: 'Invalid input', details: error.errors });
        }
        logger.error({ error }, 'Failed to start research');
        res.status(500).json({ error: 'Failed to start research' });
    }
});

// POST /api/research/execute/:companyId - Execute research synchronously
router.post('/execute/:companyId', authMiddleware, async (req, res) => {
    try {
        const userId = (req as any).userId;
        const { companyId } = req.params;

        // Verify company belongs to user
        const company = await prisma.company.findFirst({
            where: { id: companyId, userId },
        });

        if (!company) {
            return res.status(404).json({ error: 'Company not found' });
        }

        // Create research job
        const job = await prisma.researchJob.create({
            data: {
                companyId,
                userId,
                priority: 10,
                status: 'QUEUED',
            },
        });

        // Execute research synchronously
        const result = await executeResearch(job.id);

        res.json({ success: true, jobId: job.id, result });
    } catch (error) {
        logger.error({ error }, 'Failed to execute research');
        res.status(500).json({ error: 'Failed to execute research' });
    }
});

// POST /api/research/batch - Start research for multiple companies
router.post('/batch', authMiddleware, async (req, res) => {
    try {
        const userId = (req as any).userId;
        const { companyIds, priority = 0 } = z.object({
            companyIds: z.array(z.string()),
            priority: z.number().min(0).max(10).optional(),
        }).parse(req.body);

        // Verify all companies belong to user
        const companies = await prisma.company.findMany({
            where: { id: { in: companyIds }, userId },
        });

        if (companies.length !== companyIds.length) {
            return res.status(400).json({ error: 'Some companies not found' });
        }

        // Create research jobs
        const jobs = await Promise.all(
            companies.map((company) =>
                prisma.researchJob.create({
                    data: {
                        companyId: company.id,
                        userId,
                        priority: priority || 0,
                        status: 'QUEUED',
                    },
                })
            )
        );

        // Update company statuses
        await prisma.company.updateMany({
            where: { id: { in: companyIds } },
            data: { status: 'QUEUED' },
        });

        logger.info({ jobCount: jobs.length }, 'Batch research jobs created');

        res.status(201).json({ jobs, count: jobs.length });
    } catch (error) {
        logger.error({ error }, 'Failed to start batch research');
        res.status(500).json({ error: 'Failed to start batch research' });
    }
});

// GET /api/research/:id/status - Get research job status
router.get('/:id/status', authMiddleware, async (req, res) => {
    try {
        const userId = (req as any).userId;
        const { id } = req.params;

        const job = await prisma.researchJob.findFirst({
            where: { id, userId },
            include: {
                company: {
                    select: { companyName: true },
                },
            },
        });

        if (!job) {
            return res.status(404).json({ error: 'Research job not found' });
        }

        res.json({
            job: {
                id: job.id,
                companyName: job.company.companyName,
                status: job.status,
                progress: job.progress,
                agents: {
                    websiteAnalysis: job.websiteAnalysis,
                    socialMediaHunt: job.socialMediaHunt,
                    ownerInvestigation: job.ownerInvestigation,
                    competitorMapping: job.competitorMapping,
                    newsAggregation: job.newsAggregation,
                    businessAnalysis: job.businessAnalysis,
                },
                startedAt: job.startedAt,
                completedAt: job.completedAt,
                errorMessage: job.errorMessage,
            },
        });
    } catch (error) {
        logger.error({ error }, 'Failed to get job status');
        res.status(500).json({ error: 'Failed to get job status' });
    }
});

// GET /api/research/:id/result - Get research results
router.get('/:id/result', authMiddleware, async (req, res) => {
    try {
        const userId = (req as any).userId;
        const { id } = req.params;

        const job = await prisma.researchJob.findFirst({
            where: { id, userId },
            include: {
                company: {
                    include: {
                        researchResult: true,
                    },
                },
            },
        });

        if (!job) {
            return res.status(404).json({ error: 'Research job not found' });
        }

        if (!job.company.researchResult) {
            return res.status(404).json({ error: 'Research results not yet available' });
        }

        res.json({ result: job.company.researchResult });
    } catch (error) {
        logger.error({ error }, 'Failed to get research results');
        res.status(500).json({ error: 'Failed to get research results' });
    }
});

// POST /api/research/:id/cancel - Cancel a research job
router.post('/:id/cancel', authMiddleware, async (req, res) => {
    try {
        const userId = (req as any).userId;
        const { id } = req.params;

        const job = await prisma.researchJob.findFirst({
            where: { id, userId },
        });

        if (!job) {
            return res.status(404).json({ error: 'Research job not found' });
        }

        if (!['PENDING', 'QUEUED', 'RUNNING'].includes(job.status)) {
            return res.status(400).json({ error: 'Job cannot be cancelled' });
        }

        await prisma.researchJob.update({
            where: { id },
            data: { status: 'CANCELLED' },
        });

        await prisma.company.update({
            where: { id: job.companyId },
            data: { status: 'PENDING' },
        });

        logger.info({ jobId: id }, 'Research job cancelled');

        res.json({ success: true });
    } catch (error) {
        logger.error({ error }, 'Failed to cancel job');
        res.status(500).json({ error: 'Failed to cancel job' });
    }
});

// GET /api/research/queue - Get research queue
router.get('/queue/status', authMiddleware, async (req, res) => {
    try {
        const userId = (req as any).userId;

        const jobs = await prisma.researchJob.findMany({
            where: {
                userId,
                status: { in: ['PENDING', 'QUEUED', 'RUNNING'] },
            },
            include: {
                company: {
                    select: { companyName: true },
                },
            },
            orderBy: [
                { priority: 'desc' },
                { createdAt: 'asc' },
            ],
        });

        res.json({ queue: jobs });
    } catch (error) {
        logger.error({ error }, 'Failed to get queue');
        res.status(500).json({ error: 'Failed to get queue' });
    }
});

export default router;
