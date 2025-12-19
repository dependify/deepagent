Deep Company Intelligence Platform (DCIP)
Strategic Planning Document
Version: 1.0.0
Type: No-Code Implementation Plan
Framework: 4-Layer Antifragile Architecture
Purpose: Comprehensive Company Research & Marketing Intelligence

Executive Summary
This document outlines a complete plan for building a Deep Company Intelligence Platform that transforms raw Google Maps scraped company data into comprehensive marketing intelligence reports. The platform follows the proven 4-Layer Antifragile Architecture to ensure reliable, self-improving research operations.

text

┌─────────────────────────────────────────────────────────────────────┐
│                    DEEP COMPANY INTELLIGENCE PLATFORM               │
├─────────────────────────────────────────────────────────────────────┤
│  INPUT                     PROCESS                      OUTPUT      │
│  ┌─────────┐    ┌──────────────────────────┐    ┌──────────────┐  │
│  │ Google  │───▶│  4-Layer Research Engine │───▶│ Intelligence │  │
│  │  Maps   │    │  ┌────────────────────┐  │    │   Reports    │  │
│  │  CSV    │    │  │ Layer 1: Standards │  │    │  • Markdown  │  │
│  └─────────┘    │  │ Layer 2: Planning  │  │    │  • PDF       │  │
│                 │  │ Layer 3: Execution │  │    └──────────────┘  │
│                 │  │ Layer 4: Learning  │  │                       │
│                 │  └────────────────────┘  │                       │
│                 └──────────────────────────┘                       │
└─────────────────────────────────────────────────────────────────────┘
Part 1: Input Specification
1.1 Google Maps CSV Structure (Expected Input)
Field Name	Description	Example
company_name	Business name	"Apex Medical Clinic"
address	Physical location	"123 Main St, Austin TX"
phone	Primary contact	"+1-512-555-0100"
website	Company URL	"www.apexmedical.com"
category	Business type	"Medical Clinic"
rating	Google rating	"4.5"
reviews_count	Number of reviews	"127"
place_id	Google Place ID	"ChIJ..."
1.2 Pre-Processing Requirements
text

┌────────────────────────────────────────────────────────────────┐
│                    CSV INGESTION PIPELINE                       │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  RAW CSV ──▶ VALIDATION ──▶ DEDUPLICATION ──▶ ENRICHMENT QUEUE │
│                  │                │                    │        │
│                  ▼                ▼                    ▼        │
│            • Format Check    • Name Match         • Priority   │
│            • Required Fields • Address Match      • Batching   │
│            • URL Validation  • Phone Match        • Rate Limit │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
Part 2: Layer 1 — Governance & Standards
2.1 Research Standards Framework
THE RESEARCH CONSTITUTION
text

┌─────────────────────────────────────────────────────────────────────┐
│                    THE RESEARCH STANDARD                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  PRINCIPLE 1: ACCURACY FIRST                                        │
│  • All data must be verified from minimum 2 independent sources     │
│  • Confidence scores required for every data point                  │
│  • "Unknown" is better than "Wrong"                                 │
│                                                                      │
│  PRINCIPLE 2: RECENCY MATTERS                                       │
│  • Data older than 90 days must be flagged                         │
│  • News must be from past 12 months                                │
│  • Social media activity within 30 days = "Active"                 │
│                                                                      │
│  PRINCIPLE 3: ETHICAL BOUNDARIES                                    │
│  • NO scraping of private/personal data                            │
│  • Only publicly available business information                     │
│  • Respect robots.txt and rate limits                              │
│                                                                      │
│  PRINCIPLE 4: COMPLETENESS GATES                                    │
│  • Minimum 60% data coverage to generate report                    │
│  • Critical fields must be 100% complete                           │
│  • Flag all gaps explicitly                                        │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
2.2 Research Categories & Required Data Points
Category A: Company Core Intelligence
Data Point	Priority	Sources	Verification
Legal Business Name	CRITICAL	Secretary of State, LinkedIn	2-source match
DBA / Trade Names	HIGH	State filings, Website	1-source min
Year Founded	MEDIUM	Website, LinkedIn, Crunchbase	1-source min
Business Type	CRITICAL	Website, LinkedIn	1-source min
Employee Count Range	HIGH	LinkedIn, Website	Range acceptable
Revenue Range	MEDIUM	Dun & Bradstreet, ZoomInfo	Estimate OK
Physical Locations	HIGH	Google Maps, Website	GPS verified
Category B: Digital Presence Intelligence
Data Point	Priority	Sources	Verification
Website URL	CRITICAL	Google Maps input, DNS	Live check
Website Technology Stack	HIGH	BuiltWith, Wappalyzer	Auto-detect
Website Traffic Estimate	MEDIUM	SimilarWeb, SEMrush	Range OK
SEO Health Score	MEDIUM	Google PageSpeed, Lighthouse	Score 0-100
SSL Certificate Status	HIGH	Direct check	Valid/Invalid
Mobile Responsiveness	HIGH	Google Mobile Test	Pass/Fail
Website Age	MEDIUM	WHOIS, Archive.org	Date range
Category C: Social Media Intelligence
Platform	Data Points to Capture	Activity Metrics
LinkedIn Company	URL, Followers, Posts	Post frequency, Engagement
Facebook Business	URL, Likes, Reviews	Post frequency, Response rate
Instagram Business	Handle, Followers	Post frequency, Engagement
Twitter/X	Handle, Followers	Tweet frequency, Engagement
YouTube	Channel, Subscribers	Video frequency, Views
TikTok	Handle, Followers	Post frequency, Engagement
Pinterest	Profile, Followers	Pin frequency
Google Business	Rating, Reviews	Review response rate
Category D: Owner/Leadership Intelligence
Data Point	Priority	Sources	Privacy Level
Owner/CEO Name	CRITICAL	LinkedIn, Website, Filings	Public Only
Owner LinkedIn Profile	HIGH	LinkedIn search	Public Only
Owner Other Socials	MEDIUM	Cross-platform search	Public Only
Professional Background	MEDIUM	LinkedIn, News	Public Only
Industry Speaking/Writing	LOW	Google search	Public Only
Other Business Interests	MEDIUM	OpenCorporates, LinkedIn	Public Only
Category E: Market Intelligence
Data Point	Priority	Sources	Method
Primary Competitors	HIGH	Google search, SEMrush	Same geo + category
Market Position	MEDIUM	Review analysis, Traffic	Comparative
Unique Selling Points	HIGH	Website analysis, Reviews	Content extraction
Pricing Model	MEDIUM	Website, Mystery shop	Public info only
Target Customer	HIGH	Website, Social analysis	Inference
Industry Trends	MEDIUM	News, Industry reports	Aggregation
Category F: News & Reputation Intelligence
Data Point	Priority	Sources	Timeframe
Recent News Mentions	HIGH	Google News, Bing News	12 months
Press Releases	MEDIUM	PRNewswire, BusinessWire	24 months
Awards/Recognition	MEDIUM	Industry sites, News	36 months
Negative Coverage	CRITICAL	News, Review sites	24 months
Legal Issues	HIGH	Court records, News	36 months
Industry Publications	LOW	Trade publications	12 months
Category G: Business Process Intelligence (For AI Marketing)
Intelligence Area	Questions to Answer	Data Sources
Customer Acquisition	How do they get leads?	Website, Ads, Social
Sales Process	Online booking? Phone? In-person?	Website analysis
Customer Service	Chat? Email? Phone hours?	Website, Reviews
Content Strategy	Blog? Videos? Social content?	Website, Social audit
Technology Stack	CRM? Marketing tools?	BuiltWith, Job postings
Pain Points	What do customers complain about?	Review analysis
Growth Signals	Hiring? Expanding? New products?	LinkedIn, News
2.3 Compliance Rules
Research Ethics Ruleset
text

