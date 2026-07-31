<!-- Description: Displays the community group hero cover, identity, invite action, join action, and settings shortcut. -->
<template>
  <div class="profile-page__hero">
    <!-- Cover -->
    <div
      class="profile-page__cover"
      :class="{ 'profile-page__cover--viewable': group.bannerUrl && !coverDraft }"
      :role="group.bannerUrl && !coverDraft ? 'button' : undefined"
      :tabindex="group.bannerUrl && !coverDraft ? 0 : undefined"
      @click="openMediaViewer('cover')"
      @keydown.enter="openMediaViewer('cover')"
      @keydown.space.prevent="openMediaViewer('cover')"
    >
      <img 
        v-if="group.bannerUrl" 
        :src="group.bannerUrl" 
        :alt="groupName"
        class="profile-page__cover-img"
        loading="lazy"
      />
      <div v-else class="profile-page__cover-placeholder" />
      <div class="profile-page__cover-shade" />
      <CoverRepositionEditor
        v-if="coverDraft"
        :file="coverDraft"
        :saving="coverUploading"
        @cancel="closeCoverEditor"
        @confirm="uploadRepositionedCover"
      />
      <div v-if="coverUploading" class="profile-page__media-loading">
        <Icon name="i-ph-spinner-gap-bold" class="h-10 w-10 animate-spin" />
      </div>
      <button
        v-if="group.canManage && !coverDraft"
        type="button"
        class="profile-page__cover-action"
        :disabled="coverUploading"
        @click.stop="coverInput?.click()"
      >
        <Icon name="i-ph-camera-bold" class="h-4 w-4" />
        <span>{{ t("community.detail.changeCover") }}</span>
      </button>
      <input
        ref="coverInput"
        type="file"
        accept="image/*"
        class="hidden"
        @change="onCoverFileChange"
      >
    </div>

    <!-- Identity bar (avatar + name + actions) -->
    <div class="profile-page__identity-bar">
      <!-- Avatar -->
      <div
        class="profile-page__avatar-wrap"
        :class="{ 'profile-page__avatar-wrap--viewable': group.avatar }"
        :role="group.avatar ? 'button' : undefined"
        :tabindex="group.avatar ? 0 : undefined"
        @click="openMediaViewer('avatar')"
        @keydown.enter="openMediaViewer('avatar')"
        @keydown.space.prevent="openMediaViewer('avatar')"
      >
        <img v-if="group.avatar" :src="group.avatar" :alt="groupName" class="profile-page__avatar rounded-full" />
        <div v-else class="profile-page__avatar rounded-full bg-slate-800 flex items-center justify-center border-4 border-white shadow-md">
          <Icon name="i-ph-users-three-fill" class="h-16 w-16 text-[var(--text-tertiary)] sm:h-20 sm:w-20" />
        </div>
        <div v-if="avatarUploading" class="profile-page__avatar-loading">
          <Icon name="i-ph-spinner-gap-bold" class="h-8 w-8 animate-spin" />
        </div>
        <button
          v-if="group.canManage"
          type="button"
          class="profile-page__avatar-action"
          :disabled="avatarUploading"
          :aria-label="t('community.groupSettings.media.changeAvatar')"
          @click.stop="avatarInput?.click()"
        >
          <Icon name="i-ph-camera-bold" class="h-4 w-4" />
        </button>
        <input
          ref="avatarInput"
          type="file"
          accept="image/*"
          class="hidden"
          @change="onAvatarFileChange"
        >
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
      class="h-12 w-12 rounded-full bg-[var(--bg-muted)] hover:bg-[var(--bg-surface-hover)] text-[var(--text-primary)] justify-center"
        >
          <Icon name="i-ph-gear-six-bold" class="h-6 w-6" />
        </UButton>
      </div>
    </div>
  </div>

  <ImageViewer
    v-if="mediaViewer"
    :open="true"
    :src="mediaViewer.src"
    :alt="mediaViewer.alt"
    @close="mediaViewer = null"
  />

  <ImageCropModal
    v-if="avatarCropFile"
    :open="true"
    :file="avatarCropFile"
    kind="avatar"
    :show-post-text="false"
    @cancel="closeAvatarCropper"
    @confirm="uploadCroppedAvatar"
  />
</template>

<script setup lang="ts">
import { getCommunityGroupSettingsPath } from "../../domain/services/community-helpers.service"
import type { CommunityGroupRecord } from "../../domain/types/community.types"
import { createApiCommunityRepository } from "../../infrastructure/repositories/ApiCommunityRepository"
import ImageCropModal from "../../../shared-kernel/presentation/components/ImageCropModal.vue"
import CoverRepositionEditor from "../../../shared-kernel/presentation/components/CoverRepositionEditor.vue"
import ImageViewer from "../../../shared-kernel/presentation/components/ImageViewer.vue"

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
  mediaUpdated: [group: CommunityGroupRecord]
}>()

const repository = createApiCommunityRepository()
const toast = useToast()
const avatarInput = ref<HTMLInputElement | null>(null)
const coverInput = ref<HTMLInputElement | null>(null)
const avatarCropFile = ref<File | null>(null)
const coverDraft = ref<File | null>(null)
const mediaViewer = ref<{ src: string, alt: string } | null>(null)
const avatarUploading = ref(false)
const coverUploading = ref(false)

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

function openMediaViewer(kind: "avatar" | "cover") {
  if (coverDraft.value || avatarUploading.value || coverUploading.value) return

  const src = kind === "avatar" ? props.group.avatar : props.group.bannerUrl
  if (!src) return

  mediaViewer.value = {
    src,
    alt: groupName.value,
  }
}

