"use client"

import { useEffect, useState } from "react"
import { Linkedin, GraduationCap, Building2, X } from "lucide-react"
import Image from "next/image"
import { useLanguage } from "@/components/language-provider"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import type { Locale, TeamMember } from "@/lib/site-content"

// SSR fallback — keeps the section populated before the live content arrives and if the API fails.
const DEFAULT_TEAM: TeamMember[] = [
  {
    id: "nikolas",
    name: "Nikolas Doan 段皇方",
    role: { en: "CEO & CFO", vi: "CEO & CFO", zh: "CEO & CFO" },
    description: {
      en: "MSc AI/Robotics (NTU, exp. '26). Former Google Cloud Startups. CEO TECXMATE.COM",
      vi: "Thạc sĩ AI/Robotics (NTU, dự kiến '26). Cựu Google Cloud Startups. CEO TECXMATE.COM",
      zh: "NTU 人工智慧／機器人碩士（預計 2026 年取得）。前 Google Cloud Startups。TECXMATE.COM 執行長",
    },
    photo: "/avatars/niko_ava_color.jpg",
    linkedin: "https://www.linkedin.com/in/nikolasdoan/",
    twitter:
      "https://scholar.google.com/citations?hl=en&view_op=list_works&gmla=AH8HC4wBT4T5k1ixLLhNjPNv_RVi-PwijNu8oMXqf4mh7nL21PUT5zluCMjJkZyOBmcdy1_51pRTnYe7erhljl_XOl2nQ3XXV8TW7isW6-0&user=ffn9iV8AAAAJ",
    socialIcon: "academic",
  },
  {
    id: "brian",
    name: "Brian Nguyen 阮文貴",
    role: { en: "CTO & COO", vi: "CTO & COO", zh: "CTO & COO" },
    description: {
      en: "MS Gamification Engineering (NTUST, exp. '27). Built 3+ apps on App Store. Specialist in game mechanics for learning.",
      vi: "Thạc sĩ Kỹ thuật Game hóa (NTUST, dự kiến '27). Đã phát hành hơn 3 ứng dụng trên App Store. Chuyên gia về cơ chế game ứng dụng vào học tập.",
      zh: "NTUST 遊戲化工程碩士（預計 2027 年取得）。已在 App Store 推出 3 款以上應用程式。專長為學習導向的遊戲機制。",
    },
    photo: "/avatars/brian_avatar.png",
    linkedin: "https://www.linkedin.com/in/brian-nguyen-587825235/",
    twitter: "https://www.tecxmate.com",
    socialIcon: "company",
  },
  {
    id: "lynn",
    name: "Lynn Ta 謝宛伶",
    role: { en: "Project Manager", vi: "Quản lý dự án", zh: "專案經理" },
    description: { en: "", vi: "", zh: "" },
    photo: "/avatars/lynn_avatar.JPG",
    linkedin: "https://www.linkedin.com/in/uyen-linh-ta-a970b1188/",
    twitter: "",
    socialIcon: "academic",
  },
  {
    id: "andrea",
    name: "Andrea Peretto",
    role: { en: "Business Developer", vi: "Phát triển kinh doanh", zh: "業務開發" },
    description: { en: "", vi: "", zh: "" },
    photo: "/avatars/peretto_avatar.JPG",
    linkedin: "https://vn.linkedin.com/in/peretto-andrea-53624738",
    twitter: "https://www.tecxmate.com",
    socialIcon: "company",
  },
]

const HIDDEN_TEAM_MEMBER_IDS = new Set(["jane"])

function visibleTeamMembers(teamMembers: TeamMember[]) {
  return teamMembers.filter((member) => !HIDDEN_TEAM_MEMBER_IDS.has(member.id))
}

/** Bio text for the active language, falling back to English. Empty means "no bio to show". */
function memberBio(member: TeamMember, language: Locale) {
  return (member.description[language] || member.description.en || "").trim()
}

function teamPhotoClassName(memberId: string) {
  const baseClassName = "w-full h-full object-cover object-center"

  if (memberId === "andrea") {
    return `${baseClassName} scale-[1.3] -translate-y-[13%]`
  }

  return baseClassName
}