┌─────────────────────────────────────────────────────────────────────┐
│                    COMPLIANCE BOUNDARIES                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ✓ ALLOWED                          ✗ FORBIDDEN                    │
│  ─────────────────────              ─────────────────────           │
│  • Public company websites          • Private email scraping        │
│  • Public social profiles           • Password-protected content    │
│  • Published news articles          • Personal home addresses       │
│  • Government business filings      • Private phone numbers         │
│  • Public review platforms          • Family member information     │
│  • Professional LinkedIn profiles   • Financial account details     │
│  • Business contact information     • Medical/Legal records         │
│  • Published court records          • Private messages              │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
Rate Limiting Standards
Source Type	Requests/Minute	Delay Between	Daily Limit
Websites	10	6 seconds	500
Social APIs	Per API rules	Per API rules	Per API rules
Search Engines	5	12 seconds	200
Government DBs	3	20 seconds	100
Part 3: Layer 2 — Orchestration & Planning
3.1 Research Agent Architecture
text

┌─────────────────────────────────────────────────────────────────────┐
│                    MASTER RESEARCH ORCHESTRATOR                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│                         ┌─────────────────┐                         │
│                         │  QUEUE MANAGER  │                         │
│                         │  (CSV Import)   │                         │
│                         └────────┬────────┘                         │
│                                  │                                   │
│                                  ▼                                   │
│                    ┌─────────────────────────┐                      │
│                    │   RESEARCH PLANNER      │                      │
│                    │   (Priority Router)     │                      │
│                    └────────────┬────────────┘                      │
│                                 │                                    │
│          ┌──────────────────────┼──────────────────────┐            │
│          ▼                      ▼                      ▼            │
│  ┌───────────────┐    ┌───────────────┐    ┌───────────────┐       │
│  │ WEBSITE       │    │ SOCIAL MEDIA  │    │ PUBLIC        │       │
│  │ ANALYST       │    │ HUNTER        │    │ RECORDS       │       │
│  └───────┬───────┘    └───────┬───────┘    └───────┬───────┘       │
│          │                    │                    │                │
│          ▼                    ▼                    ▼                │
│  ┌───────────────┐    ┌───────────────┐    ┌───────────────┐       │
│  │ OWNER         │    │ COMPETITOR    │    │ NEWS          │       │
│  │ INVESTIGATOR  │    │ MAPPER        │    │ AGGREGATOR    │       │
│  └───────┬───────┘    └───────┬───────┘    └───────┬───────┘       │
│          │                    │                    │                │
│          └──────────────────────┼──────────────────────┘            │
│                                 ▼                                    │
│                    ┌─────────────────────────┐                      │
│                    │   INTELLIGENCE MERGER   │                      │
│                    │   (Data Fusion)         │                      │
│                    └────────────┬────────────┘                      │
│                                 │                                    │
│                                 ▼                                    │
│                    ┌─────────────────────────┐                      │
│                    │   REPORT GENERATOR      │                      │
│                    │   (Markdown + PDF)      │                      │
│                    └─────────────────────────┘                      │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
3.2 Sub-Agent Specifications
Agent 1: Website Analyst
text

┌─────────────────────────────────────────────────────────────────────┐
│                       WEBSITE ANALYST AGENT                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  MISSION: Extract maximum intelligence from company website         │
│                                                                      │
│  INPUT:                                                             │
│  • Website URL from CSV                                             │
│                                                                      │
│  PROCESS:                                                           │
│  1. Verify URL is live (handle redirects)                          │
│  2. Crawl key pages: Home, About, Services, Contact, Team          │
│  3. Extract: Products/Services list, Team members, Contact info    │
│  4. Analyze: Technology stack, SEO health, Mobile-friendliness     │
│  5. Screenshot: Homepage, key pages                                 │
│  6. Archive: Full content for reference                            │
│                                                                      │
│  OUTPUT:                                                            │
│  • Structured data: Company description, services, team            │
│  • Technical audit: Stack, speed, SEO score                        │
│  • Content inventory: Blog posts, resources, media                 │
│  • Contact details: Email, phone, forms, chat                      │
│                                                                      │
│  FALLBACK (if website down/missing):                               │
│  • Check Archive.org Wayback Machine                               │
│  • Search for cached versions                                       │
│  • Flag as "No Website" and proceed with other sources             │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
Agent 2: Social Media Hunter
text

┌─────────────────────────────────────────────────────────────────────┐
│                     SOCIAL MEDIA HUNTER AGENT                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  MISSION: Find and analyze all social media presence               │
│                                                                      │
│  SEARCH STRATEGY:                                                   │
│                                                                      │
│  PHASE 1 - Website Extraction                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ • Scan website footer for social links                       │   │
│  │ • Check header/navigation for social icons                   │   │
│  │ • Parse contact page for social handles                      │   │
│  │ • Look for embedded social feeds                             │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  PHASE 2 - Platform Direct Search                                   │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ For each platform (LinkedIn, Facebook, Instagram, etc.):     │   │
│  │ • Search by exact company name                               │   │
│  │ • Search by phone number (where applicable)                  │   │
│  │ • Search by location + category                              │   │
│  │ • Verify match by cross-referencing address/phone            │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  PHASE 3 - Activity Analysis                                        │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ For each confirmed profile:                                   │   │
│  │ • Last post date                                             │   │
│  │ • Posting frequency (posts/week)                             │   │
│  │ • Follower count                                             │   │
│  │ • Engagement rate (likes+comments/followers)                 │   │
│  │ • Content type breakdown                                     │   │
│  │ • Review/rating if applicable                                │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  OUTPUT STRUCTURE:                                                  │
│  {                                                                  │
│    platform: "LinkedIn",                                            │
│    url: "linkedin.com/company/example",                             │
│    verified: true,                                                  │
│    followers: 1250,                                                 │
│    last_post: "2024-01-15",                                         │
│    activity_level: "Active",                                        │
│    engagement_rate: "3.2%"                                          │
│  }                                                                  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
Agent 3: Owner/Leadership Investigator
text