function readSelectedImage(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0] || null
  target.value = ""

  if (file && !file.type.startsWith("image/")) {
    toast.add({
      title: t("pages.profilePage.imageInvalidTitle"),
      description: t("pages.profilePage.imageInvalidDescription"),
      color: "error",
    })
    return null
  }

  return file
}

function onAvatarFileChange(event: Event) {
  if (!props.group.canManage) return
  avatarCropFile.value = readSelectedImage(event)
}

function onCoverFileChange(event: Event) {
  if (!props.group.canManage) return
  coverDraft.value = readSelectedImage(event)
}

function closeAvatarCropper() {
  if (!avatarUploading.value) avatarCropFile.value = null
}

function closeCoverEditor() {
  if (!coverUploading.value) coverDraft.value = null
}

async function uploadCroppedAvatar(file: File) {
  avatarCropFile.value = null
  await uploadGroupMedia("avatar", file)
}

async function uploadRepositionedCover(file: File) {
  const updated = await uploadGroupMedia("cover", file)
  if (updated) coverDraft.value = null
}

async function uploadGroupMedia(kind: "avatar" | "cover", file: File) {
  if (!props.group.canManage) return false

  const uploading = kind === "avatar" ? avatarUploading : coverUploading
  uploading.value = true
  try {
    const updatedGroup = await repository.updateGroup(props.group.slug, kind === "avatar"
      ? { avatarFile: file }
      : { bannerFile: file })
    emit("mediaUpdated", updatedGroup)
    toast.add({
      title: t("community.detail.success"),
      description: t(kind === "avatar"
        ? "community.detail.updateAvatarSuccess"
        : "community.detail.updateCoverSuccess"),
      color: "success",
    })
    return true
  }
  catch (error) {
    toast.add({
      title: t("community.detail.error"),
      description: error instanceof Error
        ? error.message
        : t(kind === "avatar"
          ? "community.detail.updateAvatarError"
          : "community.detail.updateCoverError"),
      color: "error",
    })
    return false
  }
  finally {
    uploading.value = false
  }
}

const inviteButtonLabel = computed(() => {
  if (props.inviteState === "success") return t("pages.groupDetailPage.invitedButton")
  return translateText(props.group.inviteLabel, t("pages.groupDetailPage.inviteFallback"))
})
</script>

<style scoped>
/* ── Hero ─────────────────────────────────────────────── */
.profile-page__hero {
  background: var(--bg-surface);
  box-shadow: var(--shadow-sm);
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
  background: linear-gradient(135deg, var(--color-secondary-900) 0%, var(--bg-brand-hover) 56%, var(--color-primary-200) 100%);
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
  background: linear-gradient(135deg, var(--color-secondary-900) 0%, var(--bg-brand-hover) 56%, var(--color-primary-200) 100%);
}

.profile-page__cover-shade {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, color-mix(in srgb, var(--color-secondary-900) 15%, transparent) 0%, transparent 40%);
}

.profile-page__cover-action {
  position: absolute;
  right: 16px;
  bottom: 16px;
  z-index: 5;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 1px solid var(--border-media);
  border-radius: 12px;
  background: color-mix(in srgb, var(--bg-media) 62%, transparent);
  padding: 7px 12px;
  color: var(--text-media);
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
  backdrop-filter: blur(8px);
}

.profile-page__media-loading {
  position: absolute;
  z-index: 21;
  inset: 0;
  display: grid;
  place-items: center;
  background: color-mix(in srgb, var(--bg-media) 40%, transparent);
  color: var(--text-media);
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
  border: 4px solid var(--bg-surface);
  box-shadow: var(--shadow-md);
  display: block;
  object-fit: cover;
}

.profile-page__avatar-wrap--viewable {
  cursor: zoom-in;
}

.profile-page__cover--viewable:focus-visible,
.profile-page__avatar-wrap--viewable:focus-visible {
  outline: 3px solid var(--bg-brand);
  outline-offset: 3px;
}

.profile-page__avatar-action {
  position: absolute;
  right: 4px;
  bottom: 4px;
  z-index: 3;
  display: grid;
  width: 34px;
  height: 34px;
  place-items: center;
  border: 1px solid var(--border-light);
  border-radius: 999px;
  background: var(--bg-surface);
  color: var(--text-primary);
  box-shadow: var(--shadow-md);
  cursor: pointer;
}

.profile-page__avatar-loading {
  position: absolute;
  z-index: 2;
  inset: 4px;
  display: grid;
  place-items: center;
  border-radius: 999px;
  background: color-mix(in srgb, var(--bg-media) 42%, transparent);
  color: var(--text-media);
}

.profile-page__cover-action:disabled,
.profile-page__avatar-action:disabled {
  cursor: wait;
  opacity: 0.6;
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
  border: 1px solid color-mix(in srgb, var(--bg-surface) 58%, transparent);
  border-radius: 999px;
  background: color-mix(in srgb, var(--bg-surface) 72%, transparent);
  box-shadow: var(--shadow-md);
  backdrop-filter: blur(18px);
  padding: 6px 16px;
  font-size: clamp(1.5rem, 3vw, 2rem);
  font-weight: 900;
  letter-spacing: -0.03em;
  color: var(--text-primary);
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
  color: var(--text-secondary);
}

.profile-page__stat-chip strong {
  font-weight: 800;
  color: var(--text-primary);
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
