const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://harshit:Harshit%40123@userinfo.lmbsytd.mongodb.net/jayshree_blogs";
const dbName = "jayshree_blogs";

async function checkCategories() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    const cats = await db.collection('category').find({}).toArray();
    console.log("=== Category collection ===");
    console.log(JSON.stringify(cats, null, 2));
  } finally {
    await client.close();
  }
}

checkCategories();
