"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAdminAuth } from "./use-admin-auth"

type AuthedFetch = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>
const AdminAuthContext = createContext<{ authedFetch: AuthedFetch } | null>(null)

export function useAdminContext() {
  const ctx = useContext(AdminAuthContext)
  if (!ctx) throw new Error("useAdminContext must be used within AdminShell")
  return ctx
}

type NavItem = { href: string; label: string; ready: boolean }

const NAV: NavItem[] = [
  { href: "/admin", label: "Dashboard", ready: true },
  { href: "/admin/team", label: "Team", ready: true },
  { href: "/admin/services", label: "Services", ready: true },
  { href: "/admin/about", label: "Hero & About", ready: true },
  { href: "/admin/company", label: "Company & Footer", ready: false },
  { href: "/admin/metadata", label: "Metadata (SEO)", ready: false },
]

const TOOLS: NavItem[] = [
  { href: "/admin/tecxbook", label: "Tecxbook", ready: true },
  { href: "/admin/vcards", label: "vCards", ready: true },
]

function LoginGate({ onLogin }: { onLogin: (pw: string) => Promise<{ ok: boolean; error?: string }> }) {
  const [value, setValue] = useState("")
  const [show, setShow] = useState(false)
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError("")
    const r = await onLogin(value)
    if (!r.ok) setError(r.error || "Login failed")
    setBusy(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <form onSubmit={submit} className="w-full max-w-sm rounded-lg border bg-card p-6 shadow-sm space-y-4">
        <div>
          <h1 className="text-lg font-semibold">Tecxmate Admin</h1>
          <p className="text-sm text-muted-foreground">Enter the admin password to continue.</p>
        </div>
        <div className="flex gap-2">
          <input
            type={show ? "text" : "password"}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Password"
            autoFocus
            className="flex-1 rounded-md border px-3 py-2 text-sm bg-background"
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="rounded-md border px-3 text-sm text-muted-foreground hover:bg-muted"
          >
            {show ? "Hide" : "Show"}
          </button>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={busy || !value}
          className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  )
}

export function AdminShell({ title, children }: { title: string; children: ReactNode }) {
  const { authenticated, checking, login, logout, authedFetch } = useAdminAuth()
  const pathname = usePathname()

  if (checking) {
    return <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">Loading…</div>
  }

  if (!authenticated) {
    return <LoginGate onLogin={login} />
  }

  return (
    <div className="min-h-screen flex bg-muted/20">
      <aside className="w-56 shrink-0 border-r bg-card p-4 flex flex-col">
        <div className="px-2 pb-4">
          <Link href="/admin" className="font-semibold">
            Tecxmate Admin
          </Link>
        </div>
        <nav className="space-y-1 text-sm">
          <p className="px-2 pt-2 pb-1 text-xs uppercase tracking-wide text-muted-foreground">Content</p>
          {NAV.map((item) => {
            const active = pathname === item.href
            return item.ready ? (
              <Link
                key={item.href}
                href={item.href}
                className={`block rounded-md px-2 py-1.5 ${active ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
              >
                {item.label}
              </Link>
            ) : (
              <span
                key={item.href}
                className="flex items-center justify-between rounded-md px-2 py-1.5 text-muted-foreground/60"
              >
                {item.label}
                <span className="text-[10px] uppercase">soon</span>
              </span>
            )
          })}
          <p className="px-2 pt-4 pb-1 text-xs uppercase tracking-wide text-muted-foreground">Tools</p>
          {TOOLS.map((item) => (
            <Link key={item.href} href={item.href} className="block rounded-md px-2 py-1.5 hover:bg-muted">
              {item.label}
            </Link>
          ))}
        </nav>
        <button
          onClick={logout}
          className="mt-auto rounded-md border px-2 py-1.5 text-sm text-muted-foreground hover:bg-muted"
        >
          Sign out
        </button>
      </aside>
      <main className="flex-1 p-6 lg:p-8">
        <h1 className="mb-6 text-xl font-semibold">{title}</h1>
        <AdminAuthContext.Provider value={{ authedFetch }}>{children}</AdminAuthContext.Provider>
      </main>
    </div>
  )
}
