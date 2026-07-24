<!-- Description: Renders the feed publisher box with backend post creation and current-user session data instead of local mock submission. -->
<template>
  <section class="publisher">
    <input
      ref="imageInputRef"
      class="publisher__file-input"
      type="file"
      accept="image/png,image/jpeg,image/gif"
      multiple
      @change="selectImageFile"
    >
    <input
      ref="videoInputRef"
      class="publisher__file-input"
      type="file"
      accept="video/mp4,video/webm,video/ogg,video/quicktime,video/x-m4v"
      @change="selectVideoFile"
    >

    <div v-if="!expanded" class="publisher__compact" @click="openComposer">
      <NuxtLink
        v-if="currentUserProfilePath"
        :to="currentUserProfilePath"
        class="publisher__compact-avatar publisher__avatar-link"
        :aria-label="currentUserName"
        @click.stop
      >
        <img v-if="currentUserAvatar" :src="currentUserAvatar" :alt="currentUserName" class="publisher__avatar-image">
        <span v-else>{{ currentUserInitials }}</span>
      </NuxtLink>
      <div v-else class="publisher__compact-avatar">
        <img v-if="currentUserAvatar" :src="currentUserAvatar" :alt="currentUserName" class="publisher__avatar-image">
        <span v-else>{{ currentUserInitials }}</span>
      </div>
      <div
        class="publisher__compact-input"
        role="button"
        tabindex="0"
        @click.stop="openComposer"
        @keydown.enter.prevent="openComposer"
        @keydown.space.prevent="openComposer"
      >
        {{ t("feed.publisherBox.prompt") }}
      </div>
      <div class="publisher__compact-actions">
        <button
          v-for="action in compactActions"
          :key="action.icon"
          class="publisher__compact-btn"
          :title="action.label"
          type="button"
          @click.stop="handleCompactActionOverride(action.value)"
        >
          <Icon :name="action.icon" class="h-5 w-5" />
        </button>
      </div>
    </div>

    <div v-else class="publisher__expanded">
      <div class="publisher__head">
        <NuxtLink
          v-if="currentUserProfilePath"
          :to="currentUserProfilePath"
          class="publisher__avatar publisher__avatar-link"
          :aria-label="currentUserName"
        >
          <img v-if="currentUserAvatar" :src="currentUserAvatar" :alt="currentUserName" class="publisher__avatar-image">
          <span v-else>{{ currentUserInitials }}</span>
        </NuxtLink>
        <div v-else class="publisher__avatar">
          <img v-if="currentUserAvatar" :src="currentUserAvatar" :alt="currentUserName" class="publisher__avatar-image">
          <span v-else>{{ currentUserInitials }}</span>
        </div>
        <div class="publisher__meta">
          <p class="publisher__name">{{ currentUserName || t("feed.publisherBox.expandedOpen") }}</p>
          <div v-if="audiences.length" class="publisher__audience-dropdown">
            <button 
              type="button" 
              class="publisher__audience-btn"
              :disabled="draft.isAnonymous"
              @click.stop="toggleAudienceMenu"
            >
              <Icon :name="selectedAudienceInfo.icon" class="h-3.5 w-3.5 text-[var(--text-secondary)] mr-1" />
              <span>{{ selectedAudienceInfo.label }}</span>
              <Icon name="i-ph-caret-down-bold" class="h-2.5 w-2.5 text-[var(--text-tertiary)] ml-1.5" />
            </button>
            
            <div 
              v-if="showAudienceMenu && !draft.isAnonymous"
              class="publisher__audience-menu"
              @click.stop
            >
              <button
                v-for="opt in audiences"
                :key="opt.value"
                type="button"
                class="publisher__audience-item"
                :class="{ 'publisher__audience-item--active': opt.value === selectedAudience }"
                @click="selectAudienceOption(opt.value)"
              >
                <Icon :name="opt.icon" class="h-4 w-4 mr-2" />
                <span>{{ opt.label }}</span>
                <Icon 
                  v-if="opt.value === selectedAudience" 
                  name="i-ph-check-bold" 
                  class="h-3.5 w-3.5 ml-auto text-primary-500" 
                />
              </button>
            </div>
          </div>
          <!-- <label v-if="isPersonalComposer" class="publisher__anonymous-toggle">
            <UCheckbox v-model="draft.isAnonymous" />
            <span>{{ locale === "vi" ? "Đăng ẩn danh" : "Post anonymously" }}</span>
          </label> -->
        </div>
        <button class="publisher__close" type="button" @click="expanded = false">
          <Icon name="i-ph-x-bold" class="h-4 w-4" />
        </button>
      </div>

      <div v-if="statusMessage" class="publisher__status" :data-tone="statusTone">
        {{ statusMessage }}
      </div>

      <div v-if="!showProductForm" class="publisher__textarea-shell" :class="{ 'publisher__textarea-shell--colored': Boolean(activeColorOption) }" :style="activeColorOption ? { background: activeColorOption.bg, color: activeColorOption.text } : {}">
        <div class="publisher__textarea-highlight" aria-hidden="true">
          <template v-for="segment in highlightedDraftSegments" :key="segment.key">
            <span :class="{ 'publisher__textarea-mention': segment.isMention }">{{ segment.text }}</span>
          </template>
        </div>
        <textarea
          ref="textareaEl"
          v-model="draftText"
          class="publisher__textarea"
          :placeholder="t('feed.publisherBox.composerPlaceholder')"
          maxlength="280"
          spellcheck="false"
          autocomplete="off"
          autocapitalize="off"
          autocorrect="off"
          @input="handleInput"
          @click="updateMentionQuery"
          @keyup="handleTextareaKeyup"
          @keydown.esc.prevent="closeMentionSuggestions"
        />
      </div>

      <!-- Media Preview Grid -->
      <div v-if="!showProductForm && mediaPreviews.length > 0" class="publisher__media-previews">
        <div 
          v-for="(preview, idx) in mediaPreviews" 
          :key="preview.url"
          class="publisher__preview-box"
        >
          <img 
            v-if="preview.type === 'image'" 
            :src="preview.url" 
            :alt="preview.name"
            class="publisher__preview-content"
            draggable="false"
          >
          <video 
            v-else 
            :src="preview.url" 
            class="publisher__preview-content"
            controls
          />
          <button 
            type="button" 
            class="publisher__preview-remove-btn"
            @click="removeMediaItem(idx)"
          >
            <Icon name="i-ph-x-bold" class="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div v-if="showProductForm" class="publisher__product-form">
        <p class="publisher__product-title">
          <Icon name="i-ph-shopping-cart-bold" class="h-5 w-5 mr-1 text-orange-500" />
          {{ locale === "vi" ? "Đăng bán sản phẩm" : "List a Product for Sale" }}
        </p>
        <NewProductPage embedded @created="handleEmbeddedProductCreated" />
      </div>

      <div v-if="!showProductForm && showMentionSuggestions" class="publisher__mention-popover">
        <div v-if="mentionLoading" class="publisher__mention-state">
          <Icon name="i-lucide-loader-2" class="h-4 w-4 animate-spin" />
          <span>{{ t("feed.publisherBox.mentionLoading") }}</span>
        </div>
        <template v-else-if="mentionQuery.trim().length > 0">
          <button
            v-for="user in mentionSuggestions"
            :key="user.id"
            type="button"
            class="publisher__mention-option"
            @mousedown.prevent="selectMention(user)"
          >
            <span class="publisher__mention-avatar">
              <img v-if="user.avatarUrl" :src="user.avatarUrl" :alt="user.name">
              <span v-else>{{ user.initials }}</span>
            </span>
            <span class="publisher__mention-copy">
              <span class="publisher__mention-name">{{ user.name }}</span>
              <span class="publisher__mention-username">@{{ user.username }}</span>
            </span>
          </button>
        </template>
        <div v-if="!mentionLoading && mentionQuery.trim().length === 0" class="publisher__mention-state">
          {{ t("feed.publisherBox.mentionTypeToSearch") }}
        </div>
        <div v-else-if="!mentionLoading && mentionSuggestions.length === 0" class="publisher__mention-state">
          {{ t("feed.publisherBox.mentionEmpty") }}
        </div>
      </div>



      <div v-if="!showProductForm && (selectedMediaLabel || activeFeeling)" class="publisher__selection-row">
        <div v-if="selectedMediaLabel && mediaPreviews.length === 0" class="publisher__selection-pill">
          <Icon :name="selectedMediaType === 'video' ? 'i-ph-video-camera-bold' : 'i-ph-image-bold'" class="h-4 w-4" />
          <span>{{ selectedMediaLabel }}</span>
          <button type="button" class="publisher__selection-remove" @click="clearSelectedMedia">
            <Icon name="i-ph-x-bold" class="h-3.5 w-3.5" />
          </button>
        </div>

        <div v-if="activeFeeling" class="publisher__selection-pill">
          <span>{{ activeFeeling.emoji }}</span>
          <span>{{ feelingSelectedText }} {{ activeFeeling.label }}</span>
          <button type="button" class="publisher__selection-remove" @click="selectFeeling(activeFeeling.value)">
            <Icon name="i-ph-x-bold" class="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div v-if="!showProductForm" class="publisher__toolbar">
        <div class="publisher__actions">
          <button
            v-for="action in actions"
            :key="action.value"
            class="publisher__action-chip"
            :class="{
              'publisher__action-chip--active':
                (action.value === 'image' && selectedMediaType === 'image')
                || (action.value === 'video' && selectedMediaType === 'video')
                || (action.value === 'feeling' && Boolean(activeFeeling))
                || (action.value === 'poll' && showPollForm)
                || (action.value === 'colors' && showColorsPicker)
                || (action.value === 'product' && showProductForm),
            }"
            type="button"
            @click="handleActionOverride(action.value)"
          >
            <Icon :name="action.icon" class="h-4 w-4" />
            <span class="publisher__action-label">{{ action.label }}</span>
          </button>
        </div>

        <div class="publisher__submit-area">
          <span class="publisher__count" :class="{ 'publisher__count--warn': draft.text.length > 240 }">
            {{ draft.text.length }}/280
          </span>
          <UButton
            type="button"
            variant="outline"
            icon="i-ph-video-camera-bold"
              class="rounded-xl px-4 py-2 font-semibold !border-[var(--border-light)] !bg-[var(--bg-surface)] hover:!bg-[var(--bg-surface-hover)] !text-[var(--text-primary)] transition-all"
            @click="goToLive"
          >
            {{ locale === 'vi' ? 'Trực tiếp' : 'Go Live' }}
          </UButton>
          <UButton
            type="button"
            variant="solid"
            :loading="submitting"
            :disabled="!canPublish"
            icon="i-ph-paper-plane-tilt-bold"
            class="rounded-xl px-5 py-2 font-semibold !bg-[var(--bg-brand)] hover:!bg-[var(--bg-brand-hover)] !text-[var(--text-inverse)] shadow-[var(--shadow-brand)] transition-all"
            @click="publish"
          >
            {{ submitting ? t("feed.publisherBox.submitLoading") : t("feed.publisherBox.share") }}
          </UButton>
        </div>
      </div>

      <div v-if="showFeelingPicker" class="publisher__feeling-picker">
        <p class="publisher__feeling-title">{{ feelingPromptText }}</p>
        <button
          v-for="feeling in feelingOptions"
          :key="feeling.value"
          type="button"
          class="publisher__feeling-option"
          :class="{ 'publisher__feeling-option--active': activeFeeling?.value === feeling.value }"
          @click="selectFeeling(feeling.value)"
        >
          <span class="publisher__feeling-emoji">{{ feeling.emoji }}</span>
          <span>{{ feeling.label }}</span>
        </button>
      </div>

      <!-- Post background colors picker -->
      <div v-if="showColorsPicker" class="publisher__colors-picker">
        <button
          type="button"
          class="publisher__color-chip publisher__color-chip--none"
          :class="{ 'publisher__color-chip--active': selectedColorId === null }"
          @click="selectedColorId = null"
          :title="locale === 'vi' ? 'Không dùng màu nền' : 'No background'"
        >
          <Icon name="i-ph-prohibit-bold" class="h-4 w-4 text-[var(--text-secondary)]" />
        </button>
        <button
          v-for="colorOpt in postColorOptions"
          :key="colorOpt.id"
          type="button"
          class="publisher__color-chip"
          :class="{ 'publisher__color-chip--active': selectedColorId === colorOpt.id }"
          :style="{ background: colorOpt.bg }"
          @click="selectedColorId = colorOpt.id"
          :title="colorOpt.label"
        />
      </div>

      <div v-if="showPollForm" class="publisher__poll-form">
        <p class="publisher__poll-title">
          <Icon name="i-ph-list-checks-bold" class="h-4 w-4" />
          {{ t('feed.publisherBox.actionPoll') }}
        </p>
        <div class="publisher__poll-answers">
          <div
            v-for="(_, idx) in pollAnswers"
            :key="idx"
            class="publisher__poll-answer-row"
          >
            <input
              v-model="pollAnswers[idx]"
              class="publisher__poll-input"
              type="text"
              :placeholder="t('feed.publisherBox.pollAnswerPlaceholder', { n: idx + 1 })"
            >
            <button
              v-if="pollAnswers.length > 2"
              type="button"
              class="publisher__poll-remove"
              :title="t('feed.publisherBox.pollRemoveAnswer')"
              @click="removePollAnswer(idx)"
            >
              <Icon name="i-ph-x-bold" class="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
        <button
          v-if="pollAnswers.length < 10"
          type="button"
          class="publisher__poll-add"
          @click="addPollAnswer"
        >
          <Icon name="i-ph-plus-bold" class="h-3.5 w-3.5" />
          {{ t('feed.publisherBox.pollAddAnswer') }}
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useFeedMentionSearch } from "../../application/composables/useFeedMentionSearch"
import { useFeedPublisherBoxVM } from "../../application/view-models/useFeedPublisherBoxVM"
import type { FeedPostRecord } from "../../domain/types/feed.types"
import NewProductPage from "../../../product/presentation/pages/NewProductPage.vue"

