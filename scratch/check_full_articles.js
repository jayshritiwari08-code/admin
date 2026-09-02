const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://harshit:Harshit%40123@userinfo.lmbsytd.mongodb.net/jayshree_blogs";
const dbName = "jayshree_blogs";

async function checkAllArticles() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    const articles = await db.collection('articles').find({}).toArray();
    for (const a of articles) {
      console.log(`\n=== Article: ${a.title} ===`);
      console.log(`Slug: ${a.slug}`);
      console.log(`Tagline: ${a.tagline}`);
      console.log(`Author: ${a.author}`);
      console.log(`Image:`, a.image);
      console.log(`Alt: ${a.altname}`);
      console.log(`Img Title: ${a.img_title}`);
      console.log(`Meta Title: ${a.metatitle}`);
      console.log(`Meta Desc: ${a.meta_description}`);
      console.log(`Canonical: ${a.canonical}`);
    }
  } finally {
    await client.close();
  }
}

checkAllArticles();
