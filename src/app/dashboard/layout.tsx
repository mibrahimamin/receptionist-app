import { getCurrentBusiness } from "@/lib/business";
import DashboardShell from "@/components/dashboard/DashboardShell";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const business = await getCurrentBusiness();

  return (
    <DashboardShell businessName={business.name}>
      {children}
    </DashboardShell>
  );
}