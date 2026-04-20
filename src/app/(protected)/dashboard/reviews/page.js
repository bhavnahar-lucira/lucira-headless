import clientPromise from "@/lib/mongodb";
import ReviewsTable from "./ReviewsTable";

async function getReviews() {
  const client = await clientPromise;
  const db = client.db("next_local_db");
  const reviews = await db.collection("reviews").find({}).sort({ date: -1 }).toArray();
  return JSON.parse(JSON.stringify(reviews));
}

export default async function ReviewsDashboard() {
  const reviews = await getReviews();

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Customer Reviews</h1>
          <p className="text-zinc-500">Manage and browse reviews synced from Nector.</p>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-6 py-3 rounded-2xl shadow-sm">
          <span className="font-bold text-2xl">{reviews.length}</span>
          <span className="text-zinc-500 ml-2 uppercase text-xs tracking-widest font-bold">Total Reviews</span>
        </div>
      </div>

      <ReviewsTable data={reviews} />
    </div>
  );
}
