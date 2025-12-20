/**
 * News & Reputation Aggregator Agent
 *
 * Gathers news mentions, reviews, and reputation data using Tavily and Exa.
 */

import { config } from '../config/index.js';
import { createLogger } from '../config/logger.js';

const logger = createLogger('news-aggregator');

export interface NewsArticle {
    title: string;
    url: string;
    source: string;
    date?: string;
    snippet: string;
    sentiment: 'positive' | 'negative' | 'neutral';
}

export interface ReviewSummary {
    platform: string;
    rating?: number;
    reviewCount?: number;
    sentiment: string;
    commonThemes?: string[];
}

export interface NewsReputationResult {
    companyName: string;

    // News coverage
    newsArticles: NewsArticle[];
    totalMentions: number;
    positiveCount: number;
    negativeCount: number;
    neutralCount: number;

    // Reviews summary
    reviews: ReviewSummary[];

    // Reputation scores
    reputationScore: number;
    overallSentiment: 'positive' | 'negative' | 'neutral' | 'mixed';

    // Notable items
    notableStories: string[];
    riskFlags: string[];

    analyzedAt: string;
    errors?: string[];
}

/**
 * Search news using Tavily
 */
async function searchNews(query: string): Promise<any> {
    const apiKey = config.apis.tavily.apiKey;
    if (!apiKey) {
        throw new Error('Tavily API key not configured');
    }

    const response = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            api_key: apiKey,
            query,
            search_depth: 'advanced',
            include_answer: true,
            max_results: 10,
            include_domains: [
                'news.google.com',
                'reuters.com',
                'businesswire.com',
                'prnewswire.com',
            ],
        }),
    });

    if (!response.ok) {
        throw new Error(`Tavily error: ${response.status}`);
    }

    return response.json();
}

/**
 * Search reviews using Exa
 */
async function searchReviews(companyName: string): Promise<any> {
    const apiKey = config.apis.exa.apiKey;
    if (!apiKey) return { results: [] };

    try {
        const response = await fetch('https://api.exa.ai/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
            },
            body: JSON.stringify({
                query: `${companyName} reviews ratings customer feedback`,
                type: 'neural',
                numResults: 10,
                includeDomains: [
                    'google.com',
                    'yelp.com',
                    'trustpilot.com',
                    'bbb.org',
                    'glassdoor.com',
                ],
            }),
        });

        if (!response.ok) return { results: [] };
        return response.json();
    } catch {
        return { results: [] };
    }
}

/**
 * Simple sentiment analysis (would use AI in production)
 */
function analyzeSentiment(text: string): 'positive' | 'negative' | 'neutral' {
    const lowerText = text.toLowerCase();

    const positiveWords = [
        'great',
        'excellent',
        'amazing',
        'wonderful',
        'best',
        'fantastic',
        'love',
        'perfect',
        'outstanding',
        'recommended',
        'success',
        'growth',
        'award',
        'winner',
    ];
    const negativeWords = [
        'bad',
        'terrible',
        'awful',
        'worst',
        'poor',
        'disappointed',
        'scam',
        'fraud',
        'lawsuit',
        'complaint',
        'failed',
        'bankruptcy',
        'sued',
        'violation',
    ];

    let positiveScore = 0;
    let negativeScore = 0;

    for (const word of positiveWords) {
        if (lowerText.includes(word)) positiveScore++;
    }

    for (const word of negativeWords) {
        if (lowerText.includes(word)) negativeScore++;
    }

    if (positiveScore > negativeScore + 1) return 'positive';
    if (negativeScore > positiveScore + 1) return 'negative';
    return 'neutral';
}

/**
 * Extract risk flags from content
 */
