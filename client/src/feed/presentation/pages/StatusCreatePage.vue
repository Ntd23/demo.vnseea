<!-- Description: Story/status creation screen with media selection inside the preview surface. -->
<template>
  <div class="status-create">
    <div class="status-create__topbar">
      <div class="status-create__heading">
        <p class="status-create__eyebrow">{{ t("pages.statusCreatePage.eyebrow") }}</p>
        <h1 class="status-create__title">{{ t("pages.statusCreatePage.title") }}</h1>
      </div>
    </div>

    <input
      ref="fileInputRef"
      :accept="feedStoryAcceptedMimeTypes"
      class="hidden"
      type="file"
      @change="handleFileSelection"
    >

    <div class="status-create__grid">
      <aside class="status-create__preview-pane">
        <p class="status-create__preview-eyebrow">{{ t("pages.statusCreatePage.previewEyebrow") }}</p>

        <div class="status-create__phone">
          <div
            ref="phoneScreenRef"
            class="status-create__phone-screen"
            @pointermove="dragCaption"
            @pointerup="stopCaptionDrag"
            @pointercancel="stopCaptionDrag"
            @pointerleave="stopCaptionDrag"
          >
            <template v-if="mediaType === 'image' && previewUrl">
              <NuxtImg :src="previewUrl" :alt="t('pages.statusCreatePage.previewAlt')" class="status-create__phone-media" />
            </template>
            <template v-else-if="mediaType === 'video' && previewUrl">
              <video :src="previewUrl" class="status-create__phone-media" controls muted playsinline />
            </template>
            <template v-else>
              <button
                class="status-create__preview-upload"
                type="button"
                :aria-label="t('pages.statusCreatePage.changeFile')"
                :title="t('pages.statusCreatePage.changeFile')"
                @click="openPicker"
              >
                <Icon name="i-ph-upload-simple-duotone" class="h-9 w-9" />
              </button>
            </template>

            <div class="status-create__phone-overlay" />

            <div v-if="selectedFile" class="status-create__preview-actions">
              <button
                class="status-create__preview-action"
                type="button"
                :aria-label="t('pages.statusCreatePage.changeFile')"
                :title="t('pages.statusCreatePage.changeFile')"
                @click="openPicker"
              >
                <Icon name="i-ph-arrows-clockwise-bold" class="h-4 w-4" />
              </button>
              <button
                class="status-create__preview-action"
                type="button"
                :aria-label="t('pages.statusCreatePage.captionPlaceholder')"
                :title="t('pages.statusCreatePage.captionPlaceholder')"
                @click="openCaptionEditor"
              >
                <Icon name="i-ph-text-aa-bold" class="h-4 w-4" />
              </button>
              <button
                class="status-create__preview-action status-create__preview-action--danger"
                type="button"
                :aria-label="t('pages.statusCreatePage.removeFile')"
                :title="t('pages.statusCreatePage.removeFile')"
                @click="removeFile"
              >
                <Icon name="i-ph-trash-simple-bold" class="h-4 w-4" />
              </button>
            </div>

            <button
              v-if="selectedFile"
              class="status-create__preview-submit"
              type="button"
              :disabled="submitting"
              :aria-label="t('pages.statusCreatePage.submitCta')"
              :title="t('pages.statusCreatePage.submitCta')"
              @click="submitStory"
            >
              <Icon
                :name="submitting ? 'i-ph-circle-notch-bold' : 'i-ph-paper-plane-tilt-fill'"
                class="h-4 w-4"
                :class="{ 'status-create__spin': submitting }"
              />
              <span>Đăng tin</span>
            </button>

            <div class="status-create__phone-bars">
              <div class="status-create__phone-bar">
                <div class="status-create__phone-bar-fill" :style="{ width: previewBarWidth }" />
              </div>
              <div class="status-create__phone-bar status-create__phone-bar--dim" />
              <div class="status-create__phone-bar status-create__phone-bar--dim" />
            </div>

            <div class="status-create__phone-author">
              <div class="status-create__phone-avatar">
                <NuxtImg v-if="currentUserAvatar" :src="currentUserAvatar" :alt="currentUserName" class="status-create__phone-avatar-img" />
                <span v-else>{{ currentUserInitials }}</span>
              </div>
              <div>
                <p class="status-create__phone-name">{{ currentUserName || t("pages.statusCreatePage.previewFallbackName") }}</p>
                <p class="status-create__phone-time">{{ t("pages.statusCreatePage.previewTimestamp") }}</p>
              </div>
            </div>

            <div
              v-if="showCaptionEditor || caption"
              class="status-create__phone-caption"
              :style="{ left: `${captionPosition.x}%`, top: `${captionPosition.y}%` }"
              @pointerdown="startCaptionDrag"
              @pointermove="dragCaption"
              @pointerup="stopCaptionDrag"
              @pointercancel="stopCaptionDrag"
              @click="openCaptionEditor"
            >
              <input
                v-if="showCaptionEditor"
                ref="captionRef"
                v-model="caption"
                class="status-create__phone-caption-input"
                type="text"
                :placeholder="t('pages.statusCreatePage.captionPlaceholder')"
                :maxlength="feedStoryCaptionMaxLength"
                @blur="closeCaptionEditor"
              >
              <span v-else>{{ caption }}</span>
            </div>
          </div>
        </div>

        <div
          v-if="statusDescription"
          class="status-create__submit-status"
          :class="{ 'status-create__submit-status--error': submitStatus === 'error' }"
        >
          {{ statusDescription }}
        </div>
      </aside>
      <div class="status-create__privacy">
        <label for="story-privacy">{{ t("feed.publisherBox.audienceTitle") }}</label>
        <USelect id="story-privacy" v-model="privacy" :items="privacyOptions" value-key="value" label-key="label" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useStatusCreatePageVM } from "../../application/view-models/useStatusCreatePageVM"