const { t } = useI18n()
const { locale } = useI18n()
const props = defineProps<{
  pageId?: number
  eventId?: number
  groupId?: number
}>()
const emit = defineEmits<{
  created: [post: FeedPostRecord | null]
}>()

const imageInputRef = ref<HTMLInputElement | null>(null)
const videoInputRef = ref<HTMLInputElement | null>(null)

const {
  textareaEl,
  expanded,
  draft,
  submitting,
  statusMessage,
  statusTone,
  currentUserName,
  currentUserAvatar,
  currentUserProfilePath,
  currentUserInitials,
  compactActions,
  actions,
  audiences,
  isPersonalComposer,
  feelingOptions,
  activeFeeling,
  selectedMediaLabel,
  selectedMediaType,
  showFeelingPicker,
  showPollForm,
  pollAnswers,
  canPublish,
  handleCompactAction,
  handleAction,
  selectImageFile,
  selectVideoFile,
  clearSelectedMedia,
  selectFeeling,
  addPollAnswer,
  removePollAnswer,
  publish: publishPost,
  selectedColorId,
  showColorsPicker,
  postColorOptions,
  showProductForm,
  imageFiles,
  videoFile,
} = useFeedPublisherBoxVM((event, post) => emit(event, post), props.pageId, props.eventId, props.groupId)

