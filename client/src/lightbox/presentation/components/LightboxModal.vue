<!-- Description: Renders a PHP-parity lightbox with a media stage on the left and a white interaction sidebar on the right. -->
<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="open" class="lightbox-modal">
        <div class="lightbox-modal__stage">
          <button
            v-if="canNavigate"
            type="button"
            class="lightbox-modal__nav lightbox-modal__nav--left"
            :aria-label="t('feed.lightboxModal.actionPrevious')"
            @click="prev"
          >
            <Icon name="i-ph-caret-left-bold" class="h-8 w-8" />
          </button>

          <div class="lightbox-modal__media-shell">
            <NuxtImg
              v-if="currentItem?.type === 'image'"
              :src="currentItem.src"
              :alt="currentItem.alt || resolvedTitle"
              class="lightbox-modal__image"
              loading="eager"
              sizes="100vw lg:1100px"
            />

            <video
              v-else-if="currentItem?.type === 'video'"
              controls
              playsinline
              preload="metadata"
              class="lightbox-modal__video"
            >
              <source :src="currentItem.src" :type="currentItem.mime || 'video/mp4'">
            </video>

            <div v-else class="lightbox-modal__empty">
              <Icon name="i-ph-image-broken-fill" class="h-10 w-10" />
              <p>{{ t("feed.lightboxModal.empty") }}</p>
            </div>
          </div>

          <button
            v-if="canNavigate"
            type="button"
            class="lightbox-modal__nav lightbox-modal__nav--right"
            :aria-label="t('feed.lightboxModal.actionNext')"
            @click="next"
          >
            <Icon name="i-ph-caret-right-bold" class="h-8 w-8" />
          </button>

          <div v-if="hasCurrentItem" class="lightbox-modal__stage-tools">
            <a
              :href="currentItem!.src"
              download
              class="lightbox-modal__stage-link"
            >
              {{ t("feed.lightboxModal.actionDownload") }}
            </a>
            <span class="lightbox-modal__stage-divider">·</span>
            <a
              :href="currentItem!.src"
              target="_blank"
              rel="noopener noreferrer"
              class="lightbox-modal__stage-link"
            >
              {{ openOriginalLabel }}
            </a>
          </div>
        </div>

        <aside class="lightbox-modal__sidebar">
          <header class="lightbox-modal__sidebar-header">
            <div class="lightbox-modal__author">
              <NuxtLink
                v-if="authorPath"
                :to="authorPath"
                class="lightbox-modal__author-avatar"
              >
                <img
                  v-if="authorAvatarUrl"
                  :src="authorAvatarUrl"
                  :alt="resolvedAuthor"
                  class="lightbox-modal__author-avatar-image"
                >
                <span v-else>{{ authorInitials }}</span>
              </NuxtLink>
              <div v-else class="lightbox-modal__author-avatar">
                <img
                  v-if="authorAvatarUrl"
                  :src="authorAvatarUrl"
                  :alt="resolvedAuthor"
                  class="lightbox-modal__author-avatar-image"
                >
                <span v-else>{{ authorInitials }}</span>
              </div>

              <div class="min-w-0">
                <NuxtLink
                  v-if="authorPath"
                  :to="authorPath"
                  class="lightbox-modal__author-name"
                >
                  {{ resolvedAuthor }}
                </NuxtLink>
                <p v-else class="lightbox-modal__author-name">
                  {{ resolvedAuthor }}
                </p>
                <p class="lightbox-modal__author-time">
                  {{ timeLabelText }}
                </p>
              </div>
            </div>

            <button
              type="button"
              class="lightbox-modal__close"
              :aria-label="closeLabel"
              @click="emit('close')"
            >
              <Icon name="i-ph-x-bold" class="h-6 w-6" />
            </button>
          </header>


          <div
            class="lightbox-modal__primary-action"
          >
            <div
              class="lightbox-modal__reaction-action"
              @mouseenter="openReactionTray"
              @mouseleave="closeReactionTray"
              @focusin="openReactionTray"
              @focusout="closeReactionTray"
              @contextmenu.prevent
              @selectstart.prevent
            >
              <Transition
                enter-active-class="transition duration-150 ease-out"
                enter-from-class="opacity-0 translate-y-2 scale-95"
                enter-to-class="opacity-100 translate-y-0 scale-100"
                leave-active-class="transition duration-100 ease-in"
                leave-to-class="opacity-0 translate-y-2 scale-95"
              >
                <div
                  v-if="reactionTrayOpen"
                  class="lightbox-modal__reaction-tray"
                  @click.stop
                  @pointerdown.stop
                  @contextmenu.prevent
                >
                  <button
                    v-for="reaction in reactionOptions"
                    :key="reaction.value"
                    type="button"
                    class="lightbox-modal__reaction-option"
                    :class="{ 'lightbox-modal__reaction-option--active': selectedReaction === reaction.value }"
                    :aria-label="reaction.label"
                    @pointerdown.prevent.stop="emitReaction(reaction.value)"
                    @click.prevent.stop
                    @keydown.enter.prevent="emitReaction(reaction.value)"
                    @keydown.space.prevent="emitReaction(reaction.value)"
                    @contextmenu.prevent
                  >
                    <img
                      :src="reaction.src"
                      :alt="reaction.label"
                      class="lightbox-modal__reaction-option-image"
                      draggable="false"
                    >
                  </button>
                </div>
              </Transition>

              <button
                type="button"
                class="lightbox-modal__like-btn"
                :aria-label="activeReactionLabel"
                @pointerdown.prevent.stop="startReactionPress"
                @pointerup.prevent.stop="finishReactionPress"
                @pointerleave="cancelReactionPress"
                @pointercancel="cancelReactionPress"
                @contextmenu.prevent
                @click.prevent.stop
                @keydown.enter.prevent="handleReactionClick"
                @keydown.space.prevent="handleReactionClick"
              >
                <img
                  v-if="selectedReaction"
                  :src="activeReactionAsset.src"
                  :alt="activeReactionLabel"
                  class="lightbox-modal__like-image"
                  draggable="false"
                >
                <Icon v-else name="i-ph-thumbs-up" class="h-6 w-6" />
                <span>{{ activeReactionLabel }}</span>
              </button>
            </div>

            <button
              type="button"
              class="lightbox-modal__comment-btn"
              :aria-label="t('feed.postCard.comment')"
              @click="openCommentComposer"
            >
              <Icon name="i-ph-chat-circle-fill" class="h-6 w-6" />
              <span>{{ t("feed.postCard.comment") }}</span>
            </button>
          </div>


          <div class="lightbox-modal__comments">
            <FeedCommentList
              v-if="normalizedComments.length > 0"
              :comments="normalizedComments"
              enable-reply
              :current-user-name="currentUserName"
              :current-user-avatar-url="currentUserAvatarUrl"
            />
            <div v-else class="lightbox-modal__comments-empty">
              <Icon name="i-ph-chat-centered-dots-duotone" class="h-14 w-14" />
              <p>{{ t("feed.commentList.emptyDescription") }}</p>
            </div>
          </div>

          <footer
            v-if="showComposer"
            ref="composerShellRef"
            class="lightbox-modal__composer"
            :class="{ 'lightbox-modal__composer--mobile-open': mobileComposerOpen }"
          >
            <FeedCommentComposer
              :current-user-name="currentUserName"
              :current-user-avatar-url="currentUserAvatarUrl"
              :submitting="submittingComment"
              @submit="submitComment"
            />
          </footer>
        </aside>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { useTimeoutFn } from "@vueuse/core"
