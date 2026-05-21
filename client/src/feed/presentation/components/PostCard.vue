<!-- Description: Renders a normalized feed post with real backend media, like, report, and comment actions instead of mock-local content. -->
<template>
  <article :id="postAnchorId" class="post-card">
    <div class="post-card__body">
      <FeedPostHeader
        :author="post.author"
        :author-avatar-url="post.authorAvatarUrl"
        :author-path="post.authorPath"
        :event-context="post.eventContext"
        :group-context="post.groupContext"
        :feeling="post.feeling"
        :role="post.role"
        :time="post.time"
        :audience="post.audience"
        :is-saved="post.isSaved"
        :is-owner="isOwner"
        :is-admin="isAdmin"
        @menu-action="handleMenuAction"
      />

      <div v-if="hasPostContent" class="post-card__content">
        <p v-if="post.text" class="post-card__text">
          <template v-for="segment in postTextSegments" :key="segment.key">
            <span :class="{ 'post-card__mention': segment.isMention }">{{ segment.text }}</span>
          </template>
        </p>
        <div v-if="post.tags.length" class="post-card__tags">
          <NuxtLink
            v-for="tag in post.tags"
            :key="tag"
            :to="createHashtagPath(tag)"
            class="post-card__tag"
          >
            {{ formatHashtagLabel(tag) }}
          </NuxtLink>
        </div>
      </div>

      <NuxtLink
        v-if="post.attachmentCard"
        :to="post.attachmentCard.href"
        class="post-card__attachment"
        :class="`post-card__attachment--${post.attachmentCard.type}`"
      >
        <div class="post-card__attachment-media">
          <NuxtImg
            v-if="post.attachmentCard.imageUrl"
            :src="post.attachmentCard.imageUrl"
            :alt="post.attachmentCard.title"
            loading="lazy"
            class="post-card__attachment-image"
          />
          <div v-else class="post-card__attachment-fallback">
            <Icon :name="attachmentIcon" />
          </div>
        </div>
        <div class="post-card__attachment-body">
          <p class="post-card__attachment-eyebrow">
            <Icon :name="attachmentIcon" />
            <span>{{ attachmentLabel }}</span>
          </p>
          <h3 class="post-card__attachment-title">{{ post.attachmentCard.title }}</h3>
          <p v-if="post.attachmentCard.description" class="post-card__attachment-description">
            {{ post.attachmentCard.description }}
          </p>
          <div v-if="post.attachmentCard.type === 'funding'" class="post-card__attachment-progress">
            <div class="post-card__attachment-progress-top">
              <span>{{ t("feed.postCard.fundingProgress") }}</span>
              <strong>{{ post.attachmentCard.progress ?? 0 }}%</strong>
            </div>
            <div class="post-card__attachment-progress-track">
              <span :style="{ width: `${post.attachmentCard.progress ?? 0}%` }" />
            </div>
          </div>
          <span class="post-card__attachment-action">
            {{ attachmentActionLabel }}
            <Icon name="i-ph-arrow-right-bold" />
          </span>
        </div>
      </NuxtLink>

      <FeedPostMediaGrid v-if="mediaItems.length" class="post-card__media" :items="mediaItems" @open="handleMediaOpen" />

      <div class="post-card__stats">
        <div v-if="hasReactions" class="post-card__stats-left">
          <div class="post-card__reaction-emojis">
            <span
              v-for="reaction in previewReactions"
              :key="reaction.value"
              class="post-card__emoji"
            >
              <img
                :src="reaction.src"
                :alt="t(reaction.labelKey)"
                class="post-card__emoji-image"
                draggable="false"
              >
            </span>
          </div>
          <span class="post-card__stat-count">{{ likesCount }}</span>
        </div>
        <div class="post-card__stats-right">
          <span>{{ t("feed.postCard.commentsCount", { count: localComments.length }) }}</span>
          <span>{{ t("feed.postCard.sharesCount", { count: sharesCount }) }}</span>
        </div>
      </div>

      <div class="post-card__actions">
        <div
          class="post-card__reaction-action"
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
              class="post-card__reaction-tray"
              @click.stop
              @pointerdown.stop
            >
              <button
                v-for="reaction in postReactionOptions"
                :key="reaction.value"
                class="post-card__reaction-option"
                :class="{ 'post-card__reaction-option--active': selectedPostReaction === reaction.value }"
                type="button"
                :aria-label="reaction.label"
                @click="reactToPost(reaction.value)"
              >
                <img
                  :src="reaction.src"
                  :alt="reaction.label"
                  class="post-card__reaction-option-image"
                  draggable="false"
                >
              </button>
            </div>
          </Transition>

          <button
            class="post-card__action-btn"
            :class="{ 'post-card__action-btn--active': liked }"
            type="button"
            :aria-pressed="liked"
            :aria-label="activePostReactionLabel"
            @pointerdown="startPostReactionPress"
            @pointerup="finishPostReactionPress"
            @pointerleave="cancelPostReactionPress"
            @pointercancel="cancelPostReactionPress"
            @click="handlePostReactionButtonClick"
          >
            <img
              v-if="selectedPostReaction"
              :src="activePostReactionAsset.src"
              :alt="activePostReactionLabel"
              class="post-card__action-reaction-image"
              draggable="false"
            >
            <Icon v-else name="i-ph-thumbs-up-fill" class="post-card__action-icon" />
            <span>{{ selectedPostReaction ? activePostReactionLabel : liked ? t("feed.postCard.likeActive") : t("feed.postCard.like") }}</span>
          </button>
        </div>
        <button
          class="post-card__action-btn"
          :class="{ 'post-card__action-btn--active': showComments }"
          type="button"
          :aria-pressed="showComments"
          @click="showComments = !showComments"
        >
          <Icon name="i-ph-chat-circle-fill" class="post-card__action-icon" />
          <span>{{ t("feed.postCard.comment") }}</span>
        </button>
       
        <button
          class="post-card__action-btn"
          type="button"
          @click="showShare = true"
        >
          <Icon name="i-ph-share-fat-fill" class="post-card__action-icon" />
          <span>{{ t("feed.postCard.share") }}</span>
        </button>
      </div>

      <UAlert
        v-if="actionState !== 'idle' && actionMessage"
        class="mt-3 rounded-2xl"
        :color="actionState === 'error' ? 'warning' : 'success'"
        variant="subtle"
        :icon="actionState === 'error' ? 'i-ph-warning-circle-fill' : 'i-ph-check-circle-fill'"
        :description="actionMessage"
      />

      <div v-if="localComments.length && !showComments" class="post-card__comment-peek">
        <div class="post-card__comment-peek-row">
          <div class="post-card__comment-avatar">
            {{ localComments[0]?.author.split(" ").map(w => w[0]).join("") }}
          </div>
          <div class="post-card__comment-bubble">
            <p class="post-card__comment-author">{{ localComments[0]?.author }}</p>
            <p class="post-card__comment-text">{{ localComments[0]?.text }}</p>
          </div>
        </div>
        <button v-if="localComments.length > 1" class="post-card__comment-more" type="button" @click="showComments = true">
          {{ t("feed.postCard.viewMoreComments", { count: localComments.length - 1 }) }}
        </button>
      </div>

      <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0 -translate-y-2" enter-to-class="opacity-100 translate-y-0" leave-active-class="transition duration-150 ease-in" leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 -translate-y-2">
        <div v-if="showComments" class="post-card__comments-full">
          <FeedCommentList
            :comments="localComments"
            enable-reply
            enable-reaction
            :current-user-name="currentAuthUserStore.user?.name"
            :current-user-avatar-url="currentAuthUserStore.user?.avatarUrl"
            :comment-action-repository="commentActionRepository"
          />
          <FeedCommentComposer
            ref="commentComposerRef"
            :current-user-name="currentAuthUserStore.user?.name"
            :current-user-avatar-url="currentAuthUserStore.user?.avatarUrl"
            :submitting="commenting"
            @submit="submitComment"
          />
        </div>
      </Transition>
    </div>

    <FeedShareModal
      :open="showShare"
      :share-url="shareUrl"
      :post="{ id: post.id, author: post.author, text: post.text, authorAvatar: post.authorAvatarUrl, authorVerified: post.authorVerified }"
      @close="showShare = false"
      @shared="handleShared"
    />
    <FeedLightboxViewer
      :open="lightboxOpen"
      :items="post.sharedPost ? [] : mediaItems"
      :current-index="currentMediaIndex"
      :title="props.post.text || t('feed.postCard.lightboxTitle')"
      :description="''"
      :author="post.author"
      :author-avatar-url="post.authorAvatarUrl"
      :author-path="post.authorPath"
      :caption="post.text"
      :time-label="post.time"
      :like-count="likesCount"
      :comments="localComments"
      :current-user-name="currentAuthUserStore.user?.name"
      :current-user-avatar-url="currentAuthUserStore.user?.avatarUrl"
      :submitting-comment="commenting"
      :selected-reaction="selectedPostReaction"
      @close="lightboxOpen = false"
      @change="currentMediaIndex = $event"
      @share="showShare = true"
      @download="downloadMedia"
      @like="toggleLike"
      @react="reactToPost"
      @comment="showComments = true"
      @submit-comment="submitComment"
    />
  </article>