┌─────────────────────────────────────────────────────────────────────┐
│                   OWNER INVESTIGATOR AGENT                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  MISSION: Identify business owners and their public profiles        │
│                                                                      │
│  DISCOVERY WORKFLOW:                                                │
│                                                                      │
│  Step 1: Business Filing Search                                     │
│  ├── Secretary of State (by state)                                 │
│  ├── OpenCorporates database                                       │
│  └── Extract: Registered Agent, Officers, Directors                │
│                                                                      │
│  Step 2: Website Team Page Analysis                                 │
│  ├── Look for "About", "Team", "Leadership" pages                  │
│  ├── Extract names, titles, bios                                   │
│  └── Note: Photos for LinkedIn matching                            │
│                                                                      │
│  Step 3: LinkedIn Company Search                                    │
│  ├── Find company page                                             │
│  ├── View "People" section                                         │
│  └── Identify: Owner, CEO, Founder roles                           │
│                                                                      │
│  Step 4: Owner Profile Deep Dive                                    │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  FOR EACH IDENTIFIED OWNER/LEADER:                           │   │
│  │                                                               │   │
│  │  LinkedIn Profile:                                            │   │
│  │  • Profile URL                                                │   │
│  │  • Current title                                              │   │
│  │  • Career history (relevant)                                  │   │
│  │  • Education                                                  │   │
│  │  • Connection count range                                     │   │
│  │  • Content activity                                           │   │
│  │                                                               │   │
│  │  Other Platforms (PUBLIC ONLY):                               │   │
│  │  • Twitter/X handle                                           │   │
│  │  • Facebook business profile                                  │   │
│  │  • Industry publication profiles                              │   │
│  │  • Speaking/podcast appearances                               │   │
│  │                                                               │   │
│  │  Other Business Interests:                                    │   │
│  │  • Other companies owned                                      │   │
│  │  • Board positions                                            │   │
│  │  • Advisory roles                                             │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  PRIVACY GATE: Skip if only personal social accounts found         │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
Agent 4: Competitor Mapper
text

┌─────────────────────────────────────────────────────────────────────┐
│                     COMPETITOR MAPPER AGENT                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  MISSION: Identify and analyze direct competitors                   │
│                                                                      │
│  IDENTIFICATION METHODS:                                            │
│                                                                      │
│  Method 1: Geographic + Category Search                             │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ • Same Google Maps category                                   │   │
│  │ • Within X miles radius (configurable by business type)      │   │
│  │ • Similar rating/review count (market tier matching)         │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  Method 2: SEO Competitor Analysis                                  │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ • Who ranks for same keywords?                                │   │
│  │ • Similar backlink profiles                                   │   │
│  │ • Overlapping audience (SimilarWeb)                          │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  Method 3: Industry Database Search                                 │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ • Industry association directories                            │   │
│  │ • Yelp/vertical review site competitors                      │   │
│  │ • Google "related:" searches                                 │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  COMPETITOR PROFILE (Top 5):                                        │
│  • Company name & website                                           │
│  • Size comparison (employees, locations)                           │
│  • Digital presence strength score                                  │
│  • Key differentiators                                              │
│  • Pricing tier (if available)                                      │
│  • Marketing channel focus                                          │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
Agent 5: News & Reputation Aggregator
text

┌─────────────────────────────────────────────────────────────────────┐
│                   NEWS AGGREGATOR AGENT                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  MISSION: Gather news, press, and reputation intelligence           │
│                                                                      │
│  NEWS SOURCES:                                                      │
│  ┌────────────────────┬────────────────────────────────────────┐   │
│  │ Source             │ Search Query Format                     │   │
│  ├────────────────────┼────────────────────────────────────────┤   │
│  │ Google News        │ "Company Name" + City                   │   │
│  │ Bing News          │ "Company Name" OR "Owner Name"          │   │
│  │ Industry Pubs      │ "Company Name" site:industrypub.com     │   │
│  │ Local News         │ "Company Name" + State                  │   │
│  │ PR Wires           │ Company Name press release              │   │
│  └────────────────────┴────────────────────────────────────────┘   │
│                                                                      │
│  REPUTATION SOURCES:                                                │
│  ┌────────────────────┬────────────────────────────────────────┐   │
│  │ Platform           │ Data Extracted                          │   │
│  ├────────────────────┼────────────────────────────────────────┤   │
│  │ Google Reviews     │ Rating, count, recent sentiment         │   │
│  │ Yelp               │ Rating, count, response rate            │   │
│  │ BBB                │ Rating, complaints, accreditation       │   │
│  │ Trustpilot         │ Rating, review count                    │   │
│  │ Industry-specific  │ Varies by vertical                      │   │
│  │ Glassdoor          │ Employer rating (hiring signal)         │   │
│  └────────────────────┴────────────────────────────────────────┘   │
│                                                                      │
│  OUTPUT STRUCTURE:                                                  │
│  {                                                                  │
│    news_mentions: 12,                                               │
│    positive_coverage: 8,                                            │
│    negative_coverage: 1,                                            │
│    neutral_coverage: 3,                                             │
│    notable_stories: [...],                                          │
│    reputation_score: 4.2,                                           │
│    review_sentiment: "Mostly Positive"                              │
│  }                                                                  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
Agent 6: Business Process Analyzer (Marketing Opportunity)
text

┌─────────────────────────────────────────────────────────────────────┐
│               BUSINESS PROCESS ANALYZER AGENT                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  MISSION: Identify AI automation & marketing opportunities          │
│                                                                      │
│  ANALYSIS FRAMEWORK:                                                │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ CURRENT STATE ASSESSMENT                                     │   │
│  ├─────────────────────────────────────────────────────────────┤   │
│  │                                                               │   │
│  │ Website Maturity:                                             │   │
│  │ □ No website ──▶ OPPORTUNITY: Website Development            │   │
│  │ □ Basic site ──▶ OPPORTUNITY: Redesign + SEO                │   │
│  │ □ Outdated (3+ years) ──▶ OPPORTUNITY: Modernization        │   │
│  │ □ Modern but no blog ──▶ OPPORTUNITY: Content Strategy      │   │
│  │ □ No mobile optimization ──▶ OPPORTUNITY: Mobile-First      │   │
│  │                                                               │   │
│  │ Lead Generation:                                              │   │
│  │ □ No forms ──▶ OPPORTUNITY: Lead Capture Setup              │   │
│  │ □ No chat ──▶ OPPORTUNITY: AI Chatbot                       │   │
│  │ □ No booking ──▶ OPPORTUNITY: Scheduling Automation         │   │
│  │ □ No email marketing ──▶ OPPORTUNITY: Email Sequences       │   │
│  │                                                               │   │
│  │ Social Media:                                                 │   │
│  │ □ No presence ──▶ OPPORTUNITY: Social Setup                 │   │
│  │ □ Inactive (30+ days) ──▶ OPPORTUNITY: Content Management   │   │
│  │ □ Low engagement ──▶ OPPORTUNITY: Strategy Optimization     │   │
│  │ □ No paid ads ──▶ OPPORTUNITY: Advertising Management       │   │
│  │                                                               │   │
│  │ Customer Service:                                             │   │
│  │ □ Phone only ──▶ OPPORTUNITY: Multi-channel + AI            │   │
│  │ □ Slow response ──▶ OPPORTUNITY: Automation                 │   │
│  │ □ No FAQ ──▶ OPPORTUNITY: Knowledge Base                    │   │
│  │                                                               │   │
│  │ Reviews:                                                      │   │
│  │ □ Few reviews ──▶ OPPORTUNITY: Review Generation            │   │
│  │ □ No responses ──▶ OPPORTUNITY: Reputation Management       │   │
│  │ □ Negative trends ──▶ OPPORTUNITY: Service Improvement      │   │
│  │                                                               │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  OUTPUT: Prioritized list of service opportunities with:            │
│  • Current gap identified                                           │
│  • Recommended solution                                             │
│  • Estimated impact (High/Medium/Low)                               │
│  • Suggested approach messaging                                     │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
3.3 Research Flow Orchestration
text

