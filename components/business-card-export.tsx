"use client"

import { useRef, useCallback } from "react"
import { QRCodeSVG } from "qrcode.react"
import html2canvas from "html2canvas"
import { jsPDF } from "jspdf"
import type { VCardData } from "@/lib/vcard"

// Standard business card at 300 DPI: 3.5" x 2" = 1050 x 600px
const CARD_W = 1050
const CARD_H = 600

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
      // Standard business card: 3.5 x 2 inches
      const pdf = new jsPDF({ orientation: "landscape", unit: "in", format: [3.5, 2] })
      const imgData = canvas.toDataURL("image/png")
      pdf.addImage(imgData, "PNG", 0, 0, 3.5, 2)
      pdf.save(`${card.firstName}_${card.lastName}_card.pdf`)
    }
  }, [card])

  const fullName = [card.firstName, card.lastName].filter(Boolean).join(" ")
  const hasAddress = card.address?.city || card.address?.country
  const addressLine = [card.address?.city, card.address?.country].filter(Boolean).join(", ")

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-2xl p-6 max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Export Business Card</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl leading-none">&times;</button>
        </div>

        {/* Card preview — centered */}
        <div className="flex justify-center mb-6 overflow-auto">
          <div
            ref={cardRef}
            style={{
              width: CARD_W,
              height: CARD_H,
              fontFamily: "Helvetica, Arial, sans-serif",
              position: "relative",
              background: "#faf9f6",
              overflow: "hidden",
              flexShrink: 0,
              transform: "scale(0.5)",
              transformOrigin: "top center",
            }}
          >
            {/* Purple header bar */}
            <div
              style={{
                background: "#8c52ff",
                height: 100,
                display: "flex",
                alignItems: "center",
                paddingLeft: 50,
              }}
            >
              <span
                style={{
                  color: "#ffffff",
                  fontSize: 36,
                  letterSpacing: 6,
                  fontWeight: 300,
                }}
              >
                TECXMATE.COM
              </span>
            </div>

            {/* Content area */}
            <div style={{ padding: "40px 50px 30px 50px", display: "flex", justifyContent: "space-between", height: CARD_H - 100 }}>
              {/* Left side — contact info */}
              <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", flex: 1 }}>
                <div>
                  {/* Name */}
                  <div style={{ fontSize: 38, fontWeight: 700, color: "#1a1a1a", marginBottom: 6 }}>
                    {fullName}
                  </div>
                  {/* Title */}
                  <div style={{ fontSize: 18, fontWeight: 400, color: "#555", letterSpacing: 3, textTransform: "uppercase", marginBottom: 30 }}>
                    {card.title}
                  </div>

                  {/* Contact details */}
                  <div style={{ fontSize: 16, color: "#333", lineHeight: 2.2 }}>
                    {hasAddress && (
                      <div><span style={{ fontWeight: 700 }}>Office: </span>{addressLine}</div>
                    )}
                    {card.emails.length > 0 && (
                      <div><span style={{ fontWeight: 700 }}>Email: </span>{card.emails[0].address}</div>
                    )}
                    {card.note && card.note.includes("WeChat") && (
                      <div><span style={{ fontWeight: 700 }}>WeChat: </span>{card.note.replace(/WeChat\s*ID:\s*/i, "")}</div>
                    )}
                    {card.phones.length > 0 && (
                      <div><span style={{ fontWeight: 700 }}>Mobile: </span>{card.phones[0].number}</div>
                    )}
                    {card.phones.length > 0 && (
                      <div><span style={{ fontWeight: 700 }}>WhatsApp & Zalo: </span>{card.phones[0].number}</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right side — QR code + branding */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", justifyContent: "flex-end", marginLeft: 30 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <QRCodeSVG
                    value={vcardUrl}
                    size={100}
                    bgColor="transparent"
                    fgColor="#1a1a1a"
                    level="M"
                    includeMargin={false}
                  />
                  <span style={{ fontSize: 18, fontWeight: 400, color: "#333", letterSpacing: 3 }}>
                    TECXMATE.COM
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scaled height spacer */}
        <div style={{ marginTop: -CARD_H * 0.5 + 20 }} />

        {/* Export buttons */}
        <div className="flex gap-3 justify-center">
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
