<template>
  <div v-if="group" class="mx-auto max-w-[1280px] space-y-5 pb-10">
    <CommunityGroupHeroBanner
      :group="group"
      :member-count-label="memberCountLabel"
      :online-count-label="onlineCountLabel"
      :privacy-label="privacyLabel"
      :category-label="categoryLabel"
      :join-state="joinState"
      :invite-state="inviteState"
      :joined="joined"
      @join="handleJoinGroup"
      @invite="handleInviteMembers"
    />

    <CommunityGroupTabsBar
      v-model="activeTab"
      :aria-label="t('pages.groupDetailPage.tabsAriaLabel')"
    />

    <div class="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.24fr)_320px]">
      <section class="min-w-0 space-y-4">
        <template v-if="activeTab === 'posts'">
          <CommunityGroupFeedSection
            :group="group"
            :posts="groupPosts"
          />
        </template>

        <template v-else>
          <CommunityGroupAboutCard
            :group="group"
            :privacy-label="privacyLabel"
            :privacy-description="privacyDescription"
            :category-label="categoryLabel"
            :member-count-label="memberCountLabel"
          />

          <CommunityGroupTopicsCard
            :group="group"
            :category-label="categoryLabel"
            :privacy-description="privacyDescription"
          />
        </template>
      </section>

      <aside class="space-y-4">
        <CommunityGroupAboutCard
          :group="group"
          :privacy-label="privacyLabel"
          :privacy-description="privacyDescription"
          :category-label="categoryLabel"
          :member-count-label="memberCountLabel"
          compact
        />

        <CommunityGroupMembersCard
          :members="members"
          :member-count-label="memberCountLabel"
          :invite-state="inviteState"
          @invite="handleInviteMembers"
        />

        <CommunityGroupAdminCard
          v-if="group.canManage"
          :slug="group.slug"
        />
      </aside>
    </div>
  </div>

  <div v-else class="mx-auto max-w-[960px] pb-10 pt-4">
    <section class="rounded-[30px] border border-[#dbe3f2] bg-white px-6 py-10 text-center shadow-[0_14px_34px_rgba(15,35,110,0.06)] sm:px-8 sm:py-16">
      <FoundationEmptyState
        icon="i-ph-users-three-fill"
        :title="t('pages.groupDetailPage.emptyTitle')"
        :description="t('pages.groupDetailPage.emptyDescription')"
      />

      <div class="mt-6 flex justify-center">
        <UButton
          to="/groups"
          color="primary"
          variant="solid"
          size="xl"
          class="rounded-[16px] px-5 text-[14px] font-extrabold shadow-[0_12px_24px_rgba(0,0,255,0.24)]"
        >
          {{ t("pages.groupDetailPage.backToGroups") }}
        </UButton>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
type CommunityDetailTab = "posts" | "about"
type CommunityActionState = "idle" | "loading" | "success" | "error"

function readQueryValue(value: unknown) {
  if (Array.isArray(value)) return String(value[0] || "")
  return typeof value === "string" ? value : ""
}

function normalizeDetailTab(value: string): CommunityDetailTab {
  return value === "about" ? "about" : "posts"
}

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const toast = useToast()
const translateText = useMaybeTranslatedText()

const activeTab = ref<CommunityDetailTab>(normalizeDetailTab(readQueryValue(route.query.tab)))
const joinState = ref<CommunityActionState>("idle")
const inviteState = ref<CommunityActionState>("idle")
const joined = ref(false)

const {
  group,
  members,
  privacyLabel,
  privacyDescription,
  categoryLabel,
  memberCountLabel,
  onlineCountLabel,
  groupPosts,
} = useCommunityGroupDetail(computed(() => String(route.params.name || "")))

const localizedGroupName = computed(() =>
  group.value ? translateText(group.value.name) : t("pages.groupDetailPage.seoFallbackTitle"),
)

watch(() => route.query.tab, (value) => {
  const normalizedTab = normalizeDetailTab(readQueryValue(value))
  if (normalizedTab !== activeTab.value) {
    activeTab.value = normalizedTab
  }
})

watch(activeTab, (value) => {
  const currentTab = readQueryValue(route.query.tab)
  const nextTab = value === "posts" ? "" : value

  if (currentTab === nextTab) return

  const nextQuery = { ...route.query }

  if (value === "posts") {
    delete nextQuery.tab
  }
  else {
    nextQuery.tab = value
  }

  router.replace({ query: nextQuery })
})

watch(() => route.params.name, () => {
  activeTab.value = normalizeDetailTab(readQueryValue(route.query.tab))
  joinState.value = "idle"
  inviteState.value = "idle"
  joined.value = false
})

async function handleJoinGroup() {
  if (!group.value || joinState.value === "loading" || joined.value) return

  joinState.value = "loading"

  try {
    await new Promise(resolve => setTimeout(resolve, 480))

    joinState.value = "success"
    joined.value = true

    toast.add({
      title: t("pages.groupDetailPage.joinSuccessTitle"),
      description: t("pages.groupDetailPage.joinSuccessDescription", {
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
  if (!group.value || inviteState.value === "loading") return

  inviteState.value = "loading"

  try {
    await new Promise(resolve => setTimeout(resolve, 420))

    inviteState.value = "success"

    toast.add({
      title: t("pages.groupDetailPage.inviteSuccessTitle"),
      description: t("pages.groupDetailPage.inviteSuccessDescription", {
        group: localizedGroupName.value,
      }),
      color: "success",
    })
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
</script>
