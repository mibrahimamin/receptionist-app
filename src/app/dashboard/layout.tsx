import { headers } from "next/headers";
import { getDashboardBusiness } from "@/lib/business";
import DashboardShell from "@/components/dashboard/DashboardShell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headerStore = headers();

  const pathname =
    headerStore.get("x-pathname") ||
    headerStore.get("x-invoke-path") ||
    "";

  const isAuthPage =
    pathname === "/dashboard/login" ||
    pathname === "/dashboard/signup";

  if (isAuthPage) {
    return <>{children}</>;
  }

  const business = await getDashboardBusiness();

  return (
    <DashboardShell
      businessName={business.name}
      businessSlug={business.slug}
    >
      {children}
    </DashboardShell>
  );
}