const mediaPreviews = ref<{ url: string; type: "image" | "video"; name: string }[]>([])

watch([imageFiles, videoFile], () => {
  mediaPreviews.value.forEach(p => {
    if (p.url.startsWith("blob:")) {
      URL.revokeObjectURL(p.url)
    }
  })
  mediaPreviews.value = []

  if (selectedMediaType.value === "image") {
    imageFiles.value.forEach(file => {
      mediaPreviews.value.push({
        url: URL.createObjectURL(file),
        type: "image",
        name: file.name,
      })
    })
  } else if (selectedMediaType.value === "video" && videoFile.value) {
    mediaPreviews.value.push({
      url: URL.createObjectURL(videoFile.value),
      type: "video",
      name: videoFile.value.name,
    })
  }
}, { deep: true })

onBeforeUnmount(() => {
  mediaPreviews.value.forEach(p => {
    if (p.url.startsWith("blob:")) {
      URL.revokeObjectURL(p.url)
    }
  })
})

function removeMediaItem(index: number) {
  if (selectedMediaType.value === "image") {
    const updated = [...imageFiles.value]
    updated.splice(index, 1)
    imageFiles.value = updated
    if (updated.length === 0) {
      clearSelectedMedia()
    }
  } else {
    clearSelectedMedia()
  }
}

