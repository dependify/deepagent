/**
 * URL Validation Service
 * 
 * Validates URLs with live checks, redirect handling, and status detection.
 */

import { createLogger } from '../config/logger.js';

const logger = createLogger('url-validator');

export interface UrlValidationResult {
    originalUrl: string;
    finalUrl: string;
    status: 'live' | 'redirect' | 'down' | 'invalid' | 'timeout';
    statusCode?: number;
    redirectChain?: string[];
    responseTime: number;
    hasSSL: boolean;
    sslValid?: boolean;
    errors?: string[];
}

/**
 * Normalize URL (add protocol if missing)
 */
function normalizeUrl(url: string): string {
    if (!url) return '';

    url = url.trim();

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
    }

    return url;
}

/**
 * Validate a URL with live check
 */
export async function validateUrl(url: string): Promise<UrlValidationResult> {
    const startTime = Date.now();

    const result: UrlValidationResult = {
        originalUrl: url,
        finalUrl: url,
        status: 'invalid',
        responseTime: 0,
        hasSSL: false,
        errors: [],
    };

    try {
        // Normalize URL
        const normalizedUrl = normalizeUrl(url);
        if (!normalizedUrl) {
            result.errors?.push('Empty URL');
            return result;
        }

        result.originalUrl = normalizedUrl;
        result.hasSSL = normalizedUrl.startsWith('https://');

        // Validate URL format
        try {
            new URL(normalizedUrl);
        } catch {
            result.errors?.push('Invalid URL format');
            return result;
        }

        // Perform live check with redirect following
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);

        try {
            const response = await fetch(normalizedUrl, {
                method: 'HEAD',
                redirect: 'follow',
                signal: controller.signal,
                headers: {
                    'User-Agent': 'DCIP-URLValidator/1.0',
                },
            });

            clearTimeout(timeout);

            result.statusCode = response.status;
            result.finalUrl = response.url;
            result.responseTime = Date.now() - startTime;

            // Check for redirects
            if (result.finalUrl !== normalizedUrl) {
                result.status = 'redirect';
                result.hasSSL = result.finalUrl.startsWith('https://');
            } else if (response.ok) {
                result.status = 'live';
            } else {
                result.status = 'down';
            }

            // Check SSL validity
            if (result.hasSSL) {
                result.sslValid = true; // fetch would fail on invalid SSL by default
            }

        } catch (fetchError: any) {
            clearTimeout(timeout);

            if (fetchError.name === 'AbortError') {
                result.status = 'timeout';
                result.errors?.push('Request timed out after 10 seconds');
            } else if (fetchError.message?.includes('SSL') || fetchError.message?.includes('certificate')) {
                result.status = 'down';
                result.sslValid = false;
                result.errors?.push('SSL certificate error');
            } else {
                result.status = 'down';
                result.errors?.push(fetchError.message || 'Connection failed');
            }
        }

        // Try HTTP if HTTPS failed
        if (result.status === 'down' && result.hasSSL) {
            const httpUrl = normalizedUrl.replace('https://', 'http://');
            try {
                const httpResponse = await fetch(httpUrl, {
                    method: 'HEAD',
                    redirect: 'follow',
                });

                if (httpResponse.ok) {
                    result.status = 'live';
                    result.finalUrl = httpResponse.url;
                    result.hasSSL = httpResponse.url.startsWith('https://');
                    result.statusCode = httpResponse.status;
                }
            } catch {
                // HTTP fallback also failed
            }
        }

    } catch (error) {
        result.errors?.push((error as Error).message);
    }

    result.responseTime = Date.now() - startTime;

    logger.debug({
        url: result.originalUrl,
        status: result.status,
        responseTime: result.responseTime
    }, 'URL validation complete');

    return result;
}

/**
 * Validate multiple URLs in parallel
 */
export async function validateUrls(urls: string[]): Promise<UrlValidationResult[]> {
    const results = await Promise.all(
        urls.map(url => validateUrl(url))
    );
    return results;
}

export default { validateUrl, validateUrls };
