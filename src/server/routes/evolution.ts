/**
 * Evolution API Routes
 * 
 * Endpoints for evolution/learning system insights and management.
 */

import { Router } from 'express';
import { logger } from '../config/logger.js';
import { authMiddleware } from '../middleware/auth.js';
import {
    getSourcePerformance,
    getBestSources,
    analyzeLearningInsights,
    getEvolutionStats,
} from '../evolution/index.js';

const router = Router();

// GET /api/evolution/stats - Get evolution statistics
router.get('/stats', authMiddleware, async (req, res) => {
    try {
        const stats = await getEvolutionStats();
        res.json(stats);
    } catch (error) {
        logger.error({ error }, 'Failed to get evolution stats');
        res.status(500).json({ error: 'Failed to get evolution stats' });
    }
});

// GET /api/evolution/sources - Get source performance
router.get('/sources', authMiddleware, async (req, res) => {
    try {
        const sources = await getSourcePerformance();
        res.json({ sources });
    } catch (error) {
        logger.error({ error }, 'Failed to get source performance');
        res.status(500).json({ error: 'Failed to get source performance' });
    }
});

// GET /api/evolution/best-sources - Get best performing sources
router.get('/best-sources', authMiddleware, async (req, res) => {
    try {
        const { minRate = '50' } = req.query;
        const sources = await getBestSources(parseInt(minRate as string, 10));
        res.json({ sources });
    } catch (error) {
        logger.error({ error }, 'Failed to get best sources');
        res.status(500).json({ error: 'Failed to get best sources' });
    }
});

// GET /api/evolution/insights - Get learning insights
router.get('/insights', authMiddleware, async (req, res) => {
    try {
        const insights = await analyzeLearningInsights();
        res.json(insights);
    } catch (error) {
        logger.error({ error }, 'Failed to analyze insights');
        res.status(500).json({ error: 'Failed to analyze insights' });
    }
});

export default router;