import {
  feedHomePath,
  feedStoryAcceptedMimeTypes,
  feedStoryCaptionMaxLength,
} from "../../application/constants/story-carousel"

const { t, locale } = useI18n()

useSeoMeta({
  title: () => t("pages.statusCreatePage.seoTitle"),
  description: () => t("pages.statusCreatePage.seoDescription"),
})

const {
  fileInputRef,
  selectedFile,
  previewUrl,
  mediaType,
  caption,
  privacy,
  captionRef,
  phoneScreenRef,
  showCaptionEditor,
  captionPosition,
  submitting,
  submitStatus,
  statusDescription,
  currentUserName,
  currentUserAvatar,
  currentUserInitials,
  previewBarWidth,
  openPicker,
  handleFileSelection,
  removeFile,
  openCaptionEditor,
  startCaptionDrag,
  dragCaption,
  stopCaptionDrag,
  closeCaptionEditor,
  submitStory,
} = useStatusCreatePageVM()

const privacyOptions = computed(() => locale.value === "vi"
  ? [
      { value: "public", label: "Công khai" },
      { value: "friends", label: "Bạn bè" },
      { value: "followers", label: "Người theo dõi" },
      { value: "only_me", label: "Chỉ mình tôi" },
    ]
  : [
      { value: "public", label: "Public" },
      { value: "friends", label: "Friends" },
      { value: "followers", label: "Followers" },
      { value: "only_me", label: "Only me" },
    ])
</script>

<style scoped>
.status-create {
  max-width: 1100px;
  margin: 0 auto;
  padding: 10px 12px 18px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

@media (min-width: 640px) {
  .status-create {
    padding: 28px 24px 64px;
  }
}

.status-create__topbar {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.status-create__heading,
.status-create__back-label,
.status-create__preview-eyebrow {
  display: none;
}

@media (min-width: 640px) {
  .status-create__heading,
  .status-create__back-label,
  .status-create__preview-eyebrow {
    display: revert;
  }
}

.status-create__eyebrow {
  font-family: var(--font-primary);
  font-size: var(--text-label);
  font-weight: var(--weight-semibold);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-tertiary);
  margin: 0;
}

.status-create__title {
  font-family: var(--font-secondary);
  font-size: clamp(1.5rem, 3vw, 2rem);
  font-weight: var(--weight-extrabold);
  color: var(--text-primary);
  margin: 0;
}

.status-create__grid {
  display: flex;
  justify-content: center;
  gap: 10px;
  width: 100%;
}

@media (min-width: 900px) {
  .status-create__grid {
    align-items: start;
    gap: 24px;
  }
}

.status-create__submit-status {
  font-family: var(--font-primary);
  font-size: 11.5px;
  color: var(--text-tertiary);
  margin: 0;
}

.status-create__submit-status--error {
  color: #dc2626;
}

.status-create__spin {
  animation: status-create-spin 0.85s linear infinite;
}

@keyframes status-create-spin {
  to {
    transform: rotate(360deg);
  }
}

.status-create__preview-pane {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.status-create__preview-eyebrow {
  font-family: var(--font-primary);
  font-size: var(--text-label);
  font-weight: var(--weight-semibold);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-tertiary);
  margin: 0;
  align-self: flex-start;
}

.status-create__phone {
  width: min(330px, 85vw);
  border-radius: 30px;
  border: 5px solid #d7def0;
  background: #edf2ff;
  box-shadow: var(--shadow-lg), 0 0 0 1px rgba(0, 0, 255, 0.08);
  overflow: hidden;
}

@media (min-width: 900px) {
  .status-create__phone {
    width: 260px;
    border-radius: 36px;
    border-width: 6px;
  }
}

@media (max-height: 700px) and (max-width: 639.98px) {
  .status-create__phone {
    width: min(330px, 85vw);
  }
}

.status-create__phone-screen {
  position: relative;
  width: 100%;
  aspect-ratio: 9 / 16;
  overflow: hidden;
  border-radius: 25px;
  background: linear-gradient(180deg, #f8fbff 0%, #dfe8ff 100%);
}

@media (min-width: 900px) {
  .status-create__phone-screen {
    border-radius: 30px;
  }
}

.status-create__phone-media {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.status-create__preview-upload {
  position: absolute;
  inset: 50% auto auto 50%;
  transform: translate(-50%, -50%);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 86px;
  height: 86px;
  border: 1px solid rgba(255, 255, 255, 0.9);
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.88);
  color: var(--icon-brand);
  box-shadow: 0 16px 36px rgba(15, 23, 42, 0.14);
  cursor: pointer;
  z-index: 3;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.status-create__preview-upload:hover {
  transform: translate(-50%, -52%);
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.18);
}

.status-create__preview-actions {
  position: absolute;
  top: 58px;
  right: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 5;
}

.status-create__preview-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border: 1px solid rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.86);
  color: var(--text-primary);
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.14);
  cursor: pointer;
  backdrop-filter: blur(8px);
}