┌─────────────────────────────────────────────────────────────────────┐
│                    COMPLETE RESEARCH WORKFLOW                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  STAGE 1: INITIALIZATION (Per Company)                              │
│  ───────────────────────────────────────                            │
│  ┌─────────┐    ┌──────────────┐    ┌─────────────┐                │
│  │ Load    │───▶│ Validate     │───▶│ Create      │                │
│  │ CSV Row │    │ Basic Data   │    │ Research    │                │
│  │         │    │ (URL, Phone) │    │ Profile     │                │
│  └─────────┘    └──────────────┘    └─────────────┘                │
│                                                                      │
│  STAGE 2: PARALLEL RESEARCH                                         │
│  ───────────────────────────────                                    │
│       ┌────────────────┬────────────────┬────────────────┐         │
│       ▼                ▼                ▼                ▼         │
│  ┌─────────┐    ┌───────────┐    ┌──────────┐    ┌──────────┐     │
│  │Website  │    │Social     │    │Owner     │    │Public    │     │
│  │Analysis │    │Media      │    │Lookup    │    │Records   │     │
│  │         │    │Hunt       │    │          │    │Search    │     │
│  └────┬────┘    └─────┬─────┘    └────┬─────┘    └────┬─────┘     │
│       │               │               │               │            │
│       └───────────────┴───────────────┴───────────────┘            │
│                               │                                     │
│                               ▼                                     │
│                    ┌──────────────────┐                            │
│                    │ MERGE FINDINGS   │                            │
│                    │ (Cross-validate) │                            │
│                    └────────┬─────────┘                            │
│                             │                                       │
│  STAGE 3: SECONDARY RESEARCH                                        │
│  ────────────────────────────                                       │
│                             ▼                                       │
│       ┌────────────────┬────────────────┬────────────────┐         │
│       ▼                ▼                ▼                          │
│  ┌─────────┐    ┌───────────┐    ┌──────────────┐                  │
│  │Competitor│   │News &     │    │Business      │                  │
│  │Mapping   │   │Reputation │    │Process       │                  │
│  │          │   │           │    │Analysis      │                  │
│  └────┬────┘    └─────┬─────┘    └──────┬───────┘                  │
│       │               │                 │                          │
│       └───────────────┴─────────────────┘                          │
│                               │                                     │
│  STAGE 4: SYNTHESIS                                                 │
│  ───────────────────                                               │
│                               ▼                                     │
│                    ┌──────────────────┐                            │
│                    │ QUALITY CHECK    │                            │
│                    │ (Completeness    │                            │
│                    │  Gate: 60%+)     │                            │
│                    └────────┬─────────┘                            │
│                             │                                       │
│                    ┌────────┴────────┐                             │
│                    ▼                 ▼                             │
│              ┌─────────┐      ┌─────────────┐                      │
│              │ PASS    │      │ FAIL        │                      │
│              │         │      │ (Mark gaps, │                      │
│              │         │      │ continue)   │                      │
│              └────┬────┘      └──────┬──────┘                      │
│                   │                  │                              │
│                   └──────────────────┘                              │
│                             │                                       │
│  STAGE 5: OUTPUT GENERATION                                         │
│  ───────────────────────────                                       │
│                             ▼                                       │
│                    ┌──────────────────┐                            │
│                    │ GENERATE REPORT  │                            │
│                    │ • Markdown       │                            │
│                    │ • PDF            │                            │
│                    │ • Store to DB    │                            │
│                    └──────────────────┘                            │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
Part 4: Layer 3 — Execution Tools
4.1 n8n Workflow Specifications
Workflow 1: Website Analysis Pipeline
text

┌─────────────────────────────────────────────────────────────────────┐
│                 n8n WORKFLOW: WEBSITE ANALYZER                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  TRIGGER: Webhook POST /analyze-website                             │
│  PAYLOAD: { company_name, website_url }                             │
│                                                                      │
│  ┌─────────────┐                                                    │
│  │  1. HTTP    │  Check if website is live                         │
│  │  Request    │  Handle: Redirects, 404, Timeout                  │
│  └──────┬──────┘                                                    │
│         │                                                           │
│         ▼                                                           │
│  ┌─────────────┐                                                    │
│  │  2. Switch  │  Route based on status                            │
│  │  Node       │  ├── 200 OK ──▶ Continue                          │
│  │             │  ├── 301/302 ──▶ Follow redirect                  │
│  │             │  └── Error ──▶ Try Archive.org                    │
│  └──────┬──────┘                                                    │
│         │                                                           │
│         ▼                                                           │
│  ┌─────────────┐                                                    │
│  │  3. Web     │  Scrape key pages:                                │
│  │  Scraper    │  • Homepage content                                │
│  │             │  • About page                                      │
│  │             │  • Services/Products page                          │
│  │             │  • Contact page                                    │
│  │             │  • Team page                                       │
│  └──────┬──────┘                                                    │
│         │                                                           │
│         ▼                                                           │
│  ┌─────────────┐                                                    │
│  │  4. HTML    │  Parse and extract:                               │
│  │  Extract    │  • Page titles                                    │
│  │             │  • Meta descriptions                              │
│  │             │  • Headings (H1, H2)                              │
│  │             │  • Links (social, contact)                        │
│  │             │  • Images (for team detection)                    │
│  │             │  • Structured data (Schema.org)                   │
│  └──────┬──────┘                                                    │
│         │                                                           │
│         ▼                                                           │
│  ┌─────────────┐                                                    │
│  │  5. AI      │  Analyze content for:                             │
│  │  Analysis   │  • Business description                           │
│  │  (LLM)      │  • Services list                                  │
│  │             │  • Target audience                                │
│  │             │  • Key differentiators                            │
│  │             │  • Contact information extraction                 │
│  └──────┬──────┘                                                    │
│         │                                                           │
│         ▼                                                           │
│  ┌─────────────┐                                                    │
│  │  6. Tech    │  External API calls:                              │
│  │  Stack      │  • BuiltWith or Wappalyzer API                    │
│  │  Detection  │  • PageSpeed Insights API                         │
│  └──────┬──────┘                                                    │
│         │                                                           │
│         ▼                                                           │
│  ┌─────────────┐                                                    │
│  │  7. Output  │  Return structured JSON:                          │
│  │  Format     │  • website_status                                 │
│  │             │  • business_info                                  │
│  │             │  • contact_info                                   │
│  │             │  • tech_stack                                     │
│  │             │  • seo_score                                      │
│  │             │  • social_links_found                             │
│  └─────────────┘                                                    │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
Workflow 2: Social Media Discovery Pipeline
text

