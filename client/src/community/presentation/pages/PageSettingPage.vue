<!-- Description: Renders the page settings route with a settings-nav-first layout and ordered panes that mirror the legacy PHP page settings structure. -->
<template>
  <div v-if="page && previewPage" class="page-settings mx-auto max-w-[1120px] space-y-4 px-3 pb-10 sm:px-5 lg:px-6">
    <section class="page-settings__hero border-b border-slate-100 pb-8 pt-4">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="page-settings__title text-2xl font-black text-slate-900">
            {{ $t("community.pageSettings.title") }}
          </h1>
          <p class="mt-1 text-sm text-slate-500">
            {{ $t("community.pageSettings.desc") }}
          </p>
        </div>

        <NuxtLink :to="pagePath" class="page-settings__button page-settings__button--secondary">
          <Icon name="i-ph-arrow-square-out-bold" class="mr-2 h-4 w-4" />
          {{ $t("community.pageSettings.basics.viewPage") }}
        </NuxtLink>
      </div>

      <div class="page-settings__stepper-container mb-8 mt-5">
        <nav class="page-settings__nav-horizontal">
          <button v-for="(item, index) in settingsNavItems" :key="item.id" type="button"
            class="page-settings__nav-step-item"
            :class="{ 'page-settings__nav-step-item--active': activeTab === item.id }" @click="activeTab = item.id">
            <div class="page-settings__nav-step-circle"
              :class="{ 'page-settings__nav-step-circle--active': activeTab === item.id }">
              <Icon :name="item.icon" class="h-5 w-5" />
            </div>
            <div class="page-settings__nav-step-label-container">
              <span class="page-settings__nav-step-label">{{ item.label }}</span>
            </div>
          </button>
        </nav>
      </div>
    </section>



    <div class="page-settings__content-container">


      <div class="grid gap-5 2xl:grid-cols-[minmax(0,1fr)_340px] 2xl:items-start">
        <UForm :state="draft" :validate="validateDraft" class="min-w-0 space-y-4" @submit="handleSave"
          @error="handleSaveError">
          <div v-if="statusAlert || hasErrors" class="page-settings__alert mb-5"
            :class="`page-settings__alert--${statusAlert?.color || 'error'}`" aria-live="polite">
            <Icon :name="statusAlert?.icon || 'i-ph-warning-circle-fill'" class="h-5 w-5 mt-0.5" />
            <div>
              <p class="font-bold">{{ statusAlert?.title || $t('community.pageSettings.finish.statusErrorTitle') }}</p>
              <ul v-if="hasErrors" class="mt-1 list-disc pl-4 text-xs space-y-1">
                <li v-for="(error, index) in validationErrors" :key="index">
                  {{ error.message }}
                </li>
              </ul>
              <span v-else>{{ statusAlert?.description }}</span>
            </div>
          </div>

          <section v-if="activeTab === 'basics'" id="basics">
            <CommunityPageSettingsBasicsCard v-model="draft" :page-path="pagePath">
              <template #trailing>
                <button type="submit" :disabled="isSaveDisabled"
                  class="page-settings__button page-settings__button--primary !min-h-[36px] !py-2 !text-[13px]">
                  <Icon :name="isBusy ? 'i-ph-spinner-gap-bold' : 'i-ph-floppy-disk-bold'" class="mr-2 h-4 w-4" />
                  {{ $t("community.pageSettings.finish.save") }}
                </button>
              </template>
            </CommunityPageSettingsBasicsCard>
          </section>

          <section v-if="activeTab === 'media'" id="media">
            <CommunityPageSettingsMediaCard v-model="draft" :page-path="pagePath" :preview-page="previewPage">
              <template #trailing>
                <button type="submit" :disabled="isSaveDisabled"
                  class="page-settings__button page-settings__button--primary !min-h-[36px] !py-2 !text-[13px]">
                  <Icon :name="isBusy ? 'i-ph-spinner-gap-bold' : 'i-ph-floppy-disk-bold'" class="mr-2 h-4 w-4" />
                  {{ $t("community.pageSettings.finish.save") }}
                </button>
              </template>
            </CommunityPageSettingsMediaCard>
          </section>

          <section v-if="activeTab === 'controls'" id="controls">
            <CommunityPageSettingsControlsCard v-model="draft">
              <template #trailing>
                <button type="submit" :disabled="isSaveDisabled"
                  class="page-settings__button page-settings__button--primary !min-h-[36px] !py-2 !text-[13px]">
                  <Icon :name="isBusy ? 'i-ph-spinner-gap-bold' : 'i-ph-floppy-disk-bold'" class="mr-2 h-4 w-4" />
                  {{ $t("community.pageSettings.finish.save") }}
                </button>
              </template>
            </CommunityPageSettingsControlsCard>
          </section>

          <section v-if="activeTab === 'admins'" id="admins">
            <CommunityPageSettingsAdminCard />
          </section>

          <section v-if="activeTab === 'analytics'" id="analytics">
            <CommunityPageSettingsAnalyticCard />
          </section>

          <section v-if="activeTab === 'delete'" id="delete">
            <CommunityPageSettingsDeleteCard
              v-if="page"
              :page-id="page.id"
              :slug="page.slug"
              @delete="onDeletePage"
            />
          </section>
        </UForm>

        <CommunityPageSettingsSidebar v-if="activeTab === 'preview'" :page="previewPage"
          :category-label="selectedCategoryLabel" :follower-count-label="followerCountLabel"
          :like-count-label="likeCountLabel" :selected-cta-label="selectedCtaLabel" :enabled-policies="enabledPolicies"
          :total-policies="totalPolicies" :show-follower-count="draft.showFollowerCount"
          :show-like-count="draft.showLikeCount" :allow-messages="draft.allowMessages"
          :recommend-related-pages="draft.recommendRelatedPages" />
      </div>
    </div>
  </div>

  <div v-else class="mx-auto max-w-[960px] px-3 pb-10 pt-4 sm:px-5">
    <section
      class="rounded-[18px] border border-[#e2e8f0] bg-white px-6 py-10 text-center shadow-[0_2px_12px_rgba(0,0,0,0.04)] sm:px-8 sm:py-16">
      <FoundationEmptyState icon="i-ph-sliders-horizontal-fill" :title="$t('community.pageSettings.empty.title')"
        :description="$t('community.pageSettings.empty.desc')" />

      <div class="mt-6 flex justify-center">
        <NuxtLink to="/pages"
          class="inline-flex h-12 items-center justify-center rounded-[16px] bg-[#0000ff] px-5 text-[14px] font-extrabold text-white shadow-[0_12px_24px_rgba(0,0,255,0.24)] transition hover:-translate-y-0.5 hover:bg-[#0000e0]">
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
import CommunityPageSettingsMediaCard from "../components/PageSettingsMediaCard.vue"
import CommunityPageSettingsAdminCard from "../components/PageSettingsAdminCard.vue"
import CommunityPageSettingsAnalyticCard from "../components/PageSettingsAnalyticCard.vue"
import CommunityPageSettingsDeleteCard from "../components/PageSettingsDeleteCard.vue"
import CommunityPageSettingsSidebar from "../components/PageSettingsSidebar.vue"
import CommunitySettingsSectionCard from "../components/SettingsSectionCard.vue"
import { useCommunityPageDetail } from "../../application/composables/useCommunityPageDetail"
import { createCommunityPageSettingsDraft } from "../../application/factories/community-drafts"
import { communityPageCategoryOptions, communityPageCtaOptions } from "../../domain/constants/community-options"
import {
  appendCommunityQuery,
  createCommunitySlug,
  getCommunityOptionLabel,
  getCommunityPagePath,
  getCommunityPageSettingsPath,
} from "../../domain/services/community-helpers.service"
import { getCommunityInitials } from "../../domain/services/community-helpers.service"
import type {
  CommunityPageRecord,
  CommunityPageSettingsDraft,
} from "../../domain/types/community.types"
import { createApiCommunityRepository } from "../../infrastructure/repositories/ApiCommunityRepository"

