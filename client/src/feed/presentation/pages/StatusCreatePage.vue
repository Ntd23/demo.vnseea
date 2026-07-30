<!-- Description: Responsive story creator aligned with the native-app selection and editing flow. -->
<template>
  <div class="story-create mt-1.5">
    <header class="story-create__appbar">
      <NuxtLink
        :to="appRoutes.feed"
        class="story-create__close"
        :aria-label="t('pages.statusCreatePage.backToFeed')"
      >
        <Icon name="i-ph-x-bold" class="h-5 w-5" />
      </NuxtLink>

      <h1 class="story-create__appbar-title">{{ t("pages.statusCreatePage.title") }}</h1>

      <button
        class="story-create__publish"
        type="button"
        :disabled="!selectedFile || submitting"
        @click="publishStory"
      >
        <Icon
          v-if="submitting"
          name="i-ph-circle-notch-bold"
          class="story-create__spin h-4 w-4"
        />
        <span>{{ t("pages.statusCreatePage.submitCta") }}</span>
      </button>
    </header>

    <input
      ref="fileInputRef"
      class="story-create__file-input"
      type="file"
      :accept="pickerAccept"
      @change="handleFileSelection"
    >

    <main class="story-create__content">
      <section v-if="!selectedFile" class="story-create__empty">
        <div class="story-create__illustration" aria-hidden="true">
          <span class="story-create__spark story-create__spark--one">✦</span>
          <span class="story-create__spark story-create__spark--two">✦</span>
          <div class="story-create__illustration-card story-create__illustration-card--back">
            <Icon name="i-ph-video-camera-duotone" class="h-10 w-10" />
          </div>
          <div class="story-create__illustration-card story-create__illustration-card--front">
            <Icon name="i-ph-image-square-duotone" class="h-11 w-11" />
          </div>
        </div>

        <div class="story-create__intro">
          <h2>{{ t("pages.statusCreatePage.emptyTitle") }}</h2>
          <p>{{ t("pages.statusCreatePage.emptyDescription") }}</p>
        </div>

        <div class="story-create__picker-grid">
          <button class="story-create__picker-card" type="button" @click="openPicker('image')">
            <span class="story-create__picker-icon story-create__picker-icon--image">
              <Icon name="i-ph-image-square-duotone" class="h-8 w-8" />
            </span>
            <span class="story-create__picker-copy">
              <strong>{{ t("pages.statusCreatePage.chooseImage") }}</strong>
              <small>{{ t("pages.statusCreatePage.chooseImageHint") }}</small>
            </span>
            <span class="story-create__picker-arrow story-create__picker-arrow--image">
              <Icon name="i-ph-arrow-right-bold" class="h-4 w-4" />
            </span>
          </button>

          <button class="story-create__picker-card" type="button" @click="openPicker('video')">
            <span class="story-create__picker-icon story-create__picker-icon--video">
              <Icon name="i-ph-video-camera-duotone" class="h-8 w-8" />
            </span>
            <span class="story-create__picker-copy">
              <strong>{{ t("pages.statusCreatePage.chooseVideo") }}</strong>
              <small>{{ t("pages.statusCreatePage.chooseVideoHint") }}</small>
            </span>
            <span class="story-create__picker-arrow story-create__picker-arrow--video">
              <Icon name="i-ph-arrow-right-bold" class="h-4 w-4" />
            </span>
          </button>
        </div>

        <div class="story-create__notice">
          <span class="story-create__notice-icon">
            <Icon name="i-ph-shield-check-duotone" class="h-6 w-6" />
          </span>
          <p>{{ t("pages.statusCreatePage.privacyNotice") }}</p>
          <Icon name="i-ph-caret-right-bold" class="story-create__notice-arrow h-4 w-4" />
        </div>
      </section>

      <section v-else class="story-create__editor">
        <div class="story-create__preview-column">
          <div
            ref="previewFrameRef"
            class="story-create__preview"
            :class="[
              mediaType && `story-create__preview--${mediaType}`,
              mediaOrientation && `story-create__preview--${mediaOrientation}`,
            ]"
          >
            <img
              v-if="mediaType === 'image' && previewUrl"
              :src="previewUrl"
              :alt="t('pages.statusCreatePage.previewAlt')"
              class="story-create__media"
              @load="handleImageLoad"
            >
            <video
              v-else-if="mediaType === 'video' && previewUrl"
              :src="previewUrl"
              class="story-create__media"
              controls
              muted
              playsinline
              preload="metadata"
              @loadedmetadata="handleVideoMetadata"
            />

            <div class="story-create__preview-shade" />

            <div class="story-create__preview-progress" aria-hidden="true">
              <span />
            </div>

            <div class="story-create__preview-author">
              <span class="story-create__preview-avatar">
                <img
                  v-if="previewAuthor.avatarUrl"
                  :src="previewAuthor.avatarUrl"
                  :alt="previewAuthor.name"
                >
                <span v-else>{{ previewAuthor.initials }}</span>
              </span>
              <span class="story-create__preview-author-copy">
                <strong>{{ previewAuthor.name }}</strong>
                <small>{{ previewAudienceLabel }}</small>
              </span>
            </div>

            <div class="story-create__preview-tools">
              <button
                type="button"
                class="story-create__preview-tool"
                :class="{ 'story-create__preview-tool--active': activeOverlayEditor === 'text' }"
                :aria-label="t('pages.statusCreatePage.addText')"
                :title="t('pages.statusCreatePage.addText')"
                @click="openStoryTextEditor"
              >
                <Icon name="i-ph-text-aa-bold" />
              </button>
              <button
                type="button"
                class="story-create__preview-tool"
                :class="{ 'story-create__preview-tool--active': activeOverlayEditor === 'mention' }"
                :aria-label="t('pages.statusCreatePage.tagPeople')"
                :title="t('pages.statusCreatePage.tagPeople')"
                @click="openStoryTagEditor"
              >
                <Icon name="i-ph-at-bold" />
              </button>
            </div>

            <div
              v-if="activeOverlayEditor === 'text' || title.trim()"
              class="story-create__overlay-layer story-create__overlay-layer--text"
              :class="{ 'story-create__overlay-layer--editing': activeOverlayEditor === 'text' }"
              :style="overlayPositionStyle(textOverlayPosition)"
              @click.stop
            >
              <button
                v-if="activeOverlayEditor === 'text'"
                type="button"
                class="story-create__overlay-drag"
                :aria-label="t('pages.statusCreatePage.moveText')"
                @pointerdown.stop.prevent="startOverlayDrag('text', $event)"
              >
                <Icon name="i-ph-dots-six-vertical-bold" />
              </button>
              <input
                ref="textInputRef"
                v-model="title"
                class="story-create__overlay-input story-create__overlay-input--text"
                type="text"
                :maxlength="feedStoryTitleMaxLength"
                :placeholder="t('pages.statusCreatePage.textPlaceholder')"
                @focus="activeOverlayEditor = 'text'"
                @keydown.esc.prevent="closeOverlayEditor"
              >
            </div>

            <div
              v-if="activeOverlayEditor === 'mention' || caption.trim()"
              class="story-create__overlay-layer story-create__overlay-layer--mention"
              :class="{ 'story-create__overlay-layer--editing': activeOverlayEditor === 'mention' }"
              :style="overlayPositionStyle(mentionOverlayPosition)"
              @click.stop
            >
              <button
                v-if="activeOverlayEditor === 'mention'"
                type="button"
                class="story-create__overlay-drag"
                :aria-label="t('pages.statusCreatePage.moveMention')"
                @pointerdown.stop.prevent="startOverlayDrag('mention', $event)"
              >
                <Icon name="i-ph-dots-six-vertical-bold" />
              </button>
              <input
                ref="captionInputRef"
                v-model="caption"
                class="story-create__overlay-input story-create__overlay-input--mention"
                type="text"
                :maxlength="feedStoryCaptionMaxLength"
                :placeholder="t('pages.statusCreatePage.tagPlaceholder')"
                @focus="activeOverlayEditor = 'mention'"
                @input="handleStoryMentionInput"
                @click="updateMentionQuery"
                @keyup="handleMentionKeyup"
                @keydown.esc.prevent="closeOverlayEditor"
              >

              <div v-if="showMentionSuggestions" class="story-create__mention-popover">
                <div v-if="mentionLoading" class="story-create__mention-state">
                  <Icon name="i-ph-spinner-gap-bold" class="story-create__spin" />
                  <span>{{ t("pages.statusCreatePage.mentionLoading") }}</span>
                </div>
                <template v-else-if="mentionQuery.trim()">
                  <button
                    v-for="user in mentionSuggestions"
                    :key="user.id"
                    type="button"
                    class="story-create__mention-option"
                    @mousedown.prevent="selectMention(user)"
                  >
                    <span class="story-create__mention-avatar">
                      <img v-if="user.avatarUrl" :src="user.avatarUrl" :alt="user.name">
                      <span v-else>{{ user.initials }}</span>
                    </span>
                    <span>
                      <strong>{{ user.name }}</strong>
                      <small>@{{ user.username }}</small>
                    </span>
                  </button>
                </template>
                <div v-else class="story-create__mention-state">
                  {{ t("pages.statusCreatePage.mentionTypeToSearch") }}
                </div>
                <div
                  v-if="!mentionLoading && mentionQuery.trim() && mentionSuggestions.length === 0"
                  class="story-create__mention-state"
                >
                  {{ t("pages.statusCreatePage.mentionEmpty") }}
                </div>
              </div>
            </div>

            <button
              class="story-create__remove"
              type="button"
              :aria-label="t('pages.statusCreatePage.removeFile')"
              @click="removeFile"
            >
              <Icon name="i-ph-trash-simple-bold" class="h-5 w-5" />
            </button>
          </div>

          <button class="story-create__change-media" type="button" @click="openPicker()">
            <Icon name="i-ph-arrows-clockwise-bold" class="h-4 w-4" />
            <span>{{ t("pages.statusCreatePage.changeMedia") }}</span>
          </button>
        </div>

        <aside class="story-create__settings">
          <fieldset class="story-create__audience">
            <legend>{{ t("pages.statusCreatePage.audienceLabel") }}</legend>
            <div class="story-create__audience-options">
              <button
                v-for="option in privacyOptions"
                :key="option.value"
                class="story-create__audience-option"
                :class="{ 'story-create__audience-option--active': privacy === option.value }"
                type="button"
                @click="privacy = option.value"
              >
                <Icon :name="option.icon" class="h-4 w-4" />
                <span>{{ option.label }}</span>
              </button>
            </div>
          </fieldset>

          <p
            v-if="statusDescription"
            class="story-create__status"
            :class="{ 'story-create__status--error': submitStatus === 'error' }"
          >
            {{ statusDescription }}
          </p>
        </aside>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import type { ContentAudience } from "../../../shared-kernel/domain/content-audience"
