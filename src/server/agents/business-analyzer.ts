/**
 * Business Process Analyzer Agent
 *
 * Identifies marketing opportunities and automation gaps.
 * Uses OpenRouter API for AI analysis.
 */

import { config } from '../config/index.js';
import { createLogger } from '../config/logger.js';
import type { WebsiteAnalysisResult } from './website-analyst.js';
import type { SocialHuntResult } from './social-hunter.js';
import type { NewsReputationResult } from './news-aggregator.js';

const logger = createLogger('business-analyzer');

export interface MarketingOpportunity {
    area: string;
    currentState: string;
    gap: string;
    recommendation: string;
    impact: 'high' | 'medium' | 'low';
    priority: number;
}

export interface BusinessAnalysisResult {
    companyName: string;

    // Maturity assessments
    digitalMaturityScore: number;
    socialMaturityScore: number;
    marketingMaturityScore: number;

    // Identified opportunities
    opportunities: MarketingOpportunity[];

    // Summary
    topOpportunities: string[];
    suggestedServices: string[];

    // Discovery call insights
    talkingPoints: string[];
    potentialObjections: string[];

    analyzedAt: string;
    errors?: string[];
}

/**
 * Analyze with OpenRouter AI
 */
async function analyzeWithAI(prompt: string): Promise<string> {
    const apiKey = config.apis.openRouter.apiKey;
    if (!apiKey) {
        logger.warn('OpenRouter API key not configured, using fallback analysis');
        return '';
    }

    try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`,
                'HTTP-Referer': 'https://dcip.local',
            },
            body: JSON.stringify({
                model: 'openai/gpt-4o-mini',
                messages: [
                    {
                        role: 'system',
                        content:
                            'You are a marketing intelligence analyst. Analyze business data and identify opportunities for AI automation, website improvement, content marketing, and lead generation. Be concise and actionable.',
                    },
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
                max_tokens: 1000,
            }),
        });

        if (!response.ok) {
            throw new Error(`OpenRouter error: ${response.status}`);
        }

        const data = await response.json();
        return data.choices?.[0]?.message?.content || '';
    } catch (error) {
        logger.error({ error }, 'AI analysis failed');
        return '';
    }
}

/**
 * Calculate digital maturity score
 */
function calculateDigitalMaturity(website: WebsiteAnalysisResult | null): number {
    if (!website || website.status !== 'live') return 10;

    let score = 30; // Base score for having a live website

    if (website.seoMetrics?.hasSSL) score += 10;
    if (website.seoMetrics?.metaTagsComplete) score += 10;
    if (website.contentInventory?.hasBlog) score += 15;
    if (website.contentInventory?.hasTeamPage) score += 5;
    if (website.contactInfo?.hasLiveChat) score += 10;
    if (website.contactInfo?.emails?.length) score += 5;
    if (website.socialLinks && Object.keys(website.socialLinks).length >= 3) score += 10;
    if (website.techStack?.ecommerce) score += 5;

    return Math.min(score, 100);
}

/**
 * Identify opportunities based on gaps
 */
function identifyOpportunities(
    website: WebsiteAnalysisResult | null,
    social: SocialHuntResult | null,
    reputation: NewsReputationResult | null
): MarketingOpportunity[] {
    const opportunities: MarketingOpportunity[] = [];
    let priority = 1;

    // Website opportunities
    if (!website || website.status !== 'live') {
        opportunities.push({
            area: 'Website',
            currentState: 'No website or not accessible',
            gap: 'Missing online presence',
            recommendation: 'Build professional website with SEO',
            impact: 'high',
            priority: priority++,
        });
    } else {
        if (!website.seoMetrics?.hasSSL) {
            opportunities.push({
                area: 'Security',
                currentState: 'No SSL certificate',
                gap: 'Website not secure',
                recommendation: 'Install SSL certificate for HTTPS',
                impact: 'high',
                priority: priority++,
            });
        }

        if (!website.contentInventory?.hasBlog) {
            opportunities.push({
                area: 'Content Marketing',
                currentState: 'No blog or content section',
                gap: 'Missing SEO content',
                recommendation: 'Start content strategy with blog',
                impact: 'medium',
                priority: priority++,
            });
        }

        if (!website.contactInfo?.hasLiveChat) {
            opportunities.push({
                area: 'Lead Capture',
                currentState: 'No live chat',
                gap: 'Missing instant communication',
                recommendation: 'Implement AI chatbot for 24/7 support',
                impact: 'high',
                priority: priority++,
            });
        }
    }

    // Social media opportunities
    if (!social || social.platforms.length === 0) {
        opportunities.push({
            area: 'Social Media',
            currentState: 'No social presence',
            gap: 'Missing social proof and reach',
            recommendation: 'Set up social media profiles',
            impact: 'high',
            priority: priority++,
        });
    } else if (social.platforms.length < 3) {
        const missingPlatforms = ['linkedin', 'facebook', 'instagram'].filter(
            (p) => !social.platforms.find((sp) => sp.platform === p)
        );

        opportunities.push({
            area: 'Social Media Expansion',
            currentState: `Only ${social.platforms.length} platform(s)`,
            gap: `Missing ${missingPlatforms.join(', ')}`,
            recommendation: 'Expand to additional platforms',
            impact: 'medium',
            priority: priority++,
        });
    }

    // Reputation opportunities
    if (reputation) {
        if (reputation.reviews.length === 0) {
            opportunities.push({
                area: 'Reviews',
                currentState: 'Few or no online reviews',
                gap: 'Missing social proof',
                recommendation: 'Implement review generation system',
                impact: 'high',
                priority: priority++,
            });
        }

        if (reputation.riskFlags.length > 0) {
            opportunities.push({
                area: 'Reputation Management',
                currentState: reputation.riskFlags[0],
                gap: 'Negative mentions online',
                recommendation: 'Active reputation monitoring and response',
                impact: 'high',
                priority: priority++,
            });
        }
    }

    return opportunities;
}

/**
 * Generate talking points for discovery call
 */
function generateTalkingPoints(opportunities: MarketingOpportunity[]): string[] {
    const points: string[] = [];

    const highImpact = opportunities.filter((o) => o.impact === 'high').slice(0, 3);

    for (const opp of highImpact) {
        points.push(
            `I noticed ${opp.currentState.toLowerCase()}. ${opp.recommendation} could help grow your business.`
        );
    }

    if (points.length === 0) {
        points.push(
            'Your digital presence looks solid. Let me share some advanced strategies to take it to the next level.'
        );
    }

    return points;
}

/**
 * Analyze business opportunities and gaps
 */
export async function analyzeBusinessOpportunities(
    companyName: string,
    website: WebsiteAnalysisResult | null,
    social: SocialHuntResult | null,
    reputation: NewsReputationResult | null
): Promise<BusinessAnalysisResult> {
    logger.info({ companyName }, 'Starting business process analysis');

    const result: BusinessAnalysisResult = {
        companyName,
        digitalMaturityScore: 0,
        socialMaturityScore: 0,
        marketingMaturityScore: 0,
        opportunities: [],
        topOpportunities: [],
        suggestedServices: [],
        talkingPoints: [],
        potentialObjections: [],
        analyzedAt: new Date().toISOString(),
        errors: [],
    };

    try {
        // Calculate maturity scores
        result.digitalMaturityScore = calculateDigitalMaturity(website);
        result.socialMaturityScore = social?.socialPresenceScore || 0;
        result.marketingMaturityScore = Math.round(
            (result.digitalMaturityScore + result.socialMaturityScore) / 2
        );

        // Identify opportunities
        result.opportunities = identifyOpportunities(website, social, reputation);

        // Top 3 opportunities
        result.topOpportunities = result.opportunities
            .slice(0, 3)
            .map((o) => `${o.area}: ${o.recommendation}`);

        // Suggested services based on gaps
        const services = new Set<string>();
        for (const opp of result.opportunities) {
            if (opp.area === 'Website') services.add('Website Development');
            if (opp.area === 'Content Marketing') services.add('Content Strategy');
            if (opp.area === 'Lead Capture') services.add('AI Chatbot');
            if (opp.area === 'Social Media') services.add('Social Media Management');
            if (opp.area === 'Reviews') services.add('Review Generation');
            if (opp.area === 'Reputation Management') services.add('Reputation Monitoring');
            if (opp.area === 'Security') services.add('Website Security');
        }
        result.suggestedServices = Array.from(services);

        // Generate talking points
        result.talkingPoints = generateTalkingPoints(result.opportunities);

        // Common objections
        result.potentialObjections = [
            'We already have someone handling our marketing',
            "We tried digital marketing before and it didn't work",
            'We get most of our business through referrals',
        ];

        // Optional: Use AI for deeper analysis
        if (config.apis.openRouter.apiKey && result.opportunities.length > 0) {
            const aiPrompt = `Analyze this business:
Company: ${companyName}
Digital Maturity: ${result.digitalMaturityScore}%
Social Presence: ${result.socialMaturityScore}%
Top gaps: ${result.topOpportunities.join(', ')}

Provide 2-3 specific, actionable recommendations as bullet points.`;

            const aiInsights = await analyzeWithAI(aiPrompt);
            if (aiInsights) {
                result.talkingPoints.push(
                    ...aiInsights
                        .split('\n')
                        .filter((l) => l.trim().startsWith('-'))
                        .slice(0, 2)
                );
            }
        }

        logger.info(
            {
                companyName,
                opportunities: result.opportunities.length,
                maturity: result.marketingMaturityScore,
            },
            'Business analysis complete'
        );
    } catch (error) {
        logger.error({ companyName, error }, 'Business analysis failed');
        result.errors?.push((error as Error).message);
    }

    return result;
}

export default { analyzeBusinessOpportunities };