import { defaultFeedReactionAsset, feedReactionAssetByValue, feedReactionAssets } from "../../../feed/application/constants/reaction-assets"
import { defaultFeedStoryReaction, type FeedStoryReactionType } from "../../../feed/domain/constants/story-reactions"
import type { FeedCommentRecord, FeedCommentSubmitPayload } from "../../../feed/domain/types/feed.types"
import FeedCommentComposer from "../../../feed/presentation/components/CommentComposer.vue"
import FeedCommentList from "../../../feed/presentation/components/CommentList.vue"

type LightboxItem = {
  type: "image" | "video"
  src: string
  alt?: string
  mime?: string
}

const { t, te } = useI18n()

const props = withDefaults(defineProps<{
  open?: boolean
  title?: string
  description?: string
  author?: string
  authorAvatarUrl?: string
  authorPath?: string
  caption?: string
  timeLabel?: string
  likeCount?: number
  comments?: ReadonlyArray<FeedCommentRecord>
  currentUserName?: string
  currentUserAvatarUrl?: string
  submittingComment?: boolean
  showComposer?: boolean
  selectedReaction?: FeedStoryReactionType | null
  items: ReadonlyArray<LightboxItem>
  currentIndex?: number
}>(), {
  open: false,
  title: "",
  description: "",
  author: "VNSEEA",
  authorAvatarUrl: "",
  authorPath: "",
  caption: "",
  timeLabel: "",
  likeCount: 0,
  comments: () => [],
  currentUserName: "",
  currentUserAvatarUrl: "",
  submittingComment: false,
  showComposer: true,
  selectedReaction: null,
  currentIndex: 0,
})

