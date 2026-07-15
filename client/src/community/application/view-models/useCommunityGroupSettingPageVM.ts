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
import type {
  CommunityGroupRecord,
  CommunityGroupSettingsDraft,
  CommunityPageAnalyticsOverview,
  CommunityPageAnalyticsPeriod,
} from "../../domain/types/community.types"
import { createApiCommunityRepository } from "../../infrastructure/repositories/ApiCommunityRepository"

type GroupSettingsState = "idle" | "loading" | "success" | "error"
type GroupSettingsError = { name?: keyof CommunityGroupSettingsDraft, message: string }

export function useCommunityGroupSettingPageVM(
  repository = createApiCommunityRepository(),
) {
  const { t } = useI18n()
  const route = useRoute()
  const router = useRouter()
  const toast = useToast()
  const translateText = useMaybeTranslatedText()

  const { group, members, memberCountLabel, status } = useCommunityGroupDetail(computed(() => String(route.params.group || "")))

  const draft = ref<CommunityGroupSettingsDraft>(createCommunityGroupSettingsDraft())
  const saveState = ref<GroupSettingsState>("idle")
  const draftRestored = ref(false)
  const storageHydrated = ref(false)
  const isSyncingDraft = ref(false)
  const groupMembers = ref<any[]>([])
  const loadingMembers = ref(false)
  const activeTab = ref("basics")
  const groupAnalytics = ref<CommunityPageAnalyticsOverview | null>(null)
  const analyticsPeriod = ref<CommunityPageAnalyticsPeriod>("day")
  const analyticsLoading = ref(false)
  const analyticsError = ref("")
  const analyticsRequestId = ref(0)

  const draftStorage = useStorage<CommunityGroupSettingsDraft | null>(
    `community:group-settings:${String(route.params.group || "")}`,
    null,
    undefined,
    { initOnMounted: true },
  )

  const previewGroup = computed<CommunityGroupRecord | null>(() => {
    if (!group.value) return null

    return {
      ...group.value,
      name: (draft.value.name || "").trim() || group.value.name,
      slug: (draft.value.slug || "").trim() || group.value.slug,
      summary: (draft.value.summary || "").trim() || group.value.summary,
      privacy: draft.value.privacy,
      category: draft.value.category,
      avatar: draft.value.avatarUrl || group.value.avatar,
      banner: draft.value.bannerUrl || group.value.banner,
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

  const totalPolicies = 1
  const enabledPolicies = computed(() =>
    [
      draft.value.joinApproval,
    ].filter(Boolean).length,
  )

  const visibleMembers = computed(() =>
    members.value.slice(0, 3),
  )

  const groupPath = computed(() =>
    group.value ? getCommunityGroupPath(group.value.slug) : appRoutes.groups,
  )
  const settingsNavItems = computed(() => [
    { id: "basics", label: "Cài đặt chung", icon: "i-ph-wrench-duotone" },
    { id: "controls", label: "Cài đặt riêng tư", icon: "i-ph-wrench-duotone" },
    { id: "media", label: "Hình đại diện & Ảnh bìa", icon: "i-ph-image-duotone" },
    { id: "members", label: "Các thành viên", icon: "i-ph-users-three-duotone" },
    { id: "analytics", label: "Phân tích trang", icon: "i-ph-trend-up-duotone" },
    { id: "delete", label: "Xóa nhóm", icon: "i-ph-trash-duotone" },
  ])

  const isBusy = computed(() => saveState.value === "loading")
  const isSaveDisabled = computed(() =>
    isBusy.value
    || !(draft.value.name || "").trim()
    || !(draft.value.slug || "").trim()
    || !(draft.value.summary || "").trim()
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

  watch(group, (newGroup) => {
    syncDraftFromGroup()
    if (newGroup) {
      fetchGroupMembers()
    }
  }, { immediate: true })

  watch(
    () => [activeTab.value, group.value?.slug, analyticsPeriod.value] as const,
    ([tab]) => {
      if (tab === "analytics") {
        void fetchGroupAnalytics()
      }
    },
    { immediate: true },
  )

  async function fetchGroupMembers() {
    if (!group.value) return
    loadingMembers.value = true
    try {
      groupMembers.value = await repository.getGroupMembers(group.value.slug)
    }
    catch (err) {
      console.error("Failed to load group members:", err)
    }
    finally {
      loadingMembers.value = false
    }
  }

  async function handleKickMember(userId: number) {
    if (!group.value) return
    const confirmKick = window.confirm(t("community.settings.members.kickConfirm", "Bạn có chắc chắn muốn trục xuất thành viên này ra khỏi nhóm không?"))
    if (!confirmKick) return

    try {
      await repository.kickGroupMember(group.value.slug, userId)

      groupMembers.value = groupMembers.value.filter(m => m.id !== userId)

      toast.add({
        title: t("community.settings.members.kickSuccessTitle", "Đã trục xuất thành viên"),
        description: t("community.settings.members.kickSuccessDesc", "Thành viên đã bị xóa khỏi nhóm thành công."),
        color: "success",
      })
    }
    catch (err: any) {
      toast.add({
        title: t("community.settings.members.kickErrorTitle", "Trục xuất thất bại"),
        description: err?.data?.message || err?.message || t("community.settings.members.kickErrorDesc", "Không thể xóa thành viên này."),
        color: "error",
      })
    }
  }

  watchDebounced(
    () => normalizeDraft(draft.value),
    (value) => {
      if (!storageHydrated.value || !group.value) return
      // We don't want to store File objects or temporary blob URLs in local storage
      const storageValue = { ...value }
      delete storageValue.avatarFile
      delete storageValue.bannerFile
      delete storageValue.avatarUrl
      delete storageValue.bannerUrl
      draftStorage.value = storageValue
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
    catch (err: any) {
      saveState.value = "error"

      const errorMessage = err?.data?.message || err?.message || t("community.settings.finish.statusErrorDescription")

      toast.add({
        title: t("community.settings.finish.statusErrorTitle"),
        description: errorMessage,
        color: "error",
      })
    }
  }

  async function fetchGroupAnalytics() {
    if (!group.value?.slug) {
      return
    }

    const requestId = analyticsRequestId.value + 1
    analyticsRequestId.value = requestId
    analyticsLoading.value = true
    analyticsError.value = ""

    try {
      const analytics = await repository.getGroupAnalytics(group.value.slug, analyticsPeriod.value)

      if (requestId === analyticsRequestId.value) {
        groupAnalytics.value = analytics
      }
    }
    catch (err) {
      if (requestId === analyticsRequestId.value) {
        analyticsError.value = err instanceof Error ? err.message : "Không thể tải dữ liệu phân tích nhóm."
        groupAnalytics.value = null
      }
    }
    finally {
      if (requestId === analyticsRequestId.value) {
        analyticsLoading.value = false
      }
    }
  }

  function setAnalyticsPeriod(period: CommunityPageAnalyticsPeriod) {
    analyticsPeriod.value = period
  }

  async function handleDeleteGroup(password: string) {
    if (!group.value) {
      return
    }

    try {
      await repository.deleteGroup(group.value.slug, password)

      toast.add({
        title: "Đã xóa nhóm",
        description: "Nhóm đã được xóa thành công.",
        color: "success",
      })
      await router.push(appRoutes.groups)
    }
    catch (err: any) {
      toast.add({
        title: "Xóa nhóm thất bại",
        description: err?.data?.message || err?.message || "Đã xảy ra lỗi khi xóa nhóm. Vui lòng thử lại.",
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
    const stored = draftStorage.value
    const restoredDraft = storageHydrated.value && stored && (stored.name || stored.summary)
      ? normalizeDraft(stored)
      : null

    const shouldRestore = restoredDraft && !isSameDraft(restoredDraft, baseDraft)

    applyDraft(
      shouldRestore ? { ...baseDraft, ...restoredDraft } : baseDraft,
      Boolean(shouldRestore),
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
    return createCommunityGroupSettingsDraft(value)
  }

  function normalizeDraft(value: CommunityGroupSettingsDraft): CommunityGroupSettingsDraft {
    return {
      ...value,
      name: (value.name || "").trim(),
      slug: (value.slug || "").trim(),
      summary: (value.summary || "").trim(),
      website: (value.website || "").trim(),
      locationLabel: (value.locationLabel || "").trim(),
      category: (value.category || "").trim(),
      tags: (value.tags || "").split(",").map(tag => tag.trim()).filter(Boolean).join(", "),
      guidelines: (value.guidelines || "").split("\n").map(rule => rule.trim()).filter(Boolean).join("\n"),
    }
  }

  function isSameDraft(first: CommunityGroupSettingsDraft, second: CommunityGroupSettingsDraft) {
    return JSON.stringify(normalizeDraft(first)) === JSON.stringify(normalizeDraft(second))
  }

  const validateDraft = (state: CommunityGroupSettingsDraft): GroupSettingsError[] => {
    const errors: GroupSettingsError[] = []
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

    if (!(state.summary || "").trim()) {
      errors.push({ name: "summary", message: t("community.creation.common.validationDescriptionRequired") })
    }

    if (!state.category) {
      errors.push({ name: "category", message: t("community.creation.common.validationCategoryRequired") })
    }

    return errors
  }

  return {
    group,
    status,
    previewGroup,
    translatedGroupName,
    memberCountLabel,
    selectedPrivacyLabel,
    selectedPrivacyDescription,
    selectedCategoryLabel,
    settingsNavItems,
    activeTab,
    draft,
    validateDraft,
    handleSave,
    handleSaveError,
    handleDeleteGroup,
    groupPath,
    statusAlert,
    groupAnalytics,
    analyticsPeriod,
    analyticsLoading,
    analyticsError,
    fetchGroupAnalytics,
    setAnalyticsPeriod,
    isBusy,
    isSaveDisabled,
    enabledPolicies,
    totalPolicies,
    visibleMembers,
    groupMembers,
    loadingMembers,
    handleKickMember,
    fetchGroupMembers,
    appRoutes,
  }
}
