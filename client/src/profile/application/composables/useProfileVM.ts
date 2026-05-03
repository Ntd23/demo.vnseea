// Description: Loads backend-backed profile data and exposes tab state for the Nuxt profile page.

import type { ProfileApiResponse, ProfileTabKey } from "../../domain/types/profile.types"
import { createApiProfileRepository } from "../../infrastructure/repositories/ApiProfileRepository"

type ProfileMediaItem = {
  id: number
  title: string
  subtitle: string
}

type ProfileInfoItem = {
  icon: string
  label: string
  value: string
}

type ProfileAboutSection = {
  title: string
  items: ProfileInfoItem[]
}

export function useProfileVM(
  username: Ref<string> | ComputedRef<string>,
  repository = createApiProfileRepository(),
) {
  const { t, locale } = useI18n()
  const activeTab = ref<ProfileTabKey>("timeline")
  const resolvedUsername = computed(() => username.value.trim())

  const { data, status, error, refresh } = useAsyncData(
    () => `profile:${resolvedUsername.value}`,
    () => resolvedUsername.value
      ? repository.getProfileByUsername(resolvedUsername.value)
      : Promise.resolve(null),
    {
      watch: [resolvedUsername],
      default: () => null,
    },
  )

  const formatCount = (value: number) =>
    new Intl.NumberFormat(locale.value === "vi" ? "vi-VN" : "en-US").format(value)

  const completionItems = computed(() => {
    const profile = data.value

    if (!profile?.isOwner) {
      return []
    }

    const items: string[] = []

    if (!profile.avatarUrl) items.push(t("settings.data.fields.avatarImage"))
    if (!profile.coverImage) items.push(t("settings.data.fields.coverImage"))
    if (!profile.bio) items.push(t("settings.data.fields.about"))
    if (!profile.website) items.push(t("settings.data.fields.website"))
    if (!profile.address) items.push(t("settings.data.fields.address"))

    return items
  })

  const copy = computed(() => ({
    tabs: {
      timeline: t("pages.profilePage.tabs.timeline"),
      about: t("pages.profilePage.tabs.about"),
      friends: t("pages.profilePage.tabs.friends"),
      photos: t("pages.profilePage.tabs.photos"),
      videos: t("pages.profilePage.tabs.videos"),
      albums: t("pages.profilePage.tabs.albums"),
    },
    introTitle: t("settings.data.fields.about"),
    introAction: t("components.topbar.settingsNav.editProfile"),
    aboutTitle: t("settings.data.fields.about"),
    friendsTitle: t("pages.profilePage.tabs.friends"),
    friendsAction: t("navigation.mobileMenu.mainNav.findFriends"),
    photosTitle: t("pages.profilePage.tabs.photos"),
    photosAction: t("navigation.leftSidebar.showMore"),
    videosTitle: t("pages.profilePage.tabs.videos"),
    albumsTitle: t("pages.profilePage.tabs.albums"),
    completionTitle: t("settings.section.kind.summary"),
    completionItems: completionItems.value,
  }))

  const tabs = computed(() => [
    { key: "timeline" as const, label: copy.value.tabs.timeline },
    { key: "about" as const, label: copy.value.tabs.about },
    { key: "friends" as const, label: copy.value.tabs.friends },
    { key: "photos" as const, label: copy.value.tabs.photos },
    { key: "videos" as const, label: copy.value.tabs.videos },
    { key: "albums" as const, label: copy.value.tabs.albums },
  ])

  const heroActions = computed(() => {
    const profile = data.value

    if (!profile) {
      return []
    }

    if (profile.isOwner) {
      return [
        {
          id: "edit-profile",
          label: t("components.topbar.settingsNav.editProfile"),
          icon: "i-ph-pencil-simple-duotone",
          variant: "solid" as const,
        },
        {
          id: "settings",
          label: t("components.topbar.settingsNav.settings"),
          icon: "i-ph-gear-six-duotone",
          variant: "soft" as const,
        },
      ]
    }

    return [
      {
        id: "follow-profile",
        label: t("pages.pageDetailPage.followFallback"),
        icon: "i-ph-user-plus-duotone",
        variant: "solid" as const,
      },
      {
        id: "message-profile",
        label: t("pages.pageDetailPage.messageButton"),
        icon: "i-ph-chat-circle-dots-duotone",
        variant: "soft" as const,
      },
    ]
  })

  const buildIntroItems = (profile: ProfileApiResponse) => {
    const items: ProfileInfoItem[] = []

    if (profile.working) {
      items.push({
        icon: "i-ph-briefcase-duotone",
        label: t("settings.data.fields.working"),
        value: profile.working,
      })
    }

    if (profile.school) {
      items.push({
        icon: "i-ph-graduation-cap-duotone",
        label: t("settings.data.fields.school"),
        value: profile.school,
      })
    }

    if (profile.address) {
      items.push({
        icon: "i-ph-map-pin-duotone",
        label: t("settings.data.fields.address"),
        value: profile.address,
      })
    }

    if (profile.website) {
      items.push({
        icon: "i-ph-globe-simple-duotone",
        label: t("settings.data.fields.website"),
        value: profile.website,
      })
    }

    return items
  }

  const buildAboutSections = (profile: ProfileApiResponse) => {
    const sections: ProfileAboutSection[] = []

    const workAndEducation: ProfileInfoItem[] = []
    const contact: ProfileInfoItem[] = []
    const basics: ProfileInfoItem[] = []

    if (profile.working) {
      workAndEducation.push({
        icon: "i-ph-briefcase-duotone",
        label: t("settings.data.fields.working"),
        value: profile.working,
      })
    }

    if (profile.school) {
      workAndEducation.push({
        icon: "i-ph-graduation-cap-duotone",
        label: t("settings.data.fields.school"),
        value: profile.school,
      })
    }

    if (profile.email) {
      contact.push({
        icon: "i-ph-envelope-simple-duotone",
        label: t("settings.data.fields.email"),
        value: profile.email,
      })
    }

    if (profile.phone) {
      contact.push({
        icon: "i-ph-phone-duotone",
        label: t("settings.data.fields.phone"),
        value: profile.phone,
      })
    }

    if (profile.website) {
      contact.push({
        icon: "i-ph-globe-simple-duotone",
        label: t("settings.data.fields.website"),
        value: profile.website,
      })
    }

    if (profile.gender) {
      basics.push({
        icon: "i-ph-gender-intersex-duotone",
        label: t("settings.data.fields.gender"),
        value: profile.gender,
      })
    }

    if (profile.birthday) {
      basics.push({
        icon: "i-ph-calendar-blank-duotone",
        label: t("settings.data.fields.birthday"),
        value: profile.birthday,
      })
    }

    if (profile.relationship) {
      basics.push({
        icon: "i-ph-heart-duotone",
        label: t("settings.data.fields.relationship"),
        value: profile.relationship,
      })
    }

    if (workAndEducation.length > 0) {
      sections.push({
        title: `${t("settings.data.fields.working")} & ${t("settings.data.fields.school")}`,
        items: workAndEducation,
      })
    }

    if (contact.length > 0) {
      sections.push({
        title: t("settings.data.fields.website"),
        items: contact,
      })
    }

    if (basics.length > 0) {
      sections.push({
        title: t("settings.data.fields.verification"),
        items: basics,
      })
    }

    return sections
  }

  const profile = computed(() => {
    const apiProfile = data.value

    if (!apiProfile) {
      return null
    }

    return {
      username: apiProfile.username,
      displayName: apiProfile.displayName,
      headline: apiProfile.headline,
      bio: apiProfile.bio,
      coverImage: apiProfile.coverImage,
      avatarUrl: apiProfile.avatarUrl,
      avatarText: apiProfile.avatarText,
      verified: apiProfile.verified,
      isOwner: apiProfile.isOwner,
      roleBadge: apiProfile.headline || t("navigation.headerBar.profile"),
      statusBadge: apiProfile.statusText,
      stats: [
        { label: t("pages.pageDetailPage.followStat"), value: formatCount(apiProfile.followersCount) },
        { label: t("pages.profilePage.stats.following"), value: formatCount(apiProfile.followingCount) },
        { label: t("pages.profilePage.stats.pages"), value: formatCount(apiProfile.likedPagesCount) },
        { label: t("pages.profilePage.stats.groups"), value: formatCount(apiProfile.joinedGroupsCount) },
      ],
      intro: buildIntroItems(apiProfile),
      aboutSections: buildAboutSections(apiProfile),
    }
  })

  const timelinePosts = computed(() => [])

  const friends = computed(() => {
    const profile = data.value

    if (!profile) {
      return []
    }

    const friendMap = new Map<number, (typeof profile.followers)[number]>()

    for (const entry of [...profile.followers, ...profile.following]) {
      if (!friendMap.has(entry.id)) {
        friendMap.set(entry.id, entry)
      }
    }

    return [...friendMap.values()]
  })

  const photos = computed<ProfileMediaItem[]>(() => [])
  const videos = computed<ProfileMediaItem[]>(() => [])
  const albums = computed<ProfileMediaItem[]>(() => [])

  watch(resolvedUsername, () => {
    activeTab.value = "timeline"
  })

  return {
    activeTab,
    albums,
    copy,
    error,
    friends,
    heroActions,
    pending: computed(() => status.value === "pending"),
    photos,
    profile,
    refresh,
    status,
    tabs,
    timelinePosts,
    videos,
  }
}
