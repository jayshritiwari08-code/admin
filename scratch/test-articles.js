const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://harshit:Harshit%40123@userinfo.lmbsytd.mongodb.net/jayshree_blogs";

async function run() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db("jayshree_blogs");
    const articles = await db.collection("articles").find({}).limit(5).toArray();
    console.log("Articles count:", articles.length);
    articles.forEach((a, i) => {
      console.log(`Article ${i}:`, {
        id: a._id.toString(),
        title: a.title,
        tagline: a.tagline,
        category: a.category,
      });
    });
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.close();
  }
}

run();
