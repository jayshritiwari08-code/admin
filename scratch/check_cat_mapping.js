const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://harshit:Harshit%40123@userinfo.lmbsytd.mongodb.net/jayshree_blogs";
const dbName = "jayshree_blogs";

async function checkCategoriesAndArticles() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    const cats = await db.collection('category').find({}).toArray();
    console.log("=== Categories ===");
    for (const c of cats) {
      console.log(`ID: ${c._id.toString()} | Heading: ${c.heading}`);
    }

    const articles = await db.collection('articles').find({}).toArray();
    console.log("\n=== Articles ===");
    for (const a of articles) {
      console.log(`Title: ${a.title.slice(0, 40)}... | Category ID: ${a.category} | Slug: ${a.slug}`);
    }
  } finally {
    await client.close();
  }
}

checkCategoriesAndArticles();
