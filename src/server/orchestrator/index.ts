/**
 * Research Orchestrator
 *
 * Coordinates all research agents to gather comprehensive company intelligence.
 * Manages parallel execution, data fusion, and quality checks.
 */

import { prisma } from '../config/database.js';
import { createLogger } from '../config/logger.js';
import { config } from '../config/index.js';
import { analyzeWebsite, type WebsiteAnalysisResult } from '../agents/website-analyst.js';
import { huntSocialProfiles, type SocialHuntResult } from '../agents/social-hunter.js';
import { aggregateNewsReputation, type NewsReputationResult } from '../agents/news-aggregator.js';
import {
    analyzeBusinessOpportunities,
    type BusinessAnalysisResult,
} from '../agents/business-analyzer.js';
import { AgentStatus } from '@prisma/client';

const logger = createLogger('orchestrator');

export interface ResearchProgress {
    jobId: string;
    companyId: string;
    status: 'running' | 'completed' | 'failed';
    progress: number;
    stages: {
        websiteAnalysis: 'pending' | 'running' | 'completed' | 'failed';
        socialHunt: 'pending' | 'running' | 'completed' | 'failed';
        newsAggregation: 'pending' | 'running' | 'completed' | 'failed';
        businessAnalysis: 'pending' | 'running' | 'completed' | 'failed';
    };
}

export interface ComprehensiveIntelligence {
    companyId: string;
    companyName: string;

    // Agent outputs
    websiteData: WebsiteAnalysisResult | null;
    socialData: SocialHuntResult | null;
    newsData: NewsReputationResult | null;
    businessData: BusinessAnalysisResult | null;

    // Merged scores
    digitalMaturityScore: number;
    socialPresenceScore: number;
    reputationScore: number;
    opportunityScore: number;

    // Quality metrics
    completenessScore: number;
    confidenceScore: number;
    dataGaps: string[];

    researchedAt: string;
}

/**
 * Update job progress in database
 */
async function updateJobProgress(
    jobId: string,
    progress: number,
    agentUpdates: Partial<{
        websiteAnalysis: AgentStatus;
        socialMediaHunt: AgentStatus;
        ownerInvestigation: AgentStatus;
        competitorMapping: AgentStatus;
        newsAggregation: AgentStatus;
        businessAnalysis: AgentStatus;
    }>
) {
    try {
        await prisma.researchJob.update({
            where: { id: jobId },
            data: {
                progress,
                ...agentUpdates,
                updatedAt: new Date(),
            },
        });
    } catch (error) {
        logger.error({ jobId, error }, 'Failed to update job progress');
    }
}

/**
 * Calculate completeness score based on data coverage
 */
function calculateCompleteness(intel: ComprehensiveIntelligence): number {
    let score = 0;
    const weights = {
        website: 30,
        social: 20,
        news: 15,
        business: 15,
        contactInfo: 10,
        socialProfiles: 10,
    };

    // Website data
    if (intel.websiteData?.status === 'live') {
        score += weights.website;
    }

    // Social data
    if (intel.socialData && intel.socialData.platforms.length > 0) {
        score += weights.social;
    }

    // News/reputation data
    if (intel.newsData && intel.newsData.totalMentions > 0) {
        score += weights.news;
    }

    // Business analysis
    if (intel.businessData && intel.businessData.opportunities.length > 0) {
        score += weights.business;
    }

    // Contact info
    if (
        intel.websiteData?.contactInfo?.emails?.length ||
        intel.websiteData?.contactInfo?.phones?.length
    ) {
        score += weights.contactInfo;
    }

    // Social profiles found
    if (intel.socialData && intel.socialData.platforms.length >= 2) {
        score += weights.socialProfiles;
    }

    return score;
}

/**
 * Identify data gaps
 */
function identifyDataGaps(intel: ComprehensiveIntelligence): string[] {
    const gaps: string[] = [];

    if (!intel.websiteData || intel.websiteData.status !== 'live') {
        gaps.push('Website not accessible');
    }

    if (!intel.websiteData?.contactInfo?.emails?.length) {
        gaps.push('No email found');
    }

    if (!intel.socialData || intel.socialData.platforms.length === 0) {
        gaps.push('No social profiles found');
    }

    if (!intel.socialData?.platforms.find((p) => p.platform === 'linkedin')) {
        gaps.push('LinkedIn profile not found');
    }

    if (!intel.newsData || intel.newsData.totalMentions === 0) {
        gaps.push('No news coverage found');
    }

    return gaps;
}

/**
 * Execute full research pipeline for a company
 */
