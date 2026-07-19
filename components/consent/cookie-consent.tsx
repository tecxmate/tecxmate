"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useLanguage } from "@/components/language-provider"
import { useConsent } from "@/components/consent/consent-provider"
import type { ConsentPreferences } from "@/lib/consent"

type Copy = {
  bannerTitle: string
  bannerBody: string
  privacy: string
  acceptAll: string
  rejectAll: string
  customize: string
  save: string
  settingsTitle: string
  settingsBody: string
  necessaryTitle: string
  necessaryBody: string
  analyticsTitle: string
  analyticsBody: string
  marketingTitle: string
  marketingBody: string
  alwaysOn: string
}

// Consent copy is kept here (not in the shared i18n dictionaries) so the whole
// consent feature stays self-contained. Falls back to English for other locales.
const COPY: Record<"en" | "vi" | "zh", Copy> = {
  en: {
    bannerTitle: "We value your privacy",
    bannerBody:
      "We use cookies to run this site, understand traffic, and improve your experience. You can accept all, reject non-essential cookies, or choose what to allow.",
    privacy: "Privacy Policy",
    acceptAll: "Accept all",
    rejectAll: "Reject all",
    customize: "Customize",
    save: "Save choices",
    settingsTitle: "Cookie preferences",
    settingsBody:
      "Choose which cookies we may use. Necessary cookies keep the site working and are always on.",
    necessaryTitle: "Strictly necessary",
    necessaryBody: "Required for the site to function. These do not track you and cannot be turned off.",
    analyticsTitle: "Analytics",
    analyticsBody: "Google Analytics & Firebase — help us understand how visitors use the site.",
    marketingTitle: "Marketing",
    marketingBody: "Google Tag Manager tags used to measure campaigns and personalize content.",
    alwaysOn: "Always on",
  },
  vi: {
    bannerTitle: "Chúng tôi tôn trọng quyền riêng tư của bạn",
    bannerBody:
      "Chúng tôi dùng cookie để vận hành trang web, phân tích lưu lượng và cải thiện trải nghiệm. Bạn có thể chấp nhận tất cả, từ chối cookie không thiết yếu, hoặc tự chọn.",
    privacy: "Chính sách bảo mật",
    acceptAll: "Chấp nhận tất cả",
    rejectAll: "Từ chối",
    customize: "Tùy chỉnh",
    save: "Lưu lựa chọn",
    settingsTitle: "Tùy chọn cookie",
    settingsBody:
      "Chọn loại cookie bạn cho phép. Cookie thiết yếu giúp trang hoạt động và luôn bật.",
    necessaryTitle: "Thiết yếu",
    necessaryBody: "Cần thiết để trang hoạt động. Không theo dõi bạn và không thể tắt.",
    analyticsTitle: "Phân tích",
    analyticsBody: "Google Analytics & Firebase — giúp hiểu cách khách truy cập sử dụng trang.",
    marketingTitle: "Tiếp thị",
    marketingBody: "Thẻ Google Tag Manager dùng để đo lường chiến dịch và cá nhân hóa nội dung.",
    alwaysOn: "Luôn bật",
  },
  zh: {
    bannerTitle: "我們重視您的隱私",
    bannerBody:
      "我們使用 Cookie 來營運網站、分析流量並改善您的體驗。您可以接受全部、拒絕非必要 Cookie，或自行選擇。",
    privacy: "隱私政策",
    acceptAll: "全部接受",
    rejectAll: "全部拒絕",
    customize: "自訂",
    save: "儲存選擇",
    settingsTitle: "Cookie 偏好設定",
    settingsBody: "選擇我們可使用的 Cookie。必要 Cookie 讓網站正常運作，且一律啟用。",
    necessaryTitle: "嚴格必要",
    necessaryBody: "網站運作所必需。不會追蹤您，且無法關閉。",
    analyticsTitle: "分析",
    analyticsBody: "Google Analytics 與 Firebase — 幫助我們了解訪客如何使用網站。",
    marketingTitle: "行銷",
    marketingBody: "Google Tag Manager 標籤，用於衡量行銷活動及個人化內容。",
    alwaysOn: "一律啟用",
  },
}

