<!-- Description: Renders the page settings route with a settings-nav-first layout and ordered panes that mirror the legacy PHP page settings structure. -->
<template>
  <div v-if="page && previewPage" class="mx-auto max-w-[1280px] space-y-5 pb-10">
    <section class="rounded-[26px] border border-[#dbe3f2] bg-white px-5 py-5 shadow-[0_12px_28px_rgba(15,35,110,0.06)] sm:px-6">
      <div class="space-y-3">
        <p class="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
          {{ $t('community.pageSettings.eyebrow') }}
        </p>
        <h1 class="text-[1.7rem] font-black tracking-[-0.04em] text-[#243b63] sm:text-[2rem]">
          {{ $t('community.pageSettings.title', { name: translatedPageName }) }}
        </h1>
        <p class="max-w-3xl text-[14px] leading-7 text-slate-500">
          {{ $t('community.pageSettings.desc') }}
        </p>
      </div>

      <div class="mt-4 flex flex-wrap gap-2">
        <span class="inline-flex items-center rounded-full bg-[#f6f8ff] px-3 py-1.5 text-[12px] font-semibold text-[#243b63]">
          {{ selectedCategoryLabel }}
        </span>
        <span class="inline-flex items-center rounded-full bg-[#f6f8ff] px-3 py-1.5 text-[12px] font-semibold text-[#243b63]">
          {{ selectedCtaLabel }}
        </span>
        <span class="inline-flex items-center rounded-full bg-[#f6f8ff] px-3 py-1.5 text-[12px] font-semibold text-[#243b63]">
          {{ visibilityLabel }}
        </span>
      </div>
    </section>

    <div class="grid gap-5 xl:grid-cols-[220px_minmax(0,1fr)]">
      <aside class="xl:sticky xl:top-[84px] xl:self-start">
        <section class="rounded-[24px] border border-[#dbe3f2] bg-white p-4 shadow-[0_12px_30px_rgba(15,35,110,0.06)]">
          <p class="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">
            {{ $t('community.pageSettings.eyebrow') }}
          </p>
          <nav class="mt-4 space-y-2">
            <a
              v-for="item in settingsNavItems"
              :key="item.id"
              :href="`#${item.id}`"
              class="flex items-center justify-between rounded-[16px] border border-[#e7ecf6] bg-[#fbfcff] px-4 py-3 text-[13px] font-bold text-[#243b63] transition hover:border-[#c8d4f5] hover:bg-white"
            >
              <span>{{ item.label }}</span>
              <Icon name="i-ph-caret-right-bold" class="h-3.5 w-3.5 text-slate-400" />
            </a>
          </nav>
        </section>
      </aside>

      <div class="grid gap-5 2xl:grid-cols-[minmax(0,1fr)_340px] 2xl:items-start">
        <UForm
          :state="draft"
          :validate="validateDraft"
          class="min-w-0 space-y-4"
          @submit="handleSave"
          @error="handleSaveError"
        >
          <section id="basics" class="scroll-mt-24">
            <CommunityPageSettingsBasicsCard
              v-model="draft"
              :page-path="pagePath"
            />
          </section>

          <section id="controls" class="scroll-mt-24">
            <CommunityPageSettingsControlsCard v-model="draft" />
          </section>

          <section id="finish" class="scroll-mt-24">
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
          </section>
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
import FoundationEmptyState from "../../../foundation/presentation/components/EmptyState.vue"
import CommunityPageSettingsBasicsCard from "../components/PageSettingsBasicsCard.vue"
import CommunityPageSettingsControlsCard from "../components/PageSettingsControlsCard.vue"
import CommunityPageSettingsSidebar from "../components/PageSettingsSidebar.vue"
import CommunitySettingsSectionCard from "../components/SettingsSectionCard.vue"
import { useCommunityPageDetail } from "../../application/composables/useCommunityPageDetail"
import { createCommunityPageSettingsDraft } from "../../application/factories/community-drafts"
import { communityPageCategoryOptions } from "../../domain/constants/community-options"
import {
  appendCommunityQuery,
  createCommunitySlug,
  getCommunityOptionLabel,
  getCommunityPagePath,
} from "../../domain/services/community-helpers.service"
import type {
  CommunityPageRecord,
  CommunityPageSettingsDraft,
} from "../../domain/types/community.types"
import { createApiCommunityRepository } from "../../infrastructure/repositories/ApiCommunityRepository"

type PageSettingsState = "idle" | "loading" | "success" | "error"

type PageSettingsError = {
  name?: keyof CommunityPageSettingsDraft
  message: string
}

const route = useRoute()
const toast = useToast()
const { t } = useI18n()
const translateText = useMaybeTranslatedText()
const repository = createApiCommunityRepository()

const {
  page,
  categoryLabel: baseCategoryLabel,
  followerCountLabel,
  likeCountLabel,
} = useCommunityPageDetail(
  computed(() => String(route.params.page || "")),
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

const translatedPageName = computed(() =>
  page.value ? translateText(page.value.name, page.value.slug) : "",
)

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
const settingsNavItems = computed(() => [
  { id: "basics", label: t("community.pageSettings.basics.title") },
  { id: "controls", label: t("community.pageSettings.controls.title") },
  { id: "finish", label: t("community.pageSettings.finish.title") },
])

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
    if (!page.value) {
      throw new Error("page_missing")
    }

    const savedPage = await repository.updatePage(page.value.slug, draft.value)
    const normalized = normalizeDraft(createLocalizedDraft(savedPage))

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
    name: translateText(value.name, value.slug),
    summary: translateText(value.summary),
    locationLabel: translateText(value.locationLabel),
    ctaLabel: translateText(value.ctaLabel),
    responseLabel: translateText(value.responseLabel),
    ownerLabel: translateText(value.ownerLabel),
    tags: value.tags.map(tag => translateText(tag, tag)).join(", "),
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
