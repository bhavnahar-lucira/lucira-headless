"use client";

import Sidebar from "@/components/scheme/agent/sideba";


export default function AdminEnrollLayout({ children }) {
  return ( 
    <> 
      <div className="flex min-h-screen bg-muted/40">
        {/* Sidebar */}
        <aside className="w-64 border-r bg-background">
          <Sidebar/>
        </aside>
       

        {/* Content */}
        <main className="flex-1">
          {/* <ProfileHeader/> */}
          <div className="p-6">
           {children}
          </div>
        </main>
      </div>
    </>  
  );
}