export async function executeResearch(jobId: string): Promise<ComprehensiveIntelligence> {
    logger.info({ jobId }, 'Starting research orchestration');

    // Get job and company data
    const job = await prisma.researchJob.findUnique({
        where: { id: jobId },
        include: { company: true },
    });

    if (!job) {
        throw new Error(`Job not found: ${jobId}`);
    }

    const company = job.company;

    // Update job to running
    await prisma.researchJob.update({
        where: { id: jobId },
        data: {
            status: 'RUNNING',
            startedAt: new Date(),
        },
    });

    await prisma.company.update({
        where: { id: company.id },
        data: { status: 'RESEARCHING' },
    });

    const intel: ComprehensiveIntelligence = {
        companyId: company.id,
        companyName: company.companyName,
        websiteData: null,
        socialData: null,
        newsData: null,
        businessData: null,
        digitalMaturityScore: 0,
        socialPresenceScore: 0,
        reputationScore: 0,
        opportunityScore: 0,
        completenessScore: 0,
        confidenceScore: 0,
        dataGaps: [],
        researchedAt: new Date().toISOString(),
    };

    try {
        // Stage 1: Website Analysis (25%)
        logger.info({ jobId }, 'Stage 1: Website Analysis');
        await updateJobProgress(jobId, 5, { websiteAnalysis: AgentStatus.RUNNING });

        if (company.website) {
            intel.websiteData = await analyzeWebsite(company.website, company.companyName);
        }

        await updateJobProgress(jobId, 25, { websiteAnalysis: AgentStatus.COMPLETED });

        // Stage 2: Social Media Hunt (50%)
        logger.info({ jobId }, 'Stage 2: Social Media Hunt');
        await updateJobProgress(jobId, 30, { socialMediaHunt: AgentStatus.RUNNING });

        intel.socialData = await huntSocialProfiles(
            company.companyName,
            company.website || undefined,
            company.phone || undefined,
            company.address || undefined
        );

        await updateJobProgress(jobId, 50, { socialMediaHunt: AgentStatus.COMPLETED });

        // Stage 3: News Aggregation (75%)
        logger.info({ jobId }, 'Stage 3: News Aggregation');
        await updateJobProgress(jobId, 55, { newsAggregation: AgentStatus.RUNNING });

        intel.newsData = await aggregateNewsReputation(
            company.companyName,
            undefined, // Owner names would come from owner-investigator agent
            company.address || undefined
        );

        await updateJobProgress(jobId, 75, { newsAggregation: AgentStatus.COMPLETED });

        // Stage 4: Business Analysis (100%)
        logger.info({ jobId }, 'Stage 4: Business Analysis');
        await updateJobProgress(jobId, 80, { businessAnalysis: AgentStatus.RUNNING });

        intel.businessData = await analyzeBusinessOpportunities(
            company.companyName,
            intel.websiteData,
            intel.socialData,
            intel.newsData
        );

        await updateJobProgress(jobId, 100, { businessAnalysis: AgentStatus.COMPLETED });

        // Calculate final scores
        intel.digitalMaturityScore = intel.businessData?.digitalMaturityScore || 0;
        intel.socialPresenceScore = intel.socialData?.socialPresenceScore || 0;
        intel.reputationScore = intel.newsData?.reputationScore || 50;
        intel.opportunityScore = intel.businessData?.opportunities?.length
            ? Math.min(intel.businessData.opportunities.length * 15, 100)
            : 0;

        intel.completenessScore = calculateCompleteness(intel);
        intel.confidenceScore = Math.round(
            (intel.websiteData?.confidenceScore || 0) / 2 +
                (intel.socialData?.platforms.reduce((sum, p) => sum + p.confidenceScore, 0) || 0) /
                    (intel.socialData?.platforms.length || 1) /
                    4 +
                25
        );

        intel.dataGaps = identifyDataGaps(intel);

        // Save research result
        await prisma.researchResult.upsert({
            where: { companyId: company.id },
            create: {
                companyId: company.id,
                completenessScore: intel.completenessScore,
                confidenceScore: intel.confidenceScore,
                qualityScore: intel.completenessScore,
                websiteData: intel.websiteData
                    ? JSON.parse(JSON.stringify(intel.websiteData))
                    : undefined,
                socialMediaData: intel.socialData
                    ? JSON.parse(JSON.stringify(intel.socialData))
                    : undefined,
                newsData: intel.newsData ? JSON.parse(JSON.stringify(intel.newsData)) : undefined,
                businessAnalysisData: intel.businessData
                    ? JSON.parse(JSON.stringify(intel.businessData))
                    : undefined,
                mergedIntelligence: JSON.parse(JSON.stringify(intel)),
                opportunities: intel.businessData?.opportunities
                    ? JSON.parse(JSON.stringify(intel.businessData.opportunities))
                    : undefined,
                dataGaps: intel.dataGaps,
            },
            update: {
                completenessScore: intel.completenessScore,
                confidenceScore: intel.confidenceScore,
                qualityScore: intel.completenessScore,
                websiteData: intel.websiteData
                    ? JSON.parse(JSON.stringify(intel.websiteData))
                    : undefined,
                socialMediaData: intel.socialData
                    ? JSON.parse(JSON.stringify(intel.socialData))
                    : undefined,
                newsData: intel.newsData ? JSON.parse(JSON.stringify(intel.newsData)) : undefined,
                businessAnalysisData: intel.businessData
                    ? JSON.parse(JSON.stringify(intel.businessData))
                    : undefined,
                mergedIntelligence: JSON.parse(JSON.stringify(intel)),
                opportunities: intel.businessData?.opportunities
                    ? JSON.parse(JSON.stringify(intel.businessData.opportunities))
                    : undefined,
                dataGaps: intel.dataGaps,
                updatedAt: new Date(),
            },
        });

        // Update job and company status
        await prisma.researchJob.update({
            where: { id: jobId },
            data: {
                status: 'COMPLETED',
                completedAt: new Date(),
            },
        });

        await prisma.company.update({
            where: { id: company.id },
            data: { status: 'COMPLETED' },
        });

        logger.info(
            {
                jobId,
                completeness: intel.completenessScore,
                gaps: intel.dataGaps.length,
            },
            'Research complete'
        );

        return intel;
    } catch (error) {
        logger.error({ jobId, error }, 'Research failed');

        // Update job status to failed
        await prisma.researchJob.update({
            where: { id: jobId },
            data: {
                status: 'FAILED',
                errorMessage: (error as Error).message,
            },
        });

        await prisma.company.update({
            where: { id: company.id },
            data: { status: 'FAILED' },
        });

        throw error;
    }
}

export default { executeResearch };
