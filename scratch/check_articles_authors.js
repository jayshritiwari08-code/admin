const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://harshit:Harshit%40123@userinfo.lmbsytd.mongodb.net/jayshree_blogs";
const dbName = "jayshree_blogs";

async function checkArticles() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    const articles = await db.collection('articles').find({}).project({ title: 1, slug: 1, author: 1, metatitle: 1, meta_description: 1, canonical: 1 }).toArray();
    console.log("=== Articles in DB ===");
    console.log(JSON.stringify(articles, null, 2));
  } finally {
    await client.close();
  }
}

checkArticles();