const activeColorOption = computed(() => {
  if (selectedColorId.value === null) return null
  return postColorOptions.value.find(opt => opt.id === selectedColorId.value) || null
})

const draftText = computed({
  get: () => draft.value?.text || "",
  set: (value: string) => {
    if (draft.value) {
      draft.value.text = value
    }
  },
})

const selectedAudience = computed({
  get: () => draft.value?.audience || "0",
  set: (value: any) => {
    if (draft.value) {
      draft.value.audience = value
    }
  },
})

const selectedAudienceInfo = computed(() => {
  const currentVal = selectedAudience.value
  const opt = audiences.value.find(o => o.value === currentVal)
  if (opt) return opt
  return { value: "0", label: locale.value === "vi" ? "Công khai" : "Public", icon: "i-ph-globe-bold" }
})

const showAudienceMenu = ref(false)

function toggleAudienceMenu() {
  if (draft.value?.isAnonymous) return
  showAudienceMenu.value = !showAudienceMenu.value
}

function selectAudienceOption(val: any) {
  if (draft.value?.isAnonymous) return
  selectedAudience.value = val
  showAudienceMenu.value = false
}

function closeAudienceMenu() {
  showAudienceMenu.value = false
}

onMounted(() => {
  if (typeof window !== "undefined") {
    window.addEventListener("click", closeAudienceMenu)
  }
})

onBeforeUnmount(() => {
  if (typeof window !== "undefined") {
    window.removeEventListener("click", closeAudienceMenu)
  }
})

const {
  mentionQuery,
  mentionLoading,
  mentionSuggestions,
  showMentionSuggestions,
  highlightedMentionSegments: highlightedDraftSegments,
  updateMentionQuery,
  handleMentionKeyup: handleTextareaKeyup,
  closeMentionSuggestions,
  selectMention,
  clearSelectedMentions,
} = useFeedMentionSearch({
  text: draftText,
  textarea: textareaEl,
  active: expanded,
})

async function publish() {
  await publishPost()

  if (!draft.value?.text) {
    clearSelectedMentions()
  }
}

function handleEmbeddedProductCreated() {
  showProductForm.value = false
  expanded.value = false
  emit("created", null)
}

function resizeTextarea() {
  if (textareaEl.value) {
    textareaEl.value.style.height = "auto"
    textareaEl.value.style.height = `${textareaEl.value.scrollHeight}px`
  }
}

function handleInput(e: Event) {
  updateMentionQuery(e)
  resizeTextarea()
}

function handleActionOverride(value: any) {
  console.log("[FeedPublisherBox] handleActionOverride triggered for value:", value)
  try {
    if (value === "image") {
      showFeelingPicker.value = false
      showPollForm.value = false
      showColorsPicker.value = false
      showProductForm.value = false
      console.log("[FeedPublisherBox] Clicking imageInputRef:", imageInputRef.value)
      imageInputRef.value?.click()
      expanded.value = true
      return
    }

    if (value === "video") {
      showFeelingPicker.value = false
      showPollForm.value = false
      showColorsPicker.value = false
      showProductForm.value = false
      console.log("[FeedPublisherBox] Clicking videoInputRef:", videoInputRef.value)
      videoInputRef.value?.click()
      expanded.value = true
      return
    }

    console.log("[FeedPublisherBox] Calling standard handleAction for:", value)
    handleAction(value)
  } catch (error) {
    console.error("[FeedPublisherBox] Error in handleActionOverride:", error)
  }
}

