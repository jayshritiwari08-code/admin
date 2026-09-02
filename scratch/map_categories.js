const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://harshit:Harshit%40123@userinfo.lmbsytd.mongodb.net/jayshree_blogs";
const dbName = "jayshree_blogs";

async function mapCategories() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    
    // Founder Stories: Akhil Kaimal & Neerupama Vadera
    await db.collection('articles').updateOne(
      { slug: "he-never-let-the-first-rejection-be-the-end-of-the-story" },
      { $set: { category: "6a85bf3ec6ff1ee0018ff6b3" } }
    );
    await db.collection('articles').updateOne(
      { slug: "when-you-light-a-lantern-for-others-your-own-life-brightens-dr-daisaku-ikeda" },
      { $set: { category: "6a85bf3ec6ff1ee0018ff6b3" } }
    );
    
    // Story Breakdowns: Zakir Khan
    await db.collection('articles').updateOne(
      { slug: "zakir-khan-doesnt-inspire-you-and-thats-exactly-why-you-love-him" },
      { $set: { category: "6a85bf3ec6ff1ee0018ff6b4" } }
    );

    // Writing & Branding: How to Find Your Brand Voice
    await db.collection('articles').updateOne(
      { slug: "how-to-find-your-brand-voice-and-why-most-brands-never-do" },
      { $set: { category: "6a85bf3ec6ff1ee0018ff6b5" } }
    );

    console.log("Categories mapped across all categories successfully!");
  } finally {
    await client.close();
  }
}

mapCategories();
