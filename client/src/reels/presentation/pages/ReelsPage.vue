<!-- Description: Renders the reels route as a fullscreen media viewer with feed-powered reactions, comments, sharing, and save controls. -->
<template>
  <div class="reels-page">
    <div v-if="loading" class="reels-page__state">
      <div class="reels-page__state-card">
        <Icon name="i-lucide-loader-2" class="reels-page__state-icon animate-spin" />
        <p class="reels-page__state-text">{{ t("pages.reelsPage.playing") }}</p>
      </div>
    </div>

    <div v-else-if="activeReel" class="reels-page__viewer">
      <div
        class="reels-page__frame"
        @wheel.prevent="onWheel"
        @touchstart.passive="onTouchStart"
        @touchend.passive="onTouchEnd"
      >
        <template v-if="activeMedia?.type === 'video'">
          <video
            :key="activeReel.id"
            ref="videoRef"
            :src="activeMedia.src"
            class="reels-page__media"
            autoplay
            loop
            playsinline
            :muted="videoMuted"
            @click="toggleVideoPlayback"
            @play="videoPaused = false"
            @pause="videoPaused = true"
          />
        </template>
        <img
          v-else
          :src="activeMedia?.thumb || activeMedia?.src || activeReel.authorAvatarUrl"
          :alt="activeReel.author"
          class="reels-page__media"
        >

        <div class="reels-page__scrim" />

        <button
          v-if="activeMedia?.type === 'video' && videoPaused"
          type="button"
          class="reels-page__play-overlay"
          @click="toggleVideoPlayback"
        >
          <Icon name="i-ph-play-fill" class="h-9 w-9" />
        </button>

        <div class="reels-page__topbar">
          <button type="button" class="reels-page__ghost-btn" @click="handleMenuAction('copy')">
            <Icon name="i-ph-dots-three-bold" class="h-5 w-5" />
          </button>
        </div>

        <div class="reels-page__actions">
          <div
            class="reels-page__reaction-wrap"
            @mouseenter="openPostReactionTray"
            @mouseleave="closePostReactionTray"
            @focusin="openPostReactionTray"
            @focusout="closePostReactionTray"
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
                class="reels-page__reaction-tray"
                @click.stop
                @pointerdown.stop
              >
                <button
                  v-for="reaction in postReactionOptions"
                  :key="reaction.value"
                  class="reels-page__reaction-option"
                  :class="{ 'reels-page__reaction-option--active': selectedPostReaction === reaction.value }"
                  type="button"
                  :aria-label="reaction.label"
                  @click="reactToPost(reaction.value)"
                >
                  <img
                    :src="reaction.src"
                    :alt="reaction.label"
                    class="reels-page__reaction-image"
                    draggable="false"
                  >
                </button>
              </div>
            </Transition>

            <button
              class="reels-page__action"
              :class="{ 'reels-page__action--active': liked }"
              type="button"
              :aria-pressed="liked"
              :aria-label="activePostReactionLabel"
              @pointerdown="startPostReactionPress"
              @pointerup="finishPostReactionPress"
              @pointerleave="cancelPostReactionPress"
              @pointercancel="cancelPostReactionPress"
              @click="handlePostReactionButtonClick"
            >
              <span class="reels-page__action-icon">
                <img
                  v-if="selectedPostReaction"
                  :src="activePostReactionAsset.src"
                  :alt="activePostReactionLabel"
                  class="reels-page__action-reaction"
                  draggable="false"
                >
                <Icon v-else name="i-ph-thumbs-up-fill" class="h-5 w-5" />
              </span>
              <span>{{ likesCount }}</span>
            </button>
          </div>

          <button
            class="reels-page__action"
            :class="{ 'reels-page__action--active': showComments }"
            type="button"
            :aria-pressed="showComments"
            @click="showComments = true"
          >
            <span class="reels-page__action-icon">
              <Icon name="i-ph-chat-circle-fill" class="h-5 w-5" />
            </span>
            <span>{{ localComments.length }}</span>
          </button>

          <button class="reels-page__action" type="button" @click="showShare = true">
            <span class="reels-page__action-icon">
              <Icon name="i-ph-share-fat-fill" class="h-5 w-5" />
            </span>
            <span>{{ sharesCount }}</span>
          </button>

          <button
            class="reels-page__action"
            :class="{ 'reels-page__action--active': locallySaved }"
            type="button"
            :aria-pressed="locallySaved"
            @click="toggleLocalSave"
          >
            <span class="reels-page__action-icon">
              <Icon :name="locallySaved ? 'i-ph-bookmark-simple-fill' : 'i-ph-bookmark-simple'" class="h-5 w-5" />
            </span>
            <span>{{ t("feed.postHeader.menuSaveLabel") }}</span>
          </button>
        </div>

        <div class="reels-page__content">
          <div class="reels-page__author-row">
            <img
              :src="activeReel.authorAvatarUrl"
              :alt="activeReel.author"
              class="reels-page__avatar"
            >
            <div class="min-w-0">
              <p class="reels-page__author">{{ activeReel.author }}</p>
              <p class="reels-page__time">{{ activeReel.time }}</p>
            </div>
          </div>

          <p v-if="activeReel.text" class="reels-page__caption">
            {{ activeReel.text }}
          </p>

          <div class="reels-page__stats">
            <span>{{ likesCount }} {{ t("pages.reelsPage.like") }}</span>
            <span>{{ localComments.length }} {{ t("pages.reelsPage.comment") }}</span>
            <span>{{ sharesCount }} {{ t("pages.reelsPage.share") }}</span>
          </div>
        </div>

        <Transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="translate-y-full opacity-0"
          enter-to-class="translate-y-0 opacity-100"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="translate-y-0 opacity-100"
          leave-to-class="translate-y-full opacity-0"
        >
          <section v-if="showComments" class="reels-page__comments">
            <div class="reels-page__comments-header">
              <div>
                <p class="reels-page__comments-title">{{ t("feed.commentList.title") }}</p>
                <p class="reels-page__comments-count">
                  {{ localComments.length }} {{ t("pages.reelsPage.comment") }}
                </p>
              </div>
              <button type="button" class="reels-page__comments-close" @click="showComments = false">
                <Icon name="i-ph-x-bold" class="h-4 w-4" />
              </button>
            </div>

            <div class="reels-page__comments-list">
              <FeedCommentList
                :comments="localComments"
                enable-reply
                :current-user-name="currentAuthUserStore.user?.name"
                :current-user-avatar-url="currentAuthUserStore.user?.avatarUrl"
              />
            </div>

            <div class="reels-page__comments-composer">
              <FeedCommentComposer
                :current-user-name="currentAuthUserStore.user?.name"
                :current-user-avatar-url="currentAuthUserStore.user?.avatarUrl"
                :submitting="commenting"
                @submit="submitComment"
              />
            </div>
          </section>
        </Transition>
      </div>

      <FeedShareModal
        :open="showShare"
        :share-url="shareUrl"
        :post="{ author: activeReel.author, text: activeReel.text }"
        @close="showShare = false"
        @shared="handleShared"
      />
    </div>

    <div v-else class="reels-page__state">
      <div class="reels-page__state-card">
        <Icon name="i-ph-film-strip-duotone" class="reels-page__state-icon" />
        <p class="reels-page__empty-title">{{ t("pages.reelsPage.heroTitle") }}</p>
        <p class="reels-page__empty-text">{{ errorMessage || t("pages.watchPage.emptyDescription") }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useFeedPostCardVM } from "../../../feed/application/view-models/useFeedPostCardVM"
