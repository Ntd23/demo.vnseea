import { createCommunitySlug } from "../../types/community"
import { useMockSocialData } from "./useMockSocialData"

export interface MockPokeRecord {
  id: string
  name: string
  initials: string
  href: string
  role: string
  timeLabel: string
  mutualLabel: string
  contextLabel: string
  note: string
  accent: string
  online?: boolean
}

function createProfilePath(name: string) {
  return `/@${createCommunitySlug(name) || "member"}`
}

const accentPalette = [
  "#2563eb",
  "#0f766e",
  "#ea580c",
  "#7c3aed",
  "#0891b2",
]

export function useMockPokeData() {
  const { contacts, suggestedUsers } = useMockSocialData()

  const pokeRecords: MockPokeRecord[] = [
    ...suggestedUsers.slice(0, 3).map((user, index) => ({
      id: `suggested-poke-${user.id}`,
      name: user.name,
      initials: user.avatar,
      href: createProfilePath(user.name),
      role: user.role,
      timeLabel: index === 0 ? "Vừa xong" : `${index + 1} giờ trước`,
      mutualLabel: `${user.mutual} bạn chung`,
      contextLabel: "Đề xuất từ mạng lưới kết nối",
      note: "Người này vừa ghé profile và gửi một cú chọc nhẹ để mở lại cuộc trò chuyện.",
      accent: accentPalette[index % accentPalette.length],
      online: index % 2 === 0,
    })),
    ...contacts
      .filter(contact => contact.online)
      .slice(0, 2)
      .map((contact, index) => ({
        id: `contact-poke-${contact.id}`,
        name: contact.name,
        initials: contact.avatar,
        href: createProfilePath(contact.name),
        role: "Đang hoạt động",
        timeLabel: `${index + 3} giờ trước`,
        mutualLabel: `${index + 2} bạn chung`,
        contextLabel: "Có mặt trong danh sách chat online",
        note: "Một cách chạm nhẹ để nhắc lại kết nối mà không cần mở thread nhắn tin ngay.",
        accent: accentPalette[(suggestedUsers.length + index) % accentPalette.length],
        online: true,
      })),
  ]

  return {
    pokeRecords,
  }
}
