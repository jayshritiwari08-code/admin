const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://harshit:Harshit%40123@userinfo.lmbsytd.mongodb.net/jayshree_blogs";
const dbName = "jayshree_blogs";

async function run() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    const field = await db.collection('fields').findOne({});
    console.log("Field doc structure:", JSON.stringify(field, null, 2));
  } finally {
    await client.close();
  }
}

run();