</template>

<script setup lang="ts">
import { createHashtagPath, formatHashtagLabel } from "../../application/composables/useHashtagData"
import { createPostTextMentionSegments } from "../../application/utils/feed-mentions"
import { useFeedPostCardVM } from "../../application/view-models/useFeedPostCardVM"
import type { FeedPostRecord } from "../../domain/types/feed.types"
import FeedCommentComposer from "./CommentComposer.vue"
import FeedCommentList from "./CommentList.vue"
import FeedLightboxViewer from "./LightboxViewer.vue"
import FeedPostHeader from "./PostHeader.vue"
import FeedPostMediaGrid from "./PostMediaGrid.vue"
import FeedShareModal from "./ShareModal.vue"
import FeedSharedPostCard from "./SharedPostCard.vue"

const { t } = useI18n()

const props = defineProps<{
  post: FeedPostRecord
  preventLightbox?: boolean
}>()

const emit = defineEmits<{
  open: [index: number]
}>()
const commentComposerRef = ref<{
  focus: () => void
  insertMentionTrigger: () => void
} | null>(null)

const {
  currentAuthUserStore,
  showComments,
  showShare,
  liked,
  selectedPostReaction,
  postReactionTrayOpen,
  lightboxOpen,
  currentMediaIndex,
  localComments,
  likesCount,
  sharesCount,
  actionState,
  actionMessage,
  commenting,
  commentActionRepository,
  postAnchorId,
  postReactionOptions,
  activePostReactionAsset,
  activePostReactionLabel,
  previewReactions,
  hasReactions,
  hasPostContent,
  mediaItems,
  shareUrl,
  openPostReactionTray,
  closePostReactionTray,
  startPostReactionPress,
  finishPostReactionPress,
  cancelPostReactionPress,
  handlePostReactionButtonClick,
  toggleLike,
  reactToPost,
  onOpenMedia,
  submitComment,
  handleShared,
  handleMenuAction,
  downloadMedia,
  isOwner,
  isAdmin,
} = useFeedPostCardVM(toRef(props, "post"))