┌─────────────────────────────────────────────────────────────────────┐
│                n8n WORKFLOW: SOCIAL MEDIA HUNTER                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  TRIGGER: Webhook POST /find-social                                 │
│  PAYLOAD: { company_name, website_url, phone, location }            │
│                                                                      │
│  ┌─────────────┐                                                    │
│  │  1. Init    │  Create search queries array                      │
│  │             │  ["exact name", "name + city", phone]             │
│  └──────┬──────┘                                                    │
│         │                                                           │
│         ▼                                                           │
│  ┌──────────────────────────────────────────────────────────┐      │
│  │  2. Split into parallel branches (one per platform)       │      │
│  └──────────────────────────────────────────────────────────┘      │
│         │                                                           │
│    ┌────┼────┬────────┬────────┬────────┬────────┐                 │
│    ▼    ▼    ▼        ▼        ▼        ▼        ▼                 │
│  ┌────┐┌────┐┌────────┐┌───────┐┌───────┐┌───────┐┌───────┐       │
│  │ LI ││ FB ││ IG     ││ TW    ││ YT    ││ TT    ││ Other │       │
│  └──┬─┘└──┬─┘└───┬────┘└───┬───┘└───┬───┘└───┬───┘└───┬───┘       │
│     │     │      │         │        │        │        │            │
│  FOR EACH PLATFORM:                                                 │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  a. Search platform (API or scrape)                          │   │
│  │  b. Filter results by relevance score                        │   │
│  │  c. Verify match using:                                      │   │
│  │     - Name similarity (>80%)                                 │   │
│  │     - Location match                                         │   │
│  │     - Website backlink                                       │   │
│  │     - Phone match                                            │   │
│  │  d. If match confidence >70%, collect:                       │   │
│  │     - Profile URL                                            │   │
│  │     - Follower count                                         │   │
│  │     - Last activity date                                     │   │
│  │     - Post frequency                                         │   │
│  │     - Engagement metrics                                     │   │
│  └─────────────────────────────────────────────────────────────┘   │
│     │     │      │         │        │        │        │            │
│     └─────┴──────┴─────────┴────────┴────────┴────────┘            │
│                               │                                     │
│                               ▼                                     │
│  ┌─────────────┐                                                    │
│  │  3. Merge   │  Combine all platform results                     │
│  │  Results    │  Calculate overall social presence score          │
│  └──────┬──────┘                                                    │
│         │                                                           │
│         ▼                                                           │
│  ┌─────────────┐                                                    │
│  │  4. Output  │  Return:                                          │
│  │             │  • platforms_found: []                            │
│  │             │  • total_followers: number                        │
│  │             │  • most_active_platform: string                   │
│  │             │  • social_presence_score: 0-100                   │
│  └─────────────┘                                                    │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
Workflow 3: Owner/Leadership Research Pipeline
text

┌─────────────────────────────────────────────────────────────────────┐
│               n8n WORKFLOW: OWNER INVESTIGATOR                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  TRIGGER: Webhook POST /find-owner                                  │
│  PAYLOAD: { company_name, state, website_team_page_content }        │
│                                                                      │
│  ┌─────────────┐                                                    │
│  │  1. State   │  Query Secretary of State API/scraper             │
│  │  Filings    │  by company name + state                          │
│  │             │  Extract: Registered agent, officers              │
│  └──────┬──────┘                                                    │
│         │                                                           │
│         ▼                                                           │
│  ┌─────────────┐                                                    │
│  │  2. Parse   │  AI analysis of team page content                 │
│  │  Team Page  │  Extract: Names, titles, descriptions             │
│  └──────┬──────┘                                                    │
│         │                                                           │
│         ▼                                                           │
│  ┌─────────────┐                                                    │
│  │  3. Cross   │  Match names from filings with team page          │
│  │  Reference  │  Confidence score for each match                  │
│  └──────┬──────┘                                                    │
│         │                                                           │
│         ▼                                                           │
│  FOR EACH HIGH-CONFIDENCE OWNER:                                    │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  ┌─────────────┐                                             │   │
│  │  │  4. LinkedIn │  Search: "Name" + "Company Name"           │   │
│  │  │  Search      │  Verify: Title matches, location matches   │   │
│  │  │             │  Extract: Profile URL, headline,            │   │
│  │  │             │           experience, education             │   │
│  │  └──────┬──────┘                                             │   │
│  │         │                                                     │   │
│  │         ▼                                                     │   │
│  │  ┌─────────────┐                                             │   │
│  │  │  5. Other   │  Search Twitter, professional sites         │   │
│  │  │  Platforms  │  Only BUSINESS/PROFESSIONAL accounts        │   │
│  │  │  (Optional) │  Skip if only personal found                │   │
│  │  └──────┬──────┘                                             │   │
│  │         │                                                     │   │
│  │         ▼                                                     │   │
│  │  ┌─────────────┐                                             │   │
│  │  │  6. Other   │  Search OpenCorporates, LinkedIn            │   │
│  │  │  Businesses │  Find other companies associated            │   │
│  │  │             │  with this person                           │   │
│  │  └─────────────┘                                             │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                               │                                     │
│                               ▼                                     │
│  ┌─────────────┐                                                    │
│  │  7. Output  │  Return array of owner profiles:                  │
│  │             │  • name                                           │
│  │             │  • title                                          │
│  │             │  • linkedin_url                                   │
│  │             │  • other_socials: []                              │
│  │             │  • other_businesses: []                           │
│  │             │  • confidence_score                               │
│  └─────────────┘                                                    │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
Workflow 4: News & Reputation Pipeline
text

┌─────────────────────────────────────────────────────────────────────┐
│              n8n WORKFLOW: NEWS & REPUTATION                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  TRIGGER: Webhook POST /research-reputation                         │
│  PAYLOAD: { company_name, owner_names, location }                   │
│                                                                      │
│  PARALLEL BRANCH 1: News Search                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  1a. Google News API                                         │   │
│  │      Query: "Company Name" + location                        │   │
│  │      Timeframe: 12 months                                    │   │
│  │                                                               │   │
│  │  1b. Bing News API                                           │   │
│  │      Query: "Company Name" OR "Owner Name"                   │   │
│  │      Timeframe: 12 months                                    │   │
│  │                                                               │   │
│  │  1c. Industry Publication Search                             │   │
│  │      Custom search for industry-specific sites               │   │
│  │                                                               │   │
│  │  → Merge & Deduplicate articles                              │   │
│  │  → AI Sentiment Analysis (Positive/Negative/Neutral)         │   │
│  │  → Summarize key stories                                     │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  PARALLEL BRANCH 2: Reviews Aggregation                             │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  2a. Google Reviews                                          │   │
│  │      • Overall rating                                        │   │
│  │      • Total review count                                    │   │
│  │      • Recent reviews (last 10)                              │   │
│  │      • Owner response rate                                   │   │
│  │                                                               │   │
│  │  2b. Yelp (if applicable)                                    │   │
│  │      • Rating, count, highlights                             │   │
│  │                                                               │   │
│  │  2c. Industry-Specific (BBB, Trustpilot, G2, etc.)          │   │
│  │      • Based on business category                            │   │
│  │                                                               │   │
│  │  → Calculate composite reputation score                      │   │
│  │  → AI analysis of common themes in reviews                   │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  PARALLEL BRANCH 3: Legal/Complaints Check                          │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  3a. BBB Complaints                                          │   │
│  │  3b. State Attorney General (if available)                   │   │
│  │  3c. PACER/Court Records (public)                           │   │
│  │  → Flag any significant issues                               │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌─────────────┐                                                    │
│  │  MERGE ALL  │  Combine into reputation intelligence:           │
│  │             │  • news_summary                                   │
│  │             │  • review_summary                                 │
│  │             │  • reputation_score (0-100)                       │
│  │             │  • sentiment_breakdown                            │
│  │             │  • risk_flags: []                                 │
│  │             │  • notable_stories: []                            │
│  └─────────────┘                                                    │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
Workflow 5: Competitor Analysis Pipeline
text

