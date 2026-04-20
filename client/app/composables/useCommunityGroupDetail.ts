import { computed, toValue, type MaybeRefOrGetter } from "vue"
import { useI18n } from "vue-i18n"
import { useMockSocialData } from "./useMockSocialData"
import {
  communityCategoryOptions,
  communityPrivacyOptions,
  getCommunityGroupBySlug,
  getCommunityGroupMembers,
  getCommunityOptionDescription,
  getCommunityOptionLabel,
} from "../../types/community"

export function useCommunityGroupDetail(slugSource: MaybeRefOrGetter<string>) {
  const { t } = useI18n()
  const { posts } = useMockSocialData()

  const slug = computed(() => String(toValue(slugSource) || ""))
  const group = computed(() => getCommunityGroupBySlug(slug.value))
  const members = computed(() => getCommunityGroupMembers(slug.value))

  const privacyLabel = computed(() =>
    group.value
      ? getCommunityOptionLabel(communityPrivacyOptions, group.value.privacy, "community.settings.controls.privacyFallback")
      : "community.settings.controls.privacyFallback",
  )

  const privacyDescription = computed(() =>
    group.value
      ? getCommunityOptionDescription(communityPrivacyOptions, group.value.privacy, "community.settings.controls.noPrivacy")
      : "community.settings.controls.noPrivacy",
  )

  const categoryLabel = computed(() =>
    group.value
      ? getCommunityOptionLabel(communityCategoryOptions, group.value.category, "community.groups.card.noCategory")
      : "community.groups.card.noCategory",
  )

  const memberCountLabel = computed(() =>
    t("community.groups.format.members", { count: group.value?.members || 0 }),
  )

  const onlineCountLabel = computed(() =>
    t("community.groups.format.online", { count: members.value.filter(member => member.online).length }),
  )

  const groupPosts = computed(() => {
    if (!group.value) return []

    return posts.slice(0, 3).map((post, index) => {
      const member = members.value[index % Math.max(members.value.length, 1)]
      const topic = group.value?.tags[index % Math.max(group.value.tags.length, 1)] || "community"
      const groupName = t(group.value?.name || "")

      return {
        ...post,
        id: (group.value?.id || 0) * 100 + index,
        author: member?.name || post.author,
        role: t("community.groups.post.role", { group: groupName, role: member?.role || "Thành viên" }),
        audience: groupName,
        time: index === 0
          ? t("community.groups.post.time.minutes", { count: 5 })
          : index === 1
            ? t("community.groups.post.time.minutes", { count: 37 })
            : t("community.groups.post.time.hours", { count: 2 }),
        text: index === 0
          ? t("community.groups.post.text.pinned", { group: groupName, topic })
          : index === 1
            ? t("community.groups.post.text.summary", { group: groupName, activity: t(group.value?.activityLabel || "").toLowerCase() })
            : t("community.groups.post.text.detail", { group: groupName, topic }),
        tags: Array.from(new Set([`#${topic}`, ...(group.value?.tags.map(tag => `#${tag}`) || []), ...post.tags])).slice(0, 4),
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
