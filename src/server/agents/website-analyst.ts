/**
 * Website Analyst Agent
 * 
 * Extracts comprehensive intelligence from company websites using Firecrawl.
 * Falls back to Tavily for content analysis if scraping fails.
 */

import { config } from '../config/index.js';
import { createLogger } from '../config/logger.js';

const logger = createLogger('website-analyst');

export interface WebsiteAnalysisResult {
    url: string;
    status: 'live' | 'down' | 'redirect' | 'error';
    finalUrl?: string;

    // Basic info
    title?: string;
    description?: string;

    // Business info extracted
    businessInfo?: {
        description?: string;
        services?: string[];
        products?: string[];
        targetAudience?: string;
        uniqueSellingPoints?: string[];
    };

    // Contact info
    contactInfo?: {
        emails?: string[];
        phones?: string[];
        address?: string;
        contactFormUrl?: string;
        hasLiveChat?: boolean;
    };

    // Social links found on website
    socialLinks?: {
        linkedin?: string;
        facebook?: string;
        instagram?: string;
        twitter?: string;
        youtube?: string;
        tiktok?: string;
    };

    // Technical analysis
    techStack?: {
        cms?: string;
        framework?: string;
        analytics?: string[];
        marketing?: string[];
        ecommerce?: string;
    };

    // SEO metrics
    seoMetrics?: {
        hasSSL: boolean;
        mobileResponsive?: boolean;
        pageSpeedScore?: number;
        metaTagsComplete: boolean;
    };

    // Content inventory
    contentInventory?: {
        hasBlog: boolean;
        blogPostCount?: number;
        hasTestimonials: boolean;
        hasCaseStudies: boolean;
        hasTeamPage: boolean;
        teamMembers?: string[];
    };

    // Raw data
    rawContent?: string;
    screenshotUrl?: string;

    // Metadata
    analyzedAt: string;
    confidenceScore: number;
    errors?: string[];
}

/**
 * Scrape website using Firecrawl API
 */
async function scrapeWithFirecrawl(url: string): Promise<any> {
    const apiKey = config.apis.firecrawl.apiKey;
    if (!apiKey) {
        throw new Error('Firecrawl API key not configured');
    }

    const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            url,
            formats: ['markdown', 'html'],
            includeTags: ['title', 'meta', 'h1', 'h2', 'h3', 'p', 'a', 'img'],
            excludeTags: ['script', 'style', 'nav', 'footer'],
            waitFor: 3000,
            timeout: 30000,
        }),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Firecrawl error: ${response.status} - ${error}`);
    }

    return response.json();
}

/**
 * Search for website info using Tavily as fallback
 */
async function searchWithTavily(query: string): Promise<any> {
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
            include_raw_content: true,
            max_results: 5,
        }),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Tavily error: ${response.status} - ${error}`);
    }

    return response.json();
}

/**
 * Extract emails from text content
 */
function extractEmails(content: string): string[] {
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const matches = content.match(emailRegex) || [];
    return [...new Set(matches)].filter(email =>
        !email.includes('example.com') &&
        !email.includes('test.com') &&
        !email.endsWith('.png') &&
        !email.endsWith('.jpg')
    );
}

/**
 * Extract phone numbers from text content
 */
function extractPhones(content: string): string[] {
    const phoneRegex = /(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}/g;
    const matches = content.match(phoneRegex) || [];
    return [...new Set(matches)];
}

/**
 * Extract social media links from HTML/markdown content
 */
function extractSocialLinks(content: string): WebsiteAnalysisResult['socialLinks'] {
    const socialLinks: WebsiteAnalysisResult['socialLinks'] = {};

    const patterns: Record<string, RegExp> = {
        linkedin: /https?:\/\/(?:www\.)?linkedin\.com\/(?:company|in)\/[a-zA-Z0-9_-]+/gi,
        facebook: /https?:\/\/(?:www\.)?facebook\.com\/[a-zA-Z0-9._-]+/gi,
        instagram: /https?:\/\/(?:www\.)?instagram\.com\/[a-zA-Z0-9._]+/gi,
        twitter: /https?:\/\/(?:www\.)?(?:twitter\.com|x\.com)\/[a-zA-Z0-9_]+/gi,
        youtube: /https?:\/\/(?:www\.)?youtube\.com\/(?:c\/|channel\/|@)?[a-zA-Z0-9_-]+/gi,
        tiktok: /https?:\/\/(?:www\.)?tiktok\.com\/@[a-zA-Z0-9._]+/gi,
    };

    for (const [platform, regex] of Object.entries(patterns)) {
        const matches = content.match(regex);
        if (matches && matches.length > 0) {
            socialLinks[platform as keyof typeof socialLinks] = matches[0];
        }
    }

    return socialLinks;
}