import { useCurrentAuthUserStore } from "../../../auth/application/stores/useCurrentAuthUserStore"
import { useFeedMentionSearch } from "../../application/composables/useFeedMentionSearch"
import { useStatusCreatePageVM } from "../../application/view-models/useStatusCreatePageVM"
import {
  feedStoryCaptionMaxLength,
  feedStoryTitleMaxLength,
} from "../../application/constants/story-carousel"

const { t, locale } = useI18n()
const currentAuthUserStore = useCurrentAuthUserStore()

useSeoMeta({
  title: () => t("pages.statusCreatePage.seoTitle"),
  description: () => t("pages.statusCreatePage.seoDescription"),
})

const {
  fileInputRef,
  selectedFile,
  previewUrl,
  mediaType,
  mediaOrientation,
  pickerAccept,
  title,
  caption,
  privacy,
  submitting,
  submitStatus,
  statusDescription,
  openPicker,
  handleFileSelection,
  handleImageLoad,
  handleVideoMetadata,
  removeFile,
  submitStory,
  appRoutes,
} = useStatusCreatePageVM()

type StoryOverlayKind = "text" | "mention"
type StoryOverlayPosition = { x: number, y: number }
type StoryOverlayDragState = {
  kind: StoryOverlayKind
  offsetX: number
  offsetY: number
}

