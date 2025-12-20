/**
 * Social Media Hunter Agent
 *
 * Finds and analyzes social media presence for companies.
 * Uses Exa.ai for intelligent search and Tavily for verification.
 */

import { config } from '../config/index.js';
import { createLogger } from '../config/logger.js';

const logger = createLogger('social-hunter');

export interface SocialProfile {
    platform: string;
    url: string;
    handle?: string;
    verified: boolean;
    followers?: number;
    lastPostDate?: string;
    activityLevel?: 'active' | 'moderate' | 'inactive' | 'unknown';
    engagementRate?: number;
    confidenceScore: number;
}

export interface SocialHuntResult {
    companyName: string;
    platforms: SocialProfile[];
    totalFollowers: number;
    mostActivePlatform?: string;
    socialPresenceScore: number;
    analyzedAt: string;
    errors?: string[];
}

/**
 * Search using Exa.ai for intelligent social media discovery
 */
async function searchWithExa(query: string, domain?: string): Promise<any> {
    const apiKey = config.apis.exa.apiKey;
    if (!apiKey) {
        throw new Error('Exa API key not configured');
    }

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
            numResults: 10,
            includeDomains: domain ? [domain] : undefined,
        }),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Exa error: ${response.status} - ${error}`);
    }

    return response.json();
}

/**
 * Verify social profile using Tavily
 */
async function verifyWithTavily(companyName: string, socialUrl: string): Promise<boolean> {
    const apiKey = config.apis.tavily.apiKey;
    if (!apiKey) return true; // Skip verification if no API key

    try {
        const response = await fetch('https://api.tavily.com/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                api_key: apiKey,
                query: `${companyName} official ${socialUrl}`,
                search_depth: 'basic',
                max_results: 3,
            }),
        });

        if (!response.ok) return true;

        const data = await response.json();
        // Check if any results mention the company
        const relevantResult = data.results?.find((r: any) =>
            r.content?.toLowerCase().includes(companyName.toLowerCase())
        );

        return !!relevantResult;
    } catch {
        return true; // Default to true if verification fails
    }
}

/**
 * Extract handle from social URL
 */
function extractHandle(url: string, platform: string): string | undefined {
    const patterns: Record<string, RegExp> = {
        linkedin: /linkedin\.com\/(?:company|in)\/([a-zA-Z0-9_-]+)/i,
        facebook: /facebook\.com\/([a-zA-Z0-9._-]+)/i,
        instagram: /instagram\.com\/([a-zA-Z0-9._]+)/i,
        twitter: /(?:twitter\.com|x\.com)\/([a-zA-Z0-9_]+)/i,
        youtube: /youtube\.com\/(?:c\/|channel\/|@)?([a-zA-Z0-9_-]+)/i,
        tiktok: /tiktok\.com\/@([a-zA-Z0-9._]+)/i,
    };

    const match = url.match(patterns[platform]);
    return match ? match[1] : undefined;
}

/**
 * Map domain to platform name
 */
function getPlatformFromUrl(url: string): string | null {
    const platformPatterns: Record<string, RegExp> = {
        linkedin: /linkedin\.com/i,
        facebook: /facebook\.com/i,
        instagram: /instagram\.com/i,
        twitter: /(?:twitter\.com|x\.com)/i,
        youtube: /youtube\.com/i,
        tiktok: /tiktok\.com/i,
        pinterest: /pinterest\.com/i,
    };

    for (const [platform, pattern] of Object.entries(platformPatterns)) {
        if (pattern.test(url)) {
            return platform;
        }
    }
    return null;
}

/**
 * Search for social profiles for a specific platform
 */
async function searchPlatform(
    companyName: string,
    platform: string,
    domain: string,
    location?: string
): Promise<SocialProfile | null> {
    try {
        const query = `${companyName} ${location || ''} official ${platform}`.trim();

        const results = await searchWithExa(query, domain);

        if (!results.results?.length) {
            return null;
        }

        // Find best matching result
        const bestMatch = results.results.find(
            (r: any) =>
                r.url?.includes(domain) &&
                (r.title?.toLowerCase().includes(companyName.toLowerCase()) ||
                    r.url?.toLowerCase().includes(companyName.toLowerCase().replace(/\s+/g, '')))
        );

        if (!bestMatch) {
            return null;
        }

        const handle = extractHandle(bestMatch.url, platform);

        return {
            platform,
            url: bestMatch.url,
            handle,
            verified: false, // Will be verified separately
            confidenceScore: bestMatch.score ? Math.round(bestMatch.score * 100) : 70,
        };
    } catch (error) {
        logger.debug({ platform, error }, 'Platform search failed');
        return null;
    }
}

/**
 * Hunt for all social media profiles of a company
 */
export async function huntSocialProfiles(
    companyName: string,
    website?: string,
    phone?: string,
    location?: string
): Promise<SocialHuntResult> {
    logger.info({ companyName, website }, 'Starting social media hunt');

    const result: SocialHuntResult = {
        companyName,
        platforms: [],
        totalFollowers: 0,
        socialPresenceScore: 0,
        analyzedAt: new Date().toISOString(),
        errors: [],
    };

    const platformDomains: Record<string, string> = {
        linkedin: 'linkedin.com',
        facebook: 'facebook.com',
        instagram: 'instagram.com',
        twitter: 'twitter.com',
        youtube: 'youtube.com',
        tiktok: 'tiktok.com',
    };

    try {
        // Search for profiles in parallel
        const searchPromises = Object.entries(platformDomains).map(([platform, domain]) =>
            searchPlatform(companyName, platform, domain, location)
        );

        const profiles = await Promise.all(searchPromises);

        // Filter out nulls and add to result
        const foundProfiles = profiles.filter((p): p is SocialProfile => p !== null);

        // Verify profiles
        for (const profile of foundProfiles) {
            const verified = await verifyWithTavily(companyName, profile.url);
            profile.verified = verified;
            if (verified) {
                profile.confidenceScore = Math.min(profile.confidenceScore + 10, 100);
            } else {
                profile.confidenceScore = Math.max(profile.confidenceScore - 20, 30);
            }
        }

        result.platforms = foundProfiles;

        // Calculate social presence score
        const platformWeights: Record<string, number> = {
            linkedin: 25,
            facebook: 20,
            instagram: 20,
            twitter: 15,
            youtube: 15,
            tiktok: 5,
        };

        let score = 0;
        for (const profile of foundProfiles) {
            if (profile.verified) {
                score += platformWeights[profile.platform] || 5;
            }
        }
        result.socialPresenceScore = Math.min(score, 100);

        // Find most active platform (simplified - would need actual API calls to determine)
        if (foundProfiles.length > 0) {
            result.mostActivePlatform = foundProfiles[0].platform;
        }

        logger.info(
            {
                companyName,
                found: foundProfiles.length,
                score: result.socialPresenceScore,
            },
            'Social media hunt complete'
        );
    } catch (error) {
        logger.error({ companyName, error }, 'Social media hunt failed');
        result.errors?.push((error as Error).message);
    }

    return result;
}

export default { huntSocialProfiles };
