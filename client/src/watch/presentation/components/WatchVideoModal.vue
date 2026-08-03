<!-- Description: Renders a full-screen watch modal with a primary video stage and a "Up Next" sidebar matching the user's design. -->
<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div v-if="open" class="watch-modal">
        <div class="watch-modal__container">
          <!-- Video Stage (Left) -->
          <div class="watch-modal__stage">
            <div class="watch-modal__player-shell">
              <!-- Video Navigation Arrows -->
              <button
                v-if="hasPrevious"
                class="watch-modal__nav watch-modal__nav--left"
                @click="emit('prev')"
              >
                <Icon name="i-ph-caret-left-bold" class="h-8 w-8" />
              </button>

              <div class="watch-modal__video-wrapper">
                <video
                  ref="videoRef"
                  class="watch-modal__video"
                  controls
                  autoplay
                  playsinline
                  :src="videoSrc"
                  @play="isPlaying = true"
                  @pause="isPlaying = false"
                />

                <!-- Center Play Button Overlay -->
                <div v-if="!isPlaying" class="watch-modal__play-overlay" @click="togglePlay">
                   <div class="watch-modal__play-btn">
                      <Icon name="i-ph-play-fill" class="watch-modal__media-icon h-10 w-10" />
                   </div>
                </div>
              </div>

              <button
                v-if="hasNext"
                class="watch-modal__nav watch-modal__nav--right"
                @click="emit('next')"
              >
                <Icon name="i-ph-caret-right-bold" class="h-8 w-8" />
              </button>

              <!-- Footer stage tools -->
              <div class="watch-modal__stage-tools">
                <button class="watch-modal__stage-link" @click="downloadMedia">{{ t('feed.lightboxModal.actionDownload') }}</button>
                <span class="watch-modal__stage-divider">·</span>
                <button class="watch-modal__stage-link" @click="openOriginal">{{ t('feed.lightboxModal.actionOpenOriginal') }}</button>
              </div>
            </div>
          </div>

          <!-- Sidebar (Right) -->
          <aside class="watch-modal__sidebar">
            <header class="watch-modal__sidebar-header">
               <h3 class="watch-modal__sidebar-title">{{ t('pages.watchPage.upNext') }}</h3>
               <button type="button" class="watch-modal__close-btn" @click="emit('close')">
                 <Icon name="i-ph-x-bold" class="h-5 w-5" />
               </button>
            </header>

            <div class="watch-modal__sidebar-content">
              <!-- Up Next List (Limit to 3) -->
              <div class="watch-modal__next-list">
                <div
                  v-for="item in limitedRelatedItems"
                  :key="item.id"
                  class="watch-modal__next-item"
                  :class="{ 'watch-modal__next-item--active': item.id === post?.id }"
                  @click="emit('select', item.id)"
                >
                  <div class="watch-modal__next-thumb">
                    <!-- If thumb is a video or matches video src, use video frame at 0.5s -->
                    <video
                      v-if="item.thumb.toLowerCase().includes('.mp4') || item.thumb.toLowerCase().includes('.webm')"
                      :src="item.thumb + '#t=0.5'"
                      class="watch-modal__next-img"
                      muted
                      playsinline
                      preload="metadata"
                    />
                    <img v-else :src="item.thumb" :alt="item.title" class="watch-modal__next-img">
                    
                    <div v-if="item.id === post?.id" class="watch-modal__playing-overlay">
                      <Icon name="i-ph-play-fill" class="watch-modal__media-icon h-6 w-6" />
                    </div>
                  </div>
                  <div class="watch-modal__next-info">
                    <p class="watch-modal__next-item-title">{{ item.title || 'Video không có tiêu đề' }}</p>
                    <div class="watch-modal__next-meta">
                      <span class="watch-modal__next-views">{{ item.views || 0 }} lượt xem</span>
                      <p class="watch-modal__next-author">{{ item.author }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div class="watch-modal__divider"></div>

              <!-- Author Info Section -->
              <div class="watch-modal__author-section" v-if="post">
                <div class="watch-modal__author">
                  <img :src="post.authorAvatarUrl" :alt="post.author" class="watch-modal__author-avatar">
                  <div class="watch-modal__author-info">
                    <p class="watch-modal__author-name">{{ post.author }}</p>
                    <p class="watch-modal__author-time">{{ formattedTime }}</p>
                  </div>
                </div>
                <div class="watch-modal__post-text" v-if="post.text">
                  {{ post.text }}
                </div>
              </div>

              <!-- Reaction Summary (Facebook-style: Icons + Count) -->
              <div class="watch-modal__stats-summary" v-if="likesCount > 0 || commentsCount > 0 || sharesCount > 0">
                 <div class="watch-modal__reaction-stats" v-if="likesCount > 0">
                    <div class="watch-modal__stat-icons">
                       <span
                         v-for="reaction in previewReactions"
                         :key="reaction.value"
                         class="watch-modal__stat-icon-wrapper"
                       >
                         <img
                           :src="reaction.src"
                           :alt="t(reaction.labelKey)"
                           class="watch-modal__stat-reaction-img"
                         >
                       </span>
                    </div>
                    <span class="watch-modal__stat-number">{{ likesCount }}</span>
                 </div>
                 <div class="watch-modal__stats-right">
                   <button v-if="commentsCount > 0" class="watch-modal__comment-stats" type="button" @click="focusComment">
                     {{ t('feed.postCard.commentsCount', { count: commentsCount }) }}
                   </button>
                   <div class="watch-modal__share-stats" v-if="sharesCount > 0">
                      <span>{{ sharesCount }} {{ t('pages.readBlogPage.share') }}</span>
                   </div>
                 </div>
              </div>

              <!-- Interaction Bar (Reactions, Comment, Share) -->
              <div class="watch-modal__interaction-bar">
                 <!-- Reaction Button with Tray -->
                 <div
                    class="watch-modal__interaction-wrapper"
                    :class="{ 'watch-modal__interaction-wrapper--open': postReactionTrayOpen }"
                    @mouseenter="openPostReactionTray"
                    @mouseleave="closePostReactionTray"
                    @focusin="openPostReactionTray"
                    @focusout="closePostReactionTray"
                    @contextmenu.prevent
                 >
                    <Transition
                      enter-active-class="transition duration-150 ease-out"
                      enter-from-class="opacity-0 translate-y-2 scale-95"
                      enter-to-class="opacity-100 translate-y-0 scale-100"
                      leave-active-class="transition duration-100 ease-in"
                      leave-to-class="opacity-0 translate-y-2 scale-95"
                    >
                      <div
                        v-if="postReactionTrayOpen"
                        class="watch-modal__reaction-tray"
                        @click.stop
                        @pointerdown.stop
                        @contextmenu.prevent
                      >
                        <button
                          v-for="(reaction, reactionIndex) in postReactionOptions"
                          :key="reaction.value"
                          class="watch-modal__reaction-option"
                          :class="{ 'watch-modal__reaction-option--active': selectedPostReaction === reaction.value }"
                          :style="{ '--reaction-index': String(reactionIndex) }"
                          type="button"
                          :aria-label="reaction.label"
                          @pointerdown.prevent.stop="reactToPost(reaction.value)"
                          @click.prevent.stop
                          @keydown.enter.prevent="reactToPost(reaction.value)"
                          @keydown.space.prevent="reactToPost(reaction.value)"
                        >
                          <img
                            :src="reaction.src"
                            :alt="reaction.label"
                            class="watch-modal__reaction-img"
                            draggable="false"
                          >
                        </button>
                      </div>
                    </Transition>

                    <button
                      class="watch-modal__interaction-btn"
                      :class="{
                        'watch-modal__interaction-btn--active': liked,
                        'watch-modal__interaction-btn--reacted': selectedPostReaction,
                      }"
                      type="button"
                      :aria-pressed="liked"
                      :aria-label="activePostReactionLabel"
                      @pointerdown="startPostReactionPress"
                      @pointerup="finishPostReactionPress"
                      @pointerleave="cancelPostReactionPress"
                      @pointercancel="cancelPostReactionPress"
                      @contextmenu.prevent
                      @click="handlePostReactionButtonClick"
                    >
                      <img
                        v-if="selectedPostReaction"
                        :src="activePostReactionAsset.src"
                        :alt="activePostReactionLabel"
                        class="watch-modal__active-reaction-img"
                        draggable="false"
                      >
                      <Icon v-else name="i-ph-thumbs-up" class="h-5 w-5" />
                      <span>{{ selectedPostReaction ? activePostReactionLabel : liked ? t('feed.postCard.likeActive') : t('feed.postCard.like') }}</span>
                    </button>
                 </div>

                 <button class="watch-modal__interaction-btn" @click="focusComment">
                    <Icon name="i-ph-chat-circle" class="h-5 w-5" />
                    <span>{{ t('feed.postCard.comment') }}</span>
                 </button>

                 <button
                   class="watch-modal__interaction-btn"
                   :disabled="!post?.permissions.canShare"
                   @click="post?.permissions.canShare && (showShare = true)"
                 >
                    <Icon name="i-ph-share-fat" class="h-5 w-5" />
                    <span>{{ t('feed.postCard.share') }}</span>
                 </button>
              </div>

              <UAlert
                v-if="actionState === 'error' && actionMessage"
                class="watch-modal__action-alert"
                color="warning"
                variant="subtle"
                icon="i-ph-warning-circle-bold"
                :description="actionMessage"
              />

              <!-- Comments List -->
              <div class="watch-modal__comments-section">
                <FeedCommentList
                  v-if="localComments.length > 0"
                  :comments="localComments"
                  enable-reply
                  enable-reaction
                  reply-composer-variant="lightbox"
                  :current-user-name="currentAuthUserStore.user?.name"
                  :current-user-avatar-url="currentAuthUserStore.user?.avatarUrl"
                  :comment-action-repository="commentActionRepository"
                />
                <div v-else class="watch-modal__comments-empty">
                  <Icon name="i-ph-chat-circle-text" class="h-10 w-10 opacity-20" />
                  <p>{{ t('feed.commentList.emptyDescription') }}</p>
                </div>
              </div>
            </div>

            <!-- Comment Composer (Footer of Sidebar) -->
            <footer class="watch-modal__composer">
               <FeedCommentComposer
                 ref="commentComposerRef"
                 variant="lightbox"
                 :current-user-name="currentAuthUserStore.user?.name"
                 :current-user-avatar-url="currentAuthUserStore.user?.avatarUrl"
                 :submitting="commenting"
                 @submit="submitComment"
               />
            </footer>
          </aside>
        </div>

        <ClientOnly>
          <FeedShareModal
            v-if="post?.permissions.canShare"
            :open="showShare"
            :can-share="post.permissions.canShare"
            :share-url="shareUrl"
            :post="{
              id: post.id,
              author: post.author,
              text: post.text,
              authorAvatar: post.authorAvatarUrl,
              authorVerified: post.authorVerified,
            }"
            @close="showShare = false"
            @shared="handleShared"
          />
        </ClientOnly>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { useFeedPostCardVM } from "../../../feed/application/view-models/useFeedPostCardVM"
