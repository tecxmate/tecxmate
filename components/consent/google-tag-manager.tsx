"use client"

import Script from "next/script"
import { useConsent } from "@/components/consent/consent-provider"

/**
 * Google Tag Manager, gated behind marketing consent.
 * GTM containers typically fire ad/marketing tags, so it only loads once the
 * user opts into the Marketing category. Consent Mode v2 ad signals are set to
 * granted at the same time.
 */
export function GoogleTagManager() {
  const { consent } = useConsent()
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID

  if (!gtmId || !consent?.marketing) {
    return null
  }

  return (
    <>
      <Script
        id="gtm-consent-update"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('consent', 'update', {
              ad_storage: 'granted',
              ad_user_data: 'granted',
              ad_personalization: 'granted',
            });
          `.trim(),
        }}
      />
      <Script
        id="gtm-loader"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${gtmId}');
          `.trim(),
        }}
      />
      <noscript>
        <iframe
          src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
          height="0"
          width="0"
          style={{ display: "none", visibility: "hidden" }}
          title="Google Tag Manager"
        />
      </noscript>
    </>
  )
}