const previewFrameRef = ref<HTMLElement | null>(null)
const textInputRef = ref<HTMLInputElement | null>(null)
const captionInputRef = ref<HTMLInputElement | null>(null)
const activeOverlayEditor = ref<StoryOverlayKind | null>(null)
const textOverlayPosition = reactive<StoryOverlayPosition>({ x: 0.5, y: 0.44 })
const mentionOverlayPosition = reactive<StoryOverlayPosition>({ x: 0.5, y: 0.58 })
const draggingOverlay = ref<StoryOverlayDragState | null>(null)
const mentionSearchActive = computed(() =>
  Boolean(selectedFile.value && activeOverlayEditor.value === "mention"),
)
const previewAuthor = computed(() => {
  const name = currentAuthUserStore.user?.name?.trim()
    || t("pages.statusCreatePage.previewFallbackName")

  return {
    name,
    avatarUrl: currentAuthUserStore.user?.avatarUrl || "",
    initials: name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part[0]?.toUpperCase() || "")
      .join("")
      || t("pages.statusCreatePage.previewInitialsFallback"),
  }
})
const previewAudienceLabel = computed(() =>
  t(`feed.storyCarousel.audiences.${privacy.value}`),
)

const {
  mentionQuery,
  mentionLoading,
  mentionSuggestions,
  selectedMentionUsernames,
  showMentionSuggestions,
  updateMentionQuery,
  handleMentionKeyup,
  closeMentionSuggestions,
  selectMention,
  clearSelectedMentions,
  createBackendMentionText,
} = useFeedMentionSearch({
  text: caption,
  textarea: captionInputRef,
  active: mentionSearchActive,
  followingOnly: true,
})

