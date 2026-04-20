<template>
  <div v-if="group && previewGroup" class="mx-auto max-w-[1280px] space-y-5 pb-10">
    <CommunityCreationHeaderCard
      eyebrow="community.settings.eyebrow"
      :title="$t('community.settings.title', { name: $t(group.name) })"
      description="community.settings.desc"
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
          eyebrow="community.settings.finish.eyebrow"
          title="community.settings.finish.title"
          description="community.settings.finish.desc"
          icon="i-ph-floppy-disk-back-bold"
        >
          <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div class="rounded-[18px] bg-[#f8fbff] px-4 py-3 text-[13px] leading-6 text-slate-500">
              {{ $t('community.settings.finish.status', { enabled: enabledPolicies, total: totalPolicies, privacy: $t(selectedPrivacyLabel).toLowerCase() }) }}
            </div>

            <div class="flex flex-col-reverse gap-3 sm:flex-row sm:items-center">
              <NuxtLink
                :to="groupPath"
                class="inline-flex h-12 items-center justify-center rounded-full border border-[#dbe3f2] bg-white px-5 text-[14px] font-bold text-[#243b63] transition hover:border-[#c8d6f2] hover:text-[#0000ff]"
              >
                <Icon name="i-ph-arrow-left-bold" class="mr-2 h-4 w-4" />
                {{ $t('community.settings.finish.back') }}
              </NuxtLink>

              <button
                class="inline-flex h-12 items-center justify-center rounded-[16px] bg-[#0000ff] px-5 text-[14px] font-extrabold text-white shadow-[0_12px_24px_rgba(0,0,255,0.24)] transition hover:-translate-y-0.5 hover:bg-[#0000e0]"
                type="button"
              >
                <Icon name="i-ph-floppy-disk-bold" class="mr-2 h-4 w-4" />
                {{ $t('community.settings.finish.save') }}
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
        :title="$t('community.settings.empty.title')"
        :description="$t('community.settings.empty.desc')"
      />

      <div class="mt-6 flex justify-center">
        <NuxtLink
          to="/groups"
          class="inline-flex h-12 items-center justify-center rounded-[16px] bg-[#0000ff] px-5 text-[14px] font-extrabold text-white shadow-[0_12px_24px_rgba(0,0,255,0.24)] transition hover:-translate-y-0.5 hover:bg-[#0000e0]"
        >
          {{ $t('community.settings.empty.back') }}
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

const { t, locale } = useI18n()
const route = useRoute()

const {
  group,
  members,
  memberCountLabel,
} = useCommunityGroupDetail(computed(() => String(route.params.group || "")))

const draft = ref<CommunityGroupSettingsDraft>(
  createCommunityGroupSettingsDraft(),
)

const syncDraftWithGroup = () => {
  if (group.value) {
    draft.value = createCommunityGroupSettingsDraft(group.value)
    draft.value.name = t(group.value.name)
    draft.value.summary = t(group.value.summary)
    draft.value.locationLabel = t(group.value.locationLabel)
    draft.value.tags = group.value.tags.map(tag => t(tag)).join(", ")
    draft.value.guidelines = group.value.guidelines.map(rule => t(rule)).join("\n")
  }
}

watch(group, syncDraftWithGroup, { immediate: true })
watch(locale, syncDraftWithGroup)

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
    "community.settings.controls.privacyFallback",
  ),
)

const selectedPrivacyDescription = computed(() =>
  getCommunityOptionDescription(
    communityPrivacyOptions,
    draft.value.privacy,
    "community.settings.controls.noPrivacy",
  ),
)

const selectedCategoryLabel = computed(() =>
  getCommunityOptionLabel(
    communityCategoryOptions,
    draft.value.category,
    "community.groups.card.noCategory",
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
    group.value ? `${t('community.settings.title', { name: t(group.value.name) })} | VNSEEA` : `${t('community.settings.eyebrow')} | VNSEEA`,
  ),
  description: computed(() =>
    group.value ? t(group.value.summary) : t('community.settings.desc'),
  ),
})
</script>
