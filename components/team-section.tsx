"use client"

import { Linkedin, GraduationCap, PenTool, Building2 } from "lucide-react"
import Image from "next/image"

export function TeamSection() {
  const teamMembers = [
    {
      id: 'nikolas',
      name: 'Nikolas Doan 段皇方',
      role: 'CEO & CFO',
      photo: '/avatars/niko_ava_color.jpg',
      description: 'MSc AI/Robotics (NTU, exp. \'26). Former Google Cloud Startups. CEO TECXMATE.COM',
      twitter: 'https://scholar.google.com/citations?hl=en&view_op=list_works&gmla=AH8HC4wBT4T5k1ixLLhNjPNv_RVi-PwijNu8oMXqf4mh7nL21PUT5zluCMjJkZyOBmcdy1_51pRTnYe7erhljl_XOl2nQ3XXV8TW7isW6-0&user=ffn9iV8AAAAJ',
      linkedin: 'https://www.linkedin.com/in/nikolasdoan/'
    },
    {
      id: 'brian',
      name: 'Brian Nguyen 阮文貴',
      role: 'CTO & COO',
      photo: '/avatars/brian_avatar.png',
      description: 'MS Gamification Engineering (NTUST, exp. \'27). Built 3+ apps on App Store. Specialist in game mechanics for learning.',
      twitter: 'https://www.tecxmate.com',
      linkedin: 'https://www.linkedin.com/in/brian-nguyen-587825235/'
    },
    {
      id: 'lynn',
      name: 'Lynn Ta 謝宛伶',
      role: 'Project Manager',
      photo: '/avatars/lynn_avatar.JPG',
      description: '',
      twitter: '',
      linkedin: 'https://www.linkedin.com/in/uyen-linh-ta-a970b1188/'
    },
    {
      id: 'ellis',
      name: 'Ellis Wu 吳賢政',
      role: 'Business Developer',
      photo: '/avatars/ellis_avatar.jpeg',
      description: 'Business Developer specialist focused on strategic partnerships and market expansion.',
      twitter: 'https://www.tecxmate.com',
      linkedin: 'https://www.linkedin.com/in/hsien-cheng-ellis-wu-6a1044297/'
    },
    {
      id: 'jane',
      name: 'Jane Liu 劉美娟',
      role: 'Creative Director',
      photo: '/avatars/jane_avatar.jpeg',
      description: 'Creative director with expertise in UI/UX design and brand identity development.',
      twitter: 'https://www.tecxmate.com',
      linkedin: 'https://www.linkedin.com/in/jane-liu/'
    }
  ]

  return (
    <>
      <section id="team" className="bg-primary py-24 md:py-28 lg:py-32">
        <div className="container px-4 md:px-6 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold md:text-4xl lg:text-5xl tracking-tight text-white">Our Team</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {teamMembers.map((member) => (
              <div
                key={member.id}
              >
                <div
                  className="rounded-none border border-white/10 bg-white shadow-sm overflow-hidden h-full hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="w-full aspect-[3/4] bg-[#e3e3e3]">
                    <Image
                      src={member.photo}
                      alt={member.name}
                      width={600}
                      height={800}
                      className="w-full h-full object-cover object-center"
                    />
                  </div>
                  <div className="p-3 md:p-4 text-center">
                    <h3 className="text-sm md:text-base font-semibold text-alt-black mb-1">{member.name}</h3>
                    <p className="text-xs md:text-sm text-primary font-medium mb-2">{member.role}</p>
                    <div className="flex items-center justify-center gap-2">
                      <a
                        href={member.linkedin}
                        aria-label="LinkedIn"
                        className="p-2 rounded-none bg-alt-gray-100 hover:bg-alt-gray-200 transition-colors"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Linkedin className="h-5 w-5 text-alt-gray-600" strokeWidth={1.25} />
                      </a>
                      {member.twitter && (
                        <a
                          href={member.twitter}
                          aria-label={member.id === 'brian' ? 'Company' : 'Academic'}
                          className="p-2 rounded-none bg-alt-gray-100 hover:bg-alt-gray-200 transition-colors"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {member.id === 'brian' ? (
                            <Building2 className="h-5 w-5 text-alt-gray-600" strokeWidth={1.25} />
                          ) : (
                            <GraduationCap className="h-5 w-5 text-alt-gray-600" strokeWidth={1.25} />
                          )}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </>
  )
}
