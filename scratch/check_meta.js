const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://harshit:Harshit%40123@userinfo.lmbsytd.mongodb.net/jayshree_blogs";
const dbName = "jayshree_blogs";

async function checkMetadata() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    
    // Find collection named 'footer' in 'collections'
    const meta = await db.collection('collections').findOne({ name: 'footer' });
    console.log("Footer collection metadata in 'collections':", meta);
  } finally {
    await client.close();
  }
}

checkMetadata();