const postTextSegments = computed(() =>
  createPostTextMentionSegments(props.post.text, props.post.mentions ?? []),
)

const attachmentIcon = computed(() =>
  props.post.attachmentCard?.type === "funding"
    ? "i-ph-hand-heart-duotone"
    : "i-ph-newspaper-clipping-duotone",
)

const attachmentLabel = computed(() =>
  props.post.attachmentCard?.type === "funding"
    ? t("feed.postCard.fundingAttachment")
    : t("feed.postCard.blogAttachment"),
)

const attachmentActionLabel = computed(() =>
  props.post.attachmentCard?.type === "funding"
    ? t("feed.postCard.openFunding")
    : t("feed.postCard.openBlog"),
)

async function openCommentTagging() {
  showComments.value = true
  await nextTick()
  commentComposerRef.value?.insertMentionTrigger()
}

function handleMediaOpen(index: number) {
  emit("open", index)
  if (!props.preventLightbox) {
    onOpenMedia(index)
  }
}
</script>

<style scoped>
.post-card {
  border-radius: 16px;
  background: #ffffff;
  border: 1px solid rgba(0, 0, 255, 0.06);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04), 0 6px 20px rgba(0, 0, 255, 0.03);
  transition: box-shadow 0.2s ease;
}

.post-card:hover {
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05), 0 10px 28px rgba(0, 0, 255, 0.05);
}