.status-create__preview-action--danger {
  color: #dc2626;
}

.status-create__preview-submit {
  position: absolute;
  right: 12px;
  bottom: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-width: 98px;
  height: 38px;
  border: 1px solid rgba(255, 255, 255, 0.9);
  border-radius: 14px;
  background: var(--bg-brand);
  color: #fff;
  box-shadow: 0 12px 26px rgba(15, 23, 42, 0.18);
  cursor: pointer;
  font-family: var(--font-primary);
  font-size: 12px;
  font-weight: 800;
  z-index: 5;
}

.status-create__preview-action:disabled,
.status-create__preview-submit:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.status-create__phone-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.22) 0%, transparent 28%, rgba(15, 23, 42, 0.16) 100%);
}

.status-create__phone-bars {
  position: absolute;
  top: 10px;
  left: 10px;
  right: 10px;
  display: flex;
  gap: 4px;
  z-index: 4;
}

.status-create__phone-bar {
  flex: 1;
  height: 3px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.62);
  overflow: hidden;
}

.status-create__phone-bar-fill {
  height: 100%;
  border-radius: 999px;
  background: var(--bg-brand);
  transition: width 0.3s ease;
}

.status-create__phone-bar--dim {
  background: rgba(255, 255, 255, 0.34);
}

.status-create__phone-author {
  position: absolute;
  top: 24px;
  left: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.74);
  backdrop-filter: blur(8px);
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08);
  z-index: 4;
}

.status-create__phone-avatar {
  display: flex;
  width: 36px;
  height: 36px;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  overflow: hidden;
  background: var(--bg-brand);
  border: 2px solid rgba(255, 255, 255, 0.9);
  font-size: 11px;
  font-weight: 700;
  color: #fff;
  flex-shrink: 0;
}

.status-create__phone-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.status-create__phone-name {
  font-size: 12px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.status-create__phone-time {
  font-size: 10px;
  color: var(--text-secondary);
  margin: 0;
}

.status-create__phone-caption {
  position: absolute;
  transform: translate(-50%, -50%);
  width: max-content;
  max-width: min(76%, 210px);
  border-radius: 14px;
  background: rgba(15, 23, 42, 0.64);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.28);
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.16);
  padding: 9px 11px;
  font-size: 13px;
  font-weight: 700;
  line-height: 1.35;
  color: #fff;
  z-index: 5;
  cursor: grab;
  touch-action: none;
  user-select: none;
  overflow-wrap: anywhere;
}

.status-create__phone-caption:active {
  cursor: grabbing;
}

.status-create__phone-caption-input {
  width: min(190px, 62vw);
  border: 0;
  background: transparent;
  color: #fff;
  font: inherit;
  outline: none;
}

.status-create__phone-caption-input::placeholder {
  color: rgba(255, 255, 255, 0.72);
}
</style>
