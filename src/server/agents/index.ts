/**
 * Agents Index
 *
 * Export all research agents for easy importing.
 */

export { analyzeWebsite, type WebsiteAnalysisResult } from './website-analyst.js';
export { huntSocialProfiles, type SocialHuntResult, type SocialProfile } from './social-hunter.js';
export {
    aggregateNewsReputation,
    type NewsReputationResult,
    type NewsArticle,
} from './news-aggregator.js';
export {
    analyzeBusinessOpportunities,
    type BusinessAnalysisResult,
    type MarketingOpportunity,
} from './business-analyzer.js';
export {
    investigateOwnership,
    type OwnerInvestigationResult,
    type LeaderProfile,
} from './owner-investigator.js';
export {
    mapCompetitors,
    type CompetitorMappingResult,
    type CompetitorProfile,
} from './competitor-mapper.js';
