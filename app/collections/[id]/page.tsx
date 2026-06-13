import { MongoClient, ObjectId } from 'mongodb';
import { notFound } from 'next/navigation';
import Image from 'next/image';

// 1. ISR Configuration: Revalidate the page every 60 seconds.
export const revalidate = 60;

const uri = process.env.MONGODB_URI!;
const dbName = process.env.MONGODB_DB!;
let client: MongoClient | null = null;

async function getDb() {
  if (!client) {
    client = await MongoClient.connect(uri);
  }
  return client.db(dbName);
}

// 2. generateStaticParams: Tells Next.js which pages to build at compile time.
// This fixes build issues for dynamic routes and improves speed.
export async function generateStaticParams() {
  try {
    const db = await getDb();
    const articles = await db.collection('articles')
      .find({}, { projection: { _id: 1 } })
      .toArray();

    return articles.map((article) => ({
      id: article._id.toString(),
    }));
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}

export default async function CollectionArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (!ObjectId.isValid(id)) {
    notFound();
  }

  const db = await getDb();
  // Query directly from the database for ISR build compatibility.
  const article = await db.collection('articles').findOne({ _id: new ObjectId(id) });

  if (!article) {
    notFound();
  }

  return (
    <main className="container mx-auto px-4 py-12 max-w-4xl">
      <header className="mb-10 text-center">
        <h1 className="text-4xl md:text-6xl font-black mb-4">{article.title}</h1>
        <p className="text-muted-foreground italic">Published on {new Date(article.createdAt || article.created_at || new Date()).toDateString()}</p>
      </header>

      {article.image && (
        <div className="relative w-full aspect-video mb-10 shadow-2xl overflow-hidden rounded-3xl">
          <Image 
            src={article.image} 
            alt={article.title} 
            fill 
            className="object-cover"
            priority
          />
        </div>
      )}

      <div className="prose prose-lg dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: article.content || article.long_description || "" }} />
    </main>
  );
}