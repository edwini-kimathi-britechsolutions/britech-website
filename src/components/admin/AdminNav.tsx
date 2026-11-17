"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Briefcase, FileText, Handshake, Inbox, LayoutDashboard, MessageSquareQuote, Settings, UserCircle, Users } from "lucide-react";
import type { Role } from "@prisma/client";

const items = [
  { href: "/admin", label: "Dashboard", Icon: LayoutDashboard, roles: ["ADMIN", "EDITOR", "AUTHOR"] },
  { href: "/admin/inquiries", label: "Inquiries", Icon: Inbox, roles: ["ADMIN", "EDITOR"] },
  { href: "/admin/posts", label: "Blog posts", Icon: FileText, roles: ["ADMIN", "EDITOR", "AUTHOR"] },
  { href: "/admin/projects", label: "Projects & products", Icon: Briefcase, roles: ["ADMIN", "EDITOR"] },
  { href: "/admin/partners", label: "Clients & partners", Icon: Handshake, roles: ["ADMIN", "EDITOR"] },
  { href: "/admin/testimonials", label: "Testimonials", Icon: MessageSquareQuote, roles: ["ADMIN", "EDITOR"] },
  { href: "/admin/users", label: "Team accounts", Icon: Users, roles: ["ADMIN"] },
  { href: "/admin/settings", label: "Site settings", Icon: Settings, roles: ["ADMIN"] },
  { href: "/admin/account", label: "My account", Icon: UserCircle, roles: ["ADMIN", "EDITOR", "AUTHOR"] },
];

export default function AdminNav({ role, newInquiries = 0 }: { role: Role; newInquiries?: number }) {
  const pathname = usePathname();
  return (
    <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:overflow-visible lg:pb-0">
      {items
        .filter((i) => i.roles.includes(role))
        .map(({ href, label, Icon }) => {
          const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex shrink-0 items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                active ? "bg-navy-900 text-white" : "text-navy-600 hover:bg-navy-50 hover:text-navy-900"
              }`}
            >
              <Icon className={`h-4 w-4 ${active ? "text-mint-400" : ""}`} />
              {label}
              {href === "/admin/inquiries" && newInquiries > 0 && (
                <span className="ml-auto rounded-full bg-mint-500 px-2 py-0.5 text-xs font-bold text-navy-950">{newInquiries}</span>
              )}
            </Link>
          );
        })}
    </nav>
  );
}
