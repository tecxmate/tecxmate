export interface VCardData {
  id: string
  prefix: string
  firstName: string
  lastName: string
  suffix: string
  org: string
  title: string
  phones: { type: string; number: string }[]
  emails: { type: string; address: string }[]
  website: string
  address: {
    street: string
    city: string
    state: string
    zip: string
    country: string
  }
  note: string
  photoUrl: string
}

export function generateVcf(data: VCardData): string {
  const lines: string[] = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${data.lastName};${data.firstName};${data.prefix};${data.suffix}`,
    `FN:${[data.prefix, data.firstName, data.lastName, data.suffix].filter(Boolean).join(" ")}`,
  ]

  if (data.org) lines.push(`ORG:${data.org}`)
  if (data.title) lines.push(`TITLE:${data.title}`)

  for (const phone of data.phones) {
    if (phone.number) {
      lines.push(`TEL;TYPE=${phone.type.toUpperCase()},VOICE:${phone.number}`)
    }
  }

  for (const email of data.emails) {
    if (email.address) {
      lines.push(`EMAIL;TYPE=${email.type.toUpperCase()}:${email.address}`)
    }
  }

  if (data.website) lines.push(`URL:${data.website}`)

  const addr = data.address
  if (addr.street || addr.city || addr.country) {
    lines.push(`ADR;TYPE=WORK:;;${addr.street};${addr.city};${addr.state};${addr.zip};${addr.country}`)
  }

  if (data.photoUrl) {
    if (data.photoUrl.startsWith("data:")) {
      // Embedded base64 photo: extract type and base64 data
      const match = data.photoUrl.match(/^data:image\/(\w+);base64,(.+)$/)
      if (match) {
        const imgType = match[1].toUpperCase()
        const b64 = match[2]
        lines.push(`PHOTO;ENCODING=b;TYPE=${imgType}:${b64}`)
      }
    } else {
      lines.push(`PHOTO;TYPE=JPEG;VALUE=URI:${data.photoUrl}`)
    }
  }

  if (data.note) lines.push(`NOTE:${data.note}`)

  lines.push("END:VCARD")
  return lines.join("\r\n") + "\r\n"
}

export const defaultVCards: VCardData[] = [
  {
    id: "nikolas",
    prefix: "Mr.",
    firstName: "Nikolas",
    lastName: "Doan",
    suffix: "",
    org: "TECXMATE Corporation Ltd.",
    title: "CEO & CFO",
    phones: [{ type: "Work", number: "+84-33-746-0602" }],
    emails: [{ type: "Work", address: "ceo@tecxmate.com" }],
    website: "https://www.tecxmate.com",
    address: { street: "Villa Park Complex, Phu Huu Ward", city: "Ho Chi Minh City", state: "", zip: "700000", country: "Vietnam" },
    note: "MSc AI/Robotics (NTU). Former Google Cloud Startups.",
    photoUrl: "",
  },
  {
    id: "brian",
    prefix: "Mr.",
    firstName: "Brian",
    lastName: "Nguyen",
    suffix: "",
    org: "TECXMATE Corporation Ltd.",
    title: "CTO & COO",
    phones: [],
    emails: [],
    website: "https://www.tecxmate.com",
    address: { street: "", city: "", state: "", zip: "", country: "" },
    note: "MS Gamification Engineering (NTUST). Built 3+ apps on App Store.",
    photoUrl: "",
  },
  {
    id: "lynn",
    prefix: "Ms.",
    firstName: "Lynn",
    lastName: "Ta",
    suffix: "",
    org: "TECXMATE Corporation Ltd.",
    title: "Project Manager",
    phones: [],
    emails: [],
    website: "https://www.tecxmate.com",
    address: { street: "", city: "", state: "", zip: "", country: "" },
    note: "",
    photoUrl: "",
  },
  {
    id: "ellis",
    prefix: "Mr.",
    firstName: "Ellis",
    lastName: "Wu",
    suffix: "",
    org: "TECXMATE Corporation Ltd.",
    title: "Business Developer",
    phones: [],
    emails: [],
    website: "https://www.tecxmate.com",
    address: { street: "", city: "", state: "", zip: "", country: "" },
    note: "Business Developer specialist focused on strategic partnerships and market expansion.",
    photoUrl: "",
  },
  {
    id: "jane",
    prefix: "Ms.",
    firstName: "Jane",
    lastName: "Liu",
    suffix: "",
    org: "TECXMATE Corporation Ltd.",
    title: "Creative Director",
    phones: [],
    emails: [],
    website: "https://www.tecxmate.com",
    address: { street: "", city: "", state: "", zip: "", country: "" },
    note: "Creative director with expertise in UI/UX design and brand identity development.",
    photoUrl: "",
  },
  {
    id: "andrea",
    prefix: "Mr.",
    firstName: "Andrea",
    lastName: "Peretto",
    suffix: "",
    org: "TECXMATE Corporation Ltd.",
    title: "Business Developer",
    phones: [{ type: "Cell", number: "+84903317572" }],
    emails: [{ type: "Work", address: "andrea@tecxmate.com" }],
    website: "https://www.tecxmate.com",
    address: { street: "", city: "", state: "", zip: "", country: "" },
    note: "WeChat ID: Andrea_Prt",
    photoUrl: "",
  },
]
