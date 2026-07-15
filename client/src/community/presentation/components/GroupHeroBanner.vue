<!-- Description: Displays the community group hero cover, identity, invite action, join action, and settings shortcut. -->
<template>
  <div class="profile-page__hero">
    <!-- Cover -->
    <div
      class="profile-page__cover"
      :class="{ 'profile-page__cover--viewable': group.bannerUrl }"
    >
      <img 
        v-if="group.bannerUrl" 
        :src="group.bannerUrl" 
        class="profile-page__cover-img"
        loading="lazy"
      />
      <div v-else class="profile-page__cover-placeholder" />
      <div class="profile-page__cover-shade" />
    </div>

    <!-- Identity bar (avatar + name + actions) -->
    <div class="profile-page__identity-bar">
      <!-- Avatar -->
      <div class="profile-page__avatar-wrap">
        <img v-if="group.avatar" :src="group.avatar" class="profile-page__avatar rounded-full" />
        <div v-else class="profile-page__avatar rounded-full bg-slate-800 flex items-center justify-center border-4 border-white shadow-md">
          <Icon name="i-ph-users-three-fill" class="h-16 w-16 text-slate-400 sm:h-20 sm:w-20" />
        </div>
      </div>

      <!-- Name + meta -->
      <div class="profile-page__identity-meta">
        <div class="profile-page__name-row">
          <h1 class="profile-page__display-name">
            {{ groupName }}
          </h1>
        </div>
        <!-- Stats chips -->
        <div class="profile-page__stats-row">
          <span class="profile-page__stat-chip">
            <strong>{{ memberCountLabel }}</strong>
          </span>
          <span class="profile-page__stat-chip">
            <span class="h-2 w-2 rounded-full bg-green-400 self-center mr-1" />
            <strong>{{ onlineCountLabel }}</strong>
          </span>
          <span class="profile-page__stat-chip">
            <strong>{{ privacyLabel }}</strong>
          </span>
          <span class="profile-page__stat-chip">
            <strong>{{ categoryLabel }}</strong>
          </span>
        </div>
      </div>

      <!-- Hero actions -->
      <div class="profile-page__hero-actions">
        <UButton
          v-if="group.canManage || (joined && group.allowMemberInvites)"
          color="primary"
          variant="solid"
          size="lg"
          :loading="inviteState === 'loading'"
          :disabled="inviteState === 'loading'"
          class="rounded-full px-8 font-bold btn-primary"
          @click="emit('invite')"
        >
          <span>{{ inviteButtonLabel }}</span>
        </UButton>

        <UButton
          v-if="!group.canManage"
          :color="primaryButtonColor"
          variant="solid"
          size="lg"
          :loading="joinState === 'loading'"
          :disabled="joinState === 'loading'"
          class="rounded-full px-8 font-bold btn-primary"
          @click="handlePrimaryAction"
        >
          <Icon :name="primaryButtonIcon" class="mr-2 h-5 w-5 shrink-0" />
          <span>{{ joinButtonLabel }}</span>
        </UButton>

        <UButton
          v-if="group.canManage"
          :to="settingsPath"
          color="neutral"
          variant="ghost"
          size="xl"
          class="h-12 w-12 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 justify-center"
        >
          <Icon name="i-ph-gear-six-bold" class="h-6 w-6" />
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getCommunityGroupSettingsPath } from "../../domain/services/community-helpers.service"
import type { CommunityGroupRecord } from "../../domain/types/community.types"

const { t } = useI18n()
const translateText = useMaybeTranslatedText()

const props = defineProps<{
  group: CommunityGroupRecord
  memberCountLabel: string
  onlineCountLabel: string
  privacyLabel: string
  categoryLabel: string
  joinState?: "idle" | "loading" | "success" | "error"
  inviteState?: "idle" | "loading" | "success" | "error"
  joined?: boolean
  requested?: boolean
}>()

const emit = defineEmits<{
  join: []
  invite: []
}>()

const settingsPath = computed(() =>
  getCommunityGroupSettingsPath(props.group.slug),
)

const groupName = computed(() =>
  translateText(props.group.name),
)

const joinButtonLabel = computed(() => {
  if (props.joined) return t("pages.groupDetailPage.leaveButton")
  if (props.requested) return t("pages.groupDetailPage.requestPendingButton")
  return translateText(props.group.joinLabel, t("pages.groupDetailPage.joinFallback"))
})