export function TeamSection() {
  const { t, language } = useLanguage()
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(visibleTeamMembers(DEFAULT_TEAM))
  const [openMemberId, setOpenMemberId] = useState<string | null>(null)
  const openMember = teamMembers.find((member) => member.id === openMemberId) ?? null

  useEffect(() => {
    fetch("/api/content", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((c) => {
        if (Array.isArray(c?.team)) setTeamMembers(visibleTeamMembers(c.team))
      })
      .catch(() => {})
  }, [])

  return (
    <>
      <section id="team" className="bg-primary py-24 md:py-28 lg:py-32">
        <div className="container px-4 md:px-6 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold md:text-4xl lg:text-5xl tracking-tight text-white" suppressHydrationWarning>{t("team_heading")}</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {teamMembers.map((member) => {
              const bio = memberBio(member, language)

              return (
              <div
                key={member.id}
              >
                <div
                  className="rounded-none bg-card shadow-sm overflow-hidden h-full hover:shadow-xl md:hover:-translate-y-1 transition-[transform,box-shadow] duration-300 will-change-[transform]"
                >
                  {bio ? (
                    <button
                      type="button"
                      onClick={() => setOpenMemberId(member.id)}
                      aria-label={`${member.name} — read introduction`}
                      className="block w-full aspect-[3/4] bg-[#e3e3e3] overflow-hidden cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2"
                    >
                      <Image
                        src={member.photo}
                        alt={member.name}
                        width={600}
                        height={800}
                        className={teamPhotoClassName(member.id)}
                      />
                    </button>
                  ) : (
                    <div className="w-full aspect-[3/4] bg-[#e3e3e3]">
                      <Image
                        src={member.photo}
                        alt={member.name}
                        width={600}
                        height={800}
                        className={teamPhotoClassName(member.id)}
                      />
                    </div>
                  )}
                  <div className="p-3 md:p-4 text-center">
                    <h3 className="text-sm md:text-base font-semibold text-foreground mb-1">{member.name}</h3>
                    <p className="text-xs md:text-sm text-primary font-medium mb-2">{member.role[language] || member.role.en}</p>
                    <div className="flex items-center justify-center gap-2">
                      {member.linkedin && (
                        <a
                          href={member.linkedin}
                          aria-label="LinkedIn"
                          className="p-2 rounded-none bg-muted hover:bg-muted/80 transition-colors"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Linkedin className="h-5 w-5 text-muted-foreground" strokeWidth={1.25} />
                        </a>
                      )}
                      {member.twitter && (
                        <a
                          href={member.twitter}
                          aria-label={member.socialIcon === 'company' ? 'Company' : 'Academic'}
                          className="p-2 rounded-none bg-muted hover:bg-muted/80 transition-colors"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {member.socialIcon === 'company' ? (
                            <Building2 className="h-5 w-5 text-muted-foreground" strokeWidth={1.25} />
                          ) : (
                            <GraduationCap className="h-5 w-5 text-muted-foreground" strokeWidth={1.25} />
                          )}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              )
            })}
          </div>
        </div>
      </section>

      <Dialog open={Boolean(openMember)} onOpenChange={(open) => !open && setOpenMemberId(null)}>
        {/* Square corners to match the cards (the base sets sm:rounded-lg), no focus
            ring on open, and a slower expo ease so it settles instead of snapping. */}
        <DialogContent className="max-w-3xl overflow-hidden rounded-none focus:outline-none sm:rounded-none duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]">
          {openMember && (
            <div className="relative grid sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
              <DialogClose
                aria-label="Close"
                className="absolute right-3 top-3 z-10 rounded-none bg-background/80 p-2 text-muted-foreground backdrop-blur transition-colors hover:bg-background hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <X className="h-5 w-5" strokeWidth={1.5} />
              </DialogClose>

              <div className="aspect-[4/3] overflow-hidden bg-[#e3e3e3] sm:aspect-auto sm:h-[26rem]">
                <Image
                  src={openMember.photo}
                  alt={openMember.name}
                  width={600}
                  height={800}
                  className={teamPhotoClassName(openMember.id)}
                />
              </div>

              <div className="flex flex-col justify-center p-6 sm:p-10">
                <DialogTitle className="text-2xl font-semibold leading-tight md:text-3xl">
                  {openMember.name}
                </DialogTitle>
                <p className="mt-2 text-base font-medium text-primary">
                  {openMember.role[language] || openMember.role.en}
                </p>
                <DialogDescription className="mt-5 text-base leading-relaxed text-muted-foreground">
                  {memberBio(openMember, language)}
                </DialogDescription>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
