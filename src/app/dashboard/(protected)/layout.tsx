import { getDashboardBusiness } from "@/lib/business";

import DashboardShell from "@/components/dashboard/DashboardShell";

export default async function ProtectedDashboardLayout({

  children,

}: {

  children: React.ReactNode;

}) {

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