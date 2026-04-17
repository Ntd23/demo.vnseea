<template>
  <div v-if="group && previewGroup" class="mx-auto max-w-[1280px] space-y-5 pb-10">
    <CommunityCreationHeaderCard
      eyebrow="Group settings"
      :title="`Cài đặt ${group.name}`"
      description="Điều chỉnh hồ sơ hiển thị, quyền tham gia và một số chính sách vận hành chính của community này."
      icon="i-ph-gear-six-fill"
      :highlights="[memberCountLabel, selectedPrivacyLabel, selectedCategoryLabel]"
    />

    <div class="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.08fr)_340px]">
      <section class="min-w-0 space-y-4">
        <CommunityGroupSettingsBasicsCard
          v-model="draft"
          :group-path="groupPath"
        />

        <CommunityGroupSettingsControlsCard v-model="draft" />

        <CommunitySettingsSectionCard
          eyebrow="Hoàn tất"
          title="Hành động nhanh"
          description="Flow settings này đang là UI mock. Bạn có thể quay lại trang nhóm hoặc tiếp tục tinh chỉnh trước khi nối API."
          icon="i-ph-floppy-disk-back-bold"
        >
          <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div class="rounded-[18px] bg-[#f8fbff] px-4 py-3 text-[13px] leading-6 text-slate-500">
              {{ enabledPolicies }}/{{ totalPolicies }} chính sách đang bật. Quyền hiển thị hiện tại là
              <span class="font-bold text-[#243b63]">{{ selectedPrivacyLabel.toLowerCase() }}</span>.
            </div>

            <div class="flex flex-col-reverse gap-3 sm:flex-row sm:items-center">
              <NuxtLink
                :to="groupPath"
                class="inline-flex h-12 items-center justify-center rounded-full border border-[#dbe3f2] bg-white px-5 text-[14px] font-bold text-[#243b63] transition hover:border-[#c8d6f2] hover:text-[#0000ff]"
              >
                <Icon name="i-ph-arrow-left-bold" class="mr-2 h-4 w-4" />
                Quay lại nhóm
              </NuxtLink>

              <button
                class="inline-flex h-12 items-center justify-center rounded-[16px] bg-[#0000ff] px-5 text-[14px] font-extrabold text-white shadow-[0_12px_24px_rgba(0,0,255,0.24)] transition hover:-translate-y-0.5 hover:bg-[#0000e0]"
                type="button"
              >
                <Icon name="i-ph-floppy-disk-bold" class="mr-2 h-4 w-4" />
                Lưu thay đổi
              </button>
            </div>
          </div>
        </CommunitySettingsSectionCard>
      </section>

      <CommunityGroupSettingsSidebar
        :group="previewGroup"
        :members="visibleMembers"
        :member-count-label="memberCountLabel"
        :privacy-label="selectedPrivacyLabel"
        :privacy-description="selectedPrivacyDescription"
        :category-label="selectedCategoryLabel"
        :enabled-policies="enabledPolicies"
        :total-policies="totalPolicies"
        :show-member-directory="draft.showMemberDirectory"
      />
    </div>
  </div>

  <div v-else class="mx-auto max-w-[960px] pb-10 pt-4">
    <section class="rounded-[30px] border border-[#dbe3f2] bg-white px-6 py-10 text-center shadow-[0_14px_34px_rgba(15,35,110,0.06)] sm:px-8 sm:py-16">
      <FoundationEmptyState
        icon="i-ph-gear-six-fill"
        title="Không tìm thấy nhóm để cài đặt"
        description="Slug nhóm này chưa có trong dữ liệu mock hiện tại. Hãy quay lại danh sách nhóm và chọn một community hợp lệ."
      />

      <div class="mt-6 flex justify-center">
        <NuxtLink
          to="/groups"
          class="inline-flex h-12 items-center justify-center rounded-[16px] bg-[#0000ff] px-5 text-[14px] font-extrabold text-white shadow-[0_12px_24px_rgba(0,0,255,0.24)] transition hover:-translate-y-0.5 hover:bg-[#0000e0]"
        >
          Quay lại danh sách nhóm
        </NuxtLink>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import {
  communityCategoryOptions,
  communityPrivacyOptions,
  createCommunityGroupSettingsDraft,
  getCommunityGroupPath,
  getCommunityOptionDescription,
  getCommunityOptionLabel,
} from "../../../types/community"
import type {
  CommunityGroupRecord,
  CommunityGroupSettingsDraft,
} from "../../../types/community"

const route = useRoute()

const {
  group,
  members,
  memberCountLabel,
} = useCommunityGroupDetail(computed(() => String(route.params.group || "")))

const draft = ref<CommunityGroupSettingsDraft>(
  createCommunityGroupSettingsDraft(),
)

watch(group, (value) => {
  draft.value = createCommunityGroupSettingsDraft(value)
}, { immediate: true })

const normalizedTags = computed(() =>
  draft.value.tags
    .split(",")
    .map(tag => tag.trim())
    .filter(Boolean),
)

const normalizedGuidelines = computed(() =>
  draft.value.guidelines
    .split("\n")
    .map(rule => rule.trim())
    .filter(Boolean),
)

const previewGroup = computed<CommunityGroupRecord | null>(() => {
  if (!group.value) return null

  return {
    ...group.value,
    name: draft.value.name.trim() || group.value.name,
    slug: draft.value.slug.trim() || group.value.slug,
    summary: draft.value.summary.trim() || group.value.summary,
    website: draft.value.website.trim() || group.value.website,
    locationLabel: draft.value.locationLabel.trim() || group.value.locationLabel,
    privacy: draft.value.privacy,
    category: draft.value.category,
    tags: normalizedTags.value.length > 0 ? normalizedTags.value : group.value.tags,
    guidelines: normalizedGuidelines.value.length > 0
      ? normalizedGuidelines.value
      : group.value.guidelines,
  }
})

const selectedPrivacyLabel = computed(() =>
  getCommunityOptionLabel(
    communityPrivacyOptions,
    draft.value.privacy,
    "Quyền riêng tư",
  ),
)

const selectedPrivacyDescription = computed(() =>
  getCommunityOptionDescription(
    communityPrivacyOptions,
    draft.value.privacy,
    "Chưa chọn quyền riêng tư cho nhóm.",
  ),
)

const selectedCategoryLabel = computed(() =>
  getCommunityOptionLabel(
    communityCategoryOptions,
    draft.value.category,
    "Chưa phân loại",
  ),
)

const totalPolicies = 5

const enabledPolicies = computed(() =>
  [
    draft.value.joinApproval,
    draft.value.postApproval,
    draft.value.allowMemberInvites,
    draft.value.showMemberDirectory,
    draft.value.welcomePostEnabled,
  ].filter(Boolean).length,
)

const visibleMembers = computed(() =>
  members.value.slice(0, draft.value.showMemberDirectory ? 5 : 3),
)

const groupPath = computed(() =>
  group.value ? getCommunityGroupPath(group.value.slug) : "/groups",
)

useSeoMeta({
  title: computed(() =>
    group.value ? `Cài đặt ${group.value.name} | VNSEEA` : "Cài đặt nhóm | VNSEEA",
  ),
  description: computed(() =>
    group.value?.summary || "Quản lý thiết lập nhóm trên VNSEEA.",
  ),
})
</script>
