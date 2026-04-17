<template>
  <div v-if="page && previewPage" class="mx-auto max-w-[1280px] space-y-5 pb-10">
    <CommunityCreationHeaderCard
      eyebrow="Page settings"
      :title="`Cài đặt ${page.name}`"
      description="Điều chỉnh hồ sơ fanpage, CTA chính và một số tín hiệu hiển thị trước khi nối API quản trị thật."
      icon="i-ph-sliders-horizontal-bold"
      :highlights="[selectedCategoryLabel, selectedCtaLabel, visibilityLabel]"
    />

    <div class="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.08fr)_340px]">
      <section class="min-w-0 space-y-4">
        <CommunityPageSettingsBasicsCard
          v-model="draft"
          :page-path="pagePath"
        />

        <CommunityPageSettingsControlsCard v-model="draft" />

        <CommunitySettingsSectionCard
          eyebrow="Hoàn tất"
          title="Hành động nhanh"
          description="Flow page settings này hiện là UI mock. Bạn có thể quay lại fanpage để so sánh hoặc tiếp tục tinh chỉnh trước khi nối API."
          icon="i-ph-floppy-disk-back-bold"
        >
          <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div class="rounded-[18px] bg-[#f8fbff] px-4 py-3 text-[13px] leading-6 text-slate-500">
              {{ enabledPolicies }}/{{ totalPolicies }} tín hiệu đang bật. CTA chính hiện tại là
              <span class="font-bold text-[#243b63]">{{ selectedCtaLabel.toLowerCase() }}</span>.
            </div>

            <div class="flex flex-col-reverse gap-3 sm:flex-row sm:items-center">
              <NuxtLink
                :to="pagePath"
                class="inline-flex h-12 items-center justify-center rounded-full border border-[#dbe3f2] bg-white px-5 text-[14px] font-bold text-[#243b63] transition hover:border-[#c8d6f2] hover:text-[#0000ff]"
              >
                <Icon name="i-ph-arrow-left-bold" class="mr-2 h-4 w-4" />
                Quay lại fanpage
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

      <CommunityPageSettingsSidebar
        :page="previewPage"
        :category-label="selectedCategoryLabel"
        :follower-count-label="followerCountLabel"
        :like-count-label="likeCountLabel"
        :selected-cta-label="selectedCtaLabel"
        :enabled-policies="enabledPolicies"
        :total-policies="totalPolicies"
        :show-follower-count="draft.showFollowerCount"
        :show-like-count="draft.showLikeCount"
        :allow-messages="draft.allowMessages"
        :recommend-related-pages="draft.recommendRelatedPages"
      />
    </div>
  </div>

  <div v-else class="mx-auto max-w-[960px] pb-10 pt-4">
    <section class="rounded-[30px] border border-[#dbe3f2] bg-white px-6 py-10 text-center shadow-[0_14px_34px_rgba(15,35,110,0.06)] sm:px-8 sm:py-16">
      <FoundationEmptyState
        icon="i-ph-sliders-horizontal-fill"
        title="Không tìm thấy fanpage để cài đặt"
        description="Slug page này chưa có trong dữ liệu mock hiện tại. Hãy quay lại danh sách hoặc flow tạo trang để dựng một fanpage hợp lệ."
      />

      <div class="mt-6 flex justify-center">
        <NuxtLink
          to="/pages"
          class="inline-flex h-12 items-center justify-center rounded-[16px] bg-[#0000ff] px-5 text-[14px] font-extrabold text-white shadow-[0_12px_24px_rgba(0,0,255,0.24)] transition hover:-translate-y-0.5 hover:bg-[#0000e0]"
        >
          Quay lại fanpage
        </NuxtLink>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import {
  appendCommunityQuery,
  communityPageCategoryOptions,
  createCommunityPageSettingsDraft,
  getCommunityOptionLabel,
  getCommunityPagePath,
} from "../../../types/community"
import type {
  CommunityPageRecord,
  CommunityPageSettingsDraft,
} from "../../../types/community"

const route = useRoute()

const {
  page,
  categoryLabel: baseCategoryLabel,
  followerCountLabel,
  likeCountLabel,
} = useCommunityPageDetail(
  computed(() => String(route.params.page || "")),
  computed(() => route.query),
)

const draft = ref<CommunityPageSettingsDraft>(
  createCommunityPageSettingsDraft(),
)

watch(page, (value) => {
  draft.value = createCommunityPageSettingsDraft(value || undefined)
}, { immediate: true })

const normalizedTags = computed(() =>
  draft.value.tags
    .split(",")
    .map(tag => tag.trim())
    .filter(Boolean),
)

const previewPage = computed<CommunityPageRecord | null>(() => {
  if (!page.value) return null

  return {
    ...page.value,
    name: draft.value.name.trim() || page.value.name,
    slug: draft.value.slug.trim() || page.value.slug,
    summary: draft.value.summary.trim() || page.value.summary,
    website: draft.value.showWebsite
      ? (draft.value.website.trim() || page.value.website)
      : undefined,
    locationLabel: draft.value.locationLabel.trim() || page.value.locationLabel,
    category: draft.value.category,
    ctaLabel: draft.value.ctaLabel.trim() || page.value.ctaLabel,
    responseLabel: draft.value.responseLabel.trim() || page.value.responseLabel,
    ownerLabel: draft.value.ownerLabel.trim() || page.value.ownerLabel,
    tags: normalizedTags.value.length > 0 ? normalizedTags.value : page.value.tags,
  }
})

const selectedCategoryLabel = computed(() =>
  getCommunityOptionLabel(
    communityPageCategoryOptions,
    draft.value.category,
    baseCategoryLabel.value,
  ),
)

const selectedCtaLabel = computed(() =>
  draft.value.ctaLabel.trim() || page.value?.ctaLabel || "Theo dõi",
)

const totalPolicies = 5

const enabledPolicies = computed(() =>
  [
    draft.value.allowMessages,
    draft.value.showFollowerCount,
    draft.value.showLikeCount,
    draft.value.showWebsite,
    draft.value.recommendRelatedPages,
  ].filter(Boolean).length,
)

const visibilityLabel = computed(() =>
  draft.value.showWebsite ? "Website đang hiển thị" : "Website đang ẩn",
)

const pagePath = computed(() =>
  page.value
    ? appendCommunityQuery(getCommunityPagePath(page.value.slug), route.query)
    : "/pages",
)

useSeoMeta({
  title: computed(() =>
    page.value ? `Cài đặt ${page.value.name} | VNSEEA` : "Cài đặt page | VNSEEA",
  ),
  description: computed(() =>
    page.value?.summary || "Quản lý thiết lập fanpage trên VNSEEA.",
  ),
})
</script>