const primaryButtonColor = computed(() =>
  (props.joined || props.requested) ? "primary" : "white",
)

const primaryButtonIcon = computed(() => {
  if (props.joined) return "i-ph-sign-out-bold"
  if (props.requested) return "i-ph-clock-bold"
  return "i-ph-user-plus-bold"
})

function handlePrimaryAction() {
  emit("join")
}

const inviteButtonLabel = computed(() => {
  if (props.inviteState === "success") return t("pages.groupDetailPage.invitedButton")
  return translateText(props.group.inviteLabel, t("pages.groupDetailPage.inviteFallback"))
})
</script>

<style scoped>
/* ── Hero ─────────────────────────────────────────────── */
.profile-page__hero {
  background: #ffffff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  margin-bottom: 12px;
  border-radius: 16px;
  overflow: hidden;
}

@media (max-width: 639px) {
  .profile-page__hero {
    border-bottom-right-radius: 18px;
    border-bottom-left-radius: 18px;
  }
}

/* Cover */
.profile-page__cover {
  position: relative;
  height: 280px;
  overflow: hidden;
  background: linear-gradient(135deg, #0f172a 0%, #1d4ed8 56%, #bfdbfe 100%);
}

.profile-page__cover--viewable {
  cursor: zoom-in;
}

@media (min-width: 640px) {
  .profile-page__cover {
    height: 350px;
  }
}

@media (min-width: 1024px) {
  .profile-page__cover {
    height: 400px;
  }
}

.profile-page__cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.profile-page__cover-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #0f172a 0%, #1d4ed8 56%, #bfdbfe 100%);
}

.profile-page__cover-shade {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.15) 0%, transparent 40%);
}

/* Identity bar */
.profile-page__identity-bar {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 0 16px 16px;
  margin-top: -44px;
  position: relative;
  z-index: 1;
}

@media (min-width: 768px) {
  .profile-page__identity-bar {
    flex-direction: row;
    align-items: flex-end;
    margin-top: -28px;
    padding: 0 24px 24px;
    gap: 16px;
  }
}

/* Avatar */
.profile-page__avatar-wrap {
  position: relative;
  flex-shrink: 0;
  width: 168px;
  height: 168px;
}

@media (max-width: 767px) {
  .profile-page__avatar-wrap {
    width: 120px;
    height: 120px;
  }
}

.profile-page__avatar {
  width: 100%;
  height: 100%;
  border: 4px solid #ffffff;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.18);
  display: block;
  object-fit: cover;
}

/* Name + meta */
.profile-page__identity-meta {
  flex: 1;
  min-width: 0;
  padding-bottom: 8px;
}

.profile-page__name-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.profile-page__display-name {
  display: inline-flex;
  max-width: 100%;
  align-items: center;
  border: 1px solid rgba(255, 255, 255, 0.58);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.72);
  box-shadow: 0 16px 34px rgba(15, 23, 42, 0.12);
  backdrop-filter: blur(18px);
  padding: 6px 16px;
  font-size: clamp(1.5rem, 3vw, 2rem);
  font-weight: 900;
  letter-spacing: -0.03em;
  color: #0f172a;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.profile-page__stats-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 6px;
}

.profile-page__stat-chip {
  display: inline-flex;
  gap: 4px;
  font-size: 14px;
  color: #475569;
}

.profile-page__stat-chip strong {
  font-weight: 800;
  color: #0f172a;
}

/* Hero actions */
.profile-page__hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  padding-bottom: 8px;
  margin-top: 4px;
}

@media (min-width: 768px) {
  .profile-page__hero-actions {
    margin-top: 0;
  }
}

.profile-page__hero-actions :deep(.btn-primary) {
  flex: 0 0 auto;
  white-space: nowrap;
}

@media (max-width: 767px) {
  .profile-page__hero-actions {
    width: 100%;
    flex-wrap: nowrap;
    gap: 6px;
    overflow-x: auto;
    scrollbar-width: none;
  }

  .profile-page__hero-actions::-webkit-scrollbar {
    display: none;
  }

  .profile-page__hero-actions :deep(.btn-primary) {
    min-height: 34px;
  }
}
</style>
