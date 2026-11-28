import type { useLanguage } from "@/components/language-provider"

type Key = Parameters<ReturnType<typeof useLanguage>["t"]>[0]

/** The navbar's Products menu: each product's page, or its card on the homepage until it has one. */
export const NAV_PRODUCTS: { id: string; name: string; sub: Key; href: string; external?: boolean }[] = [
  { id: "tecxmap", name: "TecxMap", sub: "ph_tecxmap_sub", href: "/products/tecxmap" },
  { id: "datatecx", name: "DataTecx", sub: "ph_datatecx_sub", href: "/products/datatecx" },
  { id: "alphatecx", name: "AlphaTecx", sub: "ph_alphatecx_sub", href: "/products/alphatecx" },
  { id: "etecx", name: "eTecx", sub: "ph_etecx_sub", href: "/products/etecx" },
  { id: "voicetecx", name: "VoiceTecx", sub: "ph_voicetecx_sub", href: "/products/voicetecx" },
  { id: "tecxwork", name: "TecxWork", sub: "ph_tecxwork_sub", href: "/products/tecxwork" },
]

export const CAREERS_URL = "https://work.tecxmate.com"
