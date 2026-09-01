/**
 * Comprehensive Database Seed Script
 * Restores ALL collections, fields, and data for BrandUntold CMS.
 *
 * Usage:
 *   node scripts/seed-all-data.js
 *
 * This script will:
 *   1. Create superadmin user
 *   2. Create all CMS collection definitions
 *   3. Create all field definitions for each collection
 *   4. Seed content data into each collection
 */

require('dotenv').config({ path: '.env' });
const { MongoClient, ObjectId } = require('mongodb');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'jayshree_blogs';

if (!uri) {
  console.error('❌ Missing MONGODB_URI. Set it in your .env file.');
  process.exit(1);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  magenta: '\x1b[35m',
};

function log(message, type = 'info') {
  const prefix = {
    info: `${colors.blue}ℹ${colors.reset}`,
    success: `${colors.green}✓${colors.reset}`,
    error: `${colors.red}✗${colors.reset}`,
    warn: `${colors.yellow}⚠${colors.reset}`,
    section: `${colors.magenta}▸${colors.reset}`,
  }[type] || `${colors.blue}→${colors.reset}`;
  console.log(`  ${prefix} ${message}`);
}

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function nowIso() {
  return new Date().toISOString();
}

// ─── Main Seed Function ───────────────────────────────────────────────────────

