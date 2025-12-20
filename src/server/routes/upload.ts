import { Router } from 'express';
import multer from 'multer';
import Papa from 'papaparse';
import { z } from 'zod';
import { prisma } from '../config/database.js';
import { logger } from '../config/logger.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// Configure multer for file uploads
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
            cb(null, true);
        } else {
            cb(new Error('Only CSV files are allowed'));
        }
    },
});

// CSV row validation schema
const csvRowSchema = z.object({
    company_name: z.string().min(1),
    address: z.string().optional(),
    phone: z.string().optional(),
    website: z.string().optional(),
    category: z.string().optional(),
    rating: z.string().optional(),
    reviews_count: z.string().optional(),
    place_id: z.string().optional(),
});

// POST /api/upload/csv
router.post('/csv', authMiddleware, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const userId = req.userId;

        if (!userId) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        const csvContent = req.file.buffer.toString('utf-8');

        // Parse CSV
        const parseResult = Papa.parse(csvContent, {
            header: true,
            skipEmptyLines: true,
            transformHeader: (header) => header.toLowerCase().trim().replace(/\s+/g, '_'),
        });

        if (parseResult.errors.length > 0) {
            logger.warn({ errors: parseResult.errors }, 'CSV parsing errors');
        }

        const rows = parseResult.data as Record<string, string>[];
        const validCompanies: any[] = [];
        const errors: any[] = [];

        // Validate and transform rows
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];

            try {
                const validated = csvRowSchema.parse(row);
                validCompanies.push({
                    userId,
                    companyName: validated.company_name,
                    address: validated.address || null,
                    phone: validated.phone || null,
                    website: validated.website || null,
                    category: validated.category || null,
                    rating: validated.rating ? parseFloat(validated.rating) : null,
                    reviewsCount: validated.reviews_count
                        ? parseInt(validated.reviews_count, 10)
                        : null,
                    placeId: validated.place_id || null,
                    status: 'PENDING',
                });
            } catch (err) {
                errors.push({ row: i + 1, error: 'Invalid row data', details: row });
            }
        }

        // Check for duplicates within file
        const seen = new Set<string>();
        const deduped = validCompanies.filter((company) => {
            const key = `${company.companyName.toLowerCase()}-${company.address?.toLowerCase() || ''}-${company.phone || ''}`;
            if (seen.has(key)) {
                return false;
            }
            seen.add(key);
            return true;
        });

        // Check for existing companies in database
        const existingCompanies = await prisma.company.findMany({
            where: {
                userId,
                companyName: { in: deduped.map((c) => c.companyName) },
            },
            select: { companyName: true, phone: true, address: true },
        });

        const existingSet = new Set(
            existingCompanies.map(
                (c) =>
                    `${c.companyName.toLowerCase()}-${c.address?.toLowerCase() || ''}-${c.phone || ''}`
            )
        );

        const newCompanies = deduped.filter((c) => {
            const key = `${c.companyName.toLowerCase()}-${c.address?.toLowerCase() || ''}-${c.phone || ''}`;
            return !existingSet.has(key);
        });

        // Insert new companies
        let created = 0;
        if (newCompanies.length > 0) {
            const result = await prisma.company.createMany({
                data: newCompanies,
                skipDuplicates: true,
            });
            created = result.count;
        }

        logger.info(
            {
                userId,
                totalRows: rows.length,
                valid: validCompanies.length,
                duplicatesRemoved: validCompanies.length - deduped.length,
                alreadyExists: deduped.length - newCompanies.length,
                created,
            },
            'CSV import completed'
        );

        res.json({
            success: true,
            stats: {
                totalRows: rows.length,
                validRows: validCompanies.length,
                duplicatesRemoved: validCompanies.length - deduped.length,
                alreadyExists: deduped.length - newCompanies.length,
                companiesCreated: created,
                errors: errors.length,
            },
            errors: errors.slice(0, 10), // Return first 10 errors
        });
    } catch (error) {
        logger.error({ error }, 'CSV upload failed');
        res.status(500).json({ error: 'Failed to process CSV file' });
    }
});

// GET /api/upload/template
router.get('/template', (req, res) => {
    const template = [
        'company_name,address,phone,website,category,rating,reviews_count,place_id',
        'Example Company Inc,"123 Main St, City, State 12345",+1-555-123-4567,https://example.com,Business Services,4.5,127,ChIJ...',
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="dcip_template.csv"');
    res.send(template);
});

export default router;
