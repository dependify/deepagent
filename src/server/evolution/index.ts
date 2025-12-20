/**
 * Evolution & Learning System
 *
 * Tracks research patterns, source quality, and adapts strategies over time.
 * Implements the "adaptive learning" layer of the antifragile architecture.
 */

import { prisma } from '../config/database.js';
import { createLogger } from '../config/logger.js';

const logger = createLogger('evolution');

// Event types matching the Prisma schema
const EventTypes = {
    SOURCE_SUCCESS: 'SOURCE_SUCCESS' as const,
    SOURCE_FAILURE: 'SOURCE_FAILURE' as const,
    RESEARCH_COMPLETE: 'RESEARCH_COMPLETE' as const,
    ADAPTATION_APPLIED: 'ADAPTATION_APPLIED' as const,
};

export interface SourcePerformance {
    sourceName: string;
    successRate: number;
    avgDurationMs: number;
    avgQualityScore: number;
    lastUsed: Date | null;
    isEnabled: boolean;
}

export interface LearningInsights {
    topSources: string[];
    problematicSources: string[];
    avgProcessingTime: number;
    qualityTrend: 'improving' | 'declining' | 'stable';
    recommendations: string[];
}

/**
 * Log a source success event
 */
export async function logSourceSuccess(
    source: string,
    durationMs: number,
    dataQualityScore: number,
    industry?: string
): Promise<void> {
    try {
        await prisma.evolutionLog.create({
            data: {
                eventType: EventTypes.SOURCE_SUCCESS,
                source,
                industry,
                durationMs,
                dataQualityScore,
            },
        });

        await updateSourceMetrics(source, true, durationMs, dataQualityScore);
        logger.debug({ source }, 'Source success logged');
    } catch (error) {
        logger.error({ error }, 'Failed to log source success');
    }
}

/**
 * Log a source failure event
 */
export async function logSourceFailure(
    source: string,
    errorCode: string,
    errorMessage: string,
    retryCount?: number,
    fallbackUsed?: string
): Promise<void> {
    try {
        await prisma.evolutionLog.create({
            data: {
                eventType: EventTypes.SOURCE_FAILURE,
                source,
                errorCode,
                errorMessage,
                retryCount,
                fallbackUsed,
            },
        });

        await updateSourceMetrics(source, false, 0, 0);
        logger.debug({ source, errorCode }, 'Source failure logged');
    } catch (error) {
        logger.error({ error }, 'Failed to log source failure');
    }
}

/**
 * Log research completion
 */
export async function logResearchComplete(
    companyId: string,
    completenessScore: number,
    sourcesUsed: string[],
    sourcesFailed: string[],
    gaps: string[]
): Promise<void> {
    try {
        await prisma.evolutionLog.create({
            data: {
                eventType: EventTypes.RESEARCH_COMPLETE,
                companyId,
                completenessScore,
                sourcesUsed,
                sourcesFailed,
                gaps,
            },
        });

        logger.debug({ companyId, completenessScore }, 'Research completion logged');
    } catch (error) {
        logger.error({ error }, 'Failed to log research completion');
    }
}

/**
 * Update source performance metrics
 */
async function updateSourceMetrics(
    sourceName: string,
    success: boolean,
    durationMs: number,
    qualityScore: number
): Promise<void> {
    try {
        const existing = await prisma.sourceConfig.findUnique({
            where: { sourceName },
        });

        if (existing) {
            const newSuccessRate = success
                ? Math.min(100, existing.successRate + (100 - existing.successRate) * 0.1)
                : Math.max(0, existing.successRate - 10);

            const newAvgDuration =
                success && durationMs > 0
                    ? Math.round((existing.avgDurationMs + durationMs) / 2)
                    : existing.avgDurationMs;

            const newAvgQuality =
                success && qualityScore > 0
                    ? (existing.avgQualityScore + qualityScore) / 2
                    : existing.avgQualityScore;

            await prisma.sourceConfig.update({
                where: { sourceName },
                data: {
                    successRate: newSuccessRate,
                    avgDurationMs: newAvgDuration,
                    avgQualityScore: newAvgQuality,
                    isEnabled: newSuccessRate > 20,
                    lastUsed: new Date(),
                    currentDailyUsage: { increment: 1 },
                },
            });
        } else {
            await prisma.sourceConfig.create({
                data: {
                    sourceName,
                    isEnabled: true,
                    priority: 5,
                    successRate: success ? 100 : 0,
                    avgQualityScore: qualityScore || 50,
                    avgDurationMs: durationMs || 0,
                    requestsPerMinute: 10,
                    delayBetweenMs: 6000,
                    dailyLimit: 500,
                    lastUsed: new Date(),
                },
            });
        }
    } catch (error) {
        logger.error({ sourceName, error }, 'Failed to update source metrics');
    }
}

/**
 * Get source performance stats
 */