┌─────────────────────────────────────────────────────────────────────┐
│              n8n WORKFLOW: COMPETITOR MAPPER                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  TRIGGER: Webhook POST /find-competitors                            │
│  PAYLOAD: { company_name, category, location, radius_miles }        │
│                                                                      │
│  ┌─────────────┐                                                    │
│  │  1. Google  │  Search Maps API:                                 │
│  │  Maps       │  • Same category                                  │
│  │  Search     │  • Within radius                                  │
│  │             │  • Exclude target company                         │
│  │             │  Get: Top 20 results                              │
│  └──────┬──────┘                                                    │
│         │                                                           │
│         ▼                                                           │
│  ┌─────────────┐                                                    │
│  │  2. Filter  │  Remove non-competitors:                          │
│  │  & Score    │  • Different service type                         │
│  │             │  • Too different in size                          │
│  │             │  Score by: Rating, reviews, proximity             │
│  │             │  Keep: Top 5 most relevant                        │
│  └──────┬──────┘                                                    │
│         │                                                           │
│         ▼                                                           │
│  FOR EACH COMPETITOR (Top 5):                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  3. Quick Website Scan                                       │   │
│  │     • Homepage screenshot                                    │   │
│  │     • Services list                                          │   │
│  │     • Technology stack                                       │   │
│  │                                                               │   │
│  │  4. Social Presence Check                                    │   │
│  │     • Which platforms active?                                │   │
│  │     • Follower counts                                        │   │
│  │     • Activity level                                         │   │
│  │                                                               │   │
│  │  5. Review Analysis                                          │   │
│  │     • Google rating                                          │   │
│  │     • Review count                                           │   │
│  │     • Key complaints (opportunities)                         │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                               │                                     │
│                               ▼                                     │
│  ┌─────────────┐                                                    │
│  │  6. Compare │  Build comparison matrix:                         │
│  │  & Rank     │  • Digital presence rank                          │
│  │             │  • Reputation rank                                │
│  │             │  • Size rank                                      │
│  │             │  Where does target company stand?                 │
│  └──────┬──────┘                                                    │
│         │                                                           │
│         ▼                                                           │
│  ┌─────────────┐                                                    │
│  │  7. Output  │  Return:                                          │
│  │             │  • competitors: [detailed profiles]               │
│  │             │  • target_market_position: string                 │
│  │             │  • competitive_advantages: []                     │
│  │             │  • competitive_threats: []                        │
│  └─────────────┘                                                    │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
4.2 Data Sources Inventory
Free & Open Sources
Source	Data Available	Access Method	Rate Limit
Google Maps API	Business info, reviews, location	API (with key)	28,500/month free
Google Search	Website discovery, news	Custom Search API	100/day free
Google PageSpeed	Website performance	API	25,000/day
LinkedIn	Company & people profiles	Scraping (careful)	Varies
OpenCorporates	Business registration	API	500/month free
WHOIS	Domain info	API	Unlimited (most)
Archive.org	Historical websites	API	Polite use
Builtwith	Technology stack	Limited free	5/day free
Hunter.io	Email discovery	API	25/month free
Clearbit	Company data	API	50/month free
Paid/Premium Sources (Optional Upgrades)
Source	Data Available	Pricing Tier
ZoomInfo	Contact data, company intel	Enterprise
Apollo.io	Email, phone, company data	$49+/month
Semrush	SEO, traffic, competitors	$119+/month
SimilarWeb	Traffic estimates	$199+/month
Crunchbase	Funding, company data	$29+/month
4.3 Tool Specifications
Tool 1: Compliance Gatekeeper
text