import FeedCommentComposer from "../../../feed/presentation/components/CommentComposer.vue"
import FeedCommentList from "../../../feed/presentation/components/CommentList.vue"
import FeedShareModal from "../../../feed/presentation/components/ShareModal.vue"
import { useReelsPageVM } from "../../application/view-models/useReelsPageVM"

const { t } = useI18n()
const {
  loading,
  errorMessage,
  activeReel,
  activeMedia,
  fetchReels,
  onTouchStart,
  onTouchEnd,
  onWheel,
} = useReelsPageVM()
const videoRef = ref<HTMLVideoElement | null>(null)
const videoPaused = ref(false)
const videoMuted = ref(true)
const locallySaved = ref(false)

const {
  currentAuthUserStore,
  showComments,
  showShare,
  liked,
  selectedPostReaction,
  postReactionTrayOpen,
  localComments,
  likesCount,
  sharesCount,
  commenting,
  postReactionOptions,
  activePostReactionAsset,
  activePostReactionLabel,
  shareUrl,
  openPostReactionTray,
  closePostReactionTray,
  startPostReactionPress,
  finishPostReactionPress,
  cancelPostReactionPress,
  handlePostReactionButtonClick,
  reactToPost,
  submitComment,
  handleShared,
  handleMenuAction,
} = useFeedPostCardVM(activeReel)

