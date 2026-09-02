const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://harshit:Harshit%40123@userinfo.lmbsytd.mongodb.net/jayshree_blogs";
const dbName = "jayshree_blogs";

async function checkSlugsInDb() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    
    const collections = await db.listCollections().toArray();
    for (const col of collections) {
      const docs = await db.collection(col.name).find({ slug: { $exists: true } }).toArray();
      if (docs.length > 0) {
        console.log(`\n=== Collection: ${col.name} (${docs.length} docs with slug) ===`);
        for (const doc of docs) {
          console.log(`- Title/Name: "${doc.title || doc.name || doc.heading || '(none)'}" | Category: "${doc.category || '(none)'}" | Slug: "${doc.slug}"`);
        }
      }
    }
  } finally {
    await client.close();
  }
}

checkSlugsInDb();
