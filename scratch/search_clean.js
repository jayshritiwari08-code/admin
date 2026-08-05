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
      const docs = await db.collection(col.name).find({}).toArray();
      docs.forEach(doc => {
        const str = JSON.stringify(doc);
        if (str.includes('/work-with-me') && !str.includes('image') && !str.includes('altname')) {
          console.log(`Found in col: ${col.name}, Doc ID: ${doc._id || doc.id}`);
          Object.keys(doc).forEach(k => {
            if (String(doc[k]).includes('/work-with-me')) {
              console.log(`  Key [${k}]: ${doc[k]}`);
            }
          });
        }
      });
    }
  } finally {
    await client.close();
  }
}

searchDb();
