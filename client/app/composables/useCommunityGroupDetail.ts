import { computed, toValue, type MaybeRefOrGetter } from "vue"
import { useMockSocialData } from "./useMockSocialData"
import {
  communityCategoryOptions,
  communityPrivacyOptions,
  formatCommunityMemberCount,
  getCommunityGroupBySlug,
  getCommunityGroupMembers,
  getCommunityOptionDescription,
  getCommunityOptionLabel,
} from "../../types/community"

export function useCommunityGroupDetail(slugSource: MaybeRefOrGetter<string>) {
  const { posts } = useMockSocialData()

  const slug = computed(() => String(toValue(slugSource) || ""))
  const group = computed(() => getCommunityGroupBySlug(slug.value))
  const members = computed(() => getCommunityGroupMembers(slug.value))

  const privacyLabel = computed(() =>
    group.value
      ? getCommunityOptionLabel(communityPrivacyOptions, group.value.privacy, "Nhóm")
      : "Nhóm",
  )

  const privacyDescription = computed(() =>
    group.value
      ? getCommunityOptionDescription(communityPrivacyOptions, group.value.privacy, "Cài đặt quyền riêng tư của nhóm.")
      : "Cài đặt quyền riêng tư của nhóm.",
  )

  const categoryLabel = computed(() =>
    group.value
      ? getCommunityOptionLabel(communityCategoryOptions, group.value.category, "Chưa phân loại")
      : "Chưa phân loại",
  )

  const memberCountLabel = computed(() =>
    group.value
      ? formatCommunityMemberCount(group.value.members)
      : formatCommunityMemberCount(0),
  )

  const onlineCountLabel = computed(() =>
    `${members.value.filter(member => member.online).length} người đang online`,
  )

  const groupPosts = computed(() => {
    if (!group.value) return []

    return posts.slice(0, 3).map((post, index) => {
      const member = members.value[index % Math.max(members.value.length, 1)]
      const topic = group.value?.tags[index % Math.max(group.value.tags.length, 1)] || "community"

      return {
        ...post,
        id: group.value.id * 100 + index,
        author: member?.name || post.author,
        role: `${group.value.name} · ${member?.role || "Thành viên"}`,
        audience: group.value.name,
        time: index === 0 ? "5 phút trước" : index === 1 ? "37 phút trước" : "2 giờ trước",
        text: index === 0
          ? `Trong ${group.value.name}, mọi người đang thảo luận rất sôi về chủ đề ${topic}. Đây là bài ghim nhắc nhanh những câu hỏi nên kèm ngữ cảnh thật để nhận góp ý chất lượng hơn.`
          : index === 1
            ? `Tổng hợp nhanh cho tuần này của ${group.value.name}: ${group.value.activityLabel.toLowerCase()}. Thành viên mới có thể đọc thread này để nắm chủ đề nóng và nội quy trước khi đăng bài đầu tiên.`
            : `Một chủ đề đang được quan tâm trong ${group.value.name}: kinh nghiệm thực tế, bài học rút ra và các nguồn tham khảo tốt nhất cho tag #${topic}.`,
        tags: Array.from(new Set([`#${topic}`, ...group.value.tags.map(tag => `#${tag}`), ...post.tags])).slice(0, 4),
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
