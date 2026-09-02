const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://harshit:Harshit%40123@userinfo.lmbsytd.mongodb.net/jayshree_blogs";
const dbName = "jayshree_blogs";

async function updateSeoAndContent() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log("Connected to MongoDB:", dbName);
    const db = client.db(dbName);
    const now = new Date().toISOString();

    // 1. Update static_meta
    console.log("Updating static_meta...");
    await db.collection('static_meta').updateOne(
      { slug: "home" },
      {
        $set: {
          metatitle: "Brand Untold | The Story Behind Every Indian Brand",
          meta_description: "Brand Untold explores the real decisions, struggles, and human moments behind Indian brands and founders — written for people who think beyond the highlight reel.",
          canonical: "/",
          updated_at: now
        }
      },
      { upsert: true }
    );

    await db.collection('static_meta').updateOne(
      { slug: "about" },
      {
        $set: {
          metatitle: "About Brand Untold | The Story Behind the Platform",
          meta_description: "Brand Untold is an Indian editorial platform telling the untold stories of founders, creators, and brands — the decisions, the doubts, and the human moments that shaped everything.",
          canonical: "/about",
          updated_at: now
        }
      },
      { upsert: true }
    );

    await db.collection('static_meta').updateOne(
      { slug: "work-with-me" },
      {
        $set: {
          metatitle: "Work With Us | Brand Untold",
          meta_description: "Let's craft your brand's story together. Brand Untold offers brand storytelling, content strategy, editorial writing, and SEO copywriting services.",
          canonical: "/work-with-me",
          updated_at: now
        }
      },
      { upsert: true }
    );

    // 2. Update category canonicals and meta
    console.log("Updating categories...");
    await db.collection('category').updateOne(
      { heading: "Founder Stories" },
      {
        $set: {
          metatitle: "Founder Stories | Real Stories of Founders & Brands - Brand Untold",
          meta_description: "Read real stories of founders and brands that built something meaningful through vision, persistence, and authentic storytelling.",
          canonical: "/categories/founder-stories",
          altname: "Founder Stories - Brand Untold",
          img_title: "Founder Stories Category",
          updated_at: now
        }
      }
    );

    await db.collection('category').updateOne(
      { heading: "Story Breakdowns" },
      {
        $set: {
          metatitle: "Story Breakdowns | The Anatomy of Great Stories - Brand Untold",
          meta_description: "Analytical articles explaining why certain stories work and how to craft compelling narratives for your brand.",
          canonical: "/categories/story-breakdowns",
          altname: "Story Breakdowns - Brand Untold",
          img_title: "Story Breakdowns Category",
          updated_at: now
        }
      }
    );

    await db.collection('category').updateOne(
      { heading: "Writing & Branding" },
      {
        $set: {
          metatitle: "Writing & Branding | Guides & Tips for Brand Building - Brand Untold",
          meta_description: "SEO articles with guides, tips, and frameworks for effective writing and brand building.",
          canonical: "/categories/writing-branding",
          altname: "Writing & Branding - Brand Untold",
          img_title: "Writing & Branding Category",
          updated_at: now
        }
      }
    );

    // 3. Update articles metadata, canonicals, alt text and authors
    console.log("Updating articles...");
    await db.collection('articles').updateOne(
      { slug: "zakir-khan-doesnt-inspire-you-and-thats-exactly-why-you-love-him" },
      {
        $set: {
          metatitle: "Zakir Khan: Why India Loves the Man Behind the Mic | Brand Untold",
          meta_description: "Zakir Khan doesn't inspire you — and that's exactly why you love him. Exploring the vulnerability, storytelling craft, and human connection behind India's favourite comic.",
          altname: "Zakir Khan performing stand-up comedy on stage — Brand Untold editorial story on storytelling and vulnerability",
          img_title: "Zakir Khan — Brand Untold",
          tagline: "The Art of Being Vulnerable",
          canonical: "/articles/zakir-khan-doesnt-inspire-you-and-thats-exactly-why-you-love-him",
          author: "Jayshri Tiwari, Co-Founder and Editor of Brand Untold",
          updated_at: now
        }
      }
    );

    await db.collection('articles').updateOne(
      { slug: "he-never-let-the-first-rejection-be-the-end-of-the-story" },
      {
        $set: {
          canonical: "/articles/he-never-let-the-first-rejection-be-the-end-of-the-story",
          altname: "Akhil Kaimal as Ashwin in Sapne vs Everyone — Brand Untold founder and actor journey",
          img_title: "Akhil Kaimal — Brand Untold",
          author: "Jayshri Tiwari, Co-Founder and Editor of Brand Untold",
          updated_at: now
        }
      }
    );

    await db.collection('articles').updateOne(
      { slug: "when-you-light-a-lantern-for-others-your-own-life-brightens-dr-daisaku-ikeda" },
      {
        $set: {
          canonical: "/articles/when-you-light-a-lantern-for-others-your-own-life-brightens-dr-daisaku-ikeda",
          altname: "Neerupama Vadera, actor and theatre practitioner — Brand Untold story on compassion and storytelling",
          img_title: "Neerupama Vadera — When You Light a Lantern for Others",
          author: "Jayshri Tiwari, Co-Founder and Editor of Brand Untold",
          updated_at: now
        }
      }
    );

    await db.collection('articles').updateOne(
      { slug: "how-to-find-your-brand-voice-and-why-most-brands-never-do" },
      {
        $set: {
          canonical: "/articles/how-to-find-your-brand-voice-and-why-most-brands-never-do",
          author: "Jayshri Tiwari, Co-Founder and Editor of Brand Untold",
          updated_at: now
        }
      }
    );

    // 4. Update herosec
    console.log("Updating herosec...");
    await db.collection('herosec').updateOne(
      {},
      {
        $set: {
          tagline: "The Story Behind Every Brand",
          heading: "The Story Behind Every Brand",
          altname: "Brand Untold - Stories that shape brands",
          img_title: "Brand Untold Hero Image",
          updated_at: now
        }
      }
    );

    // 5. Update about_us alt and img_title
    console.log("Updating about_us...");
    await db.collection('about_us').updateOne(
      {},
      {
        $set: {
          altname: "Jayshri Tiwari, Co-Founder of Brand Untold — Indian editorial platform for founder stories",
          img_title: "Jayshri Tiwari, Co-Founder of Brand Untold",
          updated_at: now
        }
      }
    );

    // 6. Update all_headings
    console.log("Updating all_headings...");
    await db.collection('all_headings').updateOne(
      { section: "about us" },
      {
        $set: {
          heading: "About Brand Untold",
          updated_at: now
        }
      }
    );

    console.log("All updates completed successfully!");
  } finally {
    await client.close();
  }
}

updateSeoAndContent();
