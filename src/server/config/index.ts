import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export const config = {
    // Server
    port: parseInt(process.env.PORT || '3001', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    isDev: process.env.NODE_ENV !== 'production',

    // JWT
    jwt: {
        secret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    },

    // Database
    database: {
        url: process.env.DATABASE_URL,
    },

    // Redis
    redis: {
        url: process.env.REDIS_URL || 'redis://localhost:6379',
    },

    // CORS
    cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    },

    // Rate limiting
    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
        max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
    },

    // External APIs
    apis: {
        google: {
            mapsApiKey: process.env.GOOGLE_MAPS_API_KEY || '',
            searchApiKey: process.env.GOOGLE_SEARCH_API_KEY || '',
            searchEngineId: process.env.GOOGLE_SEARCH_ENGINE_ID || '',
        },
        openai: {
            apiKey: process.env.OPENAI_API_KEY || '',
        },
        gemini: {
            apiKey: process.env.GEMINI_API_KEY || '',
        },
        openCorporates: {
            apiKey: process.env.OPENCORPORATES_API_KEY || '',
        },
        builtWith: {
            apiKey: process.env.BUILTWITH_API_KEY || '',
        },
        hunterIo: {
            apiKey: process.env.HUNTER_IO_API_KEY || '',
        },
        // Research providers
        tavily: {
            apiKey: process.env.TAVILY_API_KEY || '',
        },
        firecrawl: {
            apiKey: process.env.FIRECRAWL_API_KEY || '',
        },
        exa: {
            apiKey: process.env.EXA_API_KEY || '',
        },
        openRouter: {
            apiKey: process.env.OPENROUTER_API_KEY || '',
        },
        minimax: {
            apiKey: process.env.MINIMAX_API_KEY || '',
        },
        zai: {
            apiKey: process.env.ZAI_API_KEY || '',
            apiUrl: process.env.ZAI_API_URL || 'https://api.z.ai/api/coding/paas/v4',
        },
    },

    // Research settings
    research: {
        completenessThreshold: 60, // Minimum completeness % to generate report
        maxRetries: 3,
        timeoutMs: 30000,
    },

    // Rate limits per source (requests per minute)
    sourceLimits: {
        websites: { rpm: 10, delay: 6000, daily: 500 },
        socialApis: { rpm: 10, delay: 6000, daily: 500 },
        searchEngines: { rpm: 5, delay: 12000, daily: 200 },
        governmentDbs: { rpm: 3, delay: 20000, daily: 100 },
    },
};

export default config;
