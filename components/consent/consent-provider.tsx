"use client"

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react"
import {
  ACCEPT_ALL,
  DENY_ALL,
  readConsent,
  writeConsent,
  type ConsentPreferences,
  type StoredConsent,
} from "@/lib/consent"

interface ConsentContextValue {
  consent: StoredConsent | null
  /** True once the stored choice has been read on the client (avoids SSR flash). */
  isReady: boolean
  /** True when the user has made an explicit choice. */
  hasChosen: boolean
  showSettings: boolean
  openSettings: () => void
  closeSettings: () => void
  save: (prefs: ConsentPreferences) => void
  acceptAll: () => void
  rejectAll: () => void
}

const ConsentContext = createContext<ConsentContextValue | null>(null)

export function ConsentProvider({ children }: { children: ReactNode }) {
  const [consent, setConsent] = useState<StoredConsent | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  useEffect(() => {
    setConsent(readConsent())
    setIsReady(true)
  }, [])

  const save = useCallback((prefs: ConsentPreferences) => {
    setConsent(writeConsent(prefs))
    setShowSettings(false)
  }, [])

  const value: ConsentContextValue = {
    consent,
    isReady,
    hasChosen: consent !== null,
    showSettings,
    openSettings: useCallback(() => setShowSettings(true), []),
    closeSettings: useCallback(() => setShowSettings(false), []),
    save,
    acceptAll: useCallback(() => save(ACCEPT_ALL), [save]),
    rejectAll: useCallback(() => save(DENY_ALL), [save]),
  }

  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>
}

export function useConsent(): ConsentContextValue {
  const ctx = useContext(ConsentContext)
  if (!ctx) {
    throw new Error("useConsent must be used within a ConsentProvider")
  }
  return ctx
}