function handleCompactActionOverride(value: any) {
  console.log("[FeedPublisherBox] handleCompactActionOverride triggered for value:", value)
  try {
    if (value === "image") {
      showFeelingPicker.value = false
      showPollForm.value = false
      showColorsPicker.value = false
      showProductForm.value = false
      console.log("[FeedPublisherBox] Clicking compact imageInputRef:", imageInputRef.value)
      imageInputRef.value?.click()
      expanded.value = true
      return
    }

    if (value === "video") {
      showFeelingPicker.value = false
      showPollForm.value = false
      showColorsPicker.value = false
      showProductForm.value = false
      console.log("[FeedPublisherBox] Clicking compact videoInputRef:", videoInputRef.value)
      videoInputRef.value?.click()
      expanded.value = true
      return
    }

    console.log("[FeedPublisherBox] Calling standard handleCompactAction for:", value)
    handleCompactAction(value)
  } catch (error) {
    console.error("[FeedPublisherBox] Error in handleCompactActionOverride:", error)
  }
}

async function openComposer() {
  console.log("[FeedPublisherBox] openComposer triggered! Resetting forms. showProductForm was:", showProductForm.value)
  showProductForm.value = false
  showFeelingPicker.value = false
  showPollForm.value = false
  showColorsPicker.value = false
  expanded.value = true
  await nextTick()
  resizeTextarea()
  textareaEl.value?.focus()
}


const feelingPromptText = computed(() =>
  locale.value === "vi" ? "Bạn đang cảm thấy gì?" : "What are you feeling?",
)

const feelingSelectedText = computed(() =>
  locale.value === "vi" ? "Đang cảm thấy" : "Feeling",
)

function goToLive() {
  navigateTo("/live")
}
</script>

<style scoped>
.publisher__compact {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 16px;
  background: var(--bg-surface);
  border: 1px solid color-mix(in srgb, var(--bg-brand) 6%, transparent);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04), 0 4px 16px color-mix(in srgb, var(--bg-brand) 3%, transparent);
  cursor: pointer;
  pointer-events: auto;
  user-select: none;
  transition: box-shadow 0.2s ease, border-color 0.2s ease;
}

.publisher__compact:hover {
  border-color: color-mix(in srgb, var(--bg-brand) 12%, transparent);
  box-shadow: 0 2px 8px color-mix(in srgb, var(--bg-brand) 6%, transparent);
}

.publisher__compact-avatar,
.publisher__avatar {
  display: flex;
  width: 38px;
  height: 38px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 50%;
  background: linear-gradient(145deg, var(--bg-brand-hover) 0%, var(--bg-brand) 100%);
  color: #ffffff;
  font-size: 12px;
  font-weight: 800;
  box-shadow: 0 4px 12px color-mix(in srgb, var(--bg-brand) 18%, transparent);
}

