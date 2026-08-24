import { notFound } from "next/navigation";
import Link from "next/link";
import { getBusinessBySlug } from "@/lib/business";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{
    slug: string;
    type: string;
  }>;
};

export default async function ContactPage({ params }: PageProps) {
  const { slug, type } = await params;

  const business = await getBusinessBySlug(slug);

  if (!business) {
    notFound();
  }

  let title = "";
  let value = "";
  let actionHref = "";
  let actionText = "";

  if (type === "phone" && business.phone) {
    title = "Call Us";
    value = business.phone;
    actionHref = `tel:${business.phone}`;
    actionText = "Call Now";
  } else if (type === "email" && business.email) {
    title = "Email Us";
    value = business.email;
    actionHref = `mailto:${business.email}`;
    actionText = "Send Email";
  } else if (type === "directions" && business.address) {
    title = "Visit Us";
    value = business.address;
    actionHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      business.address
    )}`;
    actionText = "Open in Maps";
  } else {
    notFound();
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="ledger-card w-full max-w-lg p-8 text-center">

        <p className="text-sm text-inkLight/70 font-medium tracking-wide mb-2">
          {business.name}
        </p>

        <h1 className="text-4xl font-semibold text-ink mb-6">
          {title}
        </h1>

        <div className="bg-paperDark rounded-lg p-6 mb-6">
          <p className="text-xl text-ink">
            {value}
          </p>
        </div>

        <a
          href={actionHref}
          target={type === "directions" ? "_blank" : undefined}
          rel={type === "directions" ? "noopener noreferrer" : undefined}
          className="stamp-btn stamp-btn-selected inline-block"
        >
          {actionText}
        </a>

        <div className="mt-6">
          <Link
            href={`/front-desk/${business.slug}`}
            className="text-sm text-inkLight underline hover:text-brass"
          >
            ← Back to Front Desk
          </Link>
        </div>

      </div>
    </main>
  );
}