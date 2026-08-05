const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://harshit:Harshit%40123@userinfo.lmbsytd.mongodb.net/jayshree_blogs";
const dbName = "jayshree_blogs";

async function checkCategory() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    const doc = await db.collection('category').findOne({});
    console.log("Category Document in 'category' collection:", JSON.stringify(doc, null, 2));
  } finally {
    await client.close();
  }
}

checkCategory();