import type { FeedPostRecord } from "../../../feed/domain/types/feed.types"
import FeedCommentList from "../../../feed/presentation/components/CommentList.vue"
import FeedCommentComposer from "../../../feed/presentation/components/CommentComposer.vue"
import FeedShareModal from "../../../feed/presentation/components/ShareModal.vue"
import { useTimeAgo } from "@vueuse/core"

const { t } = useI18n()

const props = defineProps<{
  open: boolean
  post: FeedPostRecord | null
  relatedPosts: FeedPostRecord[]
}>()

const emit = defineEmits<{
  close: []
  prev: []
  next: []
  select: [postId: number]
}>()

const videoRef = ref<HTMLVideoElement | null>(null)
const isPlaying = ref(true)
const commentComposerRef = ref<any>(null)

// Use the FeedPostCardVM for all interaction logic
const {
  currentAuthUserStore,
  showShare,
  liked,
  selectedPostReaction,
  postReactionTrayOpen,
  localComments,
  likesCount,
  commentsCount,
  sharesCount,
  actionState,
  actionMessage,
  commenting,
  postReactionOptions,
  activePostReactionAsset,
  activePostReactionLabel,
  previewReactions,
  shareUrl,
  commentActionRepository,
  openPostReactionTray,
  closePostReactionTray,
  startPostReactionPress,
  finishPostReactionPress,
  cancelPostReactionPress,
  handlePostReactionButtonClick,
  reactToPost,
  submitComment,
  handleShared,
  downloadMedia,
  refreshComments,
} = useFeedPostCardVM(toRef(props, "post") as Ref<FeedPostRecord>)