function overlayPositionStyle(position: StoryOverlayPosition) {
  return {
    left: `${position.x * 100}%`,
    top: `${position.y * 100}%`,
  }
}

async function openStoryTextEditor() {
  activeOverlayEditor.value = "text"
  closeMentionSuggestions()
  await nextTick()
  textInputRef.value?.focus()
}

async function openStoryTagEditor() {
  activeOverlayEditor.value = "mention"
  if (!caption.value.trim()) {
    caption.value = "@"
  }

  await nextTick()
  const input = captionInputRef.value
  const caret = caption.value.length
  input?.focus()
  input?.setSelectionRange(caret, caret)
  updateMentionQuery()
}

function handleStoryMentionInput(event: Event) {
  updateMentionQuery(event)
}

function closeOverlayEditor() {
  closeMentionSuggestions()
  activeOverlayEditor.value = null
}

function updateOverlayPosition(
  kind: StoryOverlayKind,
  event: PointerEvent,
  offsetX = 0,
  offsetY = 0,
) {
  const frame = previewFrameRef.value
  if (!frame) return

  const rect = frame.getBoundingClientRect()
  if (!rect.width || !rect.height) return

  const position = kind === "text" ? textOverlayPosition : mentionOverlayPosition
  position.x = Math.min(0.92, Math.max(0.08, (event.clientX - offsetX - rect.left) / rect.width))
  position.y = Math.min(0.88, Math.max(0.12, (event.clientY - offsetY - rect.top) / rect.height))
}

function handleOverlayDrag(event: PointerEvent) {
  const drag = draggingOverlay.value
  if (!drag) return

  updateOverlayPosition(drag.kind, event, drag.offsetX, drag.offsetY)
}

function stopOverlayDrag() {
  draggingOverlay.value = null
  window.removeEventListener("pointermove", handleOverlayDrag)
  window.removeEventListener("pointerup", stopOverlayDrag)
  window.removeEventListener("pointercancel", stopOverlayDrag)
}

function startOverlayDrag(kind: StoryOverlayKind, event: PointerEvent) {
  const frame = previewFrameRef.value
  const position = kind === "text" ? textOverlayPosition : mentionOverlayPosition
  const rect = frame?.getBoundingClientRect()

  if (!rect) return

  draggingOverlay.value = {
    kind,
    offsetX: event.clientX - (rect.left + position.x * rect.width),
    offsetY: event.clientY - (rect.top + position.y * rect.height),
  }
  window.addEventListener("pointermove", handleOverlayDrag)
  window.addEventListener("pointerup", stopOverlayDrag, { once: true })
  window.addEventListener("pointercancel", stopOverlayDrag, { once: true })
}

async function publishStory() {
  const backendMention = createBackendMentionText().trim()
  const taggedUsername = Object.values(selectedMentionUsernames.value)[0]?.trim().replace(/^@/, "")

  await submitStory({
    description: backendMention,
    overlays: {
      ...(title.value.trim()
        ? {
            text: {
              content: title.value.trim(),
              x: textOverlayPosition.x,
              y: textOverlayPosition.y,
            },
          }
        : {}),
      ...(caption.value.trim()
        ? {
            mention: {
              content: caption.value.trim(),
              x: mentionOverlayPosition.x,
              y: mentionOverlayPosition.y,
              ...(taggedUsername ? { username: taggedUsername } : {}),
            },
          }
        : {}),
    },
  })
}

watch(selectedFile, (file) => {
  if (file) return

  activeOverlayEditor.value = null
  title.value = ""
  caption.value = ""
  textOverlayPosition.x = 0.5
  textOverlayPosition.y = 0.44
  mentionOverlayPosition.x = 0.5
  mentionOverlayPosition.y = 0.58
  clearSelectedMentions()
  closeMentionSuggestions()
})

