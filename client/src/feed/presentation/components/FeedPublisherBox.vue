<!-- Description: Renders the feed publisher box with backend post creation and current-user session data instead of local mock submission. -->
<template>
  <section class="publisher">
    <div v-if="!expanded" class="publisher__compact" @click="expanded = true">
      <div class="publisher__compact-avatar">
        <img v-if="currentUserAvatar" :src="currentUserAvatar" :alt="currentUserName" class="publisher__avatar-image">
        <span v-else>{{ currentUserInitials }}</span>
      </div>
      <div class="publisher__compact-input" role="button" tabindex="0">
        {{ t("feed.publisherBox.prompt") }}
      </div>
      <div class="publisher__compact-actions">
        <button
          v-for="action in compactActions"
          :key="action.icon"
          class="publisher__compact-btn"
          :title="action.label"
          type="button"
          @click.stop="handleCompactAction(action.value)"
        >
          <Icon :name="action.icon" class="h-5 w-5" />
        </button>
      </div>
    </div>

    <div v-else class="publisher__expanded">
      <div class="publisher__head">
        <div class="publisher__avatar">
          <img v-if="currentUserAvatar" :src="currentUserAvatar" :alt="currentUserName" class="publisher__avatar-image">
          <span v-else>{{ currentUserInitials }}</span>
        </div>
        <div class="publisher__meta">
          <p class="publisher__name">{{ currentUserName || t("feed.publisherBox.expandedOpen") }}</p>
        </div>
        <button class="publisher__close" type="button" @click="expanded = false">
          <Icon name="i-ph-x-bold" class="h-4 w-4" />
        </button>
      </div>

      <div v-if="statusMessage" class="publisher__status" :data-tone="statusTone">
        {{ statusMessage }}
      </div>

      <div class="publisher__textarea-shell">
        <div class="publisher__textarea-highlight" aria-hidden="true">
          <template v-for="segment in highlightedDraftSegments" :key="segment.key">
            <span :class="{ 'publisher__textarea-mention': segment.isMention }">{{ segment.text }}</span>
          </template>
        </div>
        <textarea
          ref="textareaEl"
          v-model="draft.text"
          class="publisher__textarea"
          :placeholder="t('feed.publisherBox.composerPlaceholder')"
          maxlength="280"
          spellcheck="false"
          autocomplete="off"
          autocapitalize="off"
          autocorrect="off"
          @input="updateMentionQuery"
          @click="updateMentionQuery"
          @keyup="handleTextareaKeyup"
          @keydown.esc.prevent="closeMentionSuggestions"
        />
      </div>

      <div v-if="showMentionSuggestions" class="publisher__mention-popover">
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

      <input
        ref="imageInputRef"
        class="publisher__file-input"
        type="file"
        accept="image/png,image/jpeg,image/gif"
        @change="selectImageFile"
      >
      <input
        ref="videoInputRef"
        class="publisher__file-input"
        type="file"
        accept="video/mp4,video/webm,video/ogg,video/quicktime,video/x-m4v"
        @change="selectVideoFile"
      >

      <div v-if="selectedMediaLabel || activeFeeling" class="publisher__selection-row">
        <div v-if="selectedMediaLabel" class="publisher__selection-pill">
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

      <div class="publisher__toolbar">
        <div class="publisher__actions">
          <button
            v-for="action in actions"
            :key="action.value"
            class="publisher__action-chip"
            :class="{
              'publisher__action-chip--active':
                (action.value === 'image' && selectedMediaType === 'image')
                || (action.value === 'video' && selectedMediaType === 'video')
                || (action.value === 'feeling' && Boolean(activeFeeling)),
            }"
            type="button"
            @click="handleAction(action.value)"
          >
            <Icon :name="action.icon" class="h-4 w-4" />
            <span class="publisher__action-label">{{ action.label }}</span>
          </button>
        </div>

        <div class="publisher__submit-area">
          <span class="publisher__count" :class="{ 'publisher__count--warn': draft.text.length > 240 }">
            {{ draft.text.length }}/280
          </span>
          <button class="publisher__submit-btn" type="button" :disabled="submitting || !canPublish" @click="publish">
            <Icon v-if="submitting" name="i-lucide-loader-2" class="h-4 w-4 animate-spin" />
            <Icon v-else name="i-ph-paper-plane-tilt-fill" class="h-4 w-4" />
            {{ submitting ? t("feed.publisherBox.submitLoading") : t("feed.publisherBox.share") }}
          </button>
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
    </div>
  </section>
</template>

<script setup lang="ts">
import { useFeedMentionSearch } from "../../application/composables/useFeedMentionSearch"
import { useFeedPublisherBoxVM } from "../../application/view-models/useFeedPublisherBoxVM"
import type { FeedPostRecord } from "../../domain/types/feed.types"

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

// textarea auto-size via @vueuse/core — input synced to draft.text watcher
const {
  textareaEl,
  expanded,
  draft,
  submitting,
  statusMessage,
  statusTone,
  currentUserName,
  currentUserAvatar,
  currentUserInitials,
  compactActions,
  actions,
  feelingOptions,
  activeFeeling,
  selectedMediaLabel,
  selectedMediaType,
  showFeelingPicker,
  canPublish,
  handleCompactAction,
  handleAction,
  imageInputRef,
  videoInputRef,
  selectImageFile,
  selectVideoFile,
  clearSelectedMedia,
  selectFeeling,
  publish: publishPost,
} = useFeedPublisherBoxVM((event, post) => emit(event, post), props.pageId, props.eventId, props.groupId)

