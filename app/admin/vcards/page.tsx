"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { QRCodeSVG } from "qrcode.react"
import { defaultVCards } from "@/lib/vcard"
import type { VCardData } from "@/lib/vcard"

const emptyCard: VCardData = {
  id: "",
  prefix: "",
  firstName: "",
  lastName: "",
  suffix: "",
  org: "TECXMATE Corporation Ltd.",
  title: "",
  phones: [],
  emails: [],
  website: "https://www.tecxmate.com",
  address: { street: "", city: "", state: "", zip: "", country: "" },
  note: "",
  photoUrl: "",
}

export default function VCardAdminPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [authenticated, setAuthenticated] = useState(false)
  const [cards, setCards] = useState<VCardData[]>([])
  const [editing, setEditing] = useState<VCardData | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const siteUrl = typeof window !== "undefined" ? window.location.origin : ""

  const authHeaders = { "x-admin-username": username, "x-admin-password": password }

  const fetchCards = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/vcards", { headers: authHeaders })
      if (res.ok) {
        setCards(await res.json())
      } else {
        setCards(defaultVCards)
      }
    } catch {
      setCards(defaultVCards)
    } finally {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username, password])

  const handleLogin = async () => {
    const res = await fetch("/api/vcards", { headers: authHeaders })
    if (res.ok) {
      setAuthenticated(true)
      setCards(await res.json())
    } else {
      setMessage("Invalid username or password")
    }
  }

  useEffect(() => {
    if (authenticated) fetchCards()
  }, [authenticated, fetchCards])

  const handleSave = async () => {
    if (!editing) return

    // Validate required fields
    if (!editing.firstName.trim() || !editing.lastName.trim()) {
      setMessage("First name and last name are required")
      return
    }

    // Auto-generate ID for new cards
    const cardToSave = { ...editing }
    if (isNew && !cardToSave.id) {
      cardToSave.id = `${cardToSave.firstName.toLowerCase().replace(/\s+/g, "-")}-${cardToSave.lastName.toLowerCase().replace(/\s+/g, "-")}`
    }

    setSaving(true)
    setMessage("")
    try {
      const res = await fetch("/api/vcards", {
        method: isNew ? "POST" : "PUT",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify(cardToSave),
      })
      if (res.ok) {
        setMessage("Saved successfully!")
        setEditing(null)
        setIsNew(false)
        fetchCards()
      } else {
        const err = await res.json()
        setMessage(err.error || "Failed to save")
      }
    } catch {
      setMessage("Error saving")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this contact? This cannot be undone.")) return
    try {
      const res = await fetch("/api/vcards", {
        method: "DELETE",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({ id }),
      })
      if (res.ok) {
        fetchCards()
      } else {
        const err = await res.json()
        alert(err.error || "Failed to delete")
      }
    } catch {
      alert("Error deleting")
    }
  }

  const handleAddNew = () => {
    setEditing({ ...emptyCard })
    setIsNew(true)
    setMessage("")
  }

  const handlePhotoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !editing) return

    // Convert to base64 data URI for the vCard PHOTO field
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      setEditing({ ...editing, photoUrl: dataUrl })
    }
    reader.readAsDataURL(file)
  }

  const updateField = (field: keyof VCardData, value: string) => {
    if (!editing) return
    setEditing({ ...editing, [field]: value })
  }

  const updatePhone = (index: number, field: "type" | "number", value: string) => {
    if (!editing) return
    const phones = [...editing.phones]
    phones[index] = { ...phones[index], [field]: value }
    setEditing({ ...editing, phones })
  }

  const addPhone = () => {
    if (!editing) return
    setEditing({ ...editing, phones: [...editing.phones, { type: "Work", number: "" }] })
  }

  const removePhone = (index: number) => {
    if (!editing) return
    setEditing({ ...editing, phones: editing.phones.filter((_, i) => i !== index) })
  }

  const updateEmail = (index: number, field: "type" | "address", value: string) => {
    if (!editing) return
    const emails = [...editing.emails]
    emails[index] = { ...emails[index], [field]: value }
    setEditing({ ...editing, emails })
  }

  const addEmail = () => {
    if (!editing) return
    setEditing({ ...editing, emails: [...editing.emails, { type: "Work", address: "" }] })
  }

  const removeEmail = (index: number) => {
    if (!editing) return
    setEditing({ ...editing, emails: editing.emails.filter((_, i) => i !== index) })
  }

  const updateAddress = (field: keyof VCardData["address"], value: string) => {
    if (!editing) return
    setEditing({ ...editing, address: { ...editing.address, [field]: value } })
  }

  // --- Login screen ---
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">vCard Admin</h1>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            className="w-full px-4 py-2 border border-gray-300 rounded-md mb-3 focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            placeholder="Password"
            className="w-full px-4 py-2 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-primary"
          />
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

  // --- Edit / Add form ---
  if (editing) {
    const photoPreview = editing.photoUrl || ""
    const isDataUri = photoPreview.startsWith("data:")

    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {isNew ? "Add New Contact" : `Edit: ${editing.firstName} ${editing.lastName}`}
            </h2>
            <button
              onClick={() => { setEditing(null); setIsNew(false); setMessage("") }}
              className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
            >
              &times;
            </button>
          </div>

          <div className="space-y-6">
            {/* Photo */}
            <fieldset>
              <legend className="text-sm font-semibold text-gray-700 mb-2">Photo</legend>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  {photoPreview ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={photoPreview}
                      alt="Preview"
                      className="w-20 h-20 object-cover rounded-full border-2 border-gray-200"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-2xl font-bold border-2 border-gray-200">
                      {editing.firstName?.[0] || "?"}
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200"
                  >
                    Upload Photo
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoFile}
                    className="hidden"
                  />
                  <p className="text-xs text-gray-400">or paste a URL below</p>
                  <input
                    type="url"
                    value={isDataUri ? "" : editing.photoUrl}
                    onChange={(e) => updateField("photoUrl", e.target.value)}
                    placeholder="https://example.com/photo.jpg"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  {photoPreview && (
                    <button
                      type="button"
                      onClick={() => updateField("photoUrl", "")}
                      className="text-xs text-red-500 hover:underline"
                    >
                      Remove photo
                    </button>
                  )}
                </div>
              </div>
            </fieldset>

            {/* Name */}
            <fieldset>
              <legend className="text-sm font-semibold text-gray-700 mb-2">Contact</legend>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <input
                  value={editing.prefix}
                  onChange={(e) => updateField("prefix", e.target.value)}
                  placeholder="Prefix (Mr./Ms.)"
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <input
                  value={editing.suffix}
                  onChange={(e) => updateField("suffix", e.target.value)}
                  placeholder="Suffix"
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <input
                value={editing.firstName}
                onChange={(e) => updateField("firstName", e.target.value)}
                placeholder="First Name *"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <input
                value={editing.lastName}
                onChange={(e) => updateField("lastName", e.target.value)}
                placeholder="Last Name *"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </fieldset>

            {/* Occupation */}
            <fieldset>
              <legend className="text-sm font-semibold text-gray-700 mb-2">Occupation</legend>
              <input
                value={editing.org}
                onChange={(e) => updateField("org", e.target.value)}
                placeholder="Organization"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <input
                value={editing.title}
                onChange={(e) => updateField("title", e.target.value)}
                placeholder="Title / Role"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </fieldset>

            {/* Phones */}
            <fieldset>
              <legend className="text-sm font-semibold text-gray-700 mb-2">Phone</legend>
              {editing.phones.map((phone, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <select
                    value={phone.type}
                    onChange={(e) => updatePhone(i, "type", e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="Work">Work</option>
                    <option value="Cell">Cell</option>
                    <option value="Home">Home</option>
                  </select>
                  <input
                    value={phone.number}
                    onChange={(e) => updatePhone(i, "number", e.target.value)}
                    placeholder="+1-234-567-8900"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button onClick={() => removePhone(i)} className="text-red-500 hover:text-red-700 px-2">&times;</button>
                </div>
              ))}
              <button onClick={addPhone} className="text-sm text-primary hover:underline">Add phone</button>
            </fieldset>

            {/* Emails */}
            <fieldset>
              <legend className="text-sm font-semibold text-gray-700 mb-2">Email</legend>
              {editing.emails.map((email, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <select
                    value={email.type}
                    onChange={(e) => updateEmail(i, "type", e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="Work">Work</option>
                    <option value="Home">Home</option>
                  </select>
                  <input
                    value={email.address}
                    onChange={(e) => updateEmail(i, "address", e.target.value)}
                    placeholder="email@example.com"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button onClick={() => removeEmail(i)} className="text-red-500 hover:text-red-700 px-2">&times;</button>
                </div>
              ))}
              <button onClick={addEmail} className="text-sm text-primary hover:underline">Add email</button>
            </fieldset>

            {/* Website */}
            <fieldset>
              <legend className="text-sm font-semibold text-gray-700 mb-2">Website</legend>
              <input
                value={editing.website}
                onChange={(e) => updateField("website", e.target.value)}
                placeholder="https://www.example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </fieldset>

            {/* Address */}
            <fieldset>
              <legend className="text-sm font-semibold text-gray-700 mb-2">Address</legend>
              <input
                value={editing.address.street}
                onChange={(e) => updateAddress("street", e.target.value)}
                placeholder="Street"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <div className="grid grid-cols-2 gap-3 mb-3">
                <input
                  value={editing.address.city}
                  onChange={(e) => updateAddress("city", e.target.value)}
                  placeholder="City"
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <input
                  value={editing.address.state}
                  onChange={(e) => updateAddress("state", e.target.value)}
                  placeholder="State"
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  value={editing.address.zip}
                  onChange={(e) => updateAddress("zip", e.target.value)}
                  placeholder="ZIP"
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <input
                  value={editing.address.country}
                  onChange={(e) => updateAddress("country", e.target.value)}
                  placeholder="Country"
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </fieldset>

            {/* Note */}
            <fieldset>
              <legend className="text-sm font-semibold text-gray-700 mb-2">Note</legend>
              <textarea
                value={editing.note}
                onChange={(e) => updateField("note", e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </fieldset>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-8">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-primary text-white py-2 rounded-md font-medium hover:bg-primary/90 disabled:opacity-50"
            >
              {saving ? "Saving..." : isNew ? "Add Contact" : "Save"}
            </button>
            <button
              onClick={() => { setEditing(null); setIsNew(false); setMessage("") }}
              className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-md font-medium hover:bg-gray-200"
            >
              Cancel
            </button>
          </div>
          {message && (
            <p className={`text-sm mt-3 text-center ${message.includes("required") || message.includes("Failed") || message.includes("Error") || message.includes("exists") ? "text-red-500" : "text-green-600"}`}>
              {message}
            </p>
          )}
        </div>
      </div>
    )
  }

  // --- Card list with QR codes ---
  const defaultIds = defaultVCards.map((d) => d.id)

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900">vCard Manager</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={handleAddNew}
              className="bg-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90"
            >
              + Add Person
            </button>
            <button
              onClick={() => {
                setAuthenticated(false)
                setUsername("")
                setPassword("")
              }}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Logout
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map((card) => {
              const vcardUrl = `${siteUrl}/api/vcard/${card.id}`
              const isCustom = !defaultIds.includes(card.id)
              return (
                <div key={card.id} className="bg-white rounded-lg shadow-md p-6 relative">
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

                  {/* URL for scanning */}
                  <p className="text-xs text-gray-400 text-center break-all mb-4">{vcardUrl}</p>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setEditing({ ...card }); setIsNew(false); setMessage("") }}
                      className="flex-1 bg-primary text-white py-2 rounded-md text-sm font-medium hover:bg-primary/90"
                    >
                      Edit
                    </button>
                    <a
                      href={vcardUrl}
                      download
                      className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-md text-sm font-medium hover:bg-gray-200 text-center"
                    >
                      Download
                    </a>
                    {isCustom && (
                      <button
                        onClick={() => handleDelete(card.id)}
                        className="px-3 py-2 bg-red-50 text-red-600 rounded-md text-sm font-medium hover:bg-red-100"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
