// English description: Owns page settings draft persistence, preview mapping, validation, and backend save flow for the page settings route.

import { useStorage, watchDebounced } from "@vueuse/core"
import { appRoutes } from "../../../shared-kernel/application/constants/route-registry"
import { useCommunityPageDetail } from "../composables/useCommunityPageDetail"
import { createCommunityPageSettingsDraft } from "../factories/community-drafts"
import { communityPageCategoryOptions } from "../../domain/constants/community-options"
import {
  appendCommunityQuery,
  createCommunitySlug,
  getCommunityInitials,
  getCommunityOptionLabel,
  getCommunityPagePath,
} from "../../domain/services/community-helpers.service"
import type { CommunityPageRecord, CommunityPageSettingsDraft } from "../../domain/types/community.types"
import { createApiCommunityRepository } from "../../infrastructure/repositories/ApiCommunityRepository"

type PageSettingsState = "idle" | "loading" | "success" | "error"
type PageSettingsError = { name?: keyof CommunityPageSettingsDraft, message: string }

export function useCommunityPageSettingPageVM(
  repository = createApiCommunityRepository(),
) {
  const route = useRoute()
  const toast = useToast()
  const { t } = useI18n()
  const translateText = useMaybeTranslatedText()

  const {
    page,
    categoryLabel: baseCategoryLabel,
    followerCountLabel,
    likeCountLabel,
  } = useCommunityPageDetail(computed(() => String(route.params.page || "")))

  const draft = ref<CommunityPageSettingsDraft>(createCommunityPageSettingsDraft())
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
    (draft.value.tags || "").split(",").map(tag => tag.trim()).filter(Boolean),
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
    }
  })

  const selectedCategoryLabel = computed(() =>
    t(getCommunityOptionLabel(communityPageCategoryOptions, draft.value.category, baseCategoryLabel.value)),
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
  const pagePath = computed(() =>
    page.value
      ? appendCommunityQuery(getCommunityPagePath(page.value.slug), route.query)
      : appRoutes.pages,
  )
  const settingsNavItems = computed(() => [
    { id: "basics", label: t("community.pageSettings.basics.title"), desc: t("community.pageSettings.basics.navDesc"), icon: "i-ph-identification-card-duotone" },
    { id: "controls", label: t("community.pageSettings.controls.title"), desc: t("community.pageSettings.controls.navDesc"), icon: "i-ph-sliders-duotone" },
    { id: "admins", label: t("community.pageSettings.admins.title"), desc: t("community.pageSettings.admins.navDesc"), icon: "i-ph-shield-checkered-duotone" },
    { id: "preview", label: t("community.pageSettings.sidebar.preview"), desc: t("community.pageSettings.preview.navDesc"), icon: "i-ph-eye-duotone" },
    { id: "finish", label: t("community.pageSettings.finish.title"), desc: t("community.pageSettings.finish.navDesc"), icon: "i-ph-check-circle-duotone" },
  ])

  const isBusy = computed(() => saveState.value === "loading")
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
      if (!storageHydrated.value || !page.value) return
      draftStorage.value = { ...value }
    },
    { debounce: 250, maxWait: 1000 },
  )

  watch(
    () => ({ ...draft.value }),
    () => {
      if (isSyncingDraft.value) return
      if (saveState.value !== "loading") saveState.value = "idle"
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
      if (!page.value) throw new Error("page_missing")
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
    if (!page.value) return

    const baseDraft = createLocalizedDraft(page.value)
    const restoredDraft = storageHydrated.value && draftStorage.value
      ? normalizeDraft(draftStorage.value)
      : null

    const finalDraft = restoredDraft && !isSameDraft(restoredDraft, baseDraft)
      ? {
          ...baseDraft,
          ...restoredDraft,
          name: restoredDraft.name || baseDraft.name,
          slug: restoredDraft.slug || baseDraft.slug,
          summary: restoredDraft.summary || baseDraft.summary,
          category: restoredDraft.category || baseDraft.category,
        }
      : baseDraft

    applyDraft(finalDraft, Boolean(restoredDraft && !isSameDraft(restoredDraft, baseDraft)))
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
      tags: (value.tags || "").split(",").map(tag => tag.trim()).filter(Boolean).join(", "),
    }
  }

  function isSameDraft(first: CommunityPageSettingsDraft, second: CommunityPageSettingsDraft) {
    return JSON.stringify(normalizeDraft(first)) === JSON.stringify(normalizeDraft(second))
  }

  const validateDraft = (state: CommunityPageSettingsDraft): PageSettingsError[] => {
    const errors: PageSettingsError[] = []
    const slug = (state.slug || "").trim()

    if (!(state.name || "").trim()) {
      errors.push({ name: "name", message: t("community.creation.common.validationNameRequired") })
    }

    if (!slug) {
      errors.push({ name: "slug", message: t("community.creation.common.validationSlugRequired") })
    }
    else if (slug.length < 5 || createCommunitySlug(slug) !== slug) {
      errors.push({ name: "slug", message: t("community.creation.common.validationSlugInvalid") })
    }

    if ((state.summary || "").trim().length < 24) {
      errors.push({ name: "summary", message: t("community.creation.common.validationDescriptionRequired") })
    }

    if (!state.category) {
      errors.push({ name: "category", message: t("community.creation.common.validationCategoryRequired") })
    }

    return errors
  }

  const initials = computed(() =>
    getCommunityInitials(previewPage.value?.name || ""),
  )
  const followerPreview = computed(() =>
    draft.value.showFollowerCount ? followerCountLabel.value : t("community.pageSettings.sidebar.hidden"),
  )
  const likePreview = computed(() =>
    draft.value.showLikeCount ? likeCountLabel.value : t("community.pageSettings.sidebar.hidden"),
  )

  return {
    page,
    previewPage,
    draft,
    validateDraft,
    handleSave,
    handleSaveError,
    activeTab,
    pagePath,
    settingsNavItems,
    statusAlert,
    isBusy,
    isSaveDisabled,
    selectedCategoryLabel,
    followerCountLabel,
    likeCountLabel,
    selectedCtaLabel,
    enabledPolicies,
    totalPolicies,
    initials,
    followerPreview,
    likePreview,
    appRoutes,
  }
}
