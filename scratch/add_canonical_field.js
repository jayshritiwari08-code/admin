const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://harshit:Harshit%40123@userinfo.lmbsytd.mongodb.net/jayshree_blogs";
const dbName = "jayshree_blogs";

const collectionsToUpdate = [
  { name: 'articles', id: '6a0f2f6518153bfec723c162' },
  { name: 'category', id: '6a0f2f9418153bfec723c164' },
  { name: 'static_meta', id: '6a29a118161d75c7a97b3dc8' }
];

async function run() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    
    for (const col of collectionsToUpdate) {
      const existing = await db.collection('fields').findOne({
        collection_id: col.id,
        name: 'canonical'
      });
      
      if (existing) {
        console.log(`Field 'canonical' already exists for collection: ${col.name}`);
      } else {
        const newField = {
          collection_id: col.id,
          name: 'canonical',
          display_name: 'Canonical URL',
          field_type: 'Text',
          description: 'Custom canonical URL (optional)',
          is_required: false,
          is_unique: false,
          is_encrypted: false,
          validation_rules: [],
          default_value: null,
          field_order: 99,
          relation_to_collection: "",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        await db.collection('fields').insertOne(newField);
        console.log(`Successfully added 'canonical' field to collection: ${col.name}`);
      }
    }
  } catch (error) {
    console.error("Migration error:", error);
  } finally {
    await client.close();
  }
}

run();