.publisher__avatar-link {
  cursor: pointer;
  text-decoration: none;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.publisher__avatar-link:hover {
  transform: translateY(-1px);
}

.publisher__avatar-link:focus-visible {
  outline: 2px solid var(--color-primary-500, var(--bg-brand));
  outline-offset: 2px;
}

.publisher__avatar {
  width: 42px;
  height: 42px;
  font-size: 13px;
  box-shadow: 0 6px 18px color-mix(in srgb, var(--bg-brand) 16%, transparent);
}

.publisher__avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.publisher__compact-input {
  position: relative;
  z-index: 2;
  flex: 1;
  min-width: 0;
  min-height: 38px;
  display: flex;
  align-items: center;
  padding: 8px 14px;
  border-radius: 999px;
  background: var(--bg-muted);
  font-size: 14px;
  color: var(--text-tertiary);
  font-weight: 500;
  cursor: text;
  pointer-events: auto;
}

.publisher__compact-actions {
  position: relative;
  z-index: 3;
  display: flex;
  gap: 2px;
}

.publisher__compact-btn {
  position: relative;
  z-index: 3;
  display: flex;
  width: 40px;
  height: 40px;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: 2px solid color-mix(in srgb, var(--bg-brand) 8%, transparent);
  background: color-mix(in srgb, var(--bg-brand) 3%, transparent);
  color: var(--text-primary);
  cursor: pointer;
  pointer-events: auto;
  user-select: none;
  transition: all 0.15s ease;
}

.publisher__compact-btn:hover {
  border-color: color-mix(in srgb, var(--bg-brand) 20%, transparent);
  background: color-mix(in srgb, var(--bg-brand) 6%, transparent);
  color: var(--bg-brand);
}

@media (max-width: 639px) {
  .publisher__compact {
    display: flex;
    flex-direction: column;
    gap: 0;
    padding: 0;
    border-radius: 16px;
  }

  .publisher__compact-avatar {
    width: 36px;
    height: 36px;
    margin: 0;
    flex-shrink: 0;
    box-shadow: 0 2px 8px color-mix(in srgb, var(--bg-brand) 12%, transparent);
  }

  .publisher__compact-input {
    flex: 1;
    min-width: 0;
    min-height: auto;
    padding: 0;
    border-radius: 0;
    background: transparent;
    font-size: 13.5px;
    line-height: 1.3;
    color: var(--text-tertiary);
  }

  /* Wrap avatar + input into an inline row via the compact's flex-direction override */
  .publisher__compact {
    display: flex;
    flex-direction: column;
  }

  /* The first visual row (avatar + input) gets created by the existing DOM order
     but we need to override flex-direction for the top portion.
     Since we can't wrap in pure CSS, use a different approach:
     Keep column, but make avatar + input appear as a row using the natural flow. */
  .publisher__compact {
    display: grid;
    grid-template-columns: 36px 1fr;
    grid-template-rows: auto auto;
    align-items: center;
    gap: 0;
    padding: 10px 12px 0 12px;
    border-radius: 16px;
  }

  .publisher__compact-avatar {
    grid-column: 1;
    grid-row: 1;
  }

  .publisher__compact-input {
    grid-column: 2;
    grid-row: 1;
    padding: 8px 10px;
    min-height: 36px;
  }

  .publisher__compact-actions {
    grid-column: 1 / -1;
    grid-row: 2;
    display: flex !important;
    justify-content: space-around;
    align-items: center;
    width: calc(100% + 24px);
    margin: 10px -12px 0;
    padding: 6px 12px;
    background: var(--bg-muted);
    border-top: 1px solid #f0f2f5;
    gap: 0;
  }

  .publisher__compact-btn {
    width: 36px;
    height: 36px;
    border: none;
    background: transparent;
    color: var(--text-secondary);
    border-radius: 10px;
  }

  .publisher__compact-btn:hover {
    background: color-mix(in srgb, var(--bg-brand) 6%, transparent);
    color: var(--bg-brand);
    border: none;
  }
}

@media (max-width: 380px) {
  .publisher__compact-avatar {
    width: 32px;
    height: 32px;
    left: 10px;
    top: 11px;
  }

  .publisher__compact-input {
    padding: 11px 12px 11px 50px;
    min-height: 40px;
    font-size: 13px;
  }

  .publisher__compact-btn {
    width: 34px;
    height: 34px;
  }
}

.publisher__expanded {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 18px;
  border-radius: 16px;
  background: var(--bg-surface);
  border: 1px solid color-mix(in srgb, var(--bg-brand) 8%, transparent);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04), 0 8px 28px color-mix(in srgb, var(--bg-brand) 5%, transparent);
  animation: publisher-in 0.2s ease;
}

@keyframes publisher-in {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}

.publisher__head {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.publisher__meta {
  flex: 1;
  min-width: 0;
}

.publisher__name {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
}

.publisher__close {
  display: flex;
  width: 32px;
  height: 32px;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.12s ease;
}

.publisher__close:hover {
  background: var(--bg-muted);
  color: var(--text-secondary);
}

.publisher__status {
  border-radius: 12px;
  padding: 10px 14px;
  font-size: 13px;
  line-height: 1.5;
}

.publisher__status[data-tone="neutral"] {
  background: var(--bg-muted);
  color: var(--text-secondary);
}

.publisher__status[data-tone="success"] {
  background: #ecfdf5;
  color: #16a34a;
}

.publisher__status[data-tone="warning"] {
  background: #fffbeb;
  color: #d97706;
}

.publisher__textarea-shell {
  position: relative;
  border-radius: 14px;
  background: var(--bg-muted);
}

.publisher__textarea-highlight,
.publisher__textarea {
  width: 100%;
  min-height: 96px;
  padding: 14px 16px;
  font-size: 14.5px;
  line-height: 1.7;
  font-family: inherit;
  white-space: pre-wrap;
  word-break: break-word;
}

.publisher__textarea-highlight {
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
  overflow: hidden;
  border: 1px solid transparent;
  border-radius: 14px;
  color: transparent;
}

.publisher__textarea-mention {
  color: var(--bg-brand);
}

.publisher__textarea {
  position: relative;
  z-index: 1;
  resize: none;
  border-radius: 14px;
  border: 1px solid var(--border-default);
  background: transparent;
  color: var(--text-primary);
  caret-color: var(--text-primary);
  outline: none;
  text-decoration: none;
  transition: border-color 0.15s ease, height 0.1s ease;
  overflow-y: hidden;
}

.publisher__textarea::spelling-error,
.publisher__textarea::grammar-error {
  text-decoration: none;
}

.publisher__textarea:focus {
  border-color: color-mix(in srgb, var(--bg-brand) 20%, transparent);
}

.publisher__textarea::placeholder {
  color: var(--text-tertiary);
}

.publisher__mention-popover {
  margin-top: -6px;
  overflow: hidden;
  border: 1px solid var(--border-default);
  border-radius: 14px;
  background: var(--bg-surface);
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.12);
}

