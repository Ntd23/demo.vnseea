// English description: Owns group settings draft persistence, validation, preview mapping, and backend save flow for the group settings page.

import { useStorage, watchDebounced } from "@vueuse/core"
import { appRoutes } from "../../../shared-kernel/application/constants/route-registry"
import { useCommunityGroupDetail } from "../composables/useCommunityGroupDetail"
import { createCommunityGroupSettingsDraft } from "../factories/community-drafts"
import {
  communityCategoryOptions,
  communityPrivacyOptions,
} from "../../domain/constants/community-options"
import {
  createCommunitySlug,
  getCommunityGroupPath,
  getCommunityOptionDescription,
  getCommunityOptionLabel,
} from "../../domain/services/community-helpers.service"
import type { CommunityGroupRecord, CommunityGroupSettingsDraft } from "../../domain/types/community.types"
import { createApiCommunityRepository } from "../../infrastructure/repositories/ApiCommunityRepository"

type GroupSettingsState = "idle" | "loading" | "success" | "error"
type GroupSettingsError = { name?: keyof CommunityGroupSettingsDraft, message: string }

export function useCommunityGroupSettingPageVM(
  repository = createApiCommunityRepository(),
) {
  const { t } = useI18n()
  const route = useRoute()
  const toast = useToast()
  const translateText = useMaybeTranslatedText()

  const { group, members, memberCountLabel } = useCommunityGroupDetail(computed(() => String(route.params.group || "")))

  const draft = ref<CommunityGroupSettingsDraft>(createCommunityGroupSettingsDraft())
  const saveState = ref<GroupSettingsState>("idle")
  const draftRestored = ref(false)
  const storageHydrated = ref(false)
  const isSyncingDraft = ref(false)

  const draftStorage = useStorage<CommunityGroupSettingsDraft | null>(
    `community:group-settings:${String(route.params.group || "")}`,
    null,
    undefined,
    { initOnMounted: true },
  )

  const normalizedTags = computed(() =>
    draft.value.tags.split(",").map(tag => tag.trim()).filter(Boolean),
  )
  const normalizedGuidelines = computed(() =>
    draft.value.guidelines.split("\n").map(rule => rule.trim()).filter(Boolean),
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
      guidelines: normalizedGuidelines.value.length > 0 ? normalizedGuidelines.value : group.value.guidelines,
    }
  })

  const translatedGroupName = computed(() =>
    group.value ? translateText(group.value.name, group.value.slug) : "",
  )
  const selectedPrivacyLabel = computed(() =>
    t(getCommunityOptionLabel(communityPrivacyOptions, draft.value.privacy, "community.settings.controls.privacyFallback")),
  )
  const selectedPrivacyDescription = computed(() =>
    t(getCommunityOptionDescription(communityPrivacyOptions, draft.value.privacy, "community.settings.controls.noPrivacy")),
  )
  const selectedCategoryLabel = computed(() =>
    t(getCommunityOptionLabel(communityCategoryOptions, draft.value.category, "community.groups.card.noCategory")),
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
    group.value ? getCommunityGroupPath(group.value.slug) : appRoutes.groups,
  )
  const settingsNavItems = computed(() => [
    { id: "basics", label: t("community.settings.basics.title") },
    { id: "controls", label: t("community.settings.controls.title") },
    { id: "finish", label: t("community.settings.finish.title") },
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
        title: t("community.settings.finish.statusSavingTitle"),
        description: t("community.settings.finish.statusSavingDescription"),
      }
    }

    if (saveState.value === "success") {
      return {
        color: "success" as const,
        icon: "i-ph-check-circle-fill",
        title: t("community.settings.finish.statusSuccessTitle"),
        description: t("community.settings.finish.statusSuccessDescription"),
      }
    }

    if (saveState.value === "error") {
      return {
        color: "error" as const,
        icon: "i-ph-warning-circle-fill",
        title: t("community.settings.finish.statusErrorTitle"),
        description: t("community.settings.finish.statusErrorDescription"),
      }
    }

    if (draftRestored.value) {
      return {
        color: "primary" as const,
        icon: "i-ph-clock-counter-clockwise-fill",
        title: t("community.settings.finish.draftRestoredTitle"),
        description: t("community.settings.finish.draftRestoredDescription"),
      }
    }

    return null
  })

  watch(group, syncDraftFromGroup, { immediate: true })

  watchDebounced(
    () => normalizeDraft(draft.value),
    (value) => {
      if (!storageHydrated.value || !group.value) return
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
    syncDraftFromGroup()
  })

  async function handleSave() {
    saveState.value = "loading"

    try {
      if (!group.value) throw new Error("group_missing")
      const savedGroup = await repository.updateGroup(group.value.slug, draft.value)
      const normalized = normalizeDraft(createLocalizedDraft(savedGroup))

      draft.value = { ...normalized }
      draftStorage.value = { ...normalized }
      draftRestored.value = false
      saveState.value = "success"

      toast.add({
        title: t("community.settings.finish.statusSuccessTitle"),
        description: t("community.settings.finish.statusSuccessDescription"),
        color: "success",
      })
    }
    catch {
      saveState.value = "error"

      toast.add({
        title: t("community.settings.finish.statusErrorTitle"),
        description: t("community.settings.finish.statusErrorDescription"),
        color: "error",
      })
    }
  }

  function handleSaveError() {
    saveState.value = "error"
  }

  function syncDraftFromGroup() {
    if (!group.value) return

    const baseDraft = createLocalizedDraft(group.value)
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

  function applyDraft(value: CommunityGroupSettingsDraft, restored: boolean) {
    isSyncingDraft.value = true
    draft.value = value
    draftRestored.value = restored
    saveState.value = "idle"

    nextTick(() => {
      isSyncingDraft.value = false
    })
  }

  function createLocalizedDraft(value: CommunityGroupRecord): CommunityGroupSettingsDraft {
    return {
      ...createCommunityGroupSettingsDraft(value),
      name: translateText(value.name, value.slug),
      summary: translateText(value.summary),
      locationLabel: translateText(value.locationLabel),
      tags: value.tags.map(tag => translateText(tag, tag)).join(", "),
      guidelines: (value.guidelines ?? []).map(rule => translateText(rule, rule)).join("\n"),
    }
  }

  function normalizeDraft(value: CommunityGroupSettingsDraft): CommunityGroupSettingsDraft {
    return {
      ...value,
      name: value.name.trim(),
      slug: value.slug.trim(),
      summary: value.summary.trim(),
      website: value.website.trim(),
      locationLabel: value.locationLabel.trim(),
      category: value.category.trim(),
      tags: value.tags.split(",").map(tag => tag.trim()).filter(Boolean).join(", "),
      guidelines: value.guidelines.split("\n").map(rule => rule.trim()).filter(Boolean).join("\n"),
    }
  }

  function isSameDraft(first: CommunityGroupSettingsDraft, second: CommunityGroupSettingsDraft) {
    return JSON.stringify(normalizeDraft(first)) === JSON.stringify(normalizeDraft(second))
  }

  const validateDraft = (state: CommunityGroupSettingsDraft): GroupSettingsError[] => {
    const errors: GroupSettingsError[] = []
    const slug = state.slug.trim()

    if (!state.name.trim()) {
      errors.push({ name: "name", message: t("community.creation.common.validationNameRequired") })
    }

    if (!slug) {
      errors.push({ name: "slug", message: t("community.creation.common.validationSlugRequired") })
    }
    else if (slug.length < 5 || createCommunitySlug(slug) !== slug) {
      errors.push({ name: "slug", message: t("community.creation.common.validationSlugInvalid") })
    }

    if (state.summary.trim().length < 24) {
      errors.push({ name: "summary", message: t("community.creation.common.validationDescriptionRequired") })
    }

    if (!state.category) {
      errors.push({ name: "category", message: t("community.creation.common.validationCategoryRequired") })
    }

    return errors
  }

  return {
    group,
    previewGroup,
    translatedGroupName,
    memberCountLabel,
    selectedPrivacyLabel,
    selectedPrivacyDescription,
    selectedCategoryLabel,
    settingsNavItems,
    draft,
    validateDraft,
    handleSave,
    handleSaveError,
    groupPath,
    statusAlert,
    isBusy,
    isSaveDisabled,
    enabledPolicies,
    totalPolicies,
    visibleMembers,
    appRoutes,
  }
}