/**
 * Analyze website for a company
 */
export async function analyzeWebsite(url: string, companyName: string): Promise<WebsiteAnalysisResult> {
    logger.info({ url, companyName }, 'Starting website analysis');

    const result: WebsiteAnalysisResult = {
        url,
        status: 'error',
        analyzedAt: new Date().toISOString(),
        confidenceScore: 0,
        errors: [],
    };

    try {
        // Normalize URL
        if (!url.startsWith('http')) {
            url = 'https://' + url;
        }

        // Try Firecrawl first
        let scrapedData: any = null;
        try {
            logger.debug({ url }, 'Attempting Firecrawl scrape');
            scrapedData = await scrapeWithFirecrawl(url);
            result.status = 'live';
            result.finalUrl = scrapedData.data?.metadata?.url || url;
        } catch (firecrawlError) {
            logger.warn({ url, error: firecrawlError }, 'Firecrawl failed, trying Tavily');
            result.errors?.push(`Firecrawl: ${(firecrawlError as Error).message}`);

            // Fallback to Tavily search
            try {
                const tavilyResult = await searchWithTavily(`${companyName} ${url} company information`);
                if (tavilyResult.answer) {
                    result.status = 'live';
                    result.businessInfo = {
                        description: tavilyResult.answer,
                    };
                    result.rawContent = tavilyResult.results?.map((r: any) => r.content).join('\n');
                }
            } catch (tavilyError) {
                result.errors?.push(`Tavily: ${(tavilyError as Error).message}`);
                result.status = 'error';
                return result;
            }
        }

        // Process Firecrawl data if available
        if (scrapedData?.data) {
            const data = scrapedData.data;
            const content = data.markdown || data.html || '';

            // Extract metadata
            result.title = data.metadata?.title;
            result.description = data.metadata?.description;

            // Extract contact info
            result.contactInfo = {
                emails: extractEmails(content),
                phones: extractPhones(content),
                hasLiveChat: content.toLowerCase().includes('live chat') ||
                    content.toLowerCase().includes('intercom') ||
                    content.toLowerCase().includes('drift'),
            };

            // Extract social links
            result.socialLinks = extractSocialLinks(content);

            // Detect content features
            result.contentInventory = {
                hasBlog: /blog|articles|news|posts/i.test(content),
                hasTestimonials: /testimonial|review|what .* say/i.test(content),
                hasCaseStudies: /case stud|success stor/i.test(content),
                hasTeamPage: /team|about us|our people|leadership/i.test(content),
            };

            // SEO basics
            result.seoMetrics = {
                hasSSL: url.startsWith('https') || result.finalUrl?.startsWith('https') || false,
                metaTagsComplete: !!(result.title && result.description),
            };

            // Store raw content (truncated)
            result.rawContent = content.substring(0, 10000);

            // Calculate confidence score
            let confidence = 50;
            if (result.title) confidence += 10;
            if (result.description) confidence += 10;
            if (result.contactInfo?.emails?.length) confidence += 10;
            if (result.socialLinks && Object.keys(result.socialLinks).length > 0) confidence += 10;
            if (result.contentInventory?.hasBlog) confidence += 5;
            if (result.contentInventory?.hasTeamPage) confidence += 5;

            result.confidenceScore = Math.min(confidence, 100);
        }

        logger.info({ url, status: result.status, confidence: result.confidenceScore }, 'Website analysis complete');
        return result;

    } catch (error) {
        logger.error({ url, error }, 'Website analysis failed');
        result.errors?.push((error as Error).message);
        return result;
    }
}

export default { analyzeWebsite };