export async function getSourcePerformance(): Promise<SourcePerformance[]> {
    const sources = await prisma.sourceConfig.findMany({
        orderBy: { successRate: 'desc' },
    });

    return sources.map(
        (s: {
            sourceName: string;
            successRate: number;
            avgDurationMs: number;
            avgQualityScore: number;
            lastUsed: Date | null;
            isEnabled: boolean;
        }) => ({
            sourceName: s.sourceName,
            successRate: s.successRate,
            avgDurationMs: s.avgDurationMs,
            avgQualityScore: s.avgQualityScore,
            lastUsed: s.lastUsed,
            isEnabled: s.isEnabled,
        })
    );
}

/**
 * Get best sources for a specific use case
 */
export async function getBestSources(minSuccessRate: number = 50): Promise<string[]> {
    const sources = await prisma.sourceConfig.findMany({
        where: {
            isEnabled: true,
            successRate: { gte: minSuccessRate },
        },
        orderBy: [{ successRate: 'desc' }, { avgQualityScore: 'desc' }],
        take: 5,
    });

    return sources.map((s: { sourceName: string }) => s.sourceName);
}

/**
 * Analyze learning insights from historical data
 */
export async function analyzeLearningInsights(): Promise<LearningInsights> {
    const insights: LearningInsights = {
        topSources: [],
        problematicSources: [],
        avgProcessingTime: 0,
        qualityTrend: 'stable',
        recommendations: [],
    };

    try {
        // Get top performing sources
        const topSources = await prisma.sourceConfig.findMany({
            where: { isEnabled: true, successRate: { gte: 70 } },
            orderBy: { successRate: 'desc' },
            take: 5,
        });
        insights.topSources = topSources.map((s: { sourceName: string }) => s.sourceName);

        // Get problematic sources
        const badSources = await prisma.sourceConfig.findMany({
            where: { successRate: { lt: 50 } },
            orderBy: { successRate: 'asc' },
            take: 5,
        });
        insights.problematicSources = badSources.map((s: { sourceName: string }) => s.sourceName);

        // Calculate average processing time from recent research completions
        const recentLogs = await prisma.evolutionLog.findMany({
            where: { eventType: EventTypes.RESEARCH_COMPLETE },
            orderBy: { timestamp: 'desc' },
            take: 20,
        });

        if (recentLogs.length > 0) {
            const totalDuration = recentLogs.reduce(
                (sum: number, log: { durationMs: number | null }) => sum + (log.durationMs || 0),
                0
            );
            insights.avgProcessingTime = Math.round(totalDuration / recentLogs.length / 1000);
        }

        // Analyze quality trend
        if (recentLogs.length >= 10) {
            const firstHalf = recentLogs.slice(0, 10);
            const secondHalf = recentLogs.slice(10, 20);

            const firstAvg =
                firstHalf.reduce(
                    (s: number, r: { completenessScore: number | null }) =>
                        s + (r.completenessScore || 0),
                    0
                ) / firstHalf.length;

            const secondAvg =
                secondHalf.length > 0
                    ? secondHalf.reduce(
                          (s: number, r: { completenessScore: number | null }) =>
                              s + (r.completenessScore || 0),
                          0
                      ) / secondHalf.length
                    : firstAvg;

            if (firstAvg > secondAvg + 5) {
                insights.qualityTrend = 'improving';
            } else if (firstAvg < secondAvg - 5) {
                insights.qualityTrend = 'declining';
            }
        }

        // Generate recommendations
        if (insights.problematicSources.length > 0) {
            insights.recommendations.push(
                `Consider reviewing: ${insights.problematicSources.join(', ')}`
            );
        }

        if (insights.qualityTrend === 'declining') {
            insights.recommendations.push(
                'Research quality is declining. Review agent configurations.'
            );
        }

        if (insights.avgProcessingTime > 300) {
            insights.recommendations.push(
                'Processing time is high. Consider optimizing parallel execution.'
            );
        }
    } catch (error) {
        logger.error({ error }, 'Failed to analyze learning insights');
    }

    return insights;
}

/**
 * Get evolution statistics
 */
export async function getEvolutionStats(): Promise<{
    totalEvents: number;
    successCount: number;
    failureCount: number;
    researchCompleteCount: number;
    recentEvents: any[];
}> {
    const [total, success, failure, researchComplete, recent] = await Promise.all([
        prisma.evolutionLog.count(),
        prisma.evolutionLog.count({ where: { eventType: EventTypes.SOURCE_SUCCESS } }),
        prisma.evolutionLog.count({ where: { eventType: EventTypes.SOURCE_FAILURE } }),
        prisma.evolutionLog.count({ where: { eventType: EventTypes.RESEARCH_COMPLETE } }),
        prisma.evolutionLog.findMany({
            orderBy: { timestamp: 'desc' },
            take: 10,
        }),
    ]);

    return {
        totalEvents: total,
        successCount: success,
        failureCount: failure,
        researchCompleteCount: researchComplete,
        recentEvents: recent,
    };
}

export default {
    logSourceSuccess,
    logSourceFailure,
    logResearchComplete,
    getSourcePerformance,
    getBestSources,
    analyzeLearningInsights,
    getEvolutionStats,
};
