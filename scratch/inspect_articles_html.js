const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://harshit:Harshit%40123@userinfo.lmbsytd.mongodb.net/jayshree_blogs";
const dbName = "jayshree_blogs";

async function inspectArticlesHtml() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    const articles = await db.collection('articles').find({}).toArray();

    for (const a of articles) {
      console.log(`\n======================================================`);
      console.log(`Slug: ${a.slug}`);
      console.log(`HTML Length: ${(a.description || '').length}`);
      
      const html = a.description || '';
      
      // Check for elements that might cause horizontal overflow
      const tables = html.match(/<table[\s\S]*?<\/table>/gi) || [];
      const pres = html.match(/<pre[\s\S]*?<\/pre>/gi) || [];
      const iframes = html.match(/<iframe[\s\S]*?<\/iframe>/gi) || [];
      const inlineWidths = html.match(/style=["'][^"']*width:\s*\d+px[^"']*["']/gi) || [];
      
      console.log(`Tables count: ${tables.length}`);
      console.log(`Pre/Code count: ${pres.length}`);
      console.log(`Iframes count: ${iframes.length}`);
      console.log(`Fixed px widths count: ${inlineWidths.length}`);
      if (inlineWidths.length > 0) {
        console.log(`Fixed width samples:`, inlineWidths.slice(0, 5));
      }
      
      // Check first 500 chars of HTML
      console.log(`HTML snippet:`, html.slice(0, 300));
    }
  } finally {
    await client.close();
  }
}

inspectArticlesHtml();
