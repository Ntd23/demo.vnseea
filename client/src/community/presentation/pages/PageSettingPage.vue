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
            <CommunitySettingsSectionCard :eyebrow="$t('community.pageSettings.sidebar.media.eyebrow')"
              :title="$t('community.pageSettings.sidebar.media.title')"
              :description="$t('community.pageSettings.sidebar.media.desc')" icon="i-ph-image-square-bold">
              <template #trailing>
                <button type="submit" :disabled="isSaveDisabled"
                  class="page-settings__button page-settings__button--primary !min-h-[36px] !py-2 !text-[13px]">
                  <Icon :name="isBusy ? 'i-ph-spinner-gap-bold' : 'i-ph-floppy-disk-bold'" class="mr-2 h-4 w-4" />
                  {{ $t("community.pageSettings.finish.save") }}
                </button>
              </template>
              <div class="page-preview">
                <!-- Banner -->
                <div class="page-preview__banner" :style="previewPage?.banner?.startsWith('linear-gradient')
                  ? { background: previewPage?.banner }
                  : (previewPage?.banner?.startsWith('blob:') || previewPage?.banner?.includes('/')
                    ? { backgroundImage: `url(${previewPage?.banner})` }
                    : { backgroundColor: previewPage?.banner })">
                  <div class="page-preview__overlay"></div>

                  <!-- Upload Banner -->
                  <div class="page-preview__banner-upload">
                    <input ref="bannerInput" type="file" accept="image/*" class="hidden-input"
                      @change="e => onFileChange(e, 'bannerUrl')">

                    <button type="button" class="upload-btn" @click="bannerInput?.click()">
                      <Icon name="i-ph-camera-bold" class="upload-btn__icon" />
                    </button>
                  </div>
                </div>

                <!-- Avatar -->
                <div class="page-preview__avatar-wrapper">
                  <div class="page-preview__avatar" :style="{ background: previewPage?.accent }">
                    <img v-if="previewPage?.avatarUrl" :src="previewPage?.avatarUrl" class="page-preview__avatar-img">

                    <span v-else>
                      {{ initials }}
                    </span>
                  </div>

                  <!-- Upload Avatar -->
                  <input ref="avatarInput" type="file" accept="image/*" class="hidden-input"
                    @change="e => onFileChange(e, 'avatarUrl')">

                  <button type="button" class="avatar-upload-btn" @click="avatarInput?.click()">
                    <Icon name="i-ph-camera-bold" class="avatar-upload-btn__icon" />
                  </button>
                </div>
              </div>

              <!-- Spacer for overlapping avatar -->
              <div class="h-20 sm:h-28"></div>
            </CommunitySettingsSectionCard>
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
            <CommunitySettingsSectionCard eyebrow="CÀI ĐẶT QUẢN TRỊ" title="Quản trị viên"
              description="Thêm hoặc xóa các quản trị viên cho trang của bạn để cùng quản lý nội dung và cài đặt."
              icon="i-ph-shield-checkered-bold">
              <div class="flex flex-col gap-4 py-4">
                <div class="rounded-xl border border-slate-100 bg-slate-50/50 p-6 text-center">
                  <Icon name="i-ph-users-three-duotone" class="mx-auto h-12 w-12 text-slate-300" />
                  <p class="mt-2 text-sm font-medium text-slate-500">Chức năng quản trị viên đang được cập nhật</p>
                </div>
              </div>
            </CommunitySettingsSectionCard>
          </section>

          <section v-if="activeTab === 'analytics'" id="analytics">
            <CommunitySettingsSectionCard eyebrow="THỐNG KÊ CHI TIẾT" title="Phân tích trang"
              description="Theo dõi hiệu suất của trang, bao gồm lượt thích, lượt theo dõi và tương tác của người dùng."
              icon="i-ph-chart-line-up-bold">
              <div class="flex flex-col gap-4 py-4">
                <div class="rounded-xl border border-slate-100 bg-slate-50/50 p-6 text-center">
                  <Icon name="i-ph-presentation-chart-duotone" class="mx-auto h-12 w-12 text-slate-300" />
                  <p class="mt-2 text-sm font-medium text-slate-500">Dữ liệu phân tích đang được xử lý</p>
                </div>
              </div>
            </CommunitySettingsSectionCard>
          </section>

          <section v-if="activeTab === 'delete'" id="delete">
            <CommunitySettingsSectionCard eyebrow="KHU VỰC NGUY HIỂM" title="Xóa trang"
              description="Một khi bạn xóa trang, mọi dữ liệu bao gồm bài viết, hình ảnh và cài đặt sẽ bị xóa vĩnh viễn và không thể khôi phục."
              icon="i-ph-warning-octagon-bold">
              <div class="flex flex-col gap-6 py-4">
                <div class="rounded-xl border border-red-100 bg-red-50 p-4">
                  <div class="flex gap-3">
                    <Icon name="i-ph-warning-fill" class="h-5 w-5 text-red-500" />
                    <p class="text-sm font-medium text-red-800">
                      Hành động này không thể hoàn tác. Vui lòng cân nhắc kỹ trước khi tiếp tục.
                    </p>
                  </div>
                </div>

                <div class="flex justify-end">
                  <button type="button" class="page-settings__button bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-200">
                    <Icon name="i-ph-trash-bold" class="mr-2 h-4 w-4" />
                    Xác nhận xóa trang
                  </button>
                </div>
              </div>
            </CommunitySettingsSectionCard>
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
import CommunityPageCard from "../components/PageCard.vue"
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
import { getCommunityInitials } from "../../domain/services/community-helpers.service"
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
const activeTab = ref("basics")
const bannerInput = ref<HTMLInputElement | null>(null)
const avatarInput = ref<HTMLInputElement | null>(null)

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

