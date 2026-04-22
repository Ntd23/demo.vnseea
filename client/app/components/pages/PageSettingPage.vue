<template>
  <div v-if="page && previewPage" class="mx-auto max-w-[1280px] space-y-5 pb-10">
    <CommunityCreationHeaderCard
      :eyebrow="$t('community.pageSettings.eyebrow')"
      :title="$t('community.pageSettings.title', { name: $t(page.name) })"
      :description="$t('community.pageSettings.desc')"
      icon="i-ph-sliders-horizontal-bold"
      :highlights="[selectedCategoryLabel, selectedCtaLabel, visibilityLabel]"
    />

    <div class="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.08fr)_340px]">
      <UForm
        :state="draft"
        :validate="validateDraft"
        class="min-w-0 space-y-4"
        @submit="handleSave"
        @error="handleSaveError"
      >
        <CommunityPageSettingsBasicsCard
          v-model="draft"
          :page-path="pagePath"
        />

        <CommunityPageSettingsControlsCard v-model="draft" />

        <CommunitySettingsSectionCard
          :eyebrow="$t('community.pageSettings.finish.eyebrow')"
          :title="$t('community.pageSettings.finish.title')"
          :description="$t('community.pageSettings.finish.desc')"
          icon="i-ph-floppy-disk-back-bold"
        >
          <div class="flex flex-col gap-4">
            <div class="rounded-[18px] bg-[#f8fbff] px-4 py-3 text-[13px] leading-6 text-slate-500">
              <span v-html="$t('community.pageSettings.finish.status', { enabled: enabledPolicies, total: totalPolicies, cta: selectedCtaLabel.toLowerCase() })" />
            </div>

            <UAlert
              v-if="statusAlert"
              :color="statusAlert.color"
              variant="subtle"
              :icon="statusAlert.icon"
              :title="statusAlert.title"
              :description="statusAlert.description"
              class="rounded-[20px]"
              aria-live="polite"
            />

            <div class="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              <UButton
                :to="pagePath"
                color="neutral"
                variant="outline"
                size="xl"
                :disabled="isBusy"
                class="justify-center rounded-full"
              >
                <Icon name="i-ph-arrow-left-bold" class="mr-2 h-4 w-4" />
                {{ $t("community.pageSettings.finish.back") }}
              </UButton>

              <UButton
                type="submit"
                color="primary"
                variant="solid"
                size="xl"
                :loading="isBusy"
                :disabled="isSaveDisabled"
                class="justify-center rounded-[16px] px-5 text-[14px] font-extrabold shadow-[0_12px_24px_rgba(0,0,255,0.24)]"
              >
                <Icon name="i-ph-floppy-disk-bold" class="mr-2 h-4 w-4" />
                {{ $t("community.pageSettings.finish.save") }}
              </UButton>
            </div>
          </div>
        </CommunitySettingsSectionCard>
      </UForm>

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
        :title="$t('community.pageSettings.empty.title')"
        :description="$t('community.pageSettings.empty.desc')"
      />

      <div class="mt-6 flex justify-center">
        <NuxtLink
          to="/pages"
          class="inline-flex h-12 items-center justify-center rounded-[16px] bg-[#0000ff] px-5 text-[14px] font-extrabold text-white shadow-[0_12px_24px_rgba(0,0,255,0.24)] transition hover:-translate-y-0.5 hover:bg-[#0000e0]"
        >
          {{ $t("community.pageSettings.empty.back") }}
        </NuxtLink>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useStorage, watchDebounced } from "@vueuse/core"
import {
  appendCommunityQuery,
  communityPageCategoryOptions,
  createCommunityPageSettingsDraft,
  createCommunitySlug,
  getCommunityOptionLabel,
  getCommunityPagePath,
} from "../../../types/community"
import type {
  CommunityPageRecord,
  CommunityPageSettingsDraft,
} from "../../../types/community"

type PageSettingsState = "idle" | "loading" | "success" | "error"

type PageSettingsError = {
  name?: keyof CommunityPageSettingsDraft
  message: string
}

const route = useRoute()
const toast = useToast()
const { t } = useI18n()

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
const saveState = ref<PageSettingsState>("idle")
const draftRestored = ref(false)
const storageHydrated = ref(false)
const isSyncingDraft = ref(false)

const draftStorage = useStorage<CommunityPageSettingsDraft | null>(
  `community:page-settings:${String(route.params.page || "")}`,
  null,
  undefined,
  { initOnMounted: true },
)

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
  t(
    getCommunityOptionLabel(
      communityPageCategoryOptions,
      draft.value.category,
      baseCategoryLabel.value,
    ),
  ),
)

const selectedCtaLabel = computed(() =>
  draft.value.ctaLabel.trim() || page.value?.ctaLabel || t("community.pageSettings.basics.stats.ctaFallback"),
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
  draft.value.showWebsite ? t("community.pageSettings.basics.stats.websiteYes") : t("community.pageSettings.basics.stats.websiteNo"),
)

const pagePath = computed(() =>
  page.value
    ? appendCommunityQuery(getCommunityPagePath(page.value.slug), route.query)
    : "/pages",
)

const isBusy = computed(() => saveState.value === "loading")
const isSaveDisabled = computed(() =>
  isBusy.value
  || !draft.value.name.trim()
  || !draft.value.slug.trim()
  || draft.value.summary.trim().length < 24
  || !draft.value.category,
)

