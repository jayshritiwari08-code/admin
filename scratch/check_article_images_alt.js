const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://harshit:Harshit%40123@userinfo.lmbsytd.mongodb.net/jayshree_blogs";
const dbName = "jayshree_blogs";

async function checkArticleDescriptionImages() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    const articles = await db.collection('articles').find({}).toArray();
    
    console.log(`Found ${articles.length} articles.\n`);

    for (const a of articles) {
      console.log(`=======================================================`);
      console.log(`Article: ${a.title}`);
      console.log(`Slug: ${a.slug}`);
      console.log(`Cover Image Alt: "${a.altname || ''}"`);
      console.log(`Cover Image Title: "${a.img_title || ''}"`);
      
      const html = a.description || '';
      const imgRegex = /<img\b([^>]*?)>/gi;
      let match;
      let imgCount = 0;
      
      while ((match = imgRegex.exec(html)) !== null) {
        imgCount++;
        const imgTag = match[0];
        const attributes = match[1];
        
        const srcMatch = attributes.match(/\bsrc=["']([^"']+)["']/i);
        const altMatch = attributes.match(/\balt=["']([^"']*)["']/i);
        const titleMatch = attributes.match(/\btitle=["']([^"']*)["']/i);
        
        const src = srcMatch ? srcMatch[1] : '(no src)';
        const alt = altMatch ? altMatch[1] : null;
        const title = titleMatch ? titleMatch[1] : null;
        
        console.log(`\n  [Image #${imgCount} in description]`);
        console.log(`  Full Tag: ${imgTag}`);
        console.log(`  Src: ${src}`);
        console.log(`  Alt attribute present?: ${altMatch !== null ? 'YES' : 'NO'}`);
        console.log(`  Alt value: ${alt !== null ? `"${alt}"` : '(missing)'}`);
        console.log(`  Title value: ${title !== null ? `"${title}"` : '(missing)'}`);
      }
      
      if (imgCount === 0) {
        console.log(`  -> No <img> tags found inside description HTML.`);
      }
      console.log(`=======================================================\n`);
    }
  } finally {
    await client.close();
  }
}

checkArticleDescriptionImages();