┌─────────────────────────────────────────────────────────────────────┐
│                    COMPLIANCE GATEKEEPER TOOL                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  PURPOSE: Prevent unethical research actions                        │
│                                                                      │
│  INPUTS:                                                            │
│  • research_action: What are we trying to do?                       │
│  • target_data_type: What data are we collecting?                   │
│  • target_entity: Person or company?                                │
│                                                                      │
│  CHECKS:                                                            │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  1. Data Type Check                                          │   │
│  │     ✓ Business contact info → ALLOWED                        │   │
│  │     ✓ Public social profiles → ALLOWED                       │   │
│  │     ✓ News articles → ALLOWED                                │   │
│  │     ✗ Personal home address → BLOCKED                        │   │
│  │     ✗ Personal phone (non-business) → BLOCKED               │   │
│  │     ✗ Family member info → BLOCKED                           │   │
│  │     ✗ Private messages → BLOCKED                             │   │
│  │                                                               │   │
│  │  2. Source Check                                             │   │
│  │     ✓ Public website → ALLOWED                               │   │
│  │     ✓ Public API → ALLOWED                                   │   │
│  │     ✗ Login-required scraping → BLOCKED                      │   │
│  │     ✗ Terms-violating scrape → BLOCKED                       │   │
│  │                                                               │   │
│  │  3. Rate Limit Check                                         │   │
│  │     Check current usage against limits                       │   │
│  │     BLOCK if over limit                                      │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  OUTPUT:                                                            │
│  • status: APPROVED | BLOCKED                                       │
│  • reason: (if blocked)                                             │
│  • approved_scope: (what's allowed)                                 │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
Tool 2: Data Quality Validator
text

┌─────────────────────────────────────────────────────────────────────┐
│                    DATA QUALITY VALIDATOR TOOL                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  PURPOSE: Ensure research data meets quality standards              │
│                                                                      │
│  VALIDATION CHECKS:                                                 │
│                                                                      │
│  1. COMPLETENESS                                                    │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  Critical fields (must be 100%):                             │   │
│  │  • Company name                                              │   │
│  │  • Primary category                                          │   │
│  │  • Location (city, state)                                    │   │
│  │                                                               │   │
│  │  Important fields (target 80%):                              │   │
│  │  • Website URL                                               │   │
│  │  • Phone number                                              │   │
│  │  • At least 1 social profile                                 │   │
│  │  • Owner/leader name                                         │   │
│  │                                                               │   │
│  │  Nice-to-have (target 50%):                                  │   │
│  │  • All social profiles                                       │   │
│  │  • Revenue estimate                                          │   │
│  │  • Full competitor analysis                                  │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  2. FRESHNESS                                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  • Website checked within 7 days                             │   │
│  │  • Social data within 30 days                                │   │
│  │  • News within 90 days                                       │   │
│  │  • Flag stale data for refresh                               │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  3. ACCURACY                                                        │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  • Cross-reference check (2+ sources agree)                  │   │
│  │  • Format validation (email, phone, URL)                     │   │
│  │  • Confidence score per data point                           │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  OUTPUT:                                                            │
│  • quality_score: 0-100                                             │
│  • completeness_pct: percentage                                     │
│  • gaps: [list of missing fields]                                   │
│  • stale_data: [fields needing refresh]                             │
│  • low_confidence: [fields with <70% confidence]                    │
│  • ready_for_report: boolean                                        │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
Tool 3: Report Generator
text

┌─────────────────────────────────────────────────────────────────────┐
│                     REPORT GENERATOR TOOL                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  PURPOSE: Transform research data into formatted reports            │
│                                                                      │
│  INPUT: Complete intelligence profile JSON                          │
│                                                                      │
│  OUTPUT FORMATS:                                                    │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  1. MARKDOWN REPORT                                          │   │
│  │     • Full research report                                   │   │
│  │     • Optimized for reading in text editors/GitHub          │   │
│  │     • Includes all data points and analysis                 │   │
│  │     • File: {company_slug}_intelligence_report.md            │   │
│  │                                                               │   │
│  │  2. PDF REPORT                                               │   │
│  │     • Professional formatted document                        │   │
│  │     • Branded header/footer                                  │   │
│  │     • Executive summary on first page                        │   │
│  │     • Charts/visualizations for metrics                      │   │
│  │     • File: {company_slug}_intelligence_report.pdf           │   │
│  │                                                               │   │
│  │  3. SUMMARY CARD (Bonus)                                     │   │
│  │     • One-page quick reference                               │   │
│  │     • Key stats and contact info                             │   │
│  │     • Top opportunities identified                           │   │
│  │     • File: {company_slug}_summary.pdf                       │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  PDF GENERATION OPTIONS:                                            │
│  • n8n HTML to PDF node                                             │
│  • Puppeteer/Playwright (headless browser)                          │
│  • PDFKit library                                                   │
│  • External API (PDFShift, DocRaptor)                               │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
Part 5: Layer 4 — Evolution & Learning
5.1 Learning Loop Architecture
text

┌─────────────────────────────────────────────────────────────────────┐
│                    EVOLUTION ENGINE                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │                    DATA COLLECTION                          │    │
│  ├────────────────────────────────────────────────────────────┤    │
│  │                                                              │    │
│  │  For EVERY research operation, log:                         │    │
│  │                                                              │    │
│  │  • Source used                                              │    │
│  │  • Success/Failure                                          │    │
│  │  • Data quality score                                       │    │
│  │  • Time taken                                               │    │
│  │  • Error messages (if any)                                  │    │
│  │  • Retry count                                              │    │
│  │                                                              │    │
│  │  For EVERY company researched, log:                         │    │
│  │                                                              │    │
│  │  • Industry/Category                                        │    │
│  │  • Which sources worked best                                │    │
│  │  • Data completeness achieved                               │    │
│  │  • Time to complete                                         │    │
│  │                                                              │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │                    ANALYSIS                                 │    │
│  ├────────────────────────────────────────────────────────────┤    │
│  │                                                              │    │
│  │  Weekly Analysis Job:                                       │    │
│  │                                                              │    │
│  │  1. Source Reliability Score                                │    │
│  │     For each data source:                                   │    │
│  │     • Success rate                                          │    │
│  │     • Average data quality                                  │    │
│  │     • Downtime incidents                                    │    │
│  │     → Rank sources by effectiveness                         │    │
│  │                                                              │    │
│  │  2. Industry Pattern Detection                              │    │
│  │     • Which sources work best for which industries          │    │
│  │     • Common gaps by industry                               │    │
│  │     • Average research time by industry                     │    │
│  │                                                              │    │
│  │  3. Failure Pattern Analysis                                │    │
│  │     • What errors occur most often?                         │    │
│  │     • Which sources cause most retries?                     │    │
│  │     • Any systematic blockers?                              │    │
│  │                                                              │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │                    ADAPTATION                               │    │
│  ├────────────────────────────────────────────────────────────┤    │
│  │                                                              │    │
│  │  Automatic Updates:                                         │    │
│  │                                                              │    │
│  │  1. Source Priority Adjustment                              │    │
│  │     If source X fails >30% of time:                         │    │
│  │     → Demote in priority order                              │    │
│  │     → Add alternative source                                │    │
│  │                                                              │    │
│  │  2. Industry-Specific Routing                               │    │
│  │     Learn which sources work best per industry:             │    │
│  │     Medical → Prioritize NPI registry + HealthGrades        │    │
│  │     Legal → Prioritize Bar Association + Avvo               │    │
│  │     Restaurant → Prioritize Yelp + OpenTable                │    │
│  │                                                              │    │
│  │  3. Rate Limit Optimization                                 │    │
│  │     If hitting limits frequently:                           │    │
│  │     → Increase delays automatically                         │    │
│  │     → Queue optimization                                    │    │
│  │                                                              │    │
│  │  4. New Source Discovery                                    │    │
│  │     Flag when gaps are consistent:                          │    │
│  │     → Alert for manual source research                      │    │
│  │                                                              │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
5.2 Evolution Log Structure
text

┌─────────────────────────────────────────────────────────────────────┐
│                    EVOLUTION LOG SCHEMA                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  File: evolution.jsonl (append-only log)                            │
│                                                                      │
│  EVENT TYPES:                                                       │
│                                                                      │
│  1. SOURCE_SUCCESS                                                  │
│  {                                                                  │
│    "type": "SOURCE_SUCCESS",                                        │
│    "timestamp": "2024-01-15T10:30:00Z",                             │
│    "source": "linkedin_company_search",                             │
│    "company_category": "medical",                                   │
│    "data_quality_score": 85,                                        │
│    "duration_ms": 2300                                              │
│  }                                                                  │
│                                                                      │
│  2. SOURCE_FAILURE                                                  │
│  {                                                                  │
│    "type": "SOURCE_FAILURE",                                        │
│    "timestamp": "2024-01-15T10:32:00Z",                             │
│    "source": "yelp_api",                                            │
│    "error_code": "RATE_LIMITED",                                    │
│    "error_message": "Too many requests",                            │
│    "retry_count": 3,                                                │
│    "fallback_used": "google_reviews"                                │
│  }                                                                  │
│                                                                      │
│  3. RESEARCH_COMPLETE                                               │
│  {                                                                  │
│    "type": "RESEARCH_COMPLETE",                                     │
│    "timestamp": "2024-01-15T10:45:00Z",                             │
│    "company_id": "abc123",                                          │
│    "company_category": "medical",                                   │
│    "completeness_score": 78,                                        │
│    "sources_used": ["website", "linkedin", "google_reviews"],       │
│    "sources_failed": ["yelp"],                                      │
│    "total_duration_ms": 45000,                                      │
│    "gaps": ["owner_linkedin", "revenue_estimate"]                   │
│  }                                                                  │
│                                                                      │
│  4. ADAPTATION_APPLIED                                              │
│  {                                                                  │
│    "type": "ADAPTATION_APPLIED",                                    │
│    "timestamp": "2024-01-15T12:00:00Z",                             │
│    "change_type": "SOURCE_PRIORITY_UPDATE",                         │
│    "old_config": {"yelp": 2, "google": 3},                          │
│    "new_config": {"yelp": 4, "google": 1},                          │
│    "reason": "yelp failure rate 45% over 7 days"                    │
│  }                                                                  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
Part 6: Output Specifications
6.1 Markdown Report Template
Markdown

# Company Intelligence Report
## [COMPANY NAME]
**Generated:** [DATE] | **Confidence Score:** [XX]%

---

## Executive Summary

| Metric | Value | Status |
|--------|-------|--------|
| Digital Maturity | Low/Medium/High | 🟢/🟡/🔴 |
| Social Presence | Low/Medium/High | 🟢/🟡/🔴 |
| Reputation Score | XX/100 | 🟢/🟡/🔴 |
| Marketing Opportunity | Low/Medium/High | 🟢/🟡/🔴 |

**Top 3 Opportunities:**
1. [Opportunity 1]
2. [Opportunity 2]  
3. [Opportunity 3]

---

## 1. Company Overview

### Basic Information
- **Legal Name:** [Name]
- **DBA:** [If different]
- **Founded:** [Year]
- **Employees:** [Range]
- **Revenue:** [Estimate if available]
- **Category:** [Business type]
- **Locations:** [Count]

### Address & Contact
- **Primary Address:** [Full address]
- **Phone:** [Number]
- **Email:** [If found]
- **Hours:** [If available]

---

## 2. Digital Presence

### Website Analysis
- **URL:** [website.com]
- **Status:** Live/Down/Redirect
- **SSL:** Valid/Invalid/Missing
- **Mobile Friendly:** Yes/No
- **Page Speed Score:** XX/100
- **Last Updated:** [Estimate]

#### Technology Stack
| Technology | Category |
|------------|----------|
| [WordPress] | [CMS] |
| [WooCommerce] | [Ecommerce] |

#### Content Inventory
- Blog Posts: [Count]
- Service Pages: [Count]
- Team Page: Yes/No

#### SEO Health
- Domain Authority: XX
- Organic Keywords: XX
- Monthly Traffic Estimate: XX

---

## 3. Social Media Presence

| Platform | Handle | Followers | Activity | Engagement |
|----------|--------|-----------|----------|------------|
| LinkedIn | [@handle] | X,XXX | Active/Inactive | X.X% |
| Facebook | [@handle] | X,XXX | Active/Inactive | X.X% |
| Instagram | [@handle] | X,XXX | Active/Inactive | X.X% |
| Twitter | [@handle] | X,XXX | Active/Inactive | X.X% |

**Social Presence Score:** XX/100

**Analysis:**
[AI-generated analysis of social media strategy, strengths, gaps]

---

## 4. Ownership & Leadership

### Identified Leaders

#### [Owner/CEO Name]
- **Title:** [Position]
- **LinkedIn:** [URL]
- **Other Socials:** [List]
- **Background:** [Brief bio]
- **Other Businesses:** [If any]

---

## 5. Reputation & Reviews

### Overall Rating
- **Google:** ⭐ X.X (XXX reviews)
- **Yelp:** ⭐ X.X (XX reviews)
- **BBB:** [Rating]

### Sentiment Analysis
- Positive: XX%
- Neutral: XX%
- Negative: XX%

### Common Themes
**Positive:**
- [Theme 1]
- [Theme 2]

**Areas for Improvement:**
- [Theme 1]
- [Theme 2]

---

## 6. Competitor Analysis

### Top 5 Competitors

| Company | Distance | Rating | Reviews | Digital Score |
|---------|----------|--------|---------|---------------|
| [Comp 1] | X mi | X.X | XXX | XX/100 |
| [Comp 2] | X mi | X.X | XXX | XX/100 |

### Competitive Position
[Analysis of where this company stands vs competitors]

---

## 7. News & Media

### Recent Coverage (Past 12 Months)
- [Date]: [Headline] - [Source] - [Sentiment]
- [Date]: [Headline] - [Source] - [Sentiment]

### Press/Awards
- [Item 1]
- [Item 2]

---

## 8. Marketing Opportunities

### AI Automation Opportunities
| Opportunity | Current State | Recommendation | Impact |
|-------------|---------------|----------------|--------|
| Chatbot | None | Implement | High |
| Email Automation | None | Setup | Medium |

### Website Opportunities
| Opportunity | Current State | Recommendation | Impact |
|-------------|---------------|----------------|--------|
| Redesign | Outdated | Modernize | High |
| SEO | Weak | Optimize | High |

### Content Opportunities
| Opportunity | Current State | Recommendation | Impact |
|-------------|---------------|----------------|--------|
| Blog | Inactive | Strategy | Medium |
| Video | None | Start | High |

### Lead Generation Opportunities
| Opportunity | Current State | Recommendation | Impact |
|-------------|---------------|----------------|--------|
| Lead Forms | Basic | Optimize | High |
| Landing Pages | None | Create | High |

---

## 9. Recommended Approach

### Discovery Call Talking Points
1. [Point 1 based on findings]
2. [Point 2 based on findings]
3. [Point 3 based on findings]

### Potential Objections & Responses
- **Objection:** [Common objection]
  - **Response:** [Data-backed response]

---

## Appendix

### Data Sources Used
- [List of sources]

### Data Gaps
- [List of missing information]

### Confidence Levels
- [Breakdown by section]

---
*Report generated by Deep Company Intelligence Platform*
*Data as of: [DATE]*
6.2 PDF Report Structure
text

┌─────────────────────────────────────────────────────────────────────┐
│                    PDF REPORT LAYOUT                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  PAGE 1: COVER PAGE                                                 │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                                                               │   │
│  │                    [YOUR LOGO]                               │   │
│  │                                                               │   │
│  │         COMPANY INTELLIGENCE REPORT                          │   │
│  │                                                               │   │
│  │              [COMPANY NAME]                                  │   │
│  │              [COMPANY LOGO if found]                         │   │
│  │                                                               │   │
│  │         Generated: [DATE]                                    │   │
│  │         Confidence: [XX]%                                    │   │
│  │                                                               │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  PAGE 2: EXECUTIVE SUMMARY                                          │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                                                               │   │
│  │  [Scorecard with visual indicators]                          │   │
│  │                                                               │   │
│  │  ┌──────────────────┬──────────────────┐                    │   │
│  │  │ DIGITAL MATURITY │ SOCIAL PRESENCE  │                    │   │
│  │  │ ████████░░ 80%   │ ████░░░░░░ 40%   │                    │   │
│  │  └──────────────────┴──────────────────┘                    │   │
│  │  ┌──────────────────┬──────────────────┐                    │   │
│  │  │ REPUTATION       │ OPPORTUNITY      │                    │   │
│  │  │ ██████████ 95%   │ HIGH ⬆️           │                    │   │
│  │  └──────────────────┴──────────────────┘                    │   │
│  │                                                               │   │
│  │  TOP OPPORTUNITIES:                                          │   │
│  │  1. ________________________________                         │   │
│  │  2. ________________________________                         │   │
│  │  3. ________________________________                         │   │
│  │                                                               │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  PAGES 3-5: DETAILED SECTIONS                                       │
│  • Company Overview (with location map)                             │
│  • Digital Presence (with screenshots)                              │
│  • Social Media (with charts)                                       │
│  • Leadership Profiles (with photos if available)                   │
│  • Reputation Analysis (with sentiment charts)                      │
│  • Competitor Comparison (with table)                               │
│                                                                      │
│  FINAL PAGE: RECOMMENDATIONS                                        │
│  • Priority-ordered opportunity list                                │
│  • Suggested talking points                                         │
│  • Next steps                                                       │
│                                                                      │
│  FOOTER ON ALL PAGES:                                               │
│  [Your Company Name] | [Date] | Page X of Y                        │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
