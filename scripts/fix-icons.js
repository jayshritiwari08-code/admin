require('dotenv').config({ path: '.env' });
const { MongoClient } = require('mongodb');

(async () => {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db(process.env.MONGODB_DB || 'jayshree_blogs');

  const iconMap = {
    'herosec': '🌟',
    'about_us': 'ℹ️',
    'all_headings': '📝',
    'heading': '📝',
    'category': '📂',
    'articles': '📚',
    'services': '⚙️',
    'footer': '📌',
    'faq': '❓',
    'static_meta': '🔍',
    'contactus': '✉️',
  };

  for (const [name, icon] of Object.entries(iconMap)) {
    const r = await db.collection('collections').updateOne(
      { name },
      { $set: { icon } }
    );
    console.log(`${name}: ${r.modifiedCount ? 'updated ✓' : 'already set'}`);
  }

  await client.close();
  console.log('\n✅ All collection icons updated to emojis!');
})();