function extractRiskFlags(content: string): string[] {
    const flags: string[] = [];
    const lowerContent = content.toLowerCase();

    const riskPatterns: Record<string, string> = {
        'lawsuit|sued|court|legal action': 'Potential legal issues mentioned',
        'complaint|bbb|consumer protection': 'Customer complaints detected',
        'fraud|scam|deceptive': 'Fraud allegations mentioned',
        'bankruptcy|closed|shutdown': 'Business stability concerns',
        'data breach|hack|security': 'Security incident mentioned',
    };

    for (const [pattern, flag] of Object.entries(riskPatterns)) {
        if (new RegExp(pattern).test(lowerContent)) {
            flags.push(flag);
        }
    }

    return flags;
}

/**
 * Aggregate news and reputation data for a company
 */
export async function aggregateNewsReputation(
    companyName: string,
    ownerNames?: string[],
    location?: string
): Promise<NewsReputationResult> {
    logger.info({ companyName }, 'Starting news & reputation aggregation');

    const result: NewsReputationResult = {
        companyName,
        newsArticles: [],
        totalMentions: 0,
        positiveCount: 0,
        negativeCount: 0,
        neutralCount: 0,
        reviews: [],
        reputationScore: 50,
        overallSentiment: 'neutral',
        notableStories: [],
        riskFlags: [],
        analyzedAt: new Date().toISOString(),
        errors: [],
    };

    try {
        // Search for news
        const newsQuery = `"${companyName}" ${location || ''} news company`.trim();
        const newsData = await searchNews(newsQuery);

        if (newsData.results) {
            for (const item of newsData.results) {
                const sentiment = analyzeSentiment(item.content || item.title || '');

                result.newsArticles.push({
                    title: item.title,
                    url: item.url,
                    source: new URL(item.url).hostname.replace('www.', ''),
                    snippet: item.content?.substring(0, 200) || '',
                    sentiment,
                });

                result.totalMentions++;
                if (sentiment === 'positive') result.positiveCount++;
                else if (sentiment === 'negative') result.negativeCount++;
                else result.neutralCount++;

                // Extract risk flags
                const flags = extractRiskFlags(item.content || '');
                result.riskFlags = [...new Set([...result.riskFlags, ...flags])];
            }
        }

        // Search for reviews
        const reviewData = await searchReviews(companyName);

        if (reviewData.results) {
            for (const item of reviewData.results) {
                const sentiment = analyzeSentiment(item.text || item.title || '');
                result.reviews.push({
                    platform: new URL(item.url).hostname.replace('www.', ''),
                    sentiment: sentiment,
                });
            }
        }

        // Calculate reputation score
        const total = result.positiveCount + result.negativeCount + result.neutralCount;
        if (total > 0) {
            const positiveRatio = result.positiveCount / total;
            const negativeRatio = result.negativeCount / total;

            result.reputationScore = Math.round(50 + positiveRatio * 40 - negativeRatio * 40);
            result.reputationScore = Math.max(0, Math.min(100, result.reputationScore));

            // Reduce score for risk flags
            result.reputationScore -= result.riskFlags.length * 10;
            result.reputationScore = Math.max(0, result.reputationScore);
        }

        // Determine overall sentiment
        if (result.positiveCount > result.negativeCount * 2) {
            result.overallSentiment = 'positive';
        } else if (result.negativeCount > result.positiveCount * 2) {
            result.overallSentiment = 'negative';
        } else if (result.positiveCount > 0 && result.negativeCount > 0) {
            result.overallSentiment = 'mixed';
        }

        // Notable stories (first positive and first negative)
        const positiveStory = result.newsArticles.find((a) => a.sentiment === 'positive');
        const negativeStory = result.newsArticles.find((a) => a.sentiment === 'negative');

        if (positiveStory) result.notableStories.push(positiveStory.title);
        if (negativeStory) result.notableStories.push(negativeStory.title);

        logger.info(
            {
                companyName,
                mentions: result.totalMentions,
                score: result.reputationScore,
            },
            'News aggregation complete'
        );
    } catch (error) {
        logger.error({ companyName, error }, 'News aggregation failed');
        result.errors?.push((error as Error).message);
    }

    return result;
}

export default { aggregateNewsReputation };
