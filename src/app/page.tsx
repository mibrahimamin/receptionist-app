import { getCurrentBusiness } from "@/lib/business";
import { supabaseServer } from "@/lib/supabase/server";
import ChatWidget from "@/components/chat/ChatWidget";
import type { Faq, Service } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const business = await getCurrentBusiness();

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
  console.log("FAQ COUNT:", faqs?.length);

  console.log(faqs);
  return (
    <main className="min-h-screen flex flex-col items-center px-4 py-10 sm:py-16">
      <div className="w-full max-w-4xl">
        <header className="mb-8 text-center">
          <p className="text-center text-sm text-inkLight/70 mt-8 font-medium tracking-wide">
            Front Desk
          </p>
          <h1 className="font-sans font-semibold text-4xl sm:text-5xl text-ink mb-3">

          {business.name}

          </h1>
          <p className="text-inkLight text-lg italic font-sans">

            {business.tagline}

        </p>
        </header>

        <ChatWidget
          business={{ name: business.name, greeting: business.greeting, timezone: business.timezone }}
          services={(services || []) as Service[]}
          faqs={(faqs || []) as Faq[]}
        />

        <p className="text-center text-xs text-inkLight/70 mt-8 font-inter">
          © {new Date().getFullYear()} {business.name}. All rights reserved.
        </p>
      </div>
    </main>
  );
}