function CategoryRow({
  title,
  body,
  checked,
  disabled,
  alwaysOnLabel,
  onCheckedChange,
}: {
  title: string
  body: string
  checked: boolean
  disabled?: boolean
  alwaysOnLabel?: string
  onCheckedChange?: (v: boolean) => void
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-4 border-b border-border last:border-0">
      <div className="space-y-1">
        <p className="font-medium text-foreground text-sm">{title}</p>
        <p className="text-muted-foreground text-xs leading-relaxed">{body}</p>
      </div>
      {disabled ? (
        <span className="shrink-0 text-xs font-medium text-primary whitespace-nowrap pt-0.5">
          {alwaysOnLabel}
        </span>
      ) : (
        <Switch checked={checked} onCheckedChange={onCheckedChange} className="shrink-0 mt-0.5" />
      )}
    </div>
  )
}

export function CookieConsent() {
  const { language } = useLanguage()
  const { isReady, hasChosen, showSettings, openSettings, closeSettings, consent, save, acceptAll, rejectAll } =
    useConsent()

  const copy = COPY[(language as "en" | "vi" | "zh") in COPY ? (language as "en" | "vi" | "zh") : "en"]

  // Draft toggles for the settings dialog, seeded from the current choice.
  const [draft, setDraft] = useState<ConsentPreferences>({
    necessary: true,
    analytics: consent?.analytics ?? false,
    marketing: consent?.marketing ?? false,
  })

  // Re-seed the draft whenever the dialog opens so it reflects the saved state.
  useEffect(() => {
    if (showSettings) {
      setDraft({
        necessary: true,
        analytics: consent?.analytics ?? false,
        marketing: consent?.marketing ?? false,
      })
    }
  }, [showSettings, consent?.analytics, consent?.marketing])

  const showBanner = isReady && !hasChosen && !showSettings

  return (
    <>
      {showBanner && (
        <div
          role="dialog"
          aria-modal="false"
          aria-label={copy.bannerTitle}
          className="fixed inset-x-0 bottom-0 z-[100] p-3 sm:p-4"
        >
          <div className="mx-auto max-w-4xl rounded-xl border border-border bg-background/95 backdrop-blur shadow-lg p-5 sm:p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="space-y-1.5 md:max-w-xl">
                <p className="font-semibold text-foreground">{copy.bannerTitle}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {copy.bannerBody}{" "}
                  <Link href="/privacy-policy" className="underline underline-offset-2 hover:text-foreground">
                    {copy.privacy}
                  </Link>
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row md:flex-col lg:flex-row shrink-0">
                <Button variant="outline" size="sm" onClick={openSettings}>
                  {copy.customize}
                </Button>
                <Button variant="outline" size="sm" onClick={rejectAll}>
                  {copy.rejectAll}
                </Button>
                <Button size="sm" onClick={acceptAll}>
                  {copy.acceptAll}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Dialog open={showSettings} onOpenChange={(open) => (open ? openSettings() : closeSettings())}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-lg rounded-lg p-6 sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{copy.settingsTitle}</DialogTitle>
            <DialogDescription>{copy.settingsBody}</DialogDescription>
          </DialogHeader>

          <div className="py-1">
            <CategoryRow
              title={copy.necessaryTitle}
              body={copy.necessaryBody}
              checked
              disabled
              alwaysOnLabel={copy.alwaysOn}
            />
            <CategoryRow
              title={copy.analyticsTitle}
              body={copy.analyticsBody}
              checked={draft.analytics}
              onCheckedChange={(v) => setDraft((d) => ({ ...d, analytics: v }))}
            />
            <CategoryRow
              title={copy.marketingTitle}
              body={copy.marketingBody}
              checked={draft.marketing}
              onCheckedChange={(v) => setDraft((d) => ({ ...d, marketing: v }))}
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" size="sm" onClick={rejectAll}>
              {copy.rejectAll}
            </Button>
            <Button variant="outline" size="sm" onClick={acceptAll}>
              {copy.acceptAll}
            </Button>
            <Button size="sm" onClick={() => save(draft)}>
              {copy.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
