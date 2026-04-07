"use client"

import { useRef, useCallback } from "react"
import { QRCodeSVG } from "qrcode.react"
import html2canvas from "html2canvas"
import { jsPDF } from "jspdf"
import type { VCardData } from "@/lib/vcard"

// Vertical business card — 2x3.5 inches at 300 DPI = 600x1050
const CARD_W = 600
const CARD_H = 1050

const FONT = "'Nunito Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"

interface BusinessCardExportProps {
  card: VCardData
  siteUrl: string
  onClose: () => void
}

export function BusinessCardExport({ card, siteUrl, onClose }: BusinessCardExportProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const vcardUrl = `${siteUrl}/api/vcard/${card.id}`

  const exportAs = useCallback(async (format: "png" | "pdf") => {
    if (!cardRef.current) return

    // Temporarily remove the preview scale so html2canvas captures at full size
    const el = cardRef.current
    const origTransform = el.style.transform
    el.style.transform = "none"

    const canvas = await html2canvas(el, {
      scale: 3, // 3x for crisp output on retina/mobile
      useCORS: true,
      backgroundColor: null,
    })

    // Restore preview scale
    el.style.transform = origTransform

    if (format === "png") {
      const link = document.createElement("a")
      link.download = `${card.firstName}_${card.lastName}_card.png`
      link.href = canvas.toDataURL("image/png")
      link.click()
    } else {
      // 2 x 3.5 inches
      const pdf = new jsPDF({ orientation: "portrait", unit: "in", format: [2, 3.5] })
      const imgData = canvas.toDataURL("image/png")
      pdf.addImage(imgData, "PNG", 0, 0, 2, 3.5)
      pdf.save(`${card.firstName}_${card.lastName}_card.pdf`)
    }
  }, [card])

  const fullName = [card.firstName, card.lastName].filter(Boolean).join(" ")
  const hasAddress = card.address?.city || card.address?.country
  const addressLine = [card.address?.city, card.address?.country].filter(Boolean).join(", ")

  const previewScale = 0.48

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Export Business Card</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl leading-none">&times;</button>
        </div>

        {/* Load round font */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link href="https://fonts.googleapis.com/css2?family=Nunito+Sans:ital,opsz,wght@0,6..12,200..1000;1,6..12,200..1000&display=swap" rel="stylesheet" />

        {/* Card preview — centered, scaled for screen */}
        <div className="flex justify-center mb-6" style={{ height: CARD_H * previewScale, overflow: "hidden" }}>
          <div
            ref={cardRef}
            style={{
              width: CARD_W,
              height: CARD_H,
              fontFamily: FONT,
              background: "#f5f4f0",
              overflow: "hidden",
              flexShrink: 0,
              transform: `scale(${previewScale})`,
              transformOrigin: "top center",
            }}
          >
            {/* Purple header bar */}
            <div
              style={{
                background: "#8c52ff",
                height: 120,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span
                style={{
                  color: "#ffffff",
                  fontSize: 48,
                  letterSpacing: 8,
                  fontWeight: 300,
                }}
              >
                TECXMATE.COM
              </span>
            </div>

            {/* Divider line */}
            <div style={{ height: 3, background: "#7a3df5" }} />

            {/* Content area */}
            <div style={{ padding: "50px 50px 44px 50px", display: "flex", flexDirection: "column", justifyContent: "space-between", height: CARD_H - 123 }}>
              {/* Top — name + title + details */}
              <div>
                {/* Name */}
                <div style={{ fontSize: 52, fontWeight: 800, color: "#1a1a1a", marginBottom: 8, lineHeight: 1.15 }}>
                  {fullName}
                </div>
                {/* Title */}
                <div style={{ fontSize: 21, fontWeight: 600, color: "#444", letterSpacing: 4, textTransform: "uppercase", marginBottom: 36 }}>
                  {card.title}
                </div>

                {/* Contact details */}
                <div style={{ fontSize: 23, color: "#222", fontWeight: 500, lineHeight: 2.3 }}>
                  {hasAddress && (
                    <div><span style={{ fontWeight: 800 }}>Office</span>: {addressLine}</div>
                  )}
                  {card.emails.length > 0 && (
                    <div><span style={{ fontWeight: 800 }}>Email</span>: {card.emails[0].address}</div>
                  )}
                  {card.note && card.note.includes("WeChat") && (
                    <div><span style={{ fontWeight: 800 }}>WeChat</span>: {card.note.replace(/WeChat\s*ID:\s*/i, "")}</div>
                  )}
                  {card.phones.length > 0 && (
                    <div><span style={{ fontWeight: 800 }}>Mobile:</span> {card.phones[0].number}</div>
                  )}
                  {card.phones.length > 0 && (
                    <div><span style={{ fontWeight: 800 }}>WhatsApp & Zalo:</span> {card.phones[0].number}</div>
                  )}
                </div>
              </div>

              {/* Bottom — QR code + "ADD MY CONTACT" */}
              <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                <QRCodeSVG
                  value={vcardUrl}
                  size={120}
                  bgColor="transparent"
                  fgColor="#1a1a1a"
                  level="M"
                  includeMargin={false}
                />
                <div style={{ fontSize: 22, fontWeight: 600, color: "#222", letterSpacing: 4, lineHeight: 1.6 }}>
                  ADD<br />MY CONTACT
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Export buttons */}
        <div className="flex gap-3 justify-center flex-wrap">
          <button
            onClick={() => exportAs("png")}
            className="px-6 py-2 bg-primary text-white rounded-md font-medium hover:bg-primary/90"
          >
            Download PNG
          </button>
          <button
            onClick={() => exportAs("pdf")}
            className="px-6 py-2 bg-gray-800 text-white rounded-md font-medium hover:bg-gray-700"
          >
            Download PDF
          </button>
          <a
            href={vcardUrl}
            download
            className="px-6 py-2 border border-primary text-primary rounded-md font-medium hover:bg-primary/10 text-center"
          >
            Add to Contacts (.vcf)
          </a>
        </div>
      </div>
    </div>
  )
}
