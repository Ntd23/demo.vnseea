// English description: Coordinates group detail join and invite flows on top of the backend-backed group detail data source.

import { appRoutes } from "../../../shared-kernel/application/constants/route-registry"
import { useCommunityGroupDetail } from "../composables/useCommunityGroupDetail"
import { createApiCommunityRepository } from "../../infrastructure/repositories/ApiCommunityRepository"

type CommunityActionState = "idle" | "loading" | "success" | "error"

export function useCommunityGroupDetailPageVM(
  repository = createApiCommunityRepository(),
) {
  const route = useRoute()
  const { t } = useI18n()
  const toast = useToast()
  const translateText = useMaybeTranslatedText()

  const joinState = ref<CommunityActionState>("idle")
  const inviteState = ref<CommunityActionState>("idle")
  const joined = ref(false)
  const requested = ref(false)

  const {
    group,
    privacyLabel,
    categoryLabel,
    memberCountLabel,
    onlineCountLabel,
    groupPosts,
    refreshGroupPosts,
    refresh,
    slug,
    status,
  } = useCommunityGroupDetail(computed(() => String(route.params.name || "")))

  const localizedGroupName = computed(() =>
    group.value ? translateText(group.value.name, group.value.slug) : t("pages.groupDetailPage.seoFallbackTitle"),
  )

  const emptyBackPath = computed(() => appRoutes.groups)

  watch(() => route.params.name, () => {
    joinState.value = "idle"
    inviteState.value = "idle"
    joined.value = Boolean(group.value?.joined)
    requested.value = Boolean(group.value?.requested)
  })

  watch(group, (value) => {
    joined.value = Boolean(value?.joined)
    requested.value = Boolean(value?.requested)
  }, { immediate: true })

  async function handleJoinGroup() {
    if (!group.value || joinState.value === "loading" || group.value.canManage) {
      return
    }

    joinState.value = "loading"

    try {
      const wasJoined = joined.value || requested.value
      const updatedGroup = await repository.joinGroup(group.value.slug)
      await refresh()

      joinState.value = "success"
      joined.value = Boolean(updatedGroup.joined)
      requested.value = Boolean(updatedGroup.requested)

      toast.add({
        title: wasJoined ? t("pages.groupDetailPage.leaveSuccessTitle") : t("pages.groupDetailPage.joinSuccessTitle"),
        description: wasJoined ? t("pages.groupDetailPage.leaveSuccessDescription", {
          group: localizedGroupName.value,
        }) : t("pages.groupDetailPage.joinSuccessDescription", {
          group: localizedGroupName.value,
        }),
        color: "success",
      })
    }
    catch {
      joinState.value = "error"

      toast.add({
        title: t("pages.groupDetailPage.joinErrorTitle"),
        description: t("pages.groupDetailPage.joinErrorDescription"),
        color: "error",
      })
    }
  }

  async function handleInviteMembers() {
    if (!group.value || inviteState.value === "loading") {
      return
    }

    inviteState.value = "loading"

    try {
      await navigateTo({
        path: appRoutes.messages,
        query: {
          tab: "multi",
        },
      })
      inviteState.value = "success"
    }
    catch {
      inviteState.value = "error"

      toast.add({
        title: t("pages.groupDetailPage.inviteErrorTitle"),
        description: t("pages.groupDetailPage.inviteErrorDescription"),
        color: "error",
      })
    }
  }

  return {
    joinState,
    inviteState,
    joined,
    requested,
    group,
    privacyLabel,
    categoryLabel,
    memberCountLabel,
    onlineCountLabel,
    groupPosts,
    refreshGroupPosts,
    handleJoinGroup,
    handleInviteMembers,
    emptyBackPath,
    status,
    slug,
  }
}
