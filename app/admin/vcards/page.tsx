"use client"

import { useState, useEffect, useCallback } from "react"
import { QRCodeSVG } from "qrcode.react"
import { BusinessCardExport } from "@/components/business-card-export"
import type { VCardData } from "@/lib/vcard"

export default function VCardAdminPage() {
  const [password, setPassword] = useState("")
  const [authenticated, setAuthenticated] = useState(false)
  const [cards, setCards] = useState<VCardData[]>([])
  const [exporting, setExporting] = useState<VCardData | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  const siteUrl = typeof window !== "undefined" ? window.location.origin : ""

  const fetchCards = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/vcards", {
        headers: { "x-admin-password": password },
      })
      if (res.ok) {
        setCards(await res.json())
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [password])

  const handleLogin = async () => {
    const res = await fetch("/api/vcards", {
      headers: { "x-admin-password": password },
    })
    if (res.ok) {
      setAuthenticated(true)
      setCards(await res.json())
    } else {
      setMessage("Invalid password")
    }
  }

  useEffect(() => {
    if (authenticated) fetchCards()
  }, [authenticated, fetchCards])

  // --- Login screen ---
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">vCard Admin</h1>
          <div className="relative mb-4">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              placeholder="Password"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary pr-16"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 hover:text-gray-700"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          <button
            onClick={handleLogin}
            className="w-full bg-primary text-white py-2 rounded-md font-medium hover:bg-primary/90"
          >
            Login
          </button>
          {message && <p className="text-red-500 text-sm mt-3">{message}</p>}
        </div>
      </div>
    )
  }

  // --- Card list with QR codes ---
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900">vCard Manager</h1>
          <button
            onClick={() => {
              setAuthenticated(false)
              setPassword("")
            }}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Logout
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map((card) => {
              const vcardUrl = `${siteUrl}/api/vcard/${card.id}`
              return (
                <div key={card.id} className="bg-white rounded-lg shadow-md p-6">
                  {/* Photo + QR Code */}
                  <div className="flex justify-center mb-4">
                    {card.photoUrl ? (
                      <div className="flex items-center gap-4">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={card.photoUrl}
                          alt={`${card.firstName} ${card.lastName}`}
                          className="w-16 h-16 object-cover rounded-full border-2 border-gray-200"
                        />
                        <QRCodeSVG
                          value={vcardUrl}
                          size={120}
                          bgColor="#ffffff"
                          fgColor="#000000"
                          level="M"
                          includeMargin={false}
                        />
                      </div>
                    ) : (
                      <QRCodeSVG
                        value={vcardUrl}
                        size={160}
                        bgColor="#ffffff"
                        fgColor="#000000"
                        level="M"
                        includeMargin={false}
                      />
                    )}
                  </div>

                  {/* Info */}
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {[card.prefix, card.firstName, card.lastName, card.suffix].filter(Boolean).join(" ")}
                    </h3>
                    <p className="text-sm text-primary font-medium">{card.title}</p>
                    <p className="text-xs text-gray-500">{card.org}</p>
                    {card.phones.length > 0 && (
                      <p className="text-xs text-gray-500 mt-1">{card.phones[0].number}</p>
                    )}
                    {card.emails.length > 0 && (
                      <p className="text-xs text-gray-500">{card.emails[0].address}</p>
                    )}
                  </div>

                  {/* URL */}
                  <p className="text-xs text-gray-400 text-center break-all mb-4">{vcardUrl}</p>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setExporting({ ...card })}
                      className="flex-1 bg-primary text-white py-2 rounded-md text-sm font-medium hover:bg-primary/90"
                    >
                      Export Card
                    </button>
                    <a
                      href={vcardUrl}
                      download
                      className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-md text-sm font-medium hover:bg-gray-200 text-center"
                    >
                      Download .vcf
                    </a>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Export modal */}
      {exporting && (
        <BusinessCardExport
          card={exporting}
          siteUrl={siteUrl}
          onClose={() => setExporting(null)}
        />
      )}
    </div>
  )
}