.publisher__mention-option,
.publisher__mention-state {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 10px;
  border: 0;
  background: var(--bg-surface);
  padding: 10px 12px;
  text-align: left;
}

.publisher__mention-option {
  cursor: pointer;
  transition: background 0.12s ease;
}

.publisher__mention-option:hover {
  background: color-mix(in srgb, var(--bg-brand) 5%, transparent);
}

.publisher__mention-state {
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 600;
}

.publisher__mention-avatar {
  display: inline-flex;
  width: 34px;
  height: 34px;
  flex: 0 0 34px;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 50%;
  background: var(--bg-brand);
  color: #ffffff;
  font-size: 12px;
  font-weight: 800;
}

.publisher__mention-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.publisher__mention-copy {
  display: flex;
  min-width: 0;
  flex-direction: column;
}

.publisher__mention-name {
  overflow: hidden;
  color: var(--text-primary);
  font-size: 13px;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.publisher__mention-username {
  overflow: hidden;
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.publisher__file-input {
  display: none;
}

.publisher__selection-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.publisher__selection-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border-radius: 999px;
  border: 1px solid var(--color-primary-100);
  background: var(--color-primary-50);
  padding: 6px 12px;
  color: var(--color-primary-900);
  font-size: 12px;
  font-weight: 700;
}

.publisher__selection-remove {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0;
}

.publisher__toolbar {
  display: flex;
  flex-direction: column;
  gap: 12px;
  border-top: 1px solid var(--border-light);
  padding-top: 12px;
}

@media (min-width: 640px) {
  .publisher__toolbar {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}

.publisher__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.publisher__action-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 12px;
  border-radius: 10px;
  border: none;
  background: transparent;
  font-size: 12.5px;
  font-weight: 600;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.15s ease;
}

.publisher__action-chip:hover {
  background: color-mix(in srgb, var(--bg-brand) 4%, transparent);
  color: var(--bg-brand);
}

.publisher__action-chip--active {
  background: color-mix(in srgb, var(--bg-brand) 6%, transparent);
  color: var(--bg-brand);
}

.publisher__feeling-picker {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(118px, 1fr));
  gap: 8px;
  padding: 10px 0 2px;
}

.publisher__feeling-title {
  grid-column: 1 / -1;
  margin: 0 0 2px;
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 700;
}

.publisher__feeling-option {
  display: flex;
  min-width: 0;
  min-height: 40px;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
  border: 1px solid var(--border-default);
  border-radius: 12px;
  background: var(--bg-surface);
  padding: 8px 10px;
  color: var(--text-primary);
  font-size: 13px;
  font-weight: 700;
  text-align: left;
  cursor: pointer;
  transition: all 0.15s ease;
}

.publisher__feeling-emoji {
  display: inline-flex;
  width: 24px;
  height: 24px;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: var(--bg-muted);
  font-size: 16px;
  line-height: 1;
}

.publisher__feeling-option--active,
.publisher__feeling-option:hover {
  border-color: color-mix(in srgb, var(--bg-brand) 20%, transparent);
  background: color-mix(in srgb, var(--bg-brand) 5%, transparent);
  color: var(--bg-brand);
}

.publisher__action-label {
  display: none;
}

@media (min-width: 480px) {
  .publisher__action-label {
    display: inline;
  }
}

.publisher__submit-area {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: auto;
}

.publisher__count {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-tertiary);
  transition: color 0.15s ease;
}

.publisher__count--warn {
  color: #dc2626;
}

/* Submit button and live button styling removed, handled via UButton */

/* Poll form */
.publisher__poll-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px 0 2px;
  border-top: 1px solid var(--border-light);
  animation: publisher-in 0.18s ease;
}

.publisher__poll-title {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0 0 4px;
  color: #31a38c;
  font-size: 13px;
  font-weight: 700;
}

.publisher__poll-answers {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.publisher__poll-answer-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.publisher__poll-input {
  flex: 1;
  height: 40px;
  padding: 8px 12px;
  border: 1px solid var(--border-default);
  border-radius: 10px;
  background: var(--bg-muted);
  font-size: 13.5px;
  color: var(--text-primary);
  outline: none;
  font-family: inherit;
  transition: border-color 0.15s ease;
}

.publisher__poll-input:focus {
  border-color: color-mix(in srgb, var(--bg-brand) 20%, transparent);
}

.publisher__poll-input::placeholder {
  color: var(--text-tertiary);
}

.publisher__poll-remove {
  display: inline-flex;
  width: 30px;
  height: 30px;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border-default);
  border-radius: 50%;
  background: transparent;
  color: var(--text-tertiary);
  cursor: pointer;
  transition: all 0.12s ease;
  flex-shrink: 0;
}

.publisher__poll-remove:hover {
  background: #fee2e2;
  border-color: #fca5a5;
  color: #dc2626;
}

