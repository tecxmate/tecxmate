'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import en from '@/app/lang/en.json'
import vi from '@/app/lang/vi.json'
import zh from '@/app/lang/zh.json'

const dictionaries = {
  en,
  vi,
  zh,
}

type Language = keyof typeof dictionaries

/**
 * Languages actually offered on the site. Vietnamese copy still exists
 * throughout the content files — dropping it from this list hides it
 * everywhere without deleting a single translation, so it can be turned
 * back on by adding "vi" here.
 */
export const AVAILABLE_LANGUAGES = ["en", "zh"] as const satisfies readonly Language[]

function isAvailableLanguage(value: string): value is Language {
  return (AVAILABLE_LANGUAGES as readonly string[]).includes(value)
}

interface LanguageContextValue {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: keyof typeof en) => string
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

const LANGUAGE_STORAGE_KEY = 'tecxmate:lang'

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en')

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const storedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY)

    // A visitor who previously chose a now-disabled language falls back to English.
    if (storedLanguage && isAvailableLanguage(storedLanguage)) {
      setLanguageState(storedLanguage)
    }
  }, [])

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang)

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, lang)
    }
  }, [])

  const t = useCallback(
    (key: keyof typeof en) => {
      const translation = dictionaries[language][key]

      return translation ?? dictionaries.en[key] ?? key
    },
    [language],
  )

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t,
    }),
    [language, setLanguage, t],
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)

  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }

  return context
}

export type { Language }