const draftText = computed({
  get: () => draft.value.text,
  set: (value: string) => {
    draft.value.text = value
  },
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

  if (!draft.value.text) {
    clearSelectedMentions()
  }
}


const feelingPromptText = computed(() =>
  locale.value === "vi" ? "Bạn đang cảm thấy gì?" : "What are you feeling?",
)

const feelingSelectedText = computed(() =>
  locale.value === "vi" ? "Đang cảm thấy" : "Feeling",
)
</script>

<style scoped>
.publisher__compact {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 16px;
  background: #ffffff;
  border: 1px solid rgba(0, 0, 255, 0.06);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04), 0 4px 16px rgba(0, 0, 255, 0.03);
  cursor: pointer;
  transition: box-shadow 0.2s ease, border-color 0.2s ease;
}

.publisher__compact:hover {
  border-color: rgba(0, 0, 255, 0.12);
  box-shadow: 0 2px 8px rgba(0, 0, 255, 0.06);
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
  background: linear-gradient(145deg, #3333ff 0%, #0000ff 100%);
  color: #ffffff;
  font-size: 12px;
  font-weight: 800;
  box-shadow: 0 4px 12px rgba(0, 0, 255, 0.18);
}

.publisher__avatar {
  width: 42px;
  height: 42px;
  font-size: 13px;
  box-shadow: 0 6px 18px rgba(0, 0, 255, 0.16);
}

.publisher__avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.publisher__compact-input {
  flex: 1;
  min-width: 0;
  padding: 8px 14px;
  border-radius: 999px;
  background: #f1f5f9;
  font-size: 14px;
  color: #94a3b8;
  font-weight: 500;
}

.publisher__compact-actions {
  display: flex;
  gap: 2px;
}

.publisher__compact-btn {
  display: flex;
  width: 40px;
  height: 40px;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: 2px solid rgba(0, 0, 255, 0.08);
  background: rgba(0, 0, 255, 0.03);
  color: #64748b;
  cursor: pointer;
  transition: all 0.15s ease;
}

.publisher__compact-btn:hover {
  border-color: rgba(0, 0, 255, 0.2);
  background: rgba(0, 0, 255, 0.06);
  color: #0000ff;
}

.publisher__expanded {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 18px;
  border-radius: 16px;
  background: #ffffff;
  border: 1px solid rgba(0, 0, 255, 0.08);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04), 0 8px 28px rgba(0, 0, 255, 0.05);
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
  color: #0f172a;
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
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.12s ease;
}

.publisher__close:hover {
  background: #f1f5f9;
  color: #475569;
}

.publisher__status {
  border-radius: 12px;
  padding: 10px 14px;
  font-size: 13px;
  line-height: 1.5;
}

.publisher__status[data-tone="neutral"] {
  background: #f1f5ff;
  color: #475569;
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
  background: #fafbfe;
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
  color: #1420ff;
}

.publisher__textarea {
  position: relative;
  z-index: 1;
  resize: none;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  background: transparent;
  color: #334155;
  caret-color: #334155;
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
  border-color: rgba(0, 0, 255, 0.2);
}

.publisher__textarea::placeholder {
  color: #94a3b8;
}

.publisher__mention-popover {
  margin-top: -6px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  background: #ffffff;
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.12);
}

.publisher__mention-option,
.publisher__mention-state {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 10px;
  border: 0;
  background: #ffffff;
  padding: 10px 12px;
  text-align: left;
}

.publisher__mention-option {
  cursor: pointer;
  transition: background 0.12s ease;
}

.publisher__mention-option:hover {
  background: rgba(20, 32, 255, 0.05);
}

.publisher__mention-state {
  color: #64748b;
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
  background: #1420ff;
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
  color: #0f172a;
  font-size: 13px;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.publisher__mention-username {
  overflow: hidden;
  color: #64748b;
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
  border: 1px solid #dbeafe;
  background: #eff6ff;
  padding: 6px 12px;
  color: #1e3a8a;
  font-size: 12px;
  font-weight: 700;
}

.publisher__selection-remove {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: #64748b;
  cursor: pointer;
  padding: 0;
}

.publisher__toolbar {
  display: flex;
  flex-direction: column;
  gap: 12px;
  border-top: 1px solid #f1f5f9;
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
  color: #64748b;
  cursor: pointer;
  transition: all 0.15s ease;
}

.publisher__action-chip:hover {
  background: rgba(0, 0, 255, 0.04);
  color: #0000ff;
}

.publisher__action-chip--active {
  background: rgba(0, 0, 255, 0.06);
  color: #0000ff;
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
  color: #475569;
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
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #ffffff;
  padding: 8px 10px;
  color: #334155;
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
  background: #f8fafc;
  font-size: 16px;
  line-height: 1;
}

.publisher__feeling-option--active,
.publisher__feeling-option:hover {
  border-color: rgba(0, 0, 255, 0.2);
  background: rgba(0, 0, 255, 0.05);
  color: #0000ff;
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
  color: #94a3b8;
  transition: color 0.15s ease;
}

.publisher__count--warn {
  color: #dc2626;
}

.publisher__submit-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: none;
  border-radius: 999px;
  background: linear-gradient(180deg, #2233ff 0%, #0000ff 100%);
  padding: 8px 18px;
  color: #ffffff;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 6px 18px rgba(0, 0, 255, 0.2);
  transition: all 0.15s ease;
}

.publisher__submit-btn:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 255, 0.28);
  transform: translateY(-1px);
}

.publisher__submit-btn:active {
  transform: scale(0.97);
}

.publisher__submit-btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}
</style>
