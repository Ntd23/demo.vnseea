<!-- English description: Renders the reels route as a fullscreen media viewer with feed-powered reactions, comments, sharing, and save controls. -->
<template>
  <div class="reels-page">
    <!-- Loading State -->
    <div v-if="loading" class="reels-page__status">
      <div class="reels-page__loader">
        <Icon
          name="i-lucide-loader-2"
          class="reels-page__status-icon mx-auto h-8 w-8 animate-spin"
        />
        <p class="reels-page__status-copy text-sm font-bold">
          {{ t("pages.reelsPage.playing") }}
        </p>
      </div>
    </div>

    <!-- Active Reel Content -->
    <div
      v-else-if="activeReel"
      class="reels-page__container"
      @wheel="handleWheel"
      @pointerdown.passive="onPointerDown"
      @pointerup.passive="onPointerUp"
      @pointercancel.passive="onPointerUp"
    >
      <!-- Main Content Area -->
      <main class="reels-page__main">
        <!-- Reel Player Stage -->
        <div class="reels-page__stage">
          <div class="reels-page__player-box">
            <button
              class="reels-page__back-button"
              type="button"
              :aria-label="t('pages.reelsPage.close')"
              @click="exitFullscreen"
            >
              <Icon name="i-ph-arrow-left-bold" class="h-5 w-5" />
            </button>
            <template v-if="activeMedia?.type === 'video'">
              <video
                ref="videoRef"
                :src="activeMedia.src"
                class="reels-page__video"
                autoplay
                controls
                playsinline
                @play="isPlaying = true"
                @pause="isPlaying = false"
                @timeupdate="updateProgress"
                @loadedmetadata="onMetadataLoaded"
                @ended="handleVideoEnded"
              />

              <!-- Play Overlay -->
              <div
                v-if="!isPlaying"
                class="reels-page__play-overlay"
                @click="togglePlayPause"
              >
                <Icon
                  name="i-ph-play-fill"
                  class="reels-page__play-icon h-16 w-16"
                />
              </div>

              <!-- Custom Progress Bar -->
              <!-- <div class="reels-page__progress-container"
                :class="{ 'reels-page__progress-container--visible': !isPlaying }" @click="seek">
                <div class="reels-page__progress-bar">
                  <div class="reels-page__progress-fill" :style="{ width: `${progress}%` }"></div>
                </div>
              </div> -->
            </template>
            <img
              v-else
              :src="
                activeMedia?.thumb ||
                activeMedia?.src ||
                activeReel.authorAvatarUrl
              "
              class="reels-page__video"
            />

            <!-- Dark Overlay for better text readability -->
            <div class="reels-page__video-overlay" />

            <!-- Author Info & Caption (Bottom Left of player) -->
            <div class="reels-page__info">
              <div class="reels-page__author">
                <NuxtLink
                  v-if="activeReel.authorPath"
                  :to="activeReel.authorPath"
                  class="reels-page__author-link"
                  :aria-label="activeReel.author"
                >
                  <img
                    :src="activeReel.authorAvatarUrl"
                    :alt="activeReel.author"
                    class="reels-page__avatar"
                  />
                </NuxtLink>
                <img
                  v-else
                  :src="activeReel.authorAvatarUrl"
                  :alt="activeReel.author"
                  class="reels-page__avatar"
                />
                <div class="reels-page__author-meta">
                  <NuxtLink
                    v-if="activeReel.authorPath"
                    :to="activeReel.authorPath"
                    class="reels-page__author-name"
                  >
                    {{ activeReel.author }}
                  </NuxtLink>
                  <p v-else class="reels-page__author-name">{{ activeReel.author }}</p>
                  <button
                    v-if="showPageFollowButton"
                    type="button"
                    class="reels-page__page-follow"
                    :class="{ 'reels-page__page-follow--active': activePageFollowing }"
                    :disabled="pageFollowPending"
                    @click.stop="handleFollowActivePage"
                  >
                    <Icon
                      :name="pageFollowPending
                        ? 'i-ph-spinner-gap-bold'
                        : activePageFollowing
                          ? 'i-ph-check-bold'
                          : 'i-ph-plus-bold'"
                      class="h-3.5 w-3.5"
                      :class="{ 'animate-spin': pageFollowPending }"
                    />
                    {{ activePageFollowing
                      ? t("pages.pageDetailPage.followingButton")
                      : t("pages.pageDetailPage.followFallback") }}
                  </button>
                </div>
              </div>
              <p v-if="activeVideoTitle" class="reels-page__caption">
                {{ activeVideoTitle }}
              </p>
            </div>
          </div>

          <!-- Interaction Icons (Floating on the right) -->
          <div class="reels-page__actions">
            <div class="reels-page__action-item">
              <div
                class="reels-page__action-wrapper"
                @mouseenter="openPostReactionTray"
                @mouseleave="closePostReactionTray"
                @focusin="openPostReactionTray"
                @focusout="closePostReactionTray"
                @contextmenu.prevent
              >
                <UButton
                  type="button"
                  color="info"
                  variant="link"
                  class="reels-page__action-btn"
                  :class="{ 'reels-page__action-btn--active': liked }"
                  :aria-label="t('pages.reelsPage.like')"
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
                    class="h-8 w-8 reels-page__reaction-image"
                    draggable="false"
                    @contextmenu.prevent
                    @dragstart.prevent
                  />
                  <Icon v-else name="i-ph-thumbs-up-bold" class="h-8 w-8" />
                </UButton>
                <span class="reels-page__action-label">{{
                  formatCompact(likesCount)
                }}</span>

                <!-- Reaction Tray -->
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
                    @contextmenu.prevent
                  >
                    <button
                      v-for="reaction in postReactionOptions"
                      :key="reaction.value"
                      class="reels-page__reaction-option"
                      type="button"
                      @contextmenu.prevent
                      @click="reactToPost(reaction.value)"
                    >
                      <img
                        :src="reaction.src"
                        :alt="reaction.label"
                        class="h-8 w-8 block object-contain reels-page__reaction-image"
                        draggable="false"
                        @contextmenu.prevent
                        @dragstart.prevent
                      />
                    </button>
                  </div>
                </Transition>
              </div>
            </div>

            <div class="reels-page__action-item">
              <UButton
                type="button"
                color="info"
                variant="link"
                class="reels-page__action-btn"
                :aria-label="t('pages.reelsPage.comment')"
                @click="toggleComments"
              >
                <Icon name="i-ph-chat-circle-bold" class="h-8 w-8" />
              </UButton>
              <span class="reels-page__action-label">{{
                formatCompact(commentsCount)
              }}</span>
            </div>

            <div
              v-if="activeReel.permissions.canShare"
              class="reels-page__action-item"
            >
              <UButton
                type="button"
                color="info"
                variant="link"
                class="reels-page__action-btn"
                :aria-label="t('pages.reelsPage.share')"
                @click="activeReel.permissions.canShare && (showShare = true)"
              >
                <Icon name="i-ph-share-fat-bold" class="h-8 w-8" />
              </UButton>
              <span class="reels-page__action-label">{{
                formatCompact(sharesCount)
              }}</span>
            </div>

            <div class="reels-page__action-item">
              <UButton
                type="button"
                color="info"
                variant="link"
                class="reels-page__action-btn"
                :class="{
                  'reels-page__action-btn--active': activeReel.isSaved,
                }"
                :aria-label="
                  activeReel.isSaved
                    ? t('pages.reelsPage.saved')
                    : t('pages.reelsPage.save')
                "
                @click="
                  handleMenuAction(activeReel.isSaved ? 'unsave' : 'save')
                "
              >
                <Icon
                  :name="
                    activeReel.isSaved
                      ? 'i-ph-bookmark-simple-fill'
                      : 'i-ph-bookmark-simple-bold'
                  "
                  class="h-8 w-8"
                />
              </UButton>
              <span class="reels-page__action-label">{{
                activeReel.isSaved
                  ? t("pages.reelsPage.saved")
                  : t("pages.reelsPage.save")
              }}</span>
            </div>

            <div class="reels-page__action-item">
              <UButton
                type="button"
                color="info"
                variant="link"
                class="reels-page__action-btn"
                :aria-label="t('pages.reelsPage.more')"
                @click="showOptions = true"
              >
                <Icon name="i-ph-dots-three-bold" class="h-8 w-8" />
              </UButton>
            </div>
          </div>
        </div>
      </main>

      <!-- Share Modal Integration -->
      <FeedShareModal
        v-if="activeReel.permissions.canShare"
        :open="showShare"
        :can-share="activeReel.permissions.canShare"
        :share-url="shareUrl"
        :post="{
          id: activeReel.id,
          author: activeReel.author,
          text: activeReel.text,
          authorAvatar: activeReel.authorAvatarUrl,
          authorVerified: activeReel.authorVerified,
        }"
        @close="showShare = false"
        @shared="handleShared"
      />

      <UModal
        v-model:open="showOptions"
        :title="t('pages.reelsPage.optionsTitle')"
        :ui="{ content: 'sm:max-w-[420px]' }"
      >
        <template #body>
          <div class="reels-page__options">
            <UButton
              type="button"
              color="error"
              variant="soft"
              size="lg"
              block
              icon="i-ph-flag-duotone"
              class="justify-start rounded-xl"
              @click="reportActiveReel"
            >
              <span class="reels-page__option-text">
                <strong>{{ t("pages.reelsPage.report") }}</strong>
              </span>
            </UButton>
          </div>
        </template>

        <template #footer>
          <div class="flex w-full justify-end">
            <UButton
              type="button"
              color="neutral"
              variant="outline"
              class="rounded-xl"
              @click="showOptions = false"
            >
              {{ t("pages.reelsPage.cancel") }}
            </UButton>
          </div>
        </template>
      </UModal>

      <!-- Comment Bottom Sheet -->
      <Transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="showComments"
          class="reels-page__overlay"
          @click="showComments = false"
        ></div>
      </Transition>
      <Transition
        enter-active-class="transition duration-400 cubic-bezier(0.33, 1, 0.68, 1)"
        enter-from-class="translate-y-full"
        enter-to-class="translate-y-0"
        leave-active-class="transition duration-300 ease-in"
        leave-from-class="translate-y-0"
        leave-to-class="translate-y-full"
      >
        <div v-if="showComments" class="reels-page__bottom-sheet">
          <div class="reels-page__sheet-handle"></div>
          <header class="reels-page__sheet-header">
            <div class="reels-page__sheet-title">
              {{ t("pages.watchPage.commentsTitle") }} ({{
                activeReel.stats.comments
              }})
            </div>
            <UButton
              type="button"
              color="neutral"
              variant="soft"
              icon="i-ph-x-bold"
              class="reels-page__sheet-close"
              :aria-label="t('pages.reelsPage.close')"
              @click="showComments = false"
            />
          </header>

          <div class="reels-page__sheet-content scrollbar-hide">
            <div class="reels-page__comments">
              <FeedCommentList
                v-if="localComments.length > 0"
                :comments="localComments"
                enable-reply
                enable-reaction
                :current-user-name="currentAuthUserStore.user?.name"
                :current-user-avatar-url="currentAuthUserStore.user?.avatarUrl"
                :comment-action-repository="commentActionRepository"
              />
              <div v-else class="reels-page__comments-empty">
                <Icon
                  name="i-ph-chat-circle-text"
                  class="h-10 w-10 opacity-20"
                />
                <p>{{ t("feed.commentList.emptyDescription") }}</p>
              </div>
            </div>
          </div>

          <footer class="reels-page__sheet-composer">
            <FeedCommentComposer
              :current-user-name="currentAuthUserStore.user?.name"
              :current-user-avatar-url="currentAuthUserStore.user?.avatarUrl"
              :submitting="commenting"
              @submit="submitComment"
            />
          </footer>
        </div>
      </Transition>
    </div>

    <!-- Empty State -->
    <div v-else class="reels-page__status">
      <div class="reels-page__loader">
        <Icon
          name="i-ph-film-strip-duotone"
          class="reels-page__status-icon mx-auto h-8 w-8"
        />
        <p class="reels-page__status-title text-base font-black">
          {{ t("pages.reelsPage.heroTitle") }}
        </p>
        <p class="reels-page__status-copy max-w-md text-sm leading-6">
          {{ errorMessage || t("pages.watchPage.emptyDescription") }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import FeedCommentComposer from "../../../feed/presentation/components/CommentComposer.vue";
import FeedCommentList from "../../../feed/presentation/components/CommentList.vue";
import FeedShareModal from "../../../feed/presentation/components/ShareModal.vue";
import type { FeedPostRecord } from "../../../feed/domain/types/feed.types";
import { useReelsPageVM } from "../../application/view-models/useReelsPageVM";

const props = defineProps<{
  postId?: number;
  initialPost?: FeedPostRecord;
  embedded?: boolean;
}>();
const emit = defineEmits<{
  close: [];
}>();
const { t } = useI18n();
const { locale } = useI18n();
const showOptions = ref(false);
const {
  loading,
  errorMessage,
  activeReel,
  activeMedia,
  videoRef,
  isPlaying,
  pageFollowPending,
  showPageFollowButton,
  activePageFollowing,
  progress,
  onPointerDown,
  onPointerUp,
  handleWheel,
  updateProgress,
  onMetadataLoaded,
  handleVideoEnded,
  togglePlayPause,
  exitFullscreen,
  seek,
  currentAuthUserStore,
  showComments,
  showShare,
  liked,
  selectedPostReaction,
  postReactionTrayOpen,
  localComments,
  likesCount,
  commentsCount,
  sharesCount,
  commenting,
  postReactionOptions,
  activePostReactionAsset,
  activePostReactionLabel,
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
  handleMenuAction,
  toggleComments,
  handleFollowActivePage,
} = useReelsPageVM(undefined, {
  postId: props.postId,
  initialPost: props.initialPost,
  onExit: props.embedded ? () => emit("close") : undefined,
});

const compactFormatter = computed(
  () =>
    new Intl.NumberFormat(locale.value === "vi" ? "vi-VN" : "en-US", {
      notation: "compact",
      maximumFractionDigits: 1,
    }),
);

const activeVideoTitle = computed(() =>
  String(activeReel.value?.videoTitle || activeReel.value?.text || "").trim(),
);

function formatCompact(value: number) {
  return compactFormatter.value.format(value);
}

async function reportActiveReel() {
  await handleMenuAction("report");
  showOptions.value = false;
}

useSeoMeta({
  title: () => t("pages.reelsPage.seoTitle"),
  description: () => t("pages.reelsPage.seoDescription"),
});
</script>

<style scoped>
.reels-page {
  height: 100%;
  min-height: 0;
  background-color: var(--bg-media);
  color: var(--text-media);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.reels-page__status {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  text-align: center;
}

.reels-page__loader {
  padding: 40px 32px;
  background-color: color-mix(in srgb, var(--text-media) 6%, transparent);
  border: 1px solid var(--border-media);
  border-radius: 28px;
  backdrop-filter: blur(8px);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.reels-page__status-icon,
.reels-page__status-copy {
  color: var(--text-media-muted);
}

.reels-page__status-title {
  color: var(--text-media);
}

.reels-page__container {
  display: flex;
  width: 100%;
  height: 100%;
  overflow: hidden;
  touch-action: none;
  user-select: none;
}

.reels-page__main {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  background-color: var(--bg-media);
}

.reels-page__stage {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.reels-page__player-box {
  height: 100%;
  width: 100%;
  background-color: var(--bg-media);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.reels-page__video {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.reels-page__back-button {
  position: absolute;
  top: max(16px, env(safe-area-inset-top));
  left: max(16px, env(safe-area-inset-left));
  z-index: 10;
  display: inline-flex;
  height: 44px;
  width: 44px;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border-media);
  border-radius: 9999px;
  background: color-mix(in srgb, var(--bg-media) 68%, transparent);
  color: var(--text-media);
  cursor: pointer;
  backdrop-filter: blur(10px);
  transition:
    transform 0.15s ease,
    background 0.15s ease;
}

.reels-page__back-button:hover {
  background: color-mix(in srgb, var(--bg-media) 88%, transparent);
  transform: scale(1.06);
}

.reels-page__back-button:focus-visible {
  outline: 2px solid var(--text-media);
  outline-offset: 2px;
}

.reels-page__video-overlay {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 56px;
  left: 0;
  z-index: 2;
  pointer-events: none;
}

/* Floating Actions on the Right */
.reels-page__actions {
  position: absolute;
  right: 0;
  bottom: 80px;
  display: flex;
  flex-direction: column;
  gap: 0;
  z-index: 20;
}

.reels-page__action-item {
  flex-direction: column;
  display: flex;
  align-items: center;
}

.reels-page__action-wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  touch-action: manipulation;
  user-select: none;
  -webkit-touch-callout: none;
}

.reels-page__action-btn {
  width: 58px;
  height: 58px;
  padding: 0 !important;
  border-radius: 50%;
  color: var(--text-media);
  display: flex;
  flex-direction: column;
  gap: 5px;
  align-items: center;
  justify-content: center;
  /* backdrop-filter: blur(10px); */
  transition: all 0.2s ease;
  touch-action: manipulation;
  user-select: none;
  -webkit-touch-callout: none;
}

.reels-page__reaction-image {
  pointer-events: none;
  user-select: none;
  -webkit-touch-callout: none;
  -webkit-user-drag: none;
}

.reels-page__action-btn:hover {
  background-color: color-mix(in srgb, var(--text-media) 20%, transparent);
  transform: scale(1.1);
}

.reels-page__action-btn--active {
  color: var(--text-brand);
}

.reels-page__action-label {
  display: block;
  max-width: 72px;
  overflow: hidden;
  text-align: center;
  text-overflow: ellipsis;
  text-shadow: 0 2px 10px color-mix(in srgb, var(--bg-media) 75%, transparent);
  font-size: 12px;
  font-weight: 700;
  color: var(--text-media);
  line-height: 1.1;
  white-space: nowrap;
}

/* Nav Arrows (Floating far right) */
.reels-page__nav-arrows {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 20px;
  z-index: 20;
}

@media (max-width: 1000px) {
  .reels-page__nav-arrows {
    display: none;
  }
}

.reels-page__nav-arrow-btn {
  color: var(--text-media-muted);
  transition: all 0.2s ease;
}

.reels-page__nav-arrow-btn:hover:not(:disabled) {
  color: var(--text-media);
  transform: scale(1.1);
}

.reels-page__nav-arrow-btn:disabled {
  opacity: 0.1;
}

/* Info Section (Bottom Left) */
.reels-page__info {
  position: absolute;
  left: 20px;
  bottom: 80px;
  right: 80px;
  z-index: 10;
}

.reels-page__author {
  display: flex;
  align-items: center;
  gap: 12px;
}

.reels-page__author-link {
  display: inline-flex;
  flex: 0 0 auto;
  border-radius: 50%;
}

.reels-page__avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 2px solid var(--text-media);
}

.reels-page__author-name {
  display: inline-block;
  color: var(--text-media);
  font-size: 15px;
  font-weight: 700;
  text-decoration: none;
}

.reels-page__author-name:hover {
  text-decoration: underline;
  text-underline-offset: 3px;
}

.reels-page__author-meta {
  display: flex;
  min-width: 0;
  flex-direction: column;
  align-items: flex-start;
  gap: 5px;
}

.reels-page__page-follow {
  display: inline-flex;
  min-height: 27px;
  align-items: center;
  justify-content: center;
  gap: 5px;
  border: 1px solid color-mix(in srgb, var(--text-media) 45%, transparent);
  border-radius: 999px;
  background: color-mix(in srgb, var(--bg-media) 42%, transparent);
  color: var(--text-media);
  cursor: pointer;
  padding: 4px 10px;
  font-size: 11px;
  font-weight: 800;
  backdrop-filter: blur(8px);
}

.reels-page__page-follow--active {
  border-color: color-mix(in srgb, var(--bg-brand) 55%, transparent);
  background: color-mix(in srgb, var(--bg-brand) 28%, transparent);
}

.reels-page__page-follow:disabled {
  cursor: wait;
  opacity: 0.7;
}

.reels-page__follow {
  font-weight: 700;
  cursor: pointer;
}

.reels-page__caption {
  display: -webkit-box;
  margin: 10px 0 0;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  font-size: 14px;
  line-height: 1.5;
  color: var(--text-media);
  max-width: 100%;
  text-shadow: 0 2px 12px color-mix(in srgb, var(--bg-media) 70%, transparent);
}

/* Bottom Sheet */
.reels-page__overlay {
  position: fixed;
  inset: 0;
  background-color: color-mix(in srgb, var(--bg-media) 40%, transparent);
  z-index: 40;
}

.reels-page__bottom-sheet {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 1200px;
  height: 65vh;
  background-color: var(--bg-surface);
  border: 1px solid var(--border-light);
  border-bottom: 0;
  border-top-left-radius: 24px;
  border-top-right-radius: 24px;
  z-index: 50;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 -10px 40px color-mix(in srgb, var(--bg-media) 30%, transparent);
}

.reels-page__sheet-handle {
  width: 40px;
  height: 4px;
  background-color: color-mix(in srgb, var(--text-primary) 14%, transparent);
  border-radius: 2px;
  margin: 12px auto 0;
}

.reels-page__sheet-header {
  padding: 16px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--border-light);
}

.reels-page__sheet-title {
  font-size: 16px;
  font-weight: 800;
  color: var(--text-primary);
}

.reels-page__sheet-close {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: var(--bg-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-primary);
}

.reels-page__sheet-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px;
}

.reels-page__sheet-composer {
  padding: 16px 24px;
  border-top: 1px solid var(--border-light);
  background-color: var(--bg-muted);
}

.reels-page__reaction-tray {
  position: absolute;
  bottom: calc(100% + 12px);
  left: -100px;
  transform: translateX(-50%);
  border: 1px solid var(--border-media);
  background-color: color-mix(in srgb, var(--bg-media) 84%, transparent);
  border-radius: 999px;
  padding: 8px 16px;
  display: flex;
  gap: 12px;
  width: 280px;
  box-shadow: 0 10px 40px color-mix(in srgb, var(--bg-media) 40%, transparent);
  backdrop-filter: blur(12px);
  z-index: 100;
  pointer-events: auto;
  white-space: nowrap;
  touch-action: manipulation;
  user-select: none;
  -webkit-touch-callout: none;
}

.reels-page__options {
  display: grid;
  gap: 12px;
}

.reels-page__option-text {
  display: grid;
  gap: 2px;
  min-width: 0;
  text-align: left;
}

.reels-page__option-text strong {
  color: var(--color-error);
  font-size: 14px;
  font-weight: 800;
  line-height: 1.25;
}

.reels-page__option-text small {
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 600;
  line-height: 1.35;
  white-space: normal;
}

.reels-page__reaction-option {
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  padding: 0;
  transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  cursor: pointer;
  touch-action: manipulation;
  user-select: none;
  -webkit-touch-callout: none;
}

.reels-page__reaction-option:hover {
  transform: scale(1.4) translateY(-8px);
}

/* Custom Progress Bar Styles */
.reels-page__progress-container {
  position: absolute;
  bottom: 0;
  padding-bottom: env(safe-area-inset-bottom, 0px);
  /* Fix for mobile safe areas */
  left: 0;
  right: 0;
  height: calc(4px + env(safe-area-inset-bottom, 0px));
  background: color-mix(in srgb, var(--text-media) 10%, transparent);
  cursor: pointer;
  z-index: 35;
  transition: all 0.2s;
}

.reels-page__progress-container:hover {
  height: calc(8px + env(safe-area-inset-bottom, 0px));
}

.reels-page__progress-bar {
  width: 100%;
  height: 4px;
  position: relative;
}

.reels-page__progress-fill {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: var(--text-media);
  box-shadow: 0 0 10px color-mix(in srgb, var(--text-media) 30%, transparent);
  transition: width 0.1s linear;
}

.reels-page__play-overlay {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 56px;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: color-mix(in srgb, var(--bg-media) 10%, transparent);
  cursor: pointer;
  /* Keep the paused-video hit area above the media, but below all controls. */
  z-index: 5;
}

.reels-page__play-icon {
  color: color-mix(in srgb, var(--text-media) 55%, transparent);
}

.reels-page__progress-container--visible {
  height: 6px !important;
  opacity: 1 !important;
}
</style>
