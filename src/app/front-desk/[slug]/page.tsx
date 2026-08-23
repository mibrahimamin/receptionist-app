import { notFound } from "next/navigation";
import { getBusinessBySlug } from "@/lib/business";
import { supabaseServer } from "@/lib/supabase/server";
import ChatWidget from "@/components/chat/ChatWidget";
import type { Faq, Service } from "@/lib/types";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function FrontDeskPage({ params }: PageProps) {

  const { slug } = await params;

  const business = await getBusinessBySlug(slug);

  console.log("FRONT DESK BUSINESS:", {

    id: business?.id,

    slug: business?.slug,

    name: business?.name,

    phone: business?.phone,

    email: business?.email,

    address: business?.address,

  });

  if (!business) {

    notFound();

  }

  const [{ data: services }, { data: faqs }] = await Promise.all([
    supabaseServer
      .from("services")
      .select("*")
      .eq("business_id", business.id)
      .eq("is_active", true)
      .order("sort_order"),

    supabaseServer
      .from("faqs")
      .select("*")
      .eq("business_id", business.id)
      .order("sort_order", { ascending: true })
      .limit(10),
  ]);

  const hasContactInfo =
    business.phone ||
    business.email ||
    business.address;

  return (
    <main className="min-h-screen flex flex-col items-center px-4 py-10 sm:py-16">
      <div className="w-full max-w-2xl">
        <header className="mb-8 text-center">
          <p className="text-sm text-inkLight/70 mt-8 font-medium tracking-wide">
            Front Desk
          </p>

          <h1 className="font-sans font-semibold text-4xl sm:text-5xl text-ink mb-3">
            {business.name}
          </h1>

          {business.tagline && (
            <p className="text-inkLight text-lg italic font-sans">
              {business.tagline}
            </p>
          )}
        </header>

        {hasContactInfo && (
          <div className="mb-6 flex flex-wrap items-center justify-center gap-3">
            {business.phone && (
              <a
                href={`tel:${business.phone}`}
                className="stamp-btn"
              >
                Call
              </a>
            )}

            {business.email && (
              <a
                href={`mailto:${business.email}`}
                className="stamp-btn"
              >
                Email
              </a>
            )}

            {business.address && (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  business.address
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="stamp-btn"
              >
                Directions
              </a>
            )}
          </div>
        )}

        <ChatWidget
          business={{
            name: business.name,
            greeting: business.greeting,
            timezone: business.timezone,
          }}
          services={(services ?? []) as Service[]}
          faqs={(faqs ?? []) as Faq[]}
        />

        <p className="text-center text-xs text-inkLight/70 mt-8 font-sans">
          © {new Date().getFullYear()} {business.name}. All rights reserved.
        </p>
      </div>
    </main>
  );
}