watch(
  activeReel,
  value => {
    locallySaved.value = Boolean(value?.isSaved)
    videoPaused.value = false
  },
  { immediate: true },
)

async function toggleVideoPlayback() {
  const video = videoRef.value

  if (!video) {
    return
  }

  if (video.paused) {
    await video.play()
    videoPaused.value = false
    return
  }

  video.pause()
  videoPaused.value = true
}

function toggleLocalSave() {
  locallySaved.value = !locallySaved.value
}

useSeoMeta({
  title: () => t("pages.reelsPage.seoTitle"),
  description: () => t("pages.reelsPage.seoDescription"),
})

await fetchReels()
</script>

<style scoped>
.reels-page {
  min-height: 100vh;
  background: #020617;
  color: var(--text-inverse);
}

.reels-page__state,
.reels-page__viewer {
  display: flex;
  min-height: 100vh;
  align-items: center;
  justify-content: center;
  padding: 0;
  text-align: center;
}

.reels-page__viewer {
  position: relative;
  overflow: hidden;
}

.reels-page__state-card {
  max-width: 420px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.08);
  padding: var(--space-8);
  backdrop-filter: blur(16px);
}

.reels-page__state-icon {
  width: 32px;
  height: 32px;
  margin: 0 auto var(--space-4);
  color: rgba(255, 255, 255, 0.72);
}

.reels-page__state-text,
.reels-page__empty-text {
  margin: 0;
  color: rgba(255, 255, 255, 0.72);
  font-size: var(--text-body);
  font-weight: var(--weight-bold);
  line-height: var(--leading-normal);
}

.reels-page__empty-title {
  margin: 0 0 var(--space-2);
  color: var(--text-inverse);
  font-size: var(--text-title);
  font-weight: var(--weight-extrabold);
}

.reels-page__frame {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: #000000;
}

.reels-page__media {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.reels-page__scrim {
  pointer-events: none;
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(2, 6, 23, 0.18) 0%, transparent 28%, rgba(2, 6, 23, 0.82) 100%);
}

.reels-page__topbar,
.reels-page__content,
.reels-page__actions {
  position: absolute;
  z-index: 10;
}

.reels-page__topbar {
  inset: var(--space-6) var(--space-3) auto auto;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.reels-page__ghost-btn,
.reels-page__nav {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(2, 6, 23, 0.42);
  color: var(--text-inverse);
  backdrop-filter: blur(14px);
}

.reels-page__ghost-btn {
  width: 42px;
  height: 42px;
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: background var(--duration-fast) var(--ease-default), opacity var(--duration-fast) var(--ease-default);
}

.reels-page__ghost-btn:hover {
  background: rgba(2, 6, 23, 0.64);
}

.reels-page__play-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 12;
  display: inline-flex;
  width: 78px;
  height: 78px;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: var(--radius-full);
  background: rgba(2, 6, 23, 0.52);
  color: var(--text-inverse);
  transform: translate(-50%, -50%);
  backdrop-filter: blur(16px);
}

.reels-page__actions {
  right: var(--space-3);
  bottom: 138px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
}

.reels-page__reaction-wrap {
  position: relative;
}