onBeforeUnmount(stopOverlayDrag)

type PrivacyOption = {
  value: ContentAudience
  label: string
  icon: string
}

const privacyOptions = computed<PrivacyOption[]>(() => locale.value === "vi"
  ? [
      { value: "public", label: "Công khai", icon: "i-ph-globe-hemisphere-west-duotone" },
      { value: "friends", label: "Bạn bè", icon: "i-ph-users-duotone" },
      { value: "followers", label: "Người theo dõi", icon: "i-ph-user-focus-duotone" },
      { value: "only_me", label: "Chỉ mình tôi", icon: "i-ph-lock-key-duotone" },
    ]
  : [
      { value: "public", label: "Public", icon: "i-ph-globe-hemisphere-west-duotone" },
      { value: "friends", label: "Friends", icon: "i-ph-users-duotone" },
      { value: "followers", label: "Followers", icon: "i-ph-user-focus-duotone" },
      { value: "only_me", label: "Only me", icon: "i-ph-lock-key-duotone" },
    ])
</script>

<style scoped>
.story-create {
  width: min(100%, 1120px);
  min-height: calc(100dvh - 72px);
  color: var(--text-primary);
}

.story-create__appbar {
  position: relative;
  z-index: 10;
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr) auto;
  min-height: 60px;
  align-items: center;
  gap: 10px;
  padding: 8px;
  border: 1px solid var(--border-light);
  border-radius: 16px;
  background: var(--bg-surface);
  box-shadow: var(--shadow-sm);
}

.story-create__close,
.story-create__remove {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.15s ease;
}

.story-create__close {
  width: 42px;
  height: 42px;
  background: var(--bg-muted);
  color: var(--text-primary);
}

.story-create__close:hover {
  background: var(--bg-surface-hover);
  color: var(--text-primary);
}

