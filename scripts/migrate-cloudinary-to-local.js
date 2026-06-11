/**
 * Migrate Cloudinary URLs to local /uploads/ paths in all MongoDB collections.
 *
 * This script scans every collection in the database, finds any field values
 * containing "res.cloudinary.com" URLs, extracts the filename, and replaces
 * the URL with "/uploads/<filename>".
 *
 * Usage:
 *   node scripts/migrate-cloudinary-to-local.js
 *
 * It uses .env.local for MONGODB_URI and MONGODB_DB.
 * Run with --dry-run to preview changes without writing.
 */

require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'jayshree_blogs';
const DRY_RUN = process.argv.includes('--dry-run');

if (!uri) {
  console.error('Missing MONGODB_URI. Set it in your .env.local before running.');
  process.exit(1);
}

/**
 * Recursively scan an object for Cloudinary URLs and replace them
 * with local /uploads/ paths. Returns true if any field was modified.
 */
function replaceCloudinaryUrls(obj, path = '') {
  let changed = false;

  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (typeof val === 'string' && val.includes('res.cloudinary.com')) {
      // Extract filename from Cloudinary URL
      // Typical format: https://res.cloudinary.com/<cloud>/image/upload/v<ts>/<folder>/<filename>
      const parts = val.split('/');
      const filename = parts[parts.length - 1]; // e.g. "1781115744703-laviub17jea.png"
      const newVal = `/uploads/${filename}`;
      console.log(`  ${path}${key}: ${val}`);
      console.log(`    → ${newVal}`);
      obj[key] = newVal;
      changed = true;
    } else if (val && typeof val === 'object' && !Array.isArray(val)) {
      if (replaceCloudinaryUrls(val, `${path}${key}.`)) {
        changed = true;
      }
    } else if (Array.isArray(val)) {
      for (let i = 0; i < val.length; i++) {
        if (typeof val[i] === 'string' && val[i].includes('res.cloudinary.com')) {
          const parts = val[i].split('/');
          const filename = parts[parts.length - 1];
          const newVal = `/uploads/${filename}`;
          console.log(`  ${path}${key}[${i}]: ${val[i]}`);
          console.log(`    → ${newVal}`);
          val[i] = newVal;
          changed = true;
        } else if (val[i] && typeof val[i] === 'object') {
          if (replaceCloudinaryUrls(val[i], `${path}${key}[${i}].`)) {
            changed = true;
          }
        }
      }
    }
  }

  return changed;
}

async function run() {
  console.log(`\n🔍 Connecting to MongoDB: ${dbName}`);
  if (DRY_RUN) console.log('⚠️  DRY RUN — no changes will be saved.\n');
  else console.log('');

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);

  // Get all collection names
  const collections = await db.listCollections().toArray();
  let totalUpdated = 0;

  for (const colInfo of collections) {
    const colName = colInfo.name;
    // Skip system collections
    if (colName.startsWith('system.')) continue;

    const col = db.collection(colName);
    const docs = await col.find({}).toArray();
    let collectionUpdates = 0;

    for (const doc of docs) {
      const docCopy = { ...doc };
      delete docCopy._id; // don't modify _id

      if (replaceCloudinaryUrls(docCopy)) {
        collectionUpdates++;
        if (!DRY_RUN) {
          await col.updateOne({ _id: doc._id }, { $set: docCopy });
        }
      }
    }

    if (collectionUpdates > 0) {
      console.log(`\n📦 ${colName}: ${collectionUpdates} document(s) updated`);
      totalUpdated += collectionUpdates;
    }
  }

  await client.close();

  console.log(`\n✅ Migration complete. ${totalUpdated} document(s) ${DRY_RUN ? 'would be' : 'were'} updated.`);
  if (DRY_RUN && totalUpdated > 0) {
    console.log('   Run without --dry-run to apply changes.');
  }
}

run().catch((err) => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