const formattedTime = computed(() => {
  if (!props.post?.time) return t('feed.postCard.justNow')
  const normalized = props.post.time.trim()
  
  if (/^\d{10,}$/.test(normalized)) {
    const timestamp = Number(normalized) * 1000
    return useTimeAgo(new Date(timestamp)).value
  }
  return normalized
})

const videoSrc = computed(() => {
  if (!props.post) return ""
  const videoItem = props.post.mediaItems?.find(m => m.type === 'video')
  return videoItem?.src || ""
})

const currentIndex = computed(() => {
  return props.relatedPosts.findIndex(p => p.id === props.post?.id)
})

const hasPrevious = computed(() => currentIndex.value > 0)
const hasNext = computed(() => currentIndex.value !== -1 && currentIndex.value < props.relatedPosts.length - 1)

const relatedItems = computed(() => {
  // Only show videos that come AFTER the current video
  const subsequentPosts = currentIndex.value !== -1 
    ? props.relatedPosts.slice(currentIndex.value + 1)
    : props.relatedPosts

  return subsequentPosts.map(p => {
    const videoItem = p.mediaItems.find(m => m.type === 'video')
    // If thumb is missing, use video src as fallback
    const thumbUrl = videoItem?.thumb || p.mediaItems[0]?.thumb || videoItem?.src || ""
    
    const finalThumb = thumbUrl || "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=300&auto=format&fit=crop"

    return {
      id: p.id,
      title: p.text || "",
      thumb: finalThumb,
      author: p.author,
      views: p.stats.views || p.stats.likes * 7, 
    }
  })
})

