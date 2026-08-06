"use client";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/calendar", label: "Calendar" },
  { href: "/dashboard/appointments", label: "Appointments" },
  { href: "/dashboard/contacts", label: "Contacts" },
  { href: "/dashboard/services", label: "Services" },
  { href: "/dashboard/faqs", label: "FAQs" },
  { href: "/dashboard/settings", label: "Settings" },
];

export default function Sidebar({

  businessName,

  businessSlug,

}: {

  businessName: string;

  businessSlug: string;

}){
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
  const supabase = createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Logout failed:", error.message);
    return;
  }

  router.replace("/dashboard/login");
  router.refresh();
}

  return (
  <aside className="w-64 h-screen sticky top-0 bg-[#1C1C1E] text-paper flex flex-col">
    <div className="p-5 hidden sm:block">
      <p className="font-inter font-semibold text-[11px] uppercase tracking-[0.25em] text-[#C89A45]">
        Front Desk
      </p>

      <p className="font-sans font-bold text-2xl text-[#F5F5F7] mt-3">
        {businessName}
      </p>
    </div>

    <nav className="flex flex-col flex-1 w-full">
      {LINKS.map((link) => {
        const active = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`block w-full px-5 py-4 rounded-md border-2 transition-all duration-200 ${
            active
            ? "border-[#C89A45] bg-[#2C2C2E] text-white"
            : "border-transparent bg-transparent text-paper/80 hover:border-[#C89A45] hover:bg-[#2C2C2E] hover:text-white"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
      <div className="p-5 mt-auto hidden sm:block border-t border-white/10 space-y-3">

 <Link

  href={`/front-desk/${businessSlug}`}

  target="_blank"

  rel="noopener noreferrer"

  className="flex items-center justify-center rounded-md border border-white/15 px-3 py-2 text-sm font-medium text-[#F5F5F7] hover:bg-[#2C2C2E] hover:border-[#C89A45] transition-colors"

>

  View Front Desk ↗

</Link>
  <button

  onClick={handleLogout}

  className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-medium text-paper hover:bg-white/10 transition-colors"
>
  Log out

</button>
</div>
    </aside>
  );
}
