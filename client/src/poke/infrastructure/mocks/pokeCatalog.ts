import { computed } from "vue"
import { createCommunitySlug } from "../../../../types/community"
import { useMockSocialData } from "../../../../app/composables/useMockSocialData"
import type { MockPokeRecord } from "../../domain/types/poke.types"

function createProfilePath(name: string) {
  return `/@${createCommunitySlug(name) || "member"}`
}

const accentPalette = [
  "#2563eb",
  "#0369a1",
  "#ea580c",
  "#7c3aed",
  "#0891b2",
]

export function useMockPokeData() {
  const { t } = useI18n()
  const { contacts, suggestedUsers } = useMockSocialData()

  const pokeRecords = computed<MockPokeRecord[]>(() => [
    ...suggestedUsers.slice(0, 3).map((user, index) => ({
      id: `suggested-poke-${user.id}`,
      name: user.name,
      initials: user.avatar,
      href: createProfilePath(user.name),
      role: user.role,
      timeLabel: index === 0 ? t("pages.pokePage.justNow") : t("pages.pokePage.hoursAgo", { count: index + 1 }),
      mutualLabel: t("pages.pokePage.mutualFriends", { count: user.mutual }),
      contextLabel: t("pages.pokePage.suggestionContext"),
      note: t("pages.pokePage.suggestionNote"),
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
        role: t("pages.pokePage.activeNow"),
        timeLabel: t("pages.pokePage.hoursAgo", { count: index + 3 }),
        mutualLabel: t("pages.pokePage.mutualFriends", { count: index + 2 }),
        contextLabel: t("pages.pokePage.onlineChatContext"),
        note: t("pages.pokePage.onlineChatNote"),
        accent: accentPalette[(suggestedUsers.length + index) % accentPalette.length],
        online: true,
      })),
  ])

  return {
    pokeRecords,
  }
}
