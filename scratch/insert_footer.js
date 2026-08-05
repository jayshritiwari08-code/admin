const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://harshit:Harshit%40123@userinfo.lmbsytd.mongodb.net/jayshree_blogs";
const dbName = "jayshree_blogs";

async function seedFooter() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log("Connected to MongoDB!");
    const db = client.db(dbName);
    
    // Check if there is already a footer doc
    const existing = await db.collection('footer').findOne({});
    if (existing) {
      console.log("Existing footer document found:", existing);
      // Update it
      await db.collection('footer').updateOne(
        { _id: existing._id },
        { 
          $set: { 
            email: 'branduntold@gmail.com',
            address: 'India',
            description: 'A platform dedicated to uncovering the real stories behind brands and founders — the thinking, the risks, the turning points, and the craft of storytelling.'
          } 
        }
      );
      console.log("Updated existing footer document.");
    } else {
      console.log("No footer document found. Creating a default one...");
      // Insert default footer document
      const defaultFooter = {
        email: 'branduntold@gmail.com',
        phone: '+91 99999 99999',
        address: 'India',
        description: 'A platform dedicated to uncovering the real stories behind brands and founders — the thinking, the risks, the turning points, and the craft of storytelling.',
        instagram: 'https://instagram.com/branduntold.in',
        linkedin: 'https://linkedin.com/company/brand-untold',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      const res = await db.collection('footer').insertOne(defaultFooter);
      console.log("Created default footer document with ID:", res.insertedId);
    }
  } finally {
    await client.close();
  }
}

seedFooter();
