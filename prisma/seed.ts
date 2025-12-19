/**
 * Database Seed Script
 * 
 * Creates default admin account and default AI prompts.
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const DEFAULT_ADMIN = {
    email: 'admin@dcip.local',
    password: 'Admin123!',
    name: 'System Admin',
};

const DEFAULT_PROMPTS = [
    {
        name: 'website_analysis',
        displayName: 'Website Analysis',
        description: 'Prompt used for analyzing company websites and extracting business information.',
        category: 'research',
        prompt: `Analyze this company website and extract the following information:
1. What products/services does this company offer?
2. What is their value proposition?
3. Who is their target audience?
4. What contact information is available?
5. What is their company size estimate?
6. Any notable technology or features on their website?

Provide a structured summary with confidence scores for each finding.`,
    },
    {
        name: 'business_opportunities',
        displayName: 'Business Opportunities Analysis',
        description: 'Prompt for identifying marketing and automation opportunities for a company.',
        category: 'research',
        prompt: `Based on the company data provided, identify business opportunities:

1. MARKETING GAPS:
- Website improvements needed
- Social media presence gaps
- Content marketing opportunities
- SEO/SEM opportunities

2. AUTOMATION OPPORTUNITIES:
- Manual processes that could be automated
- Customer service automation potential
- Lead generation automation
- Reporting/analytics automation

3. DIGITAL TRANSFORMATION:
- Technology upgrades needed
- Integration opportunities
- Mobile/app opportunities

Rate each opportunity by: Priority (High/Medium/Low), Effort (Easy/Medium/Hard), Impact (High/Medium/Low)`,
    },
    {
        name: 'executive_summary',
        displayName: 'Executive Summary Generator',
        description: 'Prompt for generating executive summary for company reports.',
        category: 'report',
        prompt: `Create an executive summary for this company intelligence report. Include:

1. COMPANY OVERVIEW (2-3 sentences)
- What they do
- Their market position

2. KEY FINDINGS (bullet points)
- Most important discoveries from research

3. DIGITAL MATURITY ASSESSMENT
- Overall score and brief explanation

4. TOP RECOMMENDATIONS (3-5 items)
- Most actionable opportunities

5. RISK FACTORS
- Any concerns or red flags

Keep the summary concise but comprehensive. Use professional business language.`,
    },
    {
        name: 'competitor_analysis',
        displayName: 'Competitor Analysis',
        description: 'Prompt for analyzing and comparing competitors.',
        category: 'research',
        prompt: `Analyze the competitive landscape for this company:

1. Direct competitors identified
2. Market positioning comparison
3. Digital presence comparison (website quality, social media)
4. Pricing/service comparison if available
5. Competitive advantages and disadvantages
6. Market share estimates if available

Create a competitive matrix and identify opportunities where the company can differentiate.`,
    },
    {
        name: 'owner_investigation',
        displayName: 'Owner/Leadership Investigation',
        description: 'Prompt for researching company ownership and leadership.',
        category: 'research',
        prompt: `Research the ownership and leadership of this company:

1. Identify the owner(s) or key executives
2. Find their professional background
3. Discover any other businesses they own or are associated with
4. Find their LinkedIn or professional profiles
5. Note any public records or business filings

Be thorough but respect privacy. Only use publicly available information.`,
    },
];

async function seed() {
    console.log('🌱 Starting database seed...\n');

    // Create default admin
    console.log('Creating default admin account...');
    const existingAdmin = await prisma.user.findUnique({
        where: { email: DEFAULT_ADMIN.email },
    });

    if (existingAdmin) {
        console.log('  Admin account already exists, skipping.');
    } else {
        const hashedPassword = await bcrypt.hash(DEFAULT_ADMIN.password, 12);
        await prisma.user.create({
            data: {
                email: DEFAULT_ADMIN.email,
                password: hashedPassword,
                name: DEFAULT_ADMIN.name,
                role: 'ADMIN',
                accountStatus: 'APPROVED',
            },
        });
        console.log(`  ✅ Admin created: ${DEFAULT_ADMIN.email}`);
        console.log(`  ⚠️  Default password: ${DEFAULT_ADMIN.password}`);
        console.log('  (Please change this after first login!)\n');
    }

    // Create default prompts
    console.log('Creating default AI prompts...');
    for (const promptData of DEFAULT_PROMPTS) {
        const existing = await prisma.promptConfig.findUnique({
            where: { name: promptData.name },
        });

        if (existing) {
            console.log(`  Prompt "${promptData.name}" already exists, skipping.`);
        } else {
            await prisma.promptConfig.create({ data: promptData });
            console.log(`  ✅ Created prompt: ${promptData.displayName}`);
        }
    }

    console.log('\n✅ Seed completed successfully!');
    console.log('\n📋 Default Admin Credentials:');
    console.log(`   Email: ${DEFAULT_ADMIN.email}`);
    console.log(`   Password: ${DEFAULT_ADMIN.password}`);
}

seed()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
