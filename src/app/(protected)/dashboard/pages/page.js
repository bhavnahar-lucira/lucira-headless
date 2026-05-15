import clientPromise from "@/lib/mongodb";
import PagesTable from "./PagesTable";

async function getPages() {
  const client = await clientPromise;
  const db = client.db("next_local_db");
  const pages = await db.collection("pages").find({}).sort({ updatedAt: -1 }).toArray();
  return JSON.parse(JSON.stringify(pages));
}

export default async function PagesDashboard() {
  const pages = await getPages();

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Pages Overview</h1>
          <p className="text-zinc-500">Manage and view your synced Shopify pages using TanStack Table.</p>
        </div>
        <div className="bg-zinc-100 dark:bg-zinc-800 px-4 py-2 rounded-lg">
          <span className="font-bold text-xl">{pages.length}</span>
          <span className="text-zinc-500 ml-2">Total Pages</span>
        </div>
      </div>

      <PagesTable data={pages} />
    </div>
  );
}
