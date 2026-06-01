"use client"

import Link from "next/link"
import { AdminShell } from "@/components/admin/admin-shell"

const CARDS = [
  { href: "/admin/team", label: "Team", desc: "Add, edit, reorder, and remove team members.", ready: true },
  { href: "/admin/services", label: "Services", desc: "Service card titles and descriptions.", ready: false },
  { href: "/admin/about", label: "Hero & About", desc: "Homepage hero and About page copy.", ready: false },
  { href: "/admin/company", label: "Company & Footer", desc: "Address, phones, emails, markets, legal names.", ready: false },
  { href: "/admin/metadata", label: "Metadata (SEO)", desc: "Page titles, descriptions, OG tags.", ready: false },
  { href: "/admin/tecxbook", label: "Tecxbook", desc: "Upload and manage HTML artifacts.", ready: true },
  { href: "/admin/vcards", label: "vCards", desc: "Manage digital business cards.", ready: true },
]

export default function AdminDashboard() {
  return (
    <AdminShell title="Dashboard">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CARDS.map((c) =>
          c.ready ? (
            <Link
              key={c.href}
              href={c.href}
              className="rounded-lg border bg-card p-4 hover:shadow-sm transition-shadow"
            >
              <p className="font-medium">{c.label}</p>
              <p className="mt-1 text-sm text-muted-foreground">{c.desc}</p>
            </Link>
          ) : (
            <div key={c.href} className="rounded-lg border bg-card p-4 opacity-60">
              <p className="font-medium flex items-center justify-between">
                {c.label}
                <span className="text-[10px] uppercase text-muted-foreground">soon</span>
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{c.desc}</p>
            </div>
          ),
        )}
      </div>
    </AdminShell>
  )
}
