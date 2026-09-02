const { MongoClient, ObjectId } = require('mongodb');

const uri = "mongodb+srv://harshit:Harshit%40123@userinfo.lmbsytd.mongodb.net/jayshree_blogs";
const dbName = "jayshree_blogs";

const faqsToSeed = [
  {
    question: "What exactly does Brand Untold write?",
    ans: "We write stories — not promotional content. Every piece we create is editorially driven, psychologically grounded, and built around the real thinking behind your journey. If you're looking for marketing copy, we're not the right fit. If you're looking for the story that actually happened — we are."
  },
  {
    question: "Who is Brand Untold for?",
    ans: "Founders, creators, artists, and brands who have a real story — not the polished version, the real one. We work with people at any stage: still building, just starting, or already arrived. What matters is that there's a genuine story worth telling."
  },
  {
    question: "What is your turnaround time?",
    ans: "LinkedIn + Instagram feature — 5 to 7 days. Full Founder Story (website + social) — 10 to 14 days from the founder conversation. We don't rush stories. Every piece goes through research, writing, and review before it's ready."
  },
  {
    question: "Do I get to review the piece before it goes live?",
    ans: "Always. Nothing gets published without your approval. You'll receive the full draft — every word — before we publish anywhere. If something doesn't feel right, we fix it. This is your story."
  },
  {
    question: "What does the process look like?",
    ans: "1. You fill out the form or DM us.\n2. We research your journey — LinkedIn, Instagram, public interviews, anything available.\n3. For a Full Founder Story, we schedule a 20-minute conversation with you.\n4. We write the piece in Brand Untold's editorial voice.\n5. You review and approve.\n6. We publish and tag you across platforms."
  },
  {
    question: "Why do you ask for a founder conversation?",
    ans: "Because the best material is never on LinkedIn. The specific moments, the decisions made under pressure, the details that make a story feel real — those only come from a real conversation. The 20 minutes we spend with you shapes everything that gets written."
  },
  {
    question: "Will you write about anyone who pays?",
    ans: "No. Brand Untold is an editorial platform first. We choose our features based on whether there is a genuine story to tell — not just a budget to spend. If we don't think we can do justice to your story, we'll tell you honestly."
  },
  {
    question: "What platforms do you publish on?",
    ans: "Our website (branduntold.in), Instagram (@branduntold.in), and LinkedIn (Brand Untold). For the Full Founder Story package, your piece lives permanently on our website in addition to social media."
  },
  {
    question: "I'm not a well-known founder. Can you still feature me?",
    ans: "That's exactly who Brand Untold is for. We tell stories before they're obvious. You don't need a big name or a funding round. You need a real story — something you've lived, decided, built, or lost that someone else needs to hear."
  }
];

async function seedFaqs() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log("Connected to MongoDB database:", dbName);
    const db = client.db(dbName);

    // 1. Remove all existing FAQs from the 'faq' collection
    const deleteResult = await db.collection('faq').deleteMany({});
    console.log(`Deleted ${deleteResult.deletedCount} existing FAQs from 'faq' collection.`);

    // 2. Prepare new documents with timestamps
    const now = new Date().toISOString();
    const docs = faqsToSeed.map((item) => ({
      _id: new ObjectId(),
      question: item.question.trim(),
      ans: item.ans.trim(),
      created_at: now,
      updated_at: now
    }));

    // 3. Insert all new FAQs
    const insertResult = await db.collection('faq').insertMany(docs);
    console.log(`Successfully seeded ${insertResult.insertedCount} new FAQs into 'faq' collection.`);

    // 4. Retrieve and verify the seeded items
    const seededFaqs = await db.collection('faq').find({}).toArray();
    console.log("\n=== Seeded FAQs List ===");
    seededFaqs.forEach((faq, index) => {
      console.log(`\n[${index + 1}] ID: ${faq._id}`);
      console.log(`Q: ${faq.question}`);
      console.log(`A: ${faq.ans}`);
    });

  } catch (error) {
    console.error("Error during FAQ seeding:", error);
  } finally {
    await client.close();
    console.log("\nDatabase connection closed.");
  }
}

seedFaqs();
