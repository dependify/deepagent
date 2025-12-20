/**
 * Competitor Mapper Agent
 *
 * Discovers and analyzes competitors in the same market/location.
 * Uses Exa.ai for discovery and Tavily for verification.
 */

import { config } from '../config/index.js';
import { createLogger } from '../config/logger.js';

const logger = createLogger('competitor-mapper');

export interface CompetitorProfile {
    name: string;
    website?: string;
    description?: string;

    // Basic metrics
    hasWebsite: boolean;
    hasSocialMedia: boolean;

    // Comparison scores
    digitalPresenceScore: number;
    estimatedSize: 'small' | 'medium' | 'large' | 'unknown';

    // Threat level
    competitiveThreat: 'high' | 'medium' | 'low';

    confidenceScore: number;
}

export interface CompetitorMappingResult {
    companyName: string;
    location?: string;
    category?: string;

    // Discovered competitors
    competitors: CompetitorProfile[];

    // Market analysis
    totalCompetitorsFound: number;
    marketSaturation: 'low' | 'medium' | 'high';

    // Competitive position
    strongerCompetitors: number;
    weakerCompetitors: number;

    analyzedAt: string;
    errors?: string[];
}

/**
 * Search for competitors using Exa
 */
async function searchCompetitors(
    category: string,
    location: string,
    excludeCompany: string
): Promise<any[]> {
    const apiKey = config.apis.exa.apiKey;
    if (!apiKey) return [];

    try {
        const query = `${category} business company ${location} -"${excludeCompany}"`;

        const response = await fetch('https://api.exa.ai/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
            },
            body: JSON.stringify({
                query,
                type: 'neural',
                useAutoprompt: true,
                numResults: 15,
            }),
        });

        if (!response.ok) return [];

        const data = await response.json();
        return data.results || [];
    } catch (error) {
        logger.debug({ error }, 'Competitor search failed');
        return [];
    }
}

/**
 * Search for local competitors using Tavily
 */
async function searchLocalCompetitors(
    category: string,
    location: string,
    excludeCompany: string
): Promise<any[]> {
    const apiKey = config.apis.tavily.apiKey;
    if (!apiKey) return [];

    try {
        const query = `best ${category} near ${location} top rated businesses`;

        const response = await fetch('https://api.tavily.com/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                api_key: apiKey,
                query,
                search_depth: 'advanced',
                max_results: 10,
            }),
        });

        if (!response.ok) return [];

        const data = await response.json();
        return data.results || [];
    } catch (error) {
        logger.debug({ error }, 'Local competitor search failed');
        return [];
    }
}

/**
 * Extract competitor info from search result
 */
function extractCompetitorInfo(result: any, excludeCompany: string): CompetitorProfile | null {
    const title = result.title || '';
    const url = result.url || '';
    const content = result.text || result.content || '';

    // Skip if it's the original company
    if (title.toLowerCase().includes(excludeCompany.toLowerCase())) {
        return null;
    }

    // Skip non-business results
    if (url.includes('wikipedia') || url.includes('yelp.com/topic')) {
        return null;
    }

    // Extract company name from title
    const name = title.replace(/[-|–].*$/, '').trim();
    if (!name || name.length < 3) return null;

    // Determine if has website
    const hasWebsite =
        !url.includes('yelp.com') && !url.includes('facebook.com') && !url.includes('linkedin.com');

    // Estimate digital presence
    let digitalScore = 30;
    if (hasWebsite) digitalScore += 30;
    if (content.toLowerCase().includes('social')) digitalScore += 10;
    if (content.toLowerCase().includes('review')) digitalScore += 10;

    return {
        name,
        website: hasWebsite ? url : undefined,
        description: content.substring(0, 200),
        hasWebsite,
        hasSocialMedia:
            content.toLowerCase().includes('facebook') ||
            content.toLowerCase().includes('instagram'),
        digitalPresenceScore: digitalScore,
        estimatedSize: 'unknown',
        competitiveThreat: digitalScore > 60 ? 'high' : digitalScore > 40 ? 'medium' : 'low',
        confidenceScore: result.score ? Math.round(result.score * 100) : 50,
    };
}

/**
 * Map competitors for a company
 */
export async function mapCompetitors(
    companyName: string,
    category?: string,
    location?: string
): Promise<CompetitorMappingResult> {
    logger.info({ companyName, category, location }, 'Starting competitor mapping');

    const result: CompetitorMappingResult = {
        companyName,
        location,
        category,
        competitors: [],
        totalCompetitorsFound: 0,
        marketSaturation: 'low',
        strongerCompetitors: 0,
        weakerCompetitors: 0,
        analyzedAt: new Date().toISOString(),
        errors: [],
    };

    if (!category && !location) {
        result.errors?.push('Category or location required for competitor mapping');
        return result;
    }

    try {
        const searchCategory = category || 'business';
        const searchLocation = location || '';

        // Search using both Exa and Tavily
        const [exaResults, tavilyResults] = await Promise.all([
            searchCompetitors(searchCategory, searchLocation, companyName),
            searchLocalCompetitors(searchCategory, searchLocation, companyName),
        ]);

        // Process results
        const seenNames = new Set<string>();

        for (const searchResult of [...exaResults, ...tavilyResults]) {
            const competitor = extractCompetitorInfo(searchResult, companyName);
            if (competitor && !seenNames.has(competitor.name.toLowerCase())) {
                seenNames.add(competitor.name.toLowerCase());
                result.competitors.push(competitor);
            }
        }

        // Sort by digital presence
        result.competitors.sort((a, b) => b.digitalPresenceScore - a.digitalPresenceScore);

        // Keep top 10
        result.competitors = result.competitors.slice(0, 10);
        result.totalCompetitorsFound = result.competitors.length;

        // Calculate market saturation
        if (result.totalCompetitorsFound >= 8) {
            result.marketSaturation = 'high';
        } else if (result.totalCompetitorsFound >= 4) {
            result.marketSaturation = 'medium';
        }

        // Count stronger/weaker (assuming average digital score of 50)
        result.strongerCompetitors = result.competitors.filter(
            (c) => c.digitalPresenceScore > 60
        ).length;
        result.weakerCompetitors = result.competitors.filter(
            (c) => c.digitalPresenceScore < 40
        ).length;

        logger.info(
            {
                companyName,
                competitorsFound: result.totalCompetitorsFound,
                saturation: result.marketSaturation,
            },
            'Competitor mapping complete'
        );
    } catch (error) {
        logger.error({ companyName, error }, 'Competitor mapping failed');
        result.errors?.push((error as Error).message);
    }

    return result;
}

export default { mapCompetitors };
