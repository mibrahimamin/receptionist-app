"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";

export default function DashboardShell({

  children,

  businessName,

  businessSlug,

}: {

  children: React.ReactNode;

  businessName: string;

  businessSlug: string;

}) {
  const pathname = usePathname();

  if (

  pathname === "/dashboard/login" ||

  pathname === "/dashboard/signup"

) {

  return <>{children}</>;

}

  return (
    <div className="min-h-screen flex flex-col sm:flex-row bg-paper">
      <Sidebar

  businessName={businessName}

  businessSlug={businessSlug}

/>
      <div className="flex-1 p-5 sm:p-10 max-w-5xl">
        {children}
      </div>
    </div>
  );
}