const emit = defineEmits<{
  close: []
  share: []
  download: []
  like: []
  react: [reaction: FeedStoryReactionType]
  comment: []
  change: [index: number]
  "submit-comment": [payload: FeedCommentSubmitPayload]
}>()

const reactionTrayOpen = ref(false)
const reactionLongPressTriggered = ref(false)
const mobileComposerOpen = ref(false)
const composerShellRef = ref<HTMLElement | null>(null)
const reactionOptions = computed(() =>
  feedReactionAssets.map(reaction => ({
    value: reaction.value,
    label: t(reaction.labelKey),
    src: reaction.src,
  })),
)
const activeReactionAsset = computed(() =>
  props.selectedReaction
    ? feedReactionAssetByValue[props.selectedReaction]
    : defaultFeedReactionAsset,
)
const activeReactionLabel = computed(() =>
  props.selectedReaction
    ? t(activeReactionAsset.value.labelKey)
    : t("feed.postCard.like"),
)

const normalizedIndex = computed(() => {
  const total = props.items.length

  if (total === 0) return 0

  return ((props.currentIndex % total) + total) % total
})

const currentItem = computed(() => props.items[normalizedIndex.value] ?? null)
const hasCurrentItem = computed(() => Boolean(currentItem.value))
const canNavigate = computed(() => props.items.length > 1)
const resolvedTitle = computed(() => props.title || t("feed.lightboxModal.defaultTitle"))
const resolvedAuthor = computed(() => props.author || "VNSEEA")
const timeLabelText = computed(() => props.timeLabel || t("feed.postCard.justNow"))
const normalizedComments = computed(() => [...props.comments])
const openOriginalLabel = computed(() =>
  te("feed.lightboxModal.actionOpenOriginal")
    ? t("feed.lightboxModal.actionOpenOriginal")
    : "Open original",
)
const closeLabel = computed(() =>
  te("feed.lightboxModal.actionClose")
    ? t("feed.lightboxModal.actionClose")
    : "Close lightbox",
)
const authorInitials = computed(() => {
  const initials = resolvedAuthor.value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() ?? "")
    .join("")

  return initials || "VN"
})

const {
  start: startReactionLongPressTimer,
  stop: stopReactionLongPressTimer,
} = useTimeoutFn(() => {
  reactionLongPressTriggered.value = true
  reactionTrayOpen.value = true
}, 420, { immediate: false })

function prev() {
  if (!props.items.length) return

  emit("change", (normalizedIndex.value - 1 + props.items.length) % props.items.length)
}

function next() {
  if (!props.items.length) return

  emit("change", (normalizedIndex.value + 1) % props.items.length)
}

function handleKeydown(event: KeyboardEvent) {
  if (!props.open || !props.items.length) return

  if (event.key === "Escape") {
    event.preventDefault()
    emit("close")
  }

  if (event.key === "ArrowLeft") {
    event.preventDefault()
    prev()
  }

  if (event.key === "ArrowRight") {
    event.preventDefault()
    next()
  }
}