.story-create__appbar-title {
  margin: 0;
  overflow: hidden;
  color: var(--text-primary);
  font-size: 18px;
  font-weight: 800;
  letter-spacing: -0.01em;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.story-create__publish {
  display: inline-flex;
  min-width: 82px;
  min-height: 40px;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 9px 16px;
  border: 0;
  border-radius: 12px;
  background: var(--bg-brand);
  color: var(--text-inverse);
  box-shadow: var(--shadow-brand);
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
}

.story-create__publish:disabled {
  background: var(--bg-muted);
  color: var(--text-tertiary);
  box-shadow: none;
  cursor: not-allowed;
}

.story-create__file-input {
  position: fixed;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
}

.story-create__content {
  padding-top: 18px;
}

.story-create__empty {
  display: flex;
  width: min(100%, 820px);
  margin: 0 auto;
  flex-direction: column;
  align-items: center;
  gap: 22px;
  padding: 18px 0 32px;
}

.story-create__illustration {
  position: relative;
  width: 180px;
  height: 150px;
}

.story-create__illustration-card {
  position: absolute;
  display: flex;
  width: 106px;
  height: 132px;
  align-items: center;
  justify-content: center;
  border: 2px solid;
  border-radius: 18px;
  box-shadow: var(--shadow-lg);
}

.story-create__illustration-card--back {
  top: 5px;
  right: 18px;
  transform: rotate(13deg);
  border-color: var(--border-default);
  background: var(--bg-muted);
  color: var(--icon-secondary);
}

.story-create__illustration-card--front {
  bottom: 0;
  left: 20px;
  transform: rotate(-8deg);
  border-color: var(--border-default);
  background: var(--bg-surface-active);
  color: var(--icon-brand);
}

.story-create__spark {
  position: absolute;
  z-index: 2;
  color: var(--icon-brand);
  font-size: 24px;
}

.story-create__spark--one {
  top: 22px;
  left: 4px;
}

.story-create__spark--two {
  right: 0;
  bottom: 24px;
}

.story-create__intro {
  max-width: 560px;
  text-align: center;
}

.story-create__intro h2 {
  margin: 0;
  color: var(--text-primary);
  font-size: clamp(1.35rem, 4vw, 1.8rem);
  font-weight: 800;
  letter-spacing: -0.02em;
}

.story-create__intro p {
  margin: 8px 0 0;
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.6;
}

.story-create__picker-grid {
  display: grid;
  width: 100%;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.story-create__picker-card {
  display: grid;
  min-width: 0;
  min-height: 172px;
  grid-template-rows: auto 1fr auto;
  justify-items: center;
  gap: 12px;
  padding: 20px 16px;
  border: 1px solid var(--border-light);
  border-radius: 16px;
  background: var(--bg-surface);
  box-shadow: var(--shadow-sm);
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.15s ease;
}

.story-create__picker-card:hover {
  transform: translateY(-2px);
  border-color: var(--border-default);
  box-shadow: var(--shadow-md);
}

.story-create__picker-icon,
.story-create__picker-arrow,
.story-create__notice-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.story-create__picker-icon {
  width: 62px;
  height: 62px;
}

.story-create__picker-icon--image,
.story-create__picker-arrow--image {
  background: var(--bg-surface-active);
  color: var(--icon-brand);
}

.story-create__picker-icon--video,
.story-create__picker-arrow--video {
  background: var(--bg-muted);
  color: var(--icon-secondary);
}

.story-create__picker-copy {
  display: flex;
  min-width: 0;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.story-create__picker-copy strong {
  font-size: 15px;
  font-weight: 800;
}

.story-create__picker-copy small {
  color: var(--text-tertiary);
  font-size: 12px;
  line-height: 1.45;
  text-align: center;
}

.story-create__picker-arrow {
  width: 34px;
  height: 34px;
}

.story-create__notice {
  display: grid;
  width: 100%;
  grid-template-columns: 44px minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border: 1px solid var(--border-light);
  border-radius: 16px;
  background: var(--bg-surface-active);
}

.story-create__notice-icon {
  width: 44px;
  height: 44px;
  background: var(--bg-surface);
  color: var(--icon-brand);
}

.story-create__notice p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 600;
  line-height: 1.5;
}

.story-create__notice-arrow {
  color: var(--text-tertiary);
}

.story-create__editor {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 16px;
}

.story-create__preview-column,
.story-create__settings {
  min-width: 0;
  border: 1px solid var(--border-light);
  border-radius: 16px;
  background: var(--bg-surface);
  box-shadow: var(--shadow-sm);
}

.story-create__preview-column {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 14px;
}

.story-create__preview {
  position: relative;
  width: auto;
  max-width: 100%;
  height: min(86dvh, 817px);
  aspect-ratio: 9 / 16;
  overflow: hidden;
  border-radius: 28px;
  background: var(--bg-media);
  box-shadow: var(--shadow-lg);
}

.story-create__media {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  background: var(--bg-media);
}

.story-create__preview--landscape .story-create__media,
.story-create__preview--square .story-create__media,
.story-create__preview--video .story-create__media {
  object-fit: contain;
}

.story-create__preview-shade {
  position: absolute;
  inset: 0;
  z-index: 1;
  background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--bg-media) 42%, transparent) 0%,
    color-mix(in srgb, var(--bg-media) 8%, transparent) 42%,
    color-mix(in srgb, var(--bg-media) 68%, transparent) 100%
  );
  pointer-events: none;
}

.story-create__preview-progress {
  position: absolute;
  z-index: 4;
  top: 12px;
  right: 12px;
  left: 12px;
  height: 3px;
  overflow: hidden;
  border-radius: 999px;
  background: color-mix(in srgb, var(--text-media) 30%, transparent);
}

.story-create__preview-progress span {
  display: block;
  width: 42%;
  height: 100%;
  border-radius: inherit;
  background: var(--text-media);
}

.story-create__preview-author {
  position: absolute;
  z-index: 4;
  top: 28px;
  right: 58px;
  left: 16px;
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 10px;
  color: var(--text-media);
}

.story-create__preview-avatar {
  display: inline-flex;
  width: 38px;
  height: 38px;
  flex: 0 0 38px;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 2px solid var(--text-media);
  border-radius: 50%;
  background: var(--bg-brand);
  font-size: 11px;
  font-weight: 800;
}

.story-create__preview-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.story-create__preview-author-copy {
  display: flex;
  min-width: 0;
  flex-direction: column;
}

