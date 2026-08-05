const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://harshit:Harshit%40123@userinfo.lmbsytd.mongodb.net/jayshree_blogs";
const dbName = "jayshree_blogs";

async function runUpdate() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log("Connected to MongoDB!");
    const db = client.db(dbName);
    
    // 1. Update Footer email
    const footerRes = await db.collection('footer').updateMany(
      {},
      { $set: { email: 'branduntold@gmail.com' } }
    );
    console.log(`Updated footer email: ${footerRes.modifiedCount} docs`);
    
    // 2. Update herosec heading grammar
    const heroRes = await db.collection('herosec').updateMany(
      { heading: /Every Brands/i },
      { $set: { heading: 'The Story Behind Every Brand' } }
    );
    console.log(`Updated herosec heading: ${heroRes.modifiedCount} docs`);
    
    // 3. Update about_us content
    const newParagraph = 'There were no formal meetings, no rigid agendas, no hierarchy deciding whose voice mattered more. Just two minds exchanging ideas with sincerity — questioning without ego, disagreeing without dismissing, building something meaningful from a distance. Somewhere along the journey, Brand Untold was born.';
    const aboutUsDocs = await db.collection('about_us').find({}).toArray();
    for (const doc of aboutUsDocs) {
      const updateFields = { description2: newParagraph };
      
      // If short_description contains the raw /work-with-me link text, replace it
      if (doc.short_description && doc.short_description.includes('/work-with-me</a>')) {
        updateFields.short_description = doc.short_description.replace(
          />\/work-with-me<\/a>/g,
          '>Work With Us →</a>'
        );
      }
      
      await db.collection('about_us').updateOne(
        { _id: doc._id },
        { $set: updateFields }
      );
      console.log(`Updated about_us document: ${doc._id}`);
    }

    // 4. Update static metadata in the database
    await db.collection('static_meta').updateOne(
      { slug: 'home' },
      { 
        $set: { 
          metatitle: 'Brand Untold | The Story Behind Every Indian Brand',
          meta_description: 'Brand Untold explores the real decisions, struggles, and human moments behind Indian brands and founders — written for people who think beyond the highlight reel.'
        } 
      },
      { upsert: true }
    );
    await db.collection('static_meta').updateOne(
      { slug: 'about' },
      { 
        $set: { 
          metatitle: 'About | Brand Untold',
          meta_description: 'Brand Untold is an Indian editorial platform telling the untold stories of founders, creators, and brands — the thinking behind the decisions, before the success was obvious.'
        } 
      },
      { upsert: true }
    );
    console.log("Updated static_meta collection");

  } catch (error) {
    console.error("Error running database update:", error);
  } finally {
    await client.close();
  }
}

runUpdate();
