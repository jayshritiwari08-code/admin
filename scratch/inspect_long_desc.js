const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://harshit:Harshit%40123@userinfo.lmbsytd.mongodb.net/jayshree_blogs";
const dbName = "jayshree_blogs";

async function inspectLongDescription() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    const articles = await db.collection('articles').find({}).toArray();

    for (const a of articles) {
      console.log(`\n======================================================`);
      console.log(`Slug: ${a.slug}`);
      const html = a.long_description || a.description || '';
      console.log(`HTML Length: ${html.length}`);
      
      const tables = html.match(/<table[\s\S]*?<\/table>/gi) || [];
      const imgs = html.match(/<img[\s\S]*?>/gi) || [];
      const pres = html.match(/<pre[\s\S]*?<\/pre>/gi) || [];
      const iframes = html.match(/<iframe[\s\S]*?<\/iframe>/gi) || [];
      const inlineWidths = html.match(/style=["'][^"']*width:\s*\d+px[^"']*["']/gi) || [];
      
      console.log(`Tables count: ${tables.length}`);
      console.log(`Images count: ${imgs.length}`);
      if (imgs.length > 0) {
        console.log(`Image tags in long_description:`, imgs);
      }
      console.log(`Pre/Code count: ${pres.length}`);
      console.log(`Iframes count: ${iframes.length}`);
      console.log(`Fixed px widths count: ${inlineWidths.length}`);
      if (inlineWidths.length > 0) {
        console.log(`Fixed width samples:`, inlineWidths);
      }
    }
  } finally {
    await client.close();
  }
}

inspectLongDescription();