.story-create__preview-author-copy strong {
  overflow: hidden;
  font-size: 14px;
  font-weight: 800;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.story-create__preview-author-copy small {
  overflow: hidden;
  margin-top: 2px;
  color: color-mix(in srgb, var(--text-media) 80%, transparent);
  font-size: 11px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.story-create__preview-tools {
  position: absolute;
  z-index: 6;
  top: 82px;
  right: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.story-create__preview-tool {
  display: inline-flex;
  width: 38px;
  height: 38px;
  align-items: center;
  justify-content: center;
  border: 1px solid color-mix(in srgb, var(--text-media) 30%, transparent);
  border-radius: 50%;
  background: color-mix(in srgb, var(--bg-media) 38%, transparent);
  color: var(--text-media);
  cursor: pointer;
  backdrop-filter: blur(10px);
  transition: background-color 0.15s ease, transform 0.15s ease;
}

.story-create__preview-tool:hover,
.story-create__preview-tool--active {
  background: var(--bg-brand);
  transform: scale(1.05);
}

.story-create__preview-tool svg {
  width: 18px;
  height: 18px;
}

.story-create__overlay-layer {
  position: absolute;
  z-index: 5;
  width: min(72%, 320px);
  transform: translate(-50%, -50%);
  touch-action: none;
}

.story-create__overlay-layer--mention {
  width: min(66%, 290px);
}

.story-create__overlay-input {
  width: 100%;
  border: 0;
  padding: 4px 6px;
  outline: none;
  background: transparent;
  color: var(--text-media);
  caret-color: var(--text-media);
  font-family: inherit;
  font-size: clamp(16px, 2.4vw, 20px);
  font-weight: 800;
  line-height: 1.45;
  text-align: center;
  text-shadow: 0 2px 7px color-mix(in srgb, var(--bg-media) 72%, transparent);
}

.story-create__overlay-input--mention {
  color: var(--color-accent-100);
}

.story-create__overlay-input::placeholder {
  color: var(--text-media-muted);
}

.story-create__overlay-input--mention::placeholder {
  color: color-mix(in srgb, var(--color-accent-100) 78%, transparent);
}

.story-create__overlay-drag {
  position: absolute;
  top: -30px;
  left: 50%;
  display: inline-flex;
  width: 28px;
  height: 28px;
  transform: translateX(-50%);
  align-items: center;
  justify-content: center;
  border: 1px solid color-mix(in srgb, var(--text-media) 35%, transparent);
  border-radius: 50%;
  background: color-mix(in srgb, var(--bg-media) 32%, transparent);
  color: var(--text-media);
  cursor: grab;
  backdrop-filter: blur(10px);
}

.story-create__overlay-drag:active {
  cursor: grabbing;
}

.story-create__mention-popover {
  position: absolute;
  z-index: 8;
  top: calc(100% + 8px);
  left: 50%;
  width: min(92vw, 330px);
  max-height: 220px;
  transform: translateX(-50%);
  overflow-y: auto;
  border: 1px solid var(--border-light);
  border-radius: 16px;
  background: var(--bg-surface);
  box-shadow: var(--shadow-xl);
  padding: 6px;
}

.story-create__mention-option,
.story-create__mention-state {
  width: 100%;
  min-height: 48px;
  border: 0;
  border-radius: 12px;
  padding: 7px 9px;
}

.story-create__mention-option {
  display: flex;
  align-items: center;
  gap: 9px;
  background: transparent;
  color: var(--text-primary);
  text-align: left;
  cursor: pointer;
}

.story-create__mention-option:hover {
  background: var(--bg-surface-hover);
}

.story-create__mention-avatar {
  display: inline-flex;
  width: 34px;
  height: 34px;
  flex: 0 0 34px;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 50%;
  background: var(--bg-muted);
  color: var(--text-secondary);
  font-size: 11px;
  font-weight: 800;
}

.story-create__mention-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.story-create__mention-option > span:last-child {
  display: flex;
  min-width: 0;
  flex-direction: column;
}

.story-create__mention-option strong {
  overflow: hidden;
  font-size: 12px;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.story-create__mention-option small {
  color: var(--text-tertiary);
  font-size: 11px;
}

.story-create__mention-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 600;
  text-align: center;
}

.story-create__remove {
  position: absolute;
  z-index: 7;
  top: 14px;
  right: 14px;
  width: 42px;
  height: 42px;
  background: color-mix(in srgb, var(--bg-media) 78%, transparent);
  color: var(--text-media);
  backdrop-filter: blur(10px);
}

.story-create__remove:hover {
  background: var(--color-error);
}

.story-create__change-media {
  display: inline-flex;
  min-height: 40px;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 9px 14px;
  border: 1px solid var(--border-light);
  border-radius: 12px;
  background: var(--bg-surface);
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
}

.story-create__change-media:hover {
  border-color: var(--border-default);
  background: var(--bg-surface-active);
  color: var(--text-brand);
}

.story-create__settings {
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 16px;
}

.story-create__audience {
  min-width: 0;
  margin: 0;
  padding: 0;
  border: 0;
}

.story-create__audience legend,
.story-create__field > span {
  margin-bottom: 9px;
  color: var(--text-primary);
  font-size: 12px;
  font-weight: 800;
}

.story-create__audience-options {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.story-create__audience-option {
  display: inline-flex;
  min-height: 38px;
  align-items: center;
  gap: 6px;
  padding: 8px 11px;
  border: 1px solid var(--border-light);
  border-radius: 10px;
  background: var(--bg-surface);
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
}

.story-create__audience-option:hover {
  background: var(--bg-surface-hover);
  color: var(--text-brand);
}

.story-create__audience-option--active {
  border-color: var(--border-default);
  background: var(--bg-surface-active);
  color: var(--text-brand);
  box-shadow: var(--shadow-sm);
}

.story-create__field {
  position: relative;
  display: flex;
  min-width: 0;
  flex-direction: column;
}

.story-create__field input,
.story-create__field textarea {
  width: 100%;
  border: 1px solid var(--border-light);
  border-radius: 12px;
  outline: none;
  background: var(--bg-surface);
  color: var(--text-primary);
  font-family: inherit;
  font-size: 13px;
  line-height: 1.55;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.story-create__field input {
  min-height: 46px;
  padding: 11px 54px 11px 12px;
}

.story-create__field textarea {
  min-height: 132px;
  resize: vertical;
  padding: 11px 54px 11px 12px;
}

.story-create__field input:focus,
.story-create__field textarea:focus {
  border-color: var(--border-default);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--bg-brand) 5%, transparent);
}

.story-create__field input::placeholder,
.story-create__field textarea::placeholder {
  color: var(--text-tertiary);
}

.story-create__field small {
  position: absolute;
  right: 10px;
  bottom: 9px;
  color: var(--text-tertiary);
  font-size: 10px;
  font-weight: 600;
}

.story-create__status {
  margin: 0;
  padding: 10px 12px;
  border-radius: 10px;
  background: var(--bg-surface-active);
  color: var(--text-brand);
  font-size: 12px;
  font-weight: 600;
}

.story-create__status--error {
  background: color-mix(in srgb, var(--color-error) 10%, var(--bg-surface));
  color: var(--text-danger);
}

.story-create__spin {
  animation: story-create-spin 0.85s linear infinite;
}

@keyframes story-create-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (min-width: 640px) {


  .story-create__appbar {
    min-height: 68px;
  }


  .story-create__picker-card {
    min-height: 190px;
  }

}

@media (min-width: 900px) {
  .story-create__editor {
    grid-template-columns: minmax(0, 1fr) minmax(300px, 0.72fr);
    gap: 20px;
  }

  .story-create__settings {
    position: sticky;
    top: 20px;
  }

  .story-create__preview {
    height: min(86dvh, 817px);
  }
}

@media (max-width: 479px) {


  .story-create__appbar {
    margin-inline: -8px;
    border-width: 0 0 1px;
    border-radius: 0;
    box-shadow: none;
  }

  .story-create__publish {
    min-width: 70px;
    padding-inline: 12px;
  }

  .story-create__content {
    padding-top: 14px;
  }

  .story-create__empty {
    gap: 18px;
    padding-inline: 4px;
  }

  .story-create__illustration {
    transform: scale(0.88);
    margin-block: -8px;
  }

  .story-create__picker-grid {
    gap: 10px;
  }

  .story-create__picker-card {
    min-height: 160px;
    padding: 16px 10px;
  }

  .story-create__picker-icon {
    width: 54px;
    height: 54px;
  }

  .story-create__notice {
    grid-template-columns: 40px minmax(0, 1fr) auto;
    padding: 12px;
  }

  .story-create__notice-icon {
    width: 40px;
    height: 40px;
  }

  .story-create__preview-column,
  .story-create__settings {
    padding: 10px;
  }

  .story-create__preview {
    width: 100%;
    height: auto;
    border-radius: 18px;
  }

  .story-create__settings {
    gap: 16px;
  }
}

@media (max-width: 350px) {
  .story-create__appbar-title {
    font-size: 16px;
  }

  .story-create__picker-copy small {
    display: none;
  }

  .story-create__picker-card {
    min-height: 140px;
  }
}
</style>