.post-card__body {
  padding: 16px;
}

@media (min-width: 640px) {
  .post-card__body {
    padding: 20px;
  }
}

.post-card__content {
  margin-top: 14px;
}

.post-card__text {
  font-size: 14.5px;
  line-height: 1.75;
  color: #334155;
}

.post-card__mention {
  color: #1420ff;
  font-weight: 600;
}

.post-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 10px;
}

.post-card__tag {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 8px;
  background: rgba(0, 0, 255, 0.05);
  font-size: 12px;
  font-weight: 600;
  color: #0000ff;
  transition: all 0.15s ease;
}

.post-card__tag:hover {
  background: #0000ff;
  color: #ffffff;
}

.post-card__media {
  margin-top: 14px;
}

.post-card__attachment {
  display: grid;
  gap: 0;
  margin-top: 14px;
  overflow: hidden;
  border: 1px solid rgba(15, 23, 42, 0.09);
  border-radius: 14px;
  background: #ffffff;
  color: inherit;
  text-decoration: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease;
}

.post-card__attachment:hover {
  border-color: rgba(0, 0, 255, 0.18);
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.08);
  transform: translateY(-1px);
}

.post-card__attachment-media {
  position: relative;
  min-height: 160px;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background: #eef2ff;
}

.post-card__attachment-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.post-card__attachment-fallback {
  display: flex;
  width: 100%;
  height: 100%;
  min-height: 160px;
  align-items: center;
  justify-content: center;
  color: #0000ff;
}

.post-card__attachment-fallback svg,
.post-card__attachment-fallback :deep(svg) {
  width: 42px;
  height: 42px;
}

.post-card__attachment-body {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 8px;
  padding: 14px;
}

.post-card__attachment-eyebrow,
.post-card__attachment-action,
.post-card__attachment-progress-top {
  display: flex;
  align-items: center;
  gap: 6px;
}

.post-card__attachment-eyebrow {
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  color: rgba(0, 0, 255, 0.7);
}

.post-card__attachment-eyebrow svg,
.post-card__attachment-eyebrow :deep(svg),
.post-card__attachment-action svg,
.post-card__attachment-action :deep(svg) {
  width: 15px;
  height: 15px;
  flex-shrink: 0;
}

.post-card__attachment-title {
  display: -webkit-box;
  overflow: hidden;
  color: #0f172a;
  font-size: 16px;
  font-weight: 800;
  line-height: 1.35;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.post-card__attachment-description {
  display: -webkit-box;
  overflow: hidden;
  color: #64748b;
  font-size: 13px;
  line-height: 1.55;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.post-card__attachment-progress {
  display: grid;
  gap: 6px;
  margin-top: 2px;
}

.post-card__attachment-progress-top {
  justify-content: space-between;
  font-size: 12px;
  color: #64748b;
}

.post-card__attachment-progress-top strong {
  color: #16a34a;
}

.post-card__attachment-progress-track {
  height: 7px;
  overflow: hidden;
  border-radius: 999px;
  background: #dcfce7;
}

.post-card__attachment-progress-track span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: #16a34a;
}

.post-card__attachment-action {
  margin-top: 2px;
  font-size: 13px;
  font-weight: 800;
  color: #0000ff;
}

@media (min-width: 640px) {
  .post-card__attachment {
    grid-template-columns: 220px minmax(0, 1fr);
  }

  .post-card__attachment-media {
    min-height: 100%;
    aspect-ratio: auto;
  }
}

.post-card__stats {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px solid rgba(0, 0, 255, 0.06);
  font-size: 13px;
  color: #64748b;
}

.post-card__stats-left {
  display: flex;
  align-items: center;
  gap: 6px;
}

.post-card__reaction-emojis {
  display: flex;
  align-items: center;
}

.post-card__emoji {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.9);
  background: #ffffff;
  transition: transform 0.15s ease;
}

