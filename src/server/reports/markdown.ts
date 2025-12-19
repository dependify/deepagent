/**
 * Markdown Report Generator
 * 
 * Generates comprehensive marketing intelligence reports in Markdown format.
 */

import { prisma } from '../config/database.js';
import { createLogger } from '../config/logger.js';
import type { ComprehensiveIntelligence } from '../orchestrator/index.js';

const logger = createLogger('report-generator');

/**
 * Format a score with color indicator
 */
function formatScore(score: number): string {
    if (score >= 70) return `🟢 ${score}%`;
    if (score >= 40) return `🟡 ${score}%`;
    return `🔴 ${score}%`;
}

/**
 * Format date nicely
 */
function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

/**
 * Generate executive summary section
 */
function generateExecutiveSummary(intel: ComprehensiveIntelligence): string {
    const overallScore = Math.round(
        (intel.digitalMaturityScore + intel.socialPresenceScore + intel.reputationScore) / 3
    );

    return `
## Executive Summary

| Metric | Score |
|--------|-------|
| **Overall Digital Health** | ${formatScore(overallScore)} |
| Digital Maturity | ${formatScore(intel.digitalMaturityScore)} |
| Social Presence | ${formatScore(intel.socialPresenceScore)} |
| Reputation | ${formatScore(intel.reputationScore)} |
| Opportunity Score | ${formatScore(intel.opportunityScore)} |

**Data Completeness:** ${intel.completenessScore}% | **Confidence:** ${intel.confidenceScore}%

${intel.dataGaps.length > 0 ? `
### Data Gaps
${intel.dataGaps.map(gap => `- ⚠️ ${gap}`).join('\n')}
` : ''}
`;
}

/**
 * Generate website analysis section
 */
function generateWebsiteSection(intel: ComprehensiveIntelligence): string {
    const website = intel.websiteData;

    if (!website || website.status !== 'live') {
        return `
## Website Analysis

❌ **Website Not Accessible**

${website?.errors?.length ? `Errors encountered: ${website.errors.join(', ')}` : 'No website data available.'}

**Recommendation:** Establish a professional web presence as the foundation of your digital strategy.
`;
    }

    return `
## Website Analysis

**Status:** ✅ Live | **URL:** ${website.finalUrl || website.url}

### Basic Information
- **Title:** ${website.title || 'Not detected'}
- **Description:** ${website.description || 'Not detected'}

### Contact Information
| Type | Details |
|------|---------|
| Emails | ${website.contactInfo?.emails?.join(', ') || 'None found'} |
| Phones | ${website.contactInfo?.phones?.join(', ') || 'None found'} |
| Live Chat | ${website.contactInfo?.hasLiveChat ? '✅ Yes' : '❌ No'} |

### Security & SEO
| Metric | Status |
|--------|--------|
| SSL Certificate | ${website.seoMetrics?.hasSSL ? '✅ Secure' : '❌ Not Secure'} |
| Meta Tags Complete | ${website.seoMetrics?.metaTagsComplete ? '✅ Yes' : '❌ No'} |

### Content Inventory
| Feature | Status |
|---------|--------|
| Blog/Articles | ${website.contentInventory?.hasBlog ? '✅ Yes' : '❌ No'} |
| Testimonials | ${website.contentInventory?.hasTestimonials ? '✅ Yes' : '❌ No'} |
| Case Studies | ${website.contentInventory?.hasCaseStudies ? '✅ Yes' : '❌ No'} |
| Team Page | ${website.contentInventory?.hasTeamPage ? '✅ Yes' : '❌ No'} |

### Social Links Found
${website.socialLinks && Object.keys(website.socialLinks).length > 0
            ? Object.entries(website.socialLinks).map(([platform, url]) => `- **${platform}:** ${url}`).join('\n')
            : '- None found on website'}
`;
}

/**
 * Generate social media section
 */
function generateSocialSection(intel: ComprehensiveIntelligence): string {
    const social = intel.socialData;

    if (!social || social.platforms.length === 0) {
        return `
## Social Media Presence

❌ **No Social Profiles Found**

**Recommendation:** Establish presence on LinkedIn, Facebook, and Instagram to build credibility and reach.
`;
    }

    return `
## Social Media Presence

**Social Presence Score:** ${formatScore(social.socialPresenceScore)}
**Platforms Found:** ${social.platforms.length}

### Discovered Profiles

| Platform | Handle | Verified | Confidence |
|----------|--------|----------|------------|
${social.platforms.map(p =>
        `| ${p.platform} | ${p.handle || 'N/A'} | ${p.verified ? '✅' : '❓'} | ${p.confidenceScore}% |`
    ).join('\n')}

${social.mostActivePlatform ? `**Most Active Platform:** ${social.mostActivePlatform}` : ''}
`;
}

