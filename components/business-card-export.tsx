"use client"

import { useRef, useCallback } from "react"
import { QRCodeSVG } from "qrcode.react"
import html2canvas from "html2canvas"
import { jsPDF } from "jspdf"
import type { VCardData } from "@/lib/vcard"

// Vertical business card at 300 DPI: 2.17" x 3.58" ≈ 650 x 1074px
const CARD_W = 650
const CARD_H = 1074

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
      // Vertical: 2.17 x 3.58 inches
      const pdf = new jsPDF({ orientation: "portrait", unit: "in", format: [2.17, 3.58] })
      const imgData = canvas.toDataURL("image/png")
      pdf.addImage(imgData, "PNG", 0, 0, 2.17, 3.58)
      pdf.save(`${card.firstName}_${card.lastName}_card.pdf`)
    }
  }, [card])

  const fullName = [card.firstName, card.lastName].filter(Boolean).join(" ")
  const hasAddress = card.address?.city || card.address?.country
  const addressLine = [card.address?.city, card.address?.country].filter(Boolean).join(", ")

  // Preview scale to fit on screen
  const previewScale = 0.45

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-2xl p-6 max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Export Business Card</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl leading-none">&times;</button>
        </div>

        {/* Card preview — centered, scaled down */}
        <div className="flex justify-center mb-4" style={{ height: CARD_H * previewScale + 10, overflow: "hidden" }}>
          <div
            ref={cardRef}
            style={{
              width: CARD_W,
              height: CARD_H,
              fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
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
                height: 120,
                display: "flex",
                alignItems: "center",
                paddingLeft: 45,
              }}
            >
              <span
                style={{
                  color: "#ffffff",
                  fontSize: 46,
                  letterSpacing: 8,
                  fontWeight: 300,
                }}
              >
                TECXMATE.COM
              </span>
            </div>

            {/* Divider line */}
            <div style={{ height: 4, background: "#7a3df5" }} />

            {/* Content area */}
            <div style={{ padding: "55px 45px 40px 45px", display: "flex", flexDirection: "column", justifyContent: "space-between", height: CARD_H - 124 }}>
              {/* Top — name + title + details */}
              <div>
                {/* Name */}
                <div style={{ fontSize: 48, fontWeight: 800, color: "#1a1a1a", marginBottom: 10, lineHeight: 1.1 }}>
                  {fullName}
                </div>
                {/* Title */}
                <div style={{ fontSize: 20, fontWeight: 400, color: "#555", letterSpacing: 4, textTransform: "uppercase", marginBottom: 40 }}>
                  {card.title}
                </div>

                {/* Contact details */}
                <div style={{ fontSize: 20, color: "#333", lineHeight: 2.1 }}>
                  {hasAddress && (
                    <div><span style={{ fontWeight: 700 }}>Office</span>: {addressLine}</div>
                  )}
                  {card.emails.length > 0 && (
                    <div><span style={{ fontWeight: 700 }}>Email</span>: {card.emails[0].address}</div>
                  )}
                  {card.note && card.note.includes("WeChat") && (
                    <div><span style={{ fontWeight: 700 }}>WeChat</span>: {card.note.replace(/WeChat\s*ID:\s*/i, "")}</div>
                  )}
                  {card.phones.length > 0 && (
                    <div><span style={{ fontWeight: 700 }}>Mobile:</span> {card.phones[0].number}</div>
                  )}
                  {card.phones.length > 0 && (
                    <div><span style={{ fontWeight: 700 }}>WhatsApp & Zalo:</span> {card.phones[0].number}</div>
                  )}
                </div>
              </div>

              {/* Bottom — QR code + "ADD MY CONTACT" */}
              <div style={{ display: "flex", alignItems: "center", gap: 20, marginTop: 30 }}>
                <QRCodeSVG
                  value={vcardUrl}
                  size={120}
                  bgColor="transparent"
                  fgColor="#1a1a1a"
                  level="M"
                  includeMargin={false}
                />
                <div style={{ fontSize: 22, fontWeight: 400, color: "#333", letterSpacing: 3, lineHeight: 1.6 }}>
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
