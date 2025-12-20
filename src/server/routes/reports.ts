import { Router } from 'express';
import { prisma } from '../config/database.js';
import { logger } from '../config/logger.js';
import { authMiddleware } from '../middleware/auth.js';
import { generateMarkdownReport } from '../reports/markdown.js';
import { generatePdfReport } from '../reports/pdf.js';

const router = Router();

// GET /api/reports - List all reports for user
router.get('/', authMiddleware, async (req, res) => {
    try {
        const userId = req.userId;
        const { page = '1', limit = '20' } = req.query;

        const pageNum = parseInt(page as string, 10);
        const limitNum = Math.min(parseInt(limit as string, 10), 100);
        const skip = (pageNum - 1) * limitNum;

        const [reports, total] = await Promise.all([
            prisma.report.findMany({
                where: { userId },
                skip,
                take: limitNum,
                orderBy: { generatedAt: 'desc' },
                include: {
                    company: {
                        select: { id: true, companyName: true, category: true },
                    },
                },
            }),
            prisma.report.count({ where: { userId } }),
        ]);

        res.json({
            reports,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum),
            },
        });
    } catch (error) {
        logger.error({ error }, 'Failed to get reports');
        res.status(500).json({ error: 'Failed to get reports' });
    }
});

// GET /api/reports/:id - Get single report
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const userId = req.userId;
        const { id } = req.params;

        const report = await prisma.report.findFirst({
            where: { id, userId },
            include: {
                company: true,
            },
        });

        if (!report) {
            return res.status(404).json({ error: 'Report not found' });
        }

        res.json({ report });
    } catch (error) {
        logger.error({ error }, 'Failed to get report');
        res.status(500).json({ error: 'Failed to get report' });
    }
});

// GET /api/reports/:id/download/md - Download markdown report
router.get('/:id/download/md', authMiddleware, async (req, res) => {
    try {
        const userId = req.userId;
        const { id } = req.params;

        const report = await prisma.report.findFirst({
            where: { id, userId },
            include: {
                company: {
                    select: { companyName: true },
                },
            },
        });

        if (!report) {
            return res.status(404).json({ error: 'Report not found' });
        }

        const filename = `${report.company.companyName.replace(/[^a-z0-9]/gi, '_')}_intelligence_report.md`;

        res.setHeader('Content-Type', 'text/markdown');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(report.markdownContent);
    } catch (error) {
        logger.error({ error }, 'Failed to download report');
        res.status(500).json({ error: 'Failed to download report' });
    }
});

// GET /api/reports/:id/download/pdf - Download PDF report
router.get('/:id/download/pdf', authMiddleware, async (req, res) => {
    try {
        const userId = req.userId;
        const { id } = req.params;

        const report = await prisma.report.findFirst({
            where: { id, userId },
            include: {
                company: {
                    select: { id: true, companyName: true },
                },
            },
        });

        if (!report) {
            return res.status(404).json({ error: 'Report not found' });
        }

        // Generate PDF on-demand
        const pdfBuffer = await generatePdfReport(report.company.id);

        const filename = `${report.company.companyName.replace(/[^a-z0-9]/gi, '_')}_report.pdf`;

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(pdfBuffer);
    } catch (error) {
        logger.error({ error }, 'Failed to download PDF');
        res.status(500).json({ error: 'Failed to download PDF' });
    }
});

// POST /api/reports/generate/:companyId - Generate report for company
router.post('/generate/:companyId', authMiddleware, async (req, res) => {
    try {
        const userId = req.userId;
        const { companyId } = req.params;

        // Get company with research results
        const company = await prisma.company.findFirst({
            where: { id: companyId, userId },
            include: {
                researchResult: true,
            },
        });

        if (!company) {
            return res.status(404).json({ error: 'Company not found' });
        }

        if (!company.researchResult) {
            return res.status(400).json({ error: 'Research not completed for this company' });
        }

        // Check completeness threshold
        if (company.researchResult.completenessScore < 60) {
            logger.warn({ companyId, score: company.researchResult.completenessScore }, 'Completeness below threshold');
        }

        // Generate markdown report
        const markdownContent = await generateMarkdownReport(companyId);

        // Extract scores from merged intelligence
        const intel = company.researchResult.mergedIntelligence as any;

        // Find existing report or create new
        const existingReport = await prisma.report.findFirst({
            where: { companyId, userId },
            orderBy: { createdAt: 'desc' },
        });

        let report;
        if (existingReport) {
            // Update existing
            report = await prisma.report.update({
                where: { id: existingReport.id },
                data: {
                    markdownContent,
                    digitalMaturityScore: intel?.digitalMaturityScore || 0,
                    socialPresenceScore: intel?.socialPresenceScore || 0,
                    reputationScore: intel?.reputationScore || 0,
                    opportunityScore: intel?.opportunityScore || 0,
                    generatedAt: new Date(),
                    version: { increment: 1 },
                },
            });
        } else {
            // Create new
            if (!userId) {
                return res.status(401).json({ error: 'User not authenticated' });
            }
            report = await prisma.report.create({
                data: {
                    companyId,
                    userId,
                    title: `${company.companyName} Intelligence Report`,
                    markdownContent,
                    digitalMaturityScore: intel?.digitalMaturityScore || 0,
                    socialPresenceScore: intel?.socialPresenceScore || 0,
                    reputationScore: intel?.reputationScore || 0,
                    opportunityScore: intel?.opportunityScore || 0,
                },
            });
        }

        logger.info({ reportId: report.id, companyId }, 'Report generated');

        res.status(201).json({ report });
    } catch (error) {
        logger.error({ error }, 'Failed to generate report');
        res.status(500).json({ error: 'Failed to generate report' });
    }
});

// POST /api/reports/generate-pdf/:companyId - Generate PDF directly
router.post('/generate-pdf/:companyId', authMiddleware, async (req, res) => {
    try {
        const userId = req.userId;
        const { companyId } = req.params;

        // Verify ownership
        const company = await prisma.company.findFirst({
            where: { id: companyId, userId },
            include: { researchResult: true },
        });

        if (!company) {
            return res.status(404).json({ error: 'Company not found' });
        }

        if (!company.researchResult) {
            return res.status(400).json({ error: 'Research not completed' });
        }

        // Generate PDF
        const pdfBuffer = await generatePdfReport(companyId);

        const filename = `${company.companyName.replace(/[^a-z0-9]/gi, '_')}_report.pdf`;

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(pdfBuffer);
    } catch (error) {
        logger.error({ error }, 'Failed to generate PDF');
        res.status(500).json({ error: 'Failed to generate PDF' });
    }
});

// DELETE /api/reports/:id - Delete report
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const userId = req.userId;
        const { id } = req.params;

        const result = await prisma.report.deleteMany({
            where: { id, userId },
        });

        if (result.count === 0) {
            return res.status(404).json({ error: 'Report not found' });
        }

        res.json({ success: true });
    } catch (error) {
        logger.error({ error }, 'Failed to delete report');
        res.status(500).json({ error: 'Failed to delete report' });
    }
});

export default router;