const limitedRelatedItems = computed(() => {
  return relatedItems.value.slice(0, 3)
})

function togglePlay() {
  if (!videoRef.value) return
  if (videoRef.value.paused) {
    videoRef.value.play()
    isPlaying.value = true
  }
  else {
    videoRef.value.pause()
    isPlaying.value = false
  }
}

function openOriginal() {
  if (videoSrc.value) {
    window.open(videoSrc.value, "_blank")
  }
}

function focusComment() {
  commentComposerRef.value?.focus?.()
}

watch(() => props.post, () => {
  isPlaying.value = true
  if (videoRef.value) {
    videoRef.value.load()
    videoRef.value.play()
  }
  if (props.post) {
    refreshComments()
  }
})

watch(() => props.open, (isOpen) => {
  if (isOpen) {
    if (import.meta.client) {
      document.body.style.overflow = "hidden"
    }
    if (props.post) {
      refreshComments()
    }
  } else if (import.meta.client) {
    document.body.style.overflow = ""
  }
})

onBeforeUnmount(() => {
  if (import.meta.client) {
    document.body.style.overflow = ""
  }
})
</script>

<style scoped>
.watch-modal {
  position: fixed;
  inset: 0;
  z-index: 2000;
  background: var(--bg-media);
  display: flex;
  flex-direction: column;
  user-select: none;
}

.watch-modal__container {
  display: grid;
  grid-template-columns: 1fr 420px;
  height: 100%;
  width: 100%;
}

@media (max-width: 1100px) {
  .watch-modal__container {
    grid-template-columns: 1fr;
    overflow-y: auto;
  }
}

.watch-modal__stage {
  position: relative;
  z-index: 0;
  display: flex;
  flex-direction: column;
  background: var(--bg-media);
  height: 100%;
  min-height: 0;
}

.watch-modal__player-shell {
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 0;
}

.watch-modal__video-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.watch-modal__video {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  background: var(--bg-media);
}

.watch-modal__play-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: color-mix(in srgb, var(--bg-media) 30%, transparent);
  cursor: pointer;
  z-index: 5;
}

.watch-modal__play-btn {
  width: 72px;
  height: 72px;
  background: var(--bg-brand);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 20px color-mix(in srgb, var(--bg-brand) 40%, transparent);
  transition: transform 0.2s ease;
}

.watch-modal__play-overlay:hover .watch-modal__play-btn {
  transform: scale(1.1);
}

.watch-modal__media-icon {
  color: var(--text-media);
}

.watch-modal__nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: color-mix(in srgb, var(--bg-media) 45%, transparent);
  color: var(--text-media);
  border: 1px solid var(--border-media);
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  opacity: 0;
  transition: all 0.3s ease;
}

