"use client"

import { useCallback, useEffect, useState } from "react"

const STORAGE_KEY = "tecxmate:admin-pw"

type ProbeResult = { ok: true } | { ok: false; error: string }

async function probe(password: string): Promise<ProbeResult> {
  const res = await fetch("/api/admin/content", {
    method: "POST",
    headers: { "x-admin-password": password },
    body: new FormData(),
  })
  if (res.status === 401) return { ok: false, error: "Invalid password" }
  if (res.status === 503) {
    const j = await res.json().catch(() => ({}))
    return { ok: false, error: j.error || "Server admin is not configured." }
  }
  if (!res.ok) {
    const j = await res.json().catch(() => ({}))
    return { ok: false, error: j.error || `Login failed (${res.status})` }
  }
  return { ok: true }
}

export function useAdminAuth() {
  const [password, setPassword] = useState("")
  const [authenticated, setAuthenticated] = useState(false)
  const [checking, setChecking] = useState(true)

  // Restore a stored password and re-validate it on mount.
  useEffect(() => {
    const stored = typeof window !== "undefined" ? window.sessionStorage.getItem(STORAGE_KEY) : null
    if (!stored) {
      setChecking(false)
      return
    }
    setPassword(stored)
    probe(stored).then((r) => {
      if (r.ok) setAuthenticated(true)
      else window.sessionStorage.removeItem(STORAGE_KEY)
      setChecking(false)
    })
  }, [])

  const login = useCallback(async (candidate: string): Promise<ProbeResult> => {
    const r = await probe(candidate)
    if (r.ok) {
      window.sessionStorage.setItem(STORAGE_KEY, candidate)
      setPassword(candidate)
      setAuthenticated(true)
    }
    return r
  }, [])

  const logout = useCallback(() => {
    window.sessionStorage.removeItem(STORAGE_KEY)
    setPassword("")
    setAuthenticated(false)
  }, [])

  // fetch wrapper that injects the admin header.
  const authedFetch = useCallback(
    (input: RequestInfo | URL, init: RequestInit = {}) => {
      const headers = new Headers(init.headers)
      headers.set("x-admin-password", password)
      return fetch(input, { ...init, headers })
    },
    [password],
  )

  return { authenticated, checking, login, logout, authedFetch }
}
