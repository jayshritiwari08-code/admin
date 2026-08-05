const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://harshit:Harshit%40123@userinfo.lmbsytd.mongodb.net/jayshree_blogs";
const dbName = "jayshree_blogs";

async function searchDb() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    const collections = await db.listCollections().toArray();
    for (const col of collections) {
      const colName = col.name;
      const docs = await db.collection(colName).find({}).toArray();
      const stringified = JSON.stringify(docs);
      if (stringified.includes('/work-with-me')) {
        console.log(`Found '/work-with-me' in collection: ${colName}`);
        // Print matching docs
        docs.forEach(doc => {
          if (JSON.stringify(doc).includes('/work-with-me')) {
            console.log("Matching doc ID:", doc._id || doc.id);
            console.log(JSON.stringify(doc, null, 2));
          }
        });
      }
    }
  } finally {
    await client.close();
  }
}

searchDb();
