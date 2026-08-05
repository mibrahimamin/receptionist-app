"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";

export default function DashboardShell({
  children,
  businessName,
}: {
  children: React.ReactNode;
  businessName: string;
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
      <Sidebar businessName={businessName} />
      <div className="flex-1 p-5 sm:p-10 max-w-5xl">
        {children}
      </div>
    </div>
  );
}