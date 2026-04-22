import { computed, toValue, type MaybeRefOrGetter } from "vue"
import { resolveI18nMessage } from "~/utils/resolveI18nMessage"
import { useMockSocialData } from "./useMockSocialData"
import {
  getCommunityGroupBySlug,
  getCommunityGroupMembers,
} from "../../types/community"
import type { CommunityGroupRecord } from "../../types/community"

function formatLocalizedCount(value: number, locale: string) {
  return new Intl.NumberFormat(locale === "vi" ? "vi-VN" : "en-US").format(value)
}

export function useCommunityGroupDetail(slugSource: MaybeRefOrGetter<string>) {
  const { t, tm, rt, locale, te } = useI18n()
  const { posts } = useMockSocialData()
  const localized = <T>(key: string) =>
    resolveI18nMessage(tm(key), message => rt(message as never)) as T
  const translateValue = (value?: string, fallback = "") => {
    if (!value) return fallback
    return te(value) ? t(value) : value
  }

  const slug = computed(() => String(toValue(slugSource) || ""))
  const rawGroup = computed(() => getCommunityGroupBySlug(slug.value))
  const rawMembers = computed(() => getCommunityGroupMembers(slug.value))

  const memberDictionary = computed(() =>
    localized<Record<string, Array<{ role: string; meta: string }>>>("pages.groupDetailPage.members"),
  )

  const group = computed<CommunityGroupRecord | null>(() => {
    return rawGroup.value ?? null
  })

  const members = computed(() =>
    rawMembers.value.map((member, index) => {
      const localizedMember = memberDictionary.value?.[slug.value]?.[index]
      return localizedMember ? { ...member, ...localizedMember } : member
    }),
  )

  const privacyLabel = computed(() =>
    t(`pages.groupDetailPage.privacy.${group.value?.privacy || "public"}`),
  )

  const privacyDescription = computed(() =>
    t(`pages.groupDetailPage.privacyDescription.${group.value?.privacy || "public"}`),
  )

  const categoryLabel = computed(() =>
    t(`pages.groupDetailPage.categories.${group.value?.category || "auto"}`),
  )

  const memberCountLabel = computed(() =>
    t("pages.groupDetailPage.memberCount", {
      count: formatLocalizedCount(group.value?.members ?? 0, locale.value),
    }),
  )

  const onlineCountLabel = computed(() =>
    t("pages.groupDetailPage.onlineCount", {
      count: formatLocalizedCount(members.value.filter(member => member.online).length, locale.value),
    }),
  )

  const groupPosts = computed(() => {
    if (!group.value) return []

    return posts.slice(0, 3).map((post, index) => {
      const member = members.value[index % Math.max(members.value.length, 1)]
      const groupName = translateValue(group.value?.name)
      const activityLabel = translateValue(group.value?.activityLabel)
      const groupTags = group.value.tags.map(tag => translateValue(tag)).filter(Boolean)
      const topic = groupTags[index % Math.max(groupTags.length, 1)] || "community"
      const memberRole = translateValue(member?.role, t("pages.groupDetailPage.memberRoleFallback"))

      return {
        ...post,
        id: (group.value?.id || 0) * 100 + index,
        author: member?.name || post.author,
        role: t("pages.groupDetailPage.postRole", {
          group: groupName,
          role: memberRole,
        }),
        audience: groupName,
        time: index === 0
          ? t("pages.groupDetailPage.postTime1")
          : index === 1
            ? t("pages.groupDetailPage.postTime2")
            : t("pages.groupDetailPage.postTime3"),
        text: index === 0
          ? t("pages.groupDetailPage.postText1", { group: groupName, topic })
          : index === 1
            ? t("pages.groupDetailPage.postText2", { group: groupName, activity: activityLabel })
            : t("pages.groupDetailPage.postText3", { group: groupName, topic }),
        tags: Array.from(new Set([`#${topic}`, ...groupTags.map(tag => `#${tag}`), ...post.tags])).slice(0, 4),
      }
    })
  })

  return {
    slug,
    group,
    members,
    privacyLabel,
    privacyDescription,
    categoryLabel,
    memberCountLabel,
    onlineCountLabel,
    groupPosts,
  }
}
