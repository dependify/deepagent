/**
 * Owner/Leadership Investigator Agent
 *
 * Discovers business ownership and leadership information using public sources.
 * Uses Exa.ai for intelligent search and Tavily for verification.
 */

import { config } from '../config/index.js';
import { createLogger } from '../config/logger.js';

const logger = createLogger('owner-investigator');

export interface LeaderProfile {
    name: string;
    title?: string;
    linkedinUrl?: string;
    bio?: string;
    imageUrl?: string;
    otherBusinesses?: string[];
    confidenceScore: number;
}

export interface BusinessFilingInfo {
    registeredName?: string;
    registrationNumber?: string;
    registrationDate?: string;
    status?: string;
    registeredAgent?: string;
    registeredAddress?: string;
    officers?: string[];
}

export interface OwnerInvestigationResult {
    companyName: string;

    // Leadership found
    leaders: LeaderProfile[];

    // Business filings
    filingInfo?: BusinessFilingInfo;

    // Associated businesses
    relatedBusinesses: string[];

    // Summary
    ownershipClarity: 'clear' | 'partial' | 'unknown';

    analyzedAt: string;
    errors?: string[];
}

/**
 * Search for business filings using Exa
 */
async function searchBusinessFilings(
    companyName: string,
    location?: string
): Promise<BusinessFilingInfo | null> {
    const apiKey = config.apis.exa.apiKey;
    if (!apiKey) return null;

    try {
        const query =
            `"${companyName}" business registration filing corporation LLC ${location || ''}`.trim();

        const response = await fetch('https://api.exa.ai/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
            },
            body: JSON.stringify({
                query,
                type: 'neural',
                numResults: 5,
                includeDomains: ['opencorporates.com', 'sec.gov', 'sos.state', 'corps.state'],
            }),
        });

        if (!response.ok) return null;

        const data = await response.json();

        if (!data.results?.length) return null;

        // Extract filing info from results
        const result = data.results[0];
        return {
            registeredName: companyName,
            status: 'Active', // Would parse from actual result
        };
    } catch (error) {
        logger.debug({ error }, 'Business filing search failed');
        return null;
    }
}

/**
 * Search for company leadership using Tavily
 */
async function searchLeadership(companyName: string, website?: string): Promise<LeaderProfile[]> {
    const apiKey = config.apis.tavily.apiKey;
    if (!apiKey) return [];

    try {
        const query =
            `"${companyName}" founder owner CEO president leadership team ${website || ''}`.trim();

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
            }),
        });

        if (!response.ok) return [];

        const data = await response.json();
        const leaders: LeaderProfile[] = [];

        // Extract names from answer
        if (data.answer) {
            // Simple pattern matching for names with titles
            const titlePatterns = [
                /(?:CEO|Chief Executive Officer|Founder|Owner|President|Director)[:\s]+([A-Z][a-z]+ [A-Z][a-z]+)/gi,
                /([A-Z][a-z]+ [A-Z][a-z]+)[,\s]+(?:CEO|Chief Executive Officer|Founder|Owner|President)/gi,
            ];

            for (const pattern of titlePatterns) {
                const matches = data.answer.matchAll(pattern);
                for (const match of matches) {
                    const name = match[1]?.trim();
                    if (name && name.length > 3 && !leaders.find((l) => l.name === name)) {
                        leaders.push({
                            name,
                            title: match[0].includes('CEO')
                                ? 'CEO'
                                : match[0].includes('Founder')
                                  ? 'Founder'
                                  : match[0].includes('Owner')
                                    ? 'Owner'
                                    : 'Executive',
                            confidenceScore: 60,
                        });
                    }
                }
            }
        }

        return leaders;
    } catch (error) {
        logger.debug({ error }, 'Leadership search failed');
        return [];
    }
}

/**
 * Search for LinkedIn profiles of leaders using Exa
 */