.reels-page__action {
  display: flex;
  width: 54px;
  align-items: center;
  flex-direction: column;
  gap: 5px;
  border: 0;
  background: transparent;
  color: var(--text-inverse);
  font-size: var(--text-label);
  font-weight: var(--weight-bold);
  cursor: pointer;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.45);
}

.reels-page__action-icon {
  display: inline-flex;
  width: 44px;
  height: 44px;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: var(--radius-full);
  background: rgba(2, 6, 23, 0.48);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.24);
  backdrop-filter: blur(14px);
  transition: transform var(--duration-fast) var(--ease-default), background var(--duration-fast) var(--ease-default);
}

.reels-page__action:hover .reels-page__action-icon,
.reels-page__action--active .reels-page__action-icon {
  background: var(--bg-brand);
  transform: translateY(-1px);
}

.reels-page__action-reaction {
  width: 26px;
  height: 26px;
  object-fit: contain;
}

.reels-page__reaction-tray {
  position: absolute;
  right: 58px;
  top: 4px;
  display: flex;
  align-items: center;
  gap: var(--space-1);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-full);
  background: var(--bg-surface);
  padding: 6px 8px;
  box-shadow: var(--shadow-lg);
}

.reels-page__reaction-option {
  display: inline-flex;
  width: 30px;
  height: 30px;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: var(--radius-full);
  background: transparent;
  cursor: pointer;
}

.reels-page__reaction-option--active,
.reels-page__reaction-option:hover {
  background: var(--bg-surface-active);
}

.reels-page__reaction-image {
  width: 24px;
  height: 24px;
  object-fit: contain;
}

.reels-page__content {
  inset: auto 76px 0 0;
  padding: var(--space-4);
  text-align: left;
}

.reels-page__author-row {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: var(--space-3);
}

.reels-page__avatar {
  width: 44px;
  height: 44px;
  flex: 0 0 44px;
  border: 2px solid rgba(255, 255, 255, 0.82);
  border-radius: var(--radius-full);
  object-fit: cover;
}

.reels-page__author,
.reels-page__time,
.reels-page__caption,
.reels-page__stats {
  margin: 0;
}

.reels-page__author {
  overflow: hidden;
  color: var(--text-inverse);
  font-size: var(--text-body);
  font-weight: var(--weight-bold);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.reels-page__time {
  color: rgba(255, 255, 255, 0.72);
  font-size: var(--text-caption);
}

.reels-page__caption {
  margin-top: var(--space-3);
  color: rgba(255, 255, 255, 0.92);
  font-size: var(--text-body);
  line-height: var(--leading-normal);
}

.reels-page__stats {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  margin-top: var(--space-4);
  color: rgba(255, 255, 255, 0.78);
  font-size: var(--text-caption);
  font-weight: var(--weight-semibold);
}

.reels-page__comments {
  position: absolute;
  inset: auto 0 0;
  z-index: 30;
  display: flex;
  max-height: min(70vh, 620px);
  flex-direction: column;
  color-scheme: light;
  border: 1px solid var(--border-light);
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
  background: var(--bg-surface);
  color: var(--text-primary);
  box-shadow: var(--shadow-xl);
}

.reels-page__comments-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  border-bottom: 1px solid var(--border-light);
  padding: var(--space-4);
}

.reels-page__comments-title,
.reels-page__comments-count {
  margin: 0;
}

.reels-page__comments-title {
  color: var(--text-primary);
  font-size: var(--text-title);
  font-weight: var(--weight-bold);
}

.reels-page__comments-count {
  margin-top: 2px;
  color: var(--text-secondary);
  font-size: var(--text-caption);
  font-weight: var(--weight-semibold);
}

.reels-page__comments-close {
  display: inline-flex;
  width: 34px;
  height: 34px;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: var(--radius-full);
  background: var(--bg-surface-hover);
  color: var(--text-secondary);
  cursor: pointer;
}

.reels-page__comments-list {
  min-height: 0;
  flex: 1;
  overflow-y: auto;
  padding: var(--space-4);
}

.reels-page__comments-composer {
  border-top: 1px solid var(--border-light);
  background: var(--bg-surface);
  padding: var(--space-3) var(--space-4) var(--space-4);
}

</style>
