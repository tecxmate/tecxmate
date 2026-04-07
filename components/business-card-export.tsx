"use client"

import { useRef, useCallback } from "react"
import { QRCodeSVG } from "qrcode.react"
import html2canvas from "html2canvas"
import { jsPDF } from "jspdf"
import type { VCardData } from "@/lib/vcard"

// Vertical business card at 300 DPI: 2.17" x 3.58" ≈ 650 x 1074px
const CARD_W = 650
const CARD_H = 1074

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

    const canvas = await html2canvas(cardRef.current, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      width: CARD_W,
      height: CARD_H,
    })

    if (format === "png") {
      const link = document.createElement("a")
      link.download = `${card.firstName}_${card.lastName}_card.png`
      link.href = canvas.toDataURL("image/png")
      link.click()
    } else {
      const pdf = new jsPDF({ orientation: "portrait", unit: "in", format: [2.17, 3.58] })
      const imgData = canvas.toDataURL("image/png")
      pdf.addImage(imgData, "PNG", 0, 0, 2.17, 3.58)
      pdf.save(`${card.firstName}_${card.lastName}_card.pdf`)
    }
  }, [card])

  const fullName = [card.firstName, card.lastName].filter(Boolean).join(" ")
  const hasAddress = card.address?.city || card.address?.country
  const addressLine = [card.address?.city, card.address?.country].filter(Boolean).join(", ")

  const previewScale = 0.45

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-2xl p-6 max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Export Business Card</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl leading-none">&times;</button>
        </div>

        {/* Load round font */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link href="https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@300;400;700;800&display=swap" rel="stylesheet" />

        {/* Card preview — centered, scaled down */}
        <div className="flex justify-center mb-4" style={{ height: CARD_H * previewScale + 10, overflow: "hidden" }}>
          <div
            ref={cardRef}
            style={{
              width: CARD_W,
              height: CARD_H,
              fontFamily: FONT,
              position: "relative",
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
                height: 130,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span
                style={{
                  color: "#ffffff",
                  fontSize: 52,
                  letterSpacing: 10,
                  fontWeight: 300,
                }}
              >
                TECXMATE.COM
              </span>
            </div>

            {/* Divider line */}
            <div style={{ height: 4, background: "#7a3df5" }} />

            {/* Content area */}
            <div style={{ padding: "65px 60px 55px 60px", display: "flex", flexDirection: "column", justifyContent: "space-between", height: CARD_H - 134 }}>
              {/* Top — name + title + details */}
              <div>
                {/* Name */}
                <div style={{ fontSize: 58, fontWeight: 800, color: "#1a1a1a", marginBottom: 12, lineHeight: 1.1 }}>
                  {fullName}
                </div>
                {/* Title */}
                <div style={{ fontSize: 24, fontWeight: 500, color: "#444", letterSpacing: 5, textTransform: "uppercase", marginBottom: 44 }}>
                  {card.title}
                </div>

                {/* Contact details */}
                <div style={{ fontSize: 26, color: "#222", fontWeight: 500, lineHeight: 2.2 }}>
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
              <div style={{ display: "flex", alignItems: "center", gap: 24, marginTop: 30 }}>
                <QRCodeSVG
                  value={vcardUrl}
                  size={140}
                  bgColor="transparent"
                  fgColor="#1a1a1a"
                  level="M"
                  includeMargin={false}
                />
                <div style={{ fontSize: 26, fontWeight: 500, color: "#222", letterSpacing: 4, lineHeight: 1.6 }}>
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