.post-card__emoji:hover {
  transform: scale(1.2);
  z-index: 2;
}

.post-card__emoji-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.post-card__stat-count {
  font-weight: 600;
  font-size: 13px;
}

.post-card__stats-right {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12.5px;
  color: #94a3b8;
}

.post-card__actions {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid rgba(0, 0, 255, 0.06);
}

.post-card__reaction-action {
  position: relative;
  min-width: 0;
}

.post-card__action-btn {
  display: flex;
  width: 100%;
  min-width: 0;
  min-height: 44px;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 8px;
  border: none;
  border-radius: 10px;
  background: transparent;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.2;
  color: #64748b;
  cursor: pointer;
  transition: all 0.15s ease;
}

.post-card__action-btn span {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.post-card__action-btn:hover {
  background: rgba(0, 0, 255, 0.04);
  color: #0000ff;
}

.post-card__action-btn--active {
  background: rgba(0, 0, 255, 0.06);
  color: #0000ff;
}

.post-card__action-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.post-card__action-symbol {
  display: inline-flex;
  width: 18px;
  height: 18px;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 17px;
  font-weight: 800;
  line-height: 1;
}

.post-card__action-reaction-image {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  object-fit: contain;
}

@media (max-width: 420px) {
  .post-card__actions {
    gap: 4px;
  }

  .post-card__action-btn {
    gap: 4px;
    min-height: 42px;
    padding: 9px 4px;
    font-size: 12.5px;
  }

  .post-card__action-icon {
    width: 17px;
    height: 17px;
  }

  .post-card__action-reaction-image {
    width: 18px;
    height: 18px;
  }
}

.post-card__reaction-tray {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  z-index: 20;
  display: flex;
  gap: 10px;
  transform: translateX(-50%);
  border-radius: 999px;
  border: 0;
  background: transparent;
  padding: 0;
  box-shadow: none;
  filter: drop-shadow(0 10px 18px rgba(15, 23, 42, 0.22));
}

.post-card__reaction-option {
  display: flex;
  width: 34px;
  height: 34px;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 999px;
  background: transparent;
  padding: 0;
  cursor: pointer;
  transition: background 0.15s ease, transform 0.15s ease;
}

.post-card__reaction-option:hover,
.post-card__reaction-option--active {
  background: transparent;
  transform: translateY(-5px) scale(1.08);
}

.post-card__reaction-option-image {
  width: 28px;
  height: 28px;
  object-fit: contain;
}

.post-card__comment-peek {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(0, 0, 255, 0.05);
}

.post-card__comment-peek-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.post-card__comment-avatar {
  display: flex;
  width: 28px;
  height: 28px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #e2e8f0;
  font-size: 9px;
  font-weight: 700;
  color: #475569;
}

.post-card__comment-bubble {
  min-width: 0;
  border-radius: 14px;
  background: #f1f5f9;
  padding: 8px 12px;
}

.post-card__comment-author {
  font-size: 12.5px;
  font-weight: 700;
  color: #1e293b;
}

.post-card__comment-text {
  font-size: 12.5px;
  line-height: 1.6;
  color: #475569;
  margin-top: 2px;
}

.post-card__comment-more {
  margin-left: 36px;
  margin-top: 6px;
  font-size: 12.5px;
  font-weight: 600;
  color: rgba(0, 0, 255, 0.55);
  background: none;
  border: none;
  cursor: pointer;
  transition: color 0.15s ease;
}

.post-card__comment-more:hover {
  color: #0000ff;
}

.post-card__comments-full {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(0, 0, 255, 0.05);
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>
