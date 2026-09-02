const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://harshit:Harshit%40123@userinfo.lmbsytd.mongodb.net/jayshree_blogs";
const dbName = "jayshree_blogs";

async function checkStaticMeta() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    const metas = await db.collection('static_meta').find({}).toArray();
    console.log("=== static_meta collection ===");
    console.log(JSON.stringify(metas, null, 2));
  } finally {
    await client.close();
  }
}

checkStaticMeta();
