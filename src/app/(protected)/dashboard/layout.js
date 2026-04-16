import DashboardHeader from "@/components/common/DashboardHeader";

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <DashboardHeader />
      <main>
        {children}
      </main>
    </div>
  );
}
