/**
 * Screenshot Capture Service
 * 
 * Captures website screenshots using Puppeteer.
 */

import puppeteer from 'puppeteer';
import { createLogger } from '../config/logger.js';
import fs from 'fs/promises';
import path from 'path';

const logger = createLogger('screenshot-capture');

export interface ScreenshotOptions {
    width?: number;
    height?: number;
    fullPage?: boolean;
    quality?: number;
    format?: 'png' | 'jpeg' | 'webp';
}

export interface ScreenshotResult {
    url: string;
    success: boolean;
    filepath?: string;
    buffer?: Buffer;
    width: number;
    height: number;
    capturedAt: string;
    error?: string;
}

const DEFAULT_OPTIONS: ScreenshotOptions = {
    width: 1280,
    height: 800,
    fullPage: false,
    quality: 80,
    format: 'jpeg',
};

/**
 * Capture screenshot of a URL
 */
export async function captureScreenshot(
    url: string,
    options: ScreenshotOptions = {}
): Promise<ScreenshotResult> {
    const opts = { ...DEFAULT_OPTIONS, ...options };

    const result: ScreenshotResult = {
        url,
        success: false,
        width: opts.width!,
        height: opts.height!,
        capturedAt: new Date().toISOString(),
    };

    let browser;

    try {
        // Normalize URL
        if (!url.startsWith('http')) {
            url = 'https://' + url;
        }

        logger.debug({ url }, 'Capturing screenshot');

        // Launch browser
        browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
            ],
        });

        const page = await browser.newPage();

        // Set viewport
        await page.setViewport({
            width: opts.width!,
            height: opts.height!,
        });

        // Set user agent
        await page.setUserAgent(
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        );

        // Navigate to URL
        await page.goto(url, {
            waitUntil: 'networkidle2',
            timeout: 30000,
        });

        // Wait a bit for any animations
        await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 1000)));

        // Capture screenshot
        const screenshotBuffer = await page.screenshot({
            type: opts.format,
            quality: opts.format === 'png' ? undefined : opts.quality,
            fullPage: opts.fullPage,
        });

        result.success = true;
        result.buffer = Buffer.from(screenshotBuffer);

        logger.info({ url }, 'Screenshot captured successfully');

    } catch (error) {
        logger.error({ url, error }, 'Screenshot capture failed');
        result.error = (error as Error).message;
    } finally {
        if (browser) {
            await browser.close();
        }
    }

    return result;
}

/**
 * Capture and save screenshot to file
 */
export async function captureAndSaveScreenshot(
    url: string,
    outputDir: string,
    options: ScreenshotOptions = {}
): Promise<ScreenshotResult> {
    const result = await captureScreenshot(url, options);

    if (result.success && result.buffer) {
        try {
            // Create output directory
            await fs.mkdir(outputDir, { recursive: true });

            // Generate filename
            const hostname = new URL(url).hostname.replace(/[^a-z0-9]/gi, '_');
            const timestamp = Date.now();
            const ext = options.format || 'jpeg';
            const filename = `${hostname}_${timestamp}.${ext}`;
            const filepath = path.join(outputDir, filename);

            // Save file
            await fs.writeFile(filepath, result.buffer);
            result.filepath = filepath;

            logger.info({ filepath }, 'Screenshot saved');
        } catch (error) {
            logger.error({ error }, 'Failed to save screenshot');
            result.error = (error as Error).message;
        }
    }

    return result;
}

/**
 * Capture screenshots for multiple URLs
 */
export async function captureMultipleScreenshots(
    urls: string[],
    options: ScreenshotOptions = {}
): Promise<ScreenshotResult[]> {
    const results: ScreenshotResult[] = [];

    // Process sequentially to avoid overwhelming system
    for (const url of urls) {
        const result = await captureScreenshot(url, options);
        results.push(result);
    }

    return results;
}

export default { captureScreenshot, captureAndSaveScreenshot, captureMultipleScreenshots };