async function findLinkedInProfiles(
    leaders: LeaderProfile[],
    companyName: string
): Promise<LeaderProfile[]> {
    const apiKey = config.apis.exa.apiKey;
    if (!apiKey) return leaders;

    for (const leader of leaders) {
        try {
            const query = `${leader.name} ${companyName} linkedin`;

            const response = await fetch('https://api.exa.ai/search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': apiKey,
                },
                body: JSON.stringify({
                    query,
                    type: 'neural',
                    numResults: 3,
                    includeDomains: ['linkedin.com'],
                }),
            });

            if (!response.ok) continue;

            const data = await response.json();

            if (data.results?.length) {
                const linkedinResult = data.results.find((r: any) =>
                    r.url?.includes('linkedin.com/in/')
                );
                if (linkedinResult) {
                    leader.linkedinUrl = linkedinResult.url;
                    leader.confidenceScore = Math.min(leader.confidenceScore + 20, 100);
                }
            }
        } catch {
            // Continue with next leader
        }
    }

    return leaders;
}

/**
 * Find other businesses associated with owners
 */
async function findRelatedBusinesses(
    leaders: LeaderProfile[],
    originalCompany: string
): Promise<string[]> {
    const apiKey = config.apis.tavily.apiKey;
    if (!apiKey || leaders.length === 0) return [];

    const relatedBusinesses: Set<string> = new Set();

    for (const leader of leaders.slice(0, 3)) {
        try {
            const query = `"${leader.name}" other businesses companies owned`;

            const response = await fetch('https://api.tavily.com/search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    api_key: apiKey,
                    query,
                    search_depth: 'basic',
                    max_results: 5,
                }),
            });

            if (!response.ok) continue;

            const data = await response.json();

            // Extract business names from results (simplified)
            if (data.answer) {
                const businessPattern =
                    /(?:owns?|founded?|runs?|manages?)[:\s]+([A-Z][A-Za-z\s&]+(?:LLC|Inc|Corp|Company)?)/gi;
                const matches = data.answer.matchAll(businessPattern);
                for (const match of matches) {
                    const business = match[1]?.trim();
                    if (business && business !== originalCompany && business.length > 3) {
                        relatedBusinesses.add(business);
                    }
                }
            }
        } catch {
            // Continue
        }
    }

    return Array.from(relatedBusinesses);
}

/**
 * Investigate company ownership and leadership
 */
export async function investigateOwnership(
    companyName: string,
    website?: string,
    address?: string
): Promise<OwnerInvestigationResult> {
    logger.info({ companyName }, 'Starting owner investigation');

    const result: OwnerInvestigationResult = {
        companyName,
        leaders: [],
        relatedBusinesses: [],
        ownershipClarity: 'unknown',
        analyzedAt: new Date().toISOString(),
        errors: [],
    };

    try {
        // Search for leadership
        result.leaders = await searchLeadership(companyName, website);

        // Find LinkedIn profiles
        if (result.leaders.length > 0) {
            result.leaders = await findLinkedInProfiles(result.leaders, companyName);
        }

        // Search business filings
        result.filingInfo = (await searchBusinessFilings(companyName, address)) || undefined;

        // Find related businesses
        result.relatedBusinesses = await findRelatedBusinesses(result.leaders, companyName);

        // Determine ownership clarity
        if (result.leaders.length > 0 && result.leaders.some((l) => l.linkedinUrl)) {
            result.ownershipClarity = 'clear';
        } else if (result.leaders.length > 0 || result.filingInfo) {
            result.ownershipClarity = 'partial';
        }

        logger.info(
            {
                companyName,
                leadersFound: result.leaders.length,
                clarity: result.ownershipClarity,
            },
            'Owner investigation complete'
        );
    } catch (error) {
        logger.error({ companyName, error }, 'Owner investigation failed');
        result.errors?.push((error as Error).message);
    }

    return result;
}

export default { investigateOwnership };
