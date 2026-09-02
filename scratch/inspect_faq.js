const { MongoClient, ObjectId } = require('mongodb');

const uri = "mongodb+srv://harshit:Harshit%40123@userinfo.lmbsytd.mongodb.net/jayshree_blogs";
const dbName = "jayshree_blogs";

async function inspectFaq() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);

    console.log("=== Checking collection metadata ===");
    const colMeta = await db.collection('collections').findOne({ 
      $or: [
        { _id: new ObjectId("6a85bf3dc6ff1ee0018ff69b") },
        { name: "faq" }
      ]
    });
    console.log("Collection Meta:", colMeta);

    if (colMeta) {
      const fields = await db.collection('fields').find({ collection_id: colMeta._id.toString() }).toArray();
      console.log("Fields in this collection:", fields);
    }

    console.log("=== Checking 'faq' collection data ===");
    const existingFaqs = await db.collection('faq').find({}).toArray();
    console.log("Existing FAQs in db.collection('faq'):", existingFaqs.length);
    console.log(JSON.stringify(existingFaqs, null, 2));

    // Also check if data is in a generic 'records' or 'data' collection
    const genericRecords = await db.collection('records').find({ collection_id: "6a85bf3dc6ff1ee0018ff69b" }).toArray();
    console.log("Generic records count (if any):", genericRecords.length);

  } finally {
    await client.close();
  }
}

inspectFaq();