.watch-modal__stage:hover .watch-modal__nav {
  opacity: 0.8;
}

.watch-modal__nav:hover {
  opacity: 1 !important;
  background: color-mix(in srgb, var(--text-media) 14%, transparent);
}

.watch-modal__nav--left {
  left: 20px;
}

.watch-modal__nav--right {
  right: 20px;
}

.watch-modal__stage-tools {
  position: absolute;
  left: 24px;
  bottom: 24px;
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--text-media-muted);
  font-size: 14px;
}

.watch-modal__stage-link {
  background: transparent;
  border: none;
  color: inherit;
  cursor: pointer;
  font-weight: 600;
  transition: color 0.2s;
}

.watch-modal__stage-link:hover {
  color: var(--text-media);
}

.watch-modal__stage-divider {
  opacity: 0.5;
}

/* Sidebar */
.watch-modal__sidebar {
  position: relative;
  z-index: 20;
  background: var(--bg-surface);
  color: var(--text-primary);
  display: flex;
  flex-direction: column;
  border-left: 1px solid var(--border-light);
  height: 100%;
  overflow: hidden;
}

.watch-modal__sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-light);
}

.watch-modal__sidebar-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
}

.watch-modal__close-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--bg-muted);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-secondary);
}

.watch-modal__sidebar-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  /* Ensure scrollbar is visible but elegant */
  scrollbar-width: thin;
  scrollbar-color: color-mix(in srgb, var(--text-primary) 12%, transparent) transparent;
}

.watch-modal__sidebar-content::-webkit-scrollbar {
  width: 6px;
}

.watch-modal__sidebar-content::-webkit-scrollbar-thumb {
  background-color: color-mix(in srgb, var(--text-primary) 12%, transparent);
  border-radius: 10px;
}

.watch-modal__next-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.watch-modal__next-item {
  display: flex;
  gap: 12px;
  cursor: pointer;
  padding: 8px;
  border-radius: 12px;
  transition: background 0.2s;
}

.watch-modal__next-item:hover {
  background: var(--bg-surface-hover);
}

.watch-modal__next-item--active {
  background: var(--bg-surface-active);
}

.watch-modal__next-thumb {
  position: relative;
  width: 120px;
  aspect-ratio: 16/9;
  border-radius: 8px;
  overflow: hidden;
  background: var(--bg-media);
  flex-shrink: 0;
}

.watch-modal__next-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.watch-modal__playing-overlay {
  position: absolute;
  inset: 0;
  background: color-mix(in srgb, var(--bg-brand) 30%, transparent);
  display: flex;
  align-items: center;
  justify-content: center;
}

.watch-modal__next-info {
  flex: 1;
  min-width: 0;
}

