import DashboardHeader from "@/components/common/DashboardHeader";
import AdminLock from "@/components/dashboard/AdminLock";

export default function DashboardLayout({ children }) {
  return (
    <AdminLock>
      <div className="min-h-screen bg-zinc-50 dark:bg-black">
        <DashboardHeader />
        <main>
          {children}
        </main>
      </div>
    </AdminLock>
  );
}
