import pino from 'pino';
import { config } from './index.js';

export const logger = pino({
    level: config.isDev ? 'debug' : 'info',
    transport: config.isDev
        ? {
              target: 'pino-pretty',
              options: {
                  colorize: true,
                  translateTime: 'SYS:standard',
                  ignore: 'pid,hostname',
              },
          }
        : undefined,
});

// Create child loggers for different components
export const createLogger = (component: string) => {
    return logger.child({ component });
};

// Agent-specific loggers
export const agentLoggers = {
    websiteAnalyst: createLogger('website-analyst'),
    socialHunter: createLogger('social-hunter'),
    ownerInvestigator: createLogger('owner-investigator'),
    competitorMapper: createLogger('competitor-mapper'),
    newsAggregator: createLogger('news-aggregator'),
    businessAnalyzer: createLogger('business-analyzer'),
    orchestrator: createLogger('orchestrator'),
};

export default logger;
