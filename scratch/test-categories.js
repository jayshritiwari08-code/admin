const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://harshit:Harshit%40123@userinfo.lmbsytd.mongodb.net/jayshree_blogs";

async function run() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db("jayshree_blogs");
    const categories = await db.collection("category").find({}).toArray();
    console.log("Categories:");
    categories.forEach(c => {
      console.log({
        id: c._id.toString(),
        heading: c.heading,
        tagline: c.tagline,
      });
    });
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.close();
  }
}

run();
