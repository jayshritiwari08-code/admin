const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://harshit:Harshit%40123@userinfo.lmbsytd.mongodb.net/jayshree_blogs";
const dbName = "jayshree_blogs";

async function inspectArticleKeys() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    const zakir = await db.collection('articles').findOne({ slug: "zakir-khan-doesnt-inspire-you-and-thats-exactly-why-you-love-him" });
    console.log("=== All keys in Zakir Khan article ===");
    console.log(Object.keys(zakir));
    for (const k of Object.keys(zakir)) {
      if (typeof zakir[k] === 'string' && zakir[k].length > 100) {
        console.log(`Field [${k}] (length: ${zakir[k].length}):`, zakir[k].slice(0, 200));
      } else {
        console.log(`Field [${k}]:`, zakir[k]);
      }
    }
  } finally {
    await client.close();
  }
}

inspectArticleKeys();
