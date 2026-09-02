const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://harshit:Harshit%40123@userinfo.lmbsytd.mongodb.net/jayshree_blogs";
const dbName = "jayshree_blogs";

async function checkUnbrokenStrings() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    const articles = await db.collection('articles').find({}).toArray();

    for (const a of articles) {
      console.log(`\n======================================================`);
      console.log(`Slug: ${a.slug}`);
      const html = a.long_description || a.description || '';
      
      // Look for any long text words (> 30 chars without space)
      const textOnly = html.replace(/<[^>]*>/g, ' ');
      const words = textOnly.split(/\s+/);
      const longWords = words.filter(w => w.length > 30);
      console.log(`Long unbroken words count: ${longWords.length}`);
      if (longWords.length > 0) {
        console.log(`Sample long words:`, longWords.slice(0, 10));
      }

      // Check all style attributes in HTML
      const styleMatches = html.match(/style=["'][^"']*["']/gi) || [];
      console.log(`Inline style attributes count: ${styleMatches.length}`);
      const suspiciousStyles = styleMatches.filter(s => s.includes('width') || s.includes('margin') || s.includes('padding') || s.includes('font-size'));
      console.log(`Suspicious inline styles:`, suspiciousStyles.slice(0, 10));
    }
  } finally {
    await client.close();
  }
}

checkUnbrokenStrings();
