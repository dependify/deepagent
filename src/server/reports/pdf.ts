/**
 * PDF Report Generator
 *
 * Converts Markdown reports to PDF using Puppeteer.
 */

import puppeteer from 'puppeteer';
import { createLogger } from '../config/logger.js';
import { generateMarkdownReport } from './markdown.js';
import fs from 'fs/promises';
import path from 'path';

const logger = createLogger('pdf-generator');

/**
 * Convert markdown to basic HTML
 */
function markdownToHtml(markdown: string): string {
    let html = markdown
        // Headers
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        // Bold
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        // Italic
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        // Links
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
        // Lists
        .replace(/^- (.*$)/gim, '<li>$1</li>')
        // Tables (basic conversion)
        .replace(/\|(.+)\|/g, (match) => {
            const cells = match.split('|').filter((c) => c.trim());
            const isHeader = cells.some((c) => c.includes('---'));
            if (isHeader) return '';
            return '<tr>' + cells.map((c) => `<td>${c.trim()}</td>`).join('') + '</tr>';
        })
        // Horizontal rules
        .replace(/^---$/gim, '<hr>')
        // Paragraphs
        .replace(/\n\n/g, '</p><p>')
        // Line breaks
        .replace(/\n/g, '<br>');

    // Wrap lists
    html = html.replace(/(<li>.*?<\/li>)+/gs, '<ul>$&</ul>');

    // Wrap tables
    html = html.replace(/(<tr>.*?<\/tr>)+/gs, '<table>$&</table>');

    return html;
}

/**
 * Generate styled HTML for PDF
 */
function generateStyledHtml(markdown: string, companyName: string): string {
    const content = markdownToHtml(markdown);

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${companyName} - Intelligence Report</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      font-size: 11pt;
      line-height: 1.6;
      color: #1e293b;
      padding: 40px;
      max-width: 800px;
      margin: 0 auto;
    }
    
    h1 {
      font-size: 24pt;
      color: #0ea5e9;
      margin-bottom: 10px;
      border-bottom: 3px solid #0ea5e9;
      padding-bottom: 10px;
    }
    
    h2 {
      font-size: 16pt;
      color: #0369a1;
      margin-top: 30px;
      margin-bottom: 15px;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 5px;
    }
    
    h3 {
      font-size: 12pt;
      color: #334155;
      margin-top: 20px;
      margin-bottom: 10px;
    }
    
    p {
      margin-bottom: 10px;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 15px 0;
      font-size: 10pt;
    }
    
    th, td {
      border: 1px solid #e2e8f0;
      padding: 8px 12px;
      text-align: left;
    }
    
    th {
      background: #f8fafc;
      font-weight: 600;
    }
    
    tr:nth-child(even) {
      background: #f8fafc;
    }
    
    ul {
      margin: 10px 0;
      padding-left: 25px;
    }
    
    li {
      margin: 5px 0;
    }
    
    hr {
      border: none;
      border-top: 1px solid #e2e8f0;
      margin: 20px 0;
    }
    
    a {
      color: #0ea5e9;
      text-decoration: none;
    }
    
    .score-high { color: #16a34a; }
    .score-medium { color: #d97706; }
    .score-low { color: #dc2626; }
    
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e2e8f0;
      font-size: 9pt;
      color: #64748b;
      text-align: center;
    }

    @media print {
      body {
        padding: 20px;
      }
      
      h2 {
        page-break-after: avoid;
      }
      
      table {
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  ${content}
</body>
</html>
`;
}

/**
 * Generate PDF report for a company
 */
export async function generatePdfReport(companyId: string): Promise<Buffer> {
    logger.info({ companyId }, 'Generating PDF report');

    // Generate markdown first
    const markdown = await generateMarkdownReport(companyId);

    // Get company name for title
    const company = await (
        await import('../config/database.js')
    ).prisma.company.findUnique({
        where: { id: companyId },
        select: { companyName: true },
    });

    if (!company) {
        throw new Error('Company not found');
    }

    // Convert to styled HTML
    const html = generateStyledHtml(markdown, company.companyName);

    // Launch Puppeteer and generate PDF
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0' });

        const pdfBuffer = await page.pdf({
            format: 'A4',
            margin: {
                top: '20mm',
                right: '15mm',
                bottom: '20mm',
                left: '15mm',
            },
            printBackground: true,
        });

        logger.info({ companyId }, 'PDF report generated');
        return Buffer.from(pdfBuffer);
    } finally {
        await browser.close();
    }
}

/**
 * Save PDF report to file
 */
export async function savePdfReport(companyId: string, outputDir: string): Promise<string> {
    const pdfBuffer = await generatePdfReport(companyId);

    // Get company name for filename
    const company = await (
        await import('../config/database.js')
    ).prisma.company.findUnique({
        where: { id: companyId },
        select: { companyName: true },
    });

    const filename = `${company?.companyName?.replace(/[^a-z0-9]/gi, '_') || companyId}_report.pdf`;
    const filepath = path.join(outputDir, filename);

    await fs.mkdir(outputDir, { recursive: true });
    await fs.writeFile(filepath, pdfBuffer);

    logger.info({ companyId, filepath }, 'PDF saved to file');
    return filepath;
}

export default { generatePdfReport, savePdfReport };