/**
 * Generate reputation section
 */
function generateReputationSection(intel: ComprehensiveIntelligence): string {
    const news = intel.newsData;

    if (!news) {
        return `
## News & Reputation

No news or reputation data available.
`;
    }

    return `
## News & Reputation

**Reputation Score:** ${formatScore(news.reputationScore)}
**Overall Sentiment:** ${news.overallSentiment === 'positive' ? '😊 Positive' :
            news.overallSentiment === 'negative' ? '😞 Negative' :
                news.overallSentiment === 'mixed' ? '😐 Mixed' : '😐 Neutral'}

### News Coverage
- **Total Mentions:** ${news.totalMentions}
- **Positive:** ${news.positiveCount} | **Neutral:** ${news.neutralCount} | **Negative:** ${news.negativeCount}

${news.riskFlags.length > 0 ? `
### ⚠️ Risk Flags
${news.riskFlags.map(flag => `- 🚨 ${flag}`).join('\n')}
` : ''}

${news.newsArticles.length > 0 ? `
### Recent Mentions
${news.newsArticles.slice(0, 5).map(article =>
                    `- **${article.title}** (${article.source}) - ${article.sentiment}`
                ).join('\n')}
` : ''}
`;
}

/**
 * Generate opportunities section
 */
function generateOpportunitiesSection(intel: ComprehensiveIntelligence): string {
    const business = intel.businessData;

    if (!business || business.opportunities.length === 0) {
        return `
## Marketing Opportunities

No specific opportunities identified at this time.
`;
    }

    return `
## Marketing Opportunities

**Opportunity Score:** ${formatScore(intel.opportunityScore)}

### Identified Gaps & Recommendations

| Priority | Area | Gap | Recommendation | Impact |
|----------|------|-----|----------------|--------|
${business.opportunities.map(opp =>
        `| ${opp.priority} | ${opp.area} | ${opp.gap} | ${opp.recommendation} | ${opp.impact.toUpperCase()} |`
    ).join('\n')}

### Suggested Services
${business.suggestedServices.map(service => `- ✅ ${service}`).join('\n')}

### Discovery Call Talking Points
${business.talkingPoints.map((point, i) => `${i + 1}. ${point}`).join('\n')}

${business.potentialObjections.length > 0 ? `
### Potential Objections to Prepare For
${business.potentialObjections.map(obj => `- "${obj}"`).join('\n')}
` : ''}
`;
}

/**
 * Generate full markdown report
 */
export async function generateMarkdownReport(companyId: string): Promise<string> {
    logger.info({ companyId }, 'Generating markdown report');

    // Get company and research result
    const company = await prisma.company.findUnique({
        where: { id: companyId },
        include: { researchResult: true },
    });

    if (!company) {
        throw new Error('Company not found');
    }

    if (!company.researchResult) {
        throw new Error('Research not completed for this company');
    }

    const intel = company.researchResult.mergedIntelligence as unknown as ComprehensiveIntelligence;

    // Generate report sections
    const report = `
# Company Intelligence Report

## ${company.companyName}

**Generated:** ${formatDate(new Date().toISOString())}
**Research Date:** ${intel?.researchedAt ? formatDate(intel.researchedAt) : 'N/A'}

---

${generateExecutiveSummary(intel)}

---

${generateWebsiteSection(intel)}

---

${generateSocialSection(intel)}

---

${generateReputationSection(intel)}

---

${generateOpportunitiesSection(intel)}

---

## Company Details

| Field | Value |
|-------|-------|
| Address | ${company.address || 'Not available'} |
| Phone | ${company.phone || 'Not available'} |
| Website | ${company.website || 'Not available'} |
| Category | ${company.category || 'Not specified'} |
| Google Rating | ${company.rating ? `⭐ ${company.rating}/5 (${company.reviewsCount} reviews)` : 'N/A'} |

---

*This report was generated by the Deep Company Intelligence Platform (DCIP).*
*Data accuracy depends on availability of public information.*
`;

    logger.info({ companyId }, 'Markdown report generated');
    return report.trim();
}

export default { generateMarkdownReport };
