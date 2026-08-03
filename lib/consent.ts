// Cookie consent storage + helpers.
// Non-essential trackers (GA, Firebase, GTM) must NOT load until the user
// opts in here. See components/consent/* for the UI and gating.

export const CONSENT_STORAGE_KEY = "tecxmate_consent"
export const CONSENT_COOKIE = "tecxmate_consent"
export const CONSENT_VERSION = 1
export const CONSENT_EVENT = "tecxmate:consent-change"

// 6 months, the common expiry for a stored consent choice.
const CONSENT_COOKIE_MAX_AGE = 60 * 60 * 24 * 180

export interface ConsentPreferences {
  necessary: true
  analytics: boolean
  marketing: boolean
}

export interface StoredConsent extends ConsentPreferences {
  version: number
  timestamp: string
}

export const DENY_ALL: ConsentPreferences = {
  necessary: true,
  analytics: false,
  marketing: false,
}

export const ACCEPT_ALL: ConsentPreferences = {
  necessary: true,
  analytics: true,
  marketing: true,
}

export function readConsent(): StoredConsent | null {
  if (typeof window === "undefined") {
    return null
  }

  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY)
    if (!raw) {
      return null
    }

    const parsed = JSON.parse(raw) as Partial<StoredConsent>
    // A version bump invalidates old choices so the banner re-prompts.
    if (parsed.version !== CONSENT_VERSION) {
      return null
    }

    return {
      necessary: true,
      analytics: Boolean(parsed.analytics),
      marketing: Boolean(parsed.marketing),
      version: CONSENT_VERSION,
      timestamp: typeof parsed.timestamp === "string" ? parsed.timestamp : "",
    }
  } catch {
    return null
  }
}

export function writeConsent(prefs: ConsentPreferences): StoredConsent {
  const record: StoredConsent = {
    necessary: true,
    analytics: prefs.analytics,
    marketing: prefs.marketing,
    version: CONSENT_VERSION,
    timestamp: new Date().toISOString(),
  }

  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(record))
      // First-party cookie mirror so the server/edge can read the choice if needed.
      const value = `${record.analytics ? 1 : 0}${record.marketing ? 1 : 0}`
      document.cookie = `${CONSENT_COOKIE}=${value}; Max-Age=${CONSENT_COOKIE_MAX_AGE}; Path=/; SameSite=Lax`
      window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: record }))
    } catch {
      // Storage can throw in private mode / when disabled — fail closed (no consent persisted).
    }
  }

  return record
}