function openReactionTray() {
  reactionTrayOpen.value = true
}

function closeReactionTray() {
  reactionTrayOpen.value = false
}

function startReactionPress() {
  reactionLongPressTriggered.value = false
  startReactionLongPressTimer()
}

function finishReactionPress() {
  stopReactionLongPressTimer()

  if (!reactionLongPressTriggered.value) {
    emitReaction(defaultFeedStoryReaction.value)
  }
}

function cancelReactionPress() {
  stopReactionLongPressTimer()
}

function handleReactionClick() {
  if (reactionLongPressTriggered.value) {
    return
  }

  emitReaction(defaultFeedStoryReaction.value)
}

function emitReaction(reaction: FeedStoryReactionType) {
  reactionTrayOpen.value = false
  emit("react", reaction)
}

function openCommentComposer() {
  mobileComposerOpen.value = true
  emit("comment")

  void nextTick(() => {
    const focusable = composerShellRef.value?.querySelector<HTMLElement>(
      "textarea, input, [contenteditable='true']",
    )
    focusable?.focus()
  })
}

function submitComment(payload: FeedCommentSubmitPayload) {
  mobileComposerOpen.value = true
  emit("submit-comment", payload)
}

watch(
  () => props.open,
  (value) => {
    if (!value) {
      mobileComposerOpen.value = false
      reactionTrayOpen.value = false
      reactionLongPressTriggered.value = false
    }
  },
)

onMounted(() => {
  window.addEventListener("keydown", handleKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener("keydown", handleKeydown)
})
</script>

<style scoped>
.lightbox-modal {
  position: fixed;
  inset: 0;
  z-index: 1200;
  display: grid;
  min-height: 100vh;
  background: #000000;
}

@media (min-width: 1024px) {
  .lightbox-modal {
    grid-template-columns: minmax(0, 1fr) 420px;
  }
}

.lightbox-modal__stage {
  position: relative;
  display: flex;
  min-height: 56vh;
  align-items: center;
  justify-content: center;
  padding: 24px 16px 72px;
  background: #000000;
}

@media (min-width: 768px) {
  .lightbox-modal__stage {
    padding-inline: 44px;
  }
}

.lightbox-modal__media-shell {
  display: flex;
  width: 100%;
  height: 100%;
  min-height: 320px;
  align-items: center;
  justify-content: center;
}

.lightbox-modal__image,
.lightbox-modal__video {
  display: block;
  max-width: 100%;
  max-height: calc(100vh - 120px);
  object-fit: contain;
}

.lightbox-modal__video {
  background: #000000;
}

.lightbox-modal__empty {
  display: flex;
  min-height: 280px;
  width: min(100%, 420px);
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  color: rgba(255, 255, 255, 0.8);
}

.lightbox-modal__nav {
  position: absolute;
  top: 50%;
  z-index: 2;
  display: inline-flex;
  width: 56px;
  height: 56px;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 9999px;
  background: transparent;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  transform: translateY(-50%);
  transition: color 0.15s ease, background 0.15s ease;
}

.lightbox-modal__nav:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #ffffff;
}

.lightbox-modal__nav--left {
  left: 12px;
}

.lightbox-modal__nav--right {
  right: 12px;
}

.lightbox-modal__stage-tools {
  position: absolute;
  left: 18px;
  bottom: 16px;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
}

.lightbox-modal__stage-link {
  color: inherit;
  text-decoration: none;
}

.lightbox-modal__stage-link:hover {
  text-decoration: underline;
}

.lightbox-modal__stage-divider {
  color: rgba(255, 255, 255, 0.45);
}

.lightbox-modal__sidebar {
  display: flex;
  min-height: 44vh;
  flex-direction: column;
  background: var(--bg-surface);
  color: var(--text-primary);
  overflow: hidden;
}

@media (min-width: 1024px) {
  .lightbox-modal__sidebar {
    max-height: 100vh;
  }
}

