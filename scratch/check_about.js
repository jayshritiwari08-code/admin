const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://harshit:Harshit%40123@userinfo.lmbsytd.mongodb.net/jayshree_blogs";
const dbName = "jayshree_blogs";

async function checkAboutUs() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    const docs = await db.collection('about_us').find({}).toArray();
    console.log(JSON.stringify(docs, null, 2));
  } finally {
    await client.close();
  }
}

checkAboutUs();