.publisher__poll-add {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  width: fit-content;
  padding: 7px 14px;
  border: 1.5px dashed rgba(49, 163, 140, 0.4);
  border-radius: 10px;
  background: rgba(49, 163, 140, 0.04);
  color: #31a38c;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;
}

.publisher__poll-add:hover {
  background: rgba(49, 163, 140, 0.1);
  border-color: rgba(49, 163, 140, 0.6);
}

/* Post Colors Picker */
.publisher__colors-picker {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  padding: 14px 16px;
  background: var(--bg-muted);
  border-radius: 12px;
  border: 1px dashed color-mix(in srgb, var(--bg-brand) 8%, transparent);
  animation: publisher-in 0.18s ease;
}

.publisher__color-chip {
  position: relative;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid #ffffff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.05);
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}

.publisher__color-chip:hover {
  transform: scale(1.15);
  box-shadow: 0 4px 8px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.08);
}

.publisher__color-chip--active {
  transform: scale(1.1);
  box-shadow: 0 0 0 2.5px var(--bg-brand), 0 3px 6px rgba(0,0,0,0.15);
}

.publisher__color-chip--none {
  background: var(--bg-surface);
  color: var(--text-secondary);
  border: 1px solid #cbd5e1;
}

.publisher__color-chip--none.publisher__color-chip--active {
  border-color: var(--bg-brand);
}

/* Colored Composer Preview */
.publisher__textarea-shell--colored {
  position: relative;
  border-radius: 12px;
  padding: 24px !important;
  min-height: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.06);
  transition: background 0.3s ease;
}

.publisher__textarea-shell--colored .publisher__textarea {
  background: transparent !important;
  color: inherit !important;
  font-size: 20px !important;
  font-weight: 700 !important;
  text-align: center !important;
  min-height: 100px !important;
  line-height: 1.5 !important;
  padding: 0 !important;
  caret-color: currentColor;
}

.publisher__textarea-shell--colored .publisher__textarea::placeholder {
  color: rgba(255, 255, 255, 0.8) !important;
}

.publisher__textarea-shell--colored .publisher__textarea-highlight {
  display: none !important;
}

/* Product Form */
.publisher__product-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 16px;
  border-radius: 14px;
  background: var(--bg-muted);
  border: 1px solid color-mix(in srgb, var(--bg-brand) 5%, transparent);
  animation: publisher-in 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.publisher__product-title {
  display: flex;
  align-items: center;
  font-size: 15px;
  font-weight: 800;
  color: var(--text-primary);
  border-bottom: 1px solid var(--border-default);
  padding-bottom: 8px;
  margin: 0;
}

.publisher__media-previews {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 10px;
  padding: 0 4px;
}

.publisher__preview-box {
  position: relative;
  width: 100%;
  max-height: 380px;
  aspect-ratio: 16 / 9;
  border-radius: 14px;
  background: #0f172a;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--bg-brand) 8%, transparent);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.publisher__preview-content {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.publisher__preview-remove-btn {
  position: absolute;
  top: 6px;
  right: 6px;
  display: flex;
  width: 24px;
  height: 24px;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: none;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  color: #ffffff;
  cursor: pointer;
  transition: background 0.15s ease, transform 0.15s ease;
  z-index: 5;
}

.publisher__preview-remove-btn:hover {
  background: rgba(15, 23, 42, 0.85);
  transform: scale(1.05);
}

.publisher__audience-dropdown {
  position: relative;
  display: inline-block;
  margin-top: 4px;
}

.publisher__audience-btn {
  display: inline-flex;
  align-items: center;
  background: var(--bg-muted);
  border: 1px solid var(--border-default);
  border-radius: 6px;
  padding: 3px 8px 3px 6px;
  cursor: pointer;
  outline: none;
  font-family: inherit;
  font-size: 11px;
  font-weight: 700;
  color: var(--text-secondary);
  transition: all 0.15s ease;
  line-height: 1.2;
}

.publisher__audience-btn:hover {
  background: var(--bg-surface-hover);
  border-color: var(--border-strong);
}

.publisher__audience-btn:disabled {
  cursor: not-allowed;
  opacity: 0.65;
}

.publisher__audience-menu {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  z-index: 150;
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(15, 23, 42, 0.15);
  padding: 6px;
  min-width: 220px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  animation: publisher-in 0.15s cubic-bezier(0.16, 1, 0.3, 1);
}

.publisher__audience-item {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 8px 10px;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-primary);
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  text-align: left;
  transition: all 0.1s ease;
}

.publisher__audience-item:hover {
  background: var(--bg-muted);
  color: var(--text-primary);
}

.publisher__audience-item--active {
  background: #e0f2fe;
  color: #0369a1;
}

.publisher__audience-caret {
  position: absolute;
  right: 6px;
  top: 50%;
  transform: translateY(-50%);
  width: 10px;
  height: 10px;
  color: var(--text-secondary);
  pointer-events: none;
}
</style>