.watch-modal__next-item-title {
  font-size: 14px;
  font-weight: 600;
  line-height: 1.4;
  color: var(--text-primary);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.watch-modal__next-meta {
  margin-top: 4px;
  font-size: 12px;
  color: var(--text-secondary);
}

.watch-modal__divider {
  height: 1px;
  background: var(--border-light);
  margin: 20px 0;
}

.watch-modal__author-section {
  margin-bottom: 20px;
}

.watch-modal__author {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.watch-modal__author-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.watch-modal__author-name {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-primary);
}

.watch-modal__author-time {
  font-size: 13px;
  color: var(--text-secondary);
}

.watch-modal__post-text {
  font-size: 14px;
  line-height: 1.5;
  color: var(--text-primary);
}

.watch-modal__interaction-bar {
  position: relative;
  z-index: 30;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4px;
  padding: 10px 0;
  border-top: 1px solid var(--border-light);
  border-bottom: 1px solid var(--border-light);
  margin-bottom: 16px;
}

.watch-modal__interaction-wrapper {
  position: relative;
  width: 100%;
}

.watch-modal__interaction-wrapper--open {
  z-index: 40;
}

.watch-modal__interaction-btn {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 4px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s;
}

.watch-modal__interaction-btn:hover {
  background: var(--bg-surface-hover);
  color: var(--bg-brand);
}

.watch-modal__interaction-btn:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.watch-modal__interaction-btn:disabled:hover {
  background: transparent;
  color: var(--text-secondary);
}

.watch-modal__interaction-btn--active {
  color: var(--bg-brand);
  background: color-mix(in srgb, var(--bg-brand) 5%, transparent);
}

.watch-modal__interaction-btn--reacted .watch-modal__active-reaction-img {
  animation: watch-reaction-selected-pop 0.24s ease-out;
}

.watch-modal__active-reaction-img {
  width: 20px;
  height: 20px;
  object-fit: contain;
  pointer-events: none;
}

.watch-modal__reaction-tray {
  position: absolute;
  bottom: calc(100% + 2px);
  left: 0;
  display: flex;
  gap: 10px;
  background: var(--bg-surface);
  border: 1px solid var(--border-light);
  padding: 8px 10px;
  border-radius: 999px;
  box-shadow: var(--shadow-lg);
  z-index: 200;
  transform-origin: 0 100%;
  animation: watch-reaction-tray-in 0.16s ease-out both;
  pointer-events: auto;
  touch-action: manipulation;
  user-select: none;
  white-space: nowrap;
}

.watch-modal__reaction-option {
  display: flex;
  width: 34px;
  height: 34px;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 999px;
  background: transparent;
  padding: 0;
  cursor: pointer;
  touch-action: manipulation;
  transition: transform 0.15s ease;
}

.watch-modal__reaction-option:hover,
.watch-modal__reaction-option:focus-visible,
.watch-modal__reaction-option--active {
  transform: translateY(-8px) scale(1.18);
}

.watch-modal__reaction-img {
  width: 28px;
  height: 28px;
  object-fit: contain;
  pointer-events: none;
}

.watch-modal__action-alert {
  margin-bottom: 14px;
  border-radius: 14px;
}

@keyframes watch-reaction-tray-in {
  from {
    opacity: 0;
    transform: translateY(8px) scale(0.96);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes watch-reaction-selected-pop {
  0% {
    transform: scale(0.72) rotate(-8deg);
  }

  65% {
    transform: scale(1.24) rotate(4deg);
  }

  100% {
    transform: scale(1) rotate(0);
  }
}

@media (max-width: 520px) {
  .watch-modal__reaction-tray {
    left: 0;
    gap: 4px;
    padding-inline: 8px;
    animation-name: watch-reaction-tray-in-mobile;
  }

  .watch-modal__reaction-option {
    width: 32px;
    height: 32px;
  }

  .watch-modal__reaction-img {
    width: 28px;
    height: 28px;
  }
}

@keyframes watch-reaction-tray-in-mobile {
  from {
    opacity: 0;
    transform: translateY(8px) scale(0.96);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .watch-modal__reaction-tray,
  .watch-modal__interaction-btn--reacted .watch-modal__active-reaction-img {
    animation: none;
  }
}

.watch-modal__stats-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 12px;
  font-size: 13px;
  color: var(--text-secondary);
}

.watch-modal__reaction-stats {
  display: flex;
  align-items: center;
  gap: 8px;
}

.watch-modal__stat-icons {
  display: flex;
  align-items: center;
}

.watch-modal__stat-icon-wrapper {
  display: inline-flex;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 1.5px solid var(--border-light);
  background: var(--bg-surface);
  margin-left: -4px;
}

.watch-modal__stat-icon-wrapper:first-child {
  margin-left: 0;
  z-index: 3;
}
.watch-modal__stat-icon-wrapper:nth-child(2) { z-index: 2; }
.watch-modal__stat-icon-wrapper:nth-child(3) { z-index: 1; }

.watch-modal__stat-reaction-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.watch-modal__stat-number {
  font-weight: 600;
  color: var(--text-secondary);
}

.watch-modal__share-stats {
  font-weight: 500;
}

.watch-modal__stats-right {
  display: flex;
  align-items: center;
  gap: 14px;
}

.watch-modal__comment-stats {
  border: 0;
  background: transparent;
  padding: 0;
  color: inherit;
  font: inherit;
  font-weight: 500;
  cursor: pointer;
}

.watch-modal__comment-stats:hover {
  color: var(--bg-brand);
  text-decoration: underline;
}

.watch-modal__comments-empty {
  text-align: center;
  padding: 40px 0;
  color: var(--text-secondary);
}

.watch-modal__composer {
  flex-shrink: 0;
  padding: 14px 20px 18px;
  border-top: 1px solid var(--border-light);
  background: var(--bg-surface);
}

.scrollbar-hide {
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
