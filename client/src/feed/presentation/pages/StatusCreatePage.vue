<!-- Description: Responsive story creator aligned with the native-app selection and editing flow. -->
<template>
  <div class="story-create">
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
        @click="submitStory"
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

          <label class="story-create__field">
            <span>{{ t("pages.statusCreatePage.titleLabel") }}</span>
            <input
              v-model="title"
              type="text"
              :maxlength="feedStoryTitleMaxLength"
              :placeholder="t('pages.statusCreatePage.titlePlaceholder')"
            >
            <small>{{ title.length }}/{{ feedStoryTitleMaxLength }}</small>
          </label>

          <label class="story-create__field">
            <span>{{ t("pages.statusCreatePage.captionLabel") }}</span>
            <textarea
              v-model="caption"
              rows="5"
              :maxlength="feedStoryCaptionMaxLength"
              :placeholder="t('pages.statusCreatePage.descriptionPlaceholder')"
            />
            <small>{{ caption.length }}/{{ feedStoryCaptionMaxLength }}</small>
          </label>

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
import { useStatusCreatePageVM } from "../../application/view-models/useStatusCreatePageVM"
import {
  feedStoryCaptionMaxLength,
  feedStoryTitleMaxLength,
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
  margin: 0 auto;
  padding: 12px;
  color: #0f172a;
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
  border: 1px solid color-mix(in srgb, var(--bg-brand) 5%, transparent);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 2px 12px rgba(15, 23, 42, 0.04);
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
  background: #f1f5f9;
  color: #334155;
}

.story-create__close:hover {
  background: #e2e8f0;
  color: #0f172a;
}

.story-create__appbar-title {
  margin: 0;
  overflow: hidden;
  color: #0f172a;
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
  background: linear-gradient(180deg, var(--bg-brand-hover) 0%, var(--bg-brand) 100%);
  color: #fff;
  box-shadow: 0 4px 14px color-mix(in srgb, var(--bg-brand) 20%, transparent);
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
}

.story-create__publish:disabled {
  background: #eef2ff;
  color: #a5b4fc;
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
  box-shadow: 0 14px 30px color-mix(in srgb, var(--bg-brand) 10%, transparent);
}

.story-create__illustration-card--back {
  top: 5px;
  right: 18px;
  transform: rotate(13deg);
  border-color: #d8b4fe;
  background: #faf5ff;
  color: #9333ea;
}

.story-create__illustration-card--front {
  bottom: 0;
  left: 20px;
  transform: rotate(-8deg);
  border-color: var(--color-primary-200);
  background: var(--color-primary-50);
  color: var(--bg-brand);
}

.story-create__spark {
  position: absolute;
  z-index: 2;
  color: var(--color-primary-300);
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
  color: #0f172a;
  font-size: clamp(1.35rem, 4vw, 1.8rem);
  font-weight: 800;
  letter-spacing: -0.02em;
}

.story-create__intro p {
  margin: 8px 0 0;
  color: #64748b;
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
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 2px 12px rgba(15, 23, 42, 0.05);
  color: #0f172a;
  cursor: pointer;
  transition: all 0.15s ease;
}

.story-create__picker-card:hover {
  transform: translateY(-2px);
  border-color: color-mix(in srgb, var(--bg-brand) 14%, transparent);
  box-shadow: 0 10px 26px rgba(15, 23, 42, 0.08);
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
  background: var(--color-primary-50);
  color: var(--bg-brand);
}

.story-create__picker-icon--video,
.story-create__picker-arrow--video {
  background: #faf5ff;
  color: #9333ea;
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
  color: #94a3b8;
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
  border: 1px solid #eef2f7;
  border-radius: 16px;
  background: #fafbfe;
}

.story-create__notice-icon {
  width: 44px;
  height: 44px;
  background: var(--color-primary-50);
  color: var(--bg-brand);
}

.story-create__notice p {
  margin: 0;
  color: #475569;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.5;
}

.story-create__notice-arrow {
  color: #94a3b8;
}

.story-create__editor {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 16px;
}

.story-create__preview-column,
.story-create__settings {
  min-width: 0;
  border: 1px solid color-mix(in srgb, var(--bg-brand) 5%, transparent);
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 2px 12px rgba(15, 23, 42, 0.04);
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
  width: min(100%, 430px);
  aspect-ratio: 9 / 16;
  overflow: hidden;
  border-radius: 18px;
  background: radial-gradient(circle at 50% 38%, #172036 0%, #0f172a 48%, #020617 100%);
  box-shadow: 0 14px 36px rgba(15, 23, 42, 0.16);
}

.story-create__media {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: #020617;
}

.story-create__preview--image.story-create__preview--portrait .story-create__media {
  object-fit: cover;
}

.story-create__remove {
  position: absolute;
  z-index: 3;
  top: 14px;
  right: 14px;
  width: 42px;
  height: 42px;
  background: rgba(2, 6, 23, 0.78);
  color: #fff;
  backdrop-filter: blur(10px);
}

.story-create__remove:hover {
  background: #dc2626;
}

.story-create__change-media {
  display: inline-flex;
  min-height: 40px;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 9px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #fafbfe;
  color: #475569;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
}

.story-create__change-media:hover {
  border-color: color-mix(in srgb, var(--bg-brand) 15%, transparent);
  background: color-mix(in srgb, var(--bg-brand) 4%, transparent);
  color: var(--bg-brand);
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
  color: #334155;
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
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: #fff;
  color: #64748b;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
}

.story-create__audience-option:hover {
  background: color-mix(in srgb, var(--bg-brand) 3%, transparent);
  color: var(--bg-brand);
}

.story-create__audience-option--active {
  border-color: color-mix(in srgb, var(--bg-brand) 50%, transparent);
  background: color-mix(in srgb, var(--bg-brand) 5%, transparent);
  color: var(--bg-brand);
  box-shadow: 0 3px 10px color-mix(in srgb, var(--bg-brand) 8%, transparent);
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
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  outline: none;
  background: #fafbfe;
  color: #0f172a;
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
  border-color: color-mix(in srgb, var(--bg-brand) 28%, transparent);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--bg-brand) 5%, transparent);
}

.story-create__field input::placeholder,
.story-create__field textarea::placeholder {
  color: #94a3b8;
}

.story-create__field small {
  position: absolute;
  right: 10px;
  bottom: 9px;
  color: #94a3b8;
  font-size: 10px;
  font-weight: 600;
}

.story-create__status {
  margin: 0;
  padding: 10px 12px;
  border-radius: 10px;
  background: var(--color-primary-50);
  color: var(--bg-brand);
  font-size: 12px;
  font-weight: 600;
}

.story-create__status--error {
  background: #fef2f2;
  color: #dc2626;
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
  .story-create {
    padding: 22px 24px 52px;
  }

  .story-create__appbar {
    min-height: 68px;
    padding: 10px 12px;
  }

  .story-create__empty {
    padding-top: 34px;
  }

  .story-create__picker-card {
    min-height: 190px;
  }

  .story-create__preview-column,
  .story-create__settings {
    padding: 20px;
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
    width: min(100%, 405px);
  }
}

@media (max-width: 479px) {
  .story-create {
    padding: 0 8px 32px;
  }

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