type PageSettingsState = "idle" | "loading" | "success" | "error"

type PageSettingsError = {
  path?: string
  message: string
}

const route = useRoute()
const router = useRouter()
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
const activeTab = ref("basics")

const draftStorage = useStorage<CommunityPageSettingsDraft | null>(
  `community:page-settings:${String(route.params.page || "")}`,
  null,
  undefined,
  { initOnMounted: true },
)

const normalizedTags = computed(() =>
  (draft.value.tags || "")
    .split(",")
    .map(tag => tag.trim())
    .filter(Boolean),
)

const previewPage = computed<CommunityPageRecord | null>(() => {
  if (!page.value) return null

  return {
    ...page.value,
    name: (draft.value.name || "").trim() || page.value.name,
    slug: (draft.value.slug || "").trim() || page.value.slug,
    summary: (draft.value.summary || "").trim() || page.value.summary,
    website: draft.value.showWebsite
      ? ((draft.value.website || "").trim() || page.value.website)
      : undefined,
    locationLabel: (draft.value.locationLabel || "").trim() || page.value.locationLabel,
    category: draft.value.category,
    ctaLabel: (draft.value.ctaLabel || "").trim() || page.value.ctaLabel,
    responseLabel: (draft.value.responseLabel || "").trim() || page.value.responseLabel,
    ownerLabel: (draft.value.ownerLabel || "").trim() || page.value.ownerLabel,
    tags: normalizedTags.value.length > 0 ? normalizedTags.value : page.value.tags,
    avatarUrl: draft.value.avatarUrl || page.value.avatarUrl,
    banner: draft.value.bannerUrl || page.value.banner,
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

const selectedCtaLabel = computed(() => {
  const value = (draft.value.ctaLabel || "").trim()
  const option = communityPageCtaOptions.find(o => o.value === value)
  if (option) return t(option.label)
  return value || page.value?.ctaLabel || t("community.pageSettings.basics.stats.ctaFallback")
})

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
  {
    id: "basics",
    label: t("community.pageSettings.basics.title"),
    desc: t("community.pageSettings.basics.navDesc"),
    icon: "i-ph-identification-card-duotone",
  },
  {
    id: "media",
    label: t("community.pageSettings.sidebar.media.title"),
    desc: t("community.pageSettings.sidebar.media.navDesc"),
    icon: "i-ph-image-duotone",
  },
  {
    id: "controls",
    label: t("community.pageSettings.controls.title"),
    desc: t("community.pageSettings.controls.navDesc"),
    icon: "i-ph-sliders-duotone",
  },
  {
    id: "admins",
    label: t("community.pageSettings.sidebar.admin.title"),
    desc: t("community.pageSettings.sidebar.admin.desc"),
    icon: "i-ph-users-three-duotone",
  },
  {
    id: "analytics",
    label: t("community.pageSettings.sidebar.analytics.title"),
    desc: t("community.pageSettings.sidebar.analytics.desc"),
    icon: "i-ph-chart-bar-duotone",
  },
  {
    id: "delete",
    label: t("community.pageSettings.sidebar.delete.title"),
    desc: t("community.pageSettings.sidebar.delete.desc"),
    icon: "i-ph-trash-duotone",
  },
])

const isBusy = computed(() => saveState.value === "loading")

const validationErrors = computed(() => validateDraft(draft.value))
const hasErrors = computed(() => validationErrors.value.length > 0)

const isSaveDisabled = computed(() =>
  isBusy.value
  || !(draft.value.name || "").trim()
  || !(draft.value.slug || "").trim()
  || (draft.value.summary || "").trim().length < 24
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

    // Update both the page and the draft to maintain consistency
    const oldSlug = page.value.slug
    page.value = savedPage
    const newDraft = createLocalizedDraft(savedPage); draft.value = { ...newDraft }
    draftStorage.value = { ...newDraft }
    draftRestored.value = false

    // If the slug changed, update the URL without refreshing to avoid 404
    if (savedPage.slug !== oldSlug) {
      router.replace(getCommunityPageSettingsPath(savedPage.slug))
    }
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

  // Ensure mandatory profile data is always present even in restored drafts
  const finalDraft = restoredDraft && !isSameDraft(restoredDraft, baseDraft)
    ? {
      ...baseDraft,
      ...restoredDraft,
      // Prioritize backend data for core profile fields if restored draft has them empty
      name: restoredDraft.name || baseDraft.name,
      slug: restoredDraft.slug || baseDraft.slug,
      summary: restoredDraft.summary || baseDraft.summary,
      category: restoredDraft.category || baseDraft.category,
    }
    : baseDraft

  applyDraft(
    finalDraft,
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
    ctaLabel: normalizeCtaDraftValue(value.ctaLabel),
    responseLabel: translateText(value.responseLabel),
    ownerLabel: translateText(value.ownerLabel),
    tags: value.tags.map(tag => translateText(tag, tag)).join(", "),
  }
}

function normalizeCtaDraftValue(value?: string) {
  const input = String(value || "").trim()
  const normalized = input.toLowerCase()

  if (communityPageCtaOptions.some(option => option.value === normalized)) {
    return normalized
  }

  if (normalized.includes("shop") || normalized.includes("catalog") || normalized.includes("product") || normalized.includes("sản phẩm") || normalized.includes("mua sắm") || normalized.includes("cửa hàng")) return "catalog"
  if (normalized.includes("get a quote") || normalized.includes("call") || normalized.includes("phone") || normalized.includes("gọi") || normalized.includes("điện thoại")) return "call"
  if (normalized.includes("quote") || normalized.includes("message") || normalized.includes("chat") || normalized.includes("nhắn tin") || normalized.includes("gửi tin nhắn") || normalized.includes("messenger")) return "message"
  if (normalized.includes("book") || normalized.includes("schedule") || normalized.includes("đặt lịch") || normalized.includes("đặt chỗ")) return "booking"
  if (normalized.includes("read more") || normalized.includes("follow") || normalized.includes("theo dõi")) return "follow"
  if (normalized.includes("view") || normalized.includes("xem ngay") || normalized.includes("tìm hiểu")) return "view"

  return input
}


function normalizeDraft(value: CommunityPageSettingsDraft): CommunityPageSettingsDraft {
  return {
    ...value,
    name: (value.name || "").trim(),
    slug: (value.slug || "").trim(),
    summary: (value.summary || "").trim(),
    website: (value.website || "").trim(),
    locationLabel: (value.locationLabel || "").trim(),
    category: (value.category || "").trim(),
    ctaLabel: (value.ctaLabel || "").trim(),
    responseLabel: (value.responseLabel || "").trim(),
    ownerLabel: (value.ownerLabel || "").trim(),
    tags: (value.tags || "")
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
  const slug = (state.slug || "").trim()

  if (!(state.name || "").trim()) {
    errors.push({
      path: "name",
      message: t("community.creation.common.validationNameRequired"),
    })
  }

  if (!slug) {
    errors.push({
      path: "slug",
      message: t("community.creation.common.validationSlugRequired"),
    })
  }
  else if (slug.length < 5 || createCommunitySlug(slug) !== slug) {
    errors.push({
      path: "slug",
      message: t("community.creation.common.validationSlugInvalid"),
    })
  }

  if ((state.summary || "").trim().length < 24) {
    errors.push({
      path: "summary",
      message: t("community.creation.common.validationDescriptionRequired"),
    })
  }

  if (!state.category) {
    errors.push({
      path: "category",
      message: t("community.creation.common.validationCategoryRequired"),
    })
  }

  return errors
}
</script>

<style scoped>
.page-settings__hero,
.page-settings__nav-card {
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  background: #ffffff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.page-settings__hero {
  padding: 20px;
}

.page-settings__avatar {
  display: flex;
  height: 80px;
  width: 80px;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 18px;
}

.page-settings__eyebrow,
.settings-section-card__eyebrow {
  margin: 0;
  color: #64748b;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.settings-section-card__title {
  margin: 4px 0 0;
  color: #0f172a;
  font-size: 18px;
  font-weight: 800;
  line-height: 1.2;
}

.settings-section-card__desc {
  margin: 4px 0 0;
  color: #94a3b8;
  font-size: 13.5px;
  line-height: 1.5;
}

.page-settings__title {
  margin: 0;
  color: #0f172a;
  font-size: 24px;
  font-weight: 900;
  letter-spacing: -0.03em;
  line-height: 1.15;
}

.page-settings__desc {
  margin: 0;
  max-width: 760px;
  color: #64748b;
  font-size: 14px;
  line-height: 1.7;
}

.page-settings__pills {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.page-settings__pill {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  background: #f1f5f9;
  padding: 6px 12px;
  color: #475569;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.settings-section-card {
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  background: #ffffff;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.page-settings__stepper-container {
  position: relative;
  z-index: 10;
}

.page-settings__nav-horizontal {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  max-width: 800px;
  margin: 0 auto;
}


.page-settings__nav-step-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  min-width: 100px;
}

.page-settings__nav-step-circle {
  display: flex;
  width: 34px;
  height: 34px;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #ffffff;
  color: #94a3b8;
  font-size: 14px;
  font-weight: 800;
  border: 2px solid #f1f5f9;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.page-settings__nav-step-circle--active {
  background: #2563eb;
  color: #ffffff;
  border-color: #2563eb;
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.15);
}

.page-settings__nav-step-label-container {
  text-align: center;
}

.page-settings__nav-step-label {
  display: block;
  font-size: 13px;
  font-weight: 700;
  color: #64748b;
  transition: color 0.2s ease;
}

.page-settings__nav-step-item--active .page-settings__nav-step-label {
  color: #0f172a;
  text-decoration: underline;
  text-underline-offset: 6px;
  text-decoration-thickness: 2px;
  text-decoration-color: #2563eb;
}

.page-settings__nav-step-item:hover .page-settings__nav-step-circle:not(.page-settings__nav-step-circle--active) {
  border-color: #cbd5e1;
  color: #475569;
}

.page-preview-card {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.page-preview-banner {
  background-size: cover !important;
  background-position: center !important;
}

.page-preview-avatar-wrap {
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
}


.page-settings__finish-note {
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  background: #f8fafc;
  color: #64748b;
  padding: 13px 16px;
  font-size: 13px;
  line-height: 1.6;
}

.page-settings__alert {
  display: flex;
  gap: 12px;
  border: 1px solid #bfdbfe;
  border-radius: 16px;
  background: #eff6ff;
  color: #1d4ed8;
  padding: 14px 16px;
}

.page-settings__alert p {
  margin: 0;
  color: #0f172a;
  font-size: 13px;
  font-weight: 900;
}

.page-settings__alert span {
  display: block;
  margin-top: 3px;
  color: #475569;
  font-size: 13px;
  line-height: 1.55;
}

.page-settings__alert--success {
  border-color: #bae6fd;
  background: #f0f9ff;
  color: #0284c7;
}

.page-settings__alert--error {
  border-color: #fecaca;
  background: #fef2f2;
  color: #dc2626;
}

.page-settings__button {
  display: inline-flex;
  min-height: 44px;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  padding: 10px 18px;
  font-size: 14px;
  font-weight: 900;
  text-decoration: none;
  transition: background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease, opacity 0.15s ease, transform 0.15s ease;
}

.page-settings__button:not(:disabled):hover {
  transform: translateY(-1px);
}

.page-settings__button--secondary {
  border: 1px solid #cbd5e1;
  background: #ffffff;
  color: #334155;
}

.page-settings__button--secondary:hover {
  border-color: #93c5fd;
  background: #eff6ff;
  color: #1d4ed8;
}

.page-settings__button--primary {
  border: 1px solid #2563eb;
  background: #0000ff;
  color: #ffffff;
  box-shadow: 0 10px 22px rgba(0, 0, 255, 0.18);
}

.page-settings__button--primary:hover {
  background: #0000d8;
}

.page-settings__button:disabled,
.page-settings__button[aria-disabled="true"] {
  cursor: not-allowed;
  opacity: 0.55;
}

.page-settings__admins {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.page-settings__admin-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  background: #ffffff;
  padding: 14px 16px;
}

.page-settings__admin-main {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 12px;
}

.page-settings__admin-avatar {
  display: flex;
  width: 56px;
  height: 56px;
  flex: 0 0 56px;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 999px;
  color: #ffffff;
  font-size: 18px;
  font-weight: 900;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.12);
}

.page-settings__admin-avatar-img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.page-settings__admin-copy {
  min-width: 0;
}

.page-settings__admin-name {
  overflow: hidden;
  margin: 0;
  color: #0f172a;
  font-size: 16px;
  font-weight: 800;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.page-settings__admin-role {
  margin: 4px 0 0;
  color: #64748b;
  font-size: 13px;
  font-weight: 600;
}

.page-settings__admin-menu {
  display: inline-flex;
  width: 40px;
  height: 40px;
  flex: 0 0 40px;
  align-items: center;
  justify-content: center;
  border: 1px solid #e2e8f0;
  border-radius: 999px;
  background: #ffffff;
  color: #475569;
  transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease;
}

.page-settings__admin-menu:hover {
  border-color: #cbd5e1;
  background: #f8fafc;
  color: #0f172a;
}

.page-settings__admins-placeholder {
  display: none;
}

.page-settings-sidebar :deep(progress),
.page-settings-sidebar :deep([role="progressbar"]) {
  background-color: #dbeafe;
}
</style>