.lightbox-modal__sidebar-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 24px 20px 16px;
  border-bottom: 1px solid rgba(15, 23, 42, 0.08);
}

.lightbox-modal__author {
  display: flex;
  min-width: 0;
  align-items: flex-start;
  gap: 12px;
}

.lightbox-modal__author-avatar {
  display: inline-flex;
  width: 44px;
  height: 44px;
  flex: 0 0 44px;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 9999px;
  background: var(--bg-surface-active);
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 800;
  text-decoration: none;
}

.lightbox-modal__author-avatar-image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.lightbox-modal__author-name {
  display: block;
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 800;
  line-height: 1.4;
  text-decoration: none;
}

.lightbox-modal__author-time {
  margin-top: 2px;
  color: var(--text-secondary);
  font-size: 13px;
  line-height: 1.4;
}

.lightbox-modal__close {
  display: inline-flex;
  width: 38px;
  height: 38px;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 9999px;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
}

.lightbox-modal__close:hover {
  background: var(--bg-surface-hover);
  color: var(--text-primary);
}

.lightbox-modal__stats {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 20px;
  border-bottom: 1px solid rgba(15, 23, 42, 0.08);
  color: var(--text-secondary);
  font-size: 14px;
}

.lightbox-modal__stats-left {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.lightbox-modal__stats-like-icon {
  display: inline-flex;
  width: 24px;
  height: 24px;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  background: rgba(239, 68, 68, 0.12);
  color: #ef4444;
}

.lightbox-modal__primary-action {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  border-bottom: 1px solid rgba(15, 23, 42, 0.08);
}

.lightbox-modal__reaction-action {
  position: relative;
  border-right: 1px solid rgba(15, 23, 42, 0.08);
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  user-select: none;
}

.lightbox-modal__like-btn,
.lightbox-modal__comment-btn {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 0;
  background: transparent;
  padding: 14px 18px;
  color: var(--text-secondary);
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  touch-action: manipulation;
  user-select: none;
}

.lightbox-modal__like-btn:hover,
.lightbox-modal__comment-btn:hover {
  background: var(--bg-surface-hover);
  color: var(--text-brand);
}

.lightbox-modal__like-image {
  width: 22px;
  height: 22px;
  object-fit: contain;
  flex-shrink: 0;
}

.lightbox-modal__reaction-tray {
  position: absolute;
  left: 50%;
  bottom: calc(100% - 8px);
  z-index: 5;
  display: flex;
  gap: 10px;
  transform: translateX(-50%);
  padding: 0;
  border: 0;
  background: transparent;
  box-shadow: none;
  filter: drop-shadow(0 10px 18px rgba(15, 23, 42, 0.22));
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  user-select: none;
}

.lightbox-modal__reaction-option {
  display: inline-flex;
  width: 36px;
  height: 36px;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 9999px;
  background: transparent;
  cursor: pointer;
  touch-action: manipulation;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  user-select: none;
  transition: transform 0.15s ease;
}

.lightbox-modal__reaction-option:hover,
.lightbox-modal__reaction-option--active {
  transform: translateY(-5px) scale(1.08);
}

.lightbox-modal__reaction-option-image {
  width: 30px;
  height: 30px;
  object-fit: contain;
  pointer-events: none;
  -webkit-user-drag: none;
  -webkit-user-select: none;
  user-select: none;
}

.lightbox-modal__meta {
  padding: 16px 20px 0;
}

.lightbox-modal__caption,
.lightbox-modal__description {
  margin: 0;
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.65;
}

.lightbox-modal__description {
  margin-top: 4px;
}

.lightbox-modal__comments {
  min-height: 0;
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.lightbox-modal__comments-empty {
  display: flex;
  min-height: 260px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  color: var(--text-secondary);
  text-align: center;
}

.lightbox-modal__composer {
  border-top: 1px solid rgba(15, 23, 42, 0.08);
  padding: 14px 20px 18px;
  background: var(--bg-surface);
}

@media (max-width: 767px) {
  .lightbox-modal__composer {
    display: none;
  }

  .lightbox-modal__composer--mobile-open {
    display: block;
  }
}
</style>