const statusAlert = computed(() => {
  if (saveState.value === "loading") {
    return {
      color: "primary" as const,
      icon: "i-ph-spinner-gap-bold",
      title: t("community.pageSettings.finish.statusSavingTitle"),
      description: t("community.pageSettings.finish.statusSavingDescription"),
    }
  }

  if (saveState.value === "success") {
    return {
      color: "success" as const,
      icon: "i-ph-check-circle-fill",
      title: t("community.pageSettings.finish.statusSuccessTitle"),
      description: t("community.pageSettings.finish.statusSuccessDescription"),
    }
  }

  if (saveState.value === "error") {
    return {
      color: "error" as const,
      icon: "i-ph-warning-circle-fill",
      title: t("community.pageSettings.finish.statusErrorTitle"),
      description: t("community.pageSettings.finish.statusErrorDescription"),
    }
  }

  if (draftRestored.value) {
    return {
      color: "primary" as const,
      icon: "i-ph-clock-counter-clockwise-fill",
      title: t("community.pageSettings.finish.draftRestoredTitle"),
      description: t("community.pageSettings.finish.draftRestoredDescription"),
    }
  }

  return null
})

watch(page, syncDraftFromPage, { immediate: true })

watchDebounced(
  () => normalizeDraft(draft.value),
  (value) => {
    if (!storageHydrated.value || !page.value) {
      return
    }

    draftStorage.value = { ...value }
  },
  {
    debounce: 250,
    maxWait: 1000,
  },
)

watch(
  () => ({ ...draft.value }),
  () => {
    if (isSyncingDraft.value) {
      return
    }

    if (saveState.value !== "loading") {
      saveState.value = "idle"
    }

    draftRestored.value = false
  },
)

onMounted(async () => {
  storageHydrated.value = true
  await nextTick()
  syncDraftFromPage()
})

async function handleSave() {
  saveState.value = "loading"

  try {
    await new Promise(resolve => setTimeout(resolve, 500))

    const normalized = normalizeDraft(draft.value)

    draft.value = { ...normalized }
    draftStorage.value = { ...normalized }
    draftRestored.value = false
    saveState.value = "success"

    toast.add({
      title: t("community.pageSettings.finish.statusSuccessTitle"),
      description: t("community.pageSettings.finish.statusSuccessDescription"),
      color: "success",
    })
  }
  catch {
    saveState.value = "error"

    toast.add({
      title: t("community.pageSettings.finish.statusErrorTitle"),
      description: t("community.pageSettings.finish.statusErrorDescription"),
      color: "error",
    })
  }
}

function handleSaveError() {
  saveState.value = "error"
}

function syncDraftFromPage() {
  if (!page.value) {
    return
  }

  const baseDraft = createLocalizedDraft(page.value)
  const restoredDraft = storageHydrated.value && draftStorage.value
    ? normalizeDraft(draftStorage.value)
    : null

  applyDraft(
    restoredDraft && !isSameDraft(restoredDraft, baseDraft)
      ? { ...baseDraft, ...restoredDraft }
      : baseDraft,
    Boolean(restoredDraft && !isSameDraft(restoredDraft, baseDraft)),
  )
}

function applyDraft(value: CommunityPageSettingsDraft, restored: boolean) {
  isSyncingDraft.value = true
  draft.value = value
  draftRestored.value = restored
  saveState.value = "idle"

  nextTick(() => {
    isSyncingDraft.value = false
  })
}

function createLocalizedDraft(value: CommunityPageRecord): CommunityPageSettingsDraft {
  return {
    ...createCommunityPageSettingsDraft(value),
    name: t(value.name),
    summary: value.summary,
    locationLabel: value.locationLabel || "",
    ctaLabel: value.ctaLabel || "",
    responseLabel: value.responseLabel,
    ownerLabel: value.ownerLabel,
    tags: value.tags.join(", "),
  }
}

function normalizeDraft(value: CommunityPageSettingsDraft): CommunityPageSettingsDraft {
  return {
    ...value,
    name: value.name.trim(),
    slug: value.slug.trim(),
    summary: value.summary.trim(),
    website: value.website.trim(),
    locationLabel: value.locationLabel.trim(),
    category: value.category.trim(),
    ctaLabel: value.ctaLabel.trim(),
    responseLabel: value.responseLabel.trim(),
    ownerLabel: value.ownerLabel.trim(),
    tags: value.tags
      .split(",")
      .map(tag => tag.trim())
      .filter(Boolean)
      .join(", "),
  }
}

function isSameDraft(first: CommunityPageSettingsDraft, second: CommunityPageSettingsDraft) {
  return JSON.stringify(normalizeDraft(first)) === JSON.stringify(normalizeDraft(second))
}

const validateDraft = (state: CommunityPageSettingsDraft): PageSettingsError[] => {
  const errors: PageSettingsError[] = []
  const slug = state.slug.trim()

  if (!state.name.trim()) {
    errors.push({
      name: "name",
      message: t("community.creation.common.validationNameRequired"),
    })
  }

  if (!slug) {
    errors.push({
      name: "slug",
      message: t("community.creation.common.validationSlugRequired"),
    })
  }
  else if (slug.length < 3 || createCommunitySlug(slug) !== slug) {
    errors.push({
      name: "slug",
      message: t("community.creation.common.validationSlugInvalid"),
    })
  }

  if (state.summary.trim().length < 24) {
    errors.push({
      name: "summary",
      message: t("community.creation.common.validationDescriptionRequired"),
    })
  }

  if (!state.category) {
    errors.push({
      name: "category",
      message: t("community.creation.common.validationCategoryRequired"),
    })
  }

  return errors
}
</script>
