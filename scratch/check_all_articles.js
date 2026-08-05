const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://harshit:Harshit%40123@userinfo.lmbsytd.mongodb.net/jayshree_blogs";
const dbName = "jayshree_blogs";

async function checkArticles() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    const docs = await db.collection('articles').find({}).toArray();
    docs.forEach(doc => {
      console.log(`Slug: ${doc.slug}`);
      console.log(`  Title: ${doc.title}`);
      console.log(`  MetaTitle: ${doc.metatitle}`);
      console.log(`  MetaDescription: ${doc.meta_description}`);
      console.log('---');
    });
  } finally {
    await client.close();
  }
}

checkArticles();
