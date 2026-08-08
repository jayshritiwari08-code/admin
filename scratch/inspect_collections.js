const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://harshit:Harshit%40123@userinfo.lmbsytd.mongodb.net/jayshree_blogs";
const dbName = "jayshree_blogs";

async function run() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    
    console.log("=== Collections ===");
    const collections = await db.collection('collections').find({}).toArray();
    for (const col of collections) {
      console.log(`Collection: ${col.name} (ID: ${col._id})`);
      const fields = await db.collection('fields').find({ collection_id: col._id.toString() }).toArray();
      console.log("Fields:");
      for (const field of fields) {
        console.log(` - ${field.name} (${field.field_type}): ${field.display_name}`);
      }
      console.log("------------------------");
    }
  } finally {
    await client.close();
  }
}

run();
