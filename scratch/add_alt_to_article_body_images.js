const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://harshit:Harshit%40123@userinfo.lmbsytd.mongodb.net/jayshree_blogs";
const dbName = "jayshree_blogs";

async function addAltToArticleBodyImages() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    const articles = await db.collection('articles').find({}).toArray();

    for (const a of articles) {
      if (!a.long_description) continue;
      
      let html = a.long_description;
      let count = 0;
      
      // Replace images missing alt or with generic class
      html = html.replace(/<img\b([^>]*?)>/gi, (match, attrs) => {
        count++;
        let newAttrs = attrs;
        
        // Ensure alt
        if (!newAttrs.includes('alt=')) {
          const altText = `${a.title} — Brand Untold editorial visual ${count}`;
          newAttrs += ` alt="${altText}"`;
        }
        
        // Ensure title
        if (!newAttrs.includes('title=')) {
          const titleText = `${a.title} — Image ${count}`;
          newAttrs += ` title="${titleText}"`;
        }

        return `<img${newAttrs}>`;
      });

      if (count > 0) {
        await db.collection('articles').updateOne(
          { _id: a._id },
          { $set: { long_description: html } }
        );
        console.log(`Updated article "${a.title}": added alt/title to ${count} images.`);
      }
    }
    
    console.log("All article body images updated successfully!");
  } finally {
    await client.close();
  }
}

addAltToArticleBodyImages();