async function seed() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);
  const timestamp = nowIso();

  console.log(`\n${colors.magenta}🚀 BrandUntold Database Seed${colors.reset}`);
  console.log(`${colors.blue}   Database: ${dbName}${colors.reset}\n`);

  // ═══════════════════════════════════════════════════════════════════════════
  // 1. SUPERADMIN USER
  // ═══════════════════════════════════════════════════════════════════════════
  console.log(`\n${colors.magenta}━━━ 1. Users ━━━${colors.reset}`);
  {
    const usersCol = db.collection('users');
    const existing = await usersCol.findOne({ username: 'superadmin' });
    if (existing) {
      log('Superadmin user already exists', 'warn');
    } else {
      await usersCol.insertOne({
        username: 'superadmin',
        email: 'admin@example.com',
        password: hashPassword('admin123'),
        role: 'superadmin',
        created_at: timestamp,
        updated_at: timestamp,
      });
      log('Created superadmin (username: superadmin, password: admin123)', 'success');
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. COLLECTION DEFINITIONS & FIELDS
  // ═══════════════════════════════════════════════════════════════════════════
  console.log(`\n${colors.magenta}━━━ 2. Collection & Field Definitions ━━━${colors.reset}`);

  const collectionsCol = db.collection('collections');
  const fieldsCol = db.collection('fields');

  // Map to store collection name → ObjectId for relations
  const collectionIds = {};

  // Helper: create collection + fields
  async function createCollectionWithFields(collectionDef, fieldsDef) {
    let collectionDoc = await collectionsCol.findOne({ name: collectionDef.name });
    if (!collectionDoc) {
      const insertDoc = {
        ...collectionDef,
        created_at: timestamp,
        updated_at: timestamp,
      };
      const result = await collectionsCol.insertOne(insertDoc);
      collectionDoc = { _id: result.insertedId, ...insertDoc };
      log(`Created collection: ${collectionDef.display_name}`, 'success');
    } else {
      log(`Collection "${collectionDef.name}" already exists`, 'warn');
    }

    const collectionId = collectionDoc._id.toString();
    collectionIds[collectionDef.name] = collectionId;

    // Create fields
    for (const f of fieldsDef) {
      const existing = await fieldsCol.findOne({ collection_id: collectionId, name: f.name });
      if (existing) {
        continue; // skip if exists
      }

      // If relation_to_collection is a name, resolve to the actual collection id
      let relationTo = f.relation_to_collection || null;
      if (relationTo && collectionIds[relationTo]) {
        relationTo = collectionIds[relationTo];
      }

      const insertDoc = {
        ...f,
        collection_id: collectionId,
        is_required: f.is_required ?? false,
        is_unique: f.is_unique ?? false,
        is_encrypted: f.is_encrypted ?? false,
        validation_rules: f.validation_rules ?? [],
        default_value: f.default_value ?? null,
        relation_to_collection: relationTo,
        field_order: f.field_order ?? 0,
        created_at: timestamp,
        updated_at: timestamp,
      };
      // Remove redundant keys
      delete insertDoc.collection_id_placeholder;

      insertDoc.collection_id = collectionId;
      await fieldsCol.insertOne(insertDoc);
    }
    log(`  → ${fieldsDef.length} fields configured`, 'info');

    return collectionId;
  }

  // ─── 2a. Hero Section ─────────────────────────────────────────────────────
  await createCollectionWithFields(
    {
      name: 'herosec',
      display_name: 'Hero Section',
      description: 'Homepage hero banner content',
      icon: 'layout-dashboard',
      color: 'gold',
    },
    [
      { name: 'tagline', display_name: 'Tagline', field_type: 'Text', field_order: 0, description: 'Small text above heading' },
      { name: 'heading', display_name: 'Heading', field_type: 'Text', field_order: 1, is_required: true, description: 'Main hero heading' },
      { name: 'description', display_name: 'Description', field_type: 'Editor', field_order: 2, description: 'Hero description text (rich text)' },
      { name: 'image', display_name: 'Hero Image', field_type: 'Image', field_order: 3, description: 'Background/hero image' },
      { name: 'altname', display_name: 'Image Alt Text', field_type: 'Text', field_order: 4, description: 'Alt text for SEO' },
      { name: 'img_title', display_name: 'Image Title', field_type: 'Text', field_order: 5, description: 'Image title attribute' },
    ]
  );

  // ─── 2b. About Us ────────────────────────────────────────────────────────
  await createCollectionWithFields(
    {
      name: 'about_us',
      display_name: 'About Us',
      description: 'About page content',
      icon: 'user',
      color: 'blue',
    },
    [
      { name: 'heading', display_name: 'Heading', field_type: 'Text', field_order: 0, is_required: true },
      { name: 'description1', display_name: 'Description 1', field_type: 'Editor', field_order: 1, description: 'First section (rich text)' },
      { name: 'description2', display_name: 'Description 2', field_type: 'Editor', field_order: 2, description: 'Second section (rich text)' },
      { name: 'short_description', display_name: 'Short Description', field_type: 'Editor', field_order: 3, description: 'Short description for homepage preview' },
      { name: 'image', display_name: 'Profile Image', field_type: 'Image', field_order: 4 },
      { name: 'altname', display_name: 'Image Alt Text', field_type: 'Text', field_order: 5 },
      { name: 'img_title', display_name: 'Image Title', field_type: 'Text', field_order: 6 },
    ]
  );

  // ─── 2c. All Headings ─────────────────────────────────────────────────────
  await createCollectionWithFields(
    {
      name: 'all_headings',
      display_name: 'Section Headings',
      description: 'Reusable headings for different page sections',
      icon: 'heading',
      color: 'purple',
    },
    [
      { name: 'section', display_name: 'Section Name', field_type: 'Text', field_order: 0, is_required: true, is_unique: true, description: 'Section identifier (e.g. "category", "about us")' },
      { name: 'tagline', display_name: 'Tagline', field_type: 'Text', field_order: 1 },
      { name: 'heading', display_name: 'Heading', field_type: 'Text', field_order: 2 },
      { name: 'subheading', display_name: 'Subheading', field_type: 'Text', field_order: 3 },
    ]
  );

  // ─── 2d. Heading (contact/service sections) ──────────────────────────────
  await createCollectionWithFields(
    {
      name: 'heading',
      display_name: 'Page Section Headings',
      description: 'Individual section headings for pages like contact, services',
      icon: 'type',
      color: 'indigo',
    },
    [
      { name: 'section', display_name: 'Section', field_type: 'Text', field_order: 0, is_required: true, description: 'Section identifier' },
      { name: 'tagline', display_name: 'Tagline', field_type: 'Text', field_order: 1 },
      { name: 'heading', display_name: 'Heading', field_type: 'Text', field_order: 2 },
      { name: 'subheading', display_name: 'Subheading', field_type: 'Text', field_order: 3 },
    ]
  );

  // ─── 2e. Category ─────────────────────────────────────────────────────────
  await createCollectionWithFields(
    {
      name: 'category',
      display_name: 'Categories',
      description: 'Article categories for the blog',
      icon: 'folder',
      color: 'green',
    },
    [
      { name: 'heading', display_name: 'Category Name', field_type: 'Text', field_order: 0, is_required: true },
      { name: 'tagline', display_name: 'Tagline', field_type: 'Text', field_order: 1 },
      { name: 'subheading', display_name: 'Subheading', field_type: 'Textarea', field_order: 2 },
      { name: 'description', display_name: 'Description', field_type: 'Editor', field_order: 3 },
      { name: 'image', display_name: 'Category Image', field_type: 'Image', field_order: 4 },
      { name: 'altname', display_name: 'Image Alt Text', field_type: 'Text', field_order: 5 },
      { name: 'img_title', display_name: 'Image Title', field_type: 'Text', field_order: 6 },
      { name: 'metatitle', display_name: 'Meta Title', field_type: 'Text', field_order: 7 },
      { name: 'meta_description', display_name: 'Meta Description', field_type: 'Textarea', field_order: 8 },
      { name: 'meta_keyword', display_name: 'Meta Keywords', field_type: 'JSON', field_order: 9 },
      { name: 'canonical', display_name: 'Canonical URL', field_type: 'Text', field_order: 10 },
    ]
  );

  // ─── 2f. Articles ─────────────────────────────────────────────────────────
  await createCollectionWithFields(
    {
      name: 'articles',
      display_name: 'Articles',
      description: 'Blog articles and stories',
      icon: 'file-text',
      color: 'orange',
    },
    [
      { name: 'title', display_name: 'Title', field_type: 'Text', field_order: 0, is_required: true },
      { name: 'slug', display_name: 'URL Slug', field_type: 'Text', field_order: 1, is_required: true, is_unique: true },
      { name: 'description', display_name: 'Short Description', field_type: 'Textarea', field_order: 2 },
      { name: 'long_description', display_name: 'Full Content', field_type: 'Editor', field_order: 3, description: 'Article body (rich text editor)' },
      { name: 'image', display_name: 'Featured Image', field_type: 'Image', field_order: 4 },
      { name: 'altname', display_name: 'Image Alt Text', field_type: 'Text', field_order: 5 },
      { name: 'img_title', display_name: 'Image Title', field_type: 'Text', field_order: 6 },
      { name: 'date', display_name: 'Publish Date', field_type: 'Date', field_order: 7 },
      { name: 'author', display_name: 'Author', field_type: 'Text', field_order: 8 },
      { name: 'author_bio', display_name: 'Author Bio', field_type: 'Textarea', field_order: 9 },
      { name: 'category', display_name: 'Category', field_type: 'Relation', field_order: 10, relation_to_collection: 'category', description: 'Related category' },
      { name: 'tagline', display_name: 'Tagline', field_type: 'Text', field_order: 11 },
      { name: 'metatitle', display_name: 'Meta Title', field_type: 'Text', field_order: 12 },
      { name: 'meta_description', display_name: 'Meta Description', field_type: 'Textarea', field_order: 13 },
      { name: 'meta_keyword', display_name: 'Meta Keywords', field_type: 'JSON', field_order: 14 },
      { name: 'canonical', display_name: 'Canonical URL', field_type: 'Text', field_order: 15 },
    ]
  );

  // ─── 2g. Services ─────────────────────────────────────────────────────────
  await createCollectionWithFields(
    {
      name: 'services',
      display_name: 'Services',
      description: 'Services offered by BrandUntold',
      icon: 'briefcase',
      color: 'teal',
    },
    [
      { name: 'heading', display_name: 'Heading', field_type: 'Text', field_order: 0, is_required: true },
      { name: 'description', display_name: 'Description', field_type: 'Editor', field_order: 1 },
      { name: 'card_heading', display_name: 'Card Headings', field_type: 'JSON', field_order: 2, description: 'Array of service card headings' },
      { name: 'cards_description', display_name: 'Card Descriptions', field_type: 'JSON', field_order: 3, description: 'Array of service card descriptions' },
    ]
  );

  // ─── 2h. Footer ───────────────────────────────────────────────────────────
  await createCollectionWithFields(
    {
      name: 'footer',
      display_name: 'Footer',
      description: 'Footer content and social links',
      icon: 'columns',
      color: 'gray',
    },
    [
      { name: 'description', display_name: 'Description', field_type: 'Textarea', field_order: 0 },
      { name: 'footerlogo', display_name: 'Footer Logo', field_type: 'Image', field_order: 1 },
      { name: 'altname', display_name: 'Logo Alt Text', field_type: 'Text', field_order: 2 },
      { name: 'img_title', display_name: 'Logo Title', field_type: 'Text', field_order: 3 },
      { name: 'facebook', display_name: 'Facebook URL', field_type: 'Text', field_order: 4 },
      { name: 'instagram', display_name: 'Instagram URL', field_type: 'Text', field_order: 5 },
      { name: 'twitter', display_name: 'Twitter / X URL', field_type: 'Text', field_order: 6 },
      { name: 'linkedin', display_name: 'LinkedIn URL', field_type: 'Text', field_order: 7 },
      { name: 'email', display_name: 'Contact Email', field_type: 'Text', field_order: 8 },
      { name: 'phone', display_name: 'Phone Number', field_type: 'Text', field_order: 9 },
      { name: 'address', display_name: 'Address', field_type: 'Textarea', field_order: 10 },
      { name: 'map', display_name: 'Google Maps Embed', field_type: 'Textarea', field_order: 11 },
    ]
  );

  // ─── 2i. FAQ ──────────────────────────────────────────────────────────────
  await createCollectionWithFields(
    {
      name: 'faq',
      display_name: 'FAQ',
      description: 'Frequently Asked Questions',
      icon: 'help-circle',
      color: 'cyan',
    },
    [
      { name: 'question', display_name: 'Question', field_type: 'Text', field_order: 0, is_required: true },
      { name: 'ans', display_name: 'Answer', field_type: 'Editor', field_order: 1, is_required: true },
    ]
  );

  // ─── 2j. Static Meta ─────────────────────────────────────────────────────
  await createCollectionWithFields(
    {
      name: 'static_meta',
      display_name: 'Static Page SEO',
      description: 'SEO metadata for static pages (home, about, etc.)',
      icon: 'search',
      color: 'yellow',
    },
    [
      { name: 'slug', display_name: 'Page Slug', field_type: 'Text', field_order: 0, is_required: true, is_unique: true, description: 'Page identifier (e.g. "home", "about", "work-with-me")' },
      { name: 'metatitle', display_name: 'Meta Title', field_type: 'Text', field_order: 1 },
      { name: 'meta_description', display_name: 'Meta Description', field_type: 'Textarea', field_order: 2 },
      { name: 'meta_keyword', display_name: 'Meta Keywords', field_type: 'JSON', field_order: 3 },
      { name: 'schema', display_name: 'JSON-LD Schema', field_type: 'Textarea', field_order: 4, description: 'Structured data for search engines' },
      { name: 'canonical', display_name: 'Canonical URL', field_type: 'Text', field_order: 5 },
    ]
  );

  // ─── 2k. Contact Us (form submissions) ────────────────────────────────────
  await createCollectionWithFields(
    {
      name: 'contactus',
      display_name: 'Contact Submissions',
      description: 'Contact form submissions from the website',
      icon: 'mail',
      color: 'red',
    },
    [
      { name: 'name', display_name: 'Name', field_type: 'Text', field_order: 0, is_required: true },
      { name: 'email', display_name: 'Email', field_type: 'Text', field_order: 1, is_required: true },
      { name: 'service_id', display_name: 'Service', field_type: 'Text', field_order: 2 },
      { name: 'message', display_name: 'Message', field_type: 'Textarea', field_order: 3, is_required: true },
    ]
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. SEED CONTENT DATA
  // ═══════════════════════════════════════════════════════════════════════════
  console.log(`\n${colors.magenta}━━━ 3. Seeding Content Data ━━━${colors.reset}`);

  // Helper: upsert single record (insert if empty collection or no match)
  async function seedSingleRecord(collectionName, data) {
    const col = db.collection(collectionName);
    const count = await col.countDocuments();
    if (count > 0) {
      log(`${collectionName}: already has ${count} record(s), skipping`, 'warn');
      return null;
    }
    const doc = { ...data, created_at: timestamp, updated_at: timestamp };
    const result = await col.insertOne(doc);
    log(`${collectionName}: seeded 1 record`, 'success');
    return result.insertedId;
  }

  // Helper: seed multiple records
  async function seedMultipleRecords(collectionName, records) {
    const col = db.collection(collectionName);
    const count = await col.countDocuments();
    if (count > 0) {
      log(`${collectionName}: already has ${count} record(s), skipping`, 'warn');
      return [];
    }
    const docs = records.map(r => ({ ...r, created_at: timestamp, updated_at: timestamp }));
    const result = await col.insertMany(docs);
    log(`${collectionName}: seeded ${records.length} records`, 'success');
    return Object.values(result.insertedIds);
  }

  // ─── 3a. Hero Section ─────────────────────────────────────────────────────
  await seedSingleRecord('herosec', {
    tagline: 'STORIES THAT SHAPE BRANDS',
    heading: 'Brand Untold',
    description: '<p>We uncover the <strong>real stories</strong> behind brands and founders — the thinking, the risks, the turning points, and the craft of <em>authentic storytelling</em>.</p>',
    image: '/uploads/hero-brand-untold.jpg',
    altname: 'Brand Untold - Stories that shape brands',
    img_title: 'Brand Untold Hero Image',
  });

  // ─── 3b. About Us ────────────────────────────────────────────────────────
  await seedSingleRecord('about_us', {
    heading: "Hello, I'm Jayshree",
    description1: '<h2>The Story Behind Brand Untold</h2><p>Brand Untold started with a simple question — <strong>Why do some brands resonate so deeply while others fade into noise?</strong></p><p>The answer, we found, always came down to one thing: <em>the story</em>. Not the polished pitch deck version. Not the press release. The real story — the one with doubts, detours, and defining moments.</p><p>We created Brand Untold as a platform to tell those stories — the ones that don\'t get told in headlines. The founder who almost gave up. The rebrand that saved a company. The quiet decision that changed everything.</p>',
    description2: '<p>There were no formal meetings, no rigid agendas, no hierarchy deciding whose voice mattered more. Just two minds exchanging ideas with sincerity — questioning without ego, disagreeing without dismissing, building something meaningful from a distance. Somewhere along the journey, Brand Untold was born.</p><p>Today, Brand Untold is more than a blog — it\'s an editorial platform committed to <strong>editorial integrity</strong>, <strong>depth over volume</strong>, and <strong>telling stories before they become obvious</strong>.</p>',
    short_description: '<h2>About Brand Untold</h2><p>Brand Untold is an editorial platform dedicated to uncovering the <strong>real stories behind brands and founders</strong> — the thinking, the risks, the turning points, and the craft of authentic storytelling.</p><p>We believe that behind every great brand is an untold story waiting to be shared.</p>',
    image: '/uploads/about-jayshree.jpg',
    altname: 'Jayshri Tiwari, Co-Founder of Brand Untold',
    img_title: 'Jayshri Tiwari - Brand Untold Co-Founder',
  });

  // ─── 3c. Section Headings ─────────────────────────────────────────────────
  await seedMultipleRecords('all_headings', [
    {
      section: 'category',
      tagline: 'EXPLORE OUR CATEGORIES',
      heading: 'What We Write About',
      subheading: 'Deep dives into the stories, strategies, and craft behind great brands.',
    },
    {
      section: 'about us',
      tagline: 'THE STORY BEHIND THE WORDS',
      heading: 'About Brand Untold',
      subheading: 'Uncovering the real stories behind brands and the craft of authentic storytelling.',
    },
    {
      section: 'about cards',
      tagline: 'OUR APPROACH',
      heading: 'My Writing Philosophy',
      subheading: 'I believe in clarity over complexity. In a world of noise, the clearest voice wins.',
    },
    {
      section: 'cta',
      tagline: 'GET IN TOUCH',
      heading: "Let's Connect",
      subheading: "Whether you're looking to craft your brand story, need help with content strategy, or just want to chat about storytelling, I'd love to hear from you.",
    },
    {
      section: 'featured',
      tagline: 'LATEST STORIES',
      heading: 'Featured Articles',
      subheading: 'Our most recent and impactful stories.',
    },
  ]);

  // ─── 3d. Page Section Headings ────────────────────────────────────────────
  await seedMultipleRecords('heading', [
    {
      section: 'Contact Us',
      tagline: 'GET IN TOUCH',
      heading: 'Work With Us',
      subheading: "Let's craft your brand's story together. We offer tailored services for founders, startups, and growing brands.",
    },
    {
      section: 'contact form',
      tagline: 'SEND A MESSAGE',
      heading: "Let's Start a Conversation",
      subheading: 'Tell us about your project and we will get back to you within 24 hours.',
    },
  ]);

  // ─── 3e. Categories ──────────────────────────────────────────────────────
  const categoryIds = await seedMultipleRecords('category', [
    {
      heading: 'Founder Stories',
      tagline: 'THE BUILDERS BEHIND THE BRANDS',
      subheading: 'Real stories of founders and brands that built something meaningful through vision, persistence, and authentic storytelling.',
      image: '/uploads/category-founder-stories.jpg',
      altname: 'Founder Stories - Brand Untold',
      img_title: 'Founder Stories Category',
      metatitle: 'Founder Stories | Real Stories of Founders & Brands - Brand Untold',
      meta_description: 'Read real stories of founders and brands that built something meaningful through vision, persistence, and authentic storytelling.',
      meta_keyword: ['founder stories', 'startup stories', 'brand stories', 'entrepreneur stories'],
      canonical: '/categories/founder-stories',
    },
    {
      heading: 'Story Breakdowns',
      tagline: 'THE ANATOMY OF GREAT STORIES',
      subheading: 'Analytical articles explaining why certain stories work and how to craft compelling narratives for your brand.',
      image: '/uploads/category-story-breakdowns.jpg',
      altname: 'Story Breakdowns - Brand Untold',
      img_title: 'Story Breakdowns Category',
      metatitle: 'Story Breakdowns | The Anatomy of Great Stories - Brand Untold',
      meta_description: 'Analytical articles explaining why certain stories work and how to craft compelling narratives for your brand.',
      meta_keyword: ['story breakdowns', 'brand narratives', 'storytelling analysis', 'brand storytelling'],
      canonical: '/categories/story-breakdowns',
    },
    {
      heading: 'Writing & Branding',
      tagline: 'CRAFT YOUR BRAND VOICE',
      subheading: 'SEO articles with guides, tips, and frameworks for effective writing and brand building.',
      image: '/uploads/category-writing-branding.jpg',
      altname: 'Writing & Branding - Brand Untold',
      img_title: 'Writing & Branding Category',
      metatitle: 'Writing & Branding | Guides & Tips for Brand Building - Brand Untold',
      meta_description: 'SEO articles with guides, tips, and frameworks for effective writing and brand building.',
      meta_keyword: ['writing tips', 'branding guide', 'brand voice', 'content strategy'],
      canonical: '/categories/writing--branding',
    },
  ]);

  // ─── 3f. Articles ─────────────────────────────────────────────────────────
  {
    const col = db.collection('articles');
    const count = await col.countDocuments();
    if (count > 0) {
      log('articles: already has records, skipping', 'warn');
    } else {
      // Map category names to IDs if we just created them
      const catIdMap = {};
      if (categoryIds.length > 0) {
        catIdMap['Founder Stories'] = categoryIds[0].toString();
        catIdMap['Story Breakdowns'] = categoryIds[1].toString();
        catIdMap['Writing & Branding'] = categoryIds[2].toString();
      } else {
        // Fetch existing categories
        const cats = await db.collection('category').find({}).toArray();
        for (const c of cats) {
          catIdMap[c.heading] = c._id.toString();
        }
      }

      const articles = [
        {
          title: 'How Airbnb Used Storytelling to Build Trust',
          slug: 'airbnb-storytelling-trust',
          description: 'A deep dive into how Airbnb transformed from a struggling startup to a household name through the power of authentic storytelling.',
          long_description: '<h2>The Airbnb Story</h2><p>When Brian Chesky and Joe Gebbia first listed their San Francisco apartment on a basic website in 2007, no one could have predicted what would follow. The concept — <strong>strangers sleeping in other strangers\' homes</strong> — sounded absurd to most investors.</p><p>But Airbnb didn\'t just survive. It became one of the most iconic brands of the 21st century. And the secret wasn\'t better technology or more marketing budget. It was <em>storytelling</em>.</p><h3>The Belong Anywhere Campaign</h3><p>In 2014, Airbnb launched "Belong Anywhere" — a campaign that shifted the narrative from accommodation to <strong>human connection</strong>. Instead of competing on price with hotels, they competed on meaning.</p><p>The campaign featured real stories from real hosts and guests. A grandmother in Paris opening her home. A family in Tokyo sharing local traditions. These weren\'t actors — they were real people with real stories.</p><h3>Why It Worked</h3><p>Airbnb understood something fundamental: <strong>people don\'t buy products, they buy stories</strong>. By making hosts the heroes of their narrative, they built trust at scale in a way that no amount of advertising could achieve.</p><p>The lesson for founders is clear: your brand story isn\'t about you. It\'s about the transformation you enable for others.</p>',
          image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80',
          altname: 'Airbnb storytelling case study',
          img_title: 'How Airbnb Used Storytelling to Build Trust',
          date: '2026-03-15',
          author: 'Jayshree Tiwari',
          author_bio: 'Co-Founder of Brand Untold. Writer, storyteller, and brand strategist.',
          category: catIdMap['Founder Stories'] || '',
          tagline: 'THE BUILDERS BEHIND THE BRANDS',
          metatitle: 'How Airbnb Used Storytelling to Build Trust - Brand Untold',
          meta_description: 'A deep dive into how Airbnb transformed from a struggling startup to a household name through the power of authentic storytelling.',
          meta_keyword: ['airbnb storytelling', 'brand trust', 'startup story', 'airbnb story'],
          canonical: '/articles/airbnb-storytelling-trust',
        },
        {
          title: 'The Origin Story of Patagonia',
          slug: 'patagonia-origin-story',
          description: 'From a small climbing equipment company to a global brand built on environmental activism and authentic values.',
          long_description: '<h2>Born from the Mountains</h2><p>Yvon Chouinard didn\'t set out to build a billion-dollar company. He set out to make better climbing gear for himself and his friends. That authenticity — <strong>building for passion, not profit</strong> — became the foundation of everything Patagonia stands for.</p><p>In the early 1970s, Chouinard realized his steel pitons were damaging the rock faces he loved. So he did something radical: he stopped selling his most profitable product and invented aluminum chockstones instead.</p><h3>The Anti-Growth Brand</h3><p>Patagonia\'s "Don\'t Buy This Jacket" campaign in 2011 was perhaps the most audacious brand story ever told. On Black Friday, they ran a full-page ad in The New York Times telling customers <em>not</em> to buy their products.</p><p>The result? Sales increased 30% that year. Because the story wasn\'t about the jacket — it was about <strong>values</strong>.</p><h3>Lessons for Founders</h3><p>Patagonia teaches us that the most powerful brand stories come from genuine conviction. You can\'t fake authenticity. But when your actions align with your story, customers don\'t just buy — they believe.</p>',
          image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80',
          altname: 'Patagonia origin story',
          img_title: 'The Origin Story of Patagonia',
          date: '2026-03-10',
          author: 'Jayshree Tiwari',
          author_bio: 'Co-Founder of Brand Untold. Writer, storyteller, and brand strategist.',
          category: catIdMap['Founder Stories'] || '',
          tagline: 'THE BUILDERS BEHIND THE BRANDS',
          metatitle: 'The Origin Story of Patagonia - Brand Untold',
          meta_description: 'From a small climbing equipment company to a global brand built on environmental activism and authentic values.',
          meta_keyword: ['patagonia story', 'yvon chouinard', 'brand values', 'sustainable brand'],
          canonical: '/articles/patagonia-origin-story',
        },
        {
          title: "The Hero's Journey in Modern Branding",
          slug: 'heros-journey-modern-branding',
          description: 'Understanding how ancient narrative structures apply to contemporary brand storytelling strategies.',
          long_description: '<h2>Ancient Wisdom, Modern Application</h2><p>Joseph Campbell\'s <strong>Hero\'s Journey</strong> — the monomyth — has been the backbone of storytelling for thousands of years. From Homer\'s Odyssey to Star Wars, the same pattern appears again and again.</p><p>But here\'s what most marketers miss: the Hero\'s Journey isn\'t just for movies. It\'s the most powerful framework for brand storytelling.</p><h3>Your Customer Is the Hero</h3><p>The biggest mistake brands make is positioning themselves as the hero. In reality, <strong>your customer is the hero. Your brand is the guide.</strong></p><p>Think about it like this:</p><ul><li><strong>The Hero (customer)</strong> has a problem</li><li><strong>The Guide (your brand)</strong> appears with a plan</li><li>The Guide calls the Hero to <strong>action</strong></li><li>The Hero achieves <strong>transformation</strong></li></ul><h3>Practical Application</h3><p>Every piece of content you create should answer these questions:</p><ol><li>Who is the hero? (Your specific customer)</li><li>What is their problem? (Not just external — internal and philosophical too)</li><li>How do you guide them? (Your unique approach)</li><li>What transformation do you enable?</li></ol><p>When you get this right, your brand story becomes <em>irresistible</em>.</p>',
          image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
          altname: 'Hero\'s Journey in branding',
          img_title: 'The Hero\'s Journey in Modern Branding',
          date: '2026-03-12',
          author: 'Jayshree Tiwari',
          author_bio: 'Co-Founder of Brand Untold. Writer, storyteller, and brand strategist.',
          category: catIdMap['Story Breakdowns'] || '',
          tagline: 'THE ANATOMY OF GREAT STORIES',
          metatitle: "The Hero's Journey in Modern Branding - Brand Untold",
          meta_description: 'Understanding how ancient narrative structures apply to contemporary brand storytelling strategies.',
          meta_keyword: ['hero journey branding', 'storytelling framework', 'brand narrative', 'joseph campbell'],
          canonical: '/articles/heros-journey-modern-branding',
        },
        {
          title: "How to Find Your Brand's Unique Voice",
          slug: 'find-brand-unique-voice',
          description: "A guide to discovering and articulating what makes your brand's communication distinctive.",
          long_description: '<h2>Why Brand Voice Matters</h2><p>In a crowded market, <strong>your voice is your differentiator</strong>. Products can be copied. Features can be replicated. But an authentic brand voice? That\'s impossible to fake.</p><p>Think about it: you can probably identify an Apple ad, a Nike campaign, or a Wendy\'s tweet without seeing the logo. That\'s the power of a distinct voice.</p><h3>The Voice Discovery Framework</h3><p>Finding your brand voice isn\'t about being clever or trendy. It\'s about being <em>authentically, consistently you</em>. Here\'s a framework that works:</p><h4>1. Start With Values</h4><p>List your top 3-5 brand values. Not aspirational ones — the ones that actually drive your decisions.</p><h4>2. Define Your Personality</h4><p>If your brand were a person at a dinner party, how would they talk? Would they be the storyteller, the expert, the rebel, the friend?</p><h4>3. Create a Voice Chart</h4><p>For each personality trait, define:</p><ul><li>What it sounds like (with examples)</li><li>What it does NOT sound like (equally important)</li><li>When to dial it up or down</li></ul><h4>4. Test Against Real Content</h4><p>Take your last 10 social posts, emails, or blog intros. Do they sound like the same person? If not, you have work to do.</p><h3>The Consistency Rule</h3><p>A great brand voice isn\'t one that\'s used sometimes. It\'s one that\'s used <strong>everywhere, consistently</strong>. From your homepage headline to your error page to your invoice email.</p>',
          image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80',
          altname: 'Finding your brand voice',
          img_title: 'How to Find Your Brand\'s Unique Voice',
          date: '2026-03-14',
          author: 'Jayshree Tiwari',
          author_bio: 'Co-Founder of Brand Untold. Writer, storyteller, and brand strategist.',
          category: catIdMap['Writing & Branding'] || '',
          tagline: 'CRAFT YOUR BRAND VOICE',
          metatitle: "How to Find Your Brand's Unique Voice - Brand Untold",
          meta_description: "A guide to discovering and articulating what makes your brand's communication distinctive.",
          meta_keyword: ['brand voice', 'brand identity', 'writing guide', 'brand communication'],
          canonical: '/articles/find-brand-unique-voice',
        },
        {
          title: "Sara Blakely's Journey with Spanx",
          slug: 'sara-blakely-spanx-journey',
          description: 'How a frustrated salesperson built a billion-dollar shapewear empire with $5,000 and relentless determination.',
          long_description: '<h2>The $5,000 Bet</h2><p>In 1998, Sara Blakely was a door-to-door fax machine salesperson earning $25,000 a year. She was frustrated, stuck, and looking for a way out.</p><p>Then one night, getting dressed for a party, she cut the feet off her pantyhose. That moment of frustration became a <strong>billion-dollar idea</strong>.</p><h3>Against All Odds</h3><p>With just $5,000 in savings, no fashion industry experience, and no connections, Sara spent two years developing Spanx. She wrote her own patent. She convinced a manufacturer to take a chance on her.</p><p>When she finally got a meeting with Neiman Marcus, she didn\'t show a PowerPoint deck. She <em>took the buyer into the bathroom and showed the product on herself</em>.</p><h3>The Power of Authentic Selling</h3><p>Sara\'s approach to building Spanx teaches founders three critical lessons:</p><ol><li><strong>Solve your own problem</strong> — The best products come from personal frustration</li><li><strong>Be willing to look foolish</strong> — Sara\'s bathroom demo was unconventional, but it was real</li><li><strong>Story sells better than specs</strong> — She never led with fabric technology. She led with how it made women feel</li></ol>',
          image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&q=80',
          altname: 'Sara Blakely Spanx founder story',
          img_title: 'Sara Blakely\'s Journey with Spanx',
          date: '2026-03-05',
          author: 'Jayshree Tiwari',
          author_bio: 'Co-Founder of Brand Untold. Writer, storyteller, and brand strategist.',
          category: catIdMap['Founder Stories'] || '',
          tagline: 'THE BUILDERS BEHIND THE BRANDS',
          metatitle: "Sara Blakely's Journey with Spanx - Brand Untold",
          meta_description: 'How a frustrated salesperson built a billion-dollar shapewear empire with $5,000 and relentless determination.',
          meta_keyword: ['sara blakely', 'spanx story', 'female founder', 'startup journey'],
          canonical: '/articles/sara-blakely-spanx-journey',
        },
        {
          title: 'Why Emotional Connection Beats Features',
          slug: 'emotional-connection-vs-features',
          description: 'The psychology behind why customers buy based on feelings rather than logical product comparisons.',
          long_description: '<h2>The Feeling Economy</h2><p>Here\'s a truth most brands ignore: <strong>people buy based on emotion and justify with logic</strong>. Study after study confirms this — from neuroscience research by Antonio Damasio to behavioral economics by Daniel Kahneman.</p><p>Yet most brands still lead with features. "Our product has 10 integrations." "We\'re 3x faster." "Free 14-day trial."</p><p>Features don\'t create loyalty. <em>Feelings do.</em></p><h3>The Emotional Hierarchy</h3><p>Not all emotional connections are created equal. Here\'s a framework for understanding the hierarchy:</p><ol><li><strong>Functional value</strong> — "It works" (table stakes)</li><li><strong>Emotional value</strong> — "It makes me feel good"</li><li><strong>Identity value</strong> — "It says something about who I am"</li><li><strong>Social value</strong> — "It connects me to a community"</li></ol><p>The higher you climb, the stronger the bond — and the harder it is for competitors to steal your customers.</p><h3>How to Build Emotional Connection</h3><p>Three practical tactics:</p><ul><li><strong>Tell origin stories</strong> — Share why you started, not just what you sell</li><li><strong>Show vulnerability</strong> — Admit mistakes, share struggles, be human</li><li><strong>Create shared meaning</strong> — Stand for something bigger than your product</li></ul>',
          image: 'https://images.unsplash.com/photo-1512758017271-d7b84c2113f1?w=800&q=80',
          altname: 'Emotional connection in branding',
          img_title: 'Why Emotional Connection Beats Features',
          date: '2026-03-08',
          author: 'Jayshree Tiwari',
          author_bio: 'Co-Founder of Brand Untold. Writer, storyteller, and brand strategist.',
          category: catIdMap['Story Breakdowns'] || '',
          tagline: 'THE ANATOMY OF GREAT STORIES',
          metatitle: 'Why Emotional Connection Beats Features - Brand Untold',
          meta_description: 'The psychology behind why customers buy based on feelings rather than logical product comparisons.',
          meta_keyword: ['emotional branding', 'customer psychology', 'brand loyalty', 'brand storytelling'],
          canonical: '/articles/emotional-connection-vs-features',
        },
        {
          title: 'Writing for SEO Without Losing Your Soul',
          slug: 'writing-seo-without-soul',
          description: 'Balancing search engine optimization with authentic, engaging content that humans actually want to read.',
          long_description: '<h2>The SEO vs. Soul Dilemma</h2><p>You\'ve probably read those articles. The ones that technically rank well but read like they were written by a robot trying to pass as human. Keyword-stuffed paragraphs. Awkward repetition. Zero personality.</p><p>Here\'s the good news: <strong>you don\'t have to choose between ranking and readability</strong>.</p><h3>The Human-First Framework</h3><p>Google\'s own guidelines increasingly reward content written for humans. Here\'s how to do SEO right:</p><h4>1. Write the Story First</h4><p>Draft your article as if SEO didn\'t exist. Focus on making it genuinely useful and interesting. Then optimize.</p><h4>2. Strategic Keyword Placement</h4><p>Place your target keyword in:</p><ul><li>The title (naturally)</li><li>The first 100 words</li><li>One H2 heading</li><li>The meta description</li></ul><p>That\'s it. Stop there.</p><h4>3. Earn Links Through Quality</h4><p>The best SEO strategy is writing something so good that people <em>want</em> to link to it. Original research, unique frameworks, and genuine expertise always win.</p><h4>4. Structure for Scanners</h4><p>Use headers, bullet points, and short paragraphs. Not because Google likes them — because <strong>readers</strong> like them.</p>',
          image: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&q=80',
          altname: 'Writing for SEO guide',
          img_title: 'Writing for SEO Without Losing Your Soul',
          date: '2026-03-09',
          author: 'Jayshree Tiwari',
          author_bio: 'Co-Founder of Brand Untold. Writer, storyteller, and brand strategist.',
          category: catIdMap['Writing & Branding'] || '',
          tagline: 'CRAFT YOUR BRAND VOICE',
          metatitle: 'Writing for SEO Without Losing Your Soul - Brand Untold',
          meta_description: 'Balancing search engine optimization with authentic, engaging content that humans actually want to read.',
          meta_keyword: ['SEO writing', 'content marketing', 'authentic content', 'writing tips'],
          canonical: '/articles/writing-seo-without-soul',
        },
      ];

      const docs = articles.map(a => ({ ...a, created_at: timestamp, updated_at: timestamp }));
      await col.insertMany(docs);
      log(`articles: seeded ${articles.length} articles`, 'success');
    }
  }

  // ─── 3g. Services ─────────────────────────────────────────────────────────
  await seedSingleRecord('services', {
    heading: 'Our Services',
    description: '<p>We help founders and brands tell stories that matter. From content strategy to editorial storytelling, we bring clarity and craft to your brand narrative.</p>',
    card_heading: [
      'Brand Storytelling',
      'Content Strategy',
      'Editorial Writing',
      'SEO Copywriting',
    ],
    cards_description: [
      'We craft authentic brand narratives that resonate with your audience and build lasting connections.',
      'Strategic content planning that aligns with your business goals and speaks to your ideal customer.',
      'Long-form editorial content that establishes thought leadership and builds trust.',
      'Search-optimized content that ranks well without sacrificing quality or authenticity.',
    ],
  });

  // ─── 3h. Footer ───────────────────────────────────────────────────────────
  await seedSingleRecord('footer', {
    description: 'A platform dedicated to uncovering the real stories behind brands and founders — the thinking, the risks, the turning points, and the craft of storytelling.',
    footerlogo: '/logo.png',
    altname: 'Brand Untold Logo',
    img_title: 'Brand Untold',
    facebook: 'https://facebook.com/branduntold',
    instagram: 'https://instagram.com/branduntold',
    twitter: 'https://x.com/branduntold',
    linkedin: 'https://linkedin.com/company/branduntold',
    email: 'branduntold@gmail.com',
    phone: '',
    address: 'India',
    map: '',
  });

  // ─── 3i. FAQ ──────────────────────────────────────────────────────────────
  await seedMultipleRecords('faq', [
    {
      question: 'What services does Brand Untold offer?',
      ans: '<p>We offer brand storytelling, content strategy, editorial writing, and SEO copywriting services. Each service is tailored to help founders and brands communicate their authentic story.</p>',
    },
    {
      question: 'How long does a typical project take?',
      ans: '<p>Project timelines vary based on scope. A single brand story typically takes 2-3 weeks, while a full content strategy can take 4-6 weeks. We always discuss timelines upfront during our initial consultation.</p>',
    },
    {
      question: 'Do you work with early-stage startups?',
      ans: '<p>Absolutely! We believe every brand has a story worth telling, regardless of stage. In fact, early-stage startups often benefit the most from getting their story right from the beginning.</p>',
    },
    {
      question: 'What industries do you work with?',
      ans: '<p>We work across industries — from tech startups and D2C brands to service businesses and personal brands. Our expertise is in storytelling, which transcends industry boundaries.</p>',
    },
    {
      question: 'How do I get started?',
      ans: '<p>Simply fill out the contact form on our Work With Me page, or email us at <strong>branduntold@gmail.com</strong>. We\'ll schedule a free discovery call to understand your needs and see if we\'re a good fit.</p>',
    },
  ]);

  // ─── 3j. Static Meta (SEO for pages) ──────────────────────────────────────
  await seedMultipleRecords('static_meta', [
    {
      slug: 'home',
      metatitle: 'Brand Untold | Real Stories Behind Great Brands',
      meta_description: 'Brand Untold is an editorial platform uncovering the real stories behind brands and founders — the thinking, the risks, the turning points, and the craft of authentic storytelling.',
      meta_keyword: ['brand stories', 'founder stories', 'storytelling platform', 'brand untold', 'startup stories'],
      schema: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Brand Untold',
        url: 'https://www.branduntold.in',
        description: 'An editorial platform uncovering the real stories behind brands and founders.',
        publisher: {
          '@type': 'Organization',
          name: 'Brand Untold',
          url: 'https://www.branduntold.in',
        },
      }),
      canonical: '/',
    },
    {
      slug: 'about',
      metatitle: 'About Brand Untold | Our Story & Mission',
      meta_description: 'Learn about Brand Untold — an editorial platform dedicated to uncovering the real stories behind brands and the craft of authentic storytelling.',
      meta_keyword: ['about brand untold', 'jayshree tiwari', 'brand storytelling', 'editorial platform'],
      schema: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'AboutPage',
        name: 'About Brand Untold',
        url: 'https://www.branduntold.in/about',
        description: 'Learn about Brand Untold and our passion for storytelling.',
      }),
      canonical: '/about',
    },
    {
      slug: 'work-with-me',
      metatitle: 'Work With Brand Untold | Storytelling & Content Services',
      meta_description: "Let's craft your brand's story together. Brand Untold offers brand storytelling, content strategy, editorial writing, and SEO copywriting services.",
      meta_keyword: ['work with us', 'brand storytelling services', 'content strategy', 'hire brand writer'],
      schema: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'ContactPage',
        name: 'Work With Brand Untold',
        url: 'https://www.branduntold.in/work-with-me',
        description: "Let's craft your brand's story together.",
      }),
      canonical: '/work-with-me',
    },
    {
      slug: 'privacy',
      metatitle: 'Privacy Policy | Brand Untold',
      meta_description: 'Privacy policy for Brand Untold. Learn how we collect, use, and protect your personal information.',
      meta_keyword: ['privacy policy', 'brand untold privacy'],
      schema: '',
      canonical: '/privacy',
    },
    {
      slug: 'terms',
      metatitle: 'Terms of Service | Brand Untold',
      meta_description: 'Terms of service for Brand Untold. Read our terms and conditions for using our platform.',
      meta_keyword: ['terms of service', 'brand untold terms'],
      schema: '',
      canonical: '/terms',
    },
  ]);

  // ═══════════════════════════════════════════════════════════════════════════
  // DONE
  // ═══════════════════════════════════════════════════════════════════════════
  console.log(`\n${colors.green}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.green}✅ Database seed completed successfully!${colors.reset}`);
  console.log(`${colors.green}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`
${colors.blue}Collections created:${colors.reset}
  • herosec         (Hero Section)
  • about_us        (About Page)
  • all_headings    (Section Headings)
  • heading         (Page Section Headings)
  • category        (Categories)
  • articles        (Blog Articles)
  • services        (Services)
  • footer          (Footer)
  • faq             (FAQ)
  • static_meta     (Static Page SEO)
  • contactus       (Contact Submissions)

${colors.blue}Admin Login:${colors.reset}
  Username: superadmin
  Password: admin123
  ⚠️  Change the password after first login!

${colors.yellow}Note:${colors.reset} Article images use Unsplash URLs. 
  Hero/about/category images use /uploads/ paths — 
  upload actual images via the admin panel to replace them.
`);

  await client.close();
}

// ─── Run ──────────────────────────────────────────────────────────────────────

seed().catch((err) => {
  console.error(`\n${colors.red}❌ Seed failed:${colors.reset}`, err);
  process.exit(1);
});
