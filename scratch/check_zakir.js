const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://harshit:Harshit%40123@userinfo.lmbsytd.mongodb.net/jayshree_blogs";
const dbName = "jayshree_blogs";

async function checkArticleDetails() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    const zakir = await db.collection('articles').findOne({ slug: "zakir-khan-doesnt-inspire-you-and-thats-exactly-why-you-love-him" });
    console.log("=== Zakir Khan Article ===");
    console.log(JSON.stringify(zakir, null, 2));
  } finally {
    await client.close();
  }
}

checkArticleDetails();