const initials = computed(() => getCommunityInitials(draft.value.name || page.value?.name || ""))

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
  (draft.value.ctaLabel || "").trim() || page.value?.ctaLabel || t("community.pageSettings.basics.stats.ctaFallback"),
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
  {
    id: "basics",
    label: t("community.pageSettings.basics.title"),
    desc: t("community.pageSettings.basics.navDesc"),
    icon: "i-ph-identification-card-duotone",
  },
  {
    id: "media",
    label: t("community.pageSettings.sidebar.media.title") || "Hình ảnh",
    desc: t("community.pageSettings.sidebar.media.navDesc") || "Ảnh bìa & đại diện",
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
    label: "Quản trị viên",
    desc: "Quản lý quyền quản trị trang",
    icon: "i-ph-users-three-duotone",
  },
  {
    id: "analytics",
    label: "Phân tích trang",
    desc: "Xem số liệu thống kê của trang",
    icon: "i-ph-chart-bar-duotone",
  },
  {
    id: "delete",
    label: "Xóa trang",
    desc: "Xóa vĩnh viễn trang này",
    icon: "i-ph-trash-duotone",
  },
])

const isBusy = computed(() => saveState.value === "loading")

const validationErrors = computed(() => validateDraft(draft.value))
const hasErrors = computed(() => validationErrors.value.length > 0)

const isSaveDisabled = computed(() =>
  isBusy.value
  || !(draft.value.name || "").trim()
  || !(draft.value.slug || "").trim(),
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
    ctaLabel: translateText(value.ctaLabel),
    responseLabel: translateText(value.responseLabel),
    ownerLabel: translateText(value.ownerLabel),
    tags: value.tags.map(tag => translateText(tag, tag)).join(", "),
  }
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
  else if (slug.length < 5 || createCommunitySlug(slug) !== slug) {
    errors.push({
      name: "slug",
      message: t("community.creation.common.validationSlugInvalid"),
    })
  }

  if ((state.summary || "").trim().length < 24) {
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


const followerPreview = computed(() =>
  draft.value.showFollowerCount ? followerCountLabel.value : t("community.pageSettings.sidebar.hidden"),
)

const likePreview = computed(() =>
  draft.value.showLikeCount ? likeCountLabel.value : t("community.pageSettings.sidebar.hidden"),
)

const policyProgress = computed(() => {
  if (!totalPolicies) {
    return 0
  }

  return (enabledPolicies.value / totalPolicies) * 100
})
function onFileChange(event: Event, field: "avatarUrl" | "bannerUrl") {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    const file = target.files[0]
    draft.value[field] = URL.createObjectURL(file)
    if (field === "avatarUrl") {
      draft.value.avatarFile = file
    }
    else if (field === "bannerUrl") {
      draft.value.bannerFile = file
    }
  }
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

.page-settings-sidebar :deep(progress),
.page-settings-sidebar :deep([role="progressbar"]) {
  background-color: #dbeafe;
}

.page-preview {
  position: relative;
  margin-top: 16px;
}

/* =========================
   Banner
========================= */

.page-preview__banner {
  position: relative;
  width: 100%;
  height: 360px;
  overflow: hidden;
  border-radius: 24px;
  background-color: #f1f5f9;
  background-size: cover;
  background-position: center;
}

.page-preview__overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top,
      rgba(0, 0, 0, 0.3),
      transparent);
}

/* =========================
   Banner Upload
========================= */

.page-preview__banner-upload {
  position: absolute;
  right: 24px;
  bottom: 24px;
  z-index: 2;
}

/* =========================
   Avatar
========================= */

.page-preview__avatar-wrapper {
  position: absolute;
  left: 48px;
  bottom: -80px;
  z-index: 10;
}

.page-preview__avatar {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;

  width: 176px;
  height: 176px;

  overflow: hidden;

  border: 8px solid #ffffff;
  border-radius: 999px;

  background: #3b82f6;

  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.18);

  color: #ffffff;
  font-size: 42px;
  font-weight: 900;
}

.page-preview__avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* =========================
   Buttons
========================= */

.upload-btn,
.avatar-upload-btn {
  display: flex;
  align-items: center;
  justify-content: center;

  border: none;
  border-radius: 999px;

  background: #ffffff;
  color: #0f172a;

  cursor: pointer;

  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease;
}

.upload-btn:hover,
.avatar-upload-btn:hover {
  transform: scale(1.05);
}

/* Banner button */

.upload-btn {
  width: 48px;
  height: 48px;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.14);
}

/* Avatar button */

.avatar-upload-btn {
  position: absolute;
  right: 8px;
  bottom: 8px;

  width: 48px;
  height: 48px;

  border: 1px solid #e2e8f0;

  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.12);
}

.upload-btn__icon,
.avatar-upload-btn__icon {
  width: 24px;
  height: 24px;
}

/* =========================
   Hidden Input
========================= */

.hidden-input {
  display: none;
}

/* =========================
   Responsive
========================= */

@media (max-width: 640px) {
  .page-preview__banner {
    height: 280px;
    border-radius: 20px;
  }

  .page-preview__banner-upload {
    right: 16px;
    bottom: 16px;
  }

  .page-preview__avatar-wrapper {
    left: 24px;
    bottom: -64px;
  }

  .page-preview__avatar {
    width: 128px;
    height: 128px;
    border-width: 6px;
    font-size: 30px;
  }

  .upload-btn,
  .avatar-upload-btn {
    width: 40px;
    height: 40px;
  }

  .upload-btn__icon,
  .avatar-upload-btn__icon {
    width: 20px;
    height: 20px;
  }
}
</style>
