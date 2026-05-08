<!-- Description: Renders the backend-backed community group detail page without mock invite feedback. -->
<template>
  <div v-if="group || status === 'pending'" class="mx-auto max-w-[1280px] space-y-5 pb-10" :class="{ 'opacity-50 pointer-events-none': status === 'pending' && !group }">
    <CommunityGroupHeroBanner
      :group="group || ({} as any)"
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
        <!-- Tab: Posts (Instant) -->
        <div v-show="activeTab === 'posts'">
          <CommunityGroupFeedSection
            v-if="group"
            :group="group"
            :posts="groupPosts"
          />
        </div>

        <!-- Tab: About (Instant) -->
        <div v-show="activeTab === 'about'">
          <CommunityGroupAboutCard
            v-if="group"
            :group="group"
            :privacy-label="privacyLabel"
            :privacy-description="privacyDescription"
            :category-label="categoryLabel"
            :member-count-label="memberCountLabel"
          />

          <CommunityGroupTopicsCard
            v-if="group"
            :group="group"
            :category-label="categoryLabel"
            :privacy-description="privacyDescription"
          />
        </div>
      </section>

      <aside class="space-y-4">
        <CommunityGroupAboutCard
          v-if="group"
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
          v-if="group && group.canManage"
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
          :to="emptyBackPath"
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
import FoundationEmptyState from "../../../foundation/presentation/components/EmptyState.vue"
import CommunityGroupAboutCard from "../components/GroupAboutCard.vue"
import CommunityGroupAdminCard from "../components/GroupAdminCard.vue"
import CommunityGroupFeedSection from "../components/GroupFeedSection.vue"
import CommunityGroupHeroBanner from "../components/GroupHeroBanner.vue"
import CommunityGroupMembersCard from "../components/GroupMembersCard.vue"
import CommunityGroupTabsBar from "../components/GroupTabsBar.vue"
import CommunityGroupTopicsCard from "../components/GroupTopicsCard.vue"
import { useCommunityGroupDetailPageVM } from "../../application/view-models/useCommunityGroupDetailPageVM"

const { t } = useI18n()
const {
  activeTab,
  joinState,
  inviteState,
  joined,
  group,
  members,
  privacyLabel,
  privacyDescription,
  categoryLabel,
  memberCountLabel,
  onlineCountLabel,
  groupPosts,
  handleJoinGroup,
  handleInviteMembers,
  emptyBackPath,
} = useCommunityGroupDetailPageVM()
</script>
