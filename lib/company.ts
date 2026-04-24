/**
 * Centralized company information for Tecxmate
 * Update this file when company details change.
 */

export const company = {
  /** Brand/trading name */
  name: "Tecxmate",
  /** Legal names by locale */
  legalName: {
    en: "TECXMATE COMPANY LIMITED",
    vi: "CÔNG TY TNHH TECXMATE",
  },
  /** Business formation type */
  formation: "Limited Liability Company (LLC)",
  /** Headquarters address (Vietnam) */
  address: {
    street: "Villa Park Complex, Phu Huu Ward",
    locality: "Ho Chi Minh City",
    country: "Vietnam",
    countryCode: "VN",
  },
  /** Tax identification number */
  taxNumber: "0319431089",
  /** Operating markets */
  operatingMarkets: ["Taiwan", "US", "Vietnam"],
  /** Contact email */
  contactEmail: "official@tecxmate.com",
  /** Phone numbers by region (display + tel link format) */
  phone: {
    us: { display: "(+1) 617-272-9992", tel: "+16172729992" },
    tw: { display: "(+886) 966-860-602", tel: "+886966860602" },
    vn: { display: "(+84) 33-746-0602", tel: "+84337460602" },
  },
  /** Website URL */
  website: process.env.NEXT_PUBLIC_SITE_URL || "https://www.tecxmate.com",
} as const
