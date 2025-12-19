import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config/index.js';
import { logger } from './config/logger.js';
import { prisma } from './config/database.js';

// Import routes
import authRoutes from './routes/auth.js';
import uploadRoutes from './routes/upload.js';
import companyRoutes from './routes/companies.js';
import researchRoutes from './routes/research.js';
import reportRoutes from './routes/reports.js';
import evolutionRoutes from './routes/evolution.js';
import adminRoutes from './routes/admin.js';
import profileRoutes from './routes/profile.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ============================================================================
// MIDDLEWARE
// ============================================================================

// Security (relaxed for serving static files)
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
}));

// CORS
app.use(cors({
    origin: config.cors.origin,
    credentials: true,
}));

// Rate limiting (only for API routes)
const limiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.max,
    message: { error: 'Too many requests, please try again later.' },
});
app.use('/api', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging (only for API routes to reduce noise)
app.use('/api', (req, res, next) => {
    logger.info({
        method: req.method,
        path: req.path,
        ip: req.ip,
    }, 'Incoming request');
    next();
});

// ============================================================================
// API ROUTES
// ============================================================================

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/research', researchRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/evolution', evolutionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/profile', profileRoutes);

// ============================================================================
// STATIC FILE SERVING (Production)
// ============================================================================

// Serve static files from the React build
const clientDistPath = path.join(__dirname, '../../dist/client');
app.use(express.static(clientDistPath));

// Serve index.html for all non-API routes (SPA fallback)
app.get('*', (req, res, next) => {
    // Skip API routes
    if (req.path.startsWith('/api')) {
        return next();
    }

    res.sendFile(path.join(clientDistPath, 'index.html'), (err) => {
        if (err) {
            // If index.html doesn't exist (dev mode), return 404
            res.status(404).json({ error: 'Not found - run npm run build first for production' });
        }
    });
});

// ============================================================================
// ERROR HANDLING
// ============================================================================

// 404 handler for API routes
app.use('/api', (req, res) => {
    res.status(404).json({ error: 'API endpoint not found' });
});

// Global error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    logger.error({ err, path: req.path }, 'Unhandled error');

    res.status(500).json({
        error: config.isDev ? err.message : 'Internal server error',
    });
});

// ============================================================================
// SERVER STARTUP
// ============================================================================

const PORT = config.port;

async function startServer() {
    try {
        // Test database connection
        await prisma.$connect();
        logger.info('Database connected successfully');

        app.listen(PORT, () => {
            logger.info(`Server running on http://localhost:${PORT}`);
            logger.info(`Environment: ${config.nodeEnv}`);
            logger.info(`Mode: ${config.isDev ? 'Development (use Vite for frontend)' : 'Production (serving built frontend)'}`);
        });
    } catch (error) {
        logger.error({ error }, 'Failed to start server');
        process.exit(1);
    }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
    logger.info('SIGTERM received, shutting down...');
    await prisma.$disconnect();
    process.exit(0);
});

process.on('SIGINT', async () => {
    logger.info('SIGINT received, shutting down...');
    await prisma.$disconnect();
    process.exit(0);
});

startServer();

export default app;
