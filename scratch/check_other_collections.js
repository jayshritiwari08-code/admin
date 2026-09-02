const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://harshit:Harshit%40123@userinfo.lmbsytd.mongodb.net/jayshree_blogs";
const dbName = "jayshree_blogs";

async function checkOtherCollections() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    
    console.log("=== About Us ===");
    console.log(JSON.stringify(await db.collection('about_us').find({}).toArray(), null, 2));

    console.log("\n=== Hero Section ===");
    console.log(JSON.stringify(await db.collection('herosec').find({}).toArray(), null, 2));

    console.log("\n=== All Headings ===");
    console.log(JSON.stringify(await db.collection('all_headings').find({}).toArray(), null, 2));

    console.log("\n=== Footer ===");
    console.log(JSON.stringify(await db.collection('footer').find({}).toArray(), null, 2));

  } finally {
    await client.close();
  }
}

checkOtherCollections();
