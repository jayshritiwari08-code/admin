const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://harshit:Harshit%40123@userinfo.lmbsytd.mongodb.net/jayshree_blogs";
const dbName = "jayshree_blogs";

async function checkArticleFields() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    const doc = await db.collection('articles').findOne({});
    console.log("Article Document:", JSON.stringify(doc, null, 2));
  } finally {
    await client.close();
  }
}

checkArticleFields();
