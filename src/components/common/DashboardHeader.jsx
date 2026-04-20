import Link from "next/link";
import { LayoutDashboard, LogOut, User } from "lucide-react";

export default function DashboardHeader() {
  return (
    <header className="bg-zinc-900 text-white border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg">
            <LayoutDashboard size={20} className="text-zinc-400" />
            Dashboard
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-400">
            <Link href="/dashboard" className="hover:text-white transition-colors">Overview</Link>
            <Link href="/dashboard/variants" className="hover:text-white transition-colors">Variants</Link>
            <Link href="/dashboard/pages" className="hover:text-white transition-colors">Pages</Link>
            <Link href="/dashboard/blogs" className="hover:text-white transition-colors">Blogs</Link>
            <Link href="/dashboard/reviews" className="hover:text-white transition-colors">Reviews</Link>
            <Link href="/dashboard/sync" className="hover:text-white transition-colors">Sync</Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/admin/profile" className="p-2 hover:bg-zinc-800 rounded-full transition-colors">
            <User size={20} />
          </Link>
          <button className="p-2 hover:bg-zinc-800 rounded-full transition-colors text-red-400">
